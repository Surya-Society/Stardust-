use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct TransactionPaiement {
    pub transaction_id: Uuid,
    pub id_etablissement: Uuid,
    pub abonnement_id: Uuid,
    pub licence_id: Uuid,
    pub montant: i32,
    pub devise: String,
    pub methode: MethodePaiement,
    pub description: Option<String>,
    pub numero_telephone: String,
    pub nom_payeur: Option<String>,
    pub email_payeur: Option<String>,
    pub reference_externe: Option<String>,
    pub reference_interne: Option<String>,
    pub statut: StatutTransaction,
    pub code_erreur: Option<String>,
    pub message_erreur: Option<String>,
    pub message_operateur: Option<String>,
    pub date_demande: DateTime<Utc>,
    pub date_validation: Option<DateTime<Utc>>,
    pub date_expiration: Option<DateTime<Utc>>,
    pub requete_api: Option<serde_json::Value>,
    pub reponse_api: Option<serde_json::Value>,
    pub webhook_data: Option<serde_json::Value>,
    pub metadata: Option<serde_json::Value>,
    pub notes: Option<String>,
    pub synced: i32,
    pub sync_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum MethodePaiement {
    MTN_MONEY,
    AIRTELL_MONEY,
    ORANGE_MONEY,
    WAVE,
    CARTE,
    MANUEL,
}

impl std::fmt::Display for MethodePaiement {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MethodePaiement::MTN_MONEY => write!(f, "MTN_MONEY"),
            MethodePaiement::AIRTELL_MONEY => write!(f, "AIRTELL_MONEY"),
            MethodePaiement::ORANGE_MONEY => write!(f, "ORANGE_MONEY"),
            MethodePaiement::WAVE => write!(f, "WAVE"),
            MethodePaiement::CARTE => write!(f, "CARTE"),
            MethodePaiement::MANUEL => write!(f, "MANUEL"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum StatutTransaction {
    EN_ATTENTE,
    EN_COURS,
    REUSSI,
    ECHOUE,
    ANNULE,
    REMBOURSE,
    TIMEOUT,
}

impl std::fmt::Display for StatutTransaction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StatutTransaction::EN_ATTENTE => write!(f, "EN_ATTENTE"),
            StatutTransaction::EN_COURS => write!(f, "EN_COURS"),
            StatutTransaction::REUSSI => write!(f, "REUSSI"),
            StatutTransaction::ECHOUE => write!(f, "ECHOUE"),
            StatutTransaction::ANNULE => write!(f, "ANNULE"),
            StatutTransaction::REMBOURSE => write!(f, "REMBOURSE"),
            StatutTransaction::TIMEOUT => write!(f, "TIMEOUT"),
        }
    }
}

// ============================================================================
// DTOs
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct InitierPaiementRequest {
    pub id_etablissement: Uuid,
    pub abonnement_id: Uuid,
    pub licence_id: Uuid,
    pub montant: i32,
    pub methode: MethodePaiement,
    pub numero_telephone: String,
    pub nom_payeur: Option<String>,
    pub email_payeur: Option<String>,
    pub description: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct InitierPaiementResponse {
    pub transaction_id: Uuid,
    pub reference_interne: String,
    pub reference_externe: Option<String>,
    pub statut: StatutTransaction,
    pub date_expiration: Option<DateTime<Utc>>,
    pub message: String,
    pub instructions: Option<String>,
    pub qr_code: Option<String>,
    pub url_paiement: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct VerifierPaiementRequest {
    pub transaction_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct VerifierPaiementResponse {
    pub transaction_id: Uuid,
    pub statut: StatutTransaction,
    pub montant: i32,
    pub date_validation: Option<DateTime<Utc>>,
    pub message: String,
    pub est_valide: bool,
}

#[derive(Debug, Deserialize)]
pub struct WebhookMTNRequest {
    pub transaction_id: String,
    pub status: String,
    pub amount: String,
    pub currency: String,
    pub payer: String,
    pub timestamp: String,
    pub external_id: String,
}

#[derive(Debug, Deserialize)]
pub struct WebhookAirtelRequest {
    pub reference: String,
    pub status: String,
    pub amount: f64,
    pub currency: String,
    pub phone: String,
    pub description: String,
}