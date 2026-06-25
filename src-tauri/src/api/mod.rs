// src/api/mod.rs (STARDUST)
pub mod paiement;
pub mod licence;
pub mod offre;
pub mod webhook;
pub mod auth;
pub mod etablissement;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware::Logger};
use sqlx::PgPool;
use log::info;
use std::sync::Arc;

use crate::payment::service::PaymentService;

pub async fn start_api(
    pool: PgPool,
    payment_service: Arc<PaymentService>, 
) -> std::io::Result<()> {
    info!("🚀 Starting Stardust API on port 8080...");
    
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(payment_service.clone()))
            .service(
                web::scope("/api/v1")
                    // Auth
                    .route("/auth/verify", web::post().to(auth::verify_api_key))
                    
                    // Paiements
                    .route("/paiements/initier", web::post().to(paiement::initier))
                    .route("/paiements/verifier/{id}", web::get().to(paiement::verifier))
                    
                    // Licences
                    .route("/licences/statut/{key}", web::get().to(licence::get_statut))
                    .route("/licences/activer", web::post().to(licence::activer))
                    .route("/licences/status", web::put().to(licence::update_licence_status))  // ✅ AJOUTER
                    .route("/licences/sync", web::post().to(licence::sync_licence))  // ✅ AJOUTER
                    
                    // Offres
                    .route("/offres/publiques", web::get().to(offre::get_publiques))
                    .route("/offres/{id}", web::get().to(offre::get_by_id))
                    
                    // Établissements
                    .route("/etablissements/sync", web::post().to(etablissement::sync_etablissement))
                    
                    // Webhooks
                    .route("/webhooks/mtn", web::post().to(webhook::mtn))
                    .route("/webhooks/airtel", web::post().to(webhook::airtel))
                    // src/api/mod.rs (Stardust)
                    .route("/licences/validate-challenge", web::post().to(licence::validate_challenge))
            )
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}