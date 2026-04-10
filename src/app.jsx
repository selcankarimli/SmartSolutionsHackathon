import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  AlertTriangle, 
  Activity,
  Cpu,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Database,
  Search,
  RefreshCcw
} from 'lucide-react';

const App = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [terminalLines, setTerminalLines] = useState(['Initializing security protocols...', 'Ready for packet inspection.']);

  // API açarını təhlükəsiz şəkildə əldə etmək üçün funksiya
  // process.env brauzer mühitində (ReferenceError verməməsi üçün) yoxlanılır
  const getApiKey = () => {
    try {
      return (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEMINI_API_KEY) || "";
    } catch (e) {
      return "";
    }
  };

  const apiKey = getApiKey();

  const addTerminalLine = (line) => {
    setTerminalLines(prev => [...prev, `> ${line}`].slice(-5));
  };

  const analyzeScam = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    addTerminalLine("Scanning input for malicious patterns...");
    addTerminalLine("Executing heuristic analysis...");

    const systemPrompt = `Sən kiber-təhlükəsizlik üzrə mütəxəssis bir AI-san. 
    İstifadəçinin daxil etdiyi mətni (URL və ya mesaj) analiz et. 
    Cavabı yalnız aşağıdakı JSON formatında qaytar:
    {
      "risk_level": "CRITICAL" | "SUSPICIOUS" | "SAFE",
      "confidence_score": number (0-100),
      "analysis_summary": "Qısa kiber analiz rəyi",
      "threat_vectors": ["vektor 1", "vektor 2", "vektor 3"],
      "tech_metrics": {
        "encryption_check": "Verified" | "Unknown",
        "entropy_level": "High" | "Medium" | "Low",
        "ai_confidence": 0.98
      }
    }`;

    try {
      if (!apiKey) {
        throw new Error('API_KEY_MISSING');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error('CONNECTION_FAILURE');
      
      const data = await response.json();
      const jsonResponse = JSON.parse(data.candidates[0].content.parts[0].text);
      setResult(jsonResponse);
      addTerminalLine("Analysis complete. Threat profile generated.");
    } catch (err) {
      const errorMsg = err.message === 'API_KEY_MISSING' 
        ? "SYSTEM_ERROR: API_KEY tapılmadı. Zəhmət olmasa Vercel Environment Variables hissəsini yoxlayın."
        : "SYSTEM_ERROR: Şəbəkə bağlantısı və ya API xətası baş verdi.";
      
      setError(errorMsg);
      addTerminalLine("ERROR: Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (level) => {
    switch (level) {
      case 'CRITICAL': return 'border-red-500 text-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      case 'SUSPICIOUS': return 'border-yellow-500 text-yellow-500 bg-yellow-950/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
      case 'SAFE': return 'border-emerald-500 text-emerald-500 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
      default: return 'border-blue-500 text-blue-500 bg-blue-950/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-emerald-500 font-mono p-4 md:p-8 selection:bg-emerald-900 selection:text-white overflow-x-hidden">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" 
           style={{backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '30px 30px'}}>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-emerald-900 pb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 border border-emerald-500 rounded-lg animate-pulse shrink-0">
              <Terminal size={32} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex flex-wrap items-center gap-2">
                SCAM_DETECTOR <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded">v2.1.0-STABLE</span>
              </h1>
              <p className="text-[10px] text-emerald-700 font-bold">SMART SOLUTIONS HACKATHON // CORE_SECURITY_PROBE</p>
            </div>
          </div>
          <div className="flex gap-4 md:gap-6 text-[10px] font-bold">
            <div className="flex items-center gap-2"><Activity size={12} className="animate-bounce" /> SYSTEM_ONLINE</div>
            <div className="flex items-center gap-2 text-emerald-700"><Database size={12} /> DB_SYNCED</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel (Left) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-900/80 border border-emerald-900 p-1 rounded-lg">
              <div className="bg-emerald-900/20 p-2 text-[10px] flex justify-between uppercase tracking-widest border-b border-emerald-900 mb-1">
                <span>Data_Source: Manual_Input</span>
                <span>Security: SSL_ENCRYPTED</span>
              </div>
              <textarea
                className="w-full h-64 p-4 bg-transparent border-none focus:ring-0 text-emerald-400 placeholder:text-emerald-900 resize-none font-mono text-sm"
                placeholder="Paste suspicious raw data or URL here for deep inspection..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <button
              onClick={analyzeScam}
              disabled={loading || !input.trim()}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-emerald-950 text-black font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group relative overflow-hidden rounded"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              {loading ? <RefreshCcw className="animate-spin" size={20} /> : <><Zap size={18} fill="currentColor" /> Execute_Scan</>}
            </button>

            {/* Terminal Output */}
            <div className="bg-black border border-emerald-950 p-4 rounded text-[11px] font-mono h-32 overflow-hidden shadow-inner flex flex-col justify-end">
              {terminalLines.map((line, i) => (
                <div key={i} className={i === terminalLines.length - 1 ? "text-emerald-400" : "text-emerald-900"}>
                  {line}
                </div>
              ))}
              {loading && <div className="text-emerald-400 animate-pulse mt-1">_ DECRYPTING_RESPONSE...</div>}
            </div>
          </div>

          {/* Results Panel (Right) */}
          <div className="lg:col-span-5 space-y-6">
            {!result && !loading && (
              <div className="h-full min-h-[300px] border border-dashed border-emerald-900 rounded-lg flex flex-col items-center justify-center p-12 text-center text-emerald-900">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Waiting for bitstream...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-950/20 border border-red-500 p-4 rounded text-red-500 text-[11px] font-bold flex items-start gap-3 animate-pulse">
                <AlertTriangle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                {/* Risk Level Card */}
                <div className={`p-6 border-2 rounded-lg text-center ${getStatusStyle(result.risk_level)}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Threat_Class</div>
                  <div className="text-3xl md:text-4xl font-black italic tracking-tighter flex items-center justify-center gap-3">
                    {result.risk_level === 'CRITICAL' ? <ShieldAlert size={32} /> : result.risk_level === 'SAFE' ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
                    {result.risk_level}
                  </div>
                  <div className="mt-4 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-current transition-all duration-1000" style={{width: `${result.confidence_score}%`}}></div>
                  </div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-widest">Confidence_Score: {result.confidence_score}%</div>
                </div>

                {/* Technical Diagnostics */}
                <div className="bg-zinc-900 border border-emerald-900 p-4 rounded-lg grid grid-cols-2 gap-4 text-[10px]">
                  <div className="border border-emerald-900/50 p-2 rounded">
                    <div className="text-emerald-700 uppercase mb-1">Enc_Status</div>
                    <div className="text-emerald-400 font-bold">{result.tech_metrics.encryption_check}</div>
                  </div>
                  <div className="border border-emerald-900/50 p-2 rounded">
                    <div className="text-emerald-700 uppercase mb-1">Entropy_LVL</div>
                    <div className="text-emerald-400 font-bold">{result.tech_metrics.entropy_level}</div>
                  </div>
                </div>

                {/* Analysis Intel */}
                <div className="bg-zinc-900 border border-emerald-900 p-5 rounded-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Cpu size={40} /></div>
                  <h3 className="text-[10px] font-black uppercase text-emerald-700 mb-3 flex items-center gap-2">
                    <Info size={12} /> Intelligence_Report
                  </h3>
                  <p className="text-[12px] text-emerald-400 leading-relaxed font-bold">
                    {result.analysis_summary}
                  </p>
                </div>

                {/* Threat Vectors List */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-emerald-700 px-1">Active_Threat_Vectors:</h3>
                  {result.threat_vectors.map((vector, i) => (
                    <div key={i} className="bg-black border border-emerald-900/30 p-3 rounded flex items-center gap-3 text-[11px] group hover:border-emerald-500 transition-colors">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></div>
                      <span className="text-emerald-500 font-bold uppercase group-hover:text-white transition-colors">{vector}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-emerald-900/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-emerald-900 font-black tracking-[0.3em] uppercase mb-8">
          <div>© 2026_CORE_SYSTEM // ACCESS_LEVEL: AUTHORIZED</div>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><Lock size={10} /> Secure_Probe</span>
            <span className="flex items-center gap-1.5 text-emerald-700 animate-pulse"><Globe size={10} /> Network_Active</span>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .min-h-screen::after {
          content: "";
          position: fixed;
          top: 0; left: 0; width: 100%; height: 2px;
          background: rgba(16, 185, 129, 0.1);
          opacity: 0.3;
          animation: scanline 6s linear infinite;
          pointer-events: none;
        }
      `}} />
    </div>
  );
};

export default App;
