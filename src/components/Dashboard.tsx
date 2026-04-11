import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import {
  FiTrendingUp, FiDollarSign, FiUsers,
  FiKey, FiPercent, FiActivity, FiClock,
  FiArrowUp, FiArrowDown, FiRefreshCw,
  FiDownload, FiAlertCircle, FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import {
  HiOutlinePresentationChartLine,
  HiOutlineChartPie
} from 'react-icons/hi';
import { RiUserStarLine } from 'react-icons/ri';

// Types
interface ChartData {
  month: string;
  revenue: number;
  users: number;
}

interface DonutData {
  label: string;
  value: number;
  color: string;
}

interface ActivityItem {
  id: number;
  dot: string;
  text: React.ReactNode;
  time: string;
  icon?: React.ElementType;
}

interface RiskClient {
  id: number;
  name: string;
  school: string;
  status: string;
  alert?: string;
}

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  change?: { value: string; positive: boolean };
  icon: React.ElementType;
  color: string;
  delay: number;
}

interface StatusBadgeProps {
  status: string;
}

interface DashboardProps {
  onNotify?: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

// Données mockées
const chartData: ChartData[] = [
  { month: "Sep", revenue: 4200, users: 210 },
  { month: "Oct", revenue: 5100, users: 245 },
  { month: "Nov", revenue: 4800, users: 230 },
  { month: "Dec", revenue: 6200, users: 287 },
  { month: "Jan", revenue: 7400, users: 320 },
  { month: "Fév", revenue: 8100, users: 357 },
];

const donutData: DonutData[] = [
  { label: "Enterprise", value: 47, color: "#388bfd" },
  { label: "Premium", value: 35, color: "#39d353" },
  { label: "Basic", value: 18, color: "#e3b341" },
];

const recentActivity: ActivityItem[] = [
  { id: 1, dot: "#39d353", text: <><strong>Lycée Victor Hugo</strong> a renouvelé son abonnement Enterprise</>, time: "Il y a 2 min", icon: FiCheckCircle },
  { id: 2, dot: "#388bfd", text: <><strong>IUT de Bordeaux</strong> a activé 12 nouvelles licences</>, time: "Il y a 18 min", icon: FiUsers },
  { id: 3, dot: "#e3b341", text: <><strong>École Pasteur</strong> — paiement en attente depuis 5 jours</>, time: "Il y a 1h", icon: FiClock },
  { id: 4, dot: "#39d353", text: <><strong>Collège Jean Moulin</strong> a mis à jour vers v4.1.0</>, time: "Il y a 3h", icon: FiTrendingUp },
  { id: 5, dot: "#f85149", text: <><strong>Lycée Rodin</strong> — abonnement suspendu (impayé)</>, time: "Il y a 6h", icon: FiAlertCircle },
  { id: 6, dot: "#a5a0e8", text: <><strong>Nouvelle inscription</strong> — École Montessori</>, time: "Il y a 8h", icon: RiUserStarLine },
];

const riskClients: RiskClient[] = [
  { id: 1, name: "Sophie Martin", school: "École Primaire Pasteur", status: "inactive", alert: "Paiement en retard" },
  { id: 2, name: "Thomas Renard", school: "Lycée Technique Rodin", status: "suspended", alert: "Abonnement suspendu" },
  { id: 3, name: "Isabelle Petit", school: "École Montessori", status: "pending", alert: "Inscription incomplète" },
  { id: 4, name: "Nicolas Bernard", school: "Lycée International", status: "inactive", alert: "Non connecté depuis 30 jours" },
];

// Composant Status Badge
function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; border: string; label: string; icon: React.ElementType }> = {
    active: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', border: 'border-[rgba(57,211,83,0.3)]', label: 'Actif', icon: FiCheckCircle },
    inactive: { bg: 'bg-[#1c2330]', text: 'text-[#484f58]', border: 'border-[#21262d]', label: 'Inactif', icon: FiXCircle },
    suspended: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', border: 'border-[rgba(248,81,73,0.3)]', label: 'Suspendu', icon: FiAlertCircle },
    pending: { bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', border: 'border-[rgba(227,179,65,0.3)]', label: 'En attente', icon: FiClock },
    paid: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', border: 'border-[rgba(57,211,83,0.3)]', label: 'Payé', icon: FiCheckCircle },
    overdue: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', border: 'border-[rgba(248,81,73,0.3)]', label: 'En retard', icon: FiAlertCircle },
    cancelled: { bg: 'bg-[#1c2330]', text: 'text-[#484f58]', border: 'border-[#21262d]', label: 'Annulé', icon: FiXCircle },
  };

  const config = statusConfig[status] || { bg: 'bg-[#1c2330]', text: 'text-[#484f58]', border: 'border-[#21262d]', label: status, icon: FiAlertCircle };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium ${config.bg} ${config.text} ${config.border} border animate-[badgePop_0.3s_ease]`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

// Composant StatCard
function StatCard({ label, value, unit = '', change, icon: Icon, color, delay }: StatCardProps) {
  return (
    <div className="bg-[#0d1117] p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] animate-[slideUp_0.4s_ease_forwards] opacity-0" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold tracking-[0.8px] uppercase text-[#484f58]">{label}</span>
        <div className="w-8 h-8 flex items-center justify-center transition-all duration-200 group-hover:rotate-5 group-hover:scale-110" style={{ background: `${color}15`, color }}>
          <Icon size={18} />
        </div>
      </div>
      
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-light tracking-[-1px] text-[#e6edf3] leading-none">{value}</span>
          {unit && <span className="text-xs text-[#484f58]">{unit}</span>}
        </div>
        
        {change && (
          <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 ${change.positive ? 'bg-[rgba(57,211,83,0.15)] text-[#39d353]' : 'bg-[rgba(248,81,73,0.15)] text-[#f85149]'}`}>
            {change.positive ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
            <span>{change.value}</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 animate-[stripeExpand_0.5s_ease_forwards_0.3s]" style={{ background: color, transformOrigin: 'left' }} />
    </div>
  );
}

// Composant ECharts pour le graphique en barres
function EChartsBarChart({ data }: { data: ChartData[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      
      chartInstance.current = echarts.init(chartRef.current);

      const option: EChartsOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#1c2330',
          borderColor: '#30363d',
          textStyle: { color: '#e6edf3', fontSize: 11 }
        },
        legend: {
          data: ['Revenus', 'Utilisateurs'],
          textStyle: { color: '#8b949e', fontSize: 11 },
          bottom: 0,
          left: 'center'
        },
        grid: {
          left: '10%',
          right: '5%',
          bottom: '20%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map(d => d.month),
          axisLabel: { color: '#8b949e', fontSize: 10 },
          axisLine: { lineStyle: { color: '#30363d' } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#30363d', type: 'dashed' } },
          axisLabel: { color: '#8b949e', fontSize: 10 }
        },
        series: [
          {
            name: 'Revenus',
            type: 'bar',
            data: data.map(d => d.revenue),
            itemStyle: { color: '#388bfd' },
            barWidth: 20,
            label: {
              show: true,
              position: 'top',
              color: '#8b949e',
              fontSize: 10,
              formatter: (params: any) => `${params.value}€`
            }
          },
          {
            name: 'Utilisateurs',
            type: 'bar',
            data: data.map(d => d.users),
            itemStyle: { color: '#39d353' },
            barWidth: 20,
            label: {
              show: true,
              position: 'top',
              color: '#8b949e',
              fontSize: 10,
              formatter: (params: any) => params.value
            }
          }
        ],
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      };

      chartInstance.current.setOption(option);
    }

    const handleResize = () => { if (chartInstance.current) chartInstance.current.resize(); };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) { chartInstance.current.dispose(); chartInstance.current = null; }
    };
  }, [data]);

  useEffect(() => {
    setTimeout(() => { if (chartInstance.current) chartInstance.current.resize(); }, 100);
  }, []);

  return <div ref={chartRef} className="w-full h-[300px]" />;
}

// Composant ECharts pour le graphique en donut
function EChartsDonutChart({ data }: { data: DonutData[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.dispose();
      
      chartInstance.current = echarts.init(chartRef.current);

      const option: EChartsOption = {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#1c2330',
          borderColor: '#30363d',
          textStyle: { color: '#e6edf3', fontSize: 11 },
          formatter: '{b}: {c}%'
        },
        series: [{
          name: 'Répartition des plans',
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderColor: '#0d1117', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            scale: true,
            label: {
              show: true,
              position: 'center',
              fontSize: 14,
              fontWeight: 'bold',
              color: '#e6edf3',
              formatter: '{b}\n{d}%'
            }
          },
          data: data.map(item => ({ value: item.value, name: item.label, itemStyle: { color: item.color } })),
          animation: true,
          animationDuration: 1000,
          animationEasing: 'cubicOut'
        }]
      };

      chartInstance.current.setOption(option);
    }

    const handleResize = () => { if (chartInstance.current) chartInstance.current.resize(); };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) { chartInstance.current.dispose(); chartInstance.current = null; }
    };
  }, [data]);

  useEffect(() => {
    setTimeout(() => { if (chartInstance.current) chartInstance.current.resize(); }, 100);
  }, []);

  return <div ref={chartRef} className="w-full h-[250px]" />;
}

// Composant principal
export default function Dashboard({ onNotify = () => {} }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const stats: StatCardProps[] = [
    { label: "Revenus Mensuels", value: "8 100", unit: "€", change: { value: "+9.4%", positive: true }, icon: FiDollarSign, color: "#388bfd", delay: 0 },
    { label: "Clients Actifs", value: "287", change: { value: "+11.4%", positive: true }, icon: FiUsers, color: "#39d353", delay: 0.1 },
    { label: "Clés Activées", value: "1 240", change: { value: "+4.2%", positive: true }, icon: FiKey, color: "#a5a0e8", delay: 0.2 },
    { label: "Taux de Rétention", value: "94.2", unit: "%", change: { value: "-0.8%", positive: false }, icon: FiPercent, color: "#e3b341", delay: 0.3 },
  ];

  return (
    <div className="w-full animate-[fadeIn_0.4s_ease]">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes stripeExpand { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes badgePop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-on-hover:hover { animation: spin 1s ease infinite; }
        .group\\:hover\\:rotate-5:hover { transform: rotate(5deg); }
        .group\\:hover\\:scale-110:hover { transform: scale(1.1); }
      `}</style>

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6 max-[768px]:flex-col max-[768px]:items-start">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-[-0.5px]">
            <HiOutlinePresentationChartLine size={28} />
            Vue d'ensemble
          </h1>
          <p className="flex items-center gap-1.5 text-[13px] text-[#8b949e] mt-1">
            <FiActivity size={12} />
            Tableau de bord mis à jour en temps réel
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap max-[768px]:w-full">
          <div className="flex gap-1 bg-[#161b22] border border-[#21262d] p-0.5">
            <button className={`px-3 py-1.5 text-xs bg-transparent border-none text-[#8b949e] cursor-pointer transition-all duration-200 hover:text-[#e6edf3] ${timeRange === 'week' ? 'bg-[#1c2330] text-[#388bfd]' : ''}`} onClick={() => setTimeRange('week')}>Semaine</button>
            <button className={`px-3 py-1.5 text-xs bg-transparent border-none text-[#8b949e] cursor-pointer transition-all duration-200 hover:text-[#e6edf3] ${timeRange === 'month' ? 'bg-[#1c2330] text-[#388bfd]' : ''}`} onClick={() => setTimeRange('month')}>Mois</button>
            <button className={`px-3 py-1.5 text-xs bg-transparent border-none text-[#8b949e] cursor-pointer transition-all duration-200 hover:text-[#e6edf3] ${timeRange === 'year' ? 'bg-[#1c2330] text-[#388bfd]' : ''}`} onClick={() => setTimeRange('year')}>Année</button>
          </div>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:-translate-y-0.5" onClick={() => onNotify('Données actualisées', 'green')}>
            <FiRefreshCw size={14} className="spin-on-hover" /> Actualiser
          </button>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:-translate-y-0.5" onClick={() => onNotify('Export du dashboard', 'blue')}>
            <FiDownload size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* Grille des statistiques */}
      <div className="grid grid-cols-4 gap-px bg-[#21262d] border border-[#21262d] mb-6 max-[1100px]:grid-cols-2 max-[480px]:grid-cols-1">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Graphiques avec ECharts */}
      <div className="grid grid-cols-[2fr_1fr] gap-px bg-[#21262d] border border-[#21262d] mb-6 max-[1100px]:grid-cols-1">
        <div className="bg-[#0d1117] p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold mb-0.5 text-[#e6edf3]">Revenus & Utilisateurs</h3>
              <p className="text-xs text-[#8b949e]">Évolution sur les 6 derniers mois</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e]"><span className="w-2 h-2 bg-[#388bfd]" /><span>Revenus</span></div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e]"><span className="w-2 h-2 bg-[#39d353]" /><span>Utilisateurs</span></div>
            </div>
          </div>
          <EChartsBarChart data={chartData} />
        </div>

        <div className="bg-[#0d1117] p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold mb-0.5 text-[#e6edf3]">Répartition des plans</h3>
              <p className="text-xs text-[#8b949e]">Par abonnement actif</p>
            </div>
            <HiOutlineChartPie size={18} className="text-[#8b949e]" />
          </div>
          <div className="flex items-center gap-6 h-full max-[768px]:flex-col">
            <EChartsDonutChart data={donutData} />
            <div className="flex-1">
              {donutData.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-[#21262d] last:border-b-0">
                  <div className="flex items-center gap-2"><span className="w-2 h-2" style={{ background: item.color }} /><span className="text-xs text-[#8b949e]">{item.label}</span></div>
                  <span className="text-[13px] font-medium" style={{ color: item.color }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente et clients à risque */}
      <div className="grid grid-cols-2 gap-px bg-[#21262d] border border-[#21262d] max-[768px]:grid-cols-1">
        <div className="bg-[#0d1117] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-[#e6edf3]">Activité récente</h3>
            <button className="flex items-center gap-1 bg-transparent border-none text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:text-[#388bfd]" onClick={() => onNotify('Voir toutes les activités', 'blue')}>
              Voir tout <FiArrowUp size={12} className="rotate-90" />
            </button>
          </div>
          <div className="flex flex-col">
            {recentActivity.map((activity) => {
              const Icon = activity.icon || FiActivity;
              return (
                <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-[#21262d] last:border-b-0 animate-[slideInRight_0.3s_ease] relative group">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-opacity-100 group-hover:opacity-0 transition-opacity duration-200" style={{ background: activity.dot }} />
                  <Icon size={12} className="absolute left-0 top-3.5 opacity-0 scale-50 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100" style={{ color: activity.dot }} />
                  <div className="flex-1">
                    <div className="text-[13px] text-[#8b949e] leading-relaxed">{activity.text}</div>
                    <div className="text-[11px] text-[#484f58] mt-0.5">{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0d1117] p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-[#e6edf3]">Clients à risque</h3>
              <span className="px-2 py-0.5 bg-[rgba(248,81,73,0.15)] border border-[rgba(248,81,73,0.3)] text-[11px] text-[#f85149]">4 alertes</span>
            </div>
            <FiAlertCircle size={16} className="text-[#f85149]" />
          </div>
          <div className="my-4">
            {riskClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between py-3 border-b border-[#21262d] last:border-b-0 animate-[slideInRight_0.3s_ease]">
                <div className="flex-1">
                  <div className="text-[13px] font-medium mb-0.5 text-[#e6edf3]">{client.name}</div>
                  <div className="text-[11px] text-[#8b949e] mb-0.5">{client.school}</div>
                  {client.alert && (
                    <div className="flex items-center gap-1 text-[10px] text-[#e3b341]"><FiAlertCircle size={10} />{client.alert}</div>
                  )}
                </div>
                <StatusBadge status={client.status} />
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 bg-[#161b22] border border-[#21262d] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 mt-4 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onNotify('Voir tous les risques', 'amber')}>
            Gérer les alertes
          </button>
        </div>
      </div>
    </div>
  );
}