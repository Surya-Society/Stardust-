import { useState, useEffect } from "react";

interface LoginProps {
  onLogin?: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [mounted, setMounted]   = useState(false);

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
    <>
      <style>{CSS}</style>
      <div className={`ln-root ${mounted ? "ln-mounted" : ""}`}>

        {/* ── LEFT PANEL ── */}
        <div className="ln-left">
          <div className="ln-grid" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="ln-grid-line ln-grid-h" style={{ top: `${(i + 1) * 13}%` }} />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="ln-grid-line ln-grid-v" style={{ left: `${(i + 1) * 18}%` }} />
            ))}
          </div>
          <div className="ln-orb" aria-hidden="true" />
          <div className="ln-corner-tl" aria-hidden="true" />
          <div className="ln-corner-br" aria-hidden="true" />
          <div className="ln-floats" aria-hidden="true">
            <div className="ln-float ln-float-1">
              <span className="ln-float-val">99.9%</span>
              <span className="ln-float-label">Uptime garanti</span>
            </div>
            <div className="ln-float ln-float-2">
              <span className="ln-float-val">2 048</span>
              <span className="ln-float-label">Établissements</span>
            </div>
            <div className="ln-float ln-float-3">
              <div className="ln-float-dots">
                <span style={{ background: "#3fb950" }} />
                <span style={{ background: "#388bfd" }} />
                <span style={{ background: "#d29922" }} />
              </div>
              <span className="ln-float-label">Systèmes actifs</span>
            </div>
          </div>
          <div className="ln-left-content">
            <div className="ln-logo-wrap">
              <img src="/LogoNova.png" alt="Nova" className="ln-logo" />
              <span className="ln-wordmark">Nova</span>
            </div>
            <div className="ln-tagline">
              <div className="ln-tagline-line">Plateforme de gestion</div>
              <div className="ln-tagline-line ln-tagline-accent">scolaire avancée.</div>
            </div>
            <p className="ln-desc">
              Administrez licences, abonnements et accès depuis<br />
              un seul tableau de bord sécurisé.
            </p>
            <div className="ln-version">
              <span className="ln-version-dot" />
              v2.4.1 — Production
            </div>
          </div>
          <div className="ln-left-rule" />
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="ln-right">
          <div className="ln-form-wrap">
            <div className="ln-form-header">
              <div className="ln-form-eyebrow">Espace administrateur</div>
              <h1 className="ln-form-title">Connexion</h1>
              <p className="ln-form-sub">Accès réservé aux comptes autorisés.</p>
            </div>
            <form onSubmit={handleSubmit} className="ln-form" noValidate>
              <div className="ln-field">
                <label htmlFor="ln-name" className="ln-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                  </svg>
                  Nom d'utilisateur
                </label>
                <div className={`ln-input-wrap ${name ? "ln-input-filled" : ""}`}>
                  <input
                    id="ln-name" type="text" autoComplete="username"
                    placeholder="Entrez votre nom…" value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    className="ln-input"
                  />
                  <div className="ln-input-bar" />
                </div>
              </div>
              <div className="ln-field">
                <label htmlFor="ln-pass" className="ln-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="0" ry="0"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Mot de passe
                </label>
                <div className={`ln-input-wrap ${password ? "ln-input-filled" : ""}`}>
                  <input
                    id="ln-pass" type={showPass ? "text" : "password"}
                    autoComplete="current-password" placeholder="••••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="ln-input"
                  />
                  <button type="button" className="ln-pass-toggle"
                    onClick={() => setShowPass((v) => !v)} tabIndex={-1}
                    aria-label={showPass ? "Masquer" : "Afficher"}>
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
                  <div className="ln-input-bar" />
                </div>
              </div>
              <div className="ln-options">
                <label className="ln-remember">
                  <div className="ln-checkbox">
                    <input type="checkbox" />
                    <div className="ln-checkbox-box">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  </div>
                  <span>Se souvenir de moi</span>
                </label>
                <button type="button" className="ln-forgot">Mot de passe oublié ?</button>
              </div>
              {error && (
                <div className="ln-error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {error}
                </div>
              )}
              <button type="submit" className={`ln-submit ${loading ? "ln-submit-loading" : ""}`} disabled={loading}>
                {loading ? (
                  <span className="ln-spinner" />
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
            <div className="ln-secure">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Connexion chiffrée TLS 1.3 · Session sécurisée
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

/* ── RESET GLOBAL — élimine tout margin/padding du navigateur ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  background: #090c10;
  overflow: hidden;
}

.ln-root {
  min-height: 100vh;
  width: 100%;
  display: flex;
  font-family: 'IBM Plex Sans', sans-serif;
  background: #090c10;
  color: #e6edf3;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  position: fixed;
  inset: 0;
}

/* ── ENTRANCE ANIMATIONS ── */
.ln-root { opacity: 0; }
.ln-root.ln-mounted { opacity: 1; transition: opacity .4s ease; }
.ln-left  { animation: lnSlideL .7s cubic-bezier(.4,0,.2,1) .1s both; }
.ln-right { animation: lnSlideR .7s cubic-bezier(.4,0,.2,1) .15s both; }
@keyframes lnSlideL { from { opacity:0; transform: translateX(-24px); } to { opacity:1; transform: translateX(0); } }
@keyframes lnSlideR { from { opacity:0; transform: translateX(24px);  } to { opacity:1; transform: translateX(0); } }

/* ══ LEFT PANEL ══ */
.ln-left {
  width: 52%;
  background: #0d1117;
  border-right: 1px solid #21262d;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ln-grid { position: absolute; inset: 0; pointer-events: none; }
.ln-grid-line { position: absolute; opacity: .035; }
.ln-grid-h { left:0; right:0; height:1px; background: #e6edf3; }
.ln-grid-v { top:0; bottom:0; width:1px; background: #e6edf3; }
.ln-orb {
  position: absolute; top: -160px; left: -100px;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(56,139,253,.14) 0%, transparent 70%);
  pointer-events: none;
}
.ln-corner-tl {
  position: absolute; top: 0; left: 0;
  width: 120px; height: 120px;
  border-top: 1px solid #388bfd; border-left: 1px solid #388bfd; opacity: .3;
}
.ln-corner-br {
  position: absolute; bottom: 0; right: 0;
  width: 80px; height: 80px;
  border-bottom: 1px solid #3fb950; border-right: 1px solid #3fb950; opacity: .25;
}
.ln-floats { position: absolute; inset: 0; pointer-events: none; }
.ln-float {
  position: absolute;
  background: rgba(22,27,34,.85); border: 1px solid #21262d;
  padding: 10px 16px; backdrop-filter: blur(6px);
  display: flex; flex-direction: column; gap: 3px;
}
.ln-float-1 { top: 22%; right: 8%; animation: lnFloat1 6s ease-in-out infinite; }
.ln-float-2 { top: 58%; right: 14%; animation: lnFloat2 7s ease-in-out 1s infinite; }
.ln-float-3 { top: 38%; right: 4%; animation: lnFloat3 5.5s ease-in-out .5s infinite; }
@keyframes lnFloat1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes lnFloat2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
@keyframes lnFloat3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
.ln-float-val { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; color:#388bfd; line-height:1; }
.ln-float-label { font-size:10px; color:#484f58; letter-spacing:.5px; text-transform:uppercase; font-weight:500; }
.ln-float-dots { display:flex; gap:5px; margin-bottom:2px; }
.ln-float-dots span { width:8px; height:8px; border-radius:50%; animation:lnPulse 2s ease-in-out infinite; }
.ln-float-dots span:nth-child(2) { animation-delay:.4s; }
.ln-float-dots span:nth-child(3) { animation-delay:.8s; }
@keyframes lnPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.ln-left-content {
  flex:1; display:flex; flex-direction:column; justify-content:center;
  padding:64px 72px; position:relative; z-index:2;
}
.ln-logo-wrap { display:flex; align-items:center; gap:14px; margin-bottom:52px; }
.ln-logo { width:44px; height:44px; object-fit:contain; }
.ln-wordmark { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; color:#e6edf3; letter-spacing:-1px; }
.ln-tagline { margin-bottom:20px; }
.ln-tagline-line { font-family:'Syne',sans-serif; font-size:42px; font-weight:700; line-height:1.1; letter-spacing:-1.5px; color:#e6edf3; }
.ln-tagline-accent { color:#388bfd; }
.ln-desc { font-size:13px; color:#8b949e; line-height:1.7; margin-bottom:36px; font-weight:300; }
.ln-version {
  display:inline-flex; align-items:center; gap:8px;
  font-family:'IBM Plex Mono',monospace; font-size:11px; color:#484f58;
  background:#161b22; border:1px solid #21262d; padding:5px 12px; width:fit-content;
}
.ln-version-dot {
  width:6px; height:6px; border-radius:50%; background:#3fb950;
  box-shadow:0 0 6px #3fb950; animation:lnPulse 2s ease-in-out infinite;
}
.ln-left-rule {
  height:1px; background:linear-gradient(90deg,transparent,#388bfd44,transparent);
  margin:0 72px 40px; position:relative; z-index:2;
}

/* ══ RIGHT PANEL ══ */
.ln-right {
  flex:1; display:flex; align-items:center; justify-content:center;
  padding:48px 32px; background:#090c10; position:relative; overflow-y:auto;
}
.ln-right::before {
  content:''; position:absolute; inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events:none; opacity:.5;
}
.ln-form-wrap { width:100%; max-width:360px; position:relative; z-index:1; }
.ln-form-header { margin-bottom:36px; }
.ln-form-eyebrow {
  font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:500;
  letter-spacing:2px; text-transform:uppercase; color:#388bfd; margin-bottom:10px;
}
.ln-form-title {
  font-family:'Syne',sans-serif; font-size:30px; font-weight:700;
  letter-spacing:-1px; color:#e6edf3; line-height:1; margin-bottom:8px;
}
.ln-form-sub { font-size:13px; color:#484f58; font-weight:300; }
.ln-form { display:flex; flex-direction:column; gap:20px; }
.ln-field { display:flex; flex-direction:column; gap:8px; }
.ln-label {
  display:flex; align-items:center; gap:6px;
  font-size:11px; font-weight:600; letter-spacing:.8px; text-transform:uppercase; color:#484f58;
}
.ln-input-wrap {
  position:relative; background:#0d1117; border:1px solid #21262d; transition:border-color .2s;
}
.ln-input-wrap:focus-within { border-color:#388bfd; }
.ln-input-wrap.ln-input-filled { border-color:#30363d; }
.ln-input {
  width:100%; background:transparent; border:none; outline:none;
  padding:12px 44px 12px 14px; font-family:'IBM Plex Mono',monospace; font-size:13px; color:#e6edf3;
}
.ln-input::placeholder { color:#30363d; }
.ln-input-bar {
  position:absolute; bottom:-1px; left:0; height:2px; width:0;
  background:#388bfd; transition:width .3s cubic-bezier(.4,0,.2,1);
}
.ln-input-wrap:focus-within .ln-input-bar { width:100%; }
.ln-pass-toggle {
  position:absolute; right:0; top:0; bottom:0; width:44px;
  display:flex; align-items:center; justify-content:center;
  background:transparent; border:none; color:#484f58; cursor:pointer; transition:color .15s;
}
.ln-pass-toggle:hover { color:#8b949e; }
.ln-options { display:flex; align-items:center; justify-content:space-between; }
.ln-remember {
  display:flex; align-items:center; gap:8px; font-size:12px; color:#484f58;
  cursor:pointer; user-select:none; transition:color .15s;
}
.ln-remember:hover { color:#8b949e; }
.ln-checkbox { position:relative; }
.ln-checkbox input[type="checkbox"] { position:absolute; opacity:0; width:0; height:0; }
.ln-checkbox-box {
  width:15px; height:15px; background:#090c10; border:1px solid #21262d;
  display:flex; align-items:center; justify-content:center; transition:all .15s; cursor:pointer;
}
.ln-checkbox input:checked ~ .ln-checkbox-box { background:#388bfd; border-color:#388bfd; }
.ln-checkbox-box svg { opacity:0; transition:opacity .15s; }
.ln-checkbox input:checked ~ .ln-checkbox-box svg { opacity:1; }
.ln-forgot {
  font-size:12px; color:#484f58; background:none; border:none;
  cursor:pointer; transition:color .15s; padding:0; font-family:'IBM Plex Sans',sans-serif;
}
.ln-forgot:hover { color:#388bfd; }
.ln-error {
  display:flex; align-items:center; gap:7px; font-size:12px; color:#f85149;
  background:rgba(248,81,73,.06); border:1px solid rgba(248,81,73,.25); padding:9px 12px;
  animation:lnShake .4s cubic-bezier(.36,.07,.19,.97);
}
@keyframes lnShake {
  10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(3px)}
  30%,50%,70%{transform:translateX(-3px)} 40%,60%{transform:translateX(3px)}
}
.ln-submit {
  height:48px; background:#388bfd; border:none; color:#fff;
  font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:600; letter-spacing:.3px;
  cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;
  transition:background .2s,transform .15s; position:relative; overflow:hidden; margin-top:4px; width:100%;
}
.ln-submit::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.1) 0%,transparent 60%); pointer-events:none;
}
.ln-submit:hover:not(:disabled) { background:#58a6ff; transform:translateY(-1px); }
.ln-submit:active:not(:disabled) { transform:translateY(0); }
.ln-submit:disabled { opacity:.7; cursor:not-allowed; }
.ln-spinner {
  width:18px; height:18px; border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff; border-radius:50%; animation:lnSpin .7s linear infinite;
}
@keyframes lnSpin { to{transform:rotate(360deg)} }
.ln-secure {
  display:flex; align-items:center; gap:6px; margin-top:20px;
  font-family:'IBM Plex Mono',monospace; font-size:10px; color:#30363d; justify-content:center;
}

@media (max-width: 900px) {
  .ln-left { display:none; }
  .ln-right { padding:40px 20px; }
  .ln-form-wrap { max-width:400px; }
}
`;