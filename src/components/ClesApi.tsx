import { useState } from 'react';
import {
  FiKey, FiPlus, FiCopy, FiRefreshCw,
  FiSearch, FiFilter, FiMoreVertical, FiEye, FiEyeOff,
  FiClock, FiCalendar, FiActivity,
  FiDownload,
  FiEdit2, FiCode,
  FiArchive, FiUsers,
  FiStar, FiLayers
} from 'react-icons/fi';
import {
  HiOutlineChip,
  HiOutlineTemplate,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import { BiCodeBlock, BiLock } from 'react-icons/bi';
import { SiRust, SiCplusplus, SiC, SiPython, SiJavascript, SiTypescript, SiGo, SiPhp } from 'react-icons/si';
import { TbBinary } from 'react-icons/tb';
import { FaJava } from "react-icons/fa";

// Types pour les algorithmes
interface Algorithm {
  id: number;
  name: string;
  description: string;
  type: 'encryption' | 'compression' | 'image-processing' | 'quantum' | 'ai';
  languages: {
    name: string;
    icon: React.ElementType;
    version: string;
    downloads: number;
  }[];
  version: string;
  created: string;
  updated: string;
  status: 'stable' | 'beta' | 'deprecated';
  usage: number;
  rating: number;
  documentation: string;
}

// Types pour les templates
interface Template {
  id: number;
  name: string;
  type: 'badge' | 'invoice' | 'certificate' | 'report';
  category: string;
  preview: string;
  description: string;
  format: 'pdf' | 'png' | 'svg' | 'html';
  downloads: number;
  uses: number;
  created: string;
  tags: string[];
  customizable: boolean;
}

// Types pour les clés API
interface ApiKey {
  id: number;
  name: string;
  key: string;
  scope: 'read' | 'write' | 'read, write' | 'admin';
  created: string;
  requests: string;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  lastUsed?: string;
  expiresAt?: string;
  algorithm?: string;
}

interface ApiPagesProps {
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

// Données des algorithmes
const algorithms: Algorithm[] = [
  {
    id: 1,
    name: "NovaQuantum Crypt",
    description: "Algorithme de cryptage quantique post-quantique basé sur les réseaux euclidiens. Résistant aux attaques des ordinateurs quantiques.",
    type: "quantum",
    languages: [
      { name: "Rust", icon: SiRust, version: "1.2.0", downloads: 1234 },
      { name: "C++", icon: SiCplusplus, version: "2.0.1", downloads: 3456 },
      { name: "C", icon: SiC, version: "1.5.0", downloads: 2345 },
      { name: "Java", icon: FaJava, version: "1.8.0", downloads: 1876 },
      { name: "Python", icon: SiPython, version: "3.9.0", downloads: 5678 }
    ],
    version: "2.1.0",
    created: "10 Jan 2025",
    updated: "15 Fév 2026",
    status: "stable",
    usage: 15678,
    rating: 4.8,
    documentation: "/docs/quantum-crypt"
  },
  {
    id: 2,
    name: "NovaImageCompress",
    description: "Transforme les images en texte compressé avec ratio 10:1. Stockage optimisé sans serveur, reconstruction parfaite.",
    type: "compression",
    languages: [
      { name: "Rust", icon: SiRust, version: "1.0.0", downloads: 892 },
      { name: "C++", icon: SiCplusplus, version: "1.2.0", downloads: 1456 },
      { name: "Java", icon: FaJava, version: "1.1.0", downloads: 2341 },
      { name: "Python", icon: SiPython, version: "2.0.0", downloads: 4567 },
      { name: "JavaScript", icon: SiJavascript, version: "1.5.0", downloads: 6789 },
      { name: "TypeScript", icon: SiTypescript, version: "1.5.0", downloads: 4321 },
      { name: "Go", icon: SiGo, version: "1.0.0", downloads: 987 }
    ],
    version: "2.0.0",
    created: "05 Fév 2025",
    updated: "20 Fév 2026",
    status: "stable",
    usage: 23456,
    rating: 4.9,
    documentation: "/docs/image-compress"
  },
  {
    id: 3,
    name: "NovaEncrypt",
    description: "Cryptage symétrique/asymétrique haute performance avec gestion des clés et rotation automatique.",
    type: "encryption",
    languages: [
      { name: "Rust", icon: SiRust, version: "2.1.0", downloads: 3456 },
      { name: "C++", icon: SiCplusplus, version: "3.0.0", downloads: 5678 },
      { name: "C", icon: SiC, version: "2.0.0", downloads: 2345 },
      { name: "Java", icon: FaJava, version: "2.5.0", downloads: 4321 },
      { name: "Python", icon: SiPython, version: "3.2.0", downloads: 7890 },
      { name: "Go", icon: SiGo, version: "1.8.0", downloads: 2341 },
      { name: "PHP", icon: SiPhp, version: "2.0.0", downloads: 1234 }
    ],
    version: "3.1.0",
    created: "20 Déc 2024",
    updated: "10 Fév 2026",
    status: "stable",
    usage: 34567,
    rating: 4.7,
    documentation: "/docs/encrypt"
  }
];

// Données des templates
const templates: Template[] = [
  {
    id: 1,
    name: "Badge scolaire moderne",
    type: "badge",
    category: "Élève",
    preview: "badge-modern.png",
    description: "Badge épuré avec photo, nom, classe et QR code pour pointage",
    format: "png",
    downloads: 2345,
    uses: 456,
    created: "01 Jan 2026",
    tags: ["élève", "qr-code", "moderne"],
    customizable: true
  },
  {
    id: 2,
    name: "Badge professeur premium",
    type: "badge",
    category: "Professeur",
    preview: "badge-teacher.png",
    description: "Badge avec photo, titre, département et accès prioritaires",
    format: "svg",
    downloads: 1234,
    uses: 234,
    created: "05 Jan 2026",
    tags: ["professeur", "premium", "accès"],
    customizable: true
  },
  {
    id: 3,
    name: "Facture standard",
    type: "invoice",
    category: "Facturation",
    preview: "invoice-standard.png",
    description: "Template de facture professionnelle avec logo, TVA et conditions",
    format: "pdf",
    downloads: 5678,
    uses: 1234,
    created: "10 Jan 2026",
    tags: ["facture", "professionnel", "tva"],
    customizable: true
  },
  {
    id: 4,
    name: "Badge visiteur temporaire",
    type: "badge",
    category: "Visiteur",
    preview: "badge-visitor.png",
    description: "Badge temporaire avec date d'expiration et zone d'accès",
    format: "png",
    downloads: 892,
    uses: 156,
    created: "15 Jan 2026",
    tags: ["visiteur", "temporaire", "sécurité"],
    customizable: true
  },
  {
    id: 5,
    name: "Facture détaillée",
    type: "invoice",
    category: "Facturation",
    preview: "invoice-detailed.png",
    description: "Facture avec tableau détaillé, échéances et conditions de paiement",
    format: "pdf",
    downloads: 3456,
    uses: 789,
    created: "20 Jan 2026",
    tags: ["facture", "détaillé", "échéance"],
    customizable: true
  },
  {
    id: 6,
    name: "Certificat de scolarité",
    type: "certificate",
    category: "Document",
    preview: "certificate.png",
    description: "Certificat officiel avec sceau et signature numérique",
    format: "pdf",
    downloads: 2341,
    uses: 567,
    created: "25 Jan 2026",
    tags: ["certificat", "officiel", "scolarité"],
    customizable: true
  }
];

// Données des clés API
const apiKeys: ApiKey[] = [
  {
    id: 1,
    name: "NovaQuantum Crypt - Production",
    key: "nqc_live_xK9mP2qR4tW8zY3n",
    scope: "read, write",
    created: "01 Jan 2026",
    requests: "45,678",
    status: "active",
    lastUsed: "Il y a 5 min",
    expiresAt: "01 Jan 2027",
    algorithm: "NovaQuantum Crypt"
  },
  {
    id: 2,
    name: "NovaImageCompress - API",
    key: "nic_live_aB7nC3dE5fG8hJ2k",
    scope: "write",
    created: "15 Jan 2026",
    requests: "123,456",
    status: "active",
    lastUsed: "Il y a 2 min",
    algorithm: "NovaImageCompress"
  },
  {
    id: 3,
    name: "NovaEncrypt - Service",
    key: "ne_live_dE4oF5gH6iJ9kL1m",
    scope: "read, write",
    created: "20 Jan 2026",
    requests: "89,123",
    status: "active",
    lastUsed: "Il y a 15 min",
    algorithm: "NovaEncrypt"
  }
];

// Composants de badges
function LanguageBadge({ lang }: { lang: Algorithm['languages'][0] }) {
  const Icon = lang.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] border border-[#21262d] text-[11px]">
      <Icon size={12} />
      <span>{lang.name} {lang.version}</span>
      <span className="text-[10px] text-[#484f58] ml-1">{lang.downloads}+</span>
    </span>
  );
}

function TemplateTypeBadge({ type }: { type: Template['type'] }) {
  const config = {
    badge: { icon: HiOutlinePhotograph, label: 'Badge', color: '#388bfd' },
    invoice: { icon: HiOutlineDocumentText, label: 'Facture', color: '#39d353' },
    certificate: { icon: HiOutlineDocumentText, label: 'Certificat', color: '#e3b341' },
    report: { icon: HiOutlineDocumentText, label: 'Rapport', color: '#a5a0e8' }
  };
  const { icon: Icon, label, color } = config[type];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-transparent border" style={{ borderColor: color, color }}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: Algorithm['status'] }) {
  const config = {
    stable: { label: 'Stable', color: '#39d353', bg: 'bg-[rgba(57,211,83,0.08)]', border: 'border-[rgba(57,211,83,0.25)]' },
    beta: { label: 'Bêta', color: '#e3b341', bg: 'bg-[rgba(227,179,65,0.08)]', border: 'border-[rgba(227,179,65,0.25)]' },
    deprecated: { label: 'Obsolète', color: '#f85149', bg: 'bg-[rgba(248,81,73,0.08)]', border: 'border-[rgba(248,81,73,0.25)]' }
  };
  const { label, color, bg, border } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] ${bg} border ${border}`} style={{ color }}>
      {label}
    </span>
  );
}

// Carte Algorithme
function AlgorithmCard({ algo, onAction }: { algo: Algorithm; onAction: (action: string) => void }) {
  const totalDownloads = algo.languages.reduce((acc, l) => acc + l.downloads, 0);
  
  return (
    <div className="bg-[#0d1117] p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold">{algo.name}</h3>
          <StatusBadge status={algo.status} />
        </div>
        <button className="w-8 h-8 flex items-center justify-center bg-transparent border border-[#21262d] text-[#484f58] cursor-pointer hover:bg-[#161b22] hover:text-[#e6edf3]" onClick={() => onAction('menu')}>
          <FiMoreVertical size={16} />
        </button>
      </div>

      <p className="text-[13px] text-[#8b949e] leading-relaxed mb-4">{algo.description}</p>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1c2330] border border-[#21262d] text-[11px] uppercase mb-4">
        {algo.type === 'quantum' && <TbBinary size={14} />}
        {algo.type === 'encryption' && <BiLock size={14} />}
        {algo.type === 'compression' && <FiArchive size={14} />}
        <span>{algo.type}</span>
      </div>

      <div className="mb-5">
        <h4 className="text-xs font-medium text-[#484f58] mb-3">Disponible en :</h4>
        <div className="flex flex-wrap gap-2">
          {algo.languages.map((lang, i) => (
            <LanguageBadge key={`${algo.id}-lang-${i}`} lang={lang} />
          ))}
        </div>
      </div>

      <div className="flex gap-5 py-4 border-t border-b border-[#21262d] mb-4">
        <div className="flex items-center gap-1.5 text-xs text-[#484f58]">
          <FiDownload size={14} />
          <span>{totalDownloads.toLocaleString()} téléchargements</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#484f58]">
          <FiStar size={14} />
          <span>{algo.rating}/5</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#484f58]">
          <FiUsers size={14} />
          <span>{algo.usage.toLocaleString()} utilisations</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[#388bfd]">v{algo.version}</span>
        <span className="text-[11px] text-[#484f58]">MAJ {algo.updated}</span>
        <div className="flex gap-1.5">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onAction('docs')}>
            <FiCode size={14} /> Docs
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#388bfd] border border-[#388bfd] text-white text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#58a6ff]" onClick={() => onAction('download')}>
            <FiDownload size={14} /> Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}

// Carte Template
function TemplateCard({ template, onAction }: { template: Template; onAction: (action: string) => void }) {
  return (
    <div className="bg-[#0d1117] flex gap-5 p-5 max-[768px]:flex-col">
      <div className="w-[120px] h-[120px] bg-[#161b22] border border-[#21262d] flex flex-col items-center justify-center gap-3 text-[#484f58] max-[768px]:w-full max-[768px]:h-[100px]">
        <HiOutlinePhotograph size={32} />
        <TemplateTypeBadge type={template.type} />
      </div>

      <div className="flex-1">
        <h3 className="text-[15px] font-semibold mb-2">{template.name}</h3>
        <p className="text-xs text-[#8b949e] mb-3">{template.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {template.tags.map((tag, i) => (
            <span key={`${template.id}-tag-${i}`} className="px-2 py-0.5 bg-[#161b22] border border-[#21262d] text-[10px] text-[#484f58]">#{tag}</span>
          ))}
        </div>

        <div className="flex gap-4 mb-4 text-[11px] text-[#484f58]">
          <span className="flex items-center gap-1"><FiLayers size={12} /> {template.category}</span>
          <span className="flex items-center gap-1"><FiDownload size={12} /> {template.downloads}</span>
          <span className="flex items-center gap-1"><FiUsers size={12} /> {template.uses} utilisations</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-[#1c2330] border border-[#21262d] text-[10px] uppercase text-[#484f58]">{template.format}</span>
          {template.customizable && (
            <span className="px-2 py-0.5 bg-[rgba(57,211,83,0.08)] border border-[rgba(57,211,83,0.25)] text-[10px] text-[#39d353]">Personnalisable</span>
          )}
          <div className="flex gap-1.5 ml-auto">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onAction('preview')}>
              <FiEye size={14} /> Aperçu
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onAction('edit')}>
              <FiEdit2 size={14} /> Modifier
            </button>
            <button className="inline-flex items-center justify-center w-8 h-8 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onAction('download')}>
              <FiDownload size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Carte Clé API
function ApiKeyCard({ apiKey, onAction, onCopy }: { apiKey: ApiKey; onAction: (action: string) => void; onCopy: (key: string) => void }) {
  const [showFullKey, setShowFullKey] = useState(false);
  const displayKey = showFullKey ? apiKey.key : `${apiKey.key.substring(0, 20)}...`;

  return (
    <div className="bg-[#0d1117] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold mb-1">{apiKey.name}</h3>
          {apiKey.algorithm && <span className="text-[11px] text-[#388bfd]">{apiKey.algorithm}</span>}
        </div>
        <button className="w-8 h-8 flex items-center justify-center bg-transparent border border-[#21262d] text-[#484f58] cursor-pointer hover:bg-[#161b22] hover:text-[#e6edf3]" onClick={() => onAction('menu')}>
          <FiMoreVertical size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between p-3 bg-[#161b22] border border-[#21262d] font-mono text-xs mb-3">
        <code>{displayKey}</code>
        <div className="flex gap-1">
          <button className="w-7 h-7 flex items-center justify-center bg-transparent border border-[#21262d] text-[#484f58] cursor-pointer hover:bg-[#1c2330] hover:text-[#e6edf3]" onClick={() => setShowFullKey(!showFullKey)}>
            {showFullKey ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          </button>
          <button className="w-7 h-7 flex items-center justify-center bg-transparent border border-[#21262d] text-[#484f58] cursor-pointer hover:bg-[#1c2330] hover:text-[#e6edf3]" onClick={() => onCopy(apiKey.key)}>
            <FiCopy size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 py-3 border-t border-b border-[#21262d] mb-4 text-[11px] text-[#484f58]">
        <span className="flex items-center gap-1"><FiCalendar size={12} /> Créée {apiKey.created}</span>
        <span className="flex items-center gap-1"><FiActivity size={12} /> {apiKey.requests} requêtes</span>
        <span className="flex items-center gap-1"><FiClock size={12} /> {apiKey.lastUsed}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 text-[11px] font-medium capitalize ${
          apiKey.status === 'active' ? 'bg-[rgba(57,211,83,0.08)] text-[#39d353] border border-[rgba(57,211,83,0.25)]' :
          apiKey.status === 'inactive' ? 'bg-[#1c2330] text-[#484f58] border border-[#21262d]' :
          apiKey.status === 'expired' ? 'bg-[rgba(227,179,65,0.08)] text-[#e3b341] border border-[rgba(227,179,65,0.25)]' :
          'bg-[rgba(248,81,73,0.08)] text-[#f85149] border border-[rgba(248,81,73,0.25)]'
        }`}>{apiKey.status}</span>
        <div className="flex gap-1.5">
          <button className="inline-flex items-center justify-center w-8 h-8 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onAction('edit')}>
            <FiEdit2 size={14} />
          </button>
          <button className="inline-flex items-center justify-center w-8 h-8 bg-transparent border border-[#21262d] text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onAction('refresh')}>
            <FiRefreshCw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant principal
export default function ApiPages({ onNotify }: ApiPagesProps) {
  const [activeTab, setActiveTab] = useState<'algorithms' | 'templates' | 'keys'>('algorithms');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredAlgorithms = algorithms.filter(algo =>
    algo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    algo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.tags.some(tag => tag.includes(searchTerm.toLowerCase()))
  );

  const filteredKeys = apiKeys.filter(key =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.algorithm?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    onNotify('Clé copiée', 'green');
  };

  const handleAction = (action: string) => {
    const messages: Record<string, string> = {
      download: 'Téléchargement démarré',
      edit: 'Modification en cours',
      delete: 'Élément supprimé',
      docs: 'Documentation ouverte',
      preview: 'Aperçu généré',
      menu: 'Menu ouvert',
      refresh: 'Clé régénérée'
    };
    onNotify(messages[action] || 'Action effectuée', 'blue');
  };

  const handleCreateClick = () => {
    onNotify('Création d\'un nouvel algorithme', 'blue');
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 max-[768px]:flex-col max-[768px]:items-start">
        <h1 className="flex items-center gap-3 text-2xl font-semibold">
          <BiCodeBlock size={28} />
          Développeurs & Templates
        </h1>
        <div className="flex gap-2 max-[768px]:w-full max-[768px]:mt-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onNotify('Données actualisées', 'green')}>
            <FiRefreshCw size={14} /> Actualiser
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={handleCreateClick}>
            <FiPlus size={14} /> Nouvel algorithme
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-[#21262d] overflow-x-auto">
        <button
          className={`flex items-center gap-2 px-5 py-3 bg-transparent border-none border-b-2 border-transparent text-[#8b949e] cursor-pointer text-[13px] font-medium transition-all duration-200 hover:text-[#e6edf3] hover:bg-[#161b22] ${activeTab === 'algorithms' ? '!text-[#388bfd] !border-b-[#388bfd] !bg-[#1c2330]' : ''}`}
          onClick={() => setActiveTab('algorithms')}
        >
          <HiOutlineChip size={16} />
          Algorithmes ({algorithms.length})
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 bg-transparent border-none border-b-2 border-transparent text-[#8b949e] cursor-pointer text-[13px] font-medium transition-all duration-200 hover:text-[#e6edf3] hover:bg-[#161b22] ${activeTab === 'templates' ? '!text-[#388bfd] !border-b-[#388bfd] !bg-[#1c2330]' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <HiOutlineTemplate size={16} />
          Templates ({templates.length})
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 bg-transparent border-none border-b-2 border-transparent text-[#8b949e] cursor-pointer text-[13px] font-medium transition-all duration-200 hover:text-[#e6edf3] hover:bg-[#161b22] ${activeTab === 'keys' ? '!text-[#388bfd] !border-b-[#388bfd] !bg-[#1c2330]' : ''}`}
          onClick={() => setActiveTab('keys')}
        >
          <FiKey size={16} />
          Clés API ({apiKeys.length})
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-4 mb-6 max-[768px]:flex-col">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-[#161b22] border border-[#21262d]">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none text-[#e6edf3] text-[13px] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-[#21262d]">
          <FiFilter size={16} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-transparent border-none text-[#e6edf3] text-[13px] focus:outline-none">
            <option value="all">Tous</option>
            <option value="encryption">Cryptage</option>
            <option value="compression">Compression</option>
            <option value="quantum">Quantique</option>
            <option value="badge">Badges</option>
            <option value="invoice">Factures</option>
          </select>
        </div>
      </div>

      {/* Contenu */}
      <div className="tab-content">
        {/* Algorithmes */}
        {activeTab === 'algorithms' && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(450px,1fr))] gap-px bg-[#21262d] border border-[#21262d] max-[768px]:grid-cols-1">
            {filteredAlgorithms.map(algo => (
              <AlgorithmCard key={`algo-${algo.id}`} algo={algo} onAction={handleAction} />
            ))}
          </div>
        )}

        {/* Templates */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(450px,1fr))] gap-px bg-[#21262d] border border-[#21262d] max-[768px]:grid-cols-1">
            {filteredTemplates.map(template => (
              <TemplateCard key={`template-${template.id}`} template={template} onAction={handleAction} />
            ))}
          </div>
        )}

        {/* Clés API */}
        {activeTab === 'keys' && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(450px,1fr))] gap-px bg-[#21262d] border border-[#21262d] max-[768px]:grid-cols-1">
            {filteredKeys.map(key => (
              <ApiKeyCard key={`apikey-${key.id}`} apiKey={key} onAction={handleAction} onCopy={handleCopyKey} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}