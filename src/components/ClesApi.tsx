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
    <span className="lang-badge">
      <Icon size={12} />
      <span>{lang.name} {lang.version}</span>
      <span className="downloads">{lang.downloads}+</span>
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
    <span className="type-badge" style={{ borderColor: color, color }}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: Algorithm['status'] }) {
  const config = {
    stable: { label: 'Stable', color: '#39d353' },
    beta: { label: 'Bêta', color: '#e3b341' },
    deprecated: { label: 'Obsolète', color: '#f85149' }
  };
  const { label, color } = config[status];
  return (
    <span className="status-badge" style={{ borderColor: color, color }}>
      {label}
    </span>
  );
}

// Carte Algorithme
function AlgorithmCard({ algo, onAction }: { algo: Algorithm; onAction: (action: string) => void }) {
  const totalDownloads = algo.languages.reduce((acc, l) => acc + l.downloads, 0);
  
  return (
    <div className="algorithm-card">
      <div className="card-header">
        <div className="title-section">
          <h3>{algo.name}</h3>
          <StatusBadge status={algo.status} />
        </div>
        <button className="menu-btn" onClick={() => onAction('menu')}>
          <FiMoreVertical size={16} />
        </button>
      </div>

      <p className="description">{algo.description}</p>

      <div className="type-tag">
        {algo.type === 'quantum' && <TbBinary size={14} />}
        {algo.type === 'encryption' && <BiLock size={14} />}
        {algo.type === 'compression' && <FiArchive size={14} />}
        <span>{algo.type}</span>
      </div>

      <div className="languages-section">
        <h4>Disponible en :</h4>
        <div className="languages-grid">
          {algo.languages.map((lang, i) => (
            <LanguageBadge key={`${algo.id}-lang-${i}`} lang={lang} />
          ))}
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <FiDownload size={14} />
          <span>{totalDownloads.toLocaleString()} téléchargements</span>
        </div>
        <div className="stat">
          <FiStar size={14} />
          <span>{algo.rating}/5</span>
        </div>
        <div className="stat">
          <FiUsers size={14} />
          <span>{algo.usage.toLocaleString()} utilisations</span>
        </div>
      </div>

      <div className="card-footer">
        <span className="version">v{algo.version}</span>
        <span className="updated">MAJ {algo.updated}</span>
        <div className="actions">
          <button className="action-btn" onClick={() => onAction('docs')}>
            <FiCode size={14} /> Docs
          </button>
          <button className="action-btn primary" onClick={() => onAction('download')}>
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
    <div className="template-card">
      <div className="preview">
        <HiOutlinePhotograph size={32} />
        <TemplateTypeBadge type={template.type} />
      </div>

      <div className="card-content">
        <h3>{template.name}</h3>
        <p>{template.description}</p>

        <div className="tags">
          {template.tags.map((tag, i) => (
            <span key={`${template.id}-tag-${i}`} className="tag">#{tag}</span>
          ))}
        </div>

        <div className="template-meta">
          <span><FiLayers size={12} /> {template.category}</span>
          <span><FiDownload size={12} /> {template.downloads}</span>
          <span><FiUsers size={12} /> {template.uses} utilisations</span>
        </div>

        <div className="card-footer">
          <span className="format">{template.format}</span>
          {template.customizable && (
            <span className="customizable">Personnalisable</span>
          )}
          <div className="actions">
            <button className="action-btn" onClick={() => onAction('preview')}>
              <FiEye size={14} /> Aperçu
            </button>
            <button className="action-btn primary" onClick={() => onAction('edit')}>
              <FiEdit2 size={14} /> Modifier
            </button>
            <button className="action-btn" onClick={() => onAction('download')}>
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
    <div className="apikey-card">
      <div className="card-header">
        <div>
          <h3>{apiKey.name}</h3>
          {apiKey.algorithm && <span className="algo-tag">{apiKey.algorithm}</span>}
        </div>
        <button className="menu-btn" onClick={() => onAction('menu')}>
          <FiMoreVertical size={16} />
        </button>
      </div>

      <div className="key-display">
        <code>{displayKey}</code>
        <div className="key-actions">
          <button onClick={() => setShowFullKey(!showFullKey)}>
            {showFullKey ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          </button>
          <button onClick={() => onCopy(apiKey.key)}>
            <FiCopy size={14} />
          </button>
        </div>
      </div>

      <div className="key-meta">
        <span><FiCalendar size={12} /> Créée {apiKey.created}</span>
        <span><FiActivity size={12} /> {apiKey.requests} requêtes</span>
        <span><FiClock size={12} /> {apiKey.lastUsed}</span>
      </div>

      <div className="card-footer">
        <span className={`status ${apiKey.status}`}>{apiKey.status}</span>
        <div className="actions">
          <button className="action-btn" onClick={() => onAction('edit')}>
            <FiEdit2 size={14} />
          </button>
          <button className="action-btn" onClick={() => onAction('refresh')}>
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
    <div className="api-page">
      {/* En-tête */}
      <div className="page-header">
        <h1 className="page-title">
          <BiCodeBlock size={28} />
          Développeurs & Templates
        </h1>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => onNotify('Données actualisées', 'green')}>
            <FiRefreshCw size={14} /> Actualiser
          </button>
          <button className="btn btn-primary" onClick={handleCreateClick}>
            <FiPlus size={14} /> Nouvel algorithme
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'algorithms' ? 'active' : ''}`}
          onClick={() => setActiveTab('algorithms')}
        >
          <HiOutlineChip size={16} />
          Algorithmes ({algorithms.length})
        </button>
        <button
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <HiOutlineTemplate size={16} />
          Templates ({templates.length})
        </button>
        <button
          className={`tab ${activeTab === 'keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('keys')}
        >
          <FiKey size={16} />
          Clés API ({apiKeys.length})
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-section">
        <div className="search-box">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter">
          <FiFilter size={16} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
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
          <div className="algorithms-grid">
            {filteredAlgorithms.map(algo => (
              <AlgorithmCard key={`algo-${algo.id}`} algo={algo} onAction={handleAction} />
            ))}
          </div>
        )}

        {/* Templates */}
        {activeTab === 'templates' && (
          <div className="templates-grid">
            {filteredTemplates.map(template => (
              <TemplateCard key={`template-${template.id}`} template={template} onAction={handleAction} />
            ))}
          </div>
        )}

        {/* Clés API */}
        {activeTab === 'keys' && (
          <div className="keys-grid">
            {filteredKeys.map(key => (
              <ApiKeyCard key={`apikey-${key.id}`} apiKey={key} onAction={handleAction} onCopy={handleCopyKey} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .api-page {
          animation: fadeIn 0.4s ease;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--bg-surface);
        }

        .tab.active {
          color: var(--accent-blue);
          border-bottom-color: var(--accent-blue);
          background: var(--bg-elevated);
        }

        .search-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 13px;
        }

        .search-box input:focus {
          outline: none;
        }

        .filter {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
        }

        .filter select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 13px;
        }

        .filter select:focus {
          outline: none;
        }

        /* Grilles */
        .algorithms-grid,
        .templates-grid,
        .keys-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        /* Cartes algorithmes */
        .algorithm-card {
          background: var(--bg-panel);
          padding: 24px;
        }

        .algorithm-card .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .algorithm-card .title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .algorithm-card h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .algorithm-card .description {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .type-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .languages-section {
          margin-bottom: 20px;
        }

        .languages-section h4 {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .languages-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .lang-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          font-size: 11px;
        }

        .lang-badge .downloads {
          color: var(--text-muted);
          font-size: 10px;
          margin-left: 4px;
        }

        .algorithm-card .stats {
          display: flex;
          gap: 20px;
          padding: 16px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .algorithm-card .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .algorithm-card .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .algorithm-card .version {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--accent-blue);
        }

        .algorithm-card .updated {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Cartes templates */
        .template-card {
          background: var(--bg-panel);
          display: flex;
          gap: 20px;
          padding: 20px;
        }

        .template-card .preview {
          width: 120px;
          height: 120px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-muted);
        }

        .template-card .card-content {
          flex: 1;
        }

        .template-card h3 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .template-card p {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .tag {
          padding: 2px 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          font-size: 10px;
          color: var(--text-muted);
        }

        .template-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .template-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .template-card .card-footer {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .format {
          padding: 2px 8px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .customizable {
          padding: 2px 8px;
          background: rgba(57, 211, 83, 0.15);
          border: 1px solid rgba(57, 211, 83, 0.3);
          font-size: 10px;
          color: var(--accent-teal);
        }

        /* Cartes clés API */
        .apikey-card {
          background: var(--bg-panel);
          padding: 20px;
        }

        .apikey-card .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .apikey-card h3 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .algo-tag {
          font-size: 11px;
          color: var(--accent-blue);
        }

        .key-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          font-family: var(--mono);
          font-size: 12px;
          margin-bottom: 12px;
        }

        .key-actions {
          display: flex;
          gap: 4px;
        }

        .key-actions button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
        }

        .key-actions button:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .key-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .key-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .apikey-card .status {
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status.active {
          background: rgba(57, 211, 83, 0.15);
          color: var(--accent-teal);
          border: 1px solid rgba(57, 211, 83, 0.3);
        }

        .status.inactive {
          background: var(--bg-elevated);
          color: var(--text-muted);
          border: 1px solid var(--border);
        }

        .status.expired {
          background: rgba(227, 179, 65, 0.15);
          color: var(--accent-amber);
          border: 1px solid rgba(227, 179, 65, 0.3);
        }

        .status.revoked {
          background: rgba(248, 81, 73, 0.15);
          color: var(--accent-red);
          border: 1px solid rgba(248, 81, 73, 0.3);
        }

        .apikey-card .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Actions communes */
        .actions {
          display: flex;
          gap: 6px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--bg-elevated);
          border-color: var(--border-bright);
          color: var(--text-primary);
        }

        .action-btn.primary {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }

        .action-btn.primary:hover {
          background: #58a6ff;
        }

        .menu-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
        }

        .menu-btn:hover {
          background: var(--bg-surface);
          color: var(--text-primary);
        }

        .type-badge, .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border: 1px solid;
          font-size: 10px;
          background: transparent;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .btn-primary {
          background: var(--accent-blue);
          color: white;
        }

        .btn-primary:hover {
          background: #58a6ff;
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .btn-ghost:hover {
          border-color: var(--border-bright);
          color: var(--text-primary);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .tabs {
            overflow-x: auto;
          }

          .search-section {
            flex-direction: column;
          }

          .algorithms-grid,
          .templates-grid,
          .keys-grid {
            grid-template-columns: 1fr;
          }

          .template-card {
            flex-direction: column;
          }

          .template-card .preview {
            width: 100%;
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
}