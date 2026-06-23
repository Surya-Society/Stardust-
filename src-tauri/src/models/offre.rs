// src/models/offre.rs

use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Offre {
    pub offre_id: Uuid,
    pub code: String,
    pub nom: String,
    pub description: Option<String>,
    pub statut: String,
    pub duree: String,
    pub prix: i32,
    pub devise: String,
    pub prix_original: Option<i32>,
    pub reduction_pourcentage: Option<i32>,
    pub essai_gratuit: bool,
    pub duree_essai_jours: Option<i32>,
    pub fonctionnalites: Option<serde_json::Value>,
    pub renouvellement_automatique: bool,
    pub grace_period_jours: i32,
    pub icon: Option<String>,
    pub couleur: Option<String>,
    pub ordre_affichage: i32,
    pub est_populaire: bool,
    pub est_meilleur_rapport: bool,
    pub nombre_abonnes: i32,
    pub total_revenu: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateOffreRequest {
    pub code: String,
    pub nom: String,
    pub description: Option<String>,
    pub duree: String,
    pub prix: i32,
    pub devise: Option<String>,
    pub prix_original: Option<i32>,
    pub reduction_pourcentage: Option<i32>,
    pub fonctionnalites: Option<serde_json::Value>,
    pub renouvellement_automatique: Option<bool>,
    pub grace_period_jours: Option<i32>,
    pub icon: Option<String>,
    pub couleur: Option<String>,
    pub ordre_affichage: Option<i32>,
    pub est_populaire: Option<bool>,
    pub est_meilleur_rapport: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOffreRequest {
    pub nom: Option<String>,
    pub description: Option<String>,
    pub statut: Option<String>,
    pub prix: Option<i32>,
    pub prix_original: Option<i32>,
    pub reduction_pourcentage: Option<i32>,
    pub fonctionnalites: Option<serde_json::Value>,
    pub renouvellement_automatique: Option<bool>,
    pub grace_period_jours: Option<i32>,
    pub icon: Option<String>,
    pub couleur: Option<String>,
    pub ordre_affichage: Option<i32>,
    pub est_populaire: Option<bool>,
    pub est_meilleur_rapport: Option<bool>,
}