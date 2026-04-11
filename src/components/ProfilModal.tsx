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
  const [tab, setTab] = useState<"profil" | "securite" | "activite">("profil");
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
    <div className="font-['IBM_Plex_Sans'] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        @keyframes pmPulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes pmSlide { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      <div 
        ref={modalRef} 
        className={`fixed top-[72px] right-6 w-[356px] bg-[#0d1117] border border-[#21262d] shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)] z-[400] flex flex-col origin-top-right transition-all duration-240 ease-[cubic-bezier(0.4,0,0.2,1)] max-h-[calc(100vh-88px)] overflow-hidden max-[480px]:right-2 max-[480px]:left-2 max-[480px]:w-auto ${visible ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 -translate-y-2.5 scale-97 pointer-events-none"}`}
        role="dialog" 
        aria-modal="true"
      >
        {/* Flèche */}
        <div className="absolute -top-1.5 right-[22px] w-3 h-3 bg-[#0d1117] border-t border-l border-[#21262d] rotate-45 z-[1] max-[480px]:right-[56px]" />

        {/* ── HEADER ── */}
        <div className="relative bg-[#090c10] border-b border-[#21262d] overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(56,139,253,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(56,139,253,0.05)_1px,transparent_1px)] bg-[length:22px_22px]" />
            <div className="absolute -top-[50px] -right-[30px] w-[180px] h-[180px] bg-[radial-gradient(circle,rgba(56,139,253,0.12)_0%,transparent_70%)]" />
            <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-[rgba(56,139,253,0.35)]" />
            <div className="absolute bottom-0 right-0 w-7 h-7 border-b border-r border-[rgba(63,185,80,0.2)]" />
          </div>
          
          <div className="relative z-[1] flex items-start gap-3 p-[18px_16px_12px]">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[rgba(56,139,253,0.2)] to-[rgba(56,139,253,0.45)] border border-[rgba(56,139,253,0.4)] flex items-center justify-center font-['Syne'] text-lg font-bold text-[#388bfd]">
                A
              </div>
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#3fb950] border-2 border-[#090c10] shadow-[0_0_5px_#3fb950] animate-[pmPulse_2s_ease-in-out_infinite]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Syne'] text-[15px] font-bold text-[#e6edf3] tracking-[-0.3px] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Axel Fontaine</div>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#484f58] mb-1.5">axel@nova.app</div>
              <div className="inline-flex items-center gap-1 font-['IBM_Plex_Mono'] text-[9px] tracking-[1px] uppercase text-[#d29922] bg-[rgba(210,153,34,0.08)] border border-[rgba(210,153,34,0.25)] px-1.5 py-0.5">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Super Admin
              </div>
            </div>
            <button className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-[#161b22] border border-[#21262d] text-[#484f58] cursor-pointer transition-all duration-150 hover:text-[#e6edf3] hover:border-[#30363d]" onClick={onClose} aria-label="Fermer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="relative z-[1] grid grid-cols-3 border-t border-[#161b22]">
            {[{ label: "Sessions", value: "2" }, { label: "Permissions", value: "15/15" }, { label: "Depuis", value: "2023" }].map((s, i) => (
              <div key={i} className="px-3.5 py-2 text-center border-r border-[#161b22] last:border-r-0">
                <div className="font-['Syne'] text-[15px] font-bold text-[#388bfd] leading-none mb-0.5">{s.value}</div>
                <div className="text-[9px] uppercase tracking-[0.5px] text-[#30363d]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex border-b border-[#161b22] flex-shrink-0">
          {(["profil", "securite", "activite"] as const).map(t => (
            <button key={t} className={`flex-1 py-2.5 text-[11px] font-medium tracking-[0.3px] text-[#484f58] bg-transparent border-none border-b-2 border-transparent cursor-pointer transition-all duration-150 font-['IBM_Plex_Sans'] -mb-px hover:text-[#8b949e] ${tab === t ? "!text-[#e6edf3] !border-b-[#388bfd]" : ""}`} onClick={() => setTab(t)}>
              {t === "profil" ? "Profil" : t === "securite" ? "Sécurité" : "Activité"}
            </button>
          ))}
        </div>

        {/* ── BODY ── */}
        <div className="overflow-y-auto flex-1 scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: '#21262d transparent' }}>
          <style>{`
            .pm-body-custom::-webkit-scrollbar { width: 3px; }
            .pm-body-custom::-webkit-scrollbar-thumb { background: #21262d; }
          `}</style>
          <div className="pm-body-custom h-full">

            {tab === "profil" && (
              <div className="p-3.5 px-4 flex flex-col gap-2">
                <div className="flex flex-col">
                  {[
                    { label: "Identifiant",       val: "axel@nova.app",      mono: true  },
                    { label: "Nom complet",        val: "Axel Fontaine",      mono: false },
                    { label: "Membre depuis",      val: "2023-01-01",         mono: true  },
                    { label: "Dernière connexion", val: "Aujourd'hui, 09:14", mono: true  },
                  ].map((r, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-3 py-1.5 border-b border-[#0d1117] last:border-b-0">
                      <span className="text-[9px] uppercase tracking-[0.8px] text-[#30363d] font-['IBM_Plex_Mono'] flex-shrink-0">{r.label}</span>
                      <span className={`text-[11px] text-[#c9d1d9] text-right ${r.mono ? "font-['IBM_Plex_Mono'] text-[10px]" : ""}`}>{r.val}</span>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-[#0d1117] last:border-b-0">
                    <span className="text-[9px] uppercase tracking-[0.8px] text-[#30363d] font-['IBM_Plex_Mono'] flex-shrink-0">Rôle</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-['IBM_Plex_Mono'] text-[9px] text-[#d29922] bg-[rgba(210,153,34,0.08)] border border-[rgba(210,153,34,0.2)] px-1.5 py-0.5 uppercase tracking-[0.8px]">Super Admin</span>
                      <span className="flex items-center gap-0.5 text-[9px] text-[#30363d] font-['IBM_Plex_Mono']">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Protégé
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-[#161b22] my-1" />
                <div className="text-[9px] uppercase tracking-[1px] text-[#30363d] font-['IBM_Plex_Mono'] mb-2">Permissions actives</div>
                <div className="flex flex-wrap gap-1">
                  {ALL_PERMS.map(p => (
                    <div key={p} className="flex items-center gap-1 text-[10px] text-[#8b949e] bg-[#090c10] border border-[#1c2330] px-2 py-0.5 font-['IBM_Plex_Mono']">
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "securite" && (
              <div className="p-3.5 px-4 flex flex-col gap-2">
                <div className="flex items-start gap-2.5 bg-[rgba(63,185,80,0.05)] border border-[rgba(63,185,80,0.15)] p-2.5 mb-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <div>
                    <div className="text-[11px] text-[#3fb950] font-medium mb-0.5">Session sécurisée</div>
                    <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#484f58]">TLS 1.3 · Aucune anomalie détectée</div>
                  </div>
                </div>
                <div className="text-[9px] uppercase tracking-[1px] text-[#30363d] font-['IBM_Plex_Mono'] mb-2">Sessions actives</div>
                {SESSIONS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-2.5 bg-[#090c10] border border-[#161b22] p-2 mb-1 ${s.current ? "!border-[rgba(56,139,253,0.2)] !bg-[rgba(56,139,253,0.03)]" : ""}`}>
                    <div className="w-[26px] h-[26px] flex items-center justify-center bg-[#161b22] border border-[#21262d] text-[#8b949e] flex-shrink-0">
                      {s.device.includes("iPhone")
                        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/></svg>
                        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-[#c9d1d9] mb-0.5 flex items-center gap-1.5">
                        {s.device}
                        {s.current && <span className="font-['IBM_Plex_Mono'] text-[8px] tracking-[0.8px] uppercase text-[#388bfd] bg-[rgba(56,139,253,0.1)] border border-[rgba(56,139,253,0.2)] px-1 py-0.5">En cours</span>}
                      </div>
                      <div className="text-[9px] text-[#484f58] font-['IBM_Plex_Mono']">{s.ip} · {s.location}</div>
                    </div>
                    {!s.current && <button className="text-[10px] text-[#484f58] bg-transparent border border-[#21262d] px-1.5 py-0.5 cursor-pointer transition-all duration-150 font-['IBM_Plex_Sans'] flex-shrink-0 hover:text-[#f85149] hover:border-[rgba(248,81,73,0.3)] hover:bg-[rgba(248,81,73,0.05)]">Révoquer</button>}
                  </div>
                ))}
                <div className="h-px bg-[#161b22] my-1" />
                <div className="text-[9px] uppercase tracking-[1px] text-[#30363d] font-['IBM_Plex_Mono'] mb-2">Authentification</div>
                {[
                  { label: "Double facteur (2FA)", sub: "Couche de sécurité supplémentaire", on: false },
                  { label: "Alertes de connexion", sub: "Email à chaque nouvelle session",   on: true  },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-[#161b22] last:border-b-0">
                    <div>
                      <div className="text-[11px] text-[#c9d1d9] mb-0.5">{a.label}</div>
                      <div className="text-[9px] text-[#484f58] font-['IBM_Plex_Mono']">{a.sub}</div>
                    </div>
                    <div className={`w-[30px] h-4 flex-shrink-0 relative border bg-[#090c10] cursor-pointer transition-all duration-200 ${a.on ? "bg-[rgba(56,139,253,0.15)] border-[rgba(56,139,253,0.4)]" : "border-[#21262d]"}`}>
                      <div className={`absolute top-0.5 w-2.5 h-2.5 transition-all duration-200 ${a.on ? "left-4 bg-[#388bfd]" : "left-0.5 bg-[#484f58]"}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "activite" && (
              <div className="p-3.5 px-4 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[9px] uppercase tracking-[1px] text-[#30363d] font-['IBM_Plex_Mono']">Journal récent</div>
                  <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#30363d]">{ACTIVITY.length} entrées</span>
                </div>
                <div className="flex flex-col">
                  {ACTIVITY.map((a, i) => (
                    <div key={i} className="flex gap-2.5 animate-[pmSlide_0.3s_ease_both]" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex flex-col items-center flex-shrink-0 pt-1">
                        <div className="w-1.5 h-1.5" style={{ background: a.color, boxShadow: `0 0 5px ${a.color}88` }} />
                        {i < ACTIVITY.length - 1 && <div className="w-px flex-1 bg-[#161b22] min-h-[14px] my-0.5" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="text-[11px] text-[#c9d1d9] mb-0.5">{a.action}</div>
                        <div className="text-[9px] text-[#484f58] font-['IBM_Plex_Mono']">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex items-center justify-between p-2.5 px-4 border-t border-[#161b22] bg-[#090c10] flex-shrink-0">
          <div className="flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-[9px] text-[#30363d]">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#30363d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Nova v2.4.1 · Production
          </div>
          <button className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(248,81,73,0.07)] border border-[rgba(248,81,73,0.2)] text-[#f85149] font-['IBM_Plex_Sans'] text-[11px] font-medium cursor-pointer transition-all duration-150 hover:bg-[rgba(248,81,73,0.15)] hover:border-[rgba(248,81,73,0.4)]" onClick={onLogout}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Se déconnecter
          </button>
        </div>

      </div>
    </div>
  );
}