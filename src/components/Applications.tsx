// Applications.tsx
import { useState } from 'react';
import {
  FiBox, FiPlus, FiSearch, FiFilter, FiMoreVertical,
  FiDownload, FiRefreshCw, FiEdit2, FiTrash2,
  FiEye, FiStar, FiUsers, FiCalendar, FiClock,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiGlobe,
  FiSmartphone, FiMonitor, FiTablet, FiCpu,
  FiTrendingUp, FiTrendingDown, FiDownload as FiDownloadIcon,
  FiUpload, FiCopy, FiShare2, FiUser, FiUserCheck,
  FiUserX, FiBookOpen, FiMessageCircle, FiFlag,
  FiThumbsUp, FiThumbsDown
} from 'react-icons/fi';
import {
  HiOutlineComputerDesktop,
  HiOutlineDevicePhoneMobile,
  HiOutlineDeviceTablet,
  HiOutlineCloud,
  HiOutlineCog,
  HiOutlineBookOpen,
  HiOutlineChat,
  HiOutlineUsers
} from 'react-icons/hi2';
import { 
  SiApple, 
  SiAndroid, 
  SiReact,
  SiDocker,
  SiKubernetes,
  SiExpo,
  SiFlutter
} from 'react-icons/si';
import { BsWindows, BsBrowserChrome, BsPeople } from 'react-icons/bs';
import { MdOutlineWeb, MdOutlineSchool, MdOutlineForum } from 'react-icons/md';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { RiParentLine } from 'react-icons/ri';

// Types
interface Application {
  id: number;
  name: string;
  type: 'desktop' | 'mobile-parents' | 'mobile-teachers' | 'mobile-exams' | 'web' | 'other';
  platform: string;
  version: string;
  users: number;
  activeUsers: number;
  downloads: number;
  status: 'published' | 'beta' | 'development' | 'deprecated';
  updated: string;
  icon?: React.ElementType;
  compatibility?: string[];
  size?: string;
  rating?: number;
  developer?: string;
  downloadLinks?: {
    platform: string;
    url: string;
  }[];
}

interface ExamSubject {
  id: number;
  title: string;
  description: string;
  level: string;
  subject: string;
  author: string;
  date: string;
  downloads: number;
  status: 'published' | 'pending' | 'blocked';
  reported: boolean;
  reportCount?: number;
  flaggedBy?: string[];
}

interface ExamAppStats {
  totalSubjects: number;
  pendingSubjects: number;
  reportedSubjects: number;
  totalDownloads: number;
  activeUsers: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  type: 'student' | 'teacher' | 'parent';
  status: 'online' | 'offline';
  lastActive: string;
  reports?: number;
  blocked?: boolean;
}

interface ApplicationsProps {
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

// Données des applications principales
const apps: Application[] = [
  {
    id: 1,
    name: "Scolarys Desktop - Administration",
    type: "desktop",
    platform: "Windows / macOS / Linux",
    version: "3.2.1",
    users: 287,
    activeUsers: 156,
    downloads: 15234,
    status: "published",
    updated: "05 Fév 2026",
    icon: HiOutlineComputerDesktop,
    compatibility: ["Windows 10+", "macOS 12+", "Ubuntu 20+"],
    size: "245 MB",
    rating: 4.5,
    developer: "Scolarys Team",
    downloadLinks: [
      { platform: "Windows", url: "#" },
      { platform: "macOS", url: "#" },
      { platform: "Linux", url: "#" }
    ]
  },
  {
    id: 2,
    name: "Scolarys Parents - Suivi scolaire",
    type: "mobile-parents",
    platform: "iOS / Android",
    version: "2.8.4",
    users: 2450,
    activeUsers: 1890,
    downloads: 45231,
    status: "published",
    updated: "12 Jan 2026",
    icon: RiParentLine,
    compatibility: ["iOS 15+", "Android 10+"],
    size: "98 MB",
    rating: 4.8,
    developer: "Scolarys Mobile",
    downloadLinks: [
      { platform: "App Store", url: "#" },
      { platform: "Google Play", url: "#" }
    ]
  },
  {
    id: 3,
    name: "Scolarys Enseignants - Gestion de classe",
    type: "mobile-teachers",
    platform: "iOS / Android",
    version: "2.8.2",
    users: 1876,
    activeUsers: 1432,
    downloads: 38765,
    status: "published",
    updated: "18 Jan 2026",
    icon: FaChalkboardTeacher,
    compatibility: ["iOS 15+", "Android 10+"],
    size: "92 MB",
    rating: 4.6,
    developer: "Scolarys Mobile",
    downloadLinks: [
      { platform: "App Store", url: "#" },
      { platform: "Google Play", url: "#" }
    ]
  },
  {
    id: 4,
    name: "Scolarys Examens - Sujets & Révisions",
    type: "mobile-exams",
    platform: "iOS / Android",
    version: "1.5.0",
    users: 5678,
    activeUsers: 4230,
    downloads: 89234,
    status: "published",
    updated: "20 Fév 2026",
    icon: HiOutlineBookOpen,
    compatibility: ["iOS 15+", "Android 10+"],
    size: "78 MB",
    rating: 4.7,
    developer: "Scolarys Education",
    downloadLinks: [
      { platform: "App Store", url: "#" },
      { platform: "Google Play", url: "#" }
    ]
  }
];

// Données des sujets d'examen
const examSubjects: ExamSubject[] = [
  {
    id: 1,
    title: "Sujet Bac Maths 2024 - Série C",
    description: "Sujet complet de mathématiques avec corrigé détaillé",
    level: "Terminale",
    subject: "Mathématiques",
    author: "Jean Dupont",
    date: "15 Fév 2026",
    downloads: 1234,
    status: "published",
    reported: false
  },
  {
    id: 2,
    title: "Composition Français - Commentaire composé",
    description: "Sujet de français avec méthodologie",
    level: "Première",
    subject: "Français",
    author: "Marie Martin",
    date: "10 Fév 2026",
    downloads: 892,
    status: "published",
    reported: false
  },
  {
    id: 3,
    title: "Exercices Physique-Chimie - Révisions",
    description: "Série d'exercices corrigés",
    level: "Seconde",
    subject: "Physique-Chimie",
    author: "Pierre Lambert",
    date: "05 Fév 2026",
    downloads: 567,
    status: "pending",
    reported: false
  },
  {
    id: 4,
    title: "Sujet controversé - À vérifier",
    description: "Contenu signalé comme inapproprié",
    level: "Terminale",
    subject: "Histoire",
    author: "Utilisateur inconnu",
    date: "01 Fév 2026",
    downloads: 45,
    status: "blocked",
    reported: true,
    reportCount: 5,
    flaggedBy: ["Modérateur1", "Modérateur2"]
  },
  {
    id: 5,
    title: "Guide de révision - SVT",
    description: "Fiches de révision complètes",
    level: "Troisième",
    subject: "SVT",
    author: "Sophie Renard",
    date: "28 Jan 2026",
    downloads: 2341,
    status: "published",
    reported: false
  },
  {
    id: 6,
    title: "Sujet Bac Anglais 2023",
    description: "Sujet avec compréhension orale",
    level: "Terminale",
    subject: "Anglais",
    author: "Claire Fontaine",
    date: "20 Jan 2026",
    downloads: 1567,
    status: "published",
    reported: false
  }
];

// Données des utilisateurs
const examUsers: User[] = [
  { id: 1, name: "Thomas Dubois", email: "thomas.d@email.com", type: "student", status: "online", lastActive: "Maintenant" },
  { id: 2, name: "Sophie Martin", email: "sophie.m@email.com", type: "student", status: "online", lastActive: "Il y a 5 min" },
  { id: 3, name: "Pierre Lambert", email: "pierre.l@email.com", type: "teacher", status: "offline", lastActive: "Il y a 2h", reports: 2 },
  { id: 4, name: "Marie Dupont", email: "marie.d@email.com", type: "parent", status: "online", lastActive: "Il y a 10 min" },
  { id: 5, name: "Jean Renard", email: "jean.r@email.com", type: "student", status: "offline", lastActive: "Hier", blocked: true }
];

// Composant Status Badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { class: string; label: string; icon: React.ElementType }> = {
    published: { class: 'badge-success', label: 'Publié', icon: FiCheckCircle },
    beta: { class: 'badge-info', label: 'Beta', icon: FiAlertCircle },
    development: { class: 'badge-warning', label: 'Développement', icon: FiCpu },
    deprecated: { class: 'badge-danger', label: 'Obsolète', icon: FiXCircle },
    pending: { class: 'badge-warning', label: 'En attente', icon: FiClock },
    blocked: { class: 'badge-danger', label: 'Bloqué', icon: FiXCircle }
  };

  const config = statusConfig[status] || { class: 'badge-neutral', label: status, icon: FiAlertCircle };
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

// Composant Platform Icons
function PlatformIcons({ platform }: { platform: string }) {
  const getIcon = () => {
    if (platform.includes('Windows')) return <BsWindows size={14} />;
    if (platform.includes('macOS')) return <SiApple size={14} />;
    if (platform.includes('iOS')) return <SiApple size={14} />;
    if (platform.includes('Android')) return <SiAndroid size={14} />;
    if (platform.includes('Web')) return <BsBrowserChrome size={14} />;
    return <FiMonitor size={14} />;
  };

  return (
    <span className="platform-icon">{getIcon()}</span>
  );
}

// Composant Carte Application
function AppCard({ app, onDownload, onAction }: { app: Application; onDownload: (app: Application) => void; onAction: (action: string, app: Application) => void }) {
  const Icon = app.icon || FiBox;
  const activePercentage = Math.round((app.activeUsers / app.users) * 100);

  return (
    <div className="app-card">
      <div className="card-header">
        <div className="app-icon">
          <Icon size={24} />
        </div>
        <div className="app-status">
          <StatusBadge status={app.status} />
        </div>
      </div>

      <div className="card-content">
        <h3 className="app-name">{app.name}</h3>
        
        <div className="app-platforms">
          {app.platform.split(' / ').map((p, i) => (
            <PlatformIcons key={i} platform={p} />
          ))}
          <span className="platform-text">{app.platform}</span>
        </div>

        <div className="app-stats">
          <div className="stat-item">
            <FiDownload size={14} />
            <div>
              <span className="stat-label">Téléchargements</span>
              <span className="stat-value">{app.downloads.toLocaleString()}</span>
            </div>
          </div>
          <div className="stat-item">
            <FiUsers size={14} />
            <div>
              <span className="stat-label">Utilisateurs</span>
              <span className="stat-value">{app.users.toLocaleString()}</span>
            </div>
          </div>
          <div className="stat-item">
            <FiUserCheck size={14} />
            <div>
              <span className="stat-label">Actifs</span>
              <span className="stat-value">{app.activeUsers.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="active-users-bar">
          <div className="bar-label">
            <span>Taux d'activité</span>
            <span>{activePercentage}%</span>
          </div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${activePercentage}%` }} />
          </div>
        </div>

        <div className="app-meta">
          <span className="version">v{app.version}</span>
          <span className="updated">Mis à jour {app.updated}</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="download-buttons">
          {app.downloadLinks?.map((link, i) => (
            <button
              key={i}
              className="download-btn"
              onClick={() => onDownload(app)}
              title={`Télécharger pour ${link.platform}`}
            >
              <FiDownload size={14} />
              {link.platform}
            </button>
          ))}
        </div>
        <button className="menu-btn" onClick={() => onAction('menu', app)}>
          <FiMoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}

// Composant Sujet d'examen
function ExamSubjectCard({ subject, onAction }: { subject: ExamSubject; onAction: (action: string, subject: ExamSubject) => void }) {
  return (
    <div className={`exam-card ${subject.reported ? 'reported' : ''} ${subject.status === 'blocked' ? 'blocked' : ''}`}>
      <div className="card-header">
        <div className="subject-icon">
          <HiOutlineBookOpen size={20} />
        </div>
        <div className="subject-status">
          <StatusBadge status={subject.status} />
          {subject.reported && (
            <span className="reported-badge">
              <FiFlag size={12} /> {subject.reportCount}
            </span>
          )}
        </div>
      </div>

      <h4 className="subject-title">{subject.title}</h4>
      <p className="subject-desc">{subject.description}</p>

      <div className="subject-meta">
        <span className="level">{subject.level}</span>
        <span className="subject">{subject.subject}</span>
        <span className="author">Par {subject.author}</span>
      </div>

      <div className="subject-stats">
        <div className="stat">
          <FiDownload size={12} />
          <span>{subject.downloads}</span>
        </div>
        <div className="stat">
          <FiCalendar size={12} />
          <span>{subject.date}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="action-btn view" onClick={() => onAction('view', subject)}>
          <FiEye size={14} /> Voir
        </button>
        {subject.status !== 'blocked' ? (
          <button className="action-btn block" onClick={() => onAction('block', subject)}>
            <FiXCircle size={14} /> Bloquer
          </button>
        ) : (
          <button className="action-btn unblock" onClick={() => onAction('unblock', subject)}>
            <FiCheckCircle size={14} /> Débloquer
          </button>
        )}
        {subject.reported && (
          <button className="action-btn review" onClick={() => onAction('review', subject)}>
            <FiFlag size={14} /> Examiner
          </button>
        )}
      </div>
    </div>
  );
}

// Composant Utilisateur
function UserCard({ user, onAction }: { user: User; onAction: (action: string, user: User) => void }) {
  return (
    <div className={`user-card ${user.blocked ? 'blocked' : ''}`}>
      <div className="user-header">
        <div className="user-avatar">
          {user.name.charAt(0)}
        </div>
        <div className="user-info">
          <h4>{user.name}</h4>
          <p>{user.email}</p>
        </div>
        <div className={`status-dot ${user.status}`} />
      </div>

      <div className="user-details">
        <span className="user-type">{user.type}</span>
        <span className="last-active">{user.lastActive}</span>
      </div>

      {user.reports && user.reports > 0 && (
        <div className="user-reports">
          <FiFlag size={12} color="var(--accent-red)" />
          <span>{user.reports} signalement(s)</span>
        </div>
      )}

      <div className="user-actions">
        {!user.blocked ? (
          <button className="action-btn block" onClick={() => onAction('block', user)}>
            <FiUserX size={14} /> Bloquer
          </button>
        ) : (
          <button className="action-btn unblock" onClick={() => onAction('unblock', user)}>
            <FiUserCheck size={14} /> Débloquer
          </button>
        )}
        <button className="action-btn view" onClick={() => onAction('view', user)}>
          <FiEye size={14} /> Voir
        </button>
      </div>
    </div>
  );
}

// Composant principal
export default function Applications({ onNotify }: ApplicationsProps) {
  const [activeTab, setActiveTab] = useState<'apps' | 'exams' | 'users'>('apps');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Statistiques de l'app Examens
  const examStats: ExamAppStats = {
    totalSubjects: examSubjects.length,
    pendingSubjects: examSubjects.filter(s => s.status === 'pending').length,
    reportedSubjects: examSubjects.filter(s => s.reported).length,
    totalDownloads: examSubjects.reduce((acc, s) => acc + s.downloads, 0),
    activeUsers: apps.find(a => a.type === 'mobile-exams')?.activeUsers || 0
  };

  const handleDownload = (app: Application) => {
    onNotify(`Téléchargement de ${app.name} démarré`, 'green');
  };

  const handleAppAction = (action: string, app: Application) => {
    const messages = {
      menu: `Menu ouvert pour ${app.name}`,
      edit: `Modification de ${app.name}`,
      delete: `${app.name} supprimé`
    };
    onNotify(messages[action as keyof typeof messages] || action, 'blue');
  };

  const handleExamAction = (action: string, subject: ExamSubject) => {
    const messages = {
      view: `Consultation du sujet "${subject.title}"`,
      block: `Sujet "${subject.title}" bloqué`,
      unblock: `Sujet "${subject.title}" débloqué`,
      review: `Examen du sujet signalé "${subject.title}"`
    };
    onNotify(messages[action as keyof typeof messages] || action, 
      action === 'block' ? 'red' : action === 'unblock' ? 'green' : 'blue'
    );
  };

  const handleUserAction = (action: string, user: User) => {
    const messages = {
      block: `Utilisateur ${user.name} bloqué`,
      unblock: `Utilisateur ${user.name} débloqué`,
      view: `Profil de ${user.name} consulté`
    };
    onNotify(messages[action as keyof typeof messages] || action,
      action === 'block' ? 'red' : action === 'unblock' ? 'green' : 'blue'
    );
  };

  return (
    <div className="applications-page">
      {/* En-tête */}
      <div className="page-header">
        <h1 className="page-title">
          <FiBox size={28} />
          Applications
        </h1>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => onNotify('Données actualisées', 'green')}>
            <FiRefreshCw size={14} /> Actualiser
          </button>
          <button className="btn btn-primary" onClick={() => onNotify('Nouvelle application', 'blue')}>
            <FiPlus size={14} /> Ajouter
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'apps' ? 'active' : ''}`}
          onClick={() => setActiveTab('apps')}
        >
          <FiBox size={16} />
          Applications
        </button>
        <button
          className={`tab ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          <HiOutlineBookOpen size={16} />
          Sujets d'examen
          {examStats.reportedSubjects > 0 && (
            <span className="badge">{examStats.reportedSubjects}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers size={16} />
          Utilisateurs
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="published">Publiés</option>
            <option value="pending">En attente</option>
            <option value="blocked">Bloqués</option>
          </select>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {/* Onglet Applications */}
        {activeTab === 'apps' && (
          <div className="apps-grid">
            {apps.map(app => (
              <AppCard
                key={app.id}
                app={app}
                onDownload={handleDownload}
                onAction={handleAppAction}
              />
            ))}
          </div>
        )}

        {/* Onglet Sujets d'examen */}
        {activeTab === 'exams' && (
          <div className="exams-section">
            {/* Statistiques de l'app Examens */}
            <div className="exam-stats">
              <div className="stat-card">
                <HiOutlineBookOpen size={24} />
                <div>
                  <span className="label">Total sujets</span>
                  <span className="value">{examStats.totalSubjects}</span>
                </div>
              </div>
              <div className="stat-card">
                <FiClock size={24} style={{ color: 'var(--accent-amber)' }} />
                <div>
                  <span className="label">En attente</span>
                  <span className="value">{examStats.pendingSubjects}</span>
                </div>
              </div>
              <div className="stat-card">
                <FiFlag size={24} style={{ color: 'var(--accent-red)' }} />
                <div>
                  <span className="label">Signalés</span>
                  <span className="value">{examStats.reportedSubjects}</span>
                </div>
              </div>
              <div className="stat-card">
                <FiDownload size={24} style={{ color: 'var(--accent-blue)' }} />
                <div>
                  <span className="label">Téléchargements</span>
                  <span className="value">{examStats.totalDownloads}</span>
                </div>
              </div>
              <div className="stat-card">
                <FiUsers size={24} style={{ color: 'var(--accent-teal)' }} />
                <div>
                  <span className="label">Utilisateurs actifs</span>
                  <span className="value">{examStats.activeUsers}</span>
                </div>
              </div>
            </div>

            {/* Liste des sujets */}
            <h3 className="section-title">Sujets récents</h3>
            <div className="exams-grid">
              {examSubjects
                .filter(s => filterStatus === 'all' || s.status === filterStatus)
                .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(subject => (
                  <ExamSubjectCard
                    key={subject.id}
                    subject={subject}
                    onAction={handleExamAction}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div className="users-section">
            <h3 className="section-title">Utilisateurs de l'application Examens</h3>
            <div className="users-grid">
              {examUsers
                .filter(u => !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onAction={handleUserAction}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .applications-page {
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
          position: relative;
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

        .tab .badge {
          background: var(--accent-red);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          margin-left: 4px;
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

        .apps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        .app-card {
          background: var(--bg-panel);
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .app-card:hover {
          background: var(--bg-surface);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .app-icon {
          width: 48px;
          height: 48px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
        }

        .app-status {
          display: flex;
          gap: 8px;
        }

        .app-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .app-platforms {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .platform-icon {
          width: 28px;
          height: 28px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .platform-text {
          font-size: 12px;
          color: var(--text-muted);
        }

        .app-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-item div {
          flex: 1;
        }

        .stat-label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .stat-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .active-users-bar {
          margin-bottom: 16px;
        }

        .bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .bar {
          height: 4px;
          background: var(--bg-elevated);
        }

        .bar-fill {
          height: 100%;
          background: var(--accent-teal);
          transition: width 0.3s ease;
        }

        .app-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .version {
          font-family: var(--mono);
          color: var(--accent-blue);
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .download-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .download-btn:hover {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }

        .menu-btn {
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-btn:hover {
          background: var(--bg-surface);
          color: var(--text-primary);
        }

        /* Examens section */
        .exam-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--bg-panel);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-card .label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .stat-card .value {
          font-size: 20px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .exams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        .exam-card {
          background: var(--bg-panel);
          padding: 20px;
          position: relative;
        }

        .exam-card.reported {
          border-left: 3px solid var(--accent-red);
        }

        .exam-card.blocked {
          opacity: 0.7;
          background: var(--bg-surface);
        }

        .subject-icon {
          width: 40px;
          height: 40px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
        }

        .subject-status {
          display: flex;
          gap: 8px;
        }

        .reported-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(248, 81, 73, 0.15);
          border: 1px solid rgba(248, 81, 73, 0.3);
          color: var(--accent-red);
          font-size: 11px;
        }

        .subject-title {
          font-size: 15px;
          font-weight: 600;
          margin: 12px 0 8px;
        }

        .subject-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .subject-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 11px;
        }

        .subject-meta span {
          padding: 2px 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
        }

        .subject-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.view:hover {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }

        .action-btn.block:hover {
          background: var(--accent-red);
          border-color: var(--accent-red);
          color: white;
        }

        .action-btn.unblock:hover {
          background: var(--accent-teal);
          border-color: var(--accent-teal);
          color: black;
        }

        .action-btn.review:hover {
          background: var(--accent-amber);
          border-color: var(--accent-amber);
          color: black;
        }

        /* Users section */
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        .user-card {
          background: var(--bg-panel);
          padding: 20px;
        }

        .user-card.blocked {
          opacity: 0.6;
          background: var(--bg-surface);
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--accent-blue);
        }

        .user-info {
          flex: 1;
        }

        .user-info h4 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .user-info p {
          font-size: 11px;
          color: var(--text-muted);
        }

        .status-dot {
          width: 8px;
          height: 8px;
        }

        .status-dot.online {
          background: var(--accent-teal);
        }

        .status-dot.offline {
          background: var(--text-muted);
        }

        .user-details {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-bottom: 12px;
        }

        .user-type {
          padding: 2px 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .last-active {
          color: var(--text-muted);
        }

        .user-reports {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
          font-size: 11px;
          color: var(--accent-red);
        }

        .user-actions {
          display: flex;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
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

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
        }

        .badge-success {
          background: rgba(57, 211, 83, 0.15);
          color: var(--accent-teal);
          border: 1px solid rgba(57, 211, 83, 0.3);
        }

        .badge-warning {
          background: rgba(227, 179, 65, 0.15);
          color: var(--accent-amber);
          border: 1px solid rgba(227, 179, 65, 0.3);
        }

        .badge-danger {
          background: rgba(248, 81, 73, 0.15);
          color: var(--accent-red);
          border: 1px solid rgba(248, 81, 73, 0.3);
        }

        .badge-info {
          background: rgba(56, 139, 253, 0.15);
          color: var(--accent-blue);
          border: 1px solid rgba(56, 139, 253, 0.3);
        }

        .badge-neutral {
          background: var(--bg-elevated);
          color: var(--text-muted);
          border: 1px solid var(--border);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 1100px) {
          .exam-stats {
            grid-template-columns: repeat(3, 1fr);
          }
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

          .exam-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .apps-grid,
          .exams-grid,
          .users-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}