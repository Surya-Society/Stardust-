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
    let service = SyncService::new(sqlite_pool, pg_pool, 60);
    Ok(Arc::new(service))
}

pub async fn init_sync_service_with_interval(
    sqlite_pool: SqlitePool,
    pg_pool: PgPool,
    interval_minutes: u64,
) -> Result<Arc<SyncService>> {
    let service = SyncService::new(sqlite_pool, pg_pool, interval_minutes);
    Ok(Arc::new(service))
}