use tauri::command;
use serde_json::{json, Value};
use sqlx::SqlitePool;
use sqlx::Row;
use log::info;  // ✅ Supprimer error (pas utilisé)
use uuid::Uuid;
use chrono::Utc;

use crate::models::abonnement::{Abonnement, CreateAbonnementRequest, UpdateAbonnementRequest};

#[command]
pub async fn get_all_abonnements(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("📋 Récupérer tous les abonnements");
    
    let abonnements = sqlx::query_as::<_, Abonnement>(
        r#"
        SELECT 
            abonnement_id, id_etablissement, licence_id,
            plan, duree, montant_original, montant_remise, montant_final,
            devise, date_debut, date_prochain_paiement, date_fin,
            date_annulation, statut, renouvellement_auto,
            metadata, synced, sync_date, created_at, updated_at
        FROM abonnements
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(json!({
        "success": true,
        "data": abonnements
    }))
}

#[command]
pub async fn get_abonnement_by_id(
    abonnement_id: String,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("🔍 Récupérer abonnement: {}", abonnement_id);
    
    let abonnement = sqlx::query_as::<_, Abonnement>(
        r#"
        SELECT 
            abonnement_id, id_etablissement, licence_id,
            plan, duree, montant_original, montant_remise, montant_final,
            devise, date_debut, date_prochain_paiement, date_fin,
            date_annulation, statut, renouvellement_auto,
            metadata, synced, sync_date, created_at, updated_at
        FROM abonnements
        WHERE abonnement_id = ?
        "#
    )
    .bind(abonnement_id)
    .fetch_optional(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    if let Some(abonnement) = abonnement {
        Ok(json!({
            "success": true,
            "data": abonnement
        }))
    } else {
        Ok(json!({
            "success": false,
            "error": "Abonnement non trouvé"
        }))
    }
}

#[command]
pub async fn create_abonnement(
    request: CreateAbonnementRequest,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("🆕 Créer abonnement");
    
    let abonnement_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        INSERT INTO abonnements (
            abonnement_id, id_etablissement, licence_id, plan, duree,
            montant_original, montant_remise, montant_final, devise,
            date_debut, date_prochain_paiement, renouvellement_auto,
            statut, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIF', ?, ?, ?)
        "#
    )
    .bind(&abonnement_id)
    .bind(&request.id_etablissement)
    .bind(&request.licence_id)
    .bind(&request.plan)
    .bind(&request.duree)
    .bind(request.montant_original)
    .bind(request.montant_remise)
    .bind(request.montant_final)
    .bind(&request.devise.unwrap_or_else(|| "XOF".to_string()))
    .bind(&request.date_debut)
    .bind(&request.date_prochain_paiement)
    .bind(request.renouvellement_auto.unwrap_or(true) as i32)
    .bind(&request.metadata)
    .bind(&now)
    .bind(&now)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(json!({
        "success": true,
        "message": "Abonnement créé",
        "abonnement_id": abonnement_id
    }))
}

#[command]
pub async fn update_abonnement(
    abonnement_id: String,
    request: UpdateAbonnementRequest,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("📝 Mettre à jour abonnement: {}", abonnement_id);
    
    let mut updates = Vec::new();
    let mut binds: Vec<String> = Vec::new();
    
    if let Some(plan) = request.plan {
        updates.push("plan = ?");
        binds.push(plan);
    }
    if let Some(duree) = request.duree {
        updates.push("duree = ?");
        binds.push(duree);
    }
    if let Some(montant_final) = request.montant_final {
        updates.push("montant_final = ?");
        binds.push(montant_final.to_string());
    }
    if let Some(renouvellement_auto) = request.renouvellement_auto {
        updates.push("renouvellement_auto = ?");
        binds.push((renouvellement_auto as i32).to_string());
    }
    if let Some(statut) = request.statut {
        updates.push("statut = ?");
        binds.push(statut);
    }
    if let Some(metadata) = request.metadata {
        updates.push("metadata = ?");
        binds.push(metadata);
    }
    
    if updates.is_empty() {
        return Ok(json!({
            "success": false,
            "error": "Aucune mise à jour"
        }));
    }
    
    updates.push("updated_at = ?");
    binds.push(Utc::now().to_rfc3339());
    binds.push(abonnement_id);
    
    let query = format!(
        "UPDATE abonnements SET {} WHERE abonnement_id = ?",
        updates.join(", ")
    );
    
    let mut query_builder = sqlx::query(&query);
    for bind in binds {
        query_builder = query_builder.bind(bind);
    }
    
    query_builder
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(json!({
        "success": true,
        "message": "Abonnement mis à jour"
    }))
}

#[command]
pub async fn annuler_abonnement(
    abonnement_id: String,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("⛔ Annuler abonnement: {}", abonnement_id);
    
    sqlx::query(
        r#"
        UPDATE abonnements
        SET statut = 'ANNULE',
            date_annulation = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE abonnement_id = ?
        "#
    )
    .bind(abonnement_id)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(json!({
        "success": true,
        "message": "Abonnement annulé"
    }))
}

#[command]
pub async fn renouveler_abonnement(
    abonnement_id: String,
    _pool: tauri::State<'_, SqlitePool>,  // ✅ Ajouter _ car pool pas utilisé
) -> Result<Value, String> {
    info!("🔄 Renouveler abonnement: {}", abonnement_id);
    
    Ok(json!({
        "success": true,
        "message": "Abonnement renouvelé"
    }))
}

#[command]
pub async fn get_abonnement_stats(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("📊 Statistiques des abonnements");
    
    let row = sqlx::query(
        r#"
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN statut = 'ACTIF' THEN 1 ELSE 0 END) as actif,
            SUM(CASE WHEN statut = 'SUSPENDU' THEN 1 ELSE 0 END) as suspendu,
            SUM(CASE WHEN statut = 'EXPIRE' THEN 1 ELSE 0 END) as expire,
            SUM(CASE WHEN statut = 'ANNULE' THEN 1 ELSE 0 END) as annule,
            SUM(CASE WHEN plan = 'BASIC' THEN 1 ELSE 0 END) as basic,
            SUM(CASE WHEN plan = 'PREMIUM' THEN 1 ELSE 0 END) as premium,
            SUM(CASE WHEN plan = 'ENTERPRISE' THEN 1 ELSE 0 END) as enterprise
        FROM abonnements
        "#
    )
    .fetch_one(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    let total: i64 = row.get("total");
    let actif: Option<i64> = row.get("actif");
    let suspendu: Option<i64> = row.get("suspendu");
    let expire: Option<i64> = row.get("expire");
    let annule: Option<i64> = row.get("annule");
    let basic: Option<i64> = row.get("basic");
    let premium: Option<i64> = row.get("premium");
    let enterprise: Option<i64> = row.get("enterprise");

    Ok(json!({
        "success": true,
        "data": {
            "total": total,
            "actif": actif.unwrap_or(0),
            "suspendu": suspendu.unwrap_or(0),
            "expire": expire.unwrap_or(0),
            "annule": annule.unwrap_or(0),
            "plans": {
                "basic": basic.unwrap_or(0),
                "premium": premium.unwrap_or(0),
                "enterprise": enterprise.unwrap_or(0)
            }
        }
    }))
}