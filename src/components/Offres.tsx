// frontend/src/components/Offres.tsx
import { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/core';

// ================================================================
// TYPES
// ================================================================

interface Offre {
  offre_id: string;
  code: string;
  nom: string;
  description?: string;
  statut: "ACTIF" | "INACTIF";
  duree: "MENSUEL" | "TRIMESTRIEL" | "SEMESTRIEL" | "ANNUEL" | "A_VIE";
  prix: number;
  devise: string;
  prix_original?: number;
  reduction_pourcentage?: number;
  essai_gratuit: boolean;
  duree_essai_jours?: number;
  fonctionnalites?: any;
  renouvellement_automatique: boolean;
  grace_period_jours: number;
  icon?: string;
  couleur?: string;
  ordre_affichage: number;
  est_populaire: boolean;
  est_meilleur_rapport: boolean;
  nombre_abonnes: number;
  total_revenu: number;
  created_at: string;
  updated_at: string;
}

interface CreateOffreRequest {
  code: string;
  nom: string;
  description?: string;
  duree: string;
  prix: number;
  devise?: string;
  prix_original?: number;
  reduction_pourcentage?: number;
  fonctionnalites?: any;
  renouvellement_automatique?: boolean;
  grace_period_jours?: number;
  icon?: string;
  couleur?: string;
  ordre_affichage?: number;
  est_populaire?: boolean;
  est_meilleur_rapport?: boolean;
}

interface UpdateOffreRequest {
  nom?: string;
  description?: string;
  statut?: string;
  prix?: number;
  prix_original?: number;
  reduction_pourcentage?: number;
  fonctionnalites?: any;
  renouvellement_automatique?: boolean;
  grace_period_jours?: number;
  icon?: string;
  couleur?: string;
  ordre_affichage?: number;
  est_populaire?: boolean;
  est_meilleur_rapport?: boolean;
}

interface Toast {
  msg: string;
  type: "green" | "red" | "amber" | "blue";
}

interface IcoProps {
  d: string;
  s?: number;
  sw?: number;
}

// ================================================================
// ICONS
// ================================================================

const Ico = ({ d, s = 14, sw = 1.5 }: IcoProps) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const I = {
  plus:    "M12 5v14M5 12h14",
  search:  "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
  close:   "M18 6L6 18M6 6l12 12",
  check:   "M20 6L9 17l-5-5",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:   "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  globe:   "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  tag:     "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  clock:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  dollar:  "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
  star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

// ================================================================
// COMPOSANTS
// ================================================================

function OffreCard({ 
  offre, 
  onEdit, 
  onDelete,
  onView 
}: { 
  offre: Offre; 
  onEdit: (offre: Offre) => void; 
  onDelete: (offre: Offre) => void;
  onView: (offre: Offre) => void;
}) {
  const statutColors = {
    "ACTIF": "bg-[rgba(57,211,83,0.15)] text-[#39d353] border-[rgba(57,211,83,0.3)]",
    "INACTIF": "bg-[rgba(248,81,73,0.15)] text-[#f85149] border-[rgba(248,81,73,0.3)]"
  };

  const dureeLabels = {
    "MENSUEL": "Mensuel",
    "TRIMESTRIEL": "Trimestriel",
    "SEMESTRIEL": "Semestriel",
    "ANNUEL": "Annuel",
    "A_VIE": "À vie"
  };

  return (
    <div className="bg-[#0d1117] border border-[#21262d] flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:border-[#30363d] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
      {/* En-tête avec couleur */}
      <div className="h-1 w-full flex-shrink-0" style={{ background: offre.couleur || "#388bfd" }}/>
      
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {offre.icon && (
              <div className="w-10 h-10 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-xl">
                {offre.icon}
              </div>
            )}
            <div>
              <h3 className="text-[15px] font-semibold">{offre.nom}</h3>
              <span className="text-[11px] text-[#484f58] font-mono">{offre.code}</span>
            </div>
          </div>
          <div className="flex gap-1">
            {offre.est_populaire && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-[rgba(227,179,65,0.15)] text-[#e3b341] border border-[rgba(227,179,65,0.3)]">
                <Ico d={I.star} s={10}/> Populaire
              </span>
            )}
          </div>
        </div>

        {offre.description && (
          <p className="text-[12px] text-[#8b949e] mb-3 line-clamp-2">{offre.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#090c10] p-2 border border-[#21262d]">
            <div className="text-[9px] font-semibold uppercase tracking-[0.8px] text-[#484f58] mb-0.5">Prix</div>
            <div className="text-[16px] font-semibold text-[#e6edf3]">
              {offre.prix.toLocaleString()} <span className="text-[11px] text-[#484f58]">{offre.devise}</span>
            </div>
            {offre.prix_original && offre.prix_original > offre.prix && (
              <div className="text-[10px] text-[#f85149] line-through">
                {offre.prix_original.toLocaleString()} {offre.devise}
              </div>
            )}
          </div>
          <div className="bg-[#090c10] p-2 border border-[#21262d]">
            <div className="text-[9px] font-semibold uppercase tracking-[0.8px] text-[#484f58] mb-0.5">Durée</div>
            <div className="text-[13px] font-medium text-[#e6edf3]">{dureeLabels[offre.duree] || offre.duree}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium border ${statutColors[offre.statut]}`}>
            {offre.statut === "ACTIF" ? "✅ Actif" : "⛔ Inactif"}
          </span>
          {offre.essai_gratuit && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-[rgba(56,139,253,0.15)] text-[#388bfd] border border-[rgba(56,139,253,0.3)]">
              Essai {offre.duree_essai_jours}j
            </span>
          )}
          {offre.est_meilleur_rapport && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-[rgba(57,211,83,0.15)] text-[#39d353] border border-[rgba(57,211,83,0.3)]">
              Meilleur rapport
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#484f58] border-t border-[#21262d] pt-2.5">
          <span className="flex items-center gap-1">
            <Ico d={I.users} s={12}/>
            {offre.nombre_abonnes} abonnés
          </span>
          <span className="flex items-center gap-1">
            <Ico d={I.dollar} s={12}/>
            {offre.total_revenu.toLocaleString()} {offre.devise}
          </span>
        </div>
      </div>

      <div className="p-3 border-t border-[#21262d] bg-[#161b22] flex gap-1.5">
        <button 
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-[30px] px-2.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]"
          onClick={() => onView(offre)}
        >
          <Ico d={I.eye} s={12}/> Détails
        </button>
        <button 
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-[30px] px-2.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#388bfd] hover:text-[#388bfd] hover:bg-[rgba(56,139,253,0.08)]"
          onClick={() => onEdit(offre)}
        >
          <Ico d={I.edit} s={12}/> Modifier
        </button>
        <button 
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-[30px] px-2.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#f85149] hover:text-[#f85149] hover:bg-[rgba(248,81,73,0.08)]"
          onClick={() => onDelete(offre)}
        >
          <Ico d={I.trash} s={12}/> Supprimer
        </button>
      </div>
    </div>
  );
}

// ================================================================
// COMPOSANT PRINCIPAL
// ================================================================

export default function Offres({ onNotify }: { onNotify?: (message: string, type: string) => void }) {
  const notify = onNotify || ((message: string, type: string) => console.log(message, type));
  
  // États
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [modal, setModal] = useState<string | null>(null);
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [viewingOffre, setViewingOffre] = useState<Offre | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [form, setForm] = useState<CreateOffreRequest>({
    code: "",
    nom: "",
    description: "",
    duree: "MENSUEL",
    prix: 0,
    devise: "XOF",
    prix_original: undefined,
    reduction_pourcentage: undefined,
    fonctionnalites: {},
    renouvellement_automatique: true,
    grace_period_jours: 7,
    icon: "",
    couleur: "#388bfd",
    ordre_affichage: 0,
    est_populaire: false,
    est_meilleur_rapport: false,
  });

  // Générer un code automatique
  const generateCode = (nom: string) => {
    return nom.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4) + "_" + ["MENSUEL", "TRIMESTRIEL", "SEMESTRIEL", "ANNUEL", "A_VIE"].indexOf(form.duree) + 1;
  };

  // Charger les offres
  const loadOffres = async () => {
    try {
      setLoading(true);
      const result = await invoke<{ success: boolean; data: Offre[] }>('get_all_offres', { actifSeulement: false });
      if (result.success) {
        setOffres(result.data);
      }
    } catch (error) {
      console.error('❌ Erreur de chargement:', error);
      showToast('❌ Erreur de chargement des offres', 'red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffres();
  }, []);

  function showToast(msg: string, type: Toast["type"] = "green"): void {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
    notify(msg, type);
  }

  // Créer une offre
  const handleCreate = async () => {
    try {
      if (!form.nom || !form.code) {
        showToast('❌ Veuillez remplir le nom et le code', 'red');
        return;
      }

      showToast('Création de l\'offre...', 'blue');
      
      const result = await invoke<{ success: boolean; data: Offre }>('create_offre', { request: form });
      
      if (result.success) {
        showToast(`✅ Offre "${result.data.nom}" créée avec succès`, 'green');
        setModal(null);
        await loadOffres();
        resetForm();
      }
    } catch (error) {
      console.error('❌ Erreur de création:', error);
      showToast(`❌ Erreur: ${error}`, 'red');
    }
  };

  // Mettre à jour une offre
  const handleUpdate = async () => {
    try {
      if (!editingOffre) return;

      showToast('Mise à jour de l\'offre...', 'blue');
      
      const updateData: UpdateOffreRequest = {
        nom: form.nom,
        description: form.description,
        statut: editingOffre.statut,
        prix: form.prix,
        prix_original: form.prix_original,
        reduction_pourcentage: form.reduction_pourcentage,
        fonctionnalites: form.fonctionnalites,
        renouvellement_automatique: form.renouvellement_automatique,
        grace_period_jours: form.grace_period_jours,
        icon: form.icon,
        couleur: form.couleur,
        ordre_affichage: form.ordre_affichage,
        est_populaire: form.est_populaire,
        est_meilleur_rapport: form.est_meilleur_rapport,
      };
      
      const result = await invoke<{ success: boolean; data: Offre }>('update_offre', { 
        offreId: editingOffre.offre_id, 
        request: updateData 
      });
      
      if (result.success) {
        showToast(`✅ Offre "${result.data.nom}" mise à jour`, 'green');
        setModal(null);
        setEditingOffre(null);
        await loadOffres();
        resetForm();
      }
    } catch (error) {
      console.error('❌ Erreur de mise à jour:', error);
      showToast(`❌ Erreur: ${error}`, 'red');
    }
  };

  // Supprimer une offre
  const handleDelete = async (offre: Offre) => {
    if (!confirm(`Supprimer l'offre "${offre.nom}" ?`)) return;
    
    try {
      showToast('Suppression en cours...', 'amber');
      
      const result = await invoke<{ success: boolean }>('delete_offre', { offreId: offre.offre_id });
      
      if (result.success) {
        showToast(`✅ Offre "${offre.nom}" supprimée`, 'green');
        await loadOffres();
      }
    } catch (error) {
      console.error('❌ Erreur de suppression:', error);
      showToast(`❌ Erreur: ${error}`, 'red');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({
      code: "",
      nom: "",
      description: "",
      duree: "MENSUEL",
      prix: 0,
      devise: "XOF",
      prix_original: undefined,
      reduction_pourcentage: undefined,
      fonctionnalites: {},
      renouvellement_automatique: true,
      grace_period_jours: 7,
      icon: "",
      couleur: "#388bfd",
      ordre_affichage: 0,
      est_populaire: false,
      est_meilleur_rapport: false,
    });
  };

  // Ouvrir le modal d'édition
  const openEditModal = (offre: Offre) => {
    setEditingOffre(offre);
    setForm({
      code: offre.code,
      nom: offre.nom,
      description: offre.description || "",
      duree: offre.duree,
      prix: offre.prix,
      devise: offre.devise,
      prix_original: offre.prix_original,
      reduction_pourcentage: offre.reduction_pourcentage,
      fonctionnalites: offre.fonctionnalites || {},
      renouvellement_automatique: offre.renouvellement_automatique,
      grace_period_jours: offre.grace_period_jours,
      icon: offre.icon || "",
      couleur: offre.couleur || "#388bfd",
      ordre_affichage: offre.ordre_affichage,
      est_populaire: offre.est_populaire,
      est_meilleur_rapport: offre.est_meilleur_rapport,
    });
    setModal("edit");
  };

  // Filtrer les offres
  const filteredOffres = offres.filter(o => {
    const matchesSearch = o.nom.toLowerCase().includes(search.toLowerCase()) || 
                          o.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || o.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: offres.length,
    actif: offres.filter(o => o.statut === "ACTIF").length,
    inactif: offres.filter(o => o.statut === "INACTIF").length,
    revenuTotal: offres.reduce((sum, o) => sum + o.total_revenu, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#484f58]">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-['IBM_Plex_Sans'] text-[13px] text-[#e6edf3] antialiased">
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .animate-slide-up { animation: slideUp .25s cubic-bezier(0.4,0,0.2,1) both; }
        .animate-fade-in { animation: fadeIn .2s ease both; }
      `}</style>

      {/* TOPBAR */}
      <div className="flex items-center justify-between py-4 pb-5 border-b border-[#21262d] mb-6 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] flex items-center justify-center text-[#388bfd]">
            <Ico d={I.tag} s={16}/>
          </div>
          <div>
            <div className="text-lg font-semibold tracking-[-0.4px]">Gestion des Offres</div>
            <div className="text-xs text-[#484f58] font-mono mt-0.5">{offres.length} offres · {stats.actif} actives</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]"
            onClick={() => { resetForm(); setModal("create"); }}
          >
            <Ico d={I.plus} s={13}/> Nouvelle offre
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-px bg-[#21262d] border border-[#21262d] mb-5 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
        <div className="bg-[#0d1117] p-4">
          <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58] mb-1">Total</div>
          <div className="text-[26px] font-light tracking-[-1px] text-[#8b949e]">{stats.total}</div>
        </div>
        <div className="bg-[#0d1117] p-4">
          <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58] mb-1">Actives</div>
          <div className="text-[26px] font-light tracking-[-1px] text-[#39d353]">{stats.actif}</div>
        </div>
        <div className="bg-[#0d1117] p-4">
          <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58] mb-1">Inactives</div>
          <div className="text-[26px] font-light tracking-[-1px] text-[#f85149]">{stats.inactif}</div>
        </div>
        <div className="bg-[#0d1117] p-4">
          <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#484f58] mb-1">Revenu total</div>
          <div className="text-[26px] font-light tracking-[-1px] text-[#d29922]">{stats.revenuTotal.toLocaleString()} FCFA</div>
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 mb-5 items-center flex-wrap">
        <div className="flex items-center gap-2 bg-[#0d1117] border border-[#21262d] px-3 h-[34px] flex-1 max-w-[380px] transition-colors duration-150 focus-within:border-[#388bfd]">
          <Ico d={I.search} s={13}/>
          <input 
            placeholder="Rechercher une offre..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="bg-transparent border-none outline-none text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] flex-1 placeholder:text-[#484f58]"
          />
        </div>
        <select 
          className="h-[34px] bg-[#0d1117] border border-[#21262d] text-[#8b949e] font-['IBM_Plex_Sans'] text-xs px-2.5 cursor-pointer outline-none appearance-none transition-colors duration-150 focus:border-[#388bfd] focus:text-[#e6edf3]"
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">Tous statuts</option>
          <option value="ACTIF">Actives</option>
          <option value="INACTIF">Inactives</option>
        </select>
        <div className="flex-1"/>
        <span className="text-[11px] text-[#484f58] font-mono">{filteredOffres.length} résultat{filteredOffres.length !== 1 ? "s" : ""}</span>
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-px bg-[#21262d] border border-[#21262d]">
        {filteredOffres.length === 0 ? (
          <div className="col-span-full py-14 text-center text-[#484f58] bg-[#0d1117]">
            <Ico d={I.search} s={32}/>
            <div className="text-sm mt-3 text-[#8b949e]">Aucune offre trouvée</div>
            <div className="text-xs mt-1">Créez une nouvelle offre pour commencer</div>
          </div>
        ) : (
          filteredOffres.map(offre => (
            <OffreCard
              key={offre.offre_id}
              offre={offre}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onView={(o) => { setViewingOffre(o); setModal("view"); }}
            />
          ))
        )}
      </div>

      {/* MODAL CRÉER / ÉDITER */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-5 animate-fade-in" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-[#0d1117] border border-[#30363d] w-full max-w-[600px] max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-5 pb-4 border-b border-[#21262d] flex items-center justify-between sticky top-0 bg-[#0d1117] z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] flex items-center justify-center text-[#388bfd]">
                  <Ico d={I.tag} s={14}/>
                </div>
                <span className="text-sm font-semibold">
                  {modal === "create" ? "Créer une offre" : `Modifier ${editingOffre?.nom}`}
                </span>
              </div>
              <button className="w-6 h-6 bg-transparent border-none text-[#484f58] cursor-pointer flex items-center justify-center transition-colors duration-150 hover:text-[#e6edf3]" onClick={() => setModal(null)}>
                <Ico d={I.close} s={14}/>
              </button>
            </div>

            <div className="p-5">
              {/* Code + Nom */}
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Code</div>
                  <input 
                    className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-mono text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] placeholder:text-[#484f58]"
                    placeholder="EX: BASIC_MENSUEL" 
                    value={form.code} 
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Nom</div>
                  <input 
                    className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] placeholder:text-[#484f58]"
                    placeholder="Nom de l'offre" 
                    value={form.nom} 
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-3.5">
                <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Description</div>
                <textarea 
                  className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] resize-vertical min-h-[56px]"
                  rows={2} 
                  placeholder="Description de l'offre..." 
                  value={form.description || ""} 
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Prix + Durée */}
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Prix</div>
                  <input 
                    className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
                    type="number" 
                    value={form.prix} 
                    onChange={e => setForm({ ...form, prix: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Devise</div>
                  <select 
                    className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] cursor-pointer appearance-none"
                    value={form.devise} 
                    onChange={e => setForm({ ...form, devise: e.target.value })}
                  >
                    <option value="XOF">FCFA (XOF)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                  </select>
                </div>
              </div>

              {/* Durée */}
              <div className="mb-3.5">
                <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Durée</div>
                <select 
                  className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] cursor-pointer appearance-none"
                  value={form.duree} 
                  onChange={e => setForm({ ...form, duree: e.target.value as any })}
                >
                  <option value="MENSUEL">Mensuel</option>
                  <option value="TRIMESTRIEL">Trimestriel</option>
                  <option value="SEMESTRIEL">Semestriel</option>
                  <option value="ANNUEL">Annuel</option>
                  <option value="A_VIE">À vie</option>
                </select>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Période de grâce (jours)</div>
                  <input 
                    className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
                    type="number" 
                    value={form.grace_period_jours} 
                    onChange={e => setForm({ ...form, grace_period_jours: parseInt(e.target.value) || 7 })}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Ordre d'affichage</div>
                  <input 
                    className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
                    type="number" 
                    value={form.ordre_affichage} 
                    onChange={e => setForm({ ...form, ordre_affichage: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-2 mb-3.5">
                <label className="flex items-center gap-2 text-[12px] text-[#8b949e] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.renouvellement_automatique} 
                    onChange={e => setForm({ ...form, renouvellement_automatique: e.target.checked })}
                    className="accent-[#388bfd]"
                  />
                  Renouvellement automatique
                </label>
                <label className="flex items-center gap-2 text-[12px] text-[#8b949e] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.est_populaire} 
                    onChange={e => setForm({ ...form, est_populaire: e.target.checked })}
                    className="accent-[#388bfd]"
                  />
                  ⭐ Populaire
                </label>
                <label className="flex items-center gap-2 text-[12px] text-[#8b949e] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.est_meilleur_rapport} 
                    onChange={e => setForm({ ...form, est_meilleur_rapport: e.target.checked })}
                    className="accent-[#388bfd]"
                  />
                  🏆 Meilleur rapport
                </label>
              </div>

              {/* Couleur + Icon */}
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Couleur</div>
                  <input 
                    className="w-full bg-[#090c10] border border-[#21262d] p-1 h-[40px] cursor-pointer outline-none transition-colors duration-150 focus:border-[#388bfd]"
                    type="color" 
                    value={form.couleur || "#388bfd"} 
                    onChange={e => setForm({ ...form, couleur: e.target.value })}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">Icône (emoji)</div>
                  <input 
                    className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] font-['IBM_Plex_Sans'] text-[20px] outline-none transition-colors duration-150 focus:border-[#388bfd] placeholder:text-[#484f58]"
                    placeholder="📦" 
                    value={form.icon || ""} 
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 pt-3 border-t border-[#21262d] flex justify-end gap-2 sticky bottom-0 bg-[#0d1117]">
              <button 
                className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]"
                onClick={() => setModal(null)}
              >
                Annuler
              </button>
              <button 
                className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]"
                onClick={modal === "create" ? handleCreate : handleUpdate}
              >
                <Ico d={I.check} s={13}/> 
                {modal === "create" ? "Créer" : "Mettre à jour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉTAILS */}
      {modal === "view" && viewingOffre && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-5 animate-fade-in" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-[#0d1117] border border-[#30363d] w-full max-w-[540px] animate-slide-up">
            <div className="p-5 pb-4 border-b border-[#21262d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 flex items-center justify-center text-[#e6edf3]">
                  {viewingOffre.icon && <span className="text-2xl">{viewingOffre.icon}</span>}
                </div>
                <span className="text-sm font-semibold">{viewingOffre.nom}</span>
              </div>
              <button className="w-6 h-6 bg-transparent border-none text-[#484f58] cursor-pointer flex items-center justify-center transition-colors duration-150 hover:text-[#e6edf3]" onClick={() => setModal(null)}>
                <Ico d={I.close} s={14}/>
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#090c10] p-3 border border-[#21262d]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Code</div>
                  <div className="text-[13px] font-mono text-[#e6edf3] mt-0.5">{viewingOffre.code}</div>
                </div>
                <div className="bg-[#090c10] p-3 border border-[#21262d]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Statut</div>
                  <div className={`text-[13px] font-medium mt-0.5 ${viewingOffre.statut === "ACTIF" ? "text-[#39d353]" : "text-[#f85149]"}`}>
                    {viewingOffre.statut === "ACTIF" ? "✅ Actif" : "⛔ Inactif"}
                  </div>
                </div>
                <div className="bg-[#090c10] p-3 border border-[#21262d]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Prix</div>
                  <div className="text-[13px] font-medium text-[#e6edf3] mt-0.5">
                    {viewingOffre.prix.toLocaleString()} {viewingOffre.devise}
                    {viewingOffre.prix_original && viewingOffre.prix_original > viewingOffre.prix && (
                      <span className="ml-2 text-[11px] text-[#f85149] line-through">
                        {viewingOffre.prix_original.toLocaleString()} {viewingOffre.devise}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-[#090c10] p-3 border border-[#21262d]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Durée</div>
                  <div className="text-[13px] font-medium text-[#e6edf3] mt-0.5">
                    {viewingOffre.duree === "MENSUEL" ? "Mensuel" :
                     viewingOffre.duree === "TRIMESTRIEL" ? "Trimestriel" :
                     viewingOffre.duree === "SEMESTRIEL" ? "Semestriel" :
                     viewingOffre.duree === "ANNUEL" ? "Annuel" : "À vie"}
                  </div>
                </div>
                {viewingOffre.description && (
                  <div className="col-span-2 bg-[#090c10] p-3 border border-[#21262d]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Description</div>
                    <div className="text-[13px] text-[#8b949e] mt-0.5">{viewingOffre.description}</div>
                  </div>
                )}
                <div className="bg-[#090c10] p-3 border border-[#21262d]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Abonnés</div>
                  <div className="text-[13px] font-medium text-[#e6edf3] mt-0.5">{viewingOffre.nombre_abonnes}</div>
                </div>
                <div className="bg-[#090c10] p-3 border border-[#21262d]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Revenu total</div>
                  <div className="text-[13px] font-medium text-[#e6edf3] mt-0.5">{viewingOffre.total_revenu.toLocaleString()} {viewingOffre.devise}</div>
                </div>
                <div className="bg-[#090c10] p-3 border border-[#21262d]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Période de grâce</div>
                  <div className="text-[13px] font-medium text-[#e6edf3] mt-0.5">{viewingOffre.grace_period_jours} jours</div>
                </div>
                <div className="bg-[#090c10] p-3 border border-[#21262d]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Ordre d'affichage</div>
                  <div className="text-[13px] font-medium text-[#e6edf3] mt-0.5">{viewingOffre.ordre_affichage}</div>
                </div>
                <div className="col-span-2 bg-[#090c10] p-3 border border-[#21262d]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#484f58]">Fonctionnalités</div>
                  <div className="text-[13px] text-[#8b949e] mt-0.5 font-mono text-xs">
                    {viewingOffre.fonctionnalites ? JSON.stringify(viewingOffre.fonctionnalites, null, 2) : "Aucune"}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 pt-3 border-t border-[#21262d] flex justify-end">
              <button 
                className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22]"
                onClick={() => setModal(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1c2330] border border-[#30363d] py-2.5 px-4 flex items-center gap-2.5 z-[9999] text-xs min-w-[280px] animate-slide-up">
          <div className="w-1.5 h-1.5 flex-shrink-0" style={{
            background: toast.type === "green" ? "#3fb950" :
                        toast.type === "red" ? "#f85149" :
                        toast.type === "amber" ? "#d29922" : "#388bfd"
          }}/>
          {toast.msg}
        </div>
      )}
    </div>
  );
}