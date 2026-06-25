// src/commands/offre.rs
use tauri::command;
use serde_json::{json, Value};
use sqlx::PgPool;
use log::{info, error};

use crate::services::offre::OffreService;
use crate::models::offre::{CreateOffreRequest, UpdateOffreRequest};

#[command]
pub async fn get_all_offres(
    pool: tauri::State<'_, PgPool>,
    actif_seulement: Option<bool>,
) -> Result<Value, String> {
    info!("📋 Récupérer toutes les offres");
    
    let service = OffreService::new(pool.inner().clone());
    
    match service.get_all_offres(actif_seulement.unwrap_or(false)).await {
        Ok(offres) => {
            Ok(json!({
                "success": true,
                "data": offres
            }))
        }
        Err(e) => {
            error!("❌ Erreur récupération offres: {}", e);
            Ok(json!({
                "success": false,
                "error": e.to_string()
            }))
        }
    }
}

#[command]
pub async fn get_offre_by_id(
    offre_id: String,
    pool: tauri::State<'_, PgPool>,
) -> Result<Value, String> {
    info!("🔍 Récupérer offre: {}", offre_id);
    
    // ✅ Suppression de Uuid::parse_str(), on utilise directement la String
    let service = OffreService::new(pool.inner().clone());
    
    match service.get_offre_by_id(&offre_id).await {
        Ok(Some(offre)) => {
            Ok(json!({
                "success": true,
                "data": offre
            }))
        }
        Ok(None) => {
            Ok(json!({
                "success": false,
                "error": "Offre non trouvée"
            }))
        }
        Err(e) => {
            error!("❌ Erreur récupération offre: {}", e);
            Ok(json!({
                "success": false,
                "error": e.to_string()
            }))
        }
    }
}

#[command]
pub async fn create_offre(
    request: CreateOffreRequest,
    pool: tauri::State<'_, PgPool>,
) -> Result<Value, String> {
    info!("🆕 Créer offre: {}", request.nom);
    
    let service = OffreService::new(pool.inner().clone());
    
    match service.create_offre(request).await {
        Ok(offre) => {
            info!("✅ Offre créée: {}", offre.nom);
            Ok(json!({
                "success": true,
                "data": offre
            }))
        }
        Err(e) => {
            error!("❌ Erreur création offre: {}", e);
            Ok(json!({
                "success": false,
                "error": e.to_string()
            }))
        }
    }
}

#[command]
pub async fn update_offre(
    offre_id: String,
    request: UpdateOffreRequest,
    pool: tauri::State<'_, PgPool>,
) -> Result<Value, String> {
    info!("📝 Mettre à jour offre: {}", offre_id);
    
    // ✅ Suppression de Uuid::parse_str()
    let service = OffreService::new(pool.inner().clone());
    
    match service.update_offre(&offre_id, request).await {
        Ok(offre) => {
            info!("✅ Offre mise à jour: {}", offre.nom);
            Ok(json!({
                "success": true,
                "data": offre
            }))
        }
        Err(e) => {
            error!("❌ Erreur mise à jour offre: {}", e);
            Ok(json!({
                "success": false,
                "error": e.to_string()
            }))
        }
    }
}

#[command]
pub async fn delete_offre(
    offre_id: String,
    pool: tauri::State<'_, PgPool>,
) -> Result<Value, String> {
    info!("🗑️ Supprimer offre: {}", offre_id);
    
    // ✅ Suppression de Uuid::parse_str()
    let service = OffreService::new(pool.inner().clone());
    
    match service.delete_offre(&offre_id).await {
        Ok(true) => {
            Ok(json!({
                "success": true,
                "message": "Offre supprimée"
            }))
        }
        Ok(false) => {
            Ok(json!({
                "success": false,
                "error": "Offre non trouvée"
            }))
        }
        Err(e) => {
            error!("❌ Erreur suppression offre: {}", e);
            Ok(json!({
                "success": false,
                "error": e.to_string()
            }))
        }
    }
}

#[command]
pub async fn get_offre_stats(
    offre_id: String,
    pool: tauri::State<'_, PgPool>,
) -> Result<Value, String> {
    info!("📊 Statistiques offre: {}", offre_id);
    
    // ✅ Suppression de Uuid::parse_str()
    let service = OffreService::new(pool.inner().clone());
    
    match service.get_offre_stats(&offre_id).await {
        Ok(stats) => {
            Ok(json!({
                "success": true,
                "data": stats
            }))
        }
        Err(e) => {
            error!("❌ Erreur statistiques offre: {}", e);
            Ok(json!({
                "success": false,
                "error": e.to_string()
            }))
        }
    }
}

#[command]
pub async fn get_offres_publiques(
    pool: tauri::State<'_, PgPool>,
) -> Result<Value, String> {
    info!("📋 Récupérer les offres publiques");
    
    let service = OffreService::new(pool.inner().clone());
    
    match service.get_offres_publiques().await {
        Ok(offres) => {
            Ok(json!({
                "success": true,
                "data": offres
            }))
        }
        Err(e) => {
            error!("❌ Erreur récupération offres: {}", e);
            Ok(json!({
                "success": false,
                "error": e.to_string()
            }))
        }
    }
}