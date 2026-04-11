import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

def train_phishing_model():
    # 1. Datasetin yüklənməsi
    if not os.path.exists('dataset.csv'):
        print("Xəta: 'dataset.csv' faylı tapılmadı!")
        return

    # CSV faylını oxuyuruq
    df = pd.read_csv('dataset.csv')
    
    # 2. Məlumatın hazırlanması
    X_text = df['text']
    y = df['label']

    # TF-IDF Vektorizasiyası (n-gramlar mətndəki ardıcıllığı və URL hissələrini tutmağa kömək edir)
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
    X = vectorizer.fit_transform(X_text)

    # 3. Modelin qiymətləndirilməsi üçün datanı bölürük
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Modelin qurulması (Random Forest Classifier)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Test nəticələrini hesablayırıq
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # 5. Modelin və qiymətləndirmə nəticələrinin saxlanılması
    if not os.path.exists('model'):
        os.makedirs('model')
        
    joblib.dump(model, 'model/classifier.pkl')
    joblib.dump(vectorizer, 'model/vectorizer.pkl')
    # Qiymətləndirmə nəticəsini (accuracy) sonra app.py-da göstərmək üçün saxlayırıq
    joblib.dump(accuracy, 'model/accuracy_score.pkl')
    
    print(f"--- Model Təlimi Tamamlandı ---")
    print(f"Dəqiqlik dərəcəsi (Accuracy): {accuracy * 100:.2f}%")
    print("Fayllar 'model/' qovluğuna qeyd edildi.")

if __name__ == "__main__":
    train_phishing_model()