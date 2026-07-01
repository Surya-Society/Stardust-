// src/api/auth.rs - VERSION CORRIGÉE
use actix_web::{web, HttpResponse, Responder, HttpRequest};
use serde::{Deserialize, Serialize};
use serde_json::json;
use log::{info, warn, error};
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

/// ✅ Récupère la clé API depuis l'environnement
/// ✅ PANIQUE si la clé n'est pas définie (pour éviter les erreurs silencieuses)
fn get_api_key() -> String {
    match env::var("STARDUST_API_KEY") {
        Ok(key) => key,
        Err(_) => {
            // ⚠️ En développement, on peut utiliser une valeur par défaut
            // Mais en production, ça devrait paniquer
            #[cfg(debug_assertions)]
            {
                warn!("⚠️ STARDUST_API_KEY non définie dans .env, utilisation de la valeur par défaut (DEV ONLY)");
                "surya-stardust-secret-key-2025".to_string()
            }
            #[cfg(not(debug_assertions))]
            {
                error!("❌ STARDUST_API_KEY doit être définie dans .env en production !");
                panic!("STARDUST_API_KEY not set");
            }
        }
    }
}

/// ✅ Vérification de la clé API (pour Surya)
pub async fn verify_api_key(
    req: web::Json<VerifyApiKeyRequest>,
) -> impl Responder {
    info!("🔑 Vérification clé API");
    
    let valid_api_key = get_api_key();
    
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
    req: HttpRequest,
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
    
    let valid_api_key = get_api_key();
    
    if api_key == valid_api_key {
        HttpResponse::Ok().finish()
    } else {
        warn!("⛔ Clé API invalide dans le middleware: {}", api_key);
        HttpResponse::Unauthorized().json(json!({
            "success": false,
            "error": "Clé API invalide"
        }))
    }
}

/// ✅ Vérifie si la clé API est valide (fonction utilitaire)
pub fn is_valid_api_key(api_key: &str) -> bool {
    let valid_api_key = get_api_key();
    api_key == valid_api_key
}