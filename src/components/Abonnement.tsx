// Abonnements.tsx
import { useState, useEffect } from 'react';
import { 
  FiCreditCard, FiPlus, FiRefreshCw, FiDollarSign, 
  FiUsers, FiClock, FiXCircle, FiCheckCircle,
  FiAlertCircle, FiCalendar, FiTrendingUp, FiSearch,
  FiFilter, FiMoreVertical, FiSend, FiPauseCircle,
  FiPlayCircle, FiDownload, FiEye, FiEdit2, FiTrash2
} from 'react-icons/fi';
import { BiBuildings } from 'react-icons/bi';
import { invoke } from '@tauri-apps/api/core';

// ================================================================
// TYPES (à déplacer dans un fichier types/index.ts)
// ================================================================

interface Abonnement {
  abonnement_id: string;
  id_etablissement: string;
  licence_id: string;
  offre_id?: string;
  plan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  duree: 'MENSUEL' | 'TRIMESTRIEL' | 'SEMESTRIEL' | 'ANNUEL' | 'A_VIE';
  montant_original: number;
  montant_remise: number;
  montant_final: number;
  devise: string;
  date_debut: string;
  date_prochain_paiement?: string;
  date_fin?: string;
  date_annulation?: string;
  statut: 'ACTIF' | 'SUSPENDU' | 'EXPIRE' | 'ANNULE' | 'EN_ATTENTE_PAIEMENT';
  renouvellement_auto: boolean;
  metadata?: any;
  synced: number;
  sync_date?: string;
  created_at: string;
  updated_at: string;
}

interface CreateAbonnementRequest {
  id_etablissement: string;
  licence_id: string;
  plan: string;
  duree: string;
  montant_original: number;
  montant_remise: number;
  montant_final: number;
  devise?: string;
  date_debut: string;
  date_prochain_paiement?: string;
  renouvellement_auto?: boolean;
  metadata?: string;
}

interface AbonnementStats {
  total: number;
  actif: number;
  suspendu: number;
  expire: number;
  annule: number;
  plans: {
    basic: number;
    premium: number;
    enterprise: number;
  };
}

interface StatusBadgeProps {
  status: Abonnement['statut'];
}

interface StatCardProps {
  label: string;
  value: string | number;
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

// ================================================================
// HELPERS
// ================================================================

function formatMontant(montant: number, devise: string = 'XOF'): string {
  return `${montant.toLocaleString()} ${devise}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusLabel(status: Abonnement['statut']): string {
  const labels = {
    'ACTIF': 'Actif',
    'SUSPENDU': 'Suspendu',
    'EXPIRE': 'Expiré',
    'ANNULE': 'Annulé',
    'EN_ATTENTE_PAIEMENT': 'En attente'
  };
  return labels[status] || status;
}

function getStatusConfig(status: Abonnement['statut']) {
  const configs = {
    'ACTIF': { 
      bg: 'bg-[rgba(57,211,83,0.15)]', 
      text: 'text-[#39d353]', 
      border: 'border-[rgba(57,211,83,0.3)]',
      icon: FiCheckCircle
    },
    'SUSPENDU': { 
      bg: 'bg-[rgba(227,179,65,0.15)]', 
      text: 'text-[#e3b341]', 
      border: 'border-[rgba(227,179,65,0.3)]',
      icon: FiPauseCircle
    },
    'EXPIRE': { 
      bg: 'bg-[rgba(248,81,73,0.15)]', 
      text: 'text-[#f85149]', 
      border: 'border-[rgba(248,81,73,0.3)]',
      icon: FiAlertCircle
    },
    'ANNULE': { 
      bg: 'bg-[#1c2330]', 
      text: 'text-[#484f58]', 
      border: 'border-[#21262d]',
      icon: FiXCircle
    },
    'EN_ATTENTE_PAIEMENT': { 
      bg: 'bg-[rgba(56,139,253,0.15)]', 
      text: 'text-[#388bfd]', 
      border: 'border-[rgba(56,139,253,0.3)]',
      icon: FiClock
    }
  };
  return configs[status] || configs['ACTIF'];
}

function getPlanConfig(plan: Abonnement['plan']) {
  const configs = {
    'BASIC': { bg: 'bg-[#1c2330]', text: 'text-[#484f58]', border: 'border-[#21262d]', icon: FiCreditCard },
    'PREMIUM': { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', border: 'border-[rgba(57,211,83,0.3)]', icon: FiTrendingUp },
    'ENTERPRISE': { bg: 'bg-[rgba(56,139,253,0.15)]', text: 'text-[#388bfd]', border: 'border-[rgba(56,139,253,0.3)]', icon: BiBuildings }
  };
  return configs[plan] || configs['BASIC'];
}

function getDureeLabel(duree: Abonnement['duree']): string {
  const labels = {
    'MENSUEL': 'Mensuel',
    'TRIMESTRIEL': 'Trimestriel',
    'SEMESTRIEL': 'Semestriel',
    'ANNUEL': 'Annuel',
    'A_VIE': 'À vie'
  };
  return labels[duree] || duree;
}

// ================================================================
// COMPOSANTS
// ================================================================

function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-[0.3px] whitespace-nowrap border animate-[badgeAppear_0.3s_ease] ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={12} className="animate-[iconSpin_0.3s_ease]" />
      {getStatusLabel(status)}
    </span>
  );
}

function PlanBadge({ plan }: { plan: Abonnement['plan'] }) {
  const config = getPlanConfig(plan);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={12} />
      {plan}
    </span>
  );
}

function DureeBadge({ duree }: { duree: Abonnement['duree'] }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap border bg-[rgba(139,148,158,0.1)] text-[#8b949e] border-[#21262d]">
      <FiClock size={12} />
      {getDureeLabel(duree)}
    </span>
  );
}

function StatCard({ label, value, unit = '', color, icon: Icon, trend }: StatCardProps) {
  return (
    <div className={`bg-[#0d1117] p-5 relative overflow-hidden border-l-[3px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] animate-[statAppear_0.5s_ease]`} style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold tracking-[0.8px] uppercase text-[#484f58]">{label}</span>
        <div className="w-8 h-8 flex items-center justify-center transition-transform duration-300" style={{ background: `${color}20`, color }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-[32px] font-light tracking-[-1px] text-[#e6edf3] leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</span>
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

function SubscriptionCard({ subscription, onAction }: { subscription: Abonnement; onAction: (action: string, id: string) => void }) {
  return (
    <div className="bg-[#0d1117] border border-[#21262d] flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:border-[#30363d] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] animate-[cardAppear_0.3s_ease_forwards] opacity-0">
      <div className="p-4 border-b border-[#21262d] flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-[#1c2330] border border-[#21262d] flex items-center justify-center font-semibold text-base text-[#388bfd] transition-all duration-200">
            {subscription.id_etablissement?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold mb-1">
              {subscription.id_etablissement}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <PlanBadge plan={subscription.plan} />
              <DureeBadge duree={subscription.duree} />
            </div>
          </div>
        </div>
        <button 
          className="bg-transparent border border-[#21262d] w-8 h-8 flex items-center justify-center text-[#8b949e] cursor-pointer transition-all duration-200 hover:bg-[#161b22] hover:border-[#30363d] hover:text-[#e6edf3]"
          onClick={() => onAction('menu', subscription.abonnement_id)}
        >
          <FiMoreVertical size={16} />
        </button>
      </div>

      <div className="p-4 flex-1">
        <div className="mb-4 pb-4 border-b border-[#21262d]">
          <span className="block text-[11px] uppercase tracking-[0.8px] text-[#484f58] mb-1">Montant</span>
          <span className="text-lg font-semibold text-[#e6edf3] font-['DM_Mono']">
            {formatMontant(subscription.montant_final, subscription.devise)}
          </span>
          {subscription.montant_remise > 0 && (
            <span className="ml-2 text-xs text-[#39d353]">
              -{Math.round((subscription.montant_remise / subscription.montant_original) * 100)}%
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-3 text-[#8b949e]">
            <FiCalendar size={14} className="text-[#484f58]" />
            <div className="flex-1">
              <span className="block text-[11px] text-[#484f58] mb-0.5">Début</span>
              <span className="text-[13px] font-medium text-[#e6edf3]">{formatDate(subscription.date_debut)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#8b949e]">
            <FiClock size={14} className="text-[#484f58]" />
            <div className="flex-1">
              <span className="block text-[11px] text-[#484f58] mb-0.5">Prochaine facturation</span>
              <span className="text-[13px] font-medium text-[#e6edf3]">
                {subscription.date_prochain_paiement ? formatDate(subscription.date_prochain_paiement) : '—'}
              </span>
            </div>
          </div>
          {subscription.date_fin && (
            <div className="flex items-center gap-3 text-[#8b949e]">
              <FiXCircle size={14} className="text-[#484f58]" />
              <div className="flex-1">
                <span className="block text-[11px] text-[#484f58] mb-0.5">Date fin</span>
                <span className="text-[13px] font-medium text-[#e6edf3]">{formatDate(subscription.date_fin)}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 text-[#8b949e]">
            <FiRefreshCw size={14} className="text-[#484f58]" />
            <div className="flex-1">
              <span className="block text-[11px] text-[#484f58] mb-0.5">Renouvellement</span>
              <span className="text-[13px] font-medium text-[#e6edf3]">
                {subscription.renouvellement_auto ? 'Automatique' : 'Manuel'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <StatusBadge status={subscription.statut} />
        </div>
      </div>

      <div className="p-4 border-t border-[#21262d] bg-[#161b22]">
        <div className="flex flex-wrap gap-2">
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#388bfd] hover:border-[#388bfd] hover:text-white"
            onClick={() => onAction('view', subscription.abonnement_id)}
            title="Voir les détails"
          >
            <FiEye size={14} />
            <span>Détails</span>
          </button>
          
          {subscription.statut === 'ACTIF' && (
            <>
              <button 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f85149] hover:border-[#f85149] hover:text-white"
                onClick={() => onAction('suspend', subscription.abonnement_id)}
                title="Suspendre l'abonnement"
              >
                <FiPauseCircle size={14} />
                <span>Suspendre</span>
              </button>
              <button 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f85149] hover:border-[#f85149] hover:text-white"
                onClick={() => onAction('cancel', subscription.abonnement_id)}
                title="Annuler l'abonnement"
              >
                <FiXCircle size={14} />
                <span>Annuler</span>
              </button>
            </>
          )}
          
          {subscription.statut === 'SUSPENDU' && (
            <button 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#39d353] hover:border-[#39d353] hover:text-black"
              onClick={() => onAction('reactivate', subscription.abonnement_id)}
              title="Réactiver l'abonnement"
            >
              <FiPlayCircle size={14} />
              <span>Réactiver</span>
            </button>
          )}
          
          {subscription.statut === 'EN_ATTENTE_PAIEMENT' && (
            <button 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e3b341] hover:border-[#e3b341] hover:text-black"
              onClick={() => onAction('remind', subscription.abonnement_id)}
              title="Envoyer un rappel"
            >
              <FiSend size={14} />
              <span>Relancer</span>
            </button>
          )}
          
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#388bfd] hover:border-[#388bfd] hover:text-white"
            onClick={() => onAction('edit', subscription.abonnement_id)}
            title="Modifier"
          >
            <FiEdit2 size={14} />
          </button>
          
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-[#0d1117] text-[#8b949e] text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f85149] hover:border-[#f85149] hover:text-white"
            onClick={() => onAction('delete', subscription.abonnement_id)}
            title="Supprimer"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// COMPOSANT PRINCIPAL
// ================================================================

export default function Abonnements({ onNotify }: AbonnementsProps) {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Abonnement[]>([]);
  const [stats, setStats] = useState<AbonnementStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  // ✅ Chargement des données depuis Tauri
  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les abonnements
      const result = await invoke<{ success: boolean; data: Abonnement[] }>('get_all_abonnements');
      if (result.success) {
        setSubscriptions(result.data);
      }

      // Charger les statistiques
      const statsResult = await invoke<{ success: boolean; data: AbonnementStats }>('get_abonnement_stats');
      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      onNotify('Erreur lors du chargement des abonnements', 'red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calcul des statistiques locales (fallback si stats est null)
  const localStats = stats || {
    total: subscriptions.length,
    actif: subscriptions.filter(s => s.statut === 'ACTIF').length,
    suspendu: subscriptions.filter(s => s.statut === 'SUSPENDU').length,
    expire: subscriptions.filter(s => s.statut === 'EXPIRE').length,
    annule: subscriptions.filter(s => s.statut === 'ANNULE').length,
    plans: {
      basic: subscriptions.filter(s => s.plan === 'BASIC').length,
      premium: subscriptions.filter(s => s.plan === 'PREMIUM').length,
      enterprise: subscriptions.filter(s => s.plan === 'ENTERPRISE').length,
    }
  };

  // MRR (revenu mensuel récurrent)
  const mrr = subscriptions
    .filter(s => s.statut === 'ACTIF')
    .reduce((acc, s) => acc + s.montant_final, 0);

  // Filtrage des abonnements
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.id_etablissement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.statut === filterStatus;
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // ✅ Actions via Tauri
  const handleAction = async (action: string, abonnement_id: string) => {
    try {
      switch (action) {
        case 'cancel': {
          await invoke('annuler_abonnement', { abonnementId: abonnement_id });
          onNotify('Abonnement annulé avec succès', 'red');
          loadData();
          break;
        }
        case 'suspend': {
          await invoke('update_abonnement', { 
            abonnementId: abonnement_id,
            request: { statut: 'SUSPENDU' }
          });
          onNotify('Abonnement suspendu', 'amber');
          loadData();
          break;
        }
        case 'reactivate': {
          await invoke('update_abonnement', { 
            abonnementId: abonnement_id,
            request: { statut: 'ACTIF' }
          });
          onNotify('Abonnement réactivé', 'green');
          loadData();
          break;
        }
        case 'view': {
          onNotify(`Détails de l'abonnement ${abonnement_id}`, 'blue');
          break;
        }
        case 'edit': {
          onNotify(`Modification de l'abonnement ${abonnement_id}`, 'blue');
          break;
        }
        case 'delete': {
          // TODO: Implémenter la suppression
          onNotify(`Suppression de l'abonnement ${abonnement_id}`, 'red');
          break;
        }
        case 'remind': {
          onNotify(`Rappel envoyé pour l'abonnement ${abonnement_id}`, 'amber');
          break;
        }
        default: {
          onNotify(`Action "${action}" sur l'abonnement ${abonnement_id}`, 'blue');
        }
      }
    } catch (error) {
      console.error('❌ Erreur action:', error);
      onNotify(`Erreur: ${error}`, 'red');
    }
  };

  // ✅ Nouvel abonnement
  const handleNewSubscription = async () => {
    // TODO: Ouvrir un modal de création
    onNotify('Création d\'un nouvel abonnement', 'blue');
  };

  // ✅ Synchronisation
  const handleSync = async () => {
    onNotify('Synchronisation des données...', 'blue');
    await loadData();
    onNotify('Synchronisation terminée', 'green');
  };

  // ✅ Export
  const handleExport = async () => {
    try {
      // TODO: Implémenter l'export CSV/PDF
      onNotify('Export en cours...', 'blue');
      // Simuler un délai
      setTimeout(() => {
        onNotify('Export terminé', 'green');
      }, 1500);
    } catch (error) {
      onNotify(`Erreur export: ${error}`, 'red');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <FiRefreshCw size={32} className="text-[#388bfd] animate-spin" />
          <span className="text-[#484f58]">Chargement des abonnements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-[pageEnter_0.4s_ease]">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 opacity-0 animate-[slideUp_0.4s_ease_forwards]">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.5px] mb-1">Gestion des Abonnements</h2>
          <p className="flex items-center gap-1.5 text-[13px] text-[#484f58]">
            <FiCreditCard size={12} />
            {subscriptions.length} abonnements · {localStats.actif} actifs
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-transparent border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:-translate-y-0.5" 
            onClick={handleSync}
          >
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Synchroniser
          </button>
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-[#388bfd] text-white border-[#388bfd] hover:bg-[#58a6ff] hover:border-[#58a6ff] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(56,139,253,0.3)]" 
            onClick={handleNewSubscription}
          >
            <FiPlus size={14} /> Nouvel abonnement
          </button>
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-transparent border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:-translate-y-0.5" 
            onClick={handleExport}
          >
            <FiDownload size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-px bg-[#21262d] border border-[#21262d] mb-6 max-[1100px]:grid-cols-2 max-[480px]:grid-cols-1">
        <StatCard
          label="MRR"
          value={mrr}
          unit="FCFA"
          color="#388bfd"
          icon={FiDollarSign}
        />
        <StatCard
          label="Abonnements actifs"
          value={localStats.actif}
          color="#39d353"
          icon={FiCheckCircle}
        />
        <StatCard
          label="En retard / Suspendus"
          value={localStats.suspendu}
          color="#e3b341"
          icon={FiAlertCircle}
        />
        <StatCard
          label="Expirés / Annulés"
          value={localStats.expire + localStats.annule}
          color="#f85149"
          icon={FiXCircle}
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
              <option value="ACTIF">Actifs</option>
              <option value="SUSPENDU">Suspendus</option>
              <option value="EXPIRE">Expirés</option>
              <option value="ANNULE">Annulés</option>
              <option value="EN_ATTENTE_PAIEMENT">En attente</option>
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
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grille des abonnements */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-px bg-[#21262d] border border-[#21262d] mb-6 max-[768px]:grid-cols-1">
        {filteredSubscriptions.map((sub) => (
          <SubscriptionCard
            key={sub.abonnement_id}
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