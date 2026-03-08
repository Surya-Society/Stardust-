// Abonnements.tsx
import { useState } from 'react';
import { 
  FiCreditCard, FiPlus, FiRefreshCw, FiDollarSign, 
  FiUsers, FiClock, FiXCircle, FiCheckCircle,
  FiAlertCircle, FiCalendar, FiTrendingUp, FiSearch,
  FiFilter, FiMoreVertical, FiSend, FiPauseCircle,
  FiPlayCircle, FiDownload, FiEye, FiEdit2, FiTrash2
} from 'react-icons/fi';
import { BiBuildings } from 'react-icons/bi';

interface Subscription {
  id: number;
  school: string;
  plan: 'Basic' | 'Premium' | 'Enterprise';
  amount: string;
  status: 'paid' | 'overdue' | 'cancelled' | 'suspended' | 'pending';
  nextBilling: string;
  users: number;
}

interface StatusBadgeProps {
  status: Subscription['status'];
}

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  color: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    positive: boolean;
  };
}

interface AbonnementsProps {
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

// Données mockées avec FCFA
const subscriptions: Subscription[] = [
  { id: 1, school: "Lycée Victor Hugo", plan: "Premium", amount: "299 000 FCFA/mois", status: "paid", nextBilling: "12 Fév 2026", users: 48 },
  { id: 2, school: "Collège Jean Moulin", plan: "Enterprise", amount: "599 000 FCFA/mois", status: "paid", nextBilling: "03 Mar 2026", users: 120 },
  { id: 3, school: "École Primaire Pasteur", plan: "Basic", amount: "99 000 FCFA/mois", status: "overdue", nextBilling: "15 Jan 2026", users: 30 },
  { id: 4, school: "Lycée Technique Rodin", plan: "Premium", amount: "299 000 FCFA/mois", status: "cancelled", nextBilling: "—", users: 0 },
  { id: 5, school: "IUT de Bordeaux", plan: "Enterprise", amount: "599 000 FCFA/mois", status: "paid", nextBilling: "01 Mai 2026", users: 89 },
  { id: 6, school: "École Supérieure de Commerce", plan: "Enterprise", amount: "599 000 FCFA/mois", status: "pending", nextBilling: "15 Mar 2026", users: 45 },
  { id: 7, school: "Lycée International", plan: "Premium", amount: "299 000 FCFA/mois", status: "paid", nextBilling: "20 Fév 2026", users: 67 },
];

// Composant Badge de statut (sans border-radius)
function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    paid: { 
      class: 'badge-success', 
      label: 'Payé', 
      icon: FiCheckCircle,
      color: 'var(--accent-teal)'
    },
    overdue: { 
      class: 'badge-danger', 
      label: 'En retard', 
      icon: FiAlertCircle,
      color: 'var(--accent-red)'
    },
    cancelled: { 
      class: 'badge-neutral', 
      label: 'Annulé', 
      icon: FiXCircle,
      color: 'var(--text-muted)'
    },
    suspended: { 
      class: 'badge-warning', 
      label: 'Suspendu', 
      icon: FiPauseCircle,
      color: 'var(--accent-amber)'
    },
    pending: { 
      class: 'badge-info', 
      label: 'En attente', 
      icon: FiClock,
      color: 'var(--accent-blue)'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class}`}>
      <Icon size={12} className="badge-icon" />
      {config.label}
      <style>{`
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.3px;
          animation: badgeAppear 0.3s ease;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        
        .badge-icon {
          animation: iconSpin 0.3s ease;
        }
        
        .badge-success { 
          background: rgba(57, 211, 83, 0.15); 
          color: var(--accent-teal);
          border-color: rgba(57, 211, 83, 0.3);
        }
        
        .badge-danger { 
          background: rgba(248, 81, 73, 0.15); 
          color: var(--accent-red);
          border-color: rgba(248, 81, 73, 0.3);
        }
        
        .badge-warning { 
          background: rgba(227, 179, 65, 0.15); 
          color: var(--accent-amber);
          border-color: rgba(227, 179, 65, 0.3);
        }
        
        .badge-info { 
          background: rgba(56, 139, 253, 0.15); 
          color: var(--accent-blue);
          border-color: rgba(56, 139, 253, 0.3);
        }
        
        .badge-neutral { 
          background: var(--bg-elevated); 
          color: var(--text-muted);
          border-color: var(--border);
        }
        
        @keyframes badgeAppear {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes iconSpin {
          0% { transform: rotate(-180deg); opacity: 0; }
          100% { transform: rotate(0); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

// Composant Carte statistique (sans border-radius)
function StatCard({ label, value, unit = '', color, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={{ background: `${color}20`, color }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-value-group">
        <span className="stat-value">{value}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {trend && (
        <div className={`stat-trend ${trend.positive ? 'positive' : 'negative'}`}>
          <FiTrendingUp size={12} style={{ transform: trend.positive ? 'none' : 'rotate(180deg)' }} />
          <span>{trend.value}% ce mois</span>
        </div>
      )}
      <div className="stat-stripe" style={{ background: color }} />
      
      <style>{`
        .stat-card {
          background: var(--bg-panel);
          padding: 20px;
          position: relative;
          overflow: hidden;
          border-left: 3px solid transparent;
          transition: all 0.3s ease;
          animation: statAppear 0.5s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
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
          color: var(--text-muted);
        }
        
        .stat-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        
        .stat-card:hover .stat-icon {
          transform: rotate(5deg) scale(1.1);
        }
        
        .stat-value-group {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 32px;
          font-weight: 300;
          letter-spacing: -1px;
          color: var(--text-primary);
          line-height: 1;
        }
        
        .stat-unit {
          font-size: 14px;
          color: var(--text-muted);
        }
        
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }
        
        .stat-trend.positive {
          color: var(--accent-teal);
        }
        
        .stat-trend.negative {
          color: var(--accent-red);
        }
        
        .stat-stripe {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          transform: scaleX(0);
          transform-origin: left;
          animation: stripeExpand 0.5s ease forwards 0.2s;
        }
        
        @keyframes statAppear {
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
      `}</style>
    </div>
  );
}

// Composant Plan badge (sans border-radius)
function PlanBadge({ plan }: { plan: Subscription['plan'] }) {
  const planConfig = {
    Basic: { class: 'plan-basic', icon: FiCreditCard },
    Premium: { class: 'plan-premium', icon: FiTrendingUp },
    Enterprise: { class: 'plan-enterprise', icon: BiBuildings }
  };

  const config = planConfig[plan];
  const Icon = config.icon;

  return (
    <span className={`plan-badge ${config.class}`}>
      <Icon size={12} />
      {plan}
      <style>{`
        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        
        .plan-basic {
          background: var(--bg-elevated);
          color: var(--text-muted);
          border-color: var(--border);
        }
        
        .plan-premium {
          background: rgba(57, 211, 83, 0.15);
          color: var(--accent-teal);
          border-color: rgba(57, 211, 83, 0.3);
        }
        
        .plan-enterprise {
          background: rgba(56, 139, 253, 0.15);
          color: var(--accent-blue);
          border-color: rgba(56, 139, 253, 0.3);
        }
      `}</style>
    </span>
  );
}

// Composant Carte d'abonnement
function SubscriptionCard({ subscription, onAction }: { subscription: Subscription; onAction: (action: string, school: string) => void }) {
  return (
    <div className="subscription-card">
      <div className="card-header">
        <div className="school-info">
          <div className="school-avatar">
            {subscription.school.charAt(0)}
          </div>
          <div>
            <h3 className="school-name">{subscription.school}</h3>
            <PlanBadge plan={subscription.plan} />
          </div>
        </div>
        <button 
          className="card-menu"
          onClick={() => onAction('menu', subscription.school)}
        >
          <FiMoreVertical size={16} />
        </button>
      </div>

      <div className="card-content">
        <div className="amount-section">
          <span className="amount-label">Montant</span>
          <span className="amount-value">{subscription.amount}</span>
        </div>

        <div className="card-stats">
          <div className="stat-item">
            <FiUsers size={14} />
            <div>
              <span className="stat-label">Utilisateurs</span>
              <span className="stat-value">{subscription.users}</span>
            </div>
          </div>
          <div className="stat-item">
            <FiCalendar size={14} />
            <div>
              <span className="stat-label">Prochaine facturation</span>
              <span className="stat-value">{subscription.nextBilling}</span>
            </div>
          </div>
        </div>

        <div className="status-section">
          <StatusBadge status={subscription.status} />
        </div>
      </div>

      <div className="card-footer">
        <div className="card-actions">
          <button 
            className="action-btn view"
            onClick={() => onAction('view', subscription.school)}
            title="Voir les détails"
          >
            <FiEye size={14} />
            <span>Détails</span>
          </button>
          
          {subscription.status === 'overdue' && (
            <button 
              className="action-btn remind"
              onClick={() => onAction('remind', subscription.school)}
              title="Envoyer un rappel"
            >
              <FiSend size={14} />
              <span>Relancer</span>
            </button>
          )}
          
          {subscription.status === 'paid' && (
            <button 
              className="action-btn suspend"
              onClick={() => onAction('suspend', subscription.school)}
              title="Suspendre l'abonnement"
            >
              <FiPauseCircle size={14} />
              <span>Suspendre</span>
            </button>
          )}
          
          {subscription.status === 'suspended' && (
            <button 
              className="action-btn reactivate"
              onClick={() => onAction('reactivate', subscription.school)}
              title="Réactiver l'abonnement"
            >
              <FiPlayCircle size={14} />
              <span>Réactiver</span>
            </button>
          )}
          
          <button 
            className="action-btn edit"
            onClick={() => onAction('edit', subscription.school)}
            title="Modifier"
          >
            <FiEdit2 size={14} />
          </button>
          
          <button 
            className="action-btn delete"
            onClick={() => onAction('delete', subscription.school)}
            title="Supprimer"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      <style>{`
        .subscription-card {
          background: var(--bg-panel);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          animation: cardAppear 0.3s ease forwards;
          opacity: 0;
        }
        
        .subscription-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-bright);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        
        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card-header {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        
        .school-info {
          display: flex;
          gap: 12px;
        }
        
        .school-avatar {
          width: 40px;
          height: 40px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          color: var(--accent-blue);
          transition: all 0.2s ease;
        }
        
        .subscription-card:hover .school-avatar {
          border-color: var(--accent-blue);
          transform: scale(1.05);
        }
        
        .school-name {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .card-menu {
          background: transparent;
          border: 1px solid var(--border);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .card-menu:hover {
          background: var(--bg-surface);
          border-color: var(--border-bright);
          color: var(--text-primary);
        }
        
        .card-content {
          padding: 16px;
          flex: 1;
        }
        
        .amount-section {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        
        .amount-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        
        .amount-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--mono);
        }
        
        .card-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
        }
        
        .stat-item svg {
          color: var(--text-muted);
        }
        
        .stat-item div {
          flex: 1;
        }
        
        .stat-item .stat-label {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 2px;
        }
        
        .stat-item .stat-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .status-section {
          margin-top: 12px;
        }
        
        .card-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
          background: var(--bg-surface);
        }
        
        .card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          background: var(--bg-panel);
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
        }
        
        .action-btn.view:hover {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }
        
        .action-btn.remind:hover {
          background: var(--accent-amber);
          border-color: var(--accent-amber);
          color: black;
        }
        
        .action-btn.suspend:hover {
          background: var(--accent-red);
          border-color: var(--accent-red);
          color: white;
        }
        
        .action-btn.reactivate:hover {
          background: var(--accent-teal);
          border-color: var(--accent-teal);
          color: black;
        }
        
        .action-btn.edit:hover {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }
        
        .action-btn.delete:hover {
          background: var(--accent-red);
          border-color: var(--accent-red);
          color: white;
        }
      `}</style>
    </div>
  );
}

// Composant principal
export default function Abonnements({ onNotify }: AbonnementsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  // Calcul des statistiques
  const stats = {
    mrr: subscriptions
      .filter(s => s.status === 'paid')
      .reduce((acc, s) => {
        const amount = parseInt(s.amount.replace(/[^0-9]/g, ''));
        return acc + amount;
      }, 0),
    active: subscriptions.filter(s => s.status === 'paid').length,
    overdue: subscriptions.filter(s => s.status === 'overdue').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    total: subscriptions.length
  };

  // Filtrage des abonnements
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.school.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleAction = (action: string, school: string) => {
    const messages: Record<string, { msg: string; type: 'green' | 'red' | 'amber' | 'blue' }> = {
      remind: { msg: `Rappel envoyé à ${school}`, type: 'amber' },
      suspend: { msg: `Abonnement ${school} suspendu`, type: 'red' },
      reactivate: { msg: `Abonnement ${school} réactivé`, type: 'green' },
      view: { msg: `Détails de ${school}`, type: 'blue' },
      menu: { msg: `Menu ouvert pour ${school}`, type: 'blue' },
      edit: { msg: `Modification de l'abonnement ${school}`, type: 'blue' },
      delete: { msg: `Abonnement ${school} supprimé`, type: 'red' }
    };
    
    const config = messages[action];
    if (config) {
      onNotify(config.msg, config.type);
    }
  };

  return (
    <div className="subscriptions-page">
      {/* En-tête */}
      <div className="section-header animate-fade-up">
        <div>
          <h2 className="section-title">Gestion des Abonnements</h2>
          <p className="section-sub">
            <FiCreditCard size={12} />
            {stats.total} abonnements · {stats.active} actifs
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => onNotify('Synchronisation en cours...', 'blue')}>
            <FiRefreshCw size={14} className="btn-icon-spin" /> Synchroniser
          </button>
          <button className="btn btn-primary" onClick={() => onNotify('Création d\'un nouvel abonnement', 'blue')}>
            <FiPlus size={14} /> Nouvel abonnement
          </button>
          <button className="btn btn-ghost" onClick={() => onNotify('Export en cours...', 'blue')}>
            <FiDownload size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid animate-fade-up delay-1">
        <StatCard
          label="MRR"
          value={stats.mrr.toLocaleString()}
          unit="FCFA"
          color="#388bfd"
          icon={FiDollarSign}
          trend={{ value: 12.5, positive: true }}
        />
        <StatCard
          label="Abonnements actifs"
          value={stats.active.toString()}
          color="#39d353"
          icon={FiCheckCircle}
          trend={{ value: 8.3, positive: true }}
        />
        <StatCard
          label="En retard"
          value={stats.overdue.toString()}
          color="#e3b341"
          icon={FiAlertCircle}
          trend={{ value: 2.1, positive: false }}
        />
        <StatCard
          label="Annulés"
          value={stats.cancelled.toString()}
          color="#f85149"
          icon={FiXCircle}
          trend={{ value: 1.2, positive: false }}
        />
      </div>

      {/* Filtres et recherche */}
      <div className="filters-section animate-fade-up delay-1">
        <div className="search-box">
          <FiSearch className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher un établissement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-group">
          <div className="filter">
            <FiFilter className="filter-icon" size={14} />
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="paid">Payés</option>
              <option value="overdue">En retard</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendus</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>

          <div className="filter">
            <FiCreditCard className="filter-icon" size={14} />
            <select 
              className="filter-select"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <option value="all">Tous les plans</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grille des abonnements */}
      <div className="subscriptions-grid animate-fade-up delay-2">
        {filteredSubscriptions.map((sub, index) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onAction={handleAction}
          />
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredSubscriptions.length === 0 && (
        <div className="empty-state">
          <FiCreditCard size={48} />
          <h3>Aucun abonnement trouvé</h3>
          <p>Essayez de modifier vos filtres de recherche</p>
        </div>
      )}

      {/* Pagination simple */}
      <div className="pagination-section">
        <span className="pagination-info">
          Affichage de {filteredSubscriptions.length} sur {subscriptions.length} abonnements
        </span>
        <div className="pagination">
          <button className="pagination-btn" disabled>Précédent</button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">3</button>
          <button className="pagination-btn">Suivant</button>
        </div>
      </div>

      <style>{`
        .subscriptions-page {
          animation: pageEnter 0.4s ease;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .section-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .filters-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 280px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 40px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.1);
          outline: none;
        }

        .filters-group {
          display: flex;
          gap: 8px;
        }

        .filter {
          position: relative;
          min-width: 160px;
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .filter-select {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 36px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          appearance: none;
          transition: all 0.2s ease;
        }

        .filter-select:focus {
          border-color: var(--accent-blue);
          outline: none;
        }

        .subscriptions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          background: var(--bg-panel);
          border: 1px solid var(--border);
          color: var(--text-muted);
        }

        .empty-state svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }

        .empty-state p {
          font-size: 13px;
        }

        .pagination-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
        }

        .pagination-info {
          font-size: 12px;
          color: var(--text-muted);
        }

        .pagination {
          display: flex;
          gap: 6px;
        }

        .pagination-btn {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: var(--bg-elevated);
          border-color: var(--border-bright);
          color: var(--text-primary);
        }

        .pagination-btn.active {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          opacity: 0;
          animation: slideUp 0.4s ease forwards;
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

        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }

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
          border-color: var(--accent-blue);
        }

        .btn-primary:hover {
          background: #58a6ff;
          border-color: #58a6ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(56, 139, 253, 0.3);
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .btn-ghost:hover {
          border-color: var(--border-bright);
          color: var(--text-primary);
          transform: translateY(-2px);
        }

        .btn-icon-spin:hover {
          animation: spin 1s ease infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .filters-section {
            flex-direction: column;
          }

          .filters-group {
            width: 100%;
          }

          .filter {
            flex: 1;
          }

          .subscriptions-grid {
            grid-template-columns: 1fr;
          }

          .pagination-section {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}