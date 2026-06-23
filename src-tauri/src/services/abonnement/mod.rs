// src/services/abonnement/mod.rs

pub mod service;
pub mod scheduler;

pub use service::AbonnementService;
pub use scheduler::start_scheduler;

use sqlx::PgPool;
use anyhow::Result;
use std::sync::Arc;

pub async fn init_abonnement_service(pool: PgPool) -> Result<Arc<AbonnementService>> {
    Ok(Arc::new(AbonnementService::new(pool)))
}