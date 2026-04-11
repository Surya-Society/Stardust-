// EliteApp.tsx
import { useState, useEffect } from 'react';
import {
  FiStar, FiTrendingUp, FiTrendingDown, FiSearch,
  FiRefreshCw, FiThumbsUp, FiFlag, FiCheckCircle,
  FiXCircle, FiClock, FiBarChart2, FiCalendar,
  FiMapPin, FiMail, FiPhone, FiUserCheck, FiUserX,
  FiChevronDown, FiActivity
} from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { MdOutlineVerified } from 'react-icons/md';

// ============================================================================
// TYPES
// ============================================================================

interface Teacher {
  id: string;
  name: string;
  firstName: string;
  email: string;
  phone: string;
  school: string;
  schoolId: string;
  department: string;
  subject: string;
  avatar?: string;
  bio: string;
  experience: number;
  qualifications: string[];
  achievements: Achievement[];
  stats: TeacherStats;
  rating: Rating;
  status: 'active' | 'pending' | 'suspended' | 'banned';
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  joinedAt: string;
  lastActive: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  totalHours: number;
  avgGrade: number;
  successRate: number;
  attendanceRate: number;
  totalReviews: number;
  totalRatings: number;
  totalReports: number;
  rank: number;
  rankChange: number;
  trend: 'up' | 'down' | 'stable';
}

interface Rating {
  average: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categories: {
    teaching: number;
    clarity: number;
    availability: number;
    fairness: number;
    engagement: number;
  };
  recentReviews: Review[];
}

interface Review {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  categories: {
    teaching: number;
    clarity: number;
    availability: number;
    fairness: number;
    engagement: number;
  };
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  reported: boolean;
  response?: {
    content: string;
    date: string;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  verified: boolean;
}

interface Report {
  id: string;
  teacherId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  actionTaken?: string;
}

interface TopTeacher {
  teacher: Teacher;
  rank: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

interface DashboardStats {
  totalTeachers: number;
  activeTeachers: number;
  pendingTeachers: number;
  verifiedTeachers: number;
  totalReviews: number;
  avgRating: number;
  topTeachers: TopTeacher[];
  topSubjects: { subject: string; count: number; avgRating: number }[];
  topSchools: { school: string; count: number; avgRating: number }[];
  recentReviews: Review[];
  pendingReports: number;
}

// ============================================================================
// COMPOSANTS UI
// ============================================================================

function StatCard({ icon: Icon, label, value, trend, subtitle, color, onClick }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  color?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      className={`bg-[#0d1117] border border-[#21262d] p-5 transition-all duration-200 hover:border-[#30363d] ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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

function StatusBadge({ status }: { status: Teacher['status'] | 'pending' | 'reviewed' | 'dismissed' | 'action_taken' }) {
  const config: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    active: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', label: 'Actif', icon: FiCheckCircle },
    pending: { bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', label: 'En attente', icon: FiClock },
    suspended: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', label: 'Suspendu', icon: FiXCircle },
    banned: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', label: 'Banni', icon: FiXCircle },
    reviewed: { bg: 'bg-[rgba(56,139,253,0.15)]', text: 'text-[#388bfd]', label: 'Examiné', icon: FiCheckCircle },
    dismissed: { bg: 'bg-[rgba(139,148,158,0.15)]', text: 'text-[#8b949e]', label: 'Rejeté', icon: FiXCircle },
    action_taken: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', label: 'Action prise', icon: FiFlag }
  };
  const style = config[status] || config.pending;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}>
      <Icon size={10} />
      {style.label}
    </span>
  );
}

function RatingStars({ rating, size = 14, count, showNumber = false }: { 
  rating: number; 
  size?: number; 
  count?: number;
  showNumber?: boolean;
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            size={size}
            className={`${
              i < fullStars
                ? 'text-[#e3b341] fill-[#e3b341]'
                : i === fullStars && hasHalfStar
                ? 'text-[#e3b341]'
                : 'text-[#21262d]'
            }`}
          />
        ))}
      </div>
      {showNumber && <span className="text-xs text-[#e6edf3] ml-1">{rating.toFixed(1)}</span>}
      {count && <span className="text-[10px] text-[#484f58] ml-1">({count})</span>}
    </div>
  );
}

function CategoryRating({ label, rating }: { label: string; rating: number }) {
  const percentage = (rating / 5) * 100;
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#484f58] w-20">{label}</span>
      <div className="flex-1">
        <div className="h-1.5 bg-[#1c2330] overflow-hidden">
          <div 
            className="h-full bg-[#e3b341] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-[#e6edf3] w-8">{rating.toFixed(1)}</span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

interface EliteAppProps {
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

export default function EliteApp({ onNotify }: EliteAppProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teachers' | 'reviews' | 'reports' | 'ranking'>('dashboard');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'students' | 'reviews' | 'experience'>('rating');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterSchool, setFilterSchool] = useState<string>('all');

  // Simulation des données
  useEffect(() => {
    loadTeachers();
    loadReports();
    loadDashboardStats();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    setTimeout(() => {
      setTeachers([
        {
          id: '1',
          name: 'Dupont',
          firstName: 'Jean',
          email: 'jean.dupont@lycee.fr',
          phone: '+33 6 12 34 56 78',
          school: 'Lycée Victor Hugo',
          schoolId: 's1',
          department: 'Sciences Exactes',
          subject: 'Mathématiques',
          bio: 'Professeur de mathématiques depuis 15 ans, spécialiste des classes préparatoires. Passionné par la pédagogie et l\'innovation.',
          experience: 15,
          qualifications: ['Agrégation de Mathématiques', 'Master 2 Recherche', 'Certification Montessori'],
          achievements: [
            { id: 'a1', title: 'Prix d\'Excellence Pédagogique', description: 'Reconnu pour sa méthode d\'enseignement innovante', icon: '🏆', date: '2023-06-15', verified: true },
            { id: 'a2', title: 'Top Contributeur', description: 'Plus de 100 sujets partagés', icon: '⭐', date: '2024-01-10', verified: true }
          ],
          stats: {
            totalStudents: 245,
            totalClasses: 8,
            totalHours: 720,
            avgGrade: 14.8,
            successRate: 92,
            attendanceRate: 96,
            totalReviews: 187,
            totalRatings: 187,
            totalReports: 0,
            rank: 1,
            rankChange: 2,
            trend: 'up'
          },
          rating: {
            average: 4.9,
            distribution: { 5: 142, 4: 38, 3: 5, 2: 2, 1: 0 },
            categories: {
              teaching: 4.9,
              clarity: 4.8,
              availability: 4.7,
              fairness: 4.9,
              engagement: 4.8
            },
            recentReviews: []
          },
          status: 'active',
          verified: true,
          verifiedAt: '2023-01-15T10:00:00Z',
          verifiedBy: 'Admin',
          joinedAt: '2020-09-01T08:00:00Z',
          lastActive: new Date().toISOString(),
          location: {
            city: 'Paris',
            region: 'Île-de-France',
            country: 'France'
          },
          socialLinks: {
            linkedin: 'https://linkedin.com/in/jean-dupont',
            twitter: 'https://twitter.com/jeandupont'
          }
        },
        {
          id: '2',
          name: 'Bernard',
          firstName: 'Marie',
          email: 'marie.bernard@college.fr',
          phone: '+33 6 98 76 54 32',
          school: 'Collège Jean Moulin',
          schoolId: 's2',
          department: 'Sciences',
          subject: 'Physique-Chimie',
          bio: 'Enseignante passionnée par les sciences expérimentales. Méthodes interactives et ludiques.',
          experience: 10,
          qualifications: ['CAPES Physique-Chimie', 'Master MEEF'],
          achievements: [
            { id: 'a3', title: 'Innovation Pédagogique', description: 'Création d\'un laboratoire virtuel', icon: '🔬', date: '2023-11-20', verified: true }
          ],
          stats: {
            totalStudents: 189,
            totalClasses: 6,
            totalHours: 540,
            avgGrade: 14.2,
            successRate: 88,
            attendanceRate: 94,
            totalReviews: 156,
            totalRatings: 156,
            totalReports: 0,
            rank: 2,
            rankChange: 1,
            trend: 'up'
          },
          rating: {
            average: 4.8,
            distribution: { 5: 98, 4: 45, 3: 10, 2: 3, 1: 0 },
            categories: {
              teaching: 4.8,
              clarity: 4.7,
              availability: 4.6,
              fairness: 4.8,
              engagement: 4.9
            },
            recentReviews: []
          },
          status: 'active',
          verified: true,
          verifiedAt: '2023-02-20T10:00:00Z',
          verifiedBy: 'Admin',
          joinedAt: '2021-09-01T08:00:00Z',
          lastActive: new Date().toISOString(),
          location: {
            city: 'Lyon',
            region: 'Auvergne-Rhône-Alpes',
            country: 'France'
          }
        },
        {
          id: '3',
          name: 'Laurent',
          firstName: 'Pierre',
          email: 'pierre.laurent@lycee.fr',
          phone: '+33 6 45 67 89 01',
          school: 'Lycée Carnot',
          schoolId: 's3',
          department: 'Lettres',
          subject: 'Français',
          bio: 'Passionné de littérature française et de philosophie. Auteur de plusieurs ouvrages pédagogiques.',
          experience: 20,
          qualifications: ['Agrégation de Lettres Modernes', 'Doctorat en Littérature'],
          achievements: [
            { id: 'a4', title: 'Auteur Publié', description: 'Publication de "Méthodologie du commentaire"', icon: '📚', date: '2022-08-10', verified: true }
          ],
          stats: {
            totalStudents: 167,
            totalClasses: 5,
            totalHours: 450,
            avgGrade: 13.5,
            successRate: 85,
            attendanceRate: 92,
            totalReviews: 134,
            totalRatings: 134,
            totalReports: 1,
            rank: 3,
            rankChange: -1,
            trend: 'down'
          },
          rating: {
            average: 4.6,
            distribution: { 5: 56, 4: 45, 3: 25, 2: 6, 1: 2 },
            categories: {
              teaching: 4.6,
              clarity: 4.5,
              availability: 4.4,
              fairness: 4.6,
              engagement: 4.5
            },
            recentReviews: []
          },
          status: 'active',
          verified: true,
          verifiedAt: '2023-03-10T10:00:00Z',
          verifiedBy: 'Admin',
          joinedAt: '2019-09-01T08:00:00Z',
          lastActive: new Date().toISOString(),
          location: {
            city: 'Dijon',
            region: 'Bourgogne-Franche-Comté',
            country: 'France'
          }
        },
        {
          id: '4',
          name: 'Martin',
          firstName: 'Sophie',
          email: 'sophie.martin@ecole.fr',
          phone: '+33 6 23 45 67 89',
          school: 'École Primaire Pasteur',
          schoolId: 's4',
          department: 'Primaire',
          subject: 'Enseignement Général',
          bio: 'Enseignante en primaire spécialisée dans les méthodes Montessori et Freinet.',
          experience: 8,
          qualifications: ['CRPE', 'Master MEEF', 'Certification Montessori'],
          achievements: [
            { id: 'a5', title: 'Prix Jeune Enseignant', description: 'Reconnue pour son engagement', icon: '🌟', date: '2024-02-01', verified: true }
          ],
          stats: {
            totalStudents: 78,
            totalClasses: 3,
            totalHours: 270,
            avgGrade: 15.2,
            successRate: 95,
            attendanceRate: 98,
            totalReviews: 89,
            totalRatings: 89,
            totalReports: 0,
            rank: 4,
            rankChange: 3,
            trend: 'up'
          },
          rating: {
            average: 4.9,
            distribution: { 5: 67, 4: 18, 3: 3, 2: 1, 1: 0 },
            categories: {
              teaching: 4.9,
              clarity: 4.8,
              availability: 4.9,
              fairness: 4.9,
              engagement: 4.9
            },
            recentReviews: []
          },
          status: 'pending',
          verified: false,
          joinedAt: '2023-09-01T08:00:00Z',
          lastActive: new Date().toISOString(),
          location: {
            city: 'Bordeaux',
            region: 'Nouvelle-Aquitaine',
            country: 'France'
          }
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const loadReports = async () => {
    setReports([
      {
        id: 'r1',
        teacherId: '3',
        reporterId: 'u1',
        reporterName: 'Élève Anonyme',
        reason: 'Contenu inapproprié',
        description: 'Certains commentaires dans les cours sont inappropriés.',
        status: 'pending',
        createdAt: '2024-03-25T08:00:00Z'
      }
    ]);
  };

  const loadDashboardStats = async () => {
    setDashboardStats({
      totalTeachers: 234,
      activeTeachers: 198,
      pendingTeachers: 23,
      verifiedTeachers: 156,
      totalReviews: 4567,
      avgRating: 4.7,
      topTeachers: teachers.slice(0, 5).map((t, i) => ({
        teacher: t,
        rank: i + 1,
        score: t.rating.average * 100 + t.stats.totalReviews,
        trend: t.stats.trend
      })),
      topSubjects: [
        { subject: 'Mathématiques', count: 67, avgRating: 4.8 },
        { subject: 'Physique-Chimie', count: 45, avgRating: 4.7 },
        { subject: 'Français', count: 34, avgRating: 4.6 },
        { subject: 'Anglais', count: 28, avgRating: 4.5 },
        { subject: 'Histoire-Géo', count: 23, avgRating: 4.4 }
      ],
      topSchools: [
        { school: 'Lycée Victor Hugo', count: 12, avgRating: 4.8 },
        { school: 'Collège Jean Moulin', count: 8, avgRating: 4.7 },
        { school: 'Lycée Carnot', count: 6, avgRating: 4.6 }
      ],
      recentReviews: [],
      pendingReports: 1
    });
  };

  const handleVerifyTeacher = (teacherId: string) => {
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId && t.status === 'pending') {
        onNotify(`Enseignant ${t.firstName} ${t.name} vérifié avec succès`, 'green');
        return { ...t, status: 'active', verified: true, verifiedAt: new Date().toISOString(), verifiedBy: 'Admin' };
      }
      return t;
    }));
  };

  const handleSuspendTeacher = (teacherId: string) => {
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId && t.status === 'active') {
        onNotify(`Enseignant ${t.firstName} ${t.name} suspendu`, 'red');
        return { ...t, status: 'suspended' };
      }
      return t;
    }));
  };

  const handleActivateTeacher = (teacherId: string) => {
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId && t.status === 'suspended') {
        onNotify(`Enseignant ${t.firstName} ${t.name} réactivé`, 'green');
        return { ...t, status: 'active' };
      }
      return t;
    }));
  };

  const handleResolveReport = (reportId: string, action: 'dismiss' | 'action_taken') => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        onNotify(`Signalement ${action === 'dismiss' ? 'rejeté' : 'traité'}`, action === 'dismiss' ? 'amber' : 'green');
        return { ...r, status: action === 'dismiss' ? 'dismissed' : 'action_taken', reviewedAt: new Date().toISOString(), reviewedBy: 'Admin' };
      }
      return r;
    }));
  };

  const getSortedTeachers = () => {
    let filtered = teachers.filter(t =>
      `${t.firstName} ${t.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.school.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterSubject !== 'all') {
      filtered = filtered.filter(t => t.subject === filterSubject);
    }

    if (filterSchool !== 'all') {
      filtered = filtered.filter(t => t.school === filterSchool);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating.average - a.rating.average;
        case 'students': return b.stats.totalStudents - a.stats.totalStudents;
        case 'reviews': return b.stats.totalReviews - a.stats.totalReviews;
        case 'experience': return b.experience - a.experience;
        default: return b.rating.average - a.rating.average;
      }
    });
  };

  const subjects = [...new Set(teachers.map(t => t.subject))];
  const schools = [...new Set(teachers.map(t => t.school))];

  // Rendu du composant
  return (
    <div className="animate-[fadeIn_0.4s_ease] w-full p-4">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#e3b341]">
              <FiStar size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Elite</h1>
              <p className="text-sm text-[#8b949e] mt-1">Classement des meilleurs professeurs</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              onClick={() => { loadTeachers(); onNotify('Données actualisées', 'green'); }}
            >
              <FiRefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>

        {/* Stats Dashboard - Responsive 6 colonnes qui se réduit progressivement */}
        {dashboardStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              icon={FaChalkboardTeacher}
              label="Professeurs"
              value={dashboardStats.totalTeachers}
              subtitle={`${dashboardStats.activeTeachers} actifs`}
              color="bg-[rgba(56,139,253,0.1)] text-[#388bfd]"
              onClick={() => setActiveTab('teachers')}
            />
            <StatCard
              icon={MdOutlineVerified}
              label="Vérifiés"
              value={dashboardStats.verifiedTeachers}
              subtitle={`${dashboardStats.pendingTeachers} en attente`}
              color="bg-[rgba(57,211,83,0.1)] text-[#39d353]"
            />
            <StatCard
              icon={FiStar}
              label="Note moyenne"
              value={dashboardStats.avgRating}
              trend={{ value: 5, isPositive: true }}
              color="bg-[rgba(227,179,65,0.1)] text-[#e3b341]"
            />
            <StatCard
              icon={FiThumbsUp}
              label="Avis"
              value={dashboardStats.totalReviews}
              color="bg-[rgba(139,148,158,0.1)] text-[#8b949e]"
            />
            <StatCard
              icon={FiFlag}
              label="Signalements"
              value={dashboardStats.pendingReports}
              subtitle="en attente"
              color="bg-[rgba(248,81,73,0.1)] text-[#f85149]"
              onClick={() => setActiveTab('reports')}
            />
            <StatCard
              icon={FiStar}
              label="Top 10%"
              value={`${Math.round((dashboardStats.verifiedTeachers / dashboardStats.totalTeachers) * 100)}%`}
              color="bg-[rgba(227,179,65,0.1)] text-[#e3b341]"
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
            activeTab === 'teachers' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('teachers')}
        >
          <span className="flex items-center gap-2">
            <FaChalkboardTeacher size={14} /> Professeurs
            <span className="ml-1.5 px-2 py-0.5 text-[10px] bg-[#1c2330] text-[#8b949e]">{teachers.filter(t => t.status === 'pending').length}</span>
          </span>
        </button>
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'ranking' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('ranking')}
        >
          <span className="flex items-center gap-2">
            <FiStar size={14} /> Classement
          </span>
        </button>
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'reviews' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('reviews')}
        >
          <span className="flex items-center gap-2">
            <FiThumbsUp size={14} /> Avis
          </span>
        </button>
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'reports' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('reports')}
        >
          <span className="flex items-center gap-2">
            <FiFlag size={14} /> Signalements
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-[#f85149] text-white">
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Contenu principal */}
      <div className="space-y-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-8">
            {/* Top Professeurs */}
            <div className="bg-[#0d1117] border border-[#21262d] overflow-hidden">
              <div className="p-5 border-b border-[#21262d] bg-[#161b22]">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <FiStar size={18} className="text-[#e3b341]" />
                  Top 5 des professeurs
                </h3>
              </div>
              <div className="divide-y divide-[#21262d]">
                {dashboardStats.topTeachers.map((item, idx) => (
                  <div key={item.teacher.id} className="p-5 flex items-center justify-between flex-wrap gap-4 hover:bg-[#161b22] transition-colors cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 flex items-center justify-center font-bold text-xl ${
                        idx === 0 ? 'bg-[rgba(227,179,65,0.2)] text-[#e3b341]' :
                        idx === 1 ? 'bg-[rgba(139,148,158,0.2)] text-[#8b949e]' :
                        idx === 2 ? 'bg-[rgba(210,153,34,0.2)] text-[#d29922]' :
                        'bg-[#1c2330] text-[#388bfd]'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-base">{item.teacher.firstName} {item.teacher.name}</p>
                          {item.teacher.verified && <MdOutlineVerified size={16} className="text-[#388bfd]" />}
                          <StatusBadge status={item.teacher.status} />
                        </div>
                        <p className="text-sm text-[#8b949e] mt-1">{item.teacher.subject} - {item.teacher.school}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <RatingStars rating={item.teacher.rating.average} size={16} showNumber />
                      <div className="flex items-center gap-2">
                        {item.trend === 'up' && <FiTrendingUp size={16} className="text-[#39d353]" />}
                        {item.trend === 'down' && <FiTrendingDown size={16} className="text-[#f85149]" />}
                        <span className="text-sm text-[#484f58]">{item.teacher.stats.totalReviews} avis</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Matières et Écoles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0d1117] border border-[#21262d] p-5">
                <h3 className="text-base font-semibold mb-5">📊 Top matières</h3>
                <div className="space-y-4">
                  {dashboardStats.topSubjects.map((item) => (
                    <div key={item.subject} className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium">{item.subject}</p>
                        <p className="text-xs text-[#484f58] mt-0.5">{item.count} professeurs</p>
                      </div>
                      <RatingStars rating={item.avgRating} size={16} showNumber />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0d1117] border border-[#21262d] p-5">
                <h3 className="text-base font-semibold mb-5">🏫 Top établissements</h3>
                <div className="space-y-4">
                  {dashboardStats.topSchools.map((item) => (
                    <div key={item.school} className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium">{item.school}</p>
                        <p className="text-xs text-[#484f58] mt-0.5">{item.count} professeurs</p>
                      </div>
                      <RatingStars rating={item.avgRating} size={16} showNumber />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professeurs */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border border-[#21262d] flex-1">
                <FiSearch size={16} className="text-[#484f58]" />
                <input
                  type="text"
                  placeholder="Rechercher un professeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[#e6edf3] text-[14px] placeholder:text-[#484f58] focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2.5 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:outline-none"
                >
                  <option value="rating">Note</option>
                  <option value="students">Élèves</option>
                  <option value="reviews">Avis</option>
                  <option value="experience">Expérience</option>
                </select>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-3 py-2.5 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:outline-none"
                >
                  <option value="all">Toutes matières</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="px-3 py-2.5 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:outline-none"
                >
                  <option value="all">Tous établissements</option>
                  {schools.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Liste des professeurs */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16">
                  <FiRefreshCw size={32} className="mx-auto text-[#484f58] animate-spin mb-4" />
                  <p className="text-[#8b949e]">Chargement...</p>
                </div>
              ) : getSortedTeachers().map((teacher) => (
                <div key={teacher.id} className="bg-[#0d1117] border border-[#21262d] overflow-hidden hover:border-[#30363d] transition-all">
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      <div className="flex gap-5">
                        <div className="w-16 h-16 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-xl font-semibold text-[#388bfd] shrink-0">
                          {teacher.firstName.charAt(0)}{teacher.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="text-lg font-semibold">{teacher.firstName} {teacher.name}</h3>
                            {teacher.verified && <MdOutlineVerified size={18} className="text-[#388bfd]" />}
                            <StatusBadge status={teacher.status} />
                            <span className="text-sm text-[#484f58]">#{teacher.stats.rank}</span>
                          </div>
                          <p className="text-sm text-[#8b949e] mb-2">{teacher.subject} - {teacher.school}</p>
                          <p className="text-sm text-[#484f58] line-clamp-2 max-w-2xl">{teacher.bio}</p>
                          <div className="flex flex-wrap items-center gap-5 mt-3 text-sm text-[#484f58]">
                            <span>{teacher.experience} ans d'expérience</span>
                            <span>{teacher.stats.totalStudents} élèves</span>
                            <span>{teacher.stats.totalReviews} avis</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start lg:items-end gap-3">
                        <RatingStars rating={teacher.rating.average} size={18} showNumber />
                        <div className="flex gap-2">
                          <button 
                            className="w-9 h-9 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]"
                            onClick={() => setSelectedTeacher(selectedTeacher === teacher.id ? null : teacher.id)}
                          >
                            <FiChevronDown size={16} className={`transition-transform duration-200 ${selectedTeacher === teacher.id ? 'rotate-180' : ''}`} />
                          </button>
                          {teacher.status === 'pending' && (
                            <button 
                              className="w-9 h-9 flex items-center justify-center border border-[#21262d] bg-transparent text-[#39d353] hover:bg-[rgba(57,211,83,0.1)]"
                              onClick={() => handleVerifyTeacher(teacher.id)}
                            >
                              <FiCheckCircle size={16} />
                            </button>
                          )}
                          {teacher.status === 'active' && (
                            <button 
                              className="w-9 h-9 flex items-center justify-center border border-[#21262d] bg-transparent text-[#f85149] hover:bg-[rgba(248,81,73,0.1)]"
                              onClick={() => handleSuspendTeacher(teacher.id)}
                            >
                              <FiUserX size={16} />
                            </button>
                          )}
                          {teacher.status === 'suspended' && (
                            <button 
                              className="w-9 h-9 flex items-center justify-center border border-[#21262d] bg-transparent text-[#39d353] hover:bg-[rgba(57,211,83,0.1)]"
                              onClick={() => handleActivateTeacher(teacher.id)}
                            >
                              <FiUserCheck size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Détails étendus */}
                    {selectedTeacher === teacher.id && (
                      <div className="mt-6 pt-6 border-t border-[#21262d]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Évaluations par catégorie */}
                          <div>
                            <h4 className="text-base font-semibold mb-4">Évaluations par catégorie</h4>
                            <div className="space-y-3">
                              <CategoryRating label="Enseignement" rating={teacher.rating.categories.teaching} />
                              <CategoryRating label="Clarté" rating={teacher.rating.categories.clarity} />
                              <CategoryRating label="Disponibilité" rating={teacher.rating.categories.availability} />
                              <CategoryRating label="Justice" rating={teacher.rating.categories.fairness} />
                              <CategoryRating label="Engagement" rating={teacher.rating.categories.engagement} />
                            </div>
                          </div>

                          {/* Distribution des notes */}
                          <div>
                            <h4 className="text-base font-semibold mb-4">Distribution des notes</h4>
                            <div className="space-y-3">
                              {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 w-20">
                                    <FiStar size={14} className="text-[#e3b341]" />
                                    <span className="text-sm">{star}</span>
                                  </div>
                                  <div className="flex-1 h-2 bg-[#1c2330] overflow-hidden">
                                    <div 
                                      className="h-full bg-[#e3b341]"
                                      style={{ width: `${(teacher.rating.distribution[star as keyof typeof teacher.rating.distribution] / teacher.stats.totalReviews) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-[#484f58] w-12">{teacher.rating.distribution[star as keyof typeof teacher.rating.distribution]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Réalisations */}
                        {teacher.achievements.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-[#21262d]">
                            <h4 className="text-base font-semibold mb-4">🏆 Réalisations</h4>
                            <div className="flex flex-wrap gap-3">
                              {teacher.achievements.map((achievement) => (
                                <div key={achievement.id} className="flex items-center gap-3 px-4 py-2 bg-[#161b22] border border-[#21262d]">
                                  <span className="text-xl">{achievement.icon}</span>
                                  <div>
                                    <p className="text-sm font-medium">{achievement.title}</p>
                                    <p className="text-xs text-[#484f58]">{achievement.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Coordonnées */}
                        <div className="mt-6 pt-6 border-t border-[#21262d] flex flex-wrap gap-5 text-sm text-[#484f58]">
                          <div className="flex items-center gap-2">
                            <FiMail size={14} />
                            <span>{teacher.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiPhone size={14} />
                            <span>{teacher.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMapPin size={14} />
                            <span>{teacher.location.city}, {teacher.location.region}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiCalendar size={14} />
                            <span>Inscrit le {new Date(teacher.joinedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classement */}
        {activeTab === 'ranking' && (
          <div className="bg-[#0d1117] border border-[#21262d] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#21262d] bg-[#161b22]">
                    <th className="text-left p-4 text-sm font-medium text-[#484f58] w-20">Rang</th>
                    <th className="text-left p-4 text-sm font-medium text-[#484f58]">Professeur</th>
                    <th className="text-left p-4 text-sm font-medium text-[#484f58]">Matière</th>
                    <th className="text-left p-4 text-sm font-medium text-[#484f58]">Établissement</th>
                    <th className="text-left p-4 text-sm font-medium text-[#484f58]">Note</th>
                    <th className="text-left p-4 text-sm font-medium text-[#484f58]">Avis</th>
                    <th className="text-left p-4 text-sm font-medium text-[#484f58]">Tendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  {getSortedTeachers().map((teacher, idx) => (
                    <tr key={teacher.id} className="hover:bg-[#161b22] transition-colors cursor-pointer">
                      <td className="p-4">
                        <div className={`w-10 h-10 flex items-center justify-center font-bold text-lg ${
                          idx === 0 ? 'bg-[rgba(227,179,65,0.2)] text-[#e3b341]' :
                          idx === 1 ? 'bg-[rgba(139,148,158,0.2)] text-[#8b949e]' :
                          idx === 2 ? 'bg-[rgba(210,153,34,0.2)] text-[#d29922]' :
                          'bg-[#1c2330] text-[#388bfd]'
                        }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{teacher.firstName} {teacher.name}</span>
                          {teacher.verified && <MdOutlineVerified size={16} className="text-[#388bfd]" />}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#8b949e]">{teacher.subject}</td>
                      <td className="p-4 text-sm text-[#8b949e]">{teacher.school}</td>
                      <td className="p-4">
                        <RatingStars rating={teacher.rating.average} size={16} showNumber />
                      </td>
                      <td className="p-4 text-sm text-[#8b949e]">{teacher.stats.totalReviews}</td>
                      <td className="p-4">
                        {teacher.stats.trend === 'up' && <FiTrendingUp size={18} className="text-[#39d353]" />}
                        {teacher.stats.trend === 'down' && <FiTrendingDown size={18} className="text-[#f85149]" />}
                        {teacher.stats.trend === 'stable' && <FiActivity size={18} className="text-[#e3b341]" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Avis */}
        {activeTab === 'reviews' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border border-[#21262d]">
              <FiSearch size={16} className="text-[#484f58]" />
              <input
                type="text"
                placeholder="Rechercher un avis..."
                className="flex-1 bg-transparent border-none text-[#e6edf3] text-[14px] placeholder:text-[#484f58] focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              {teachers.flatMap(t => 
                t.rating.recentReviews.map(r => ({ ...r, teacherName: `${t.firstName} ${t.name}`, teacherSubject: t.subject }))
              ).map((review) => (
                <div key={review.id} className="bg-[#0d1117] border border-[#21262d] p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <RatingStars rating={review.rating} size={16} />
                        <span className="text-sm text-[#484f58]">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-base text-[#e6edf3] mb-3">"{review.comment}"</p>
                      <div className="flex items-center gap-2 text-sm text-[#484f58]">
                        <span>Par {review.studentName}</span>
                        <span>•</span>
                        <span>Professeur: {review.teacherName} ({review.teacherSubject})</span>
                        {review.verified && <MdOutlineVerified size={14} className="text-[#388bfd]" />}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-[#21262d] bg-transparent text-[#8b949e]">
                        <FiThumbsUp size={14} /> {review.helpful}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-[#21262d] bg-transparent text-[#8b949e]">
                        <FiFlag size={14} /> Signaler
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signalements */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.map((report) => {
              const teacher = teachers.find(t => t.id === report.teacherId);
              return (
                <div key={report.id} className="bg-[#0d1117] border border-[#21262d] p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FiFlag size={18} className="text-[#f85149]" />
                        <h4 className="text-base font-semibold">Signalement de {report.reporterName}</h4>
                        <StatusBadge status={report.status} />
                      </div>
                      <p className="text-sm text-[#e6edf3] mb-2"><strong>Raison:</strong> {report.reason}</p>
                      <p className="text-sm text-[#8b949e] mb-4">{report.description}</p>
                      {teacher && (
                        <div className="p-4 bg-[#161b22] border border-[#21262d] mb-4">
                          <p className="text-xs text-[#484f58] mb-2">Professeur concerné:</p>
                          <p className="text-base font-medium">{teacher.firstName} {teacher.name}</p>
                          <p className="text-sm text-[#8b949e] mt-1">{teacher.subject} - {teacher.school}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-[#484f58]">
                        <span>Signalé le {new Date(report.createdAt).toLocaleString()}</span>
                        {report.reviewedAt && <span>• Traité le {new Date(report.reviewedAt).toLocaleString()}</span>}
                      </div>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          className="px-4 py-2 text-[13px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]"
                          onClick={() => handleResolveReport(report.id, 'dismiss')}
                        >
                          Rejeter
                        </button>
                        <button 
                          className="px-4 py-2 text-[13px] bg-[#388bfd] text-white hover:bg-[#58a6ff]"
                          onClick={() => handleResolveReport(report.id, 'action_taken')}
                        >
                          Prendre action
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}