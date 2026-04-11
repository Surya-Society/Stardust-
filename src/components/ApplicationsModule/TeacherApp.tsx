// TeachersApp.tsx
import { useState, useEffect } from 'react';
import {
  FiCalendar, FiClock, FiStar, FiTrendingUp,
  FiTrendingDown, FiBarChart2, FiDownload, FiRefreshCw, FiSearch,
  FiEye, FiEdit2,
  FiAlertCircle, FiClock as FiClockIcon,
  FiUserPlus, FiMail, FiPhone, FiActivity,
  FiSettings, FiMoreVertical
} from 'react-icons/fi';
import {
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineDocumentText
} from 'react-icons/hi';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { MdOutlineGrade } from 'react-icons/md';

// ============================================================================
// TYPES
// ============================================================================

interface Teacher {
  id: string;
  name: string;
  firstName: string;
  email: string;
  phone: string;
  subject: string;
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
  hireDate: string;
  performance: {
    rating: number;
    totalStudents: number;
    avgGrade: number;
    successRate: number;
    attendanceRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  classes: Class[];
  schedule: ScheduleEntry[];
}

interface Class {
  id: string;
  name: string;
  level: string;
  studentCount: number;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }[];
  performance: {
    avgGrade: number;
    successRate: number;
    topStudents: Student[];
    failingStudents: Student[];
  };
}

interface Student {
  id: string;
  name: string;
  firstName: string;
  grades: Grade[];
  attendance: number;
  behavior: number;
}

interface Grade {
  subjectId: string;
  subjectName: string;
  value: number;
  coefficient: number;
  date: string;
  type: 'exam' | 'quiz' | 'homework' | 'participation';
}

interface ScheduleEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  class: string;
  room: string;
  type: 'course' | 'exam' | 'meeting' | 'office_hours';
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  avgGrade?: number;
  participants?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  target: 'all' | 'class' | 'specific';
  classId?: string;
  author: string;
  important: boolean;
}

interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  avgGrade: number;
  successRate: number;
  attendanceRate: number;
  pendingExams: number;
  unreadMessages: number;
  upcomingEvents: number;
}

// ============================================================================
// COMPOSANTS UI
// ============================================================================

function StatCard({ icon: Icon, label, value, trend, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-[#21262d] p-4 transition-all duration-200 hover:border-[#30363d]">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color || 'bg-[#1c2330]'}`}>
          <Icon size={20} className={color?.replace('bg-', 'text-') || 'text-[#388bfd]'} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-[#39d353]' : 'text-[#f85149]'}`}>
            {trend.isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold text-[#e6edf3]">{value}</div>
      <div className="text-xs text-[#484f58] mt-1">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Teacher['status'] | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', label: 'Actif' },
    inactive: { bg: 'bg-[rgba(139,148,158,0.15)]', text: 'text-[#8b949e]', label: 'Inactif' },
    on_leave: { bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', label: 'Congé' },
    scheduled: { bg: 'bg-[rgba(56,139,253,0.15)]', text: 'text-[#388bfd]', label: 'Planifié' },
    in_progress: { bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', label: 'En cours' },
    completed: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', label: 'Terminé' },
    cancelled: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', label: 'Annulé' }
  };
  const style = config[status] || config.active;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
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
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

interface TeachersAppProps {
  teacherId?: string;
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
  onNavigate?: (path: string) => void;
}

export default function TeachersApp({ teacherId, onNotify, onNavigate }: TeachersAppProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'classes' | 'schedule' | 'exams' | 'students' | 'announcements'>('dashboard');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Simulation des données
  useEffect(() => {
    loadTeacherData();
    loadClasses();
    loadExams();
    loadAnnouncements();
    loadDashboardStats();
  }, []);

  const loadTeacherData = async () => {
    setTimeout(() => {
      setTeacher({
        id: '1',
        name: 'Martin',
        firstName: 'Jean',
        email: 'jean.martin@ecole.fr',
        phone: '+33 6 12 34 56 78',
        subject: 'Mathématiques',
        department: 'Sciences Exactes',
        status: 'active',
        hireDate: '2020-09-01',
        performance: {
          rating: 4.8,
          totalStudents: 156,
          avgGrade: 14.2,
          successRate: 87,
          attendanceRate: 94,
          trend: 'up'
        },
        classes: [],
        schedule: []
      });
    }, 500);
  };

  const loadClasses = async () => {
    setClasses([
      {
        id: '1',
        name: 'Terminale C',
        level: 'Terminale',
        studentCount: 32,
        schedule: [
          { day: 'Lundi', startTime: '08:00', endTime: '10:00', room: 'Salle 101' },
          { day: 'Mercredi', startTime: '14:00', endTime: '16:00', room: 'Salle 101' }
        ],
        performance: {
          avgGrade: 13.8,
          successRate: 82,
          topStudents: [],
          failingStudents: []
        }
      },
      {
        id: '2',
        name: 'Première D',
        level: 'Première',
        studentCount: 28,
        schedule: [
          { day: 'Mardi', startTime: '10:00', endTime: '12:00', room: 'Salle 102' },
          { day: 'Jeudi', startTime: '08:00', endTime: '10:00', room: 'Salle 102' }
        ],
        performance: {
          avgGrade: 14.5,
          successRate: 89,
          topStudents: [],
          failingStudents: []
        }
      },
      {
        id: '3',
        name: 'Seconde B',
        level: 'Seconde',
        studentCount: 30,
        schedule: [
          { day: 'Lundi', startTime: '14:00', endTime: '16:00', room: 'Salle 103' },
          { day: 'Vendredi', startTime: '08:00', endTime: '10:00', room: 'Salle 103' }
        ],
        performance: {
          avgGrade: 12.9,
          successRate: 76,
          topStudents: [],
          failingStudents: []
        }
      }
    ]);
  };

  const loadExams = async () => {
    setExams([
      {
        id: '1',
        title: 'Devoir surveillé - Fonctions',
        subject: 'Mathématiques',
        class: 'Terminale C',
        date: '2026-04-15',
        duration: 120,
        status: 'scheduled'
      },
      {
        id: '2',
        title: 'Contrôle continu - Statistiques',
        subject: 'Mathématiques',
        class: 'Première D',
        date: '2026-04-10',
        duration: 60,
        status: 'scheduled'
      },
      {
        id: '3',
        title: 'Devoir maison - Probabilités',
        subject: 'Mathématiques',
        class: 'Seconde B',
        date: '2026-04-05',
        duration: 0,
        status: 'completed',
        avgGrade: 13.5,
        participants: 28
      }
    ]);
  };

  const loadAnnouncements = async () => {
    setAnnouncements([
      {
        id: '1',
        title: 'Réunion pédagogique',
        content: 'Réunion des professeurs de sciences le vendredi 10 avril à 14h.',
        date: '2026-04-01',
        target: 'all',
        author: 'Direction',
        important: true
      },
      {
        id: '2',
        title: 'Correction des examens',
        content: 'Les copies du dernier devoir doivent être rendues avant le 15 avril.',
        date: '2026-04-02',
        target: 'all',
        author: 'Jean Martin',
        important: false
      }
    ]);
  };

  const loadDashboardStats = async () => {
    setDashboardStats({
      totalStudents: 156,
      totalClasses: 3,
      avgGrade: 14.2,
      successRate: 87,
      attendanceRate: 94,
      pendingExams: 2,
      unreadMessages: 3,
      upcomingEvents: 2
    });
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      {/* En-tête avec profil enseignant */}
      <div className="bg-[#0d1117] border border-[#21262d] p-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1c2330] border border-[#21262d] rounded-full flex items-center justify-center text-[#388bfd]">
              <FaChalkboardTeacher size={32} />
            </div>
            <div>
              {teacher && (
                <>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-xl font-semibold">{teacher.firstName} {teacher.name}</h1>
                    <StatusBadge status={teacher.status} />
                  </div>
                  <p className="text-sm text-[#8b949e]">{teacher.subject} - {teacher.department}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#484f58]">
                    <span className="flex items-center gap-1"><FiMail size={12} /> {teacher.email}</span>
                    <span className="flex items-center gap-1"><FiPhone size={12} /> {teacher.phone}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors">
              <FiSettings size={12} /> Paramètres
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors">
              <FiDownload size={12} /> Exporter
            </button>
          </div>
        </div>

        {/* Performance stats */}
        {teacher && (
          <div className="grid grid-cols-5 gap-4 mt-5 pt-5 border-t border-[#21262d] max-[900px]:grid-cols-3 max-[500px]:grid-cols-2">
            <div>
              <div className="text-xs text-[#484f58] mb-1">Note moyenne</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">{teacher.performance.avgGrade}</span>
                <span className="text-xs text-[#484f58]">/20</span>
                <RatingStars rating={teacher.performance.rating} />
              </div>
            </div>
            <div>
              <div className="text-xs text-[#484f58] mb-1">Taux de réussite</div>
              <div className="text-xl font-semibold">{teacher.performance.successRate}%</div>
            </div>
            <div>
              <div className="text-xs text-[#484f58] mb-1">Assiduité</div>
              <div className="text-xl font-semibold">{teacher.performance.attendanceRate}%</div>
            </div>
            <div>
              <div className="text-xs text-[#484f58] mb-1">Élèves</div>
              <div className="text-xl font-semibold">{teacher.performance.totalStudents}</div>
            </div>
            <div>
              <div className="text-xs text-[#484f58] mb-1">Tendance</div>
              <div className="flex items-center gap-1">
                {teacher.performance.trend === 'up' ? (
                  <><FiTrendingUp size={16} className="text-[#39d353]" /> <span className="text-sm text-[#39d353]">+5%</span></>
                ) : teacher.performance.trend === 'down' ? (
                  <><FiTrendingDown size={16} className="text-[#f85149]" /> <span className="text-sm text-[#f85149]">-3%</span></>
                ) : (
                  <><FiActivity size={16} className="text-[#e3b341]" /> <span className="text-sm text-[#e3b341]">Stable</span></>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-1 mb-6 border-b border-[#21262d] overflow-x-auto">
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'dashboard' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FiBarChart2 size={14} /> Tableau de bord
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'classes' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('classes')}
        >
          <HiOutlineUsers size={14} /> Mes classes
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'schedule' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('schedule')}
        >
          <FiCalendar size={14} /> Emploi du temps
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'exams' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('exams')}
        >
          <HiOutlineDocumentText size={14} /> Examens
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'students' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('students')}
        >
          <FaUserGraduate size={14} /> Élèves
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'announcements' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('announcements')}
        >
          <FiAlertCircle size={14} /> Annonces
        </button>
      </div>

      {/* Contenu principal */}
      <div className="space-y-6">
        {/* Dashboard */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
              <StatCard
                icon={FaUserGraduate}
                label="Total élèves"
                value={dashboardStats.totalStudents}
                trend={{ value: 8, isPositive: true }}
                color="bg-[rgba(57,211,83,0.1)] text-[#39d353]"
              />
              <StatCard
                icon={HiOutlineAcademicCap}
                label="Moyenne générale"
                value={`${dashboardStats.avgGrade}/20`}
                trend={{ value: 3, isPositive: true }}
                color="bg-[rgba(56,139,253,0.1)] text-[#388bfd]"
              />
              <StatCard
                icon={MdOutlineGrade}
                label="Taux de réussite"
                value={`${dashboardStats.successRate}%`}
                trend={{ value: 5, isPositive: true }}
                color="bg-[rgba(57,211,83,0.1)] text-[#39d353]"
              />
              <StatCard
                icon={FiClockIcon}
                label="Assiduité"
                value={`${dashboardStats.attendanceRate}%`}
                trend={{ value: 2, isPositive: false }}
                color="bg-[rgba(227,179,65,0.1)] text-[#e3b341]"
              />
            </div>

            <div className="grid grid-cols-3 gap-6 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-1">
              <div className="bg-[#0d1117] border border-[#21262d] p-5 col-span-2">
                <h3 className="text-sm font-semibold mb-4">Performance par classe</h3>
                <div className="space-y-4">
                  {classes.map((classItem) => (
                    <div key={classItem.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#e6edf3]">{classItem.name}</span>
                        <span className="text-[#8b949e]">{classItem.performance.avgGrade}/20</span>
                      </div>
                      <div className="h-2 bg-[#1c2330] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#388bfd] rounded-full transition-all duration-500"
                          style={{ width: `${(classItem.performance.avgGrade / 20) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#484f58] mt-1">
                        <span>{classItem.studentCount} élèves</span>
                        <span>Taux réussite: {classItem.performance.successRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0d1117] border border-[#21262d] p-5">
                <h3 className="text-sm font-semibold mb-4">Événements à venir</h3>
                <div className="space-y-3">
                  {exams.filter(e => e.status === 'scheduled').map((exam) => (
                    <div key={exam.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#1c2330] rounded-lg flex items-center justify-center text-[#388bfd]">
                        <HiOutlineDocumentText size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{exam.title}</p>
                          <StatusBadge status={exam.status} />
                        </div>
                        <p className="text-xs text-[#484f58]">{exam.class} - {exam.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mes classes */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-[#161b22] border border-[#21262d] flex-1 max-w-md">
                <FiSearch size={14} className="text-[#484f58]" />
                <input
                  type="text"
                  placeholder="Rechercher une classe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[#e6edf3] text-[12px] placeholder:text-[#484f58] focus:outline-none"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-[12px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                <FiRefreshCw size={12} /> Actualiser
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
              {classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((classItem) => (
                <div key={classItem.id} className="bg-[#0d1117] border border-[#21262d] overflow-hidden">
                  <div className="p-4 border-b border-[#21262d] bg-[#161b22]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold">{classItem.name}</h3>
                        <p className="text-xs text-[#484f58]">{classItem.level} • {classItem.studentCount} élèves</p>
                      </div>
                      <button 
                        onClick={() => setSelectedClass(selectedClass === classItem.id ? null : classItem.id)}
                        className="w-8 h-8 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]"
                      >
                        <svg 
                          className={`transition-transform ${selectedClass === classItem.id ? 'rotate-180' : ''}`} 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-[#484f58] mb-1">Moyenne</div>
                        <div className="text-xl font-semibold">{classItem.performance.avgGrade}/20</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#484f58] mb-1">Taux réussite</div>
                        <div className="text-xl font-semibold">{classItem.performance.successRate}%</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-[#484f58] mb-2">Horaires</div>
                      <div className="space-y-2">
                        {classItem.schedule.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <FiCalendar size={12} className="text-[#484f58]" />
                            <span className="text-[#e6edf3]">{s.day}</span>
                            <span className="text-[#484f58]">{s.startTime} - {s.endTime}</span>
                            <span className="text-[#484f58]">Salle {s.room}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-[#21262d]">
                      <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                        <FiEye size={12} /> Voir les élèves
                      </button>
                      <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                        <HiOutlineChartBar size={12} /> Statistiques
                      </button>
                    </div>
                  </div>

                  {selectedClass === classItem.id && (
                    <div className="border-t border-[#21262d] p-4 bg-[#161b22]">
                      <h4 className="text-sm font-semibold mb-3">Détails de la classe</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[#484f58] block mb-1">Meilleurs élèves</span>
                          <div className="space-y-1">
                            <p className="text-xs text-[#e6edf3]">- À venir</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-[#484f58] block mb-1">Élèves en difficulté</span>
                          <div className="space-y-1">
                            <p className="text-xs text-[#e6edf3]">- À venir</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emploi du temps */}
        {activeTab === 'schedule' && (
          <div className="bg-[#0d1117] border border-[#21262d] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#21262d]">
                  <th className="text-left p-3 text-xs font-medium text-[#484f58]">Horaire</th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="text-left p-3 text-xs font-medium text-[#484f58]">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['08:00', '10:00', '12:00', '14:00', '16:00'].map((time) => (
                  <tr key={time} className="border-b border-[#21262d]">
                    <td className="p-3 text-xs text-[#484f58] font-mono">{time}</td>
                    {daysOfWeek.map(day => {
                      const schedule = classes.flatMap(c => 
                        c.schedule.filter(s => s.day === day && s.startTime === time).map(s => ({ ...s, className: c.name }))
                      );
                      return (
                        <td key={`${day}-${time}`} className="p-3">
                          {schedule.length > 0 ? (
                            <div className="bg-[#1c2330] p-2 rounded">
                              <p className="text-xs font-medium text-[#e6edf3]">{schedule[0].className}</p>
                              <p className="text-[10px] text-[#484f58]">Salle {schedule[0].room}</p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#21262d]">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Examens */}
        {activeTab === 'exams' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-[#161b22] border border-[#21262d] flex-1 max-w-md">
                <FiSearch size={14} className="text-[#484f58]" />
                <input
                  type="text"
                  placeholder="Rechercher un examen..."
                  className="flex-1 bg-transparent border-none text-[#e6edf3] text-[12px] placeholder:text-[#484f58] focus:outline-none"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#388bfd] text-white text-[12px] font-medium hover:bg-[#58a6ff] transition-colors">
                <FiUserPlus size={12} /> Nouvel examen
              </button>
            </div>

            <div className="space-y-3">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-[#0d1117] border border-[#21262d] p-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#1c2330] rounded-lg flex items-center justify-center text-[#388bfd]">
                        <HiOutlineDocumentText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base font-semibold">{exam.title}</h3>
                          <StatusBadge status={exam.status} />
                        </div>
                        <p className="text-xs text-[#8b949e] mb-2">{exam.subject} - {exam.class}</p>
                        <div className="flex items-center gap-3 text-xs text-[#484f58]">
                          <span className="flex items-center gap-1"><FiCalendar size={12} /> {exam.date}</span>
                          {exam.duration > 0 && (
                            <span className="flex items-center gap-1"><FiClock size={12} /> {exam.duration} min</span>
                          )}
                          {exam.avgGrade && (
                            <span className="flex items-center gap-1"><MdOutlineGrade size={12} /> Moyenne: {exam.avgGrade}/20</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                        <FiEye size={14} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Élèves */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#161b22] border border-[#21262d]">
              <FiSearch size={14} className="text-[#484f58]" />
              <input
                type="text"
                placeholder="Rechercher un élève..."
                className="flex-1 bg-transparent border-none text-[#e6edf3] text-[12px] placeholder:text-[#484f58] focus:outline-none"
              />
            </div>

            <div className="bg-[#0d1117] border border-[#21262d]">
              <div className="p-4 border-b border-[#21262d] bg-[#161b22]">
                <div className="grid grid-cols-6 text-xs text-[#484f58] font-medium">
                  <div className="col-span-2">Élève</div>
                  <div>Classe</div>
                  <div>Moyenne</div>
                  <div>Assiduité</div>
                  <div>Actions</div>
                </div>
              </div>
              <div className="divide-y divide-[#21262d]">
                {classes.flatMap(c => 
                  Array(c.studentCount).fill(null).map((_, i) => ({
                    id: `${c.id}-${i}`,
                    name: `Élève ${i + 1}`,
                    firstName: 'Prénom',
                    class: c.name,
                    avgGrade: (10 + Math.random() * 10).toFixed(1),
                    attendance: 80 + Math.random() * 19
                  }))
                ).slice(0, 10).map((student, idx) => (
                  <div key={idx} className="p-4 grid grid-cols-6 items-center">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1c2330] rounded-full flex items-center justify-center text-xs font-semibold text-[#388bfd]">
                        {student.firstName[0]}{student.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.firstName} {student.name}</p>
                        <p className="text-[10px] text-[#484f58]">ID: {student.id}</p>
                      </div>
                    </div>
                    <div className="text-sm">{student.class}</div>
                    <div className="text-sm font-semibold">{student.avgGrade}/20</div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-[#1c2330] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#39d353] rounded-full"
                          style={{ width: `${student.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#484f58]">{Math.round(student.attendance)}%</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-7 h-7 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                        <FiEye size={12} />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                        <FiEdit2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Annonces */}
        {activeTab === 'announcements' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#388bfd] text-white text-[12px] font-medium hover:bg-[#58a6ff] transition-colors">
                <FiUserPlus size={12} /> Nouvelle annonce
              </button>
            </div>
            {announcements.map((announcement) => (
              <div key={announcement.id} className={`bg-[#0d1117] border p-4 ${announcement.important ? 'border-[#f85149]' : 'border-[#21262d]'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold">{announcement.title}</h3>
                      {announcement.important && (
                        <span className="px-2 py-0.5 text-[9px] bg-[rgba(248,81,73,0.15)] text-[#f85149]">Important</span>
                      )}
                    </div>
                    <p className="text-sm text-[#8b949e] mb-2">{announcement.content}</p>
                    <div className="flex items-center gap-3 text-xs text-[#484f58]">
                      <span>Par {announcement.author}</span>
                      <span>{announcement.date}</span>
                      <span>Cible: {announcement.target === 'all' ? 'Tous' : announcement.classId || 'Classe spécifique'}</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                    <FiMoreVertical size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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