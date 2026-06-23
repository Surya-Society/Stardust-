// src/sync/service.rs

use sqlx::{SqlitePool, PgPool};
use log::info;

pub struct SyncService {
    sqlite_pool: SqlitePool,
    pg_pool: PgPool,
}

impl SyncService {
    pub fn new(sqlite_pool: SqlitePool, pg_pool: PgPool) -> Self {
        Self { sqlite_pool, pg_pool }
    }
    
    pub async fn start_sync_loop(&self) {
        info!("🔄 Sync service started");
        // À implémenter plus tard
    }
}