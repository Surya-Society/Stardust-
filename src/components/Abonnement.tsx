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
      bg: 'bg-[rgba(57,211,83,0.15)]', 
      text: 'text-[#39d353]', 
      border: 'border-[rgba(57,211,83,0.3)]',
      label: 'Payé', 
      icon: FiCheckCircle
    },
    overdue: { 
      bg: 'bg-[rgba(248,81,73,0.15)]', 
      text: 'text-[#f85149]', 
      border: 'border-[rgba(248,81,73,0.3)]',
      label: 'En retard', 
      icon: FiAlertCircle
    },
    cancelled: { 
      bg: 'bg-[#1c2330]', 
      text: 'text-[#484f58]', 
      border: 'border-[#21262d]',
      label: 'Annulé', 
      icon: FiXCircle
    },
    suspended: { 
      bg: 'bg-[rgba(227,179,65,0.15)]', 
      text: 'text-[#e3b341]', 
      border: 'border-[rgba(227,179,65,0.3)]',
      label: 'Suspendu', 
      icon: FiPauseCircle
    },
    pending: { 
      bg: 'bg-[rgba(56,139,253,0.15)]', 
      text: 'text-[#388bfd]', 
      border: 'border-[rgba(56,139,253,0.3)]',
      label: 'En attente', 
      icon: FiClock
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-[0.3px] whitespace-nowrap border animate-[badgeAppear_0.3s_ease] ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={12} className="animate-[iconSpin_0.3s_ease]" />
      {config.label}
    </span>
  );
}

// Composant Carte statistique (sans border-radius)
function StatCard({ label, value, unit = '', color, icon: Icon, trend }: StatCardProps) {
  return (
    <div className={`bg-[#0d1117] p-5 relative overflow-hidden border-l-[3px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] animate-[statAppear_0.5s_ease]`} style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold tracking-[0.8px] uppercase text-[#484f58]">{label}</span>
        <div className="w-8 h-8 flex items-center justify-center transition-transform duration-300 group-hover:rotate-5 group-hover:scale-110" style={{ background: `${color}20`, color }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-[32px] font-light tracking-[-1px] text-[#e6edf3] leading-none">{value}</span>
        {unit && <span className="text-sm text-[#484f58]">{unit}</span>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trend.positive ? 'text-[#39d353]' : 'text-[#f85149]'}`}>
          <FiTrendingUp size={12} style={{ transform: trend.positive ? 'none' : 'rotate(180deg)' }} />
          <span>{trend.value}% ce mois</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 animate-[stripeExpand_0.5s_ease_forwards_0.2s]" style={{ background: color, transformOrigin: 'left' }} />
    </div>
  );
}

// Composant Plan badge (sans border-radius)
function PlanBadge({ plan }: { plan: Subscription['plan'] }) {
  const planConfig = {
    Basic: { bg: 'bg-[#1c2330]', text: 'text-[#484f58]', border: 'border-[#21262d]', icon: FiCreditCard },
    Premium: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', border: 'border-[rgba(57,211,83,0.3)]', icon: FiTrendingUp },
    Enterprise: { bg: 'bg-[rgba(56,139,253,0.15)]', text: 'text-[#388bfd]', border: 'border-[rgba(56,139,253,0.3)]', icon: BiBuildings }
  };

  const config = planConfig[plan];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={12} />
      {plan}
    </span>
  );
}

// Composant Carte d'abonnement
function SubscriptionCard({ subscription, onAction }: { subscription: Subscription; onAction: (action: string, school: string) => void }) {
  return (
    <div className="bg-[#0d1117] border border-[#21262d] flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:border-[#30363d] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] animate-[cardAppear_0.3s_ease_forwards] opacity-0">
      <div className="p-4 border-b border-[#21262d] flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-[#1c2330] border border-[#21262d] flex items-center justify-center font-semibold text-base text-[#388bfd] transition-all duration-200 group-hover:border-[#388bfd] group-hover:scale-105">
            {subscription.school.charAt(0)}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold mb-1">{subscription.school}</h3>
            <PlanBadge plan={subscription.plan} />
          </div>
        </div>
        <button 
          className="bg-transparent border border-[#21262d] w-8 h-8 flex items-center justify-center text-[#8b949e] cursor-pointer transition-all duration-200 hover:bg-[#161b22] hover:border-[#30363d] hover:text-[#e6edf3]"
          onClick={() => onAction('menu', subscription.school)}
        >
          <FiMoreVertical size={16} />
        </button>
      </div>

      <div className="p-4 flex-1">
        <div className="mb-4 pb-4 border-b border-[#21262d]">
          <span className="block text-[11px] uppercase tracking-[0.8px] text-[#484f58] mb-1">Montant</span>
          <span className="text-lg font-semibold text-[#e6edf3] font-['DM_Mono']">{subscription.amount}</span>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-3 text-[#8b949e]">
            <FiUsers size={14} className="text-[#484f58]" />
            <div className="flex-1">
              <span className="block text-[11px] text-[#484f58] mb-0.5">Utilisateurs</span>
              <span className="text-[13px] font-medium text-[#e6edf3]">{subscription.users}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#8b949e]">
            <FiCalendar size={14} className="text-[#484f58]" />
            <div className="flex-1">
              <span className="block text-[11px] text-[#484f58] mb-0.5">Prochaine facturation</span>
              <span className="text-[13px] font-medium text-[#e6edf3]">{subscription.nextBilling}</span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <StatusBadge status={subscription.status} />
        </div>
      </div>

      <div className="p-4 border-t border-[#21262d] bg-[#161b22]">
        <div className="flex flex-wrap gap-2">
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#388bfd] hover:border-[#388bfd] hover:text-white"
            onClick={() => onAction('view', subscription.school)}
            title="Voir les détails"
          >
            <FiEye size={14} />
            <span>Détails</span>
          </button>
          
          {subscription.status === 'overdue' && (
            <button 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e3b341] hover:border-[#e3b341] hover:text-black"
              onClick={() => onAction('remind', subscription.school)}
              title="Envoyer un rappel"
            >
              <FiSend size={14} />
              <span>Relancer</span>
            </button>
          )}
          
          {subscription.status === 'paid' && (
            <button 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f85149] hover:border-[#f85149] hover:text-white"
              onClick={() => onAction('suspend', subscription.school)}
              title="Suspendre l'abonnement"
            >
              <FiPauseCircle size={14} />
              <span>Suspendre</span>
            </button>
          )}
          
          {subscription.status === 'suspended' && (
            <button 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#39d353] hover:border-[#39d353] hover:text-black"
              onClick={() => onAction('reactivate', subscription.school)}
              title="Réactiver l'abonnement"
            >
              <FiPlayCircle size={14} />
              <span>Réactiver</span>
            </button>
          )}
          
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#388bfd] hover:border-[#388bfd] hover:text-white"
            onClick={() => onAction('edit', subscription.school)}
            title="Modifier"
          >
            <FiEdit2 size={14} />
          </button>
          
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f85149] hover:border-[#f85149] hover:text-white"
            onClick={() => onAction('delete', subscription.school)}
            title="Supprimer"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
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
    <div className="animate-[pageEnter_0.4s_ease]">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 opacity-0 animate-[slideUp_0.4s_ease_forwards]">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.5px] mb-1">Gestion des Abonnements</h2>
          <p className="flex items-center gap-1.5 text-[13px] text-[#484f58]">
            <FiCreditCard size={12} />
            {stats.total} abonnements · {stats.active} actifs
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-transparent border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:-translate-y-0.5" onClick={() => onNotify('Synchronisation en cours...', 'blue')}>
            <FiRefreshCw size={14} className="hover:animate-spin" /> Synchroniser
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-[#388bfd] text-white border-[#388bfd] hover:bg-[#58a6ff] hover:border-[#58a6ff] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(56,139,253,0.3)]" onClick={() => onNotify('Création d\'un nouvel abonnement', 'blue')}>
            <FiPlus size={14} /> Nouvel abonnement
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-transparent border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:-translate-y-0.5" onClick={() => onNotify('Export en cours...', 'blue')}>
            <FiDownload size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-px bg-[#21262d] border border-[#21262d] mb-6 max-[1100px]:grid-cols-2 max-[480px]:grid-cols-1">
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
      <div className="flex gap-4 mb-6 flex-wrap max-[768px]:flex-col">
        <div className="flex-1 min-w-[280px] relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" size={16} />
          <input
            type="text"
            placeholder="Rechercher un établissement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] transition-all duration-200 focus:border-[#388bfd] focus:shadow-[0_0_0_3px_rgba(56,139,253,0.1)] focus:outline-none"
          />
        </div>

        <div className="flex gap-2 max-[768px]:w-full">
          <div className="relative min-w-[160px] max-[768px]:flex-1">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58] pointer-events-none" size={14} />
            <select 
              className="w-full h-10 pl-9 pr-3 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] cursor-pointer appearance-none transition-all duration-200 focus:border-[#388bfd] focus:outline-none"
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

          <div className="relative min-w-[160px] max-[768px]:flex-1">
            <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58] pointer-events-none" size={14} />
            <select 
              className="w-full h-10 pl-9 pr-3 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] cursor-pointer appearance-none transition-all duration-200 focus:border-[#388bfd] focus:outline-none"
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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-px bg-[#21262d] border border-[#21262d] mb-6 max-[768px]:grid-cols-1">
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
        <div className="text-center p-12 bg-[#0d1117] border border-[#21262d] text-[#484f58]">
          <FiCreditCard size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-base font-medium mb-2 text-[#8b949e]">Aucun abonnement trouvé</h3>
          <p className="text-[13px]">Essayez de modifier vos filtres de recherche</p>
        </div>
      )}

      {/* Pagination simple */}
      <div className="flex items-center justify-between py-4 max-[768px]:flex-col max-[768px]:gap-3 max-[768px]:items-start">
        <span className="text-xs text-[#484f58]">
          Affichage de {filteredSubscriptions.length} sur {subscriptions.length} abonnements
        </span>
        <div className="flex gap-1.5">
          <button className="px-3 py-1.5 bg-transparent border border-[#21262d] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed" disabled>Précédent</button>
          <button className="px-3 py-1.5 bg-[#388bfd] border border-[#388bfd] text-white text-xs cursor-pointer transition-all duration-200">1</button>
          <button className="px-3 py-1.5 bg-transparent border border-[#21262d] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]">2</button>
          <button className="px-3 py-1.5 bg-transparent border border-[#21262d] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]">3</button>
          <button className="px-3 py-1.5 bg-transparent border border-[#21262d] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:bg-[#1c2330] hover:border-[#30363d] hover:text-[#e6edf3]">Suivant</button>
        </div>
      </div>

      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgeAppear {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes iconSpin {
          from { transform: rotate(-180deg); opacity: 0; }
          to { transform: rotate(0); opacity: 1; }
        }
        @keyframes statAppear {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stripeExpand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .group\\:hover\\:rotate-5:hover {
          transform: rotate(5deg);
        }
        .group\\:hover\\:scale-110:hover {
          transform: scale(1.1);
        }
        .group\\:hover\\:border-\\[\\#388bfd\\]:hover {
          border-color: #388bfd;
        }
        .group\\:hover\\:scale-105:hover {
          transform: scale(1.05);
        }
        .hover\\:animate-spin:hover {
          animation: spin 1s ease infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}