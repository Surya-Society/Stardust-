// src/models/etablissement.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Etablissement {
    pub id_etablissement: String,
    pub nom: String,
    pub sigle: Option<String>,
    pub numero_agrement: String,
    pub numero_fiscal: String,
    pub registre_commerciale: Option<String>,
    pub type_etablissement: String,
    pub statut_juridique: String,
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
    pub date_creation: String,
    pub date_modification: Option<String>,
    pub synced: i32,
    pub sync_date: Option<String>,
}