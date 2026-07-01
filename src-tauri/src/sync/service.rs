// src/sync/service.rs
use sqlx::{SqlitePool, PgPool};
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;
use log::{info, error, warn};
use anyhow::Result;

use crate::sync::engine::SyncEngine;

pub struct SyncService {
    engine: Arc<SyncEngine>,
    is_running: Arc<Mutex<bool>>,
    interval_minutes: u64,
}

impl SyncService {
    pub fn new(local: SqlitePool, remote: PgPool, interval_minutes: u64) -> Self {
        let engine = Arc::new(SyncEngine::new(local, remote));
        
        Self {
            engine,
            is_running: Arc::new(Mutex::new(false)),
            interval_minutes,
        }
    }

    /// ✅ Démarre la boucle de synchronisation périodique
    /// ✅ CORRIGÉ: Ajout d'un backoff exponentiel en cas d'erreur
    pub async fn start_sync_loop(&self) {
        let mut is_running = self.is_running.lock().await;
        if *is_running {
            info!("⚠️ Sync loop already running");
            return;
        }
        *is_running = true;
        drop(is_running);

        info!("🔄 Starting sync loop (every {} min)", self.interval_minutes);
        
        let self_clone = self.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(
                Duration::from_secs(self_clone.interval_minutes * 60)
            );
            
            // ✅ Backoff exponentiel en cas d'erreur
            let mut backoff_seconds = 5;
            const MAX_BACKOFF_SECONDS: u64 = 300; // 5 minutes max
            
            loop {
                interval.tick().await;
                
                info!("⏰ Sync interval triggered");
                
                match self_clone.engine.full_sync().await {
                    Ok((uploaded, downloaded)) => {
                        info!("✅ Sync successful: {} uploadés, {} downloadés", uploaded, downloaded);
                        // ✅ Réinitialiser le backoff en cas de succès
                        backoff_seconds = 5;
                    }
                    Err(e) => {
                        error!("❌ Sync failed: {}", e);
                        
                        // ✅ Backoff exponentiel
                        warn!("⏳ Attente de {} secondes avant de réessayer...", backoff_seconds);
                        tokio::time::sleep(Duration::from_secs(backoff_seconds)).await;
                        
                        // ✅ Augmenter le backoff (double, jusqu'au max)
                        backoff_seconds = std::cmp::min(backoff_seconds * 2, MAX_BACKOFF_SECONDS);
                    }
                }
            }
        });
    }

    /// ✅ Force une synchronisation immédiate
    pub async fn force_sync(&self) -> Result<(usize, usize)> {
        info!("🔄 Force sync triggered");
        self.engine.full_sync().await
    }

    /// ✅ Synchronise uniquement les établissements
    pub async fn sync_etablissements(&self) -> Result<usize> {
        info!("🏫 Synchronisation des établissements uniquement");
        self.engine.sync_etablissements_local_to_remote().await
    }

    /// ✅ Synchronise uniquement les licences
    pub async fn sync_licences(&self) -> Result<usize> {
        info!("🔑 Synchronisation des licences uniquement");
        self.engine.sync_licences_local_to_remote().await
    }

    /// ✅ Synchronise uniquement les abonnements
    pub async fn sync_abonnements(&self) -> Result<usize> {
        info!("📋 Synchronisation des abonnements uniquement");
        self.engine.sync_abonnements_local_to_remote().await
    }

    /// ✅ Récupère le statut de la synchronisation
    pub async fn get_status(&self) -> serde_json::Value {
        let is_running = *self.is_running.lock().await;
        
        // ✅ Récupérer les modifications en attente
        let pending = match self.engine.get_pending_changes().await {
            Ok(count) => count,
            Err(e) => {
                error!("❌ Erreur récupération des modifications en attente: {}", e);
                0
            }
        };
        
        serde_json::json!({
            "is_running": is_running,
            "interval_minutes": self.interval_minutes,
            "pending_changes": pending,
            "status": if is_running { "running" } else { "stopped" },
        })
    }

    /// ✅ Arrête la boucle de synchronisation
    pub async fn stop_sync_loop(&self) {
        let mut is_running = self.is_running.lock().await;
        if *is_running {
            *is_running = false;
            info!("⏹️ Sync loop stopped");
        } else {
            info!("⚠️ Sync loop already stopped");
        }
    }

    /// ✅ Vérifie si la synchronisation est en cours
    pub async fn is_running(&self) -> bool {
        *self.is_running.lock().await
    }
}

impl Clone for SyncService {
    fn clone(&self) -> Self {
        Self {
            engine: self.engine.clone(),
            is_running: self.is_running.clone(),
            interval_minutes: self.interval_minutes,
        }
    }
}