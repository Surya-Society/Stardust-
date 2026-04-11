// Applications.tsx
import { useState } from 'react';
import {
  FiBox, FiSearch, FiRefreshCw, FiSettings, FiArrowLeft,
  FiSmartphone, FiMonitor, FiGlobe, FiStar,
  FiBookOpen, 
  FiChevronRight, FiDownload
} from 'react-icons/fi';
import { HiOutlineComputerDesktop } from 'react-icons/hi2';
import { FaChalkboardTeacher} from 'react-icons/fa';
import { RiParentLine } from 'react-icons/ri';

import ScolarysApp from './Scolarys';
import ParentsApp  from './ParentApp';
import TeachersApp from './EliteApp';
import ExamLabApp  from './ExamLabApp';
import EliteApp    from './EliteApp';

interface ApplicationModule {
  id: string;
  name: string;
  description: string;
  type: 'desktop' | 'mobile' | 'web';
  icon: React.ElementType;
  status: 'active' | 'beta' | 'development';
  version: string;
  component: React.ComponentType<any>;
  downloadUrl?: string;
  stats?: {
    users?: number;
    activeUsers?: number;
    rating?: number;
  };
}

interface ApplicationsProps {
  onNavigate?: (appId: string) => void;
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

// Configuration des applications (sans le site web)
const applications: ApplicationModule[] = [
  {
    id: 'scolarys',
    name: 'Scolarys',
    description: 'Logiciel de gestion d\'école - Administration complète',
    type: 'desktop',
    icon: HiOutlineComputerDesktop,
    status: 'active',
    version: '3.2.1',
    component: ScolarysApp,
    downloadUrl: 'https://nova.com/downloads/scolarys-latest.exe',
    stats: {
      users: 287,
      activeUsers: 156,
      rating: 4.5
    }
  },
  {
    id: 'parents',
    name: 'Espace Parents',
    description: 'Suivi scolaire, notes, absences, communications',
    type: 'mobile',
    icon: RiParentLine,
    status: 'active',
    version: '2.8.4',
    component: ParentsApp,
    downloadUrl: 'https://nova.com/downloads/parents-app.apk',
    stats: {
      users: 2450,
      activeUsers: 1890,
      rating: 4.8
    }
  },
  {
    id: 'teachers',
    name: 'Espace Enseignants',
    description: 'Performances des classes, emplois du temps, notes',
    type: 'mobile',
    icon: FaChalkboardTeacher,
    status: 'active',
    version: '2.8.2',
    component: TeachersApp,
    downloadUrl: 'https://nova.com/downloads/teachers-app.apk',
    stats: {
      users: 1876,
      activeUsers: 1432,
      rating: 4.6
    }
  },
  {
    id: 'examlab',
    name: 'ExLab',
    description: 'Sujets d\'examen, révisions, annales corrigées',
    type: 'mobile',
    icon: FiBookOpen,
    status: 'active',
    version: '1.5.0',
    component: ExamLabApp,
    downloadUrl: 'https://nova.com/downloads/examlab.apk',
    stats: {
      users: 5678,
      activeUsers: 4230,
      rating: 4.7
    }
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Classement des meilleurs professeurs par étoiles',
    type: 'web',
    icon: FiStar,
    status: 'beta',
    version: '1.0.0',
    component: EliteApp,
    downloadUrl: 'https://nova.com/elite',
    stats: {
      users: 1234,
      activeUsers: 892,
      rating: 4.2
    }
  }
];

// Badge de statut
function StatusBadge({ status }: { status: ApplicationModule['status'] }) {
  const config = {
    active: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', label: 'Actif' },
    beta: { bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', label: 'Beta' },
    development: { bg: 'bg-[rgba(56,139,253,0.15)]', text: 'text-[#388bfd]', label: 'Développement' }
  };
  const style = config[status];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

// Icône de type d'application
function TypeIcon({ type }: { type: ApplicationModule['type'] }) {
  const icons = {
    desktop: <FiMonitor size={14} />,
    mobile: <FiSmartphone size={14} />,
    web: <FiGlobe size={14} />
  };
  return (
    <span className="text-[#484f58]">
      {icons[type]}
    </span>
  );
}

// Carte d'application
function AppCard({ 
  app, 
  onOpenApp,
  onDownload,
  onNotify 
}: { 
  app: ApplicationModule; 
  onOpenApp: (app: ApplicationModule) => void;
  onDownload: (app: ApplicationModule) => void;
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}) {
  const Icon = app.icon;
  const activePercentage = app.stats?.users && app.stats?.activeUsers
    ? Math.round((app.stats.activeUsers / app.stats.users) * 100)
    : 0;

  const handleOpen = () => {
    onNotify(`Ouverture de ${app.name}`, 'blue');
    onOpenApp(app);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNotify(`Téléchargement de ${app.name} démarré`, 'green');
    onDownload(app);
  };

  return (
    <div className="bg-[#0d1117] border border-[#21262d] hover:border-[#30363d] transition-all duration-200">
      <div className="p-5">
        {/* En-tête avec icône et statut */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#388bfd] rounded-lg">
            <Icon size={24} />
          </div>
          <div className="flex items-center gap-2">
            <TypeIcon type={app.type} />
            <StatusBadge status={app.status} />
          </div>
        </div>

        {/* Informations principales */}
        <h3 className="text-lg font-semibold mb-1">{app.name}</h3>
        <p className="text-xs text-[#8b949e] leading-relaxed mb-4">{app.description}</p>

        {/* Version */}
        <div className="flex items-center gap-2 mb-4 text-[11px] text-[#484f58]">
          <FiSettings size={12} />
          <span>v{app.version}</span>
        </div>

        {/* Statistiques */}
        {app.stats && (
          <div className="mb-4 p-3 bg-[#161b22] border border-[#21262d]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase text-[#484f58]">Utilisateurs</span>
              <span className="text-sm font-medium text-[#e6edf3]">
                {app.stats.activeUsers?.toLocaleString()} / {app.stats.users?.toLocaleString()}
              </span>
            </div>
            {activePercentage > 0 && (
              <>
                <div className="h-1 bg-[#1c2330] mb-2">
                  <div className="h-full bg-[#39d353] transition-all duration-300" style={{ width: `${activePercentage}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-[#484f58]">
                  <span>Taux d'activité</span>
                  <span>{activePercentage}%</span>
                </div>
              </>
            )}
            {app.stats.rating && (
              <div className="flex items-center gap-1 mt-2 text-[11px]">
                <FiStar size={12} className="text-[#e3b341]" />
                <span className="text-[#e6edf3]">{app.stats.rating}</span>
                <span className="text-[#484f58]">/ 5</span>
              </div>
            )}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-2">
          <button
            onClick={handleOpen}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#388bfd] text-white text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#58a6ff]"
          >
            Ouvrir
            <FiChevronRight size={14} />
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#161b22] border border-[#21262d] text-[#8b949e] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:text-[#e6edf3]"
          >
            <FiDownload size={14} />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant principal
export default function Applications({ onNotify }: ApplicationsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationModule | null>(null);

  const handleOpenApp = (app: ApplicationModule) => {
    setSelectedApp(app);
  };

  const handleBackToList = () => {
    setSelectedApp(null);
  };

  const handleDownload = (app: ApplicationModule) => {
    if (app.downloadUrl) {
      // Ouvrir l'URL de téléchargement dans un nouvel onglet
      window.open(app.downloadUrl, '_blank');
    }
  };

  const filteredApps = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si une application est sélectionnée, afficher son composant
  if (selectedApp) {
    const AppComponent = selectedApp.component;
    
    return (
      <div className="animate-[fadeIn_0.4s_ease] ">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors rounded-lg"
            >
              <FiArrowLeft size={16} />
              Retour aux applications
            </button>
            <div className="w-px h-6 bg-[#21262d]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#388bfd] rounded-lg">
                {selectedApp.icon && <selectedApp.icon size={18} />}
              </div>
              <div>
                <h1 className="text-lg font-semibold">{selectedApp.name}</h1>
                <p className="text-xs text-[#8b949e]">Gestion de l'application</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload(selectedApp)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors rounded-lg"
            >
              <FiDownload size={12} /> Télécharger
            </button>
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors rounded-lg"
            >
              <FiRefreshCw size={12} /> Actualiser
            </button>
          </div>
        </div>

        {/* Contenu de l'application */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden">
          <AppComponent onNotify={onNotify} />
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Sinon, afficher la liste des applications
  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold mb-1">
            <FiBox size={28} />
            Applications
          </h1>
          <p className="text-sm text-[#8b949e]">Gérez l'ensemble des applications de l'écosystème Nova</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-[#21262d] bg-transparent text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]"
            onClick={() => onNotify('Données actualisées', 'green')}
          >
            <FiRefreshCw size={14} /> Actualiser
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#161b22] border border-[#21262d] mb-6 max-[768px]:w-full">
        <FiSearch size={16} className="text-[#484f58]" />
        <input
          type="text"
          placeholder="Rechercher une application..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none text-[#e6edf3] text-[13px] placeholder:text-[#484f58] focus:outline-none"
        />
      </div>

      {/* Grille des applications */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-4 max-[768px]:grid-cols-1">
        {filteredApps.map(app => (
          <AppCard
            key={app.id}
            app={app}
            onOpenApp={handleOpenApp}
            onDownload={handleDownload}
            onNotify={onNotify}
          />
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <FiBox size={48} className="mx-auto text-[#21262d] mb-4" />
          <p className="text-[#8b949e]">Aucune application trouvée</p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}