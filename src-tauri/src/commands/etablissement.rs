// src/commands/etablissement.rs - VERSION CORRIGÉE
use tauri::command;
use serde_json::{json, Value};
use sqlx::SqlitePool;
use sqlx::Row;
use log::{info, error};

use crate::models::etablissement::Etablissement;

#[command]
pub async fn get_all_etablissements(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("📋 Récupérer tous les établissements (Stardust)");
    
    let rows = sqlx::query(
        r#"
        SELECT 
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quartier, adresse, code_postal,
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        FROM Etablissement
        ORDER BY date_creation DESC
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| {
        error!("❌ Erreur récupération établissements: {}", e);
        e.to_string()
    })?;

    let mut etablissements = Vec::new();
    for row in rows {
        etablissements.push(json!({
            "id_etablissement": row.get::<String, _>("id_etablissement"),
            "nom": row.get::<String, _>("nom"),
            "sigle": row.get::<Option<String>, _>("sigle"),
            "type_etablissement": row.get::<String, _>("type_etablissement"),
            "statut": row.get::<String, _>("statut"),
            "pays": row.get::<String, _>("pays"),
            "region": row.get::<String, _>("region"),
            "ville": row.get::<String, _>("ville"),
            "quartier": row.get::<Option<String>, _>("quartier"),
            "telephone_principal": row.get::<String, _>("telephone_principal"),
            "email": row.get::<Option<String>, _>("email"),
            "date_creation": row.get::<String, _>("date_creation"),
            "synced": row.get::<i32, _>("synced"),
            "sync_date": row.get::<Option<String>, _>("sync_date"),
        }));
    }

    info!("✅ {} établissements récupérés", etablissements.len());
    
    Ok(json!({
        "success": true,
        "data": etablissements
    }))
}

#[command]
pub async fn force_sync_etablissements(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("🔄 Force sync des établissements (Stardust)");
    
    // TODO: Implémenter la sync forcée
    Ok(json!({
        "success": true,
        "message": "Synchronisation forcée lancée (à implémenter)"
    }))
}
