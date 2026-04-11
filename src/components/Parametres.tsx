import { useState } from "react";
import {
  FiSettings,
  FiShield,
  FiBell,
  FiCreditCard,
  FiCpu,
  FiRefreshCw,
  FiDownload,
  FiSave,
  FiPlus,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiLock,
  FiHardDrive,
  FiGlobe,
  FiUsers,
  FiKey,
  FiZap,
  FiActivity,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiMail,
  FiServer,
  FiTerminal,
  FiCopy,
  FiUpload,
} from 'react-icons/fi';

// Types
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SettingsState {
  platformName: string;
  contactEmail: string;
  supportEmail: string;
  timezone: string;
  language: string;
  dateFormat: string;
  twoFactorAuth: boolean;
  sessionTimeout: string;
  passwordPolicy: string;
  maxLoginAttempts: number;
  emailNotifications: boolean;
  slackWebhook: string;
  discordWebhook: string;
  notifyPayment: boolean;
  notifySignup: boolean;
  notifySystem: boolean;
  notifyExpiry: boolean;
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  compactMode: boolean;
  showAvatars: boolean;
  companyName: string;
  vatNumber: string;
  address: string;
  billingEmail: string;
  autoInvoice: boolean;
  apiEnabled: boolean;
  rateLimit: number;
  webhookUrl: string;
  allowCors: boolean;
  autoSync: boolean;
}

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  timestamp: string;
  message: string;
}

interface Role {
  name: string;
  users: number;
  permissions: string;
  color: string;
}

interface IcoProps {
  icon: React.ElementType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface ToggleProps {
  on: boolean;
  onChange: () => void;
  label?: string;
}

interface FieldProps {
  label: string;
  desc?: string;
  children: React.ReactNode;
}

interface CardProps {
  title: string;
  icon?: React.ElementType;
  sub?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

interface InfoBannerProps {
  type: 'blue' | 'amber' | 'green' | 'red';
  title?: string;
  text: string;
}

interface TabProps {
  s: SettingsState;
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  notify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

interface TabWithoutStateProps {
  notify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

interface ParametresProps {
  onNotify?: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

// Icons Component
function Ico({ icon: Icon, size = 14, className = "", style = {} }: IcoProps) {
  return <Icon size={size} className={className} style={style} />;
}

// Toggle Component
function Toggle({ on, onChange, label = "" }: ToggleProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-[34px] h-[19px] bg-[#1c2330] border border-[#21262d] relative cursor-pointer flex-shrink-0 transition-colors duration-200 ${on ? "!bg-[#388bfd] !border-[#388bfd]" : ""}`} onClick={onChange}>
        <div className={`absolute top-0.5 left-0.5 w-[13px] h-[13px] bg-[#8b949e] transition-transform duration-200 ${on ? "translate-x-[15px] bg-white" : ""}`} />
      </div>
      {label && <span className="text-[12.5px] text-[#e6edf3] select-none">{label}</span>}
    </div>
  );
}

// Field Component
function Field({ label, desc = "", children }: FieldProps) {
  return (
    <div className="grid grid-cols-[220px_1fr] gap-5 py-3 px-5 border-b border-[#21262d] items-center max-[768px]:grid-cols-1 max-[768px]:gap-2">
      <div>
        <div className="text-[12.5px] font-medium text-[#8b949e]">{label}</div>
        {desc && <div className="text-[11px] text-[#484f58] mt-0.5">{desc}</div>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// Card Component
function Card({ title, icon: Icon, sub = "", children, actions = null }: CardProps) {
  return (
    <div className="bg-[#0d1117] border border-[#21262d] mb-4 animate-[pmEnter_0.25s_cubic-bezier(0.4,0,0.2,1)_both]">
      <div className="px-5 py-3.5 border-b border-[#21262d] flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold flex items-center gap-2">
            {Icon && <Ico icon={Icon} size={14} />}
            {title}
          </div>
          {sub && <div className="text-[11px] text-[#484f58] mt-0.5">{sub}</div>}
        </div>
        {actions}
      </div>
      <div className="pm-card-body">{children}</div>
    </div>
  );
}

// Info Banner Component
function InfoBanner({ type = "blue", title, text }: InfoBannerProps) {
  const iconMap = {
    blue: FiInfo,
    amber: FiAlertCircle,
    green: FiCheck,
    red: FiAlertCircle
  };
  const Icon = iconMap[type];
  const colors = {
    blue: { bg: "bg-[rgba(56,139,253,0.08)]", border: "border-l-[#388bfd]" },
    amber: { bg: "bg-[rgba(210,153,34,0.08)]", border: "border-l-[#d29922]" },
    green: { bg: "bg-[rgba(57,211,83,0.08)]", border: "border-l-[#3fb950]" },
    red: { bg: "bg-[rgba(248,81,73,0.08)]", border: "border-l-[#f85149]" }
  };

  return (
    <div className={`flex items-start gap-2.5 p-3 my-3 mx-5 border-l-2 ${colors[type].bg} ${colors[type].border}`}>
      <Ico icon={Icon} size={14} style={{ color: `var(--${type})` }} />
      <div>
        {title && <div className="text-xs font-semibold mb-0.5" style={{ color: `var(--${type})` }}>{title}</div>}
        <div className="text-xs text-[#8b949e]">{text}</div>
      </div>
    </div>
  );
}

// Navigation
const NAV: NavGroup[] = [
  { group: "Plateforme", items: [
    { id: "general", label: "Général", icon: FiSettings },
    { id: "appearance", label: "Apparence", icon: FiBell },
    { id: "notifications", label: "Notifications", icon: FiBell, badge: "3" },
  ]},
  { group: "Sécurité & Accès", items: [
    { id: "security", label: "Sécurité", icon: FiShield },
    { id: "roles", label: "Rôles & Permissions", icon: FiUsers },
    { id: "api", label: "API & Webhooks", icon: FiCpu },
  ]},
  { group: "Système", items: [
    { id: "sync", label: "Synchronisation", icon: FiRefreshCw },
    { id: "backup", label: "Sauvegardes", icon: FiHardDrive },
    { id: "billing", label: "Facturation", icon: FiCreditCard },
    { id: "logs", label: "Logs & Diagnostic", icon: FiActivity },
    { id: "advanced", label: "Avancé", icon: FiTerminal },
  ]},
];

// Tab Components
function TabGeneral({ s, set, notify }: TabProps) {
  return (
    <>
      <Card title="Informations générales" icon={FiSettings}>
        <Field label="Nom de la plateforme">
          <input className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd]" value={s.platformName} onChange={e => set("platformName", e.target.value)} />
        </Field>
        <Field label="Email de contact">
          <input className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd]" type="email" value={s.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
        </Field>
        <Field label="Email support">
          <input className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd]" type="email" value={s.supportEmail} onChange={e => set("supportEmail", e.target.value)} />
        </Field>
      </Card>
      <Card title="Localisation" icon={FiGlobe}>
        <Field label="Fuseau horaire">
          <select className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none" value={s.timezone} onChange={e => set("timezone", e.target.value)}>
            {["Europe/Paris", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo"].map(tz => <option key={tz}>{tz}</option>)}
          </select>
        </Field>
        <Field label="Langue">
          <select className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none" value={s.language} onChange={e => set("language", e.target.value)}>
            <option value="fr">Français</option><option value="en">English</option><option value="es">Español</option>
          </select>
        </Field>
        <Field label="Format de date">
          <select className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none" value={s.dateFormat} onChange={e => set("dateFormat", e.target.value)}>
            {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map(f => <option key={f}>{f}</option>)}
          </select>
        </Field>
        <div className="flex justify-end gap-2 p-4 pt-3 border-t border-[#21262d] bg-[#090c10]">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Annulé", "amber")}>Annuler</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Paramètres généraux sauvegardés", "green")}>
            <Ico icon={FiSave} size={12} /> Sauvegarder
          </button>
        </div>
      </Card>
    </>
  );
}

function TabAppearance({ s, set, notify }: TabProps) {
  return (
    <Card title="Thème et affichage" icon={FiBell}>
      <Field label="Thème" desc="Apparence globale de l'interface">
        <select className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none" value={s.theme} onChange={e => set("theme", e.target.value as SettingsState['theme'])}>
          <option value="dark">Sombre</option><option value="light">Clair</option><option value="system">Système</option>
        </select>
      </Field>
      <Field label="Couleur d'accentuation" desc="Teinte principale des éléments actifs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 border border-[#21262d] cursor-pointer relative" style={{ background: s.accentColor }}>
            <input type="color" value={s.accentColor} onChange={e => set("accentColor", e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          </div>
          <span className="font-mono text-xs text-[#8b949e]">{s.accentColor}</span>
        </div>
      </Field>
      <Field label="Mode compact" desc="Réduit l'espacement des éléments">
        <Toggle on={s.compactMode} onChange={() => set("compactMode", !s.compactMode)} label={s.compactMode ? "Activé" : "Désactivé"} />
      </Field>
      <Field label="Afficher les avatars" desc="Initiales ou photos de profil">
        <Toggle on={s.showAvatars} onChange={() => set("showAvatars", !s.showAvatars)} label={s.showAvatars ? "Activé" : "Désactivé"} />
      </Field>
      <div className="flex justify-end gap-2 p-4 pt-3 border-t border-[#21262d] bg-[#090c10]">
        <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Apparence mise à jour", "green")}>
          <Ico icon={FiSave} size={12} /> Sauvegarder
        </button>
      </div>
    </Card>
  );
}

function TabNotifications({ s, set, notify }: TabProps) {
  return (
    <>
      <Card title="Canaux de notification" icon={FiBell}>
        <Field label="Notifications email" desc="Alertes envoyées par email">
          <Toggle on={s.emailNotifications} onChange={() => set("emailNotifications", !s.emailNotifications)} label={s.emailNotifications ? "Activé" : "Désactivé"} />
        </Field>
        <Field label="Webhook Slack" desc="URL d'intégration Slack">
          <input className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 font-mono text-xs text-[#e6edf3] outline-none focus:border-[#388bfd]" placeholder="https://hooks.slack.com/services/…" value={s.slackWebhook} onChange={e => set("slackWebhook", e.target.value)} />
        </Field>
        <Field label="Webhook Discord" desc="URL d'intégration Discord">
          <input className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 font-mono text-xs text-[#e6edf3] outline-none focus:border-[#388bfd]" placeholder="https://discord.com/api/webhooks/…" value={s.discordWebhook} onChange={e => set("discordWebhook", e.target.value)} />
        </Field>
      </Card>
      <Card title="Événements déclencheurs" icon={FiZap}>
        <Field label="Paiement reçu"><Toggle on={s.notifyPayment} onChange={() => set("notifyPayment", !s.notifyPayment)} label={s.notifyPayment ? "Activé" : "Désactivé"} /></Field>
        <Field label="Nouvelle inscription"><Toggle on={s.notifySignup} onChange={() => set("notifySignup", !s.notifySignup)} label={s.notifySignup ? "Activé" : "Désactivé"} /></Field>
        <Field label="Anomalie système"><Toggle on={s.notifySystem} onChange={() => set("notifySystem", !s.notifySystem)} label={s.notifySystem ? "Activé" : "Désactivé"} /></Field>
        <Field label="Expiration de licence" desc="Alerte 30 jours avant expiration"><Toggle on={s.notifyExpiry} onChange={() => set("notifyExpiry", !s.notifyExpiry)} label={s.notifyExpiry ? "Activé" : "Désactivé"} /></Field>
        <div className="flex justify-end gap-2 p-4 pt-3 border-t border-[#21262d] bg-[#090c10]">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Test envoyé sur Slack", "blue")}><Ico icon={FiZap} size={12} /> Tester</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Notifications sauvegardées", "green")}><Ico icon={FiSave} size={12} /> Sauvegarder</button>
        </div>
      </Card>
    </>
  );
}

function TabSecurity({ s, set, notify }: TabProps) {
  const [ipInput, setIpInput] = useState<string>("");
  const [ips, setIps] = useState<string[]>(["192.168.1.0/24", "10.0.0.1"]);

  return (
    <>
      <Card title="Authentification" icon={FiShield}>
        <Field label="Double authentification (2FA)" desc="TOTP requis à chaque connexion">
          <Toggle on={s.twoFactorAuth} onChange={() => set("twoFactorAuth", !s.twoFactorAuth)} label={s.twoFactorAuth ? "Activé" : "Désactivé"} />
        </Field>
        <Field label="Durée de session" desc="Déconnexion automatique après inactivité">
          <select className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none" value={s.sessionTimeout} onChange={e => set("sessionTimeout", e.target.value)}>
            {["2", "4", "8", "12", "24"].map(h => <option key={h} value={h}>{h} heures</option>)}
          </select>
        </Field>
        <Field label="Politique mot de passe" desc="Complexité minimale exigée">
          <select className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none" value={s.passwordPolicy} onChange={e => set("passwordPolicy", e.target.value)}>
            <option value="basic">Basique (6 car.)</option><option value="medium">Moyen (8 car. + chiffre)</option><option value="strong">Fort (12 car. + symboles)</option>
          </select>
        </Field>
        <Field label="Tentatives max de connexion" desc="Avant blocage du compte">
          <input className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd]" type="number" min="3" max="20" value={s.maxLoginAttempts} onChange={e => set("maxLoginAttempts", parseInt(e.target.value))} />
        </Field>
      </Card>

      <Card title="Restriction d'accès IP" icon={FiLock} sub="Seules ces plages IP peuvent accéder au dashboard">
        <div className="flex flex-wrap gap-1.5 p-3.5 border-b border-[#21262d]">
          {ips.map(ip => (
            <div key={ip} className="flex items-center gap-1.5 bg-[#161b22] border border-[#21262d] px-2.5 py-1 font-mono text-xs text-[#8b949e]">
              {ip}
              <button onClick={() => setIps(ips.filter(i => i !== ip))} className="bg-none border-none text-[#484f58] cursor-pointer flex items-center transition-colors hover:text-[#f85149]"><Ico icon={FiX} size={10} /></button>
            </div>
          ))}
          {ips.length === 0 && <span className="text-xs text-[#484f58]">Aucune restriction — accès depuis toutes les IP</span>}
        </div>
        <div className="flex gap-2 p-3 border-b border-[#21262d]">
          <input className="bg-[#090c10] border border-[#21262d] px-3 py-1.5 font-mono text-xs text-[#e6edf3] outline-none focus:border-[#388bfd] max-w-[220px]" placeholder="192.168.1.0/24" value={ipInput} onChange={e => setIpInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && ipInput) { setIps([...ips, ipInput]); setIpInput(""); }}} />
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => { if (ipInput) { setIps([...ips, ipInput]); setIpInput(""); }}}>
            <Ico icon={FiPlus} size={12} /> Ajouter
          </button>
        </div>
        <div className="flex justify-end gap-2 p-4 pt-3 border-t border-[#21262d] bg-[#090c10]">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Paramètres sécurité sauvegardés", "green")}><Ico icon={FiSave} size={12} /> Sauvegarder</button>
        </div>
      </Card>

      <Card title="Clés USB autorisées" icon={FiServer} sub="Authentification matérielle par clé USB">
        {[
          { id: "USB-A3F2B1", name: "Clé Licence Principale", lastUsed: "Aujourd'hui 14:23" },
          { id: "USB-D7E5F3", name: "Clé Admin Backup", lastUsed: "15 Jan 2026" },
        ].map(usb => (
          <div key={usb.id} className="flex items-center justify-between p-2.5 px-5 border-b border-[#21262d] hover:bg-[#161b22] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-[#161b22] border border-[#21262d] flex items-center justify-center text-[#8b949e] flex-shrink-0"><Ico icon={FiServer} size={14} /></div>
              <div>
                <div className="text-[13px] font-medium">{usb.name}</div>
                <div className="text-[11px] text-[#484f58] font-mono">ID: {usb.id} · Dernière utilis. : {usb.lastUsed}</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:bg-[rgba(248,81,73,0.08)] hover:border-[rgba(248,81,73,0.25)] hover:text-[#f85149]" onClick={() => notify("Clé USB révoquée", "red")}><Ico icon={FiTrash2} size={11} /> Révoquer</button>
            </div>
          </div>
        ))}
        <div className="p-3 pt-2.5 border-t border-[#21262d]">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Branchez une clé USB pour l'enregistrer", "blue")}><Ico icon={FiPlus} size={12} /> Enregistrer une clé USB</button>
        </div>
      </Card>
    </>
  );
}

function TabRoles({ notify }: TabWithoutStateProps) {
  const roles: Role[] = [
    { name: "Super Admin", users: 1, permissions: "Accès total", color: "#f85149" },
    { name: "Administrateur", users: 3, permissions: "Tout sauf paramètres critiques", color: "#d29922" },
    { name: "Gestionnaire", users: 8, permissions: "Clients, abonnements, clés", color: "#388bfd" },
    { name: "Support", users: 5, permissions: "Lecture seule + commentaires", color: "#3fb950" },
    { name: "Lecture seule", users: 2, permissions: "Consultation uniquement", color: "#8b949e" },
  ];
  return (
    <Card title="Rôles & Permissions" icon={FiUsers} sub="Gestion des droits d'accès par rôle">
      {roles.map(r => (
        <div key={r.name} className="flex items-center justify-between p-2.5 px-5 border-b border-[#21262d] hover:bg-[#161b22] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#161b22] border border-[#21262d] flex items-center justify-center flex-shrink-0" style={{ borderColor: r.color + "40", color: r.color }}>
              <Ico icon={FiUsers} size={13} style={{ color: r.color }} />
            </div>
            <div>
              <div className="text-[13px] font-medium">{r.name}</div>
              <div className="text-[11px] text-[#484f58]">{r.permissions} · {r.users} utilisateur{r.users > 1 ? "s" : ""}</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify(`Édition du rôle ${r.name}`, "blue")}>Éditer</button>
          </div>
        </div>
      ))}
      <div className="p-3 pt-2.5 border-t border-[#21262d]">
        <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Créer un nouveau rôle", "blue")}><Ico icon={FiPlus} size={12} /> Créer un rôle</button>
      </div>
    </Card>
  );
}

function TabApi({ s, set, notify }: TabProps) {
  const [showKey, setShowKey] = useState<boolean>(false);
  return (
    <>
      <Card title="Configuration API" icon={FiCpu}>
        <Field label="API activée" desc="Active ou désactive l'accès API global">
          <Toggle on={s.apiEnabled} onChange={() => set("apiEnabled", !s.apiEnabled)} label={s.apiEnabled ? "Activée" : "Désactivée"} />
        </Field>
        <Field label="Rate limit" desc="Requêtes max par minute par clé">
          <input className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd]" type="number" value={s.rateLimit} onChange={e => set("rateLimit", parseInt(e.target.value))} />
        </Field>
        <Field label="Autoriser CORS" desc="Cross-Origin Resource Sharing">
          <Toggle on={s.allowCors} onChange={() => set("allowCors", !s.allowCors)} label={s.allowCors ? "Activé" : "Désactivé"} />
        </Field>
        <Field label="URL Webhook globale" desc="Recevra tous les événements plateforme">
          <input className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 font-mono text-xs text-[#e6edf3] outline-none focus:border-[#388bfd]" placeholder="https://…" value={s.webhookUrl} onChange={e => set("webhookUrl", e.target.value)} />
        </Field>
      </Card>
      <Card title="Clé API maître" icon={FiKey} sub="Clé d'accès super-admin pour intégrations critiques">
        <InfoBanner type="amber" title="Attention" text="Cette clé dispose d'un accès complet en lecture/écriture. Ne la divulguez jamais." />
        <Field label="Clé secrète">
          <div className="flex gap-2 items-center">
            <input className="bg-[#090c10] border border-[#21262d] px-3 py-1.5 font-mono text-xs text-[#e6edf3] outline-none focus:border-[#388bfd] max-w-[280px]" type={showKey ? "text" : "password"} readOnly value="sk_live_xK9mP2...4rQwBz8s" />
            <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => setShowKey(!showKey)}>
              {showKey ? <Ico icon={FiEyeOff} size={12} /> : <Ico icon={FiEye} size={12} />} {showKey ? "Masquer" : "Afficher"}
            </button>
            <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => { navigator.clipboard?.writeText("sk_live_xK9mP2...4rQwBz8s"); notify("Clé copiée", "green"); }}>
              <Ico icon={FiCopy} size={12} /> Copier
            </button>
          </div>
        </Field>
        <div className="flex justify-end gap-2 p-4 pt-3 border-t border-[#21262d] bg-[#090c10]">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:bg-[rgba(248,81,73,0.08)] hover:border-[rgba(248,81,73,0.25)] hover:text-[#f85149]" onClick={() => notify("Clé régénérée — ancienne clé invalidée", "red")}><Ico icon={FiRefreshCw} size={12} /> Régénérer</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Config API sauvegardée", "green")}><Ico icon={FiSave} size={12} /> Sauvegarder</button>
        </div>
      </Card>
    </>
  );
}

function TabSync({ s, set, notify }: TabProps) {
  const [syncing, setSyncing] = useState<boolean>(false);
  const [network, setNetwork] = useState<string>("wifi");

  return (
    <>
      <Card title="Configuration de synchronisation" icon={FiRefreshCw}>
        <Field label="Sync. automatique" desc="Synchronise les données en arrière-plan">
          <Toggle on={s.autoSync} onChange={() => set("autoSync", !s.autoSync)} label={s.autoSync ? "Activée" : "Désactivée"} />
        </Field>
        <Field label="Réseau autorisé" desc="Conditions réseau pour la synchronisation">
          <div className="flex gap-1.5">
            {[["always", "Toujours"], ["wifi", "Wi-Fi uniquement"], ["manual", "Manuel"]].map(([v, l]) => (
              <div key={v} className={`flex-1 py-2 px-2.5 bg-[#161b22] border border-[#21262d] text-[#8b949e] text-xs text-center cursor-pointer transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3] ${network === v ? "bg-[rgba(56,139,253,0.08)] border-[rgba(56,139,253,0.25)] text-[#388bfd]" : ""}`} onClick={() => setNetwork(v)}>{l}</div>
            ))}
          </div>
        </Field>
        <Field label="Bande passante max" desc="Limite de débit en KB/s (0 = illimité)">
          <input className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 font-mono text-xs text-[#e6edf3] outline-none focus:border-[#388bfd]" type="number" defaultValue="0" placeholder="KB/s" />
        </Field>
        <Field label="Résolution de conflits" desc="Stratégie en cas de modification simultanée">
          <select className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none">
            <option>Automatique (LWW)</option><option>Manuel</option><option>Règles personnalisées</option>
          </select>
        </Field>
      </Card>

      <Card title="Synchronisation manuelle" icon={FiZap} actions={syncing ? <span className="text-[11px] text-[#388bfd] font-mono">Sync en cours…</span> : null}>
        <div className="p-3.5 flex gap-2">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" disabled={syncing} onClick={() => { setSyncing(true); setTimeout(() => { setSyncing(false); notify("Synchronisation terminée — 245 enregistrements", "green"); }, 2500); }}>
            <Ico icon={FiRefreshCw} size={12} /> Synchroniser maintenant
          </button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Dry-run : 89 enregistrements seraient synchronisés", "blue")}>
            <Ico icon={FiZap} size={12} /> Test à blanc (dry-run)
          </button>
        </div>
      </Card>

      <Card title="Journal de synchronisation" icon={FiActivity}>
        <div className="bg-[#090c10] p-3.5 font-mono text-[11.5px] leading-relaxed max-h-[220px] overflow-y-auto border-t border-[#21262d]">
          {[
            { level: 'info' as const, timestamp: "2026-03-08 14:32", message: "Synchronisation démarrée — 245 enregistrements" },
            { level: 'info' as const, timestamp: "2026-03-08 14:32", message: "Synchronisation terminée en 1.4s" },
            { level: 'warn' as const, timestamp: "2026-03-08 09:10", message: "3 conflits résolus automatiquement (LWW)" },
            { level: 'info' as const, timestamp: "2026-03-07 14:35", message: "Synchronisation démarrée — 89 enregistrements" },
            { level: 'info' as const, timestamp: "2026-03-07 14:35", message: "Synchronisation terminée en 0.8s" },
          ].map((l, i) => (
            <div key={i} className={`${l.level === 'info' ? 'text-[#8b949e]' : l.level === 'warn' ? 'text-[#d29922]' : 'text-[#f85149]'}`}><span className="text-[#484f58] mr-2">[{l.timestamp}]</span>{l.message}</div>
          ))}
        </div>
      </Card>
    </>
  );
}

function TabBackup({ notify }: TabWithoutStateProps) {
  return (
    <>
      <Card title="Sauvegarde rapide" icon={FiHardDrive}>
        <div className="p-4 flex gap-2">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Export complet en cours…", "blue")}><Ico icon={FiDownload} size={12} /> Export complet</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Export incrémental en cours…", "blue")}><Ico icon={FiDownload} size={12} /> Export incrémental</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Export SQL en cours…", "blue")}><Ico icon={FiDownload} size={12} /> Export SQL</button>
        </div>
      </Card>

      <Card title="Planification automatique" icon={FiActivity}>
        <Field label="Sauvegardes automatiques"><Toggle on={true} onChange={() => {}} label="Activées" /></Field>
        <Field label="Fréquence">
          <select className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none">
            <option>Quotidien</option><option>Hebdomadaire</option><option>Mensuel</option>
          </select>
        </Field>
        <Field label="Heure d'exécution">
          <input className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 font-mono text-xs text-[#e6edf3] outline-none focus:border-[#388bfd]" type="time" defaultValue="02:00" />
        </Field>
        <Field label="Rétention" desc="Nombre de sauvegardes conservées">
          <input className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 font-mono text-xs text-[#e6edf3] outline-none focus:border-[#388bfd]" type="number" defaultValue="30" />
        </Field>
        <div className="flex justify-end gap-2 p-4 pt-3 border-t border-[#21262d] bg-[#090c10]">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Planification sauvegardée", "green")}><Ico icon={FiSave} size={12} /> Sauvegarder</button>
        </div>
      </Card>

      <Card title="Emplacements de sauvegarde" icon={FiServer}>
        {[
          { path: "C:\\Backups\\Scolarys", lastBackup: "08 Mar 2026 · 02:00", size: "2.3 GB" },
          { path: "D:\\Archives\\Scolarys", lastBackup: "07 Mar 2026 · 02:00", size: "2.1 GB" },
        ].map(loc => (
          <div key={loc.path} className="flex items-center justify-between p-2.5 px-5 border-b border-[#21262d] hover:bg-[#161b22] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-[#161b22] border border-[#21262d] flex items-center justify-center text-[#8b949e] flex-shrink-0"><Ico icon={FiHardDrive} size={13} /></div>
              <div>
                <div className="font-mono text-xs">{loc.path}</div>
                <div className="text-[11px] text-[#484f58]">{loc.lastBackup} · {loc.size}</div>
              </div>
            </div>
            <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:bg-[rgba(248,81,73,0.08)] hover:border-[rgba(248,81,73,0.25)] hover:text-[#f85149]"><Ico icon={FiTrash2} size={11} /></button>
          </div>
        ))}
        <div className="p-3 pt-2.5 border-t border-[#21262d]">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Sélectionner un emplacement", "blue")}><Ico icon={FiPlus} size={12} /> Ajouter un emplacement</button>
        </div>
      </Card>
    </>
  );
}

function TabBilling({ s, set, notify }: TabProps) {
  return (
    <Card title="Informations de facturation" icon={FiCreditCard}>
      <Field label="Nom de l'entreprise"><input className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd]" value={s.companyName} onChange={e => set("companyName", e.target.value)} /></Field>
      <Field label="Numéro de TVA"><input className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 font-mono text-xs text-[#e6edf3] outline-none focus:border-[#388bfd]" value={s.vatNumber} onChange={e => set("vatNumber", e.target.value)} /></Field>
      <Field label="Adresse de facturation">
        <textarea className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] resize-vertical min-h-[64px]" value={s.address} onChange={e => set("address", e.target.value)} />
      </Field>
      <Field label="Email de facturation"><input className="w-full max-w-[300px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd]" type="email" value={s.billingEmail} onChange={e => set("billingEmail", e.target.value)} /></Field>
      <Field label="Facturation automatique" desc="Génère et envoie les factures automatiquement">
        <Toggle on={s.autoInvoice} onChange={() => set("autoInvoice", !s.autoInvoice)} label={s.autoInvoice ? "Activée" : "Désactivée"} />
      </Field>
      <div className="flex justify-end gap-2 p-4 pt-3 border-t border-[#21262d] bg-[#090c10]">
        <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Facture de test envoyée", "blue")}><Ico icon={FiMail} size={12} /> Tester</button>
        <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Facturation sauvegardée", "green")}><Ico icon={FiSave} size={12} /> Sauvegarder</button>
      </div>
    </Card>
  );
}

function TabLogs({ notify }: TabWithoutStateProps) {
  const logs: LogEntry[] = [
    { level: 'info', timestamp: "2026-03-08 14:32:15", message: "Application démarrée" },
    { level: 'info', timestamp: "2026-03-08 14:32:16", message: "Base de données connectée" },
    { level: 'info', timestamp: "2026-03-08 14:35:22", message: "Synchronisation démarrée" },
    { level: 'info', timestamp: "2026-03-08 14:35:45", message: "245 enregistrements synchronisés" },
    { level: 'warn', timestamp: "2026-03-08 14:35:46", message: "3 conflits résolus automatiquement" },
    { level: 'error', timestamp: "2026-03-08 15:12:03", message: "Tentative de connexion échouée — IP: 185.234.12.8" },
    { level: 'warn', timestamp: "2026-03-08 16:00:00", message: "Licence expirée détectée — Lycée Pasteur" },
  ];
  return (
    <>
      <Card title="Journaux système" icon={FiActivity}
        actions={
          <div className="flex gap-1.5">
            <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Logs exportés", "green")}><Ico icon={FiDownload} size={12} /> Exporter</button>
            <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Logs envoyés au support", "blue")}><Ico icon={FiUpload} size={12} /> Envoyer au support</button>
          </div>
        }
      >
        <Field label="Niveau de détail">
          <div className="flex gap-1.5">
            {["Info", "Warn", "Debug", "Error"].map(l => (
              <div key={l} className={`flex-none py-1.5 px-3.5 bg-[#161b22] border border-[#21262d] text-[#8b949e] text-xs text-center cursor-pointer transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3] ${l === "Info" ? "bg-[rgba(56,139,253,0.08)] border-[rgba(56,139,253,0.25)] text-[#388bfd]" : ""}`}>{l}</div>
            ))}
          </div>
        </Field>
        <div className="bg-[#090c10] p-3.5 font-mono text-[11.5px] leading-relaxed max-h-[220px] overflow-y-auto border-t border-[#21262d]">
          {logs.map((l, i) => (
            <div key={i} className={`${l.level === 'info' ? 'text-[#8b949e]' : l.level === 'warn' ? 'text-[#d29922]' : 'text-[#f85149]'}`}><span className="text-[#484f58] mr-2">[{l.timestamp}]</span>{l.message}</div>
          ))}
        </div>
      </Card>

      <Card title="Informations de diagnostic" icon={FiActivity}>
        <div className="grid grid-cols-2 gap-px bg-[#21262d]">
          {[
            ["Version application", "v2.4.1"],
            ["Schéma base de données", "v1.8"],
            ["Dernière synchronisation", "Il y a 2 heures"],
            ["Espace disque", "12.4 GB / 50 GB"],
            ["Uptime", "18j 04h 22min"],
            ["Node.js", "v20.11.0"],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#0d1117] p-3 px-5">
              <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58]">{k}</div>
              <div className="font-mono text-[13px] text-[#e6edf3] mt-1">{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Confidentialité & Télémétrie" icon={FiShield}>
        <Field label="Télémétrie anonymisée" desc="Aide à améliorer le produit sans données personnelles">
          <Toggle on={false} onChange={() => {}} label="Désactivée" />
        </Field>
        <div className="flex gap-2 p-3.5">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Export RGPD en cours", "blue")}><Ico icon={FiDownload} size={12} /> Exporter mes données (RGPD)</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:bg-[rgba(248,81,73,0.08)] hover:border-[rgba(248,81,73,0.25)] hover:text-[#f85149]" onClick={() => notify("Purge planifiée", "red")}><Ico icon={FiTrash2} size={12} /> Purger les données</button>
        </div>
      </Card>
    </>
  );
}

function TabAdvanced({ notify }: TabWithoutStateProps) {
  return (
    <>
      <InfoBanner type="amber" title="Mode Expert" text="Ces paramètres sont réservés aux utilisateurs avancés. Une mauvaise configuration peut affecter le fonctionnement de la plateforme." />
      <Card title="Cryptographie" icon={FiLock}>
        <Field label="Algorithme de chiffrement" desc="Chiffrement des données locales">
          <select className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none">
            <option>AES-256-GCM</option><option>ChaCha20-Poly1305</option>
          </select>
        </Field>
        <Field label="Algorithme de signature" desc="Vérification des licences et clés">
          <select className="w-full max-w-[200px] bg-[#090c10] border border-[#21262d] px-3 py-1.5 text-[#e6edf3] text-[13px] outline-none focus:border-[#388bfd] cursor-pointer appearance-none">
            <option>Ed25519</option><option>RSA-4096</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2 p-4 pt-3 border-t border-[#21262d] bg-[#090c10]">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Paramètres crypto sauvegardés", "green")}><Ico icon={FiSave} size={12} /> Sauvegarder</button>
        </div>
      </Card>
      <Card title="Débogage & Reset" icon={FiTerminal}>
        <div className="p-3.5 flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Change-log affiché", "blue")}><Ico icon={FiActivity} size={12} /> Afficher le change-log</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Conflits résolus", "amber")}><Ico icon={FiZap} size={12} /> Forcer résolution conflits</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Import SQL en cours", "blue")}><Ico icon={FiUpload} size={12} /> Importer SQL</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Export SQL en cours", "blue")}><Ico icon={FiDownload} size={12} /> Exporter SQL</button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:bg-[rgba(248,81,73,0.08)] hover:border-[rgba(248,81,73,0.25)] hover:text-[#f85149]" onClick={() => notify("Historique sync réinitialisé", "red")}><Ico icon={FiTrash2} size={12} /> Reset historique sync</button>
        </div>
      </Card>
    </>
  );
}

// Initial State
const INIT: SettingsState = {
  platformName: "Scolarys Admin",
  contactEmail: "admin@scolarys.fr",
  supportEmail: "support@scolarys.fr",
  timezone: "Europe/Paris",
  language: "fr",
  dateFormat: "DD/MM/YYYY",
  twoFactorAuth: true,
  sessionTimeout: "8",
  passwordPolicy: "strong",
  maxLoginAttempts: 5,
  emailNotifications: true,
  slackWebhook: "https://hooks.slack.com/services/xxx",
  discordWebhook: "",
  notifyPayment: true,
  notifySignup: true,
  notifySystem: true,
  notifyExpiry: true,
  theme: "dark",
  accentColor: "#388bfd",
  compactMode: false,
  showAvatars: true,
  companyName: "Scolarys SAS",
  vatNumber: "FR123456789",
  address: "123 rue de l'Innovation, 75001 Paris",
  billingEmail: "billing@scolarys.fr",
  autoInvoice: true,
  apiEnabled: true,
  rateLimit: 1000,
  webhookUrl: "https://api.scolarys.fr/webhook",
  allowCors: true,
  autoSync: true,
};

// Main Component
export default function Parametres({ onNotify }: ParametresProps) {
  const notify = onNotify || ((m: string, t: 'green' | 'red' | 'amber' | 'blue') => console.log(m, t));
  const [tab, setTab] = useState<string>("general");
  const [s, setS] = useState<SettingsState>(INIT);

  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setS(p => ({ ...p, [key]: value }));
  };

  const renderTab = (): React.ReactElement | null => {
    switch (tab) {
      case "general":       return <TabGeneral s={s} set={set} notify={notify} />;
      case "appearance":    return <TabAppearance s={s} set={set} notify={notify} />;
      case "notifications": return <TabNotifications s={s} set={set} notify={notify} />;
      case "security":      return <TabSecurity s={s} set={set} notify={notify} />;
      case "roles":         return <TabRoles notify={notify} />;
      case "api":           return <TabApi s={s} set={set} notify={notify} />;
      case "sync":          return <TabSync s={s} set={set} notify={notify} />;
      case "backup":        return <TabBackup notify={notify} />;
      case "billing":       return <TabBilling s={s} set={set} notify={notify} />;
      case "logs":          return <TabLogs notify={notify} />;
      case "advanced":      return <TabAdvanced notify={notify} />;
      default: return null;
    }
  };

  return (
    <div className="font-['IBM_Plex_Sans'] text-[13px] text-[#e6edf3] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        @keyframes pmEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Topbar */}
      <div className="flex items-start justify-between mb-6 pb-5 border-b border-[#21262d] flex-wrap gap-4">
        <div className="pm-header-left">
          <div className="text-lg font-semibold tracking-[-0.4px] flex items-center gap-2.5 mb-1">
            <div className="w-[30px] h-[30px] bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] flex items-center justify-center text-[#388bfd]"><Ico icon={FiSettings} size={15} /></div>
            Paramètres
          </div>
          <div className="text-xs text-[#484f58] font-mono">Configuration de la plateforme Scolarys</div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => { setS(INIT); notify("Paramètres réinitialisés", "amber"); }}>
            <Ico icon={FiRefreshCw} size={12} /> Réinitialiser
          </button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => notify("Configuration exportée en JSON", "green")}>
            <Ico icon={FiDownload} size={12} /> Exporter
          </button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => notify("Tous les paramètres sauvegardés", "green")}>
            <Ico icon={FiSave} size={12} /> Tout sauvegarder
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="flex gap-0 max-[768px]:flex-col">
        {/* Sidebar */}
        <nav className="w-[220px] flex-shrink-0 bg-[#0d1117] border-r border-[#21262d] flex flex-col sticky top-0 max-[768px]:w-full max-[768px]:flex-row max-[768px]:overflow-x-auto max-[768px]:border-r-0 max-[768px]:border-b max-[768px]:border-b-[#21262d] max-[768px]:static">
          {NAV.map(group => (
            <div className="py-3 pb-1 max-[768px]:flex" key={group.group}>
              <div className="px-4 pb-1.5 text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58] max-[768px]:hidden">{group.group}</div>
              {group.items.map(item => (
                <div key={item.id}
                  className={`flex items-center gap-2.5 py-2 px-4 cursor-pointer transition-all duration-150 text-[#8b949e] text-[12.5px] font-normal relative border-b border-transparent select-none hover:bg-[#161b22] hover:text-[#e6edf3] max-[768px]:whitespace-nowrap max-[768px]:py-3 max-[768px]:px-3.5 ${tab === item.id ? "bg-[#161b22] text-[#e6edf3] font-medium" : ""}`}
                  onClick={() => setTab(item.id)}>
                  <Ico icon={item.icon} size={13} />
                  {item.label}
                  {item.badge && <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 bg-[rgba(248,81,73,0.08)] text-[#f85149] border border-[rgba(248,81,73,0.25)]">{item.badge}</span>}
                  {tab === item.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#388bfd]" />}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 p-6 pt-0 max-[768px]:p-4">
          <div key={tab} className="animate-[pmEnter_0.25s_cubic-bezier(0.4,0,0.2,1)_both]">
            {renderTab()}
          </div>
        </div>
      </div>
    </div>
  );
}