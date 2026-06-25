// src/models/licence.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

// ================================================================
// MODÈLE PRINCIPAL - Activations Keys
// ================================================================

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct ActivationKey {
    pub id: i64,
    pub key_text: String,
    pub school_name: String,
    pub plan: String,
    pub status: String,
    pub created_at: String,
    pub expires_at: String,
    pub uses: i64,
    pub max_uses: i64,
    pub hw_lock: i64,
    pub two_fa: i64,
    pub ip_restrict: i64,
    pub sec_score: i64,
    pub fingerprint: Option<String>,
    pub activation_method: String,
    pub revocations: i64,
    pub key_hash: String,
    pub note: Option<String>,
    pub created_by: Option<String>,
    pub id_etablissement: Option<String>,
    pub synced: i64,
    pub sync_date: Option<String>,
}

// ================================================================
// MODÈLE POUR LE FICHIER .licpkg
// ================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LicenceFile {
    pub licence_id: String,
    pub licence_key: String,
    pub school_id: String,
    pub plan: String,
    pub issued_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub max_version: String,
    pub install_limit: u32,
    pub signature: String,
    pub public_key: String,
    pub challenge: String,
    // ⬇️ AJOUTER CE CHAMP
    pub id_etablissement: Option<String>,
    pub etablissement: Option<EtablissementInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EtablissementInfo {
    pub id_etablissement: String,
    pub nom: String,
    pub sigle: Option<String>,
    pub numero_agrement: String,
    pub numero_fiscal: String,
    pub registre_commerciale: Option<String>,
    pub type_etablissement: String,  // PUBLIC, PRIVE, MIXTE
    pub statut_juridique: String,     // SARL, SA, ASSOCIATION, GIE, AUTRE
    pub pays: String,
    pub region: String,
    pub ville: String,
    pub commune: Option<String>,
    pub quatier: Option<String>,
    pub adresse: String,
    pub code_postal: Option<String>,
    pub telephone_principal: String,
    pub telephone_secondaire: Option<String>,
    pub email: Option<String>,
    pub site_web: Option<String>,
    pub annee_scolaire_debut: String,
    pub annee_scolaire_fin: String,
    pub statut: String,
}

// ================================================================
// TYPES POUR L'ACTIVATION
// ================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActivationRequest {
    pub licence_key: String,
    pub nom_appareil: String,
    pub identifiant_unique: String,
    pub adresse_mac: Option<String>,
    pub metadata: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActivationResponse {
    pub success: bool,
    pub activation_id: Option<String>,
    pub message: String,
    pub licence_details: Option<LicenseDetails>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LicenseDetails {
    pub plan: String,
    pub expires_at: DateTime<Utc>,
    pub days_remaining: i64,
    pub max_installations: u32,
    pub used_installations: u32,
    pub is_trial: bool,
}

// ================================================================
// REQUÊTES DE CRÉATION / MISE À JOUR
// ================================================================

#[derive(Debug, Deserialize)]
pub struct CreateLicenceRequest {
    pub school_name: String,
    pub plan: String,
    pub expires_at: String,
    pub max_uses: i64,
    pub hw_lock: bool,
    pub two_fa: bool,
    pub ip_restrict: bool,
    pub activation_method: String,
    pub note: Option<String>,
    pub id_etablissement: Option<String>,
    pub etablissement: Option<EtablissementInfo>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLicenceRequest {
    pub school_name: Option<String>,
    pub plan: Option<String>,
    pub expires_at: Option<String>,
    pub max_uses: Option<i64>,
    pub hw_lock: Option<bool>,
    pub two_fa: Option<bool>,
    pub ip_restrict: Option<bool>,
    pub note: Option<String>,
    // ⬇️ AJOUTER CE CHAMP (optionnel)
    pub id_etablissement: Option<String>,
}

// ================================================================
// STATISTIQUES
// ================================================================

#[derive(Debug, Serialize)]
pub struct LicenceStats {
    pub total: i64,
    pub active: i64,
    pub expired: i64,
    pub suspended: i64,
    pub revoked: i64,
    pub avg_sec_score: f64,
}

// ================================================================
// IMPLÉMENTATION
// ================================================================

impl ActivationKey {
    pub fn generate_key_hash(key_text: &str) -> String {
        use sha3::{Digest, Sha3_256};
        let mut hasher = Sha3_256::new();
        hasher.update(key_text.as_bytes());
        format!("sha256:{:x}", hasher.finalize())
    }
}