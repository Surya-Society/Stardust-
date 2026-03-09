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
    <>
      <style>{CSS}</style>
      <div className={`adm-root ${mounted ? "adm-mounted" : ""}`}>

        {/* ── HEADER ── */}
        <div className="adm-section adm-header">
          <div className="adm-header-left">
            <div className="adm-header-eyebrow">
              <span className="adm-eyebrow-dot" />
              Panneau de contrôle
            </div>
            <h1 className="adm-header-title">Administration</h1>
            <p className="adm-header-sub">Gestion des rôles, permissions et accès au logiciel</p>
          </div>
          <button className="adm-btn-primary" onClick={openAdd}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Ajouter un admin
          </button>
        </div>

        {/* ── STATS ── */}
        <div className="adm-stats">
          {[
            { label: "Comptes total",  value: stats.total,       color: "#388bfd" },
            { label: "Comptes actifs", value: stats.active,      color: "#3fb950" },
            { label: "Super Admins",   value: stats.superadmins, color: "#d29922" },
            { label: "En attente",     value: stats.pending,     color: "#f85149" },
          ].map((s, i) => (
            <div className="adm-stat" key={i}>
              <div className="adm-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="adm-stat-label">{s.label}</div>
              <div className="adm-stat-bar" style={{ background: s.color + "33" }}>
                <div className="adm-stat-fill" style={{ background: s.color, width: `${Math.min(100, (s.value / stats.total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="adm-section adm-tabs">
          {(["users", "roles"] as const).map(t => (
            <button key={t} className={`adm-tab ${activeTab === t ? "adm-tab-active" : ""}`} onClick={() => setActiveTab(t)}>
              {t === "users" ? "Utilisateurs" : "Rôles & Permissions"}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <>
            <div className="adm-section adm-filters">
              <div className="adm-search-wrap">
                <svg className="adm-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input className="adm-search" placeholder="Rechercher un admin…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="adm-role-filters">
                {(["all", "superadmin", "admin", "moderator", "viewer"] as const).map(r => (
                  <button key={r}
                    className={`adm-role-filter ${filterRole === r ? "adm-role-filter-active" : ""}`}
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

            <div className="adm-cards">
              {filtered.map((u, i) => (
                <div className="adm-card" key={u.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  {u.immutable && (
                    <div className="adm-immutable-badge">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Protégé
                    </div>
                  )}
                  <div className="adm-card-top">
                    <div className="adm-avatar" style={{
                      background: `linear-gradient(135deg, ${ROLE_META[u.role].color}22, ${ROLE_META[u.role].color}44)`,
                      border: `1px solid ${ROLE_META[u.role].border}`,
                      color: ROLE_META[u.role].color,
                    }}>
                      {u.avatar}
                      <span className="adm-avatar-dot" style={{ background: STATUS_META[u.status].dot }} />
                    </div>
                    <div className="adm-card-info">
                      <div className="adm-card-name">{u.name}</div>
                      <div className="adm-card-email">{u.email}</div>
                      <div className="adm-card-badges">
                        <span className="adm-role-badge" style={{ color: ROLE_META[u.role].color, background: ROLE_META[u.role].bg, border: `1px solid ${ROLE_META[u.role].border}` }}>
                          {ROLE_META[u.role].label}
                        </span>
                        <span className="adm-status-badge" style={{ color: STATUS_META[u.status].color }}>
                          <span style={{ background: STATUS_META[u.status].dot }} className="adm-status-dot" />
                          {STATUS_META[u.status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="adm-card-meta">
                    <div className="adm-meta-item">
                      <span className="adm-meta-label">Créé le</span>
                      <span className="adm-meta-val">{u.createdAt}</span>
                    </div>
                    <div className="adm-meta-sep" />
                    <div className="adm-meta-item">
                      <span className="adm-meta-label">Dernière connexion</span>
                      <span className="adm-meta-val">{u.lastLogin}</span>
                    </div>
                    <div className="adm-meta-sep" />
                    <div className="adm-meta-item">
                      <span className="adm-meta-label">Permissions</span>
                      <span className="adm-meta-val" style={{ color: "#388bfd" }}>{u.permissions.length} / {ALL_PERMISSIONS.length}</span>
                    </div>
                  </div>
                  <div className="adm-perm-preview">
                    {(["gestion","acces","securite","systeme"] as const).map(cat => {
                      const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat);
                      const owned = catPerms.filter(p => u.permissions.includes(p.id)).length;
                      const pct = (owned / catPerms.length) * 100;
                      return (
                        <div key={cat} className="adm-perm-bar-row">
                          <span className="adm-perm-cat">{CAT_LABELS[cat]}</span>
                          <div className="adm-perm-track">
                            <div className="adm-perm-fill" style={{ width: `${pct}%`, background: pct === 100 ? "#3fb950" : pct > 50 ? "#388bfd" : pct > 0 ? "#d29922" : "#21262d" }} />
                          </div>
                          <span className="adm-perm-count">{owned}/{catPerms.length}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="adm-card-actions">
                    <button className="adm-action-btn" onClick={() => openPermissions(u)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Permissions
                    </button>
                    {!u.immutable && (
                      <>
                        <button className="adm-action-btn" onClick={() => openEdit(u)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Modifier
                        </button>
                        <button className="adm-action-btn adm-action-danger" onClick={() => openDelete(u)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          Supprimer
                        </button>
                      </>
                    )}
                    {u.immutable && (
                      <div className="adm-action-locked">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                        Compte protégé — non modifiable
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="adm-empty">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#21262d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <span>Aucun résultat pour cette recherche</span>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "roles" && (
          <div className="adm-roles-grid">
            {(["superadmin", "admin", "moderator", "viewer"] as Role[]).map(role => (
              <div className="adm-role-card" key={role} style={{ borderColor: ROLE_META[role].border }}>
                <div className="adm-role-card-header" style={{ background: ROLE_META[role].bg }}>
                  <div className="adm-role-icon" style={{ color: ROLE_META[role].color }}>
                    {role === "superadmin" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                    {role === "admin" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                    {role === "moderator" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>}
                    {role === "viewer" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </div>
                  <div>
                    <div className="adm-role-card-name" style={{ color: ROLE_META[role].color }}>{ROLE_META[role].label}</div>
                    <div className="adm-role-card-count">{users.filter(u => u.role === role).length} utilisateur(s)</div>
                  </div>
                  {role === "superadmin" && (
                    <div className="adm-role-immutable-tag">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Accès total
                    </div>
                  )}
                </div>
                <div className="adm-role-perms">
                  {(["gestion","acces","securite","systeme"] as const).map(cat => {
                    const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat);
                    const granted = catPerms.filter(p => ROLE_PERMISSIONS[role].includes(p.id));
                    if (granted.length === 0) return null;
                    return (
                      <div key={cat} className="adm-role-cat">
                        <div className="adm-role-cat-label">{CAT_LABELS[cat]}</div>
                        <div className="adm-role-perm-list">
                          {granted.map(p => (
                            <div key={p.id} className="adm-role-perm-item">
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
          <div className="adm-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            {(modal === "add" || modal === "edit") && (
              <div className="adm-modal">
                <div className="adm-modal-header">
                  <div className="adm-modal-title">{modal === "add" ? "Ajouter un administrateur" : "Modifier le compte"}</div>
                  <button className="adm-modal-close" onClick={closeModal}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </div>
                <div className="adm-modal-body">
                  <div className="adm-field">
                    <label className="adm-label">Nom complet</label>
                    <input className="adm-input" placeholder="Prénom Nom" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Adresse email</label>
                    <input className="adm-input" type="email" placeholder="email@nova.app" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Rôle</label>
                    <div className="adm-role-picker">
                      {(["admin", "moderator", "viewer"] as Role[]).map(r => (
                        <button key={r} className={`adm-role-pick ${form.role === r ? "adm-role-pick-active" : ""}`}
                          onClick={() => setForm(f => ({...f, role: r}))}
                          style={form.role === r ? { color: ROLE_META[r].color, background: ROLE_META[r].bg, borderColor: ROLE_META[r].border } : {}}>
                          {ROLE_META[r].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Statut</label>
                    <div className="adm-role-picker">
                      {(["active", "suspended", "pending"] as Status[]).map(s => (
                        <button key={s} className={`adm-role-pick ${form.status === s ? "adm-role-pick-active" : ""}`}
                          onClick={() => setForm(f => ({...f, status: s}))}
                          style={form.status === s ? { color: STATUS_META[s].color, borderColor: STATUS_META[s].color + "55", background: STATUS_META[s].color + "11" } : {}}>
                          {STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="adm-modal-note">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#388bfd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                    Les permissions seront initialisées selon le rôle choisi. Vous pourrez les affiner ensuite.
                  </div>
                </div>
                <div className="adm-modal-footer">
                  <button className="adm-btn-ghost" onClick={closeModal}>Annuler</button>
                  <button className="adm-btn-primary" onClick={modal === "add" ? handleAdd : handleEdit}>{modal === "add" ? "Créer le compte" : "Enregistrer"}</button>
                </div>
              </div>
            )}

            {modal === "delete" && selected && (
              <div className="adm-modal adm-modal-sm">
                <div className="adm-modal-header">
                  <div className="adm-modal-title" style={{ color: "#f85149" }}>Supprimer le compte</div>
                  <button className="adm-modal-close" onClick={closeModal}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </div>
                <div className="adm-modal-body">
                  <div className="adm-delete-warning">
                    <div className="adm-delete-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
                    </div>
                    <p>Vous êtes sur le point de supprimer définitivement le compte de <strong>{selected.name}</strong>. Cette action est irréversible.</p>
                  </div>
                </div>
                <div className="adm-modal-footer">
                  <button className="adm-btn-ghost" onClick={closeModal}>Annuler</button>
                  <button className="adm-btn-danger" onClick={handleDelete}>Confirmer la suppression</button>
                </div>
              </div>
            )}

            {modal === "permissions" && selected && (
              <div className="adm-modal adm-modal-lg">
                <div className="adm-modal-header">
                  <div>
                    <div className="adm-modal-title">Permissions — {selected.name}</div>
                    <div className="adm-modal-sub">
                      <span className="adm-role-badge" style={{ color: ROLE_META[selected.role].color, background: ROLE_META[selected.role].bg, border: `1px solid ${ROLE_META[selected.role].border}` }}>{ROLE_META[selected.role].label}</span>
                      {selected.role === "superadmin" && <span className="adm-modal-locked-note">Permissions verrouillées — Super Admin</span>}
                    </div>
                  </div>
                  <button className="adm-modal-close" onClick={closeModal}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </div>
                <div className="adm-modal-body">
                  {(["gestion","acces","securite","systeme"] as const).map(cat => (
                    <div key={cat} className="adm-perm-group">
                      <div className="adm-perm-group-label">{CAT_LABELS[cat]}</div>
                      <div className="adm-perm-items">
                        {ALL_PERMISSIONS.filter(p => p.category === cat).map(p => {
                          const on = editPerms.includes(p.id);
                          const locked = selected.role === "superadmin";
                          return (
                            <div key={p.id} className={`adm-perm-item ${on ? "adm-perm-on" : ""} ${locked ? "adm-perm-locked" : ""}`} onClick={() => togglePerm(p.id)}>
                              <div className={`adm-perm-check ${on ? "adm-perm-check-on" : ""}`}>
                                {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                              </div>
                              <div className="adm-perm-text">
                                <div className="adm-perm-name">{p.label}</div>
                                <div className="adm-perm-desc">{p.description}</div>
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
                  <div className="adm-modal-footer">
                    <button className="adm-btn-ghost" onClick={closeModal}>Annuler</button>
                    <button className="adm-btn-primary" onClick={handleSavePermissions}>Enregistrer les permissions</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {toast && (
          <div className={`adm-toast adm-toast-${toast.type}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {toast.type === "red" ? <><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></> : <><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></>}
            </svg>
            {toast.msg}
          </div>
        )}

      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

/* ── ROOT : pleine largeur, pas de max-width ── */
.adm-root {
  width: 100%;
  min-height: 100%;
  background: #090c10;
  color: #e6edf3;
  font-family: 'IBM Plex Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  opacity: 0;
  transition: opacity .4s ease;
  box-sizing: border-box;
}
.adm-root.adm-mounted { opacity: 1; }

/* Section padding uniforme — s'applique aux blocs inline */
.adm-section {
  padding-left: 40px;
  padding-right: 40px;
}

/* ── HEADER ── */
.adm-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 36px;
  padding-bottom: 28px;
  border-bottom: 1px solid #161b22;
  margin-bottom: 0;
}
.adm-header-eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: #388bfd; margin-bottom: 8px;
}
.adm-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #388bfd; box-shadow: 0 0 6px #388bfd;
  animation: admPulse 2s ease-in-out infinite;
}
@keyframes admPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.adm-header-title {
  font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800;
  letter-spacing: -1px; color: #e6edf3; margin-bottom: 4px;
}
.adm-header-sub { font-size: 12px; color: #484f58; font-weight: 300; }

/* ── STATS : pleine largeur avec grille fluide ── */
.adm-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #161b22;
  border-bottom: 1px solid #161b22;
  width: 100%;
}
.adm-stat {
  background: #0d1117; padding: 24px 40px;
  display: flex; flex-direction: column; gap: 4px;
}
.adm-stat-value { font-family:'Syne',sans-serif; font-size:30px; font-weight:700; line-height:1; }
.adm-stat-label { font-size:11px; color:#484f58; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
.adm-stat-bar { height:2px; }
.adm-stat-fill { height:100%; transition:width .6s cubic-bezier(.4,0,.2,1); }

/* ── TABS ── */
.adm-tabs {
  display: flex;
  border-bottom: 1px solid #161b22;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.adm-tab {
  padding: 14px 20px; font-size: 12px; font-weight: 500; letter-spacing: .5px;
  color: #484f58; background: transparent; border: none;
  border-bottom: 2px solid transparent; cursor: pointer; transition: all .2s;
  font-family: 'IBM Plex Sans', sans-serif; margin-bottom: -1px;
}
.adm-tab:hover { color: #8b949e; }
.adm-tab-active { color: #e6edf3 !important; border-bottom-color: #388bfd; }

/* ── FILTERS ── */
.adm-filters {
  display: flex; align-items: center; gap: 16px;
  padding: 20px 40px; border-bottom: 1px solid #161b22;
  flex-wrap: wrap; width: 100%; box-sizing: border-box;
}
.adm-search-wrap { position: relative; flex: 1; min-width: 200px; }
.adm-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #484f58; pointer-events: none; }
.adm-search {
  width: 100%; background: #0d1117; border: 1px solid #21262d;
  color: #e6edf3; font-family: 'IBM Plex Mono', monospace; font-size: 12px;
  padding: 9px 12px 9px 34px; outline: none; transition: border-color .2s;
}
.adm-search:focus { border-color: #388bfd; }
.adm-search::placeholder { color: #30363d; }
.adm-role-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.adm-role-filter {
  padding: 6px 12px; font-size: 11px; font-weight: 500;
  background: #0d1117; border: 1px solid #21262d; color: #484f58;
  cursor: pointer; transition: all .15s; font-family: 'IBM Plex Sans', sans-serif;
}
.adm-role-filter:hover { color: #8b949e; border-color: #30363d; }
.adm-role-filter-active { color: #e6edf3 !important; }

/* ── CARDS : grille qui remplit toute la largeur ── */
.adm-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1px;
  background: #161b22;
  width: 100%;
}
.adm-card {
  background: #0d1117; padding: 24px 28px;
  position: relative; display: flex; flex-direction: column; gap: 16px;
  animation: admFadeIn .4s ease both; transition: background .2s;
  box-sizing: border-box;
}
.adm-card:hover { background: #0e1218; }
@keyframes admFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

.adm-immutable-badge {
  position: absolute; top: 14px; right: 14px;
  display: flex; align-items: center; gap: 5px;
  font-family: 'IBM Plex Mono', monospace; font-size: 9px;
  letter-spacing: 1px; text-transform: uppercase;
  color: #d29922; background: rgba(210,153,34,.08); border: 1px solid rgba(210,153,34,.2); padding: 3px 8px;
}
.adm-card-top { display: flex; gap: 14px; align-items: flex-start; }
.adm-avatar {
  width: 46px; height: 46px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; position: relative;
}
.adm-avatar-dot {
  position: absolute; bottom: 2px; right: 2px;
  width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid #0d1117;
}
.adm-card-info { flex: 1; min-width: 0; }
.adm-card-name { font-size: 14px; font-weight: 600; color: #e6edf3; margin-bottom: 2px; }
.adm-card-email { font-family:'IBM Plex Mono',monospace; font-size: 11px; color: #484f58; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.adm-card-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.adm-role-badge { font-family:'IBM Plex Mono',monospace; font-size: 9px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; padding: 2px 8px; }
.adm-status-badge { display: flex; align-items: center; gap: 5px; font-size: 10px; }
.adm-status-dot { width: 5px; height: 5px; border-radius: 50%; }

.adm-card-meta { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid #161b22; border-bottom: 1px solid #161b22; }
.adm-meta-item { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.adm-meta-label { font-size: 9px; text-transform: uppercase; letter-spacing: .5px; color: #30363d; }
.adm-meta-val { font-family:'IBM Plex Mono',monospace; font-size: 10px; color: #8b949e; }
.adm-meta-sep { width: 1px; height: 28px; background: #161b22; }

.adm-perm-preview { display: flex; flex-direction: column; gap: 6px; }
.adm-perm-bar-row { display: flex; align-items: center; gap: 8px; }
.adm-perm-cat { font-size: 9px; text-transform: uppercase; letter-spacing: .5px; color: #30363d; width: 56px; flex-shrink: 0; }
.adm-perm-track { flex: 1; height: 2px; background: #161b22; }
.adm-perm-fill { height: 100%; transition: width .5s cubic-bezier(.4,0,.2,1); }
.adm-perm-count { font-family:'IBM Plex Mono',monospace; font-size: 9px; color: #484f58; width: 24px; text-align: right; flex-shrink: 0; }

.adm-card-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.adm-action-btn {
  display: flex; align-items: center; gap: 5px; padding: 6px 12px;
  font-size: 11px; font-weight: 500; background: #161b22; border: 1px solid #21262d;
  color: #8b949e; cursor: pointer; transition: all .15s; font-family: 'IBM Plex Sans', sans-serif;
}
.adm-action-btn:hover { color: #e6edf3; border-color: #30363d; background: #1c2330; }
.adm-action-danger:hover { color: #f85149 !important; border-color: rgba(248,81,73,.3) !important; background: rgba(248,81,73,.06) !important; }
.adm-action-locked { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #30363d; font-family:'IBM Plex Mono',monospace; }

.adm-empty { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 80px; color: #30363d; font-size: 13px; }

/* ── ROLES : 4 colonnes fixes sur grands écrans ── */
.adm-roles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #161b22;
  width: 100%;
}
.adm-role-card { background: #0d1117; border: 1px solid transparent; display: flex; flex-direction: column; animation: admFadeIn .4s ease both; }
.adm-role-card-header { display: flex; align-items: center; gap: 14px; padding: 20px 24px; position: relative; }
.adm-role-icon { display: flex; align-items: center; justify-content: center; }
.adm-role-card-name { font-family:'Syne',sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 2px; }
.adm-role-card-count { font-size: 10px; color: #484f58; font-family:'IBM Plex Mono',monospace; }
.adm-role-immutable-tag {
  position: absolute; right: 12px; top: 12px;
  display: flex; align-items: center; gap: 5px;
  font-family:'IBM Plex Mono',monospace; font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
  color: #d29922; background: rgba(210,153,34,.08); border: 1px solid rgba(210,153,34,.2); padding: 3px 8px;
}
.adm-role-perms { padding: 16px 24px; display: flex; flex-direction: column; gap: 14px; flex: 1; }
.adm-role-cat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #30363d; margin-bottom: 6px; font-family:'IBM Plex Mono',monospace; }
.adm-role-perm-list { display: flex; flex-direction: column; gap: 4px; }
.adm-role-perm-item { display: flex; align-items: center; gap: 7px; font-size: 11px; color: #8b949e; }

/* ── OVERLAY + MODAL ── */
.adm-overlay {
  position: fixed; inset: 0; background: rgba(9,12,16,.8); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  animation: admFadeIn .2s ease;
}
.adm-modal {
  background: #0d1117; border: 1px solid #21262d; width: 100%; max-width: 480px;
  max-height: 88vh; display: flex; flex-direction: column;
  animation: admSlideUp .25s cubic-bezier(.4,0,.2,1);
}
.adm-modal-sm { max-width: 380px; }
.adm-modal-lg { max-width: 620px; }
@keyframes admSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.adm-modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid #161b22; flex-shrink: 0; }
.adm-modal-title { font-family:'Syne',sans-serif; font-size: 17px; font-weight: 700; color: #e6edf3; margin-bottom: 6px; }
.adm-modal-sub { display: flex; align-items: center; gap: 10px; }
.adm-modal-locked-note { font-family:'IBM Plex Mono',monospace; font-size: 10px; color: #484f58; }
.adm-modal-close { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: #161b22; border: 1px solid #21262d; color: #484f58; cursor: pointer; transition: all .15s; flex-shrink: 0; }
.adm-modal-close:hover { color: #e6edf3; border-color: #30363d; }
.adm-modal-body { padding: 20px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; flex: 1; }
.adm-modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #161b22; flex-shrink: 0; }
.adm-modal-note { display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: #484f58; background: #090c10; border: 1px solid #161b22; padding: 10px 12px; line-height: 1.6; }

.adm-field { display: flex; flex-direction: column; gap: 7px; }
.adm-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; color: #484f58; }
.adm-input { background: #090c10; border: 1px solid #21262d; color: #e6edf3; font-family:'IBM Plex Mono',monospace; font-size: 12px; padding: 10px 12px; outline: none; transition: border-color .2s; width: 100%; }
.adm-input:focus { border-color: #388bfd; }
.adm-input::placeholder { color: #30363d; }
.adm-role-picker { display: flex; gap: 6px; flex-wrap: wrap; }
.adm-role-pick { padding: 6px 14px; font-size: 11px; font-weight: 500; background: #090c10; border: 1px solid #21262d; color: #484f58; cursor: pointer; transition: all .15s; font-family:'IBM Plex Sans',sans-serif; }
.adm-role-pick:hover { color: #8b949e; border-color: #30363d; }

.adm-perm-group { display: flex; flex-direction: column; gap: 8px; }
.adm-perm-group-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #30363d; font-family:'IBM Plex Mono',monospace; padding-bottom: 6px; border-bottom: 1px solid #161b22; }
.adm-perm-items { display: flex; flex-direction: column; gap: 4px; }
.adm-perm-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border: 1px solid transparent; cursor: pointer; transition: all .15s; background: #090c10; }
.adm-perm-item:hover:not(.adm-perm-locked) { border-color: #21262d; background: #0d1117; }
.adm-perm-on { border-color: #388bfd22 !important; background: #388bfd08 !important; }
.adm-perm-locked { cursor: default; opacity: .6; }
.adm-perm-check { width: 15px; height: 15px; flex-shrink: 0; border: 1px solid #21262d; background: #090c10; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.adm-perm-check-on { background: #388bfd; border-color: #388bfd; }
.adm-perm-text { flex: 1; min-width: 0; }
.adm-perm-name { font-size: 12px; color: #c9d1d9; margin-bottom: 1px; }
.adm-perm-desc { font-size: 10px; color: #484f58; font-family:'IBM Plex Mono',monospace; }

.adm-delete-warning { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; padding: 8px 0; }
.adm-delete-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: rgba(248,81,73,.06); border: 1px solid rgba(248,81,73,.2); }
.adm-delete-warning p { font-size: 13px; color: #8b949e; line-height: 1.7; }
.adm-delete-warning strong { color: #e6edf3; }

.adm-btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: #388bfd; border: none; color: #fff; font-family:'IBM Plex Sans',sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; letter-spacing: .3px; }
.adm-btn-primary:hover { background: #58a6ff; transform: translateY(-1px); }
.adm-btn-ghost { padding: 10px 18px; background: transparent; border: 1px solid #21262d; color: #8b949e; font-family:'IBM Plex Sans',sans-serif; font-size: 12px; cursor: pointer; transition: all .15s; }
.adm-btn-ghost:hover { border-color: #30363d; color: #e6edf3; }
.adm-btn-danger { padding: 10px 18px; background: rgba(248,81,73,.1); border: 1px solid rgba(248,81,73,.3); color: #f85149; font-family:'IBM Plex Sans',sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
.adm-btn-danger:hover { background: rgba(248,81,73,.2); }

.adm-toast { position: fixed; bottom: 28px; right: 28px; display: flex; align-items: center; gap: 9px; padding: 11px 18px; border: 1px solid; font-family:'IBM Plex Mono',monospace; font-size: 11px; animation: admSlideUp .3s ease, admFadeOut .3s ease 2.9s both; z-index: 2000; backdrop-filter: blur(4px); }
.adm-toast-green { color: #3fb950; background: rgba(63,185,80,.08); border-color: rgba(63,185,80,.25); }
.adm-toast-red   { color: #f85149; background: rgba(248,81,73,.08); border-color: rgba(248,81,73,.25); }
.adm-toast-amber { color: #d29922; background: rgba(210,153,34,.08); border-color: rgba(210,153,34,.25); }
@keyframes admFadeOut { to{opacity:0;transform:translateY(6px)} }

/* ── RESPONSIVE ── */
@media (max-width: 1400px) {
  .adm-roles-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .adm-stats { grid-template-columns: repeat(2, 1fr); }
  .adm-roles-grid { grid-template-columns: 1fr; }
  .adm-section, .adm-filters { padding-left: 20px; padding-right: 20px; }
  .adm-stat { padding: 20px; }
  .adm-cards { grid-template-columns: 1fr; }
  .adm-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
@media (max-width: 480px) {
  .adm-section, .adm-filters { padding-left: 16px; padding-right: 16px; }
  .adm-stat { padding: 16px; }
}
`;