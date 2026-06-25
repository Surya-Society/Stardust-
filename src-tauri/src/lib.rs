#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod commands;
pub mod crypto;
pub mod database;
pub mod models;
pub mod services;
pub mod utils;
pub mod payment;
pub mod sync;
pub mod api;

use tauri::Manager;
use log::{info, error};
use dotenv::dotenv;
use std::sync::Arc;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();
    
    info!("🚀 Starting Stardust application...");
    
    std::panic::set_hook(Box::new(|panic_info| {
        eprintln!("🔥 PANIC: {}", panic_info);
        if let Some(location) = panic_info.location() {
            eprintln!("📍 Fichier: {}:{}", location.file(), location.line());
        }
    }));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(if cfg!(debug_assertions) { 
                    log::LevelFilter::Info 
                } else { 
                    log::LevelFilter::Warn 
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            // ---- LICENCES ----
            commands::licence::export_licence_key,
            commands::licence::get_all_licences,
            commands::licence::get_licence_by_id,
            commands::licence::create_licence,
            commands::licence::update_licence,
            commands::licence::revoke_licence,
            commands::licence::suspend_licence,
            commands::licence::reactivate_licence,
            commands::licence::get_licence_stats,
            commands::licence::create_test_licence,
            
            // ---- ABONNEMENTS ----
            commands::abonnement::get_all_abonnements,
            commands::abonnement::get_abonnement_by_id,
            commands::abonnement::create_abonnement,
            commands::abonnement::update_abonnement,
            commands::abonnement::annuler_abonnement,
            commands::abonnement::renouveler_abonnement,
            commands::abonnement::get_abonnement_stats,
            
            // ---- OFFRES ----
            commands::offre::get_all_offres,
            commands::offre::get_offre_by_id,
            commands::offre::create_offre,
            commands::offre::update_offre,
            commands::offre::delete_offre,
            commands::offre::get_offre_stats,
            commands::offre::get_offres_publiques,
            
            // ---- PAIEMENTS ----
            commands::paiement::initier_paiement,
            commands::paiement::verifier_paiement,
            commands::paiement::get_historique_paiements,
            commands::paiement::annuler_paiement,
            commands::paiement::get_paiement_stats,
            commands::paiement::webhook_mtn,
            commands::paiement::webhook_airtel,
            
            // ---- ÉTABLISSEMENTS ----
            commands::etablissement::get_all_etablissements,
            commands::etablissement::force_sync_etablissements,
            
            // ---- STATUT ----
            get_app_status,
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // ✅ Démarrer l'API HTTP dans un thread séparé
            std::thread::spawn(move || {
                let rt = actix_rt::System::new();
                rt.block_on(async {
                    // 1. Charger la configuration MTN
                    let mtn_config = match payment::mtn::MtnConfig::from_env() {
                        Ok(config) => {
                            info!("✅ MTN configuration loaded");
                            Some(config)
                        }
                        Err(e) => {
                            error!("❌ MTN configuration error: {}", e);
                            None
                        }
                    };

                    // 2. Initialiser SQLite (cache local)
                    match database::connection::init_sqlite_pool(&app_handle).await {
                        Ok(pool) => {
                            info!("✅ Local database connected");
                            
                            // Exécuter les migrations SQLite
                            match sqlx::migrate!("./migrations/sqlite").run(&pool).await {
                                Ok(_) => info!("✅ SQLite migrations executed"),
                                Err(e) => error!("❌ SQLite migrations failed: {}", e),
                            }
                            
                            // ✅ Gérer le pool SQLite
                            app_handle.manage(pool.clone());
                            
                            // 3. Initialiser PostgreSQL (base en ligne)
                            match database::connection::init_pg_pool().await {
                                Ok(pg_pool) => {
                                    info!("✅ PostgreSQL connected");
                                    
                                    // Exécuter les migrations PostgreSQL
                                    match sqlx::migrate!("./migrations/postgres").run(&pg_pool).await {
                                        Ok(_) => info!("✅ PostgreSQL migrations executed"),
                                        Err(e) => error!("❌ PostgreSQL migrations failed: {}", e),
                                    }
                                    
                                    // ✅ Gérer le pool PostgreSQL
                                    app_handle.manage(pg_pool.clone());
                                    
                                    // 4. ✅ Initialiser le service de paiement
                                    match payment::init_payment_service(
                                        pool.clone(), 
                                        pg_pool.clone(), 
                                        mtn_config, 
                                        None
                                    ).await {
                                        Ok(payment_service) => {
                                            info!("✅ Payment service initialized");
                                            
                                            // ✅ payment_service est DÉJÀ Arc<PaymentService>
                                            let payment_service = payment_service;
                                            
                                            // 5. ✅ Démarrer l'API HTTP (pour Surya)
                                            info!("🚀 Starting Stardust API on port 8080...");
                                            let pg_pool_clone = pg_pool.clone();
                                            let payment_service_clone = payment_service.clone();
                                            
                                            actix_rt::spawn(async move {
                                                if let Err(e) = api::start_api(pg_pool_clone, payment_service_clone).await {
                                                    error!("❌ API server error: {}", e);
                                                }
                                            });
                                            
                                            // Garder payment_service dans la portée
                                            let _ = payment_service;
                                        }
                                        Err(e) => {
                                            error!("❌ Payment service init failed: {}", e);
                                        }
                                    }
                                    
                                    // 6. Initialiser le service de synchronisation (SQLite ↔ PostgreSQL)
                                    match sync::init_sync_service(pool.clone(), pg_pool.clone()).await {
                                        Ok(sync_service) => {
                                            info!("✅ Sync service initialized");
                                            
                                            let sync_service_clone = sync_service.clone();
                                            
                                            // ✅ CORRIGÉ : start_sync_loop ne prend pas d'argument
                                            tauri::async_runtime::spawn(async move {
                                                sync_service_clone.start_sync_loop().await;
                                            });
                                            
                                            let _ = sync_service;
                                        }
                                        Err(e) => {
                                            error!("❌ Sync service init failed: {}", e);
                                        }
                                    }
                                    
                                    // 7. ✅ Initialiser le service des offres
                                    match services::offre::init_offre_service(pg_pool.clone()).await {
                                        Ok(offre_service) => {
                                            info!("✅ Offre service initialized");
                                            let _ = offre_service;
                                        }
                                        Err(e) => {
                                            error!("❌ Offre service init failed: {}", e);
                                        }
                                    }
                                    
                                    // 8. ✅ Démarrer le scheduler (vérification des expirations)
                                    match services::abonnement::init_abonnement_service(pg_pool.clone()).await {
                                        Ok(abonnement_service) => {
                                            info!("🕐 Starting expiration scheduler...");
                                            tauri::async_runtime::spawn(async move {
                                                services::abonnement::start_scheduler(abonnement_service).await;
                                            });
                                        }
                                        Err(e) => {
                                            error!("❌ Abonnement service init failed: {}", e);
                                        }
                                    }
                                    
                                    // ============================================================
                                    // ✅ 9. AJOUT : SERVICE DE SYNCHRONISATION DES ÉTABLISSEMENTS (API)
                                    // ============================================================
                                    // Le service de synchronisation des établissements est déjà
                                    // dans l'API via api::etablissement::sync_etablissement
                                    // Cette route est exposée sur /api/v1/etablissements/sync
                                    info!("✅ Établissement sync API endpoint available at /api/v1/etablissements/sync");
                                    
                                    info!("✅ All services initialized");
                                }
                                Err(e) => {
                                    error!("❌ PostgreSQL connection failed: {}", e);
                                    info!("📡 Running in offline mode (cache only)");
                                }
                            }
                        }
                        Err(e) => {
                            error!("❌ Local database connection failed: {}", e);
                        }
                    }
                });
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn get_app_status() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "status": "running",
        "version": env!("CARGO_PKG_VERSION"),
        "mode": "stardust_admin",
        "features": {
            "payment": true,
            "sync": true,
            "licences": true,
            "abonnements": true,
            "offres": true,
            "mtn": true,
            "airtel": true,
            "api": true,
            "etablissements": true
        }
    }))
}