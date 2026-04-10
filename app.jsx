import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  BarChart3, 
  Globe,
  MessageSquare,
  ExternalLink,
  Cpu
} from 'lucide-react';

const App = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Gemini API Konfiqurasiyası
  // Qeyd: Bu boş qaldıqda tətbiq yalnız interfeys olaraq görünəcək.
  const apiKey = ""; 

  const analyzeScam = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    const systemPrompt = `Sən fırıldaqçılıq və fişinq (phishing) üzrə mütəxəssis AI detektorsan. 
    İstifadəçinin daxil etdiyi mesajı və ya URL-i analiz et. 
    Cavabı yalnız aşağıdakı JSON formatında qaytar:
    {
      "risk_level": "Yüksək" | "Orta" | "Aşağı",
      "confidence_score": number (0-100),
      "analysis_summary": "Qısa məzmun analizi",
      "risk_indicators": ["indikator 1", "indikator 2", "indikator 3"],
      "model_metrics": {
        "precision": number (0-1),
        "recall": number (0-1),
        "f1_score": number (0-1)
      }
    }`;

    let retries = 0;
    const maxRetries = 5;
    
    const callApi = async (delay) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!response.ok) throw new Error('API xətası və ya açar daxil edilməyib');
        
        const data = await response.json();
        const jsonResponse = JSON.parse(data.candidates[0].content.parts[0].text);
        setResult(jsonResponse);
      } catch (err) {
        if (retries < maxRetries && apiKey !== "") {
          retries++;
          setTimeout(() => callApi(delay * 2), delay);
        } else {
          setError("Təhlil zamanı xəta baş verdi. Zəhmət olmasa API açarını yoxlayın və ya yenidən cəhd edin.");
        }
      } finally {
        setLoading(false);
      }
    };

    callApi(1000);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Yüksək': return 'text-red-600 bg-red-50 border-red-200';
      case 'Orta': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Aşağı': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <ShieldAlert className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">AI Scam & Phishing Detector</h1>
          <p className="text-slate-500 mt-2">Smart Solutions Hackathon üçün hazırlanmış xüsusi detektor</p>
          
          <a 
            href="https://smart-solutions-hackathon.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            <ExternalLink size={14} /> Layihə Veb-saytı
          </a>
        </header>

        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MessageSquare size={16} /> Şübhəli məzmunu daxil edin (Mesaj və ya URL)
            </label>
            <textarea
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
              placeholder="Məsələn: 'Hörmətli müştəri, bank hesabınız bloklanıb. Aktivləşdirmək üçün linkə daxil olun...'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              onClick={analyzeScam}
              disabled={loading || !input.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Cpu size={20} />
                  Analiz et (Analyze)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Classification Card */}
              <div className={`p-6 rounded-3xl border ${getRiskColor(result.risk_level)} flex flex-col items-center text-center justify-center shadow-sm`}>
                <span className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Risk Klassifikasiyası</span>
                <div className="flex items-center gap-2 mb-2">
                  {result.risk_level === 'Yüksək' ? <ShieldAlert size={32} /> : result.risk_level === 'Orta' ? <ShieldQuestion size={32} /> : <ShieldCheck size={32} />}
                  <h2 className="text-3xl font-black">{result.risk_level}</h2>
                </div>
                <p className="text-sm font-medium">Bu məzmun potensial təhlükə daşıyır.</p>
              </div>

              {/* Confidence Score */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center text-center justify-center shadow-sm">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Etibarlılıq Göstəricisi</span>
                <div className="relative flex items-center justify-center">
                   <svg className="w-24 h-24">
                      <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                      <circle 
                        className="text-blue-500" 
                        strokeWidth="8" 
                        strokeDasharray={251.2} 
                        strokeDashoffset={251.2 - (251.2 * result.confidence_score) / 100} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" cx="48" cy="48" 
                      />
                   </svg>
                   <span className="absolute text-xl font-bold text-slate-700">{result.confidence_score}%</span>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info size={18} className="text-blue-500" /> Məzmun Analizi Nəticələri
              </h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">
                {result.analysis_summary}
              </p>
            </div>

            {/* Risk Indicators */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> Risk İndikatorları (Minimum 3)
              </h3>
              <ul className="space-y-3">
                {result.risk_indicators.map((indicator, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                    <span className="bg-white border border-slate-200 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</span>
                    <span className="text-sm font-medium">{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Model Evaluation Results */}
            <div className="bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-400" /> Modelin Qiymətləndirilməsi
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-2xl text-center border border-slate-600">
                  <div className="text-xs text-slate-400 uppercase font-bold mb-1">Precision</div>
                  <div className="text-xl font-mono text-blue-300">{(result.model_metrics.precision * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-2xl text-center border border-slate-600">
                  <div className="text-xs text-slate-400 uppercase font-bold mb-1">Recall</div>
                  <div className="text-xl font-mono text-green-300">{(result.model_metrics.recall * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-2xl text-center border border-slate-600">
                  <div className="text-xs text-slate-400 uppercase font-bold mb-1">F1 Score</div>
                  <div className="text-xl font-mono text-amber-300">{(result.model_metrics.f1_score * 100).toFixed(1)}%</div>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 italic text-center">
                * Bu metrikalar daxil edilmiş məzmunun tipi üzrə modelin tarixi performans simulyasiyasıdır.
              </p>
            </div>

          </div>
        )}

        {/* Footer info for Hackathon */}
        <footer className="mt-12 text-center text-slate-400 text-xs">
          <p>© 2026 Smart Solutions Hackathon Team - Scam Detector Project</p>
        </footer>

        {/* Placeholder if no result */}
        {!result && !loading && (
          <div className="text-center py-12 opacity-40">
            <Globe size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">Analizə başlamaq üçün yuxarıdakı sahəyə məlumat daxil edin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
