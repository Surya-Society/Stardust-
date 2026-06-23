// src/api/webhook.rs
use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{PgPool, Row};
use log::{info, error};

#[derive(Debug, Deserialize, Serialize)]
pub struct MtnWebhookPayload {
    pub transaction_id: String,
    pub status: String,
    pub amount: String,
    pub currency: String,
    pub payer: String,
    pub financial_transaction_id: Option<String>,
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AirtelWebhookPayload {
    pub reference: String,
    pub status: String,
    pub amount: f64,
    pub currency: String,
    pub phone: String,
    pub description: Option<String>,
}

pub async fn mtn(
    payload: web::Json<MtnWebhookPayload>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("📨 MTN Webhook reçu: {:?}", payload);
    
    // ✅ Cloner le payload pour éviter le move
    let payload_clone = payload.into_inner();
    let reason = payload_clone.reason.clone();
    let transaction_id = payload_clone.transaction_id.clone();
    
    let statut = match payload_clone.status.as_str() {
        "SUCCESS" | "SUCCESSFUL" | "COMPLETED" => "REUSSI",
        "FAILED" | "FAIL" | "DECLINED" => "ECHOUE",
        "TIMEOUT" | "EXPIRED" => "TIMEOUT",
        "CANCELLED" => "ANNULE",
        "REFUNDED" => "REMBOURSE",
        _ => "ECHOUE",
    };

    let result = sqlx::query(
        r#"
        UPDATE transactions_paiement
        SET statut = $1,
            date_validation = NOW(),
            webhook_data = $2,
            message_operateur = $3
        WHERE reference_externe = $4
        "#
    )
    .bind(statut)
    .bind(json!(payload_clone))
    .bind(&reason)
    .bind(&transaction_id)
    .execute(&**pool)
    .await;

    match result {
        Ok(_) => {
            info!("✅ Transaction MTN mise à jour: {}", statut);
            
            if statut == "REUSSI" {
                info!("✅ Paiement MTN réussi - Activation de l'abonnement");
                
                let row = sqlx::query(
                    r#"
                    SELECT transaction_id FROM transactions_paiement
                    WHERE reference_externe = $1
                    "#
                )
                .bind(&transaction_id)
                .fetch_optional(&**pool)
                .await;

                if let Ok(Some(row)) = row {
                    let tx_id: String = row.get("transaction_id");
                    super::paiement::activer_abonnement(&tx_id, &pool).await;
                }
            }
            
            HttpResponse::Ok().json(json!({
                "success": true,
                "message": "Webhook traité avec succès"
            }))
        }
        Err(e) => {
            error!("❌ Erreur mise à jour transaction: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}

pub async fn airtel(
    payload: web::Json<AirtelWebhookPayload>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("📨 Airtel Webhook reçu: {:?}", payload);
    
    // ✅ Cloner le payload pour éviter le move
    let payload_clone = payload.into_inner();
    let reference = payload_clone.reference.clone();
    
    let statut = match payload_clone.status.as_str() {
        "SUCCESS" | "SUCCESSFUL" | "COMPLETED" => "REUSSI",
        "FAILED" | "FAIL" | "DECLINED" => "ECHOUE",
        "TIMEOUT" | "EXPIRED" => "TIMEOUT",
        "CANCELLED" => "ANNULE",
        "REFUNDED" => "REMBOURSE",
        _ => "ECHOUE",
    };

    let result = sqlx::query(
        r#"
        UPDATE transactions_paiement
        SET statut = $1,
            date_validation = NOW(),
            webhook_data = $2
        WHERE reference_externe = $3
        "#
    )
    .bind(statut)
    .bind(json!(payload_clone))
    .bind(&reference)
    .execute(&**pool)
    .await;

    match result {
        Ok(_) => {
            info!("✅ Transaction Airtel mise à jour: {}", statut);
            
            if statut == "REUSSI" {
                let row = sqlx::query(
                    r#"
                    SELECT transaction_id FROM transactions_paiement
                    WHERE reference_externe = $1
                    "#
                )
                .bind(&reference)
                .fetch_optional(&**pool)
                .await;

                if let Ok(Some(row)) = row {
                    let tx_id: String = row.get("transaction_id");
                    super::paiement::activer_abonnement(&tx_id, &pool).await;
                }
            }
            
            HttpResponse::Ok().json(json!({
                "success": true,
                "message": "Webhook traité avec succès"
            }))
        }
        Err(e) => {
            error!("❌ Erreur mise à jour transaction: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}