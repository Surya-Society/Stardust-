// src/api/licence.rs
use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{PgPool, Row};
use chrono::Utc;
use uuid::Uuid;
use log::{info, error, warn}; 
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

#[derive(Debug, Deserialize)]
pub struct UpdateLicenceStatusRequest {
    pub licence_key: String,
    pub statut: String,  // 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED'
    pub date_expiration: Option<String>,
}

// ================================================================
// ✅ NOUVELLE REQUÊTE POUR LA VALIDATION DE CHALLENGE
// ================================================================

#[derive(Debug, Deserialize)]
pub struct ValidateChallengeRequest {
    pub challenge: String,
    pub licence_key: String,
    pub device_id: String,
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

/// ✅ Vérifier le statut d'une licence
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

/// ✅ Activer une licence (activation d'appareil)
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

// ================================================================
// ✅ ENDPOINTS POUR LA SYNCHRONISATION
// ================================================================

/// ✅ Mettre à jour le statut d'une licence (appelé par Surya)
pub async fn update_licence_status(
    req: web::Json<UpdateLicenceStatusRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("📝 Mise à jour statut licence: {} -> {}", req.licence_key, req.statut);
    
    // 1. Vérifier que la licence existe
    let exists = match sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM licences WHERE licence_key = $1)"
    )
    .bind(&req.licence_key)
    .fetch_one(&**pool)
    .await {
        Ok(exists) => exists,
        Err(e) => {
            error!("❌ Erreur vérification licence: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }));
        }
    };

    if !exists {
        return HttpResponse::NotFound().json(json!({
            "success": false,
            "error": "Licence non trouvée"
        }));
    }

    // 2. Mettre à jour le statut
    let now = Utc::now().to_rfc3339();
    
    let result = if let Some(date_expiration) = &req.date_expiration {
        // ✅ Avec mise à jour de la date d'expiration
        sqlx::query(
            r#"
            UPDATE licences
            SET statut = $1,
                date_expiration = $2,
                updated_at = $3,
                synced = 1,
                sync_date = $4
            WHERE licence_key = $5
            "#
        )
        .bind(&req.statut)
        .bind(date_expiration)
        .bind(&now)
        .bind(&now)
        .bind(&req.licence_key)
        .execute(&**pool)
        .await
    } else {
        // ✅ Seulement le statut
        sqlx::query(
            r#"
            UPDATE licences
            SET statut = $1,
                updated_at = $2,
                synced = 1,
                sync_date = $3
            WHERE licence_key = $4
            "#
        )
        .bind(&req.statut)
        .bind(&now)
        .bind(&now)
        .bind(&req.licence_key)
        .execute(&**pool)
        .await
    };

    match result {
        Ok(_) => {
            // ✅ Enregistrer l'événement
            let _ = sqlx::query(
                r#"
                INSERT INTO evenements_licence (
                    id_etablissement, licence_id, type_event, message, source
                ) 
                SELECT 
                    id_etablissement, licence_id, 'REACTIVATION', 
                    $1, 'API_SURYA'
                FROM licences
                WHERE licence_key = $2
                "#
            )
            .bind(format!("Statut changé vers {}", req.statut))
            .bind(&req.licence_key)
            .execute(&**pool)
            .await;

            info!("✅ Statut licence mis à jour: {}", req.licence_key);
            
            HttpResponse::Ok().json(json!({
                "success": true,
                "message": "Statut mis à jour avec succès",
                "licence_key": req.licence_key,
                "statut": req.statut
            }))
        }
        Err(e) => {
            error!("❌ Erreur mise à jour statut: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}

/// ✅ Synchroniser une licence complète (Surya → Stardust)
pub async fn sync_licence(
    req: web::Json<serde_json::Value>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("📥 Synchronisation licence depuis Surya");
    
    // 1. Extraire les données
    let licence_key = match req["licence_key"].as_str() {
        Some(key) => key.to_string(),
        None => {
            return HttpResponse::BadRequest().json(json!({
                "success": false,
                "error": "licence_key requis"
            }))
        }
    };

    let statut = req["statut"].as_str().unwrap_or("ACTIVE").to_string();
    let date_expiration = req["date_expiration"].as_str().map(|s| s.to_string());
    let id_etablissement = req["id_etablissement"].as_str().map(|s| s.to_string());
    let type_licence = req["type_licence"].as_str().unwrap_or("EDUCATION").to_string();
    let duree = req["duree"].as_str().unwrap_or("MENSUEL").to_string();

    // 2. Vérifier si la licence existe
    let exists = match sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM licences WHERE licence_key = $1)"
    )
    .bind(&licence_key)
    .fetch_one(&**pool)
    .await {
        Ok(exists) => exists,
        Err(e) => {
            error!("❌ Erreur vérification licence: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }));
        }
    };

    let now = Utc::now().to_rfc3339();

    if exists {
        // ✅ UPDATE
        let mut query = String::from(
            "UPDATE licences SET statut = $1, updated_at = $2, synced = 1, sync_date = $3"
        );
        let mut params: Vec<String> = vec![statut.clone(), now.clone(), now.clone()];
        let mut param_count = 4;

        if let Some(exp) = date_expiration {
            query.push_str(&format!(", date_expiration = ${}", param_count));
            params.push(exp);
            param_count += 1;
        }

        if let Some(etab) = id_etablissement {
            query.push_str(&format!(", id_etablissement = ${}", param_count));
            params.push(etab);
            param_count += 1;
        }

        query.push_str(&format!(", type_licence = ${}", param_count));
        params.push(type_licence);
        param_count += 1;

        query.push_str(&format!(", duree = ${}", param_count));
        params.push(duree);

        query.push_str(&format!(" WHERE licence_key = ${}", param_count + 1));
        params.push(licence_key.clone());

        let mut query_builder = sqlx::query(&query);
        for param in params {
            query_builder = query_builder.bind(param);
        }

        if let Err(e) = query_builder.execute(&**pool).await {
            error!("❌ Erreur mise à jour licence: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }));
        }
    } else {
        // ✅ INSERT
        if let Err(e) = sqlx::query(
            r#"
            INSERT INTO licences (
                licence_id, licence_key, id_etablissement,
                type_licence, statut, date_expiration,
                activations_max, activations_utilisees,
                duree,
                created_at, updated_at, synced, sync_date
            ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 5, 0, $6, $7, $8, 1, $9)
            "#
        )
        .bind(&licence_key)
        .bind(id_etablissement.unwrap_or_else(|| "unknown".to_string()))
        .bind(&type_licence)
        .bind(&statut)
        .bind(date_expiration.unwrap_or_else(|| Utc::now().to_rfc3339()))
        .bind(&duree)
        .bind(&now)
        .bind(&now)
        .bind(&now)
        .execute(&**pool)
        .await {
            error!("❌ Erreur insertion licence: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }));
        }
    }

    info!("✅ Licence synchronisée: {}", licence_key);
    
    HttpResponse::Ok().json(json!({
        "success": true,
        "message": "Licence synchronisée",
        "licence_key": licence_key
    }))
}

// ================================================================
// ✅ NOUVEAU ENDPOINT : VALIDATION DE CHALLENGE (anti-rejeu centralisé)
// ================================================================

/// ✅ Valide un challenge (appelé par Surya pour vérifier si un challenge est déjà utilisé)
pub async fn validate_challenge(
    req: web::Json<ValidateChallengeRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("🔍 Validation challenge: {}", req.challenge);
    
    // 1. Vérifier si le challenge existe déjà dans la base centralisée
    let exists = match sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM used_challenges WHERE challenge = $1)"
    )
    .bind(&req.challenge)
    .fetch_one(&**pool)
    .await {
        Ok(exists) => exists,
        Err(e) => {
            error!("❌ Erreur vérification challenge: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "valid": false,
                "error": format!("Erreur: {}", e)
            }));
        }
    };
    
    if exists {
        warn!("⛔ Challenge déjà utilisé: {}", req.challenge);
        return HttpResponse::BadRequest().json(json!({
            "valid": false,
            "message": "Challenge déjà utilisé"
        }));
    }
    
    // 2. Marquer le challenge comme utilisé dans la base centralisée
    match sqlx::query(
        r#"
        INSERT INTO used_challenges (challenge, licence_id, device_id, source)
        VALUES ($1, $2, $3, 'surya')
        "#
    )
    .bind(&req.challenge)
    .bind(&req.licence_key)
    .bind(&req.device_id)
    .execute(&**pool)
    .await {
        Ok(_) => {
            info!("✅ Challenge validé et marqué utilisé: {}", req.challenge);
            HttpResponse::Ok().json(json!({
                "valid": true,
                "message": "Challenge validé avec succès"
            }))
        }
        Err(e) => {
            error!("❌ Erreur insertion challenge: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "valid": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}