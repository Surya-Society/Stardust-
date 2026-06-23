// src/api/auth.rs
use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
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

pub async fn verify_api_key(
    req: web::Json<VerifyApiKeyRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("🔑 Vérification clé API");
    
    let valid_api_key = env::var("STARDUST_API_KEY")
        .unwrap_or_else(|_| "surya-stardust-secret-key-2025".to_string());
    
    if req.api_key == valid_api_key {
        HttpResponse::Ok().json(json!({
            "valid": true,
            "message": "Clé API valide"
        }))
    } else {
        warn!("⛔ Clé API invalide");
        HttpResponse::Unauthorized().json(json!({
            "valid": false,
            "message": "Clé API invalide"
        }))
    }
}