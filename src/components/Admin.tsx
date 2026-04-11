import { useState, useEffect } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Role = "superadmin" | "admin" | "moderator" | "viewer";
type Status = "active" | "suspended" | "pending";

interface Permission {
  id: string;
  label: string;
  description: string;
  category: "gestion" | "acces" | "securite" | "systeme";
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  permissions: string[];
  createdAt: string;
  lastLogin: string;
  avatar: string;
  immutable?: boolean;
}

type ModalType = "add" | "edit" | "delete" | "permissions" | null;

const ALL_PERMISSIONS: Permission[] = [
  { id: "keys.read",    label: "Lire les clés",         description: "Consulter les clés d'activation",    category: "acces" },
  { id: "keys.write",   label: "Gérer les clés",         description: "Créer, modifier, révoquer les clés", category: "acces" },
  { id: "keys.revoke",  label: "Révoquer les clés",      description: "Révoquer toute clé active",          category: "securite" },
  { id: "users.read",   label: "Voir les utilisateurs",  description: "Consulter la liste des comptes",     category: "gestion" },
  { id: "users.write",  label: "Gérer les utilisateurs", description: "Créer et modifier des comptes",      category: "gestion" },
  { id: "users.delete", label: "Supprimer des comptes",  description: "Supprimer des comptes utilisateurs", category: "gestion" },
  { id: "subs.read",    label: "Voir les abonnements",   description: "Consulter les abonnements actifs",   category: "acces" },
  { id: "subs.write",   label: "Gérer les abonnements",  description: "Modifier les abonnements",           category: "acces" },
  { id: "api.read",     label: "Voir les clés API",      description: "Consulter les clés API",             category: "acces" },
  { id: "api.write",    label: "Gérer les clés API",     description: "Créer et révoquer les clés API",     category: "securite" },
  { id: "logs.read",    label: "Voir les journaux",      description: "Accéder aux journaux système",       category: "systeme" },
  { id: "system.config",label: "Configuration système",  description: "Modifier les paramètres globaux",    category: "systeme" },
  { id: "admin.manage", label: "Gérer les admins",       description: "Ajouter et modifier des admins",     category: "securite" },
  { id: "clients.read", label: "Voir les clients",       description: "Consulter la base clients",          category: "acces" },
  { id: "clients.write",label: "Gérer les clients",      description: "Modifier les données clients",       category: "gestion" },
];

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  superadmin: ALL_PERMISSIONS.map(p => p.id),
  admin: ["keys.read","keys.write","keys.revoke","users.read","users.write","subs.read","subs.write","api.read","api.write","logs.read","clients.read","clients.write"],
  moderator: ["keys.read","users.read","subs.read","clients.read","logs.read"],
  viewer: ["keys.read","users.read","subs.read","clients.read"],
};

const ROLE_META: Record<Role, { label: string; color: string; bg: string; border: string }> = {
  superadmin: { label: "Super Admin", color: "#d29922", bg: "rgba(210,153,34,.1)", border: "rgba(210,153,34,.3)" },
  admin:      { label: "Admin",       color: "#388bfd", bg: "rgba(56,139,253,.1)", border: "rgba(56,139,253,.3)" },
  moderator:  { label: "Modérateur",  color: "#3fb950", bg: "rgba(63,185,80,.1)",  border: "rgba(63,185,80,.3)"  },
  viewer:     { label: "Lecteur",     color: "#8b949e", bg: "rgba(139,148,158,.1)",border: "rgba(139,148,158,.3)"},
};

const STATUS_META: Record<Status, { label: string; color: string; dot: string }> = {
  active:    { label: "Actif",     color: "#3fb950", dot: "#3fb950" },
  suspended: { label: "Suspendu",  color: "#f85149", dot: "#f85149" },
  pending:   { label: "En attente",color: "#d29922", dot: "#d29922" },
};

const CAT_LABELS: Record<Permission["category"], string> = {
  gestion: "Gestion", acces: "Accès", securite: "Sécurité", systeme: "Système",
};

const INITIAL_USERS: AdminUser[] = [
  { id: 1, name: "Ngapi Claude Baptiste", email: "ngapi@nova.app", role: "superadmin", status: "active", permissions: ROLE_PERMISSIONS.superadmin, createdAt: "2023-01-01", lastLogin: "Aujourd'hui, 09:14", avatar: "AF", immutable: true },
  { id: 2, name: "Mienkountou Melaine Awa Belssaja ",    email: "awa@nova.app",  role: "superadmin", status: "active", permissions: ROLE_PERMISSIONS.superadmin, createdAt: "2023-01-01", lastLogin: "Aujourd'hui, 08:52", avatar: "LM", immutable: true },
  { id: 3, name: "Marc Dubois",   email: "marc@nova.app", role: "admin",      status: "active", permissions: ROLE_PERMISSIONS.admin,      createdAt: "2023-06-15", lastLogin: "Hier, 17:30",        avatar: "MD" },
  { id: 4, name: "Sophie Petit",  email: "sophie@nova.app",role:"moderator",  status: "active", permissions: ROLE_PERMISSIONS.moderator,  createdAt: "2024-01-10", lastLogin: "Il y a 3 jours",     avatar: "SP" },
  { id: 5, name: "Thomas Renard", email: "thomas@nova.app",role:"viewer",     status: "pending",permissions: ROLE_PERMISSIONS.viewer,    createdAt: "2024-03-01", lastLogin: "Jamais",              avatar: "TR" },
];

const EMPTY_FORM = { name: "", email: "", role: "admin" as Role, status: "active" as Status };

export default function Admin() {
  const [users, setUsers]           = useState<AdminUser[]>(INITIAL_USERS);
  const [selected, setSelected]     = useState<AdminUser | null>(null);
  const [modal, setModal]           = useState<ModalType>(null);
  const [filterRole, setFilterRole] = useState<Role | "all">("all");
  const [search, setSearch]         = useState("");
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editPerms, setEditPerms]   = useState<string[]>([]);
  const [toast, setToast]           = useState<{ msg: string; type: "green"|"red"|"amber" } | null>(null);
  const [mounted, setMounted]       = useState(false);
  const [activeTab, setActiveTab]   = useState<"users" | "roles">("users");

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  function showToast(msg: string, type: "green"|"red"|"amber" = "green") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function openAdd() { setForm(EMPTY_FORM); setModal("add"); }
  function openEdit(u: AdminUser) { setSelected(u); setForm({ name: u.name, email: u.email, role: u.role, status: u.status }); setModal("edit"); }
  function openPermissions(u: AdminUser) { setSelected(u); setEditPerms([...u.permissions]); setModal("permissions"); }
  function openDelete(u: AdminUser) { setSelected(u); setModal("delete"); }
  function closeModal() { setModal(null); setSelected(null); }

  function handleAdd() {
    if (!form.name.trim() || !form.email.trim()) return;
    const newUser: AdminUser = {
      id: Date.now(), name: form.name, email: form.email, role: form.role, status: form.status,
      permissions: ROLE_PERMISSIONS[form.role], createdAt: new Date().toISOString().slice(0,10),
      lastLogin: "Jamais", avatar: form.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(),
    };
    setUsers(prev => [...prev, newUser]);
    showToast(`${newUser.name} ajouté avec succès.`);
    closeModal();
  }

  function handleEdit() {
    if (!selected || !form.name.trim() || !form.email.trim()) return;
    setUsers(prev => prev.map(u => u.id === selected.id
      ? { ...u, name: form.name, email: form.email, role: form.role, status: form.status,
          avatar: form.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() } : u));
    showToast("Modifications enregistrées.", "amber");
    closeModal();
  }

  function handleDelete() {
    if (!selected || selected.immutable) return;
    setUsers(prev => prev.filter(u => u.id !== selected.id));
    showToast(`${selected.name} supprimé.`, "red");
    closeModal();
  }

  function handleSavePermissions() {
    if (!selected) return;
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, permissions: editPerms } : u));
    showToast("Permissions mises à jour.");
    closeModal();
  }

  function togglePerm(id: string) {
    if (selected?.role === "superadmin") return;
    setEditPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }

  const filtered = users.filter(u => {
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    superadmins: users.filter(u => u.role === "superadmin").length,
    pending: users.filter(u => u.status === "pending").length,
  };

  return (
    <div className={`w-full min-h-full bg-[#090c10] text-[#e6edf3] font-['IBM_Plex_Sans'] antialiased transition-opacity duration-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        
        @keyframes admPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes admFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes admSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes admFadeOut { to{opacity:0;transform:translateY(6px)} }
      `}</style>

      {/* ── HEADER ── */}
      <div className="flex items-end justify-between pt-9 pb-7 px-10 border-b border-[#161b22] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-4 max-[480px]:px-4">
        <div>
          <div className="flex items-center gap-2 font-['IBM_Plex_Mono'] text-[10px] tracking-[2px] uppercase text-[#388bfd] mb-2">
            <span className="w-1.5 h-1.5 bg-[#388bfd] shadow-[0_0_6px_#388bfd] animate-[admPulse_2s_ease-in-out_infinite]" />
            Panneau de contrôle
          </div>
          <h1 className="font-['Syne'] text-[28px] font-extrabold tracking-[-1px] text-[#e6edf3] mb-1">Administration</h1>
          <p className="text-xs text-[#484f58] font-light">Gestion des rôles, permissions et accès au logiciel</p>
        </div>
        <button className="flex items-center gap-2 px-[18px] py-2.5 bg-[#388bfd] border-none text-white font-['IBM_Plex_Sans'] text-xs font-semibold tracking-[0.3px] cursor-pointer transition-all duration-150 hover:bg-[#58a6ff] hover:-translate-y-px" onClick={openAdd}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Ajouter un admin
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-4 gap-px bg-[#161b22] border-b border-[#161b22] w-full max-[900px]:grid-cols-2">
        {[
          { label: "Comptes total",  value: stats.total,       color: "#388bfd" },
          { label: "Comptes actifs", value: stats.active,      color: "#3fb950" },
          { label: "Super Admins",   value: stats.superadmins, color: "#d29922" },
          { label: "En attente",     value: stats.pending,     color: "#f85149" },
        ].map((s, i) => (
          <div className="bg-[#0d1117] p-6 flex flex-col gap-1 max-[480px]:p-4" key={i}>
            <div className="font-['Syne'] text-[30px] font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-[#484f58] uppercase tracking-[0.5px] mb-2">{s.label}</div>
            <div className="h-0.5" style={{ background: s.color + "33" }}>
              <div className="h-full transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ background: s.color, width: `${Math.min(100, (s.value / stats.total) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="flex border-b border-[#161b22] px-10 max-[480px]:px-4">
        {(["users", "roles"] as const).map(t => (
          <button key={t} 
            className={`px-5 py-3.5 text-xs font-medium tracking-[0.5px] text-[#484f58] bg-transparent border-none border-b-2 border-transparent cursor-pointer transition-all duration-200 font-['IBM_Plex_Sans'] -mb-px hover:text-[#8b949e] ${activeTab === t ? '!text-[#e6edf3] !border-b-[#388bfd]' : ''}`}
            onClick={() => setActiveTab(t)}>
            {t === "users" ? "Utilisateurs" : "Rôles & Permissions"}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <>
          <div className="flex items-center gap-4 flex-wrap p-5 px-10 border-b border-[#161b22] w-full box-border max-[900px]:flex-col max-[900px]:items-stretch max-[480px]:px-4">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58] pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="w-full bg-[#0d1117] border border-[#21262d] text-[#e6edf3] font-['IBM_Plex_Mono'] text-xs py-2.5 px-3 pl-[34px] outline-none transition-colors duration-200 focus:border-[#388bfd] placeholder:text-[#30363d]" placeholder="Rechercher un admin…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "superadmin", "admin", "moderator", "viewer"] as const).map(r => (
                <button key={r}
                  className={`px-3 py-1.5 text-[11px] font-medium bg-[#0d1117] border border-[#21262d] text-[#484f58] cursor-pointer transition-all duration-150 font-['IBM_Plex_Sans'] hover:text-[#8b949e] hover:border-[#30363d] ${filterRole === r ? '!text-[#e6edf3]' : ''}`}
                  onClick={() => setFilterRole(r)}
                  style={filterRole === r && r !== "all" ? {
                    color: ROLE_META[r as Role]?.color,
                    borderColor: ROLE_META[r as Role]?.border,
                    background: ROLE_META[r as Role]?.bg,
                  } : {}}>
                  {r === "all" ? "Tous" : ROLE_META[r].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-px bg-[#161b22] w-full">
            {filtered.map((u, i) => (
              <div className="bg-[#0d1117] p-7 relative flex flex-col gap-4 animate-[admFadeIn_0.4s_ease_both] transition-colors duration-200 hover:bg-[#0e1218] box-border max-[900px]:p-5" key={u.id} style={{ animationDelay: `${i * 0.05}s` }}>
                {u.immutable && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-[9px] tracking-[1px] uppercase text-[#d29922] bg-[rgba(210,153,34,.08)] border border-[rgba(210,153,34,.2)] py-0.5 px-2">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Protégé
                  </div>
                )}
                <div className="flex gap-3.5 items-start">
                  <div className="w-[46px] h-[46px] flex-shrink-0 flex items-center justify-center font-['Syne'] text-[15px] font-bold relative" style={{
                    background: `linear-gradient(135deg, ${ROLE_META[u.role].color}22, ${ROLE_META[u.role].color}44)`,
                    border: `1px solid ${ROLE_META[u.role].border}`,
                    color: ROLE_META[u.role].color,
                  }}>
                    {u.avatar}
                    <span className="absolute bottom-0.5 right-0.5 w-2 h-2 border-[1.5px] border-[#0d1117]" style={{ background: STATUS_META[u.status].dot }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#e6edf3] mb-0.5">{u.name}</div>
                    <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#484f58] mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{u.email}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['IBM_Plex_Mono'] text-[9px] font-medium tracking-[1px] uppercase py-0.5 px-2" style={{ color: ROLE_META[u.role].color, background: ROLE_META[u.role].bg, border: `1px solid ${ROLE_META[u.role].border}` }}>
                        {ROLE_META[u.role].label}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px]" style={{ color: STATUS_META[u.status].color }}>
                        <span className="w-1.5 h-1.5" style={{ background: STATUS_META[u.status].dot }} />
                        {STATUS_META[u.status].label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2.5 border-t border-[#161b22] border-b border-[#161b22]">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[9px] uppercase tracking-[0.5px] text-[#30363d]">Créé le</span>
                    <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#8b949e]">{u.createdAt}</span>
                  </div>
                  <div className="w-px h-7 bg-[#161b22]" />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[9px] uppercase tracking-[0.5px] text-[#30363d]">Dernière connexion</span>
                    <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#8b949e]">{u.lastLogin}</span>
                  </div>
                  <div className="w-px h-7 bg-[#161b22]" />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[9px] uppercase tracking-[0.5px] text-[#30363d]">Permissions</span>
                    <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#388bfd]">{u.permissions.length} / {ALL_PERMISSIONS.length}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {(["gestion","acces","securite","systeme"] as const).map(cat => {
                    const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat);
                    const owned = catPerms.filter(p => u.permissions.includes(p.id)).length;
                    const pct = (owned / catPerms.length) * 100;
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-[0.5px] text-[#30363d] w-14 flex-shrink-0">{CAT_LABELS[cat]}</span>
                        <div className="flex-1 h-0.5 bg-[#161b22]">
                          <div className="h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ width: `${pct}%`, background: pct === 100 ? "#3fb950" : pct > 50 ? "#388bfd" : pct > 0 ? "#d29922" : "#21262d" }} />
                        </div>
                        <span className="font-['IBM_Plex_Mono'] text-[9px] text-[#484f58] w-6 text-right flex-shrink-0">{owned}/{catPerms.length}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[#161b22] border border-[#21262d] text-[#8b949e] cursor-pointer transition-all duration-150 font-['IBM_Plex_Sans'] hover:text-[#e6edf3] hover:border-[#30363d] hover:bg-[#1c2330]" onClick={() => openPermissions(u)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Permissions
                  </button>
                  {!u.immutable && (
                    <>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[#161b22] border border-[#21262d] text-[#8b949e] cursor-pointer transition-all duration-150 font-['IBM_Plex_Sans'] hover:text-[#e6edf3] hover:border-[#30363d] hover:bg-[#1c2330]" onClick={() => openEdit(u)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Modifier
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[#161b22] border border-[#21262d] text-[#8b949e] cursor-pointer transition-all duration-150 font-['IBM_Plex_Sans'] hover:!text-[#f85149] hover:!border-[rgba(248,81,73,.3)] hover:!bg-[rgba(248,81,73,.06)]" onClick={() => openDelete(u)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        Supprimer
                      </button>
                    </>
                  )}
                  {u.immutable && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#30363d] font-['IBM_Plex_Mono']">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                      Compte protégé — non modifiable
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 py-20 text-[#30363d] text-[13px]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#21262d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span>Aucun résultat pour cette recherche</span>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "roles" && (
        <div className="grid grid-cols-4 gap-px bg-[#161b22] w-full max-[1400px]:grid-cols-2 max-[900px]:grid-cols-1">
          {(["superadmin", "admin", "moderator", "viewer"] as Role[]).map(role => (
            <div className="bg-[#0d1117] border border-transparent flex flex-col animate-[admFadeIn_0.4s_ease_both]" key={role} style={{ borderColor: ROLE_META[role].border }}>
              <div className="flex items-center gap-3.5 p-5 pl-6 relative" style={{ background: ROLE_META[role].bg }}>
                <div className="flex items-center justify-center" style={{ color: ROLE_META[role].color }}>
                  {role === "superadmin" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                  {role === "admin" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                  {role === "moderator" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>}
                  {role === "viewer" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </div>
                <div>
                  <div className="font-['Syne'] text-base font-bold mb-0.5" style={{ color: ROLE_META[role].color }}>{ROLE_META[role].label}</div>
                  <div className="text-[10px] text-[#484f58] font-['IBM_Plex_Mono']">{users.filter(u => u.role === role).length} utilisateur(s)</div>
                </div>
                {role === "superadmin" && (
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-[9px] tracking-[1px] uppercase text-[#d29922] bg-[rgba(210,153,34,.08)] border border-[rgba(210,153,34,.2)] py-0.5 px-2">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Accès total
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col gap-3.5 flex-1">
                {(["gestion","acces","securite","systeme"] as const).map(cat => {
                  const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat);
                  const granted = catPerms.filter(p => ROLE_PERMISSIONS[role].includes(p.id));
                  if (granted.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="text-[9px] uppercase tracking-[1px] text-[#30363d] mb-1.5 font-['IBM_Plex_Mono']">{CAT_LABELS[cat]}</div>
                      <div className="flex flex-col gap-1">
                        {granted.map(p => (
                          <div key={p.id} className="flex items-center gap-1.5 text-[11px] text-[#8b949e]">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={ROLE_META[role].color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                            {p.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODALS ── */}
      {modal && (
        <div className="fixed inset-0 bg-[rgba(9,12,16,.8)] backdrop-blur-sm flex items-center justify-center z-[1000] animate-[admFadeIn_0.2s_ease]" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          {(modal === "add" || modal === "edit") && (
            <div className="bg-[#0d1117] border border-[#21262d] w-full max-w-[480px] max-h-[88vh] flex flex-col animate-[admSlideUp_0.25s_cubic-bezier(0.4,0,0.2,1)]">
              <div className="flex items-start justify-between p-5 pb-4 border-b border-[#161b22] flex-shrink-0">
                <div className="font-['Syne'] text-[17px] font-bold text-[#e6edf3] mb-1.5">{modal === "add" ? "Ajouter un administrateur" : "Modifier le compte"}</div>
                <button className="w-7 h-7 flex items-center justify-center bg-[#161b22] border border-[#21262d] text-[#484f58] cursor-pointer transition-all duration-150 flex-shrink-0 hover:text-[#e6edf3] hover:border-[#30363d]" onClick={closeModal}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-5 pb-4 overflow-y-auto flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Nom complet</label>
                  <input className="bg-[#090c10] border border-[#21262d] text-[#e6edf3] font-['IBM_Plex_Mono'] text-xs py-2.5 px-3 outline-none transition-colors duration-200 focus:border-[#388bfd] placeholder:text-[#30363d] w-full" placeholder="Prénom Nom" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Adresse email</label>
                  <input className="bg-[#090c10] border border-[#21262d] text-[#e6edf3] font-['IBM_Plex_Mono'] text-xs py-2.5 px-3 outline-none transition-colors duration-200 focus:border-[#388bfd] placeholder:text-[#30363d] w-full" type="email" placeholder="email@nova.app" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Rôle</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(["admin", "moderator", "viewer"] as Role[]).map(r => (
                      <button key={r} 
                        className={`px-3.5 py-1.5 text-[11px] font-medium bg-[#090c10] border border-[#21262d] text-[#484f58] cursor-pointer transition-all duration-150 font-['IBM_Plex_Sans'] hover:text-[#8b949e] hover:border-[#30363d] ${form.role === r ? '' : ''}`}
                        onClick={() => setForm(f => ({...f, role: r}))}
                        style={form.role === r ? { color: ROLE_META[r].color, background: ROLE_META[r].bg, borderColor: ROLE_META[r].border } : {}}>
                        {ROLE_META[r].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Statut</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(["active", "suspended", "pending"] as Status[]).map(s => (
                      <button key={s} 
                        className={`px-3.5 py-1.5 text-[11px] font-medium bg-[#090c10] border border-[#21262d] text-[#484f58] cursor-pointer transition-all duration-150 font-['IBM_Plex_Sans'] hover:text-[#8b949e] hover:border-[#30363d] ${form.status === s ? '' : ''}`}
                        onClick={() => setForm(f => ({...f, status: s}))}
                        style={form.status === s ? { color: STATUS_META[s].color, borderColor: STATUS_META[s].color + "55", background: STATUS_META[s].color + "11" } : {}}>
                        {STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-[#484f58] bg-[#090c10] border border-[#161b22] py-2.5 px-3 leading-relaxed">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#388bfd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  Les permissions seront initialisées selon le rôle choisi. Vous pourrez les affiner ensuite.
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 p-4 pt-3 border-t border-[#161b22] flex-shrink-0">
                <button className="px-[18px] py-2.5 bg-transparent border border-[#21262d] text-[#8b949e] font-['IBM_Plex_Sans'] text-xs cursor-pointer transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3]" onClick={closeModal}>Annuler</button>
                <button className="flex items-center gap-2 px-[18px] py-2.5 bg-[#388bfd] border-none text-white font-['IBM_Plex_Sans'] text-xs font-semibold tracking-[0.3px] cursor-pointer transition-all duration-150 hover:bg-[#58a6ff] hover:-translate-y-px" onClick={modal === "add" ? handleAdd : handleEdit}>{modal === "add" ? "Créer le compte" : "Enregistrer"}</button>
              </div>
            </div>
          )}

          {modal === "delete" && selected && (
            <div className="bg-[#0d1117] border border-[#21262d] w-full max-w-[380px] max-h-[88vh] flex flex-col animate-[admSlideUp_0.25s_cubic-bezier(0.4,0,0.2,1)]">
              <div className="flex items-start justify-between p-5 pb-4 border-b border-[#161b22] flex-shrink-0">
                <div className="font-['Syne'] text-[17px] font-bold text-[#f85149]">Supprimer le compte</div>
                <button className="w-7 h-7 flex items-center justify-center bg-[#161b22] border border-[#21262d] text-[#484f58] cursor-pointer transition-all duration-150 flex-shrink-0 hover:text-[#e6edf3] hover:border-[#30363d]" onClick={closeModal}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-5 pb-4 overflow-y-auto flex-1">
                <div className="flex flex-col items-center gap-4 text-center py-2">
                  <div className="w-13 h-13 flex items-center justify-center bg-[rgba(248,81,73,.06)] border border-[rgba(248,81,73,.2)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
                  </div>
                  <p className="text-[13px] text-[#8b949e] leading-relaxed">Vous êtes sur le point de supprimer définitivement le compte de <strong className="text-[#e6edf3]">{selected.name}</strong>. Cette action est irréversible.</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 p-4 pt-3 border-t border-[#161b22] flex-shrink-0">
                <button className="px-[18px] py-2.5 bg-transparent border border-[#21262d] text-[#8b949e] font-['IBM_Plex_Sans'] text-xs cursor-pointer transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3]" onClick={closeModal}>Annuler</button>
                <button className="px-[18px] py-2.5 bg-[rgba(248,81,73,.1)] border border-[rgba(248,81,73,.3)] text-[#f85149] font-['IBM_Plex_Sans'] text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-[rgba(248,81,73,.2)]" onClick={handleDelete}>Confirmer la suppression</button>
              </div>
            </div>
          )}

          {modal === "permissions" && selected && (
            <div className="bg-[#0d1117] border border-[#21262d] w-full max-w-[620px] max-h-[88vh] flex flex-col animate-[admSlideUp_0.25s_cubic-bezier(0.4,0,0.2,1)]">
              <div className="flex items-start justify-between p-5 pb-4 border-b border-[#161b22] flex-shrink-0">
                <div>
                  <div className="font-['Syne'] text-[17px] font-bold text-[#e6edf3] mb-1.5">Permissions — {selected.name}</div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-['IBM_Plex_Mono'] text-[9px] font-medium tracking-[1px] uppercase py-0.5 px-2" style={{ color: ROLE_META[selected.role].color, background: ROLE_META[selected.role].bg, border: `1px solid ${ROLE_META[selected.role].border}` }}>{ROLE_META[selected.role].label}</span>
                    {selected.role === "superadmin" && <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#484f58]">Permissions verrouillées — Super Admin</span>}
                  </div>
                </div>
                <button className="w-7 h-7 flex items-center justify-center bg-[#161b22] border border-[#21262d] text-[#484f58] cursor-pointer transition-all duration-150 flex-shrink-0 hover:text-[#e6edf3] hover:border-[#30363d]" onClick={closeModal}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-5 pb-4 overflow-y-auto flex flex-col gap-4 flex-1">
                {(["gestion","acces","securite","systeme"] as const).map(cat => (
                  <div key={cat} className="flex flex-col gap-2">
                    <div className="text-[9px] uppercase tracking-[1.5px] text-[#30363d] font-['IBM_Plex_Mono'] pb-1.5 border-b border-[#161b22]">{CAT_LABELS[cat]}</div>
                    <div className="flex flex-col gap-1">
                      {ALL_PERMISSIONS.filter(p => p.category === cat).map(p => {
                        const on = editPerms.includes(p.id);
                        const locked = selected.role === "superadmin";
                        return (
                          <div key={p.id} 
                            className={`flex items-center gap-2.5 py-2 px-3 border border-transparent cursor-pointer transition-all duration-150 bg-[#090c10] ${!locked ? 'hover:border-[#21262d] hover:bg-[#0d1117]' : 'cursor-default opacity-60'} ${on ? '!border-[#388bfd22] !bg-[#388bfd08]' : ''}`}
                            onClick={() => togglePerm(p.id)}>
                            <div className={`w-[15px] h-[15px] flex-shrink-0 border border-[#21262d] bg-[#090c10] flex items-center justify-center transition-all duration-150 ${on ? 'bg-[#388bfd] border-[#388bfd]' : ''}`}>
                              {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-[#c9d1d9] mb-0.5">{p.label}</div>
                              <div className="text-[10px] text-[#484f58] font-['IBM_Plex_Mono']">{p.description}</div>
                            </div>
                            {locked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#484f58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {selected.role !== "superadmin" && (
                <div className="flex items-center justify-end gap-2.5 p-4 pt-3 border-t border-[#161b22] flex-shrink-0">
                  <button className="px-[18px] py-2.5 bg-transparent border border-[#21262d] text-[#8b949e] font-['IBM_Plex_Sans'] text-xs cursor-pointer transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3]" onClick={closeModal}>Annuler</button>
                  <button className="flex items-center gap-2 px-[18px] py-2.5 bg-[#388bfd] border-none text-white font-['IBM_Plex_Sans'] text-xs font-semibold tracking-[0.3px] cursor-pointer transition-all duration-150 hover:bg-[#58a6ff] hover:-translate-y-px" onClick={handleSavePermissions}>Enregistrer les permissions</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-7 right-7 flex items-center gap-2.5 py-2.5 px-[18px] border font-['IBM_Plex_Mono'] text-[11px] animate-[admSlideUp_0.3s_ease,admFadeOut_0.3s_ease_2.9s_both] z-[2000] backdrop-blur-sm ${
          toast.type === "green" ? 'text-[#3fb950] bg-[rgba(63,185,80,.08)] border-[rgba(63,185,80,.25)]' :
          toast.type === "red" ? 'text-[#f85149] bg-[rgba(248,81,73,.08)] border-[rgba(248,81,73,.25)]' :
          'text-[#d29922] bg-[rgba(210,153,34,.08)] border-[rgba(210,153,34,.25)]'
        }`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {toast.type === "red" ? <><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></> : <><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></>}
          </svg>
          {toast.msg}
        </div>
      )}
    </div>
  );
}