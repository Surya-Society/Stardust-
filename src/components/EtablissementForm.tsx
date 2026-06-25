// frontend/src/components/EtablissementForm.tsx
import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheck, FiAlertCircle } from 'react-icons/fi';

// ================================================================
// TYPES
// ================================================================

export interface EtablissementInfo {
  id_etablissement: string;
  nom: string;
  sigle?: string;
  numero_agrement: string;
  numero_fiscal: string;
  registre_commerciale?: string;
  type_etablissement: 'PUBLIC' | 'PRIVE' | 'MIXTE';
  statut_juridique: 'SARL' | 'SA' | 'ASSOCIATION' | 'GIE' | 'AUTRE';
  pays: string;
  region: string;
  ville: string;
  commune?: string;
  quatier?: string;
  adresse: string;
  code_postal?: string;
  telephone_principal: string;
  telephone_secondaire?: string;
  email?: string;
  site_web?: string;
  annee_scolaire_debut: string;
  annee_scolaire_fin: string;
  statut: 'ACTIF' | 'INACTIF' | 'EN_ATTENTE';
}

interface EtablissementFormProps {
  initialData?: Partial<EtablissementInfo>;
  onComplete: (data: EtablissementInfo) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

// ================================================================
// COMPOSANT
// ================================================================

export default function EtablissementForm({ 
  initialData, 
  onComplete, 
  onBack,
  isLoading = false 
}: EtablissementFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EtablissementInfo>({
    id_etablissement: initialData?.id_etablissement || '',
    nom: initialData?.nom || '',
    sigle: initialData?.sigle || '',
    numero_agrement: initialData?.numero_agrement || '',
    numero_fiscal: initialData?.numero_fiscal || '',
    registre_commerciale: initialData?.registre_commerciale || '',
    type_etablissement: initialData?.type_etablissement || 'PRIVE',
    statut_juridique: initialData?.statut_juridique || 'AUTRE',
    pays: initialData?.pays || 'Côte d\'Ivoire',
    region: initialData?.region || '',
    ville: initialData?.ville || '',
    commune: initialData?.commune || '',
    quatier: initialData?.quatier || '',
    adresse: initialData?.adresse || '',
    code_postal: initialData?.code_postal || '',
    telephone_principal: initialData?.telephone_principal || '',
    telephone_secondaire: initialData?.telephone_secondaire || '',
    email: initialData?.email || '',
    site_web: initialData?.site_web || '',
    annee_scolaire_debut: initialData?.annee_scolaire_debut || new Date().getFullYear().toString(),
    annee_scolaire_fin: initialData?.annee_scolaire_fin || (new Date().getFullYear() + 1).toString(),
    statut: initialData?.statut || 'ACTIF',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ================================================================
  // VALIDATION
  // ================================================================

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom) newErrors.nom = 'Nom de l\'établissement requis';
    if (formData.nom && formData.nom.length < 2) newErrors.nom = 'Nom trop court';
    
    if (!formData.numero_agrement) newErrors.numero_agrement = 'Numéro d\'agrément requis';
    if (!formData.numero_fiscal) newErrors.numero_fiscal = 'Numéro fiscal requis';
    
    if (!formData.type_etablissement) newErrors.type_etablissement = 'Type requis';
    if (!formData.statut_juridique) newErrors.statut_juridique = 'Statut juridique requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.pays) newErrors.pays = 'Pays requis';
    if (!formData.region) newErrors.region = 'Région/Département requis';
    if (!formData.ville) newErrors.ville = 'Ville requis';
    if (!formData.adresse) newErrors.adresse = 'Adresse requise';
    
    if (!formData.telephone_principal) newErrors.telephone_principal = 'Téléphone principal requis';
    if (formData.telephone_principal && formData.telephone_principal.length < 8) {
      newErrors.telephone_principal = 'Téléphone invalide (minimum 8 chiffres)';
    }
    
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const debut = parseInt(formData.annee_scolaire_debut);
    const fin = parseInt(formData.annee_scolaire_fin);
    
    if (!formData.annee_scolaire_debut) newErrors.annee_scolaire_debut = 'Année de début requise';
    if (debut < 1900) newErrors.annee_scolaire_debut = 'Année invalide';
    if (!formData.annee_scolaire_fin) newErrors.annee_scolaire_fin = 'Année de fin requise';
    if (fin < 1900) newErrors.annee_scolaire_fin = 'Année invalide';
    if (fin <= debut) newErrors.annee_scolaire_fin = 'L\'année de fin doit être supérieure à l\'année de début';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================================================================
  // HANDLERS
  // ================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (validateStep3()) {
      onComplete(formData);
    }
  };

  // ================================================================
  // RENDU
  // ================================================================

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-1 bg-[#21262d] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#388bfd] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[#484f58] font-mono">Étape {step}/3</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                s === step 
                  ? 'bg-[#388bfd] text-white' 
                  : s < step 
                    ? 'bg-[rgba(57,211,83,0.2)] text-[#39d353]' 
                    : 'bg-[#1c2330] text-[#484f58]'
              }`}
            >
              {s < step ? <FiCheck size={12} /> : s}
            </div>
            <span className={`text-[11px] hidden sm:block ${
              s === step ? 'text-[#e6edf3]' : 'text-[#484f58]'
            }`}>
              {s === 1 ? 'Identité' : s === 2 ? 'Localisation' : 'Période'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Identité de l'établissement */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Nom de l'établissement *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.nom ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="Ex: Lycée International"
              />
              {errors.nom && <p className="text-[11px] text-[#f85149] mt-1">{errors.nom}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Sigle
              </label>
              <input
                type="text"
                name="sigle"
                value={formData.sigle || ''}
                onChange={handleChange}
                className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
                placeholder="Ex: LI"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Numéro d'agrément *
              </label>
              <input
                type="text"
                name="numero_agrement"
                value={formData.numero_agrement}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.numero_agrement ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="Ex: AGR-2025-001"
              />
              {errors.numero_agrement && <p className="text-[11px] text-[#f85149] mt-1">{errors.numero_agrement}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Numéro fiscal *
              </label>
              <input
                type="text"
                name="numero_fiscal"
                value={formData.numero_fiscal}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.numero_fiscal ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="Ex: FISC-2025-001"
              />
              {errors.numero_fiscal && <p className="text-[11px] text-[#f85149] mt-1">{errors.numero_fiscal}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Type d'établissement *
              </label>
              <select
                name="type_etablissement"
                value={formData.type_etablissement}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] cursor-pointer appearance-none ${
                  errors.type_etablissement ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVE">Privé</option>
                <option value="MIXTE">Mixte</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Statut juridique *
              </label>
              <select
                name="statut_juridique"
                value={formData.statut_juridique}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] cursor-pointer appearance-none ${
                  errors.statut_juridique ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
              >
                <option value="SARL">SARL</option>
                <option value="SA">SA</option>
                <option value="ASSOCIATION">Association</option>
                <option value="GIE">GIE</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
              Registre commerciale
            </label>
            <input
              type="text"
              name="registre_commerciale"
              value={formData.registre_commerciale || ''}
              onChange={handleChange}
              className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
              placeholder="Ex: RC-2025-001"
            />
          </div>
        </div>
      )}

      {/* Step 2: Localisation et contact */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Pays *
              </label>
              <input
                type="text"
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.pays ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="Côte d'Ivoire"
              />
              {errors.pays && <p className="text-[11px] text-[#f85149] mt-1">{errors.pays}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Région/Département *
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.region ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="Abidjan"
              />
              {errors.region && <p className="text-[11px] text-[#f85149] mt-1">{errors.region}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Ville *
              </label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.ville ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="Abidjan"
              />
              {errors.ville && <p className="text-[11px] text-[#f85149] mt-1">{errors.ville}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Commune
              </label>
              <input
                type="text"
                name="commune"
                value={formData.commune || ''}
                onChange={handleChange}
                className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
                placeholder="Cocody"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Quartier
              </label>
              <input
                type="text"
                name="quatier"
                value={formData.quatier || ''}
                onChange={handleChange}
                className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
                placeholder="2 Plateaux"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Code postal
              </label>
              <input
                type="text"
                name="code_postal"
                value={formData.code_postal || ''}
                onChange={handleChange}
                className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
                placeholder="06 BP 123"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
              Adresse *
            </label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                errors.adresse ? 'border-[#f85149]' : 'border-[#21262d]'
              }`}
              placeholder="Rue des Écoles, 01 BP 123"
            />
            {errors.adresse && <p className="text-[11px] text-[#f85149] mt-1">{errors.adresse}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Téléphone principal *
              </label>
              <input
                type="tel"
                name="telephone_principal"
                value={formData.telephone_principal}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.telephone_principal ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="0123456789"
              />
              {errors.telephone_principal && <p className="text-[11px] text-[#f85149] mt-1">{errors.telephone_principal}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Téléphone secondaire
              </label>
              <input
                type="tel"
                name="telephone_secondaire"
                value={formData.telephone_secondaire || ''}
                onChange={handleChange}
                className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
                placeholder="0987654321"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.email ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="contact@ecole.ci"
              />
              {errors.email && <p className="text-[11px] text-[#f85149] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Site web
              </label>
              <input
                type="url"
                name="site_web"
                value={formData.site_web || ''}
                onChange={handleChange}
                className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd]"
                placeholder="https://www.ecole.ci"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Période scolaire */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] p-3 mb-4">
            <p className="text-xs text-[#8b949e]">
              <FiAlertCircle className="inline mr-1.5 text-[#388bfd]" size={14} />
              L'année scolaire détermine la période de validité des données pédagogiques.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Année scolaire début *
              </label>
              <input
                type="number"
                name="annee_scolaire_debut"
                value={formData.annee_scolaire_debut}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.annee_scolaire_debut ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="2025"
                min="1900"
                max="2100"
              />
              {errors.annee_scolaire_debut && <p className="text-[11px] text-[#f85149] mt-1">{errors.annee_scolaire_debut}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Année scolaire fin *
              </label>
              <input
                type="number"
                name="annee_scolaire_fin"
                value={formData.annee_scolaire_fin}
                onChange={handleChange}
                className={`w-full bg-[#090c10] border p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] ${
                  errors.annee_scolaire_fin ? 'border-[#f85149]' : 'border-[#21262d]'
                }`}
                placeholder="2026"
                min="1900"
                max="2100"
              />
              {errors.annee_scolaire_fin && <p className="text-[11px] text-[#f85149] mt-1">{errors.annee_scolaire_fin}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                Statut
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full bg-[#090c10] border border-[#21262d] p-2 text-[#e6edf3] text-[13px] outline-none transition-colors duration-150 focus:border-[#388bfd] cursor-pointer appearance-none"
              >
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="EN_ATTENTE">En attente</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.6px] uppercase text-[#484f58] mb-1.5">
                ID Établissement
              </label>
              <input
                type="text"
                name="id_etablissement"
                value={formData.id_etablissement}
                disabled
                className="w-full bg-[#161b22] border border-[#21262d] p-2 text-[#484f58] text-[13px] outline-none cursor-not-allowed"
              />
              <p className="text-[10px] text-[#484f58] mt-1">Généré automatiquement</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#21262d]">
        <button
          type="button"
          onClick={prevStep}
          className={`inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] hover:bg-[#161b22] ${
            step === 1 ? 'invisible' : ''
          }`}
        >
          <FiChevronLeft size={14} /> Retour
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#388bfd] text-white hover:bg-[#58a6ff]"
            disabled={isLoading}
          >
            Suivant <FiChevronRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 bg-[#39d353] text-black hover:bg-[#4ae368]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <FiCheck size={14} /> Créer la licence
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}