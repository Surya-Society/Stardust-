// ParentsApp.tsx
import { useState, useEffect } from 'react';
import {
  FiUserCheck, FiActivity, FiTrendingUp,
  FiTrendingDown, FiBarChart2, FiRefreshCw, FiSearch,
  FiEye, FiClock, FiUserPlus, FiMail, FiPhone,
  FiMoreVertical, FiBell, FiMessageSquare, FiMonitor,
  FiSmartphone, FiTablet, FiWifi, FiCalendar
} from 'react-icons/fi';
import {
  HiOutlineUsers
} from 'react-icons/hi';
import { FaChild } from 'react-icons/fa';
import { MdOutlineNotificationsActive } from 'react-icons/md';

// ============================================================================
// TYPES
// ============================================================================

interface Parent {
  id: string;
  name: string;
  firstName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  registrationDate: string;
  lastActive: string;
  children: Child[];
  notifications: Notification[];
  preferences: ParentPreferences;
  stats: ParentStats;
}

interface Child {
  id: string;
  name: string;
  firstName: string;
  class: string;
  level: string;
  school: string;
  avatar?: string;
  performance: {
    avgGrade: number;
    rank: number;
    totalStudents: number;
    successRate: number;
    attendanceRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  recentGrades: Grade[];
  upcomingEvents: Event[];
  absences: Absence[];
  communications: Communication[];
}

interface Grade {
  id: string;
  subject: string;
  value: number;
  coefficient: number;
  date: string;
  type: 'exam' | 'quiz' | 'homework' | 'participation';
  teacher: string;
  comment?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'meeting' | 'holiday' | 'activity';
  description?: string;
}

interface Absence {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  justified: boolean;
  teacher: string;
}

interface Communication {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  important: boolean;
  attachments?: string[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
  actionUrl?: string;
}

interface ParentPreferences {
  language: 'fr' | 'en';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    grades: boolean;
    absences: boolean;
    events: boolean;
    communications: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

interface ParentStats {
  totalChildren: number;
  totalMessages: number;
  unreadMessages: number;
  pendingAbsences: number;
  upcomingExams: number;
  avgGrade: number;
  notificationsCount: number;
}

interface OnlineUser {
  id: string;
  name: string;
  type: 'parent' | 'child' | 'teacher';
  lastActive: string;
  device: 'desktop' | 'mobile' | 'tablet';
  online: boolean;
}

interface DashboardStats {
  totalParents: number;
  activeParents: number;
  onlineParents: number;
  totalChildren: number;
  activeChildren: number;
  messagesSent: number;
  notificationsSent: number;
  avgResponseTime: number;
}

// ============================================================================
// COMPOSANTS UI
// ============================================================================

function StatCard({ icon: Icon, label, value, trend, subtitle, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-[#21262d] p-5 transition-all duration-200 hover:border-[#30363d]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 flex items-center justify-center ${color || 'bg-[#1c2330]'}`}>
          <Icon size={24} className={color?.replace('bg-', 'text-') || 'text-[#388bfd]'} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 ${
            trend.isPositive ? 'bg-[rgba(57,211,83,0.1)] text-[#39d353]' : 'bg-[rgba(248,81,73,0.1)] text-[#f85149]'
          }`}>
            {trend.isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-semibold text-[#e6edf3]">{value}</div>
      <div className="text-sm text-[#484f58] mt-1">{label}</div>
      {subtitle && <div className="text-xs text-[#8b949e] mt-2">{subtitle}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: Parent['status'] | 'online' | 'offline' | 'pending' }) {
  const config: Record<string, { bg: string; text: string; label: string; dot?: string }> = {
    active: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', label: 'Actif', dot: 'bg-[#39d353]' },
    inactive: { bg: 'bg-[rgba(139,148,158,0.15)]', text: 'text-[#8b949e]', label: 'Inactif', dot: 'bg-[#8b949e]' },
    suspended: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', label: 'Suspendu', dot: 'bg-[#f85149]' },
    online: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', label: 'En ligne', dot: 'bg-[#39d353]' },
    offline: { bg: 'bg-[rgba(139,148,158,0.15)]', text: 'text-[#8b949e]', label: 'Hors ligne', dot: 'bg-[#8b949e]' },
    pending: { bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', label: 'En attente', dot: 'bg-[#e3b341]' }
  };
  const style = config[status] || config.active;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}>
      {style.dot && <span className={`w-1.5 h-1.5 ${style.dot}`} />}
      {style.label}
    </span>
  );
}

function DeviceIcon({ device }: { device: OnlineUser['device'] }) {
  const icons = {
    desktop: <FiMonitor size={12} />,
    mobile: <FiSmartphone size={12} />,
    tablet: <FiTablet size={12} />
  };
  return icons[device] || <FiMonitor size={12} />;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

interface ParentsAppProps {
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
  onNavigate?: (path: string) => void;
}

export default function ParentsApp({ onNotify }: ParentsAppProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'parents' | 'children' | 'communications' | 'notifications' | 'analytics'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [parents, setParents] = useState<Parent[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Simulation des données
  useEffect(() => {
    loadParents();
    loadOnlineUsers();
    loadDashboardStats();
    
    const interval = setInterval(() => {
      updateOnlineStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadParents = async () => {
    setTimeout(() => {
      setParents([
        {
          id: '1',
          name: 'Martin',
          firstName: 'Sophie',
          email: 'sophie.martin@email.com',
          phone: '+33 6 12 34 56 78',
          status: 'active',
          registrationDate: '2024-09-01',
          lastActive: new Date().toISOString(),
          children: [
            {
              id: '101',
              name: 'Martin',
              firstName: 'Thomas',
              class: 'Terminale C',
              level: 'Terminale',
              school: 'Lycée Victor Hugo',
              performance: {
                avgGrade: 14.5,
                rank: 12,
                totalStudents: 32,
                successRate: 85,
                attendanceRate: 94,
                trend: 'up'
              },
              recentGrades: [
                { id: 'g1', subject: 'Mathématiques', value: 15, coefficient: 4, date: '2026-03-25', type: 'exam', teacher: 'M. Dupont', comment: 'Très bon travail' },
                { id: 'g2', subject: 'Physique', value: 13, coefficient: 3, date: '2026-03-20', type: 'exam', teacher: 'Mme. Bernard' },
                { id: 'g3', subject: 'Français', value: 16, coefficient: 3, date: '2026-03-18', type: 'exam', teacher: 'M. Laurent' }
              ],
              upcomingEvents: [
                { id: 'e1', title: 'Devoir de Mathématiques', date: '2026-04-10', type: 'exam' },
                { id: 'e2', title: 'Réunion parents-professeurs', date: '2026-04-15', type: 'meeting' }
              ],
              absences: [
                { id: 'a1', date: '2026-03-10', startTime: '08:00', endTime: '10:00', reason: 'Maladie', justified: true, teacher: 'M. Dupont' }
              ],
              communications: [
                { id: 'c1', from: 'teacher', fromName: 'M. Dupont', to: 'parent', subject: 'Progression de Thomas', message: 'Thomas fait des progrès remarquables en mathématiques.', date: '2026-03-28', read: false, important: true }
              ]
            },
            {
              id: '102',
              name: 'Martin',
              firstName: 'Léa',
              class: 'Seconde B',
              level: 'Seconde',
              school: 'Lycée Victor Hugo',
              performance: {
                avgGrade: 12.8,
                rank: 18,
                totalStudents: 30,
                successRate: 75,
                attendanceRate: 98,
                trend: 'stable'
              },
              recentGrades: [
                { id: 'g4', subject: 'Mathématiques', value: 11, coefficient: 4, date: '2026-03-25', type: 'exam', teacher: 'M. Dupont' },
                { id: 'g5', subject: 'Anglais', value: 14, coefficient: 2, date: '2026-03-22', type: 'exam', teacher: 'Mme. Wilson' }
              ],
              upcomingEvents: [
                { id: 'e3', title: 'Contrôle d\'Anglais', date: '2026-04-12', type: 'exam' }
              ],
              absences: [],
              communications: []
            }
          ],
          notifications: [
            { id: 'n1', title: 'Nouvelle note disponible', message: 'Thomas a reçu une note de 15/20 en Mathématiques', type: 'success', date: '2026-03-25T14:30:00', read: false },
            { id: 'n2', title: 'Absence justifiée', message: 'L\'absence de Thomas du 10/03 a été justifiée', type: 'info', date: '2026-03-11T09:00:00', read: true }
          ],
          preferences: {
            language: 'fr',
            notifications: {
              email: true,
              sms: false,
              push: true,
              grades: true,
              absences: true,
              events: true,
              communications: true
            },
            theme: 'dark'
          },
          stats: {
            totalChildren: 2,
            totalMessages: 5,
            unreadMessages: 1,
            pendingAbsences: 0,
            upcomingExams: 3,
            avgGrade: 13.65,
            notificationsCount: 1
          }
        },
        {
          id: '2',
          name: 'Dubois',
          firstName: 'Jean',
          email: 'jean.dubois@email.com',
          phone: '+33 6 98 76 54 32',
          status: 'active',
          registrationDate: '2024-08-15',
          lastActive: new Date(Date.now() - 3600000).toISOString(),
          children: [
            {
              id: '201',
              name: 'Dubois',
              firstName: 'Lucas',
              class: 'Première D',
              level: 'Première',
              school: 'Lycée Victor Hugo',
              performance: {
                avgGrade: 16.2,
                rank: 3,
                totalStudents: 28,
                successRate: 95,
                attendanceRate: 100,
                trend: 'up'
              },
              recentGrades: [],
              upcomingEvents: [],
              absences: [],
              communications: []
            }
          ],
          notifications: [],
          preferences: {
            language: 'fr',
            notifications: {
              email: true,
              sms: true,
              push: true,
              grades: true,
              absences: true,
              events: true,
              communications: true
            },
            theme: 'dark'
          },
          stats: {
            totalChildren: 1,
            totalMessages: 12,
            unreadMessages: 3,
            pendingAbsences: 0,
            upcomingExams: 2,
            avgGrade: 16.2,
            notificationsCount: 2
          }
        },
        {
          id: '3',
          name: 'Bernard',
          firstName: 'Marie',
          email: 'marie.bernard@email.com',
          phone: '+33 6 45 67 89 01',
          status: 'inactive',
          registrationDate: '2024-10-01',
          lastActive: new Date(Date.now() - 86400000 * 7).toISOString(),
          children: [
            {
              id: '301',
              name: 'Bernard',
              firstName: 'Emma',
              class: 'Troisième A',
              level: 'Troisième',
              school: 'Collège Jean Moulin',
              performance: {
                avgGrade: 11.5,
                rank: 22,
                totalStudents: 29,
                successRate: 65,
                attendanceRate: 82,
                trend: 'down'
              },
              recentGrades: [],
              upcomingEvents: [],
              absences: [],
              communications: []
            }
          ],
          notifications: [],
          preferences: {
            language: 'fr',
            notifications: {
              email: true,
              sms: false,
              push: false,
              grades: true,
              absences: true,
              events: true,
              communications: true
            },
            theme: 'dark'
          },
          stats: {
            totalChildren: 1,
            totalMessages: 3,
            unreadMessages: 0,
            pendingAbsences: 2,
            upcomingExams: 1,
            avgGrade: 11.5,
            notificationsCount: 0
          }
        }
      ]);
    }, 500);
  };

  const loadOnlineUsers = async () => {
    setOnlineUsers([
      { id: '1', name: 'Sophie Martin', type: 'parent', lastActive: new Date().toISOString(), device: 'mobile', online: true },
      { id: '2', name: 'Jean Dubois', type: 'parent', lastActive: new Date(Date.now() - 1800000).toISOString(), device: 'desktop', online: false },
      { id: '101', name: 'Thomas Martin', type: 'child', lastActive: new Date().toISOString(), device: 'mobile', online: true },
      { id: '102', name: 'Léa Martin', type: 'child', lastActive: new Date(Date.now() - 7200000).toISOString(), device: 'tablet', online: false },
      { id: '201', name: 'Lucas Dubois', type: 'child', lastActive: new Date().toISOString(), device: 'desktop', online: true },
      { id: 't1', name: 'M. Dupont', type: 'teacher', lastActive: new Date().toISOString(), device: 'desktop', online: true }
    ]);
  };

  const updateOnlineStatus = () => {
    setOnlineUsers(prev => prev.map(user => ({
      ...user,
      online: Math.random() > 0.3,
      lastActive: new Date().toISOString()
    })));
  };

  const loadDashboardStats = async () => {
    setDashboardStats({
      totalParents: 156,
      activeParents: 142,
      onlineParents: 38,
      totalChildren: 287,
      activeChildren: 245,
      messagesSent: 1234,
      notificationsSent: 5678,
      avgResponseTime: 2.5
    });
  };

  const getOnlineCount = () => {
    return onlineUsers.filter(u => u.online && u.type === 'parent').length;
  };

  const getActivePercentage = () => {
    if (!dashboardStats) return 0;
    return Math.round((dashboardStats.activeParents / dashboardStats.totalParents) * 100);
  };

  const filteredParents = parents.filter(p =>
    `${p.firstName} ${p.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-[fadeIn_0.4s_ease] w-full p-4">
      {/* En-tête avec stats en temps réel */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#388bfd]">
              <HiOutlineUsers size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Application Parents</h1>
              <p className="text-sm text-[#8b949e] mt-1">Gestion des comptes parents et suivi scolaire</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border border-[#21262d]">
              <div className="flex items-center gap-1">
                <FiWifi size={12} className={getOnlineCount() > 0 ? 'text-[#39d353]' : 'text-[#484f58]'} />
                <span className="text-xs text-[#e6edf3]">{getOnlineCount()}</span>
              </div>
              <div className="w-px h-3 bg-[#21262d]" />
              <div className="flex items-center gap-1">
                <FiActivity size={12} className="text-[#388bfd]" />
                <span className="text-xs text-[#e6edf3]">{getActivePercentage()}%</span>
              </div>
            </div>
            <button 
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              onClick={() => { loadParents(); onNotify('Données actualisées', 'green'); }}
            >
              <FiRefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>

        {/* Stats Dashboard - Responsive */}
        {dashboardStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              icon={HiOutlineUsers}
              label="Parents inscrits"
              value={dashboardStats.totalParents}
              subtitle={`${dashboardStats.activeParents} actifs`}
              color="bg-[rgba(56,139,253,0.1)] text-[#388bfd]"
            />
            <StatCard
              icon={FiUserCheck}
              label="En ligne"
              value={getOnlineCount()}
              trend={{ value: 12, isPositive: true }}
              color="bg-[rgba(57,211,83,0.1)] text-[#39d353]"
            />
            <StatCard
              icon={FaChild}
              label="Élèves suivis"
              value={dashboardStats.totalChildren}
              subtitle={`${dashboardStats.activeChildren} actifs`}
              color="bg-[rgba(227,179,65,0.1)] text-[#e3b341]"
            />
            <StatCard
              icon={FiMessageSquare}
              label="Messages échangés"
              value={dashboardStats.messagesSent}
              trend={{ value: 8, isPositive: true }}
              color="bg-[rgba(139,148,158,0.1)] text-[#8b949e]"
            />
            <StatCard
              icon={FiBell}
              label="Notifications"
              value={dashboardStats.notificationsSent}
              color="bg-[rgba(56,139,253,0.1)] text-[#388bfd]"
            />
            <StatCard
              icon={FiClock}
              label="Temps réponse moyen"
              value={`${dashboardStats.avgResponseTime}h`}
              trend={{ value: 5, isPositive: false }}
              color="bg-[rgba(248,81,73,0.1)] text-[#f85149]"
            />
          </div>
        )}
      </div>

      {/* Navigation - Scrollable sur mobile */}
      <div className="flex gap-2 mb-8 border-b border-[#21262d] overflow-x-auto pb-px">
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'dashboard' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="flex items-center gap-2">
            <FiBarChart2 size={14} /> Tableau de bord
          </span>
        </button>
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'parents' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('parents')}
        >
          <span className="flex items-center gap-2">
            <HiOutlineUsers size={14} /> Parents
          </span>
        </button>
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'children' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('children')}
        >
          <span className="flex items-center gap-2">
            <FaChild size={14} /> Élèves
          </span>
        </button>
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'communications' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('communications')}
        >
          <span className="flex items-center gap-2">
            <FiMessageSquare size={14} /> Communications
          </span>
        </button>
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'notifications' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          <span className="flex items-center gap-2">
            <FiBell size={14} /> Notifications
            {parents.reduce((acc, p) => acc + p.stats.notificationsCount, 0) > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-[#f85149] text-white">
                {parents.reduce((acc, p) => acc + p.stats.notificationsCount, 0)}
              </span>
            )}
          </span>
        </button>
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'analytics' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="flex items-center gap-2">
            <FiBarChart2 size={14} /> Analytics
          </span>
        </button>
      </div>

      {/* Contenu principal - Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Utilisateurs en ligne */}
          <div className="bg-[#0d1117] border border-[#21262d] p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Utilisateurs en ligne</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#39d353] animate-pulse" />
                  <span className="text-sm text-[#484f58]">{onlineUsers.filter(u => u.online).length} en ligne</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {onlineUsers.filter(u => u.online).slice(0, 8).map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-[#161b22] border border-[#21262d]">
                  <div className="relative">
                    <div className="w-10 h-10 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-sm font-semibold text-[#388bfd]">
                      {user.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#39d353] border-2 border-[#161b22]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium">{user.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[#484f58]">
                      <span className="capitalize">{user.type}</span>
                      <DeviceIcon device={user.device} />
                    </div>
                  </div>
                  <StatusBadge status="online" />
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <h3 className="text-base font-semibold mb-5">Activité récente</h3>
              <div className="space-y-4">
                {parents.slice(0, 5).map((parent) => (
                  <div key={parent.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-sm font-semibold text-[#388bfd]">
                      {parent.firstName.charAt(0)}{parent.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-base">{parent.firstName} {parent.name}</p>
                      <p className="text-xs text-[#484f58]">Dernière activité: {new Date(parent.lastActive).toLocaleString()}</p>
                    </div>
                    <StatusBadge status={parent.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <h3 className="text-base font-semibold mb-5">Notifications récentes</h3>
              <div className="space-y-4">
                {parents.flatMap(p => p.notifications).slice(0, 5).map((notif) => (
                  <div key={notif.id} className={`p-3 border border-[#21262d] ${!notif.read ? 'bg-[#1c2330]' : 'bg-transparent'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 mt-1.5 ${
                        notif.type === 'success' ? 'bg-[#39d353]' :
                        notif.type === 'warning' ? 'bg-[#e3b341]' :
                        notif.type === 'error' ? 'bg-[#f85149]' : 'bg-[#388bfd]'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-[#8b949e]">{notif.message}</p>
                        <p className="text-xs text-[#484f58] mt-1">{new Date(notif.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parents */}
      {activeTab === 'parents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border border-[#21262d] flex-1">
              <FiSearch size={16} className="text-[#484f58]" />
              <input
                type="text"
                placeholder="Rechercher un parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none text-[#e6edf3] text-[14px] placeholder:text-[#484f58] focus:outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#388bfd] text-white text-[13px] font-medium hover:bg-[#58a6ff] transition-colors">
              <FiUserPlus size={14} /> Nouveau parent
            </button>
          </div>

          <div className="space-y-4">
            {filteredParents.map((parent) => (
              <div key={parent.id} className="bg-[#0d1117] border border-[#21262d] overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    <div className="flex gap-5">
                      <div className="w-16 h-16 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-xl font-semibold text-[#388bfd]">
                        {parent.firstName.charAt(0)}{parent.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-lg font-semibold">{parent.firstName} {parent.name}</h3>
                          <StatusBadge status={parent.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#484f58] mb-2">
                          <span className="flex items-center gap-1"><FiMail size={14} /> {parent.email}</span>
                          <span className="flex items-center gap-1"><FiPhone size={14} /> {parent.phone}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="text-[#8b949e]">{parent.children.length} enfant(s)</span>
                          <span className="text-[#8b949e]">Inscrit le {new Date(parent.registrationDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <FiClock size={12} className="text-[#484f58]" />
                            <span className="text-[#8b949e]">Dernière activité: {new Date(parent.lastActive).toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-9 h-9 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                        <FiEye size={16} />
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                        <FiMessageSquare size={16} />
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                        <FiMoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-[#21262d]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm text-[#484f58]">Messages non lus</div>
                        <div className="text-xl font-semibold">{parent.stats.unreadMessages}</div>
                      </div>
                      <div>
                        <div className="text-sm text-[#484f58]">Examens à venir</div>
                        <div className="text-xl font-semibold">{parent.stats.upcomingExams}</div>
                      </div>
                      <div>
                        <div className="text-sm text-[#484f58]">Moyenne générale</div>
                        <div className="text-xl font-semibold">{parent.stats.avgGrade}/20</div>
                      </div>
                      <div>
                        <div className="text-sm text-[#484f58]">Notifications</div>
                        <div className="text-xl font-semibold">{parent.stats.notificationsCount}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Élèves */}
      {activeTab === 'children' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border border-[#21262d]">
            <FiSearch size={16} className="text-[#484f58]" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              className="flex-1 bg-transparent border-none text-[#e6edf3] text-[14px] placeholder:text-[#484f58] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {parents.flatMap(p => p.children.map(child => ({ ...child, parentName: `${p.firstName} ${p.name}` }))).map((child) => (
              <div key={child.id} className="bg-[#0d1117] border border-[#21262d] overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-lg font-semibold text-[#388bfd]">
                        {child.firstName.charAt(0)}{child.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{child.firstName} {child.name}</h3>
                        <p className="text-sm text-[#8b949e] mt-1">{child.class} - {child.school}</p>
                        <p className="text-xs text-[#484f58] mt-1">Parent: {child.parentName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 ${child.performance.trend === 'up' ? 'bg-[#39d353]' : child.performance.trend === 'down' ? 'bg-[#f85149]' : 'bg-[#e3b341]'}`} />
                      <span className="text-sm capitalize">{child.performance.trend}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-center">
                    <div className="p-3 bg-[#161b22] border border-[#21262d]">
                      <div className="text-xs text-[#484f58]">Moyenne</div>
                      <div className="text-xl font-semibold">{child.performance.avgGrade}/20</div>
                    </div>
                    <div className="p-3 bg-[#161b22] border border-[#21262d]">
                      <div className="text-xs text-[#484f58]">Rang</div>
                      <div className="text-xl font-semibold">{child.performance.rank}/{child.performance.totalStudents}</div>
                    </div>
                    <div className="p-3 bg-[#161b22] border border-[#21262d]">
                      <div className="text-xs text-[#484f58]">Réussite</div>
                      <div className="text-xl font-semibold">{child.performance.successRate}%</div>
                    </div>
                    <div className="p-3 bg-[#161b22] border border-[#21262d]">
                      <div className="text-xs text-[#484f58]">Assiduité</div>
                      <div className="text-xl font-semibold">{child.performance.attendanceRate}%</div>
                    </div>
                  </div>

                  {child.recentGrades.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-[#21262d]">
                      <h4 className="text-sm font-semibold mb-3">Dernières notes</h4>
                      <div className="space-y-3">
                        {child.recentGrades.slice(0, 3).map((grade) => (
                          <div key={grade.id} className="flex items-center justify-between">
                            <div>
                              <span className="text-base text-[#e6edf3]">{grade.subject}</span>
                              <span className="text-xs text-[#484f58] ml-2">Coef. {grade.coefficient}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-base font-semibold ${grade.value >= 10 ? 'text-[#39d353]' : 'text-[#f85149]'}`}>
                                {grade.value}/20
                              </span>
                              <span className="text-xs text-[#484f58]">{new Date(grade.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {child.upcomingEvents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#21262d]">
                      <div className="flex items-center gap-2 text-sm text-[#484f58]">
                        <FiCalendar size={14} />
                        <span>Événements à venir: {child.upcomingEvents.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Communications */}
      {activeTab === 'communications' && (
        <div className="bg-[#0d1117] border border-[#21262d] overflow-hidden">
          <div className="p-5 border-b border-[#21262d] bg-[#161b22]">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-sm font-medium text-[#484f58]">
              <div className="sm:col-span-2">Message</div>
              <div>De/À</div>
              <div>Date</div>
              <div>Statut</div>
            </div>
          </div>
          <div className="divide-y divide-[#21262d]">
            {parents.flatMap(p => 
              p.children.flatMap(c => 
                c.communications.map(comm => ({ ...comm, childName: `${c.firstName} ${c.name}`, parentName: `${p.firstName} ${p.name}` }))
              )
            ).map((comm) => (
              <div key={comm.id} className={`p-5 ${!comm.read ? 'bg-[#1c2330]' : ''}`}>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-start">
                  <div className="sm:col-span-2">
                    <p className="text-base font-medium">{comm.subject}</p>
                    <p className="text-sm text-[#8b949e] line-clamp-1 mt-1">{comm.message}</p>
                  </div>
                  <div>
                    <p className="text-base">{comm.fromName}</p>
                    <p className="text-sm text-[#484f58] mt-1">À: {comm.parentName}</p>
                  </div>
                  <div className="text-sm text-[#484f58]">{new Date(comm.date).toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    {comm.important && (
                      <span className="px-2 py-0.5 text-[10px] bg-[rgba(248,81,73,0.15)] text-[#f85149]">Important</span>
                    )}
                    {!comm.read && (
                      <span className="w-2 h-2 bg-[#388bfd]" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {parents.flatMap(p => 
            p.notifications.map(n => ({ ...n, parentName: `${p.firstName} ${p.name}` }))
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((notif) => (
            <div key={notif.id} className={`bg-[#0d1117] border border-[#21262d] p-5 ${!notif.read ? 'border-l-[3px] border-l-[#388bfd]' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 flex items-center justify-center ${
                  notif.type === 'success' ? 'bg-[rgba(57,211,83,0.1)] text-[#39d353]' :
                  notif.type === 'warning' ? 'bg-[rgba(227,179,65,0.1)] text-[#e3b341]' :
                  notif.type === 'error' ? 'bg-[rgba(248,81,73,0.1)] text-[#f85149]' : 'bg-[rgba(56,139,253,0.1)] text-[#388bfd]'
                }`}>
                  <MdOutlineNotificationsActive size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <h4 className="text-base font-semibold">{notif.title}</h4>
                    <span className="text-xs text-[#484f58]">{new Date(notif.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[#8b949e] mb-2">{notif.message}</p>
                  <p className="text-xs text-[#484f58]">Parent: {notif.parentName}</p>
                  {!notif.read && (
                    <button className="mt-2 text-sm text-[#388bfd] hover:underline">Marquer comme lu</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <h3 className="text-base font-semibold mb-5">Adoption de l'application</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Taux d'activation</span>
                    <span className="text-[#388bfd]">{getActivePercentage()}%</span>
                  </div>
                  <div className="h-2 bg-[#1c2330] overflow-hidden">
                    <div className="h-full bg-[#388bfd]" style={{ width: `${getActivePercentage()}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Notifications lues</span>
                    <span className="text-[#39d353]">78%</span>
                  </div>
                  <div className="h-2 bg-[#1c2330] overflow-hidden">
                    <div className="h-full bg-[#39d353]" style={{ width: '78%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Messages répondus</span>
                    <span className="text-[#e3b341]">65%</span>
                  </div>
                  <div className="h-2 bg-[#1c2330] overflow-hidden">
                    <div className="h-full bg-[#e3b341]" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <h3 className="text-base font-semibold mb-5">Répartition des parents</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base">Actifs</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-[#1c2330] overflow-hidden">
                      <div className="h-full bg-[#39d353]" style={{ width: `${(dashboardStats?.activeParents || 0) / (dashboardStats?.totalParents || 1) * 100}%` }} />
                    </div>
                    <span className="text-base text-[#39d353]">{dashboardStats?.activeParents}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base">Inactifs</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-[#1c2330] overflow-hidden">
                      <div className="h-full bg-[#8b949e]" style={{ width: `${((dashboardStats?.totalParents || 0) - (dashboardStats?.activeParents || 0)) / (dashboardStats?.totalParents || 1) * 100}%` }} />
                    </div>
                    <span className="text-base text-[#8b949e]">{(dashboardStats?.totalParents || 0) - (dashboardStats?.activeParents || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1117] border border-[#21262d] p-5">
            <h3 className="text-base font-semibold mb-5">Préférences de notification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#161b22] border border-[#21262d]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base">Email</span>
                  <span className="text-sm text-[#39d353]">78% activé</span>
                </div>
                <div className="h-2 bg-[#1c2330] overflow-hidden">
                  <div className="h-full bg-[#39d353]" style={{ width: '78%' }} />
                </div>
              </div>
              <div className="p-4 bg-[#161b22] border border-[#21262d]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base">Push</span>
                  <span className="text-sm text-[#388bfd]">65% activé</span>
                </div>
                <div className="h-2 bg-[#1c2330] overflow-hidden">
                  <div className="h-full bg-[#388bfd]" style={{ width: '65%' }} />
                </div>
              </div>
              <div className="p-4 bg-[#161b22] border border-[#21262d]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base">SMS</span>
                  <span className="text-sm text-[#e3b341]">42% activé</span>
                </div>
                <div className="h-2 bg-[#1c2330] overflow-hidden">
                  <div className="h-full bg-[#e3b341]" style={{ width: '42%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}