// src/api/paiement.rs
use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{PgPool, Row};
use uuid::Uuid;
use chrono::Utc;
use log::{info, error};
use std::sync::Arc;

use crate::payment::service::PaymentService;

// ================================================================
// REQUÊTES
// ================================================================

#[derive(Debug, Deserialize)]
pub struct InitierPaiementRequest {
    pub id_etablissement: String,
    pub abonnement_id: String,
    pub licence_id: String,
    pub montant: i32,
    pub methode: String,
    pub numero_telephone: String,
    pub nom_payeur: Option<String>,
    pub email_payeur: Option<String>,
    pub description: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

// ================================================================
// RÉPONSES
// ================================================================

#[derive(Debug, Serialize)]
pub struct InitierPaiementResponse {
    pub success: bool,
    pub transaction_id: String,
    pub reference_interne: String,
    pub reference_externe: Option<String>,
    pub statut: String,
    pub message: String,
    pub date_expiration: Option<String>,
}

// ================================================================
// ENDPOINTS
// ================================================================

pub async fn initier(
    req: web::Json<InitierPaiementRequest>,
    pool: web::Data<PgPool>,
    payment_service: web::Data<Arc<PaymentService>>,
) -> impl Responder {
    info!("💳 Initier paiement: {} FCFA via {}", req.montant, req.methode);
    
    let transaction_id = Uuid::new_v4();
    let now = Utc::now();
    let reference_interne = format!("STAR-{}-{}", 
        now.format("%Y%m%d"),
        Uuid::new_v4().simple().to_string().chars().take(8).collect::<String>()
    );

    // 1. Vérifier que l'abonnement existe
    let abonnement = sqlx::query(
        r#"
        SELECT abonnement_id, statut, montant_final, offre_id
        FROM abonnements
        WHERE abonnement_id = $1
        "#
    )
    .bind(&req.abonnement_id)
    .fetch_optional(&**pool)
    .await;

    let _abonnement = match abonnement {
        Ok(Some(a)) => a,
        Ok(None) => {
            return HttpResponse::NotFound().json(json!({
                "success": false,
                "error": "Abonnement non trouvé"
            }))
        }
        Err(e) => {
            error!("❌ Erreur vérification abonnement: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    };

    // 2. Vérifier que la licence existe
    let licence = sqlx::query(
        r#"
        SELECT licence_id, statut, date_expiration
        FROM licences
        WHERE licence_id = $1
        "#
    )
    .bind(&req.licence_id)
    .fetch_optional(&**pool)
    .await;

    let _licence = match licence {
        Ok(Some(l)) => l,
        Ok(None) => {
            return HttpResponse::NotFound().json(json!({
                "success": false,
                "error": "Licence non trouvée"
            }))
        }
        Err(e) => {
            error!("❌ Erreur vérification licence: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    };

    // 3. Créer la transaction
    let result = sqlx::query(
        r#"
        INSERT INTO transactions_paiement (
            transaction_id, id_etablissement, abonnement_id, licence_id,
            montant, devise, methode, numero_telephone, nom_payeur,
            email_payeur, description, statut, reference_interne,
            date_demande, date_expiration, metadata
        ) VALUES ($1, $2, $3, $4, $5, 'XOF', $6, $7, $8, $9, $10, 'EN_ATTENTE', $11, $12, $13, $14)
        "#
    )
    .bind(transaction_id)
    .bind(&req.id_etablissement)
    .bind(&req.abonnement_id)
    .bind(&req.licence_id)
    .bind(req.montant)
    .bind(&req.methode)
    .bind(&req.numero_telephone)
    .bind(&req.nom_payeur)
    .bind(&req.email_payeur)
    .bind(&req.description)
    .bind(&reference_interne)
    .bind(now)
    .bind(now + chrono::Duration::minutes(15))
    .bind(&req.metadata)
    .execute(&**pool)
    .await;

    let transaction = match result {
        Ok(_) => transaction_id,
        Err(e) => {
            error!("❌ Erreur création transaction: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    };

    // ✅ Correction : spécifier le type pour None
    HttpResponse::Ok().json(json!({
        "success": true,
        "transaction_id": transaction.to_string(),
        "reference_interne": reference_interne,
        "reference_externe": None::<String>,
        "statut": "EN_ATTENTE",
        "message": "Paiement initié",
        "date_expiration": (now + chrono::Duration::minutes(15)).to_rfc3339(),
    }))
}

pub async fn verifier(
    path: web::Path<String>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let transaction_id = path.into_inner();
    
    info!("🔍 Vérifier paiement: {}", transaction_id);
    
    let row = sqlx::query(
        r#"
        SELECT 
            transaction_id, statut, montant, date_validation,
            date_demande, methode, numero_telephone
        FROM transactions_paiement
        WHERE transaction_id = $1
        "#
    )
    .bind(&transaction_id)
    .fetch_optional(&**pool)
    .await;

    match row {
        Ok(Some(row)) => {
            let statut: String = row.get("statut");
            let est_valide = statut == "REUSSI";
            let montant: i32 = row.get("montant");
            let date_validation: Option<chrono::DateTime<chrono::Utc>> = row.get("date_validation");
            
            HttpResponse::Ok().json(json!({
                "success": true,
                "transaction_id": transaction_id,
                "statut": statut,
                "est_valide": est_valide,
                "montant": montant,
                "date_validation": date_validation.map(|d| d.to_rfc3339()),
                "message": match statut.as_str() {
                    "REUSSI" => "✅ Paiement validé",
                    "EN_ATTENTE" => "⏳ En attente de confirmation",
                    "ECHOUE" => "❌ Paiement échoué",
                    "ANNULE" => "⛔ Paiement annulé",
                    "REMBOURSE" => "🔄 Paiement remboursé",
                    "TIMEOUT" => "⏰ Paiement expiré",
                    _ => "Statut inconnu",
                },
            }))
        }
        Ok(None) => {
            HttpResponse::NotFound().json(json!({
                "success": false,
                "error": "Transaction non trouvée"
            }))
        }
        Err(e) => {
            error!("❌ Erreur vérification: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}

// ✅ Fonction publique pour activation d'abonnement
pub async fn activer_abonnement(transaction_id: &str, pool: &PgPool) {
    info!("✅ Activation abonnement pour transaction: {}", transaction_id);
    
    let row = sqlx::query(
        r#"
        SELECT id_etablissement, abonnement_id, licence_id, montant
        FROM transactions_paiement
        WHERE transaction_id = $1
        "#
    )
    .bind(transaction_id)
    .fetch_optional(pool)
    .await;

    if let Ok(Some(row)) = row {
        let abonnement_id: String = row.get("abonnement_id");
        let licence_id: String = row.get("licence_id");

        let _ = sqlx::query(
            r#"
            UPDATE licences
            SET statut = 'ACTIVE',
                date_expiration = NOW() + INTERVAL '1 month',
                updated_at = NOW()
            WHERE licence_id = $1
            "#
        )
        .bind(&licence_id)
        .execute(pool)
        .await;

        let _ = sqlx::query(
            r#"
            UPDATE abonnements
            SET statut = 'ACTIF',
                date_prochain_paiement = NOW() + INTERVAL '1 month',
                updated_at = NOW()
            WHERE abonnement_id = $1
            "#
        )
        .bind(&abonnement_id)
        .execute(pool)
        .await;

        info!("✅ Abonnement {} activé avec succès", abonnement_id);
    }
}