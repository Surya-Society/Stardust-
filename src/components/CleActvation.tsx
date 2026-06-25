// frontend/src/components/CleActivation.tsx
import { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/core';
import EtablissementForm, { EtablissementInfo } from './EtablissementForm';
import { FiAlertCircle } from 'react-icons/fi';

// ================================================================
// TYPES
// ================================================================

interface ActivationKey {
  id: number;
  key: string;
  school: string;
  plan: "Basic" | "Premium" | "Enterprise";
  status: "active" | "expired" | "suspended" | "revoked";
  created: string;
  expires: string;
  uses: number;
  maxUses: number;
  hwLock: boolean;
  twoFa: boolean;
  ipRestrict: boolean;
  fingerprint: string;
  lastUsed: string;
  city: string;
  secScore: number;
  revocations: number;
  hash: string;
  activationMethod: "online" | "usb" | "file";
  events: Array<{
    dot: string;
    event: string;
    time: string;
  }>;
}

interface Offre {
  offre_id: string;
  code: string;
  nom: string;
  description?: string;
  duree: string;
  prix: number;
  devise: string;
  prix_original?: number;
  reduction_pourcentage?: number;
  fonctionnalites?: any;
  est_populaire: boolean;
  est_meilleur_rapport: boolean;
  icon?: string;
  couleur?: string;
  ordre_affichage: number;
}

interface LicenceFile {
  licence_id: string;
  licence_key: string;
  school_id: string;
  plan: string;
  issued_at: string;
  expires_at: string;
  max_version: string;
  install_limit: number;
  signature: string;
  public_key: string;
}

interface Toast {
  msg: string;
  type: "green" | "red" | "amber" | "blue";
}

interface SecurityOption {
  key: keyof Pick<FormData, "hwLock" | "twoFa" | "ipRestrict" | "autoRevoke">;
  icon: string;
  name: string;
  desc: string;
}

interface BadgeProps {
  status: ActivationKey["status"];
}

interface SecurityScoreProps {
  score: number;
}

interface ToggleProps {
  on: boolean;
  onChange: () => void;
}

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

interface KeyCardProps {
  k: ActivationKey;
  selected: boolean;
  onSelect: () => void;
  onDetail: (key: ActivationKey) => void;
  onCopy: (key: string) => void;
  onSuspend: (id: number) => void;
  onReactivate: (id: number) => void;
  onRevoke: (key: ActivationKey) => void;
  onExport: (key: ActivationKey) => void;
}

interface IcoProps {
  d: string;
  s?: number;
  sw?: number;
}

interface StatItem {
  label: string;
  val: number;
  color: string;
}

interface AuditItem {
  label: string;
  val: string;
  color: string;
}

interface CleActivationProps {
  onNotify?: (message: string, type: string) => void;
}

// ================================================================
// ICONS
// ================================================================

const Ico = ({ d, s = 14, sw = 1.5 }: IcoProps) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const I = {
  key:     "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  plus:    "M12 5v14M5 12h14",
  copy:    "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-4-4H8zM14 4v4h4",
  search:  "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
  close:   "M18 6L6 18M6 6l12 12",
  check:   "M20 6L9 17l-5-5",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  ban:     "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
  lock:    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  warn:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  clock:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  download:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 0-2-2v-4M7 10l5 5 5-5M12 15V3",
  trash:   "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  export:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  chip:    "M9 3H5a2 2 0 0 0-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 0 1 2 2v4m-6-6v18m0 0H9m6 0h4a2 2 0 0 0 2-2v-4M3 9v6m18-6v6M3 15h2m14 0h2M3 9h2m14 0h2",
  fingerp: "M12 10c-1.1 0-2 .9-2 2M18 10c0 4.4-1.8 8-6 8s-6-3.6-6-8a6 6 0 0 1 12 0zM12 2a8 8 0 0 0-8 8",
  globe:   "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  network: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  hash:    "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
};

// ================================================================
// CONSTANTES
// ================================================================

const METHOD_LABELS: Record<ActivationKey["activationMethod"], string> = { 
  online:"En ligne", 
  usb:"Clé USB", 
  file:"Fichier .licpkg" 
};

const METHOD_COLORS: Record<ActivationKey["activationMethod"], string> = { 
  online:"#3fb950", 
  usb:"#388bfd", 
  file:"#d29922" 
};

const STATUS_ACCENT: Record<ActivationKey["status"], string> = { 
  active:"#3fb950", 
  expired:"#d29922", 
  suspended:"#f85149", 
  revoked:"#f85149" 
};

const DUREE_LABELS: Record<string, number> = {
  "MENSUEL": 30,
  "TRIMESTRIEL": 90,
  "SEMESTRIEL": 180,
  "ANNUEL": 365,
  "A_VIE": 36500
};

function seg(): string { return Math.random().toString(36).substring(2,6).toUpperCase(); }
function genKey(): string { return `SCO-2025-${seg()}-${seg()}`; }

// ================================================================
// COMPOSANTS
// ================================================================

function Badge({ status }: BadgeProps) {
  const M: Record<ActivationKey["status"], [string, string]> = {
    active: ["bg-[rgba(63,185,80,0.08)] text-[#3fb950] border border-[rgba(63,185,80,0.25)]","Actif"],
    expired: ["bg-[rgba(210,153,34,0.08)] text-[#d29922] border border-[rgba(210,153,34,0.25)]","Expiré"],
    suspended: ["bg-[rgba(248,81,73,0.08)] text-[#f85149] border border-[rgba(248,81,73,0.25)]","Suspendu"],
    revoked: ["bg-[rgba(248,81,73,0.08)] text-[#f85149] border border-[rgba(248,81,73,0.25)]","Révoqué"]
  };
  const [cls, lbl] = M[status] || ["bg-[#1c2330] text-[#484f58] border border-[#21262d]",status];
  const dotColors: Record<string, string> = {
    "bg-[rgba(63,185,80,0.08)] text-[#3fb950]": "#3fb950",
    "bg-[rgba(210,153,34,0.08)] text-[#d29922]": "#d29922",
    "bg-[rgba(248,81,73,0.08)] text-[#f85149]": "#f85149",
    "bg-[#1c2330] text-[#484f58]": "#484f58"
  };
  const dotColor = dotColors[cls.split(' ')[0]] || "#484f58";
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${cls}`}><span className="w-1.5 h-1.5" style={{background:dotColor}}/>{lbl}</span>;
}

function SecurityScore({ score }: SecurityScoreProps) {
  const color = score >= 80 ? "#3fb950" : score >= 50 ? "#d29922" : "#f85149";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-mono min-w-[20px]" style={{color}}>{score}</span>
      <div className="w-9 h-0.5 bg-[#1c2330]"><div className="h-full" style={{width:`${score}%`,background:color}}/></div>
    </div>
  );
}

function Toggle({ on, onChange }: ToggleProps) {
  return <div className={`w-8 h-[18px] bg-[#1c2330] border border-[#21262d] relative transition-all duration-200 cursor-pointer flex-shrink-0 ${on ? "bg-[#388bfd] border-[#388bfd]" : ""}`} onClick={onChange}><div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-[#8b949e] transition-transform duration-200 ${on ? "translate-x-[14px] bg-white" : ""}`}/></div>;
}

function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <div className={`w-3.5 h-3.5 bg-[#090c10] border border-[#21262d] flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-150 ${checked ? "bg-[#388bfd] border-[#388bfd]" : ""}`} onClick={(e) => { e.stopPropagation(); onChange(); }}>
      {checked && <Ico d={I.check} s={10} sw={2.5}/>}
    </div>
  );
}

function KeyCard({ k, selected, onSelect, onDetail, onCopy, onSuspend, onReactivate, onRevoke, onExport }: KeyCardProps) {
  const pct = Math.min(k.uses/k.maxUses*100,100);
  const usageColor = pct>85?"#f85149":pct>60?"#d29922":"#388bfd";
  const planCls = k.plan==="Enterprise" ? "bg-[rgba(56,139,253,0.08)] text-[#388bfd] border border-[rgba(56,139,253,0.25)]" : k.plan==="Premium" ? "bg-[rgba(63,185,80,0.08)] text-[#3fb950] border border-[rgba(63,185,80,0.25)]" : "bg-[#1c2330] text-[#484f58] border border-[#21262d]";

  return (
    <div className={`bg-[#0d1117] flex flex-col transition-colors duration-150 cursor-pointer relative ${selected ? "bg-[rgba(56,139,253,0.08)]" : ""}`} onClick={() => onDetail(k)}>
      <div className="h-0.5 w-full flex-shrink-0" style={{background:STATUS_ACCENT[k.status]||"#484f58"}}/>

      <div className="p-3.5 pb-3 flex items-start justify-between border-b border-[#21262d]">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="text-[13px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{k.school}</div>
          <div className="text-[11px] text-[#484f58]">{k.city}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2.5">
          <Badge status={k.status}/>
          <Checkbox checked={selected} onChange={onSelect}/>
        </div>
      </div>

      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-[#21262d] bg-[#090c10]">
        <Ico d={I.key} s={11}/>
        <span className="font-mono text-[11px] text-[#8b949e] tracking-[0.3px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{k.key}</span>
        <button className="bg-none border-none text-[#484f58] cursor-pointer flex items-center transition-colors duration-150 flex-shrink-0 p-0 hover:text-[#388bfd]" onClick={(e) => { e.stopPropagation(); onCopy(k.key); }} title="Copier"><Ico d={I.copy} s={12}/></button>
      </div>

      <div className="p-4 pb-2.5 grid grid-cols-2 gap-2.5 gap-x-4 border-b border-[#21262d]">
        <div>
          <div className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#484f58] mb-0.5">Plan</div>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium ${planCls}`}>{k.plan}</span>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#484f58] mb-0.5">Expiration</div>
          <div className="text-[11.5px] text-[#8b949e] font-mono">{k.expires}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#484f58] mb-0.5">Méthode</div>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 flex-shrink-0" style={{background:METHOD_COLORS[k.activationMethod]}}/>
            <span style={{color:METHOD_COLORS[k.activationMethod]}}>{METHOD_LABELS[k.activationMethod]}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#484f58] mb-0.5">Dernier accès</div>
          <div className="text-[11.5px] text-[#8b949e] font-mono">{k.lastUsed}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#484f58] mb-0.5">Utilisation — {k.uses}/{k.maxUses}</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-0.5 bg-[#1c2330]"><div className="h-full transition-all duration-400" style={{width:`${pct}%`,background:usageColor}}/></div>
            <span className="text-[10px] text-[#484f58] font-mono min-w-[28px] text-right">{Math.round(pct)}%</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className={`flex items-center ${k.hwLock ? "opacity-100" : "opacity-20"}`} title="Hardware Lock" style={{color:"#388bfd"}}><Ico d={I.chip} s={11}/></span>
            <span className={`flex items-center ${k.twoFa ? "opacity-100" : "opacity-20"}`} title="2FA" style={{color:"#3fb950"}}><Ico d={I.fingerp} s={11}/></span>
            <span className={`flex items-center ${k.ipRestrict ? "opacity-100" : "opacity-20"}`} title="IP Restrict" style={{color:"#d29922"}}><Ico d={I.lock} s={11}/></span>
          </div>
          <SecurityScore score={k.secScore}/>
          <span className="font-mono text-[10px] text-[#484f58] bg-[#090c10] px-1.5 py-0.5 border border-[#21262d]">{k.fingerprint}</span>
        </div>
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          {k.status==="active" && <button className="flex items-center justify-center w-7 h-7 p-0 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" title="Suspendre" onClick={() => onSuspend(k.id)}><Ico d={I.ban} s={11}/></button>}
          {k.status==="suspended" && <button className="flex items-center justify-center w-7 h-7 p-0 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" title="Réactiver" onClick={() => onReactivate(k.id)}><Ico d={I.check} s={11}/></button>}
          <button className="flex items-center justify-center w-7 h-7 p-0 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" title="Exporter" onClick={(e) => { e.stopPropagation(); onExport(k); }}><Ico d={I.download} s={11}/></button>
          <button className="flex items-center justify-center w-7 h-7 p-0 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-150 hover:bg-[rgba(248,81,73,0.08)] hover:border-[rgba(248,81,73,0.25)] hover:text-[#f85149]" title="Révoquer" onClick={() => onRevoke(k)}><Ico d={I.trash} s={11}/></button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// COMPOSANT PRINCIPAL
// ================================================================

export default function CleActivation({ onNotify }: CleActivationProps) {
  const notify = onNotify || ((message: string, type: string) => console.log(message, type));
  
  // États
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [detailKey, setDetailKey] = useState<ActivationKey | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [previewKey, setPreviewKey] = useState<string>(genKey());
  const [toast, setToast] = useState<Toast | null>(null);
  
  // États pour les offres
  const [offres, setOffres] = useState<Offre[]>([]);
  const [offresLoading, setOffresLoading] = useState<boolean>(true);
  
  // État pour les données du formulaire d'établissement
  const [etablissementData, setEtablissementData] = useState<EtablissementInfo | null>(null);
  const [isEtablissementStep, setIsEtablissementStep] = useState(false);
  
  // ✅ SUPPRIMER "school" du formulaire
  const [form, setForm] = useState<FormData>({
    school: "",  // ← Gardé mais caché, utilisé pour la compatibilité
    offre_id: "",
    plan: "Enterprise",
    expires: "",
    maxUses: "150",
    hwLock: true,
    twoFa: true,
    ipRestrict: false,
    autoRevoke: false,
    activationMethod: "online",
    note: ""
  });

  const PER_PAGE = 9;

  // Charger les données au démarrage
  useEffect(() => {
    loadLicences();
    loadOffres();
  }, []);

  // Charger les licences
  const loadLicences = async () => {
    try {
      setLoading(true);
      const result = await invoke<ActivationKey[]>('get_all_licences');
      console.log('📋 Licences chargées:', result);
      setKeys(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('❌ Erreur de chargement:', error);
      showToast('❌ Erreur de chargement des licences', 'red');
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les offres
  const loadOffres = async () => {
    try {
      setOffresLoading(true);
      const result = await invoke<{ success: boolean; data: Offre[] }>('get_offres_publiques');
      if (result && result.success && result.data && result.data.length > 0) {
        setOffres(result.data);
        setForm(prev => ({ ...prev, offre_id: result.data[0].offre_id }));
      } else {
        setOffres([]);
      }
    } catch (error) {
      console.error('❌ Erreur de chargement des offres:', error);
      showToast('❌ Erreur de chargement des offres', 'red');
      setOffres([]);
    } finally {
      setOffresLoading(false);
    }
  };

  function showToast(msg: string, type: Toast["type"] = "green"): void {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
    notify(msg, type);
  }

  // EXPORT vers fichier .licpkg
  const handleExportToFile = async (key: ActivationKey) => {
    try {
      showToast(`Export de ${key.key} en cours...`, "blue");
      
      const result = await invoke<LicenceFile>('export_licence_key', { 
        licenceId: key.id 
      });
      
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `licence_${result.licence_key}.licpkg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(`✅ Licence exportée: ${result.licence_key}`, "green");
    } catch (error) {
      console.error('Erreur d\'export:', error);
      showToast(`❌ Erreur d'export: ${error}`, "red");
    }
  };

  // ✅ CRÉER une licence avec les infos d'établissement
  const handleGenerateWithEtablissement = async (etablissement: EtablissementInfo) => {
    try {
      if (!form.offre_id) {
        showToast('❌ Veuillez sélectionner une offre', 'red');
        return;
      }

      const selectedOffre = offres.find(o => o.offre_id === form.offre_id);

      showToast('Création de la licence...', 'blue');
      
      let expiresAt = form.expires;
      if (!expiresAt && selectedOffre) {
        const days = DUREE_LABELS[selectedOffre.duree] || 365;
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString().split('T')[0];
      }

      // ✅ Utiliser les données de l'établissement pour school_name
      const result = await invoke('create_licence', {
        data: {
          school_name: etablissement.nom,  // ← Utiliser le nom de l'établissement
          plan: selectedOffre?.nom || form.plan,
          offre_id: form.offre_id,
          expires_at: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          max_uses: parseInt(form.maxUses) || 150,
          hw_lock: form.hwLock,
          two_fa: form.twoFa,
          ip_restrict: form.ipRestrict,
          activation_method: form.activationMethod,
          note: form.note || "Générée depuis l'interface",
          etablissement: etablissement
        }
      });
      
      console.log('✅ Licence créée avec établissement:', result);
      showToast('✅ Licence générée avec succès', 'green');
      setModal(null);
      setIsEtablissementStep(false);
      setEtablissementData(null);
      
      await loadLicences();
      
    } catch (error) {
      console.error('❌ Erreur de création:', error);
      showToast(`❌ Erreur: ${error}`, 'red');
    }
  };

  // Filtrer les clés
  const filtered = Array.isArray(keys) ? keys.filter(k => {
    const q = search.toLowerCase();
    return (!q || k.school.toLowerCase().includes(q) || k.key.toLowerCase().includes(q) || k.fingerprint.includes(q))
      && (filterStatus === "all" || k.status === filterStatus)
      && (filterPlan === "all" || k.plan === filterPlan)
      && (filterMethod === "all" || k.activationMethod === filterMethod);
  }) : [];

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSelect(id: number): void {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function handleSuspend(id: number): void {
    setKeys(k => k.map(x => x.id === id ? { ...x, status: "suspended" } : x));
    showToast("Clé suspendue", "amber");
    if (detailKey?.id === id) setDetailKey(p => p ? { ...p, status: "suspended" } : null);
  }

  function handleReactivate(id: number): void {
    setKeys(k => k.map(x => x.id === id ? { ...x, status: "active" } : x));
    showToast("Clé réactivée", "green");
    if (detailKey?.id === id) setDetailKey(p => p ? { ...p, status: "active" } : null);
  }

  function handleRevoke(target: number | ActivationKey): void {
    if (typeof target === "number") {
      setKeys(k => k.map(x => x.id === target ? { ...x, status: "revoked" } : x));
    } else {
      setDetailKey(target);
      setModal("revoke");
    }
  }

  function confirmRevoke(): void {
    if (detailKey) {
      setKeys(k => k.map(x => x.id === detailKey.id ? { ...x, status: "revoked" } : x));
      showToast("Clé révoquée", "red");
      setModal(null);
      setDetailKey(null);
    }
  }

  function handleCopy(key: string): void {
    navigator.clipboard?.writeText(key);
    showToast("Clé copiée", "green");
  }

  const stats = {
    total: Array.isArray(keys) ? keys.length : 0,
    active: Array.isArray(keys) ? keys.filter(k => k.status === "active").length : 0,
    expired: Array.isArray(keys) ? keys.filter(k => k.status === "expired").length : 0,
    suspended: Array.isArray(keys) ? keys.filter(k => k.status === "suspended" || k.status === "revoked").length : 0,
    secAvg: Array.isArray(keys) && keys.length > 0 ? Math.round(keys.reduce((s, k) => s + k.secScore, 0) / keys.length) : 0
  };

  const securityOptions: SecurityOption[] = [
    { key: "hwLock", icon: I.chip, name: "Hardware Lock", desc: "Lie la clé à l'empreinte BIOS/UUID" },
    { key: "twoFa", icon: I.fingerp, name: "2FA TOTP", desc: "Authentification obligatoire à chaque activation" },
    { key: "ipRestrict", icon: I.network, name: "Restriction IP", desc: "Limite l'accès à une plage IP définie" },
    { key: "autoRevoke", icon: I.warn, name: "Révocation auto", desc: "Révoque si détection de clonage ou anomalie" }
  ];

  const statItems: StatItem[] = [
    { label: "Total", val: stats.total, color: "#8b949e" },
    { label: "Actives", val: stats.active, color: "#3fb950" },
    { label: "Expirées", val: stats.expired, color: "#d29922" },
    { label: "Suspendues", val: stats.suspended, color: "#f85149" },
    { label: "Score sécu. moy.", val: stats.secAvg, color: stats.secAvg >= 80 ? "#3fb950" : stats.secAvg >= 50 ? "#d29922" : "#f85149" }
  ];

  const auditItems: AuditItem[] = [
    { label: "Score global", val: `${stats.secAvg}/100`, color: stats.secAvg >= 80 ? "#3fb950" : "#d29922" },
    { label: "HW Lock actif", val: `${Array.isArray(keys) ? keys.filter(k => k.hwLock).length : 0}/${stats.total}`, color: "#388bfd" },
    { label: "2FA actif", val: `${Array.isArray(keys) ? keys.filter(k => k.twoFa).length : 0}/${stats.total}`, color: "#3fb950" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#484f58]">Chargement des licences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-['IBM_Plex_Sans'] text-[13px] text-[#e6edf3] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        @keyframes kaEnter { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes kaSlideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes kaSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes kaFadeIn { from{opacity:0} to{opacity:1} }
        .ka-enter { animation:kaEnter .3s cubic-bezier(0.4,0,0.2,1) both; }
        .ka-d1 { animation-delay:.05s; }
        .ka-d2 { animation-delay:.10s; }
        .ka-d3 { animation-delay:.15s; }
      `}</style>

      {/* TOPBAR */}
      <div className="flex items-center justify-between py-4 pb-5 border-b border-[#21262d] mb-6 ka-enter">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] flex items-center justify-center text-[#388bfd]"><Ico d={I.key} s={16}/></div>
          <div>
            <div className="text-lg font-semibold tracking-[-0.4px]">Clés d'Activation</div>
            <div className="text-xs text-[#484f58] font-mono mt-0.5">{Array.isArray(keys) ? keys.length : 0} clés enregistrées · {stats.active} actives</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => setModal("audit")}><Ico d={I.shield} s={13}/> Audit sécurité</button>
          <button className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => showToast("Export CSV…", "blue")}><Ico d={I.export} s={13}/> Exporter</button>
          <button className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => { setPreviewKey(genKey()); setModal("generate"); }}><Ico d={I.plus} s={13}/> Générer une clé</button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-5 gap-px bg-[#21262d] border border-[#21262d] mb-5 max-[900px]:grid-cols-3 max-[640px]:grid-cols-2">
        {statItems.map((s, i) => (
          <div className="bg-[#0d1117] p-4 relative transition-colors duration-150 hover:bg-[#161b22]" key={i}>
            <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58] mb-2">{s.label}</div>
            <div className="text-[26px] font-light tracking-[-1px]" style={{ color: s.color }}>{s.val}</div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: s.color }}/>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="flex gap-2 mb-5 items-center flex-wrap ka-enter ka-d2">
        <div className="flex items-center gap-2 bg-[#0d1117] border border-[#21262d] px-3 h-[34px] flex-1 max-w-[380px] transition-colors duration-150 focus-within:border-[#388bfd]">
          <Ico d={I.search} s={13}/>
          <input placeholder="Rechercher clé, établissement, fingerprint…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="bg-transparent border-none outline-none text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] flex-1 placeholder:text-[#484f58]"/>
        </div>
        <select className="h-[34px] bg-[#0d1117] border border-[#21262d] text-[#8b949e] font-['IBM_Plex_Sans'] text-xs px-2.5 cursor-pointer outline-none appearance-none transition-colors duration-150 focus:border-[#388bfd] focus:text-[#e6edf3]" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="all">Tous statuts</option><option value="active">Actives</option><option value="expired">Expirées</option><option value="suspended">Suspendues</option>
        </select>
        <select className="h-[34px] bg-[#0d1117] border border-[#21262d] text-[#8b949e] font-['IBM_Plex_Sans'] text-xs px-2.5 cursor-pointer outline-none appearance-none transition-colors duration-150 focus:border-[#388bfd] focus:text-[#e6edf3]" value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}>
          <option value="all">Tous plans</option><option value="Basic">Basic</option><option value="Premium">Premium</option><option value="Enterprise">Enterprise</option>
        </select>
        <select className="h-[34px] bg-[#0d1117] border border-[#21262d] text-[#8b949e] font-['IBM_Plex_Sans'] text-xs px-2.5 cursor-pointer outline-none appearance-none transition-colors duration-150 focus:border-[#388bfd] focus:text-[#e6edf3]" value={filterMethod} onChange={e => { setFilterMethod(e.target.value); setPage(1); }}>
          <option value="all">Toutes méthodes</option><option value="online">En ligne</option><option value="usb">Clé USB</option><option value="file">Fichier</option>
        </select>
        <div className="flex-1"/>
        <span className="text-[11px] text-[#484f58] font-mono">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* BULK BAR */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 py-2.5 px-4 bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] mb-4 text-xs">
          <span className="text-[#388bfd] font-semibold">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
          <div className="w-px h-4 bg-[rgba(56,139,253,0.25)]"/>
          <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => { selected.forEach(id => handleSuspend(id)); setSelected(new Set()); }}><Ico d={I.ban} s={12}/> Suspendre</button>
          <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:bg-[rgba(248,81,73,0.08)] hover:border-[rgba(248,81,73,0.25)] hover:text-[#f85149]" onClick={() => { selected.forEach(id => setKeys(k => k.map(x => x.id === id ? { ...x, status: "revoked" } : x))); showToast(`${selected.size} clé(s) révoquées`, "red"); setSelected(new Set()); }}><Ico d={I.trash} s={12}/> Révoquer</button>
          <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => showToast("Export sélection…", "blue")}><Ico d={I.export} s={12}/> Exporter</button>
          <div className="flex-1"/>
          <button className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => setSelected(new Set())}><Ico d={I.close} s={12}/> Désélectionner</button>
        </div>
      )}

      {/* CARD GRID */}
      <div className="ka-enter ka-d3">
        {paginated.length === 0 ? (
          <div className="py-14 text-center text-[#484f58] bg-[#0d1117] border border-[#21262d]">
            <Ico d={I.search} s={32}/>
            <div className="text-sm mt-3 text-[#8b949e]">Aucune clé trouvée</div>
            <div className="text-xs mt-1">Modifiez vos filtres ou générez une nouvelle clé</div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-px bg-[#21262d]">
            {paginated.map(k => (
              <KeyCard
                key={k.id}
                k={k}
                selected={selected.has(k.id)}
                onSelect={() => toggleSelect(k.id)}
                onDetail={setDetailKey}
                onCopy={handleCopy}
                onSuspend={handleSuspend}
                onReactivate={handleReactivate}
                onRevoke={handleRevoke}
                onExport={handleExportToFile}
              />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-3.5 border-t border-[#21262d] mt-px">
            <span className="text-xs text-[#484f58] font-mono">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}</span>
            <div className="flex gap-1">
              <button className="w-7 h-7 bg-[#161b22] border border-[#21262d] text-[#8b949e] text-xs cursor-pointer flex items-center justify-center transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3] disabled:opacity-30 disabled:cursor-not-allowed" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`w-7 h-7 bg-[#161b22] border border-[#21262d] text-[#8b949e] text-xs cursor-pointer flex items-center justify-center transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3] ${page === i + 1 ? "!bg-[#388bfd] !border-[#388bfd] !text-white" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="w-7 h-7 bg-[#161b22] border border-[#21262d] text-[#8b949e] text-xs cursor-pointer flex items-center justify-center transition-all duration-150 hover:border-[#30363d] hover:text-[#e6edf3] disabled:opacity-30 disabled:cursor-not-allowed" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL PANEL */}
      {detailKey && (
        <>
          <div className="fixed inset-0 z-[199]" onClick={() => setDetailKey(null)}/>
          <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-[#0d1117] border-l border-[#21262d] z-[200] animate-[kaSlideRight_0.25s_cubic-bezier(0.4,0,0.2,1)] flex flex-col overflow-hidden max-[900px]:w-full">
            <div className="p-4 pb-3 border-b border-[#21262d] flex items-center justify-between flex-shrink-0">
              <div>
                <div className="text-[13px] font-semibold">{detailKey.school}</div>
                <div className="text-[11px] text-[#484f58] font-mono mt-0.5">{detailKey.key}</div>
              </div>
              <button className="w-6 h-6 bg-transparent border-none text-[#484f58] cursor-pointer flex items-center justify-center transition-colors duration-150 hover:text-[#e6edf3]" onClick={() => setDetailKey(null)}><Ico d={I.close} s={14}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-5 p-3 bg-[#161b22] border border-[#21262d]">
                <Badge status={detailKey.status}/>
                <div className="text-right">
                  <div className="text-[10px] text-[#484f58] mb-1 tracking-[0.8px] uppercase">Score sécurité</div>
                  <SecurityScore score={detailKey.secScore}/>
                </div>
              </div>
              <div className="mb-5">
                <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58] mb-2.5 pb-1.5 border-b border-[#21262d]">Informations</div>
                {[
                  ["Plan", detailKey.plan],
                  ["Créée le", detailKey.created],
                  ["Expiration", detailKey.expires],
                  ["Utilisation", `${detailKey.uses} / ${detailKey.maxUses}`],
                  ["Dernier accès", detailKey.lastUsed],
                  ["Localisation", detailKey.city],
                  ["Méthode", METHOD_LABELS[detailKey.activationMethod]],
                  ["Fingerprint", detailKey.fingerprint],
                  ["Hash", detailKey.hash],
                  ["Révocations", detailKey.revocations]
                ].map(([k, v]) => (
                  <div className="flex items-start justify-between py-1.5 border-b border-[#21262d] last:border-b-0" key={k}><span className="text-[11px] text-[#484f58] w-[120px] flex-shrink-0">{k}</span><span className="text-xs text-[#e6edf3] text-right font-mono">{v}</span></div>
                ))}
              </div>
              <div className="mb-5">
                <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58] mb-2.5 pb-1.5 border-b border-[#21262d]">Protections actives</div>
                {[
                  { icon: I.chip, label: "Hardware Lock", on: detailKey.hwLock },
                  { icon: I.fingerp, label: "2FA TOTP", on: detailKey.twoFa },
                  { icon: I.network, label: "Restriction IP", on: detailKey.ipRestrict }
                ].map(p => (
                  <div className="flex items-center justify-between py-2 border-b border-[#21262d] last:border-b-0" key={p.label}>
                    <div className="flex items-center gap-2"><Ico d={p.icon} s={13}/><span style={{ color: p.on ? "#e6edf3" : "#484f58" }}>{p.label}</span></div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${p.on ? "bg-[rgba(63,185,80,0.08)] text-[#3fb950] border border-[rgba(63,185,80,0.25)]" : "bg-[#1c2330] text-[#484f58] border border-[#21262d]"}`}>{p.on ? "Actif" : "Inactif"}</span>
                  </div>
                ))}
              </div>
              <div className="mb-5">
                <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58] mb-2.5 pb-1.5 border-b border-[#21262d]">Historique d'activité</div>
                <div className="flex flex-col">
                  {detailKey.events.map((e, i) => (
                    <div className="flex gap-2.5 py-1.5" key={i}>
                      <div className="flex flex-col items-center">
                        <div className="w-1.5 h-1.5 mt-0.5" style={{ background: e.dot }}/>
                        <div className="w-px flex-1 bg-[#21262d] mt-1"/>
                      </div>
                      <div className="pb-2.5">
                        <div className="text-xs text-[#8b949e]">{e.event}</div>
                        <div className="text-[10px] text-[#484f58] mt-0.5 font-mono">{e.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {detailKey.status === "active" && <button className="inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" style={{ width: "100%" }} onClick={() => { handleSuspend(detailKey.id); setDetailKey(null); }}><Ico d={I.ban} s={13}/> Suspendre</button>}
                {detailKey.status === "suspended" && <button className="inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]" style={{ width: "100%" }} onClick={() => { handleReactivate(detailKey.id); setDetailKey(null); }}><Ico d={I.check} s={13}/> Réactiver</button>}
                <button className="inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" style={{ width: "100%" }} onClick={() => handleCopy(detailKey.key)}><Ico d={I.copy} s={13}/> Copier la clé</button>
                <button 
                  className="inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] text-[#388bfd] hover:bg-[rgba(56,139,253,0.15)]"
                  style={{ width: "100%" }}
                  onClick={() => handleExportToFile(detailKey)}
                >
                  <Ico d={I.download} s={13}/> Exporter en .licpkg
                </button>
                <button className="inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:bg-[rgba(248,81,73,0.08)] hover:border-[rgba(248,81,73,0.25)] hover:text-[#f85149]" style={{ width: "100%" }} onClick={() => setModal("revoke")}><Ico d={I.trash} s={13}/> Révoquer définitivement</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL GÉNÉRER - AVEC FORMULAIRE ÉTABLISSEMENT */}
      {modal === "generate" && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-5 animate-[kaFadeIn_0.2s]" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-[#0d1117] border border-[#30363d] w-full max-w-[600px] max-h-[90vh] overflow-y-auto animate-[kaSlideUp_0.25s_cubic-bezier(0.4,0,0.2,1)]">
            <div className="p-5 pb-4 border-b border-[#21262d] flex items-center justify-between sticky top-0 bg-[#0d1117] z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] flex items-center justify-center text-[#388bfd]">
                  <Ico d={I.key} s={14}/>
                </div>
                <span className="text-sm font-semibold">
                  {isEtablissementStep ? "Informations de l'établissement" : "Générer une clé d'activation"}
                </span>
              </div>
              <button className="w-6 h-6 bg-transparent border-none text-[#484f58] cursor-pointer flex items-center justify-center transition-colors duration-150 hover:text-[#e6edf3]" onClick={() => { 
                setModal(null); 
                setIsEtablissementStep(false);
                setEtablissementData(null);
              }}>
                <Ico d={I.close} s={14}/>
              </button>
            </div>

            <div className="p-5">
              {!isEtablissementStep ? (
                // ✅ Étape 1: Informations de la licence (SANS le champ établissement)
                <>
                  {/* ✅ Message informatif à la place du champ établissement */}
                  <div className="bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] p-3 mb-4">
                    <p className="text-xs text-[#8b949e] flex items-start gap-1.5">
                      <FiAlertCircle className="inline flex-shrink-0 mt-0.5 text-[#388bfd]" size={14} />
                      <span>Les informations de l'établissement seront saisies à l'étape suivante.</span>
                    </p>
                  </div>

                  {/* Offre */}
                  <div className="mb-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                      <Ico d={I.globe} s={11}/> Offre
                    </div>
                    <select 
                      className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] cursor-pointer appearance-none" 
                      value={form.offre_id} 
                      onChange={e => {
                        const offreId = e.target.value;
                        const selectedOffre = offres.find(o => o.offre_id === offreId);
                        setForm({ 
                          ...form, 
                          offre_id: offreId,
                          plan: selectedOffre?.nom as "Basic" | "Premium" | "Enterprise" || form.plan
                        });
                      }}
                      disabled={offresLoading}
                    >
                      {offresLoading ? (
                        <option value="">Chargement des offres...</option>
                      ) : offres.length === 0 ? (
                        <option value="">Aucune offre disponible</option>
                      ) : (
                        offres.map(offre => (
                          <option key={offre.offre_id} value={offre.offre_id}>
                            {offre.nom} — {offre.prix} {offre.devise}/{offre.duree}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Max utilisateurs + Expiration */}
                  <div className="grid grid-cols-2 gap-3 mb-3.5">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Max utilisateurs</div>
                      <input 
                        className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]" 
                        type="number" 
                        value={form.maxUses} 
                        onChange={e => setForm({ ...form, maxUses: e.target.value })}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                        <Ico d={I.clock} s={11}/> Expiration
                      </div>
                      <input 
                        className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]" 
                        type="date" 
                        value={form.expires} 
                        onChange={e => setForm({ ...form, expires: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Méthode d'activation */}
                  <div className="mb-3.5">
                    <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Méthode d'activation</div>
                    <select 
                      className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] cursor-pointer appearance-none" 
                      value={form.activationMethod} 
                      onChange={e => setForm({ ...form, activationMethod: e.target.value as FormData["activationMethod"] })}
                    >
                      <option value="online">En ligne</option>
                      <option value="usb">Clé USB</option>
                      <option value="file">Fichier .licpkg</option>
                    </select>
                  </div>

                  {/* Sécurité avancée */}
                  <div className="mb-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                      <Ico d={I.shield} s={11}/> Sécurité avancée
                    </div>
                    <div className="flex flex-col gap-1.5 mt-1">
                      {securityOptions.map(opt => (
                        <div
                          key={opt.key}
                          className={`flex items-center justify-between p-2.5 bg-[#090c10] border border-[#21262d] cursor-pointer select-none transition-colors duration-150 hover:border-[#30363d] ${form[opt.key] ? "border-[rgba(56,139,253,0.25)] bg-[rgba(56,139,253,0.08)]" : ""}`}
                          onClick={() => setForm(f => ({ ...f, [opt.key]: !f[opt.key] }))}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 flex items-center justify-center text-[#8b949e]"><Ico d={opt.icon} s={14}/></div>
                            <div><div className="text-xs font-medium">{opt.name}</div><div className="text-[11px] text-[#484f58] mt-0.5">{opt.desc}</div></div>
                          </div>
                          <Toggle on={form[opt.key]} onChange={() => {}}/>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aperçu de la clé */}
                  <div className="mb-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                      <Ico d={I.hash} s={11}/> Aperçu de la clé
                    </div>
                    <div className="bg-[#090c10] border border-[#21262d] p-2.5 flex items-center justify-between mt-1.5">
                      <span className="font-mono text-xs text-[#388bfd] tracking-[0.5px]">{previewKey}</span>
                      <button className="bg-none border-none text-[#484f58] cursor-pointer flex items-center transition-colors duration-150 hover:text-[#388bfd]" onClick={() => setPreviewKey(genKey())}>
                        <Ico d={I.refresh} s={14}/>
                      </button>
                    </div>
                  </div>

                  {/* Note interne */}
                  <div className="mb-3.5">
                    <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Note interne (optionnel)</div>
                    <textarea 
                      className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] resize-vertical min-h-[56px]" 
                      rows={2} 
                      placeholder="Remarque, contexte, référence commande…" 
                      value={form.note} 
                      onChange={e => setForm({ ...form, note: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                // Étape 2: Formulaire d'établissement
                <EtablissementForm
                  initialData={etablissementData || undefined}
                  onComplete={handleGenerateWithEtablissement}
                  onBack={() => setIsEtablissementStep(false)}
                  isLoading={false}
                />
              )}
            </div>

            {/* Actions */}
            {!isEtablissementStep && (
              <div className="p-4 pt-3 border-t border-[#21262d] flex justify-end gap-2 sticky bottom-0 bg-[#0d1117]">
                <button 
                  className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]"
                  onClick={() => setModal(null)}
                >
                  Annuler
                </button>
                <button 
                  className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]"
                  onClick={() => setIsEtablissementStep(true)}
                  disabled={!form.offre_id}
                >
                  <Ico d={I.plus} s={13}/> Suivant - Infos établissement
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL RÉVOQUER */}
      {modal === "revoke" && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-5 animate-[kaFadeIn_0.2s]" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-[#0d1117] border border-[#30363d] w-full max-w-[420px] animate-[kaSlideUp_0.25s_cubic-bezier(0.4,0,0.2,1)]">
            <div className="p-5 pb-4 border-b border-[#21262d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[rgba(248,81,73,0.08)] border border-[rgba(248,81,73,0.25)] flex items-center justify-center text-[#f85149]"><Ico d={I.warn} s={14}/></div>
                <span className="text-sm font-semibold">Confirmer la révocation</span>
              </div>
              <button className="w-6 h-6 bg-transparent border-none text-[#484f58] cursor-pointer flex items-center justify-center transition-colors duration-150 hover:text-[#e6edf3]" onClick={() => setModal(null)}><Ico d={I.close} s={14}/></button>
            </div>
            <div className="p-5 pb-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-[rgba(248,81,73,0.08)] border border-[rgba(248,81,73,0.25)] mb-4">
                <div className="text-xs text-[#f85149] font-medium mb-1">Action irréversible</div>
                <div className="text-xs text-[#8b949e]">La clé <span className="font-mono">{detailKey?.key}</span> sera révoquée.</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Raison</div>
                <select className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] cursor-pointer appearance-none">
                  <option>Non-paiement</option><option>Abus détecté</option><option>Clé compromise</option><option>Résiliation client</option><option>Autre</option>
                </select>
              </div>
            </div>
            <div className="p-4 pt-3 border-t border-[#21262d] flex justify-end gap-2">
              <button className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => setModal(null)}>Annuler</button>
              <button className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:bg-[rgba(248,81,73,0.08)] hover:border-[rgba(248,81,73,0.25)] hover:text-[#f85149]" onClick={confirmRevoke}><Ico d={I.trash} s={13}/> Révoquer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUDIT */}
      {modal === "audit" && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-5 animate-[kaFadeIn_0.2s]" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-[#0d1117] border border-[#30363d] w-full max-w-[540px] animate-[kaSlideUp_0.25s_cubic-bezier(0.4,0,0.2,1)]">
            <div className="p-5 pb-4 border-b border-[#21262d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[rgba(63,185,80,0.08)] border border-[rgba(63,185,80,0.25)] flex items-center justify-center text-[#3fb950]"><Ico d={I.shield} s={14}/></div>
                <span className="text-sm font-semibold">Audit sécurité</span>
              </div>
              <button className="w-6 h-6 bg-transparent border-none text-[#484f58] cursor-pointer flex items-center justify-center transition-colors duration-150 hover:text-[#e6edf3]" onClick={() => setModal(null)}><Ico d={I.close} s={14}/></button>
            </div>
            <div className="p-5 pb-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-px bg-[#21262d] border border-[#21262d] mb-5">
                {auditItems.map(s => (
                  <div key={s.label} className="bg-[#0d1117] p-3.5">
                    <div className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#484f58] mb-1.5">{s.label}</div>
                    <div className="text-[22px] font-light" style={{ color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="border border-[#21262d]">
                {Array.isArray(keys) && keys.map((k, i) => (
                  <div key={k.id} className={`flex items-center p-2.5 gap-3 bg-[#0d1117] ${i < keys.length - 1 ? "border-b border-[#21262d]" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{k.school}</div>
                      <div className="text-[10px] text-[#484f58] font-mono">{k.key}</div>
                    </div>
                    <div className="flex gap-1">
                      <span style={{ opacity: k.hwLock ? 1 : 0.2 }}><Ico d={I.chip} s={12}/></span>
                      <span style={{ opacity: k.twoFa ? 1 : 0.2 }}><Ico d={I.fingerp} s={12}/></span>
                      <span style={{ opacity: k.ipRestrict ? 1 : 0.2 }}><Ico d={I.lock} s={12}/></span>
                    </div>
                    <SecurityScore score={k.secScore}/>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 pt-3 border-t border-[#21262d] flex justify-end gap-2">
              <button className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]" onClick={() => setModal(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1c2330] border border-[#30363d] py-2.5 px-4 flex items-center gap-2.5 z-[9999] text-xs min-w-[280px] animate-[kaSlideUp_0.25s_cubic-bezier(0.4,0,0.2,1)]">
          <div className="w-1.5 h-1.5 flex-shrink-0" style={{
            background: toast.type === "green" ? "#3fb950" :
                        toast.type === "red" ? "#f85149" :
                        toast.type === "amber" ? "#d29922" : "#388bfd"
          }}/>
          {toast.msg}
        </div>
      )}
    </div>
  );
}