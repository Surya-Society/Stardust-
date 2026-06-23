// src/services/offre/mod.rs

pub mod service;

pub use service::OffreService;

use sqlx::PgPool;
use anyhow::Result;
use std::sync::Arc;

pub async fn init_offre_service(pool: PgPool) -> Result<Arc<OffreService>> {
    Ok(Arc::new(OffreService::new(pool)))
}