// src/models/abonnement.rs

use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;  // ← AJOUTER
use chrono::{DateTime, Utc};  // ← AJOUTER

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Abonnement {
    pub abonnement_id: Uuid,
    pub id_etablissement: Uuid,
    pub licence_id: Uuid,
    pub offre_id: Option<Uuid>,
    pub plan: String,
    pub duree: String,
    pub montant_original: i32,
    pub montant_remise: i32,
    pub montant_final: i32,
    pub devise: String,
    pub date_debut: DateTime<Utc>,
    pub date_prochain_paiement: Option<DateTime<Utc>>,
    pub date_fin: Option<DateTime<Utc>>,
    pub date_annulation: Option<DateTime<Utc>>,
    pub date_debut_periode: Option<DateTime<Utc>>,
    pub date_fin_periode: Option<DateTime<Utc>>,
    pub statut_renouvellement: String,
    pub statut: String,
    pub renouvellement_auto: bool,
    pub metadata: Option<serde_json::Value>,
    pub synced: i32,
    pub sync_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAbonnementRequest {
    pub id_etablissement: String,
    pub licence_id: String,
    pub plan: String,
    pub duree: String,
    pub montant_original: i32,
    pub montant_remise: i32,
    pub montant_final: i32,
    pub devise: Option<String>,
    pub date_debut: String,
    pub date_prochain_paiement: Option<String>,
    pub renouvellement_auto: Option<bool>,
    pub metadata: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAbonnementRequest {
    pub plan: Option<String>,
    pub duree: Option<String>,
    pub montant_final: Option<i32>,
    pub renouvellement_auto: Option<bool>,
    pub statut: Option<String>,
    pub metadata: Option<String>,
}