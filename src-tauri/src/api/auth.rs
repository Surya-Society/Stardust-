// src/api/auth.rs
use actix_web::{web, HttpResponse, Responder, HttpRequest};  // ✅ AJOUTER HttpRequest
use serde::{Deserialize, Serialize};
use serde_json::json;
use log::{info, warn};
use std::env;

#[derive(Debug, Deserialize)]
pub struct VerifyApiKeyRequest {
    pub api_key: String,
}

#[derive(Debug, Serialize)]
pub struct VerifyApiKeyResponse {
    pub valid: bool,
    pub message: String,
}

/// ✅ Vérification de la clé API (pour Surya)
pub async fn verify_api_key(
    req: web::Json<VerifyApiKeyRequest>,
) -> impl Responder {
    info!("🔑 Vérification clé API");
    
    let valid_api_key = env::var("STARDUST_API_KEY")
        .unwrap_or_else(|_| "surya-stardust-secret-key-2025".to_string());
    
    if req.api_key == valid_api_key {
        info!("✅ Clé API valide");
        HttpResponse::Ok().json(json!({
            "valid": true,
            "message": "Clé API valide"
        }))
    } else {
        warn!("⛔ Clé API invalide: {}", req.api_key);
        HttpResponse::Unauthorized().json(json!({
            "valid": false,
            "message": "Clé API invalide"
        }))
    }
}

/// ✅ Middleware pour vérifier la clé API (pour les routes protégées)
pub async fn verify_api_key_middleware(
    req: HttpRequest,  // ✅ Utiliser HttpRequest directement
    _: web::Data<String>,
) -> impl Responder {
    let api_key = match req.headers().get("X-API-Key") {
        Some(key) => key.to_str().unwrap_or("").to_string(),
        None => {
            return HttpResponse::Unauthorized().json(json!({
                "success": false,
                "error": "Clé API manquante"
            }))
        }
    };
    
    let valid_api_key = env::var("STARDUST_API_KEY")
        .unwrap_or_else(|_| "surya-stardust-secret-key-2025".to_string());
    
    if api_key == valid_api_key {
        HttpResponse::Ok().finish()
    } else {
        warn!("⛔ Clé API invalide dans le middleware");
        HttpResponse::Unauthorized().json(json!({
            "success": false,
            "error": "Clé API invalide"
        }))
    }
}

/// ✅ Vérifie si la clé API est valide (fonction utilitaire)
pub fn is_valid_api_key(api_key: &str) -> bool {
    let valid_api_key = env::var("STARDUST_API_KEY")
        .unwrap_or_else(|_| "surya-stardust-secret-key-2025".to_string());
    
    api_key == valid_api_key
}