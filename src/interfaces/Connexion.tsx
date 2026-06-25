import { useState, useEffect } from "react";

interface LoginProps {
  onLogin?: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin?.();
    }, 1400);
  }

  return (
    <div className={`min-h-screen w-full flex font-['IBM_Plex_Sans'] bg-[#090c10] text-[#e6edf3] antialiased overflow-hidden fixed inset-0 ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-400`}>

      {/* ── LEFT PANEL ── */}
      <div className="w-[52%] bg-[#0d1117] border-r border-[#21262d] relative flex flex-col overflow-hidden animate-[lnSlideL_0.7s_cubic-bezier(0.4,0,0.2,1)_0.1s_both]">
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="absolute left-0 right-0 h-px bg-[#e6edf3] opacity-[0.035]" style={{ top: `${(i + 1) * 13}%` }} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-[#e6edf3] opacity-[0.035]" style={{ left: `${(i + 1) * 18}%` }} />
          ))}
        </div>
        
        {/* Orb */}
        <div className="absolute -top-40 -left-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(56,139,253,0.14)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Corners */}
        <div className="absolute top-0 left-0 w-[120px] h-[120px] border-t border-l border-[#388bfd] opacity-30" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#3fb950] opacity-25" />
        
        {/* Floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[22%] right-[8%] bg-[rgba(22,27,34,0.85)] border border-[#21262d] px-4 py-2.5 backdrop-blur-sm flex flex-col gap-0.5 animate-[lnFloat1_6s_ease-in-out_infinite]">
            <span className="font-['Syne'] text-xl font-bold text-[#388bfd] leading-none">99.9%</span>
            <span className="text-[10px] text-[#484f58] tracking-wide uppercase font-medium">Uptime garanti</span>
          </div>
          <div className="absolute top-[58%] right-[14%] bg-[rgba(22,27,34,0.85)] border border-[#21262d] px-4 py-2.5 backdrop-blur-sm flex flex-col gap-0.5 animate-[lnFloat2_7s_ease-in-out_1s_infinite]">
            <span className="font-['Syne'] text-xl font-bold text-[#388bfd] leading-none">2 048</span>
            <span className="text-[10px] text-[#484f58] tracking-wide uppercase font-medium">Établissements</span>
          </div>
          <div className="absolute top-[38%] right-[4%] bg-[rgba(22,27,34,0.85)] border border-[#21262d] px-4 py-2.5 backdrop-blur-sm flex flex-col gap-0.5 animate-[lnFloat3_5.5s_ease-in-out_0.5s_infinite]">
            <div className="flex gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-[lnPulse_2s_ease-in-out_infinite]" />
              <span className="w-2 h-2 rounded-full bg-[#388bfd] animate-[lnPulse_2s_ease-in-out_infinite_0.4s]" />
              <span className="w-2 h-2 rounded-full bg-[#d29922] animate-[lnPulse_2s_ease-in-out_infinite_0.8s]" />
            </div>
            <span className="text-[10px] text-[#484f58] tracking-wide uppercase font-medium">Systèmes actifs</span>
          </div>
        </div>
        
        {/* Left content */}
        <div className="flex-1 flex flex-col justify-center px-[72px] py-16 relative z-[2]">
          <div className="flex items-center gap-3.5 mb-[52px]">
            <img src="/LogoStardust.png" alt="Stardust" className="w-11 h-11 object-contain" />
            <span className="font-['Syne'] text-2xl font-extrabold text-[#e6edf3] tracking-tighter">Stardust</span>
          </div>
          <div className="mb-5">
            <div className="font-['Syne'] text-[42px] font-bold leading-[1.1] tracking-[-1.5px] text-[#e6edf3]">Plateforme de gestion</div>
            <div className="font-['Syne'] text-[42px] font-bold leading-[1.1] tracking-[-1.5px] text-[#388bfd]">scolaire avancée.</div>
          </div>
          <p className="text-[13px] text-[#8b949e] leading-relaxed mb-9 font-light">
            Administrez licences, abonnements et accès depuis<br />
            un seul tableau de bord sécurisé.
          </p>
          <div className="inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-[11px] text-[#484f58] bg-[#161b22] border border-[#21262d] py-1.5 px-3 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] shadow-[0_0_6px_#3fb950] animate-[lnPulse_2s_ease-in-out_infinite]" />
            v2.4.1 — Production
          </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-[#388bfd44] to-transparent mx-[72px] mb-10 relative z-[2]" />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-12 bg-[#090c10] relative overflow-y-auto animate-[lnSlideR_0.7s_cubic-bezier(0.4,0,0.2,1)_0.15s_both]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%20opacity%3D%220.03%22%2F%3E%3C%2Fsvg%3E')] opacity-50 pointer-events-none" />
        
        <div className="w-full max-w-[360px] relative z-[1]">
          <div className="mb-9">
            <div className="font-['IBM_Plex_Mono'] text-[10px] font-medium tracking-[2px] uppercase text-[#388bfd] mb-2.5">Espace administrateur</div>
            <h1 className="font-['Syne'] text-[30px] font-bold tracking-[-1px] text-[#e6edf3] leading-none mb-2">Connexion</h1>
            <p className="text-[13px] text-[#484f58] font-light">Accès réservé aux comptes autorisés.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <label htmlFor="ln-name" className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.8px] uppercase text-[#484f58]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                </svg>
                Nom d'utilisateur
              </label>
              <div className={`relative bg-[#0d1117] border transition-colors duration-200 ${name ? 'border-[#30363d]' : 'border-[#21262d]'} focus-within:border-[#388bfd]`}>
                <input
                  id="ln-name"
                  type="text"
                  autoComplete="username"
                  placeholder="Entrez votre nom…"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className="w-full bg-transparent border-none outline-none py-3 pr-11 pl-3.5 font-['IBM_Plex_Mono'] text-[13px] text-[#e6edf3] placeholder:text-[#30363d]"
                />
                <div className="absolute -bottom-px left-0 h-0.5 w-0 bg-[#388bfd] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-focus-within:w-full" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="ln-pass" className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.8px] uppercase text-[#484f58]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="0" ry="0"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Mot de passe
              </label>
              <div className={`relative bg-[#0d1117] border transition-colors duration-200 ${password ? 'border-[#30363d]' : 'border-[#21262d]'} focus-within:border-[#388bfd]`}>
                <input
                  id="ln-pass"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full bg-transparent border-none outline-none py-3 pr-11 pl-3.5 font-['IBM_Plex_Mono'] text-[13px] text-[#e6edf3] placeholder:text-[#30363d]"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center bg-transparent border-none text-[#484f58] cursor-pointer transition-colors duration-150 hover:text-[#8b949e]"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? "Masquer" : "Afficher"}
                >
                  {showPass ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
                <div className="absolute -bottom-px left-0 h-0.5 w-0 bg-[#388bfd] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-focus-within:w-full" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-[#484f58] cursor-pointer select-none transition-colors duration-150 hover:text-[#8b949e]">
                <div className="relative">
                  <input type="checkbox" className="absolute opacity-0 w-0 h-0" />
                  <div className="w-[15px] h-[15px] bg-[#090c10] border border-[#21262d] flex items-center justify-center transition-all duration-150 cursor-pointer peer-checked:bg-[#388bfd] peer-checked:border-[#388bfd]">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 peer-checked:opacity-100">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                </div>
                <span>Se souvenir de moi</span>
              </label>
              <button type="button" className="text-xs text-[#484f58] bg-none border-none cursor-pointer transition-colors duration-150 p-0 font-['IBM_Plex_Sans'] hover:text-[#388bfd]">
                Mot de passe oublié ?
              </button>
            </div>
            
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-[#f85149] bg-[rgba(248,81,73,0.06)] border border-[rgba(248,81,73,0.25)] py-2.5 px-3 animate-[lnShake_0.4s_cubic-bezier(0.36,0.07,0.19,0.97)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className={`h-12 bg-[#388bfd] border-none text-white font-['IBM_Plex_Sans'] text-[13px] font-semibold tracking-[0.3px] cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 relative overflow-hidden mt-1 w-full hover:bg-[#58a6ff] hover:-translate-y-px active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              {loading ? (
                <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-[lnSpin_0.7s_linear_infinite]" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>
          
          <div className="flex items-center gap-1.5 mt-5 font-['IBM_Plex_Mono'] text-[10px] text-[#30363d] justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Connexion chiffrée TLS 1.3 · Session sécurisée
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        
        @keyframes lnSlideL {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes lnSlideR {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes lnFloat1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes lnFloat2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes lnFloat3 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes lnPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes lnShake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(3px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX(3px); }
        }
        @keyframes lnSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}