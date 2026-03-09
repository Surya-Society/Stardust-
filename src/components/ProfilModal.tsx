import { useState, useEffect, useRef } from "react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}

const ACTIVITY = [
  { action: "Connexion réussie",      time: "Aujourd'hui, 09:14", color: "#3fb950" },
  { action: "Clé révoquée #AX-9921",  time: "Hier, 17:42",        color: "#f85149" },
  { action: "Admin ajouté",            time: "Hier, 14:30",        color: "#388bfd" },
  { action: "Export CSV clients",      time: "Il y a 3 jours",     color: "#d29922" },
  { action: "Paramètres modifiés",     time: "Il y a 5 jours",     color: "#8b949e" },
];

const SESSIONS = [
  { device: "Chrome · macOS",     ip: "192.168.1.12", location: "Pointe-Noire, CG", current: true  },
  { device: "Safari · iPhone 15", ip: "10.0.0.8",     location: "Brazzaville, CG",  current: false },
];

const ALL_PERMS = ["Clés", "Abonnements", "Clients", "API", "Admins", "Système", "Journaux", "Config"];

export default function ProfileModal({ isOpen, onClose, onLogout, anchorRef }: ProfileModalProps) {
  const [tab,     setTab]     = useState<"profil" | "securite" | "activite">("profil");
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => { setMounted(false); setTab("profil"); }, 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        modalRef.current && !modalRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, onClose, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <>
      <style>{CSS}</style>
      <div ref={modalRef} className={`pm-wrap ${visible ? "pm-visible" : ""}`} role="dialog" aria-modal="true">

        <div className="pm-arrow" />

        {/* ── HEADER ── */}
        <div className="pm-header">
          <div className="pm-header-bg">
            <div className="pm-grid" />
            <div className="pm-orb" />
            <div className="pm-corner-tl" />
            <div className="pm-corner-br" />
          </div>
          <div className="pm-header-inner">
            <div className="pm-avatar-wrap">
              <div className="pm-avatar">A</div>
              <span className="pm-status-dot" />
            </div>
            <div className="pm-header-info">
              <div className="pm-name">Axel Fontaine</div>
              <div className="pm-email">axel@nova.app</div>
              <div className="pm-role-tag">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Super Admin
              </div>
            </div>
            <button className="pm-close" onClick={onClose} aria-label="Fermer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="pm-stats">
            {[{ label: "Sessions", value: "2" }, { label: "Permissions", value: "15/15" }, { label: "Depuis", value: "2023" }].map((s, i) => (
              <div key={i} className="pm-stat">
                <div className="pm-stat-val">{s.value}</div>
                <div className="pm-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="pm-tabs">
          {(["profil", "securite", "activite"] as const).map(t => (
            <button key={t} className={`pm-tab ${tab === t ? "pm-tab-on" : ""}`} onClick={() => setTab(t)}>
              {t === "profil" ? "Profil" : t === "securite" ? "Sécurité" : "Activité"}
            </button>
          ))}
        </div>

        {/* ── BODY ── */}
        <div className="pm-body">

          {tab === "profil" && (
            <div className="pm-content">
              <div className="pm-rows">
                {[
                  { label: "Identifiant",       val: "axel@nova.app",      mono: true  },
                  { label: "Nom complet",        val: "Axel Fontaine",      mono: false },
                  { label: "Membre depuis",      val: "2023-01-01",         mono: true  },
                  { label: "Dernière connexion", val: "Aujourd'hui, 09:14", mono: true  },
                ].map((r, i) => (
                  <div key={i} className="pm-row">
                    <span className="pm-row-lbl">{r.label}</span>
                    <span className={`pm-row-val ${r.mono ? "pm-mono" : ""}`}>{r.val}</span>
                  </div>
                ))}
                <div className="pm-row">
                  <span className="pm-row-lbl">Rôle</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="pm-inline-role">Super Admin</span>
                    <span className="pm-locked-note">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Protégé
                    </span>
                  </div>
                </div>
              </div>
              <div className="pm-divider" />
              <div className="pm-section-title">Permissions actives</div>
              <div className="pm-chips">
                {ALL_PERMS.map(p => (
                  <div key={p} className="pm-chip">
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "securite" && (
            <div className="pm-content">
              <div className="pm-banner">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <div>
                  <div className="pm-banner-title">Session sécurisée</div>
                  <div className="pm-banner-sub">TLS 1.3 · Aucune anomalie détectée</div>
                </div>
              </div>
              <div className="pm-section-title">Sessions actives</div>
              {SESSIONS.map((s, i) => (
                <div key={i} className={`pm-session ${s.current ? "pm-session-cur" : ""}`}>
                  <div className="pm-session-ico">
                    {s.device.includes("iPhone")
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/></svg>
                      : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                    }
                  </div>
                  <div className="pm-session-info">
                    <div className="pm-session-device">{s.device}{s.current && <span className="pm-cur-tag">En cours</span>}</div>
                    <div className="pm-session-meta pm-mono">{s.ip} · {s.location}</div>
                  </div>
                  {!s.current && <button className="pm-revoke">Révoquer</button>}
                </div>
              ))}
              <div className="pm-divider" />
              <div className="pm-section-title">Authentification</div>
              {[
                { label: "Double facteur (2FA)", sub: "Couche de sécurité supplémentaire", on: false },
                { label: "Alertes de connexion", sub: "Email à chaque nouvelle session",   on: true  },
              ].map((a, i) => (
                <div key={i} className="pm-auth-row">
                  <div>
                    <div className="pm-auth-title">{a.label}</div>
                    <div className="pm-auth-sub">{a.sub}</div>
                  </div>
                  <div className={`pm-toggle ${a.on ? "pm-toggle-on" : ""}`}>
                    <div className="pm-toggle-knob" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "activite" && (
            <div className="pm-content">
              <div className="pm-activity-head">
                <span className="pm-section-title" style={{ marginBottom: 0 }}>Journal récent</span>
                <span className="pm-activity-count">{ACTIVITY.length} entrées</span>
              </div>
              <div className="pm-timeline">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="pm-tl-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="pm-tl-left">
                      <div className="pm-tl-dot" style={{ background: a.color, boxShadow: `0 0 5px ${a.color}88` }} />
                      {i < ACTIVITY.length - 1 && <div className="pm-tl-line" />}
                    </div>
                    <div className="pm-tl-body">
                      <div className="pm-tl-action">{a.action}</div>
                      <div className="pm-tl-time pm-mono">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── FOOTER ── */}
        <div className="pm-footer">
          <div className="pm-version">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#30363d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Nova v2.4.1 · Production
          </div>
          <button className="pm-logout" onClick={onLogout}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Se déconnecter
          </button>
        </div>

      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

.pm-wrap {
  position: fixed;
  top: 72px;
  right: 24px;
  width: 356px;
  background: #0d1117;
  border: 1px solid #21262d;
  box-shadow: 0 20px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.03);
  z-index: 400;
  display: flex;
  flex-direction: column;
  font-family: 'IBM Plex Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  opacity: 0;
  transform: translateY(-10px) scale(.97);
  transform-origin: top right;
  transition: opacity .24s cubic-bezier(.4,0,.2,1), transform .24s cubic-bezier(.4,0,.2,1);
  pointer-events: none;
  max-height: calc(100vh - 88px);
  overflow: hidden;
}
.pm-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }

.pm-arrow {
  position: absolute; top: -6px; right: 22px;
  width: 12px; height: 12px;
  background: #0d1117;
  border-top: 1px solid #21262d;
  border-left: 1px solid #21262d;
  transform: rotate(45deg);
  z-index: 1;
}

.pm-header { position: relative; background: #090c10; border-bottom: 1px solid #21262d; overflow: hidden; flex-shrink: 0; }
.pm-header-bg { position: absolute; inset: 0; pointer-events: none; }
.pm-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(56,139,253,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(56,139,253,.05) 1px,transparent 1px); background-size: 22px 22px; }
.pm-orb { position: absolute; top: -50px; right: -30px; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle,rgba(56,139,253,.12) 0%,transparent 70%); }
.pm-corner-tl { position: absolute; top: 0; left: 0; width: 40px; height: 40px; border-top: 1px solid rgba(56,139,253,.35); border-left: 1px solid rgba(56,139,253,.35); }
.pm-corner-br { position: absolute; bottom: 0; right: 0; width: 28px; height: 28px; border-bottom: 1px solid rgba(63,185,80,.2); border-right: 1px solid rgba(63,185,80,.2); }

.pm-header-inner { position: relative; z-index: 1; display: flex; align-items: flex-start; gap: 12px; padding: 18px 16px 12px; }
.pm-avatar-wrap { position: relative; flex-shrink: 0; }
.pm-avatar { width: 48px; height: 48px; background: linear-gradient(135deg,rgba(56,139,253,.2),rgba(56,139,253,.45)); border: 1px solid rgba(56,139,253,.4); display: flex; align-items: center; justify-content: center; font-family: 'Syne',sans-serif; font-size: 18px; font-weight: 700; color: #388bfd; }
.pm-status-dot { position: absolute; bottom: 2px; right: 2px; width: 9px; height: 9px; border-radius: 50%; background: #3fb950; border: 2px solid #090c10; box-shadow: 0 0 5px #3fb950; animation: pmPulse 2s ease-in-out infinite; }
@keyframes pmPulse { 0%,100%{opacity:1} 50%{opacity:.45} }
.pm-header-info { flex: 1; min-width: 0; }
.pm-name { font-family: 'Syne',sans-serif; font-size: 15px; font-weight: 700; color: #e6edf3; letter-spacing: -.3px; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pm-email { font-family: 'IBM Plex Mono',monospace; font-size: 10px; color: #484f58; margin-bottom: 6px; }
.pm-role-tag { display: inline-flex; align-items: center; gap: 4px; font-family: 'IBM Plex Mono',monospace; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #d29922; background: rgba(210,153,34,.1); border: 1px solid rgba(210,153,34,.25); padding: 2px 7px; }
.pm-close { width: 24px; height: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #161b22; border: 1px solid #21262d; color: #484f58; cursor: pointer; transition: all .15s; }
.pm-close:hover { color: #e6edf3; border-color: #30363d; }

.pm-stats { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3,1fr); border-top: 1px solid #161b22; }
.pm-stat { padding: 8px 14px; text-align: center; border-right: 1px solid #161b22; }
.pm-stat:last-child { border-right: none; }
.pm-stat-val { font-family: 'Syne',sans-serif; font-size: 15px; font-weight: 700; color: #388bfd; line-height: 1; margin-bottom: 2px; }
.pm-stat-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .5px; color: #30363d; }

.pm-tabs { display: flex; border-bottom: 1px solid #161b22; flex-shrink: 0; }
.pm-tab { flex: 1; padding: 9px 0; font-size: 11px; font-weight: 500; letter-spacing: .3px; color: #484f58; background: transparent; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all .15s; font-family: 'IBM Plex Sans',sans-serif; margin-bottom: -1px; }
.pm-tab:hover { color: #8b949e; }
.pm-tab-on { color: #e6edf3 !important; border-bottom-color: #388bfd; }

.pm-body { overflow-y: auto; flex: 1; scrollbar-width: thin; scrollbar-color: #21262d transparent; }
.pm-body::-webkit-scrollbar { width: 3px; }
.pm-body::-webkit-scrollbar-thumb { background: #21262d; }

.pm-content { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }

.pm-rows { display: flex; flex-direction: column; }
.pm-row { display: flex; align-items: baseline; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #0d1117; gap: 12px; }
.pm-row:last-child { border-bottom: none; }
.pm-row-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .8px; color: #30363d; font-family: 'IBM Plex Mono',monospace; flex-shrink: 0; }
.pm-row-val { font-size: 11px; color: #c9d1d9; text-align: right; }
.pm-mono { font-family: 'IBM Plex Mono',monospace !important; font-size: 10px !important; }
.pm-inline-role { font-family: 'IBM Plex Mono',monospace; font-size: 9px; color: #d29922; background: rgba(210,153,34,.08); border: 1px solid rgba(210,153,34,.2); padding: 1px 6px; text-transform: uppercase; letter-spacing: .8px; }
.pm-locked-note { display: flex; align-items: center; gap: 3px; font-size: 9px; color: #30363d; font-family: 'IBM Plex Mono',monospace; }

.pm-divider { height: 1px; background: #161b22; margin: 4px 0; }
.pm-section-title { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #30363d; font-family: 'IBM Plex Mono',monospace; margin-bottom: 8px; }

.pm-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.pm-chip { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #8b949e; background: #090c10; border: 1px solid #1c2330; padding: 3px 8px; font-family: 'IBM Plex Mono',monospace; }

.pm-banner { display: flex; align-items: flex-start; gap: 9px; background: rgba(63,185,80,.05); border: 1px solid rgba(63,185,80,.15); padding: 9px 11px; margin-bottom: 6px; }
.pm-banner-title { font-size: 11px; color: #3fb950; font-weight: 500; margin-bottom: 1px; }
.pm-banner-sub { font-family: 'IBM Plex Mono',monospace; font-size: 9px; color: #484f58; }

.pm-session { display: flex; align-items: center; gap: 9px; background: #090c10; border: 1px solid #161b22; padding: 8px 10px; margin-bottom: 4px; }
.pm-session-cur { border-color: rgba(56,139,253,.2) !important; background: rgba(56,139,253,.03); }
.pm-session-ico { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; background: #161b22; border: 1px solid #21262d; color: #8b949e; flex-shrink: 0; }
.pm-session-info { flex: 1; min-width: 0; }
.pm-session-device { font-size: 11px; color: #c9d1d9; margin-bottom: 1px; display: flex; align-items: center; gap: 6px; }
.pm-session-meta { font-size: 9px; color: #484f58; }
.pm-cur-tag { font-family: 'IBM Plex Mono',monospace; font-size: 8px; letter-spacing: .8px; text-transform: uppercase; color: #388bfd; background: rgba(56,139,253,.1); border: 1px solid rgba(56,139,253,.2); padding: 1px 4px; }
.pm-revoke { font-size: 10px; color: #484f58; background: transparent; border: 1px solid #21262d; padding: 3px 7px; cursor: pointer; transition: all .15s; font-family: 'IBM Plex Sans',sans-serif; flex-shrink: 0; }
.pm-revoke:hover { color: #f85149; border-color: rgba(248,81,73,.3); background: rgba(248,81,73,.05); }

.pm-auth-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid #161b22; }
.pm-auth-row:last-child { border-bottom: none; }
.pm-auth-title { font-size: 11px; color: #c9d1d9; margin-bottom: 1px; }
.pm-auth-sub { font-size: 9px; color: #484f58; font-family: 'IBM Plex Mono',monospace; }
.pm-toggle { width: 30px; height: 16px; flex-shrink: 0; position: relative; border: 1px solid #21262d; background: #090c10; cursor: pointer; transition: all .2s; }
.pm-toggle-on { background: rgba(56,139,253,.15); border-color: rgba(56,139,253,.4); }
.pm-toggle-knob { position: absolute; top: 2px; width: 10px; height: 10px; background: #484f58; transition: all .2s; }
.pm-toggle-on .pm-toggle-knob { left: 16px; background: #388bfd; }
.pm-toggle:not(.pm-toggle-on) .pm-toggle-knob { left: 2px; }

.pm-activity-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.pm-activity-count { font-family: 'IBM Plex Mono',monospace; font-size: 10px; color: #30363d; }
.pm-timeline { display: flex; flex-direction: column; }
.pm-tl-item { display: flex; gap: 10px; animation: pmSlide .3s ease both; }
@keyframes pmSlide { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
.pm-tl-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; padding-top: 4px; }
.pm-tl-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.pm-tl-line { width: 1px; flex: 1; background: #161b22; min-height: 14px; margin: 3px 0; }
.pm-tl-body { flex: 1; padding-bottom: 12px; }
.pm-tl-action { font-size: 11px; color: #c9d1d9; margin-bottom: 1px; }
.pm-tl-time { font-size: 9px; color: #484f58; }

.pm-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-top: 1px solid #161b22; background: #090c10; flex-shrink: 0; }
.pm-version { display: flex; align-items: center; gap: 5px; font-family: 'IBM Plex Mono',monospace; font-size: 9px; color: #30363d; }
.pm-logout { display: flex; align-items: center; gap: 5px; padding: 5px 11px; background: rgba(248,81,73,.07); border: 1px solid rgba(248,81,73,.2); color: #f85149; font-family: 'IBM Plex Sans',sans-serif; font-size: 11px; font-weight: 500; cursor: pointer; transition: all .15s; }
.pm-logout:hover { background: rgba(248,81,73,.15); border-color: rgba(248,81,73,.4); }

@media (max-width: 480px) {
  .pm-wrap { right: 8px; left: 8px; width: auto; }
  .pm-arrow { right: 56px; }
}
`;