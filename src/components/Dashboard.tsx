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
  { 
    id: 1,
    dot: "#39d353", 
    text: <><strong>Lycée Victor Hugo</strong> a renouvelé son abonnement Enterprise</>, 
    time: "Il y a 2 min",
    icon: FiCheckCircle
  },
  { 
    id: 2,
    dot: "#388bfd", 
    text: <><strong>IUT de Bordeaux</strong> a activé 12 nouvelles licences</>, 
    time: "Il y a 18 min",
    icon: FiUsers
  },
  { 
    id: 3,
    dot: "#e3b341", 
    text: <><strong>École Pasteur</strong> — paiement en attente depuis 5 jours</>, 
    time: "Il y a 1h",
    icon: FiClock
  },
  { 
    id: 4,
    dot: "#39d353", 
    text: <><strong>Collège Jean Moulin</strong> a mis à jour vers v4.1.0</>, 
    time: "Il y a 3h",
    icon: FiTrendingUp
  },
  { 
    id: 5,
    dot: "#f85149", 
    text: <><strong>Lycée Rodin</strong> — abonnement suspendu (impayé)</>, 
    time: "Il y a 6h",
    icon: FiAlertCircle
  },
  { 
    id: 6,
    dot: "#a5a0e8", 
    text: <><strong>Nouvelle inscription</strong> — École Montessori</>, 
    time: "Il y a 8h",
    icon: RiUserStarLine
  },
];

const riskClients: RiskClient[] = [
  { id: 1, name: "Sophie Martin", school: "École Primaire Pasteur", status: "inactive", alert: "Paiement en retard" },
  { id: 2, name: "Thomas Renard", school: "Lycée Technique Rodin", status: "suspended", alert: "Abonnement suspendu" },
  { id: 3, name: "Isabelle Petit", school: "École Montessori", status: "pending", alert: "Inscription incomplète" },
  { id: 4, name: "Nicolas Bernard", school: "Lycée International", status: "inactive", alert: "Non connecté depuis 30 jours" },
];

// Composant Status Badge
function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { class: string; label: string; icon: React.ElementType }> = {
    active: { class: 'badge-green', label: 'Actif', icon: FiCheckCircle },
    inactive: { class: 'badge-gray', label: 'Inactif', icon: FiXCircle },
    suspended: { class: 'badge-red', label: 'Suspendu', icon: FiAlertCircle },
    pending: { class: 'badge-amber', label: 'En attente', icon: FiClock },
    paid: { class: 'badge-green', label: 'Payé', icon: FiCheckCircle },
    overdue: { class: 'badge-red', label: 'En retard', icon: FiAlertCircle },
    cancelled: { class: 'badge-gray', label: 'Annulé', icon: FiXCircle },
  };

  const config = statusConfig[status] || { class: 'badge-gray', label: status, icon: FiAlertCircle };
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

// Composant StatCard
function StatCard({ 
  label, 
  value, 
  unit = '', 
  change, 
  icon: Icon, 
  color, 
  delay 
}: StatCardProps) {
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}s` }}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={{ background: `${color}15`, color }}>
          <Icon size={18} />
        </div>
      </div>
      
      <div className="stat-main">
        <div className="stat-value-group">
          <span className="stat-value">{value}</span>
          {unit && <span className="stat-unit">{unit}</span>}
        </div>
        
        {change && (
          <div className={`stat-change ${change.positive ? 'up' : 'down'}`}>
            {change.positive ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
            <span>{change.value}</span>
          </div>
        )}
      </div>

      <div className="stat-stripe" style={{ background: color }} />
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
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: '#1c2330',
          borderColor: '#30363d',
          textStyle: {
            color: '#e6edf3',
            fontSize: 11
          }
        },
        legend: {
          data: ['Revenus', 'Utilisateurs'],
          textStyle: {
            color: '#8b949e',
            fontSize: 11
          },
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
          axisLabel: {
            color: '#8b949e',
            fontSize: 10
          },
          axisLine: {
            lineStyle: {
              color: '#30363d'
            }
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: '#30363d',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#8b949e',
            fontSize: 10
          }
        },
        series: [
          {
            name: 'Revenus',
            type: 'bar',
            data: data.map(d => d.revenue),
            itemStyle: {
              color: '#388bfd',
              borderRadius: [4, 4, 0, 0]
            },
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
            itemStyle: {
              color: '#39d353',
              borderRadius: [4, 4, 0, 0]
            },
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

    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data]);

  useEffect(() => {
    setTimeout(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    }, 100);
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
}

// Composant ECharts pour le graphique en donut
function EChartsDonutChart({ data }: { data: DonutData[] }) {
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
          trigger: 'item',
          backgroundColor: '#1c2330',
          borderColor: '#30363d',
          textStyle: {
            color: '#e6edf3',
            fontSize: 11
          },
          formatter: '{b}: {c}%'
        },
        series: [
          {
            name: 'Répartition des plans',
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#0d1117',
              borderWidth: 2
            },
            label: {
              show: false
            },
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
            data: data.map(item => ({
              value: item.value,
              name: item.label,
              itemStyle: {
                color: item.color
              }
            })),
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut'
          }
        ]
      };

      chartInstance.current.setOption(option);
    }

    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data]);

  useEffect(() => {
    setTimeout(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    }, 100);
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '250px' }} />;
}

// Composant principal
export default function Dashboard({ onNotify = () => {} }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const stats: StatCardProps[] = [
    {
      label: "Revenus Mensuels",
      value: "8 100",
      unit: "€",
      change: { value: "+9.4%", positive: true },
      icon: FiDollarSign,
      color: "#388bfd",
      delay: 0
    },
    {
      label: "Clients Actifs",
      value: "287",
      change: { value: "+11.4%", positive: true },
      icon: FiUsers,
      color: "#39d353",
      delay: 0.1
    },
    {
      label: "Clés Activées",
      value: "1 240",
      change: { value: "+4.2%", positive: true },
      icon: FiKey,
      color: "#a5a0e8",
      delay: 0.2
    },
    {
      label: "Taux de Rétention",
      value: "94.2",
      unit: "%",
      change: { value: "-0.8%", positive: false },
      icon: FiPercent,
      color: "#e3b341",
      delay: 0.3
    },
  ];

  return (
    <div className="dashboard">
      {/* En-tête */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            <HiOutlinePresentationChartLine size={28} />
            Vue d'ensemble
          </h1>
          <p className="dashboard-subtitle">
            <FiActivity size={12} />
            Tableau de bord mis à jour en temps réel
          </p>
        </div>
        
        <div className="dashboard-actions">
          <div className="time-range">
            <button 
              className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Semaine
            </button>
            <button 
              className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Mois
            </button>
            <button 
              className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              Année
            </button>
          </div>
          
          <button className="btn btn-ghost" onClick={() => onNotify('Données actualisées', 'green')}>
            <FiRefreshCw size={14} className="spin-on-hover" /> Actualiser
          </button>
          
          <button className="btn btn-ghost" onClick={() => onNotify('Export du dashboard', 'blue')}>
            <FiDownload size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* Grille des statistiques */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Graphiques avec ECharts */}
      <div className="charts-row">
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Revenus & Utilisateurs</h3>
              <p className="panel-sub">Évolution sur les 6 derniers mois</p>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#388bfd' }} />
                <span>Revenus</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#39d353' }} />
                <span>Utilisateurs</span>
              </div>
            </div>
          </div>
          <EChartsBarChart data={chartData} />
        </div>

        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Répartition des plans</h3>
              <p className="panel-sub">Par abonnement actif</p>
            </div>
            <HiOutlineChartPie size={18} className="panel-icon" />
          </div>
          <div className="donut-section">
            <EChartsDonutChart data={donutData} />
            <div className="donut-legend">
              {donutData.map((item, index) => (
                <div key={index} className="legend-row">
                  <div className="legend-left">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-label">{item.label}</span>
                  </div>
                  <span className="legend-value" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente et clients à risque */}
      <div className="activity-risk-row">
        <div className="activity-panel">
          <div className="panel-header">
            <h3 className="panel-title">Activité récente</h3>
            <button className="view-all" onClick={() => onNotify('Voir toutes les activités', 'blue')}>
              Voir tout <FiArrowUp size={12} style={{ transform: 'rotate(90deg)' }} />
            </button>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => {
              const Icon = activity.icon || FiActivity;
              return (
                <div key={activity.id} className="activity-item">
                  <div className="activity-dot" style={{ background: activity.dot }} />
                  <Icon size={12} className="activity-icon" style={{ color: activity.dot }} />
                  <div className="activity-content">
                    <div className="activity-text">{activity.text}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="risk-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3 className="panel-title">Clients à risque</h3>
              <span className="alert-badge">4 alertes</span>
            </div>
            <FiAlertCircle size={16} className="alert-icon" />
          </div>
          <div className="risk-list">
            {riskClients.map((client) => (
              <div key={client.id} className="risk-item">
                <div className="risk-info">
                  <div className="risk-name">{client.name}</div>
                  <div className="risk-school">{client.school}</div>
                  {client.alert && (
                    <div className="risk-alert">
                      <FiAlertCircle size={10} />
                      {client.alert}
                    </div>
                  )}
                </div>
                <StatusBadge status={client.status} />
              </div>
            ))}
          </div>
          <button className="view-all-risk" onClick={() => onNotify('Voir tous les risques', 'amber')}>
            Gérer les alertes
          </button>
        </div>
      </div>

      <style>{`
        .dashboard {
          animation: fadeIn 0.4s ease;
          width: 100%;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dashboard-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }

        .dashboard-subtitle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #8b949e;
          margin-top: 4px;
        }

        .dashboard-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .time-range {
          display: flex;
          gap: 4px;
          background: #161b22;
          border: 1px solid #21262d;
          padding: 2px;
        }

        .time-btn {
          padding: 6px 12px;
          font-size: 12px;
          background: transparent;
          border: none;
          color: #8b949e;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .time-btn:hover {
          color: #e6edf3;
        }

        .time-btn.active {
          background: #1c2330;
          color: #388bfd;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: #21262d;
          border: 1px solid #21262d;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #0d1117;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: slideUp 0.4s ease forwards;
          opacity: 0;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #484f58;
        }
        
        .stat-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .stat-card:hover .stat-icon {
          transform: rotate(5deg) scale(1.1);
        }
        
        .stat-main {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .stat-value-group {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 300;
          letter-spacing: -1px;
          color: #e6edf3;
          line-height: 1;
        }
        
        .stat-unit {
          font-size: 12px;
          color: #484f58;
        }
        
        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
        }
        
        .stat-change.up {
          background: rgba(57, 211, 83, 0.15);
          color: #39d353;
        }
        
        .stat-change.down {
          background: rgba(248, 81, 73, 0.15);
          color: #f85149;
        }
        
        .stat-stripe {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          transform: scaleX(0);
          transform-origin: left;
          animation: stripeExpand 0.5s ease forwards 0.3s;
        }

        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1px;
          background: #21262d;
          border: 1px solid #21262d;
          margin-bottom: 24px;
        }

        .chart-panel {
          background: #0d1117;
          padding: 24px;
          min-height: 400px;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .panel-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
          color: #e6edf3;
        }

        .panel-sub {
          font-size: 12px;
          color: #8b949e;
        }

        .panel-icon {
          color: #8b949e;
        }

        .chart-legend {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #8b949e;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
        }

        .donut-section {
          display: flex;
          align-items: center;
          gap: 24px;
          height: 100%;
        }

        .donut-legend {
          flex: 1;
        }

        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #21262d;
        }

        .legend-row:last-child {
          border-bottom: none;
        }

        .legend-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-label {
          font-size: 12px;
          color: #8b949e;
        }

        .legend-value {
          font-size: 13px;
          font-weight: 500;
        }

        .activity-risk-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #21262d;
          border: 1px solid #21262d;
        }

        .activity-panel, .risk-panel {
          background: #0d1117;
          padding: 24px;
        }

        .view-all {
          display: flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: #8b949e;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all:hover {
          color: #388bfd;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #21262d;
          animation: slideInRight 0.3s ease;
          position: relative;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-dot {
          width: 6px;
          height: 6px;
          margin-top: 6px;
          border-radius: 50%;
        }

        .activity-icon {
          position: absolute;
          left: 0;
          top: 14px;
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.2s ease;
        }

        .activity-item:hover .activity-icon {
          opacity: 1;
          transform: scale(1);
        }

        .activity-item:hover .activity-dot {
          opacity: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          font-size: 13px;
          color: #8b949e;
          line-height: 1.5;
        }

        .activity-text strong {
          color: #e6edf3;
          font-weight: 500;
        }

        .activity-time {
          font-size: 11px;
          color: #484f58;
          margin-top: 2px;
        }

        .panel-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .alert-badge {
          padding: 2px 8px;
          background: rgba(248, 81, 73, 0.15);
          border: 1px solid rgba(248, 81, 73, 0.3);
          font-size: 11px;
          color: #f85149;
        }

        .alert-icon {
          color: #f85149;
        }

        .risk-list {
          margin: 16px 0;
        }

        .risk-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #21262d;
          animation: slideInRight 0.3s ease;
        }

        .risk-item:last-child {
          border-bottom: none;
        }

        .risk-info {
          flex: 1;
        }

        .risk-name {
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 2px;
          color: #e6edf3;
        }

        .risk-school {
          font-size: 11px;
          color: #8b949e;
          margin-bottom: 2px;
        }

        .risk-alert {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: #e3b341;
        }

        .view-all-risk {
          width: 100%;
          padding: 10px;
          background: #161b22;
          border: 1px solid #21262d;
          color: #8b949e;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 16px;
        }

        .view-all-risk:hover {
          background: #1c2330;
          border-color: #30363d;
          color: #e6edf3;
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

        .btn-ghost {
          background: transparent;
          border: 1px solid #21262d;
          color: #8b949e;
        }

        .btn-ghost:hover {
          border-color: #30363d;
          color: #e6edf3;
          transform: translateY(-2px);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          animation: badgePop 0.3s ease;
        }
        
        .badge-green {
          background: rgba(57, 211, 83, 0.15);
          color: #39d353;
          border: 1px solid rgba(57, 211, 83, 0.3);
        }
        
        .badge-red {
          background: rgba(248, 81, 73, 0.15);
          color: #f85149;
          border: 1px solid rgba(248, 81, 73, 0.3);
        }
        
        .badge-amber {
          background: rgba(227, 179, 65, 0.15);
          color: #e3b341;
          border: 1px solid rgba(227, 179, 65, 0.3);
        }
        
        .badge-blue {
          background: rgba(56, 139, 253, 0.15);
          color: #388bfd;
          border: 1px solid rgba(56, 139, 253, 0.3);
        }
        
        .badge-gray {
          background: #1c2330;
          color: #484f58;
          border: 1px solid #21262d;
        }

        .spin-on-hover:hover {
          animation: spin 1s ease infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes stripeExpand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes badgePop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .charts-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .dashboard-actions {
            width: 100%;
          }

          .time-range {
            width: 100%;
          }

          .time-btn {
            flex: 1;
            text-align: center;
          }

          .activity-risk-row {
            grid-template-columns: 1fr;
          }

          .donut-section {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}