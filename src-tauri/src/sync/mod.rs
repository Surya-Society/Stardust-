// src/sync/mod.rs

pub mod service;
pub mod engine;

pub use service::SyncService;
pub use engine::SyncEngine;

use sqlx::{SqlitePool, PgPool};
use anyhow::Result;
use std::sync::Arc;

pub async fn init_sync_service(
    sqlite_pool: SqlitePool,
    pg_pool: PgPool,
) -> Result<Arc<SyncService>> {
    let service = SyncService::new(sqlite_pool, pg_pool);
    Ok(Arc::new(service))
}