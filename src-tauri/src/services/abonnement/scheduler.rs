// src/services/abonnement/scheduler.rs

use std::sync::Arc;
use tokio::time;
use log::{info, error};

use super::service::AbonnementService;

pub async fn start_scheduler(abonnement_service: Arc<AbonnementService>) {
    info!("🕐 Démarrage du scheduler de vérification des licences");
    
    loop {
        time::sleep(time::Duration::from_secs(6 * 3600)).await;
        
        match abonnement_service.verifier_licences_expirees().await {
            Ok(expirations) => {
                if !expirations.is_empty() {
                    info!("⛔ {} licences expirées automatiquement", expirations.len());
                }
            }
            Err(e) => {
                error!("❌ Erreur lors de la vérification: {}", e);
            }
        }
    }
}