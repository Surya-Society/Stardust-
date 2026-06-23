// src/api/licence.rs
use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{PgPool, Row};
use chrono::Utc;
use uuid::Uuid;
use log::{info, error};
use std::sync::Arc;

use crate::models::licence::{ActivationRequest, ActivationResponse, LicenseDetails};
use crate::crypto::ed25519::LicenseSigner;

// ================================================================
// REQUÊTES
// ================================================================

#[derive(Debug, Deserialize)]
pub struct ActiverLicenceRequest {
    pub licence_key: String,
    pub appareil_info: ActivationRequest,
}

// ================================================================
// RÉPONSES
// ================================================================

#[derive(Debug, Serialize)]
pub struct LicenceStatusResponse {
    pub statut: String,
    pub date_expiration: Option<String>,
    pub jours_restants: Option<i64>,
    pub est_actif: bool,
    pub est_suspendu: bool,
    pub est_expire: bool,
    pub est_en_grace_period: bool,
    pub grace_period_restante: Option<i64>,
    pub message: String,
    pub plan: Option<String>,
    pub duree: Option<String>,
    pub activations_utilisees: Option<i32>,
    pub activations_max: Option<i32>,
}

// ================================================================
// ENDPOINTS
// ================================================================

pub async fn get_statut(
    path: web::Path<String>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let licence_key = path.into_inner();
    
    info!("🔍 Vérification statut licence: {}", licence_key);
    
    let row = sqlx::query(
        r#"
        SELECT 
            l.licence_id,
            l.licence_key,
            l.id_etablissement,
            l.statut,
            l.date_expiration,
            l.duree,
            l.activations_max,
            l.activations_utilisees,
            l.type_licence,
            COALESCE(c.grace_period_days, 7) as grace_period
        FROM licences l
        LEFT JOIN configuration_paiement c ON c.id_etablissement = l.id_etablissement
        WHERE l.licence_key = $1
        "#
    )
    .bind(&licence_key)
    .fetch_optional(&**pool)
    .await;

    match row {
        Ok(Some(row)) => {
            let statut: String = row.get("statut");
            let date_expiration: chrono::DateTime<chrono::Utc> = row.get("date_expiration");
            
            let now = Utc::now();
            let jours_restants = (date_expiration - now).num_days();
            let est_expire = jours_restants < 0;
            
            let statut_final = if est_expire {
                "EXPIRED"
            } else {
                &statut
            };
            
            HttpResponse::Ok().json(json!({
                "success": true,
                "data": {
                    "statut": statut_final,
                    "date_expiration": date_expiration.to_rfc3339(),
                    "jours_restants": jours_restants,
                    "est_actif": statut_final == "ACTIVE" && jours_restants > 0,
                    "est_suspendu": statut == "SUSPENDED",
                    "est_expire": statut_final == "EXPIRED",
                    "est_en_grace_period": false,
                    "grace_period_restante": None::<i64>,
                    "plan": row.get::<Option<String>, _>("plan"),
                    "duree": row.get::<Option<String>, _>("duree"),
                    "activations_utilisees": row.get::<Option<i32>, _>("activations_utilisees"),
                    "activations_max": row.get::<Option<i32>, _>("activations_max"),
                    "message": match statut_final {
                        "ACTIVE" => format!("✅ Licence active - {} jours restants", jours_restants),
                        "EXPIRED" => "❌ Licence expirée".to_string(),
                        "SUSPENDED" => "⛔ Licence suspendue".to_string(),
                        _ => "Statut inconnu".to_string(),
                    }
                }
            }))
        }
        Ok(None) => {
            HttpResponse::NotFound().json(json!({
                "success": false,
                "error": "Licence non trouvée"
            }))
        }
        Err(e) => {
            error!("❌ Erreur vérification licence: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}

pub async fn activer(
    req: web::Json<ActiverLicenceRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("🔑 Activation licence: {}", req.licence_key);
    
    // 1. Vérifier que la licence existe
    let row = sqlx::query(
        r#"
        SELECT licence_id, statut, date_expiration, activations_max, activations_utilisees
        FROM licences
        WHERE licence_key = $1
        "#
    )
    .bind(&req.licence_key)
    .fetch_optional(&**pool)
    .await;

    let (licence_id, statut, date_expiration, activations_max, activations_utilisees) = match row {
        Ok(Some(r)) => {
            (
                r.get::<String, _>("licence_id"),
                r.get::<String, _>("statut"),
                r.get::<chrono::DateTime<chrono::Utc>, _>("date_expiration"),
                r.get::<i32, _>("activations_max"),
                r.get::<i32, _>("activations_utilisees"),
            )
        }
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

    // 2. Vérifier que la licence est active
    if statut != "ACTIVE" {
        return HttpResponse::BadRequest().json(json!({
            "success": false,
            "error": format!("Licence non active (statut: {})", statut)
        }))
    }

    // 3. Vérifier que la licence n'est pas expirée
    if date_expiration < Utc::now() {
        return HttpResponse::BadRequest().json(json!({
            "success": false,
            "error": "Licence expirée"
        }))
    }

    // 4. Créer l'activation
    let activation_id = Uuid::new_v4();
    let now = Utc::now();

    let result = sqlx::query(
        r#"
        INSERT INTO activations_appareils (
            activation_id, licence_id, id_etablissement,
            nom_appareil, identifiant_unique, adresse_mac,
            statut, date_activation, date_derniere_verification,
            metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7, $8, $9)
        "#
    )
    .bind(activation_id)
    .bind(&licence_id)
    .bind(&req.appareil_info.licence_key)
    .bind(&req.appareil_info.nom_appareil)
    .bind(&req.appareil_info.identifiant_unique)
    .bind(&req.appareil_info.adresse_mac)
    .bind(now)
    .bind(now)
    .bind(&req.appareil_info.metadata)
    .execute(&**pool)
    .await;

    match result {
        Ok(_) => {
            // 5. Incrémenter le compteur
            let _ = sqlx::query(
                r#"
                UPDATE licences
                SET activations_utilisees = activations_utilisees + 1,
                    updated_at = NOW()
                WHERE licence_id = $1
                "#
            )
            .bind(&licence_id)
            .execute(&**pool)
            .await;

            info!("✅ Appareil activé: {}", req.appareil_info.nom_appareil);

            HttpResponse::Ok().json(json!({
                "success": true,
                "message": "Activation réussie",
                "activation_id": activation_id.to_string(),
                "licence_details": {
                    "plan": "PREMIUM",
                    "expires_at": date_expiration.to_rfc3339(),
                    "days_remaining": (date_expiration - Utc::now()).num_days(),
                    "max_installations": activations_max as u32,
                    "used_installations": (activations_utilisees + 1) as u32,
                    "is_trial": false,
                }
            }))
        }
        Err(e) => {
            error!("❌ Erreur activation: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}