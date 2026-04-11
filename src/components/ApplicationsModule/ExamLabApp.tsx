// ExamLabApp.tsx
import { useState, useEffect } from 'react';
import {
  FiUserCheck, FiActivity, FiTrendingUp,
  FiTrendingDown, FiBarChart2, FiRefreshCw, FiSearch,
  FiEye, FiClock, FiUserPlus,
  FiMoreVertical, FiBell, FiMessageSquare, FiCalendar
} from 'react-icons/fi';
import {
  HiOutlineUsers
} from 'react-icons/hi';
import { FaChild } from 'react-icons/fa';

// ============================================================================
// TYPES
// ============================================================================

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
  coefficient?: number;
}

interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  value: number;
  rank: number;
  feedback?: string;
}

interface ExamAnalytics {
  totalExams: number;
  avgScore: number;
  successRate: number;
  participationRate: number;
  topPerformers: { name: string; score: number }[];
}

interface DashboardStats {
  totalExams: number;
  activeExams: number;
  completedExams: number;
  totalStudents: number;
  avgScore: number;
  pendingCorrections: number;
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
    </div>
  );
}

function StatusBadge({ status }: { status: Exam['status'] }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    scheduled: { bg: 'bg-[rgba(56,139,253,0.15)]', text: 'text-[#388bfd]', label: 'Planifié' },
    in_progress: { bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', label: 'En cours' },
    completed: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', label: 'Terminé' },
    cancelled: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', label: 'Annulé' }
  };
  const style = config[status] || config.scheduled;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

interface ExamLabAppProps {
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
  onNavigate?: (path: string) => void;
}

export default function ExamLabApp({ onNotify }: ExamLabAppProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exams' | 'results' | 'analytics'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);

  // Simulation des données
  useEffect(() => {
    loadExams();
    loadResults();
    loadDashboardStats();
    loadAnalytics();
  }, []);

  const loadExams = async () => {
    setTimeout(() => {
      setExams([
        {
          id: '1',
          title: 'Examen Blanc - Mathématiques',
          subject: 'Mathématiques',
          class: 'Terminale C',
          date: '2026-04-20',
          duration: 180,
          status: 'scheduled',
          coefficient: 4
        },
        {
          id: '2',
          title: 'Composition - Physique',
          subject: 'Physique',
          class: 'Première D',
          date: '2026-04-18',
          duration: 120,
          status: 'scheduled',
          coefficient: 3
        },
        {
          id: '3',
          title: 'Devoir Surveillé - Anglais',
          subject: 'Anglais',
          class: 'Seconde B',
          date: '2026-04-15',
          duration: 60,
          status: 'completed',
          avgGrade: 14.2,
          participants: 28,
          coefficient: 2
        },
        {
          id: '4',
          title: 'Examen Semestriel',
          subject: 'Français',
          class: 'Terminale C',
          date: '2026-04-25',
          duration: 240,
          status: 'scheduled',
          coefficient: 5
        }
      ]);
    }, 500);
  };

  const loadResults = async () => {
    setResults([
      { id: 'r1', examId: '3', studentId: 's1', studentName: 'Thomas Martin', value: 15, rank: 5, feedback: 'Très bon travail' },
      { id: 'r2', examId: '3', studentId: 's2', studentName: 'Léa Martin', value: 12, rank: 12, feedback: 'Peut mieux faire' },
      { id: 'r3', examId: '3', studentId: 's3', studentName: 'Lucas Dubois', value: 16, rank: 2, feedback: 'Excellent' },
      { id: 'r4', examId: '3', studentId: 's4', studentName: 'Emma Bernard', value: 10, rank: 20, feedback: 'En progrès' }
    ]);
  };

  const loadDashboardStats = async () => {
    setDashboardStats({
      totalExams: 12,
      activeExams: 3,
      completedExams: 9,
      totalStudents: 156,
      avgScore: 13.8,
      pendingCorrections: 45
    });
  };

  const loadAnalytics = async () => {
    setAnalytics({
      totalExams: 12,
      avgScore: 13.8,
      successRate: 78,
      participationRate: 94,
      topPerformers: [
        { name: 'Lucas Dubois', score: 16.5 },
        { name: 'Sophie Martin', score: 15.8 },
        { name: 'Thomas Martin', score: 15.2 }
      ]
    });
  };

  const filteredExams = exams.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-[fadeIn_0.4s_ease] w-full p-4">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#388bfd]">
              <HiOutlineUsers size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Exam Lab</h1>
              <p className="text-sm text-[#8b949e] mt-1">Gestion des examens et évaluations</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              onClick={() => { loadExams(); onNotify('Données actualisées', 'green'); }}
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
              label="Total examens"
              value={dashboardStats.totalExams}
              color="bg-[rgba(56,139,253,0.1)] text-[#388bfd]"
            />
            <StatCard
              icon={FiUserCheck}
              label="Examens en cours"
              value={dashboardStats.activeExams}
              trend={{ value: 2, isPositive: true }}
              color="bg-[rgba(57,211,83,0.1)] text-[#39d353]"
            />
            <StatCard
              icon={FaChild}
              label="Élèves concernés"
              value={dashboardStats.totalStudents}
              color="bg-[rgba(227,179,65,0.1)] text-[#e3b341]"
            />
            <StatCard
              icon={FiMessageSquare}
              label="Moyenne générale"
              value={`${dashboardStats.avgScore}/20`}
              trend={{ value: 3, isPositive: true }}
              color="bg-[rgba(139,148,158,0.1)] text-[#8b949e]"
            />
            <StatCard
              icon={FiBell}
              label="Examens terminés"
              value={dashboardStats.completedExams}
              color="bg-[rgba(56,139,253,0.1)] text-[#388bfd]"
            />
            <StatCard
              icon={FiClock}
              label="Corrections en attente"
              value={dashboardStats.pendingCorrections}
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
            activeTab === 'exams' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('exams')}
        >
          <span className="flex items-center gap-2">
            <FiCalendar size={14} /> Examens
          </span>
        </button>
        <button
          className={`px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'results' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd] -mb-px' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('results')}
        >
          <span className="flex items-center gap-2">
            <FiActivity size={14} /> Résultats
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
            <FiTrendingUp size={14} /> Analytics
          </span>
        </button>
      </div>

      {/* Contenu principal */}
      <div className="space-y-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Examens à venir */}
            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <h3 className="text-base font-semibold mb-5">Examens à venir</h3>
              <div className="space-y-4">
                {exams.filter(e => e.status === 'scheduled').map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-[#161b22] flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#388bfd]">
                        <FiCalendar size={18} />
                      </div>
                      <div>
                        <p className="text-base font-semibold">{exam.title}</p>
                        <p className="text-sm text-[#484f58] mt-1">{exam.class} - {exam.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base">{exam.date}</p>
                      <p className="text-sm text-[#484f58] mt-1">{exam.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Derniers résultats */}
            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <h3 className="text-base font-semibold mb-5">Derniers résultats</h3>
              <div className="space-y-4">
                {results.slice(0, 5).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 bg-[#161b22] flex-wrap gap-4">
                    <div>
                      <p className="text-base font-medium">{result.studentName}</p>
                      <p className="text-sm text-[#484f58] mt-1">Rang: {result.rank}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-semibold ${result.value >= 10 ? 'text-[#39d353]' : 'text-[#f85149]'}`}>
                        {result.value}/20
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Examens */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border border-[#21262d] flex-1">
                <FiSearch size={16} className="text-[#484f58]" />
                <input
                  type="text"
                  placeholder="Rechercher un examen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[#e6edf3] text-[14px] placeholder:text-[#484f58] focus:outline-none"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#388bfd] text-white text-[13px] font-medium hover:bg-[#58a6ff] transition-colors">
                <FiUserPlus size={14} /> Nouvel examen
              </button>
            </div>

            <div className="space-y-4">
              {filteredExams.map((exam) => (
                <div key={exam.id} className="bg-[#0d1117] border border-[#21262d] overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      <div className="flex gap-5">
                        <div className="w-14 h-14 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#388bfd]">
                          <FiCalendar size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h3 className="text-lg font-semibold">{exam.title}</h3>
                            <StatusBadge status={exam.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[#484f58] mb-3">
                            <span>{exam.subject}</span>
                            <span>•</span>
                            <span>{exam.class}</span>
                            {exam.coefficient && <span>• Coefficient: {exam.coefficient}</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center gap-2"><FiCalendar size={14} /> {exam.date}</span>
                            <span className="flex items-center gap-2"><FiClock size={14} /> {exam.duration} minutes</span>
                            {exam.avgGrade && (
                              <span className="flex items-center gap-2 text-[#39d353]">Moyenne: {exam.avgGrade}/20</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-9 h-9 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                          <FiEye size={16} />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3]">
                          <FiMoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résultats */}
        {activeTab === 'results' && (
          <div className="bg-[#0d1117] border border-[#21262d] overflow-hidden">
            <div className="p-5 border-b border-[#21262d] bg-[#161b22]">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm font-medium text-[#484f58]">
                <div>Élève</div>
                <div>Examen</div>
                <div>Note</div>
                <div>Rang</div>
              </div>
            </div>
            <div className="divide-y divide-[#21262d]">
              {results.map((result) => {
                const exam = exams.find(e => e.id === result.examId);
                return (
                  <div key={result.id} className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-sm font-semibold text-[#388bfd]">
                          {result.studentName.charAt(0)}
                        </div>
                        <span className="text-base font-medium">{result.studentName}</span>
                      </div>
                      <div className="text-base">{exam?.title || 'N/A'}</div>
                      <div className={`text-xl font-semibold ${result.value >= 10 ? 'text-[#39d353]' : 'text-[#f85149]'}`}>
                        {result.value}/20
                      </div>
                      <div className="text-base text-[#484f58]">{result.rank}</div>
                    </div>
                    {result.feedback && (
                      <div className="mt-4 ml-12 text-sm text-[#8b949e]">
                        Feedback: {result.feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0d1117] border border-[#21262d] p-5">
                <h3 className="text-base font-semibold mb-5">Performance globale</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Taux de réussite</span>
                      <span className="text-[#388bfd]">{analytics.successRate}%</span>
                    </div>
                    <div className="h-2 bg-[#1c2330] overflow-hidden">
                      <div className="h-full bg-[#388bfd]" style={{ width: `${analytics.successRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Taux de participation</span>
                      <span className="text-[#39d353]">{analytics.participationRate}%</span>
                    </div>
                    <div className="h-2 bg-[#1c2330] overflow-hidden">
                      <div className="h-full bg-[#39d353]" style={{ width: `${analytics.participationRate}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] border border-[#21262d] p-5">
                <h3 className="text-base font-semibold mb-5">Meilleurs élèves</h3>
                <div className="space-y-4">
                  {analytics.topPerformers.map((student, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#484f58]">#{idx + 1}</span>
                        <span className="text-base">{student.name}</span>
                      </div>
                      <span className="text-base font-semibold text-[#39d353]">{student.score}/20</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistiques générales */}
            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <h3 className="text-base font-semibold mb-5">Statistiques générales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-5 bg-[#161b22] border border-[#21262d]">
                  <div className="text-3xl font-semibold text-[#388bfd]">{analytics.totalExams}</div>
                  <div className="text-sm text-[#484f58] mt-2">Examens organisés</div>
                </div>
                <div className="p-5 bg-[#161b22] border border-[#21262d]">
                  <div className="text-3xl font-semibold text-[#39d353]">{analytics.avgScore}/20</div>
                  <div className="text-sm text-[#484f58] mt-2">Moyenne générale</div>
                </div>
                <div className="p-5 bg-[#161b22] border border-[#21262d]">
                  <div className="text-3xl font-semibold text-[#e3b341]">{analytics.successRate}%</div>
                  <div className="text-sm text-[#484f58] mt-2">Taux de réussite</div>
                </div>
              </div>
            </div>
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