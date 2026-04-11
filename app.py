from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import time
import os
import re

app = Flask(__name__)
CORS(app)

# Resursların yüklənməsi
def load_ai_assets():
    try:
        model = joblib.load('model/classifier.pkl')
        vectorizer = joblib.load('model/vectorizer.pkl')
        accuracy = joblib.load('model/accuracy_score.pkl')
        return model, vectorizer, accuracy
    except:
        return None, None, 0

@app.route('/analyze', methods=['POST'])
def analyze():
    model, vectorizer, model_accuracy = load_ai_assets()
    
    if not model:
        return jsonify({"error": "Model tapılmadı. Zəhmət olmasa train_model.py-ı işlədin."}), 500

    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "Mətn daxil edilməyib"}), 400

    start_time = time.time()
    
    # 1. Model Proqnozu və Etibarlılıq (Confidence)
    text_vec = vectorizer.transform([text])
    prediction = model.predict(text_vec)[0]
    probabilities = model.predict_proba(text_vec)[0]
    
    confidence = round(max(probabilities) * 100, 1)
    
    # 2. Risk Klassifikasiyası
    if prediction == 1:
        risk_level = "KRİTİK" if confidence > 85 else "ŞÜBHƏLİ"
    else:
        risk_level = "TƏHLÜKƏSİZ"

    # 3. Risk İndikatorları (Hevristik Analiz)
    indicators = []
    text_lower = text.lower()
    
    # URL Analizi
    if re.search(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text_lower):
        indicators.append("Mətndə Aktiv Link Mövcuddur")
    
    # Şübhəli açar sözlər
    scam_keywords = ['bank', 'kart', 'şifrə', 'blok', 'qazandınız', 'hədiyyə', 'təcili', 'urgent', 'verify']
    if any(keyword in text_lower for keyword in scam_keywords):
        indicators.append("Şübhəli Açar Sözlər (Sosial Mühəndislik)")
        
    # Maskalanma analizi
    if "google.com/search?q=" in text_lower:
        indicators.append("URL Maskalanması (Google Redirect)")
        
    if any(domain in text_lower for domain in ['.tk', '.biz', '.xyz', 'bit.ly', 'tinyurl']):
        indicators.append("Şübhəli Domen və ya Qısaldılmış Link")

    # 4. Məzmun Analizi Nəticəsi (Summary)
    summary = ""
    if prediction == 1:
        summary = f"Bu mesajda fişinq əlamətləri aşkarlandı. {confidence}% etibarlılıqla skam hesab edilir."
    else:
        summary = f"Mətn normal görünür, lakin yenə də diqqətli olmağınız tövsiyə olunur."

    execution_time = round(time.time() - start_time, 4)

    # Bütün nəticələri JSON olaraq göndəririk
    return jsonify({
        "risk_level": risk_level,
        "confidence_score": confidence,
        "analysis_summary": summary,
        "risk_indicators": indicators if indicators else ["Ciddi risk göstəricisi tapılmadı"],
        "model_eval": {
            "accuracy": f"{model_accuracy * 100:.2f}%",
            "time": f"{execution_time} san",
            "version": "PhishGuard AI v2.1"
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)