// src/components/Etablissements.tsx
import { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiRefreshCw, FiEye, FiEdit2,
  FiTrash2, FiChevronLeft, FiChevronRight,
  FiCheckCircle, FiAlertCircle, FiUser,
   FiPlus
} from 'react-icons/fi';
import { invoke } from '@tauri-apps/api/core';

interface Etablissement {
  id_etablissement: string;
  nom: string;
  sigle: string | null;
  type_etablissement: string;
  statut: string;
  pays: string;
  region: string;
  ville: string;
  telephone_principal: string;
  email: string | null;
  date_creation: string;
  synced: number;
  sync_date: string | null;
  abonnement?: {
    plan: string;
    duree: string;
    statut: string;
    date_fin: string;
    offre_nom: string;
  };
  licence_count?: number;
}

interface EtablissementsPageProps {
  onNotify?: (msg: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

export default function EtablissementsPage({ onNotify }: EtablissementsPageProps) {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('tous');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 10;

  // ✅ Récupérer les établissements
  const fetchEtablissements = async () => {
    setLoading(true);
    try {
      const result = await invoke<{ data: Etablissement[] }>('get_all_etablissements');
      const sorted = result.data.sort((a, b) => 
        new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
      );
      setEtablissements(sorted);
      setTotalPages(Math.ceil(sorted.length / itemsPerPage));
      onNotify?.(`${sorted.length} établissements chargés`, 'green');
    } catch (error) {
      console.error('Erreur:', error);
      onNotify?.('Erreur lors du chargement des établissements', 'red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtablissements();
  }, []);

  // ✅ Forcer la synchronisation
  const handleForceSync = async () => {
    try {
      await invoke('force_sync_etablissements');
      onNotify?.('Synchronisation forcée lancée', 'green');
      setTimeout(fetchEtablissements, 2000);
    } catch (error) {
      onNotify?.('Erreur lors de la synchronisation', 'red');
    }
  };

  // ✅ Filtrer les établissements
  const filtered = etablissements.filter(e => {
    const matchesSearch = e.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.sigle?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                          e.ville.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'tous' || e.statut === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // ✅ Pagination
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ Helper: statut avec couleur
  const getStatusBadge = (statut: string) => {
    const styles: Record<string, string> = {
      'ACTIF': 'bg-[#39d353] text-black',
      'INACTIF': 'bg-[#484f58] text-white',
      'EN_ATTENTE': 'bg-[#e3b341] text-black',
      'SUSPENDU': 'bg-[#f85149] text-white',
    };
    return styles[statut] || 'bg-[#484f58] text-white';
  };

  // ✅ Helper: statut sync
  const getSyncBadge = (synced: number, syncDate: string | null) => {
    if (synced === 1) {
      return (
        <span className="flex items-center gap-1 text-[#39d353]">
          <FiCheckCircle size={14} />
          {syncDate ? `Sync: ${new Date(syncDate).toLocaleDateString()}` : 'Synchronisé'}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[#e3b341]">
        <FiAlertCircle size={14} />
        En attente
      </span>
    );
  };

  // ✅ Helper: badge abonnement
  const getAbonnementBadge = (statut: string) => {
    const styles: Record<string, string> = {
      'ACTIF': 'bg-[#39d353] text-black',
      'SUSPENDU': 'bg-[#e3b341] text-black',
      'EXPIRE': 'bg-[#f85149] text-white',
      'ANNULE': 'bg-[#484f58] text-white',
      'EN_ATTENTE_PAIEMENT': 'bg-[#e3b341] text-black',
    };
    return styles[statut] || 'bg-[#484f58] text-white';
  };

  return (
    <div className="space-y-6">
      {/* ✅ En-tête avec actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#e6edf3]">Établissements</h2>
          <p className="text-sm text-[#484f58]">
            Gestion des établissements et de leurs abonnements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleForceSync}
            className="flex items-center gap-2 px-4 py-2 bg-[#1c2330] border border-[#21262d] text-[#e6edf3] transition-all duration-200 hover:bg-[#161b22]"
          >
            <FiRefreshCw size={16} />
            Synchroniser
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#388bfd] text-white transition-all duration-200 hover:bg-[#2d74d4]"
          >
            <FiPlus size={16} />
            Nouvel établissement
          </button>
        </div>
      </div>

      {/* ✅ Filtres et recherche */}
      <div className="flex flex-wrap items-center gap-4 bg-[#0d1117] border border-[#21262d] p-4">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#161b22] border border-[#21262d] px-3 py-2">
          <FiSearch size={16} className="text-[#484f58]" />
          <input
            type="text"
            placeholder="Rechercher un établissement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[#e6edf3] text-sm placeholder:text-[#484f58]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-sm outline-none cursor-pointer"
        >
          <option value="tous">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="SUSPENDU">Suspendu</option>
        </select>

        <button className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:text-[#e6edf3]">
          <FiFilter size={16} />
          Filtres
        </button>
      </div>

      {/* ✅ Tableau des établissements */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#484f58]">Chargement...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-[#21262d] bg-[#0d1117]">
          <p className="text-[#484f58]">Aucun établissement trouvé</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-[#21262d] bg-[#0d1117]">
            <table className="w-full text-sm">
              <thead className="bg-[#161b22] border-b border-[#21262d]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#484f58] font-medium text-xs uppercase tracking-wider">
                    Établissement
                  </th>
                  <th className="px-4 py-3 text-left text-[#484f58] font-medium text-xs uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-4 py-3 text-left text-[#484f58] font-medium text-xs uppercase tracking-wider">
                    Abonnement
                  </th>
                  <th className="px-4 py-3 text-left text-[#484f58] font-medium text-xs uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-[#484f58] font-medium text-xs uppercase tracking-wider">
                    Synchronisation
                  </th>
                  <th className="px-4 py-3 text-right text-[#484f58] font-medium text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]">
                {paginated.map((etab) => (
                  <tr key={etab.id_etablissement} className="hover:bg-[#161b22] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#8b949e]">
                          <FiUser size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-[#e6edf3]">
                            {etab.nom}
                            {etab.sigle && (
                              <span className="ml-2 text-xs text-[#484f58]">({etab.sigle})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#484f58]">
                            <span>{etab.type_etablissement}</span>
                            <span>•</span>
                            <span>{etab.ville}</span>
                            {etab.email && (
                              <>
                                <span>•</span>
                                <a href={`mailto:${etab.email}`} className="hover:text-[#388bfd]">
                                  {etab.email}
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col text-xs">
                        <span className="text-[#e6edf3]">{etab.ville}</span>
                        <span className="text-[#484f58]">{etab.region}, {etab.pays}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {etab.abonnement ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[#e6edf3]">
                            {etab.abonnement.offre_nom || etab.abonnement.plan}
                          </span>
                          <span className="text-xs text-[#484f58]">
                            {etab.abonnement.duree}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 self-start ${getAbonnementBadge(etab.abonnement.statut)}`}>
                            {etab.abonnement.statut}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#484f58]">Aucun abonnement</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 ${getStatusBadge(etab.statut)}`}>
                        {etab.statut}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {getSyncBadge(etab.synced, etab.sync_date)}
                        {etab.licence_count !== undefined && (
                          <span className="text-xs text-[#484f58]">
                            {etab.licence_count} licence{etab.licence_count > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 text-[#484f58] hover:text-[#e6edf3] transition-colors"
                          title="Voir les détails"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          className="p-1.5 text-[#484f58] hover:text-[#e3b341] transition-colors"
                          title="Modifier"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          className="p-1.5 text-[#484f58] hover:text-[#f85149] transition-colors"
                          title="Supprimer"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="text-xs text-[#484f58]">
                {filtered.length} établissement{filtered.length > 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-[#484f58] hover:text-[#e6edf3] disabled:opacity-50 disabled:hover:text-[#484f58]"
                >
                  <FiChevronLeft size={16} />
                </button>
                <span className="text-sm text-[#e6edf3] px-3 py-1 bg-[#161b22] border border-[#21262d]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-[#484f58] hover:text-[#e6edf3] disabled:opacity-50 disabled:hover:text-[#484f58]"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}