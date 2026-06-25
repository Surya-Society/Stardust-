// src/sync/service.rs
use sqlx::{SqlitePool, PgPool};
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;
use log::{info, error};
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
            
            loop {
                interval.tick().await;
                
                info!("⏰ Sync interval triggered");
                
                match self_clone.engine.full_sync().await {
                    Ok((local, remote)) => {
                        info!("✅ Sync successful: {} ↔ {}", local, remote);
                    }
                    Err(e) => {
                        error!("❌ Sync failed: {}", e);
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

    /// ✅ Récupère le statut de la synchronisation
    pub async fn get_status(&self) -> serde_json::Value {
        let is_running = *self.is_running.lock().await;
        
        serde_json::json!({
            "is_running": is_running,
            "interval_minutes": self.interval_minutes,
        })
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