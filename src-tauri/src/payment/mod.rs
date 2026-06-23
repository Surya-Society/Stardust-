// src/payment/mod.rs

pub mod mtn;
pub mod airtel;
pub mod service;
pub mod processor;
pub mod sync;

pub use mtn::MtnClient;
pub use mtn::MtnConfig;
pub use airtel::AirtelClient;
pub use airtel::AirtelConfig;
pub use service::PaymentService;
pub use processor::PaymentProcessor;

use sqlx::{SqlitePool, PgPool};
use anyhow::Result;
use std::sync::Arc;

pub async fn init_payment_service(
    sqlite_pool: SqlitePool,
    pg_pool: PgPool,
    mtn_config: Option<mtn::MtnConfig>,
    airtel_config: Option<airtel::AirtelConfig>,
) -> Result<Arc<PaymentService>> {
    let service = PaymentService::new(sqlite_pool, pg_pool, mtn_config, airtel_config);
    Ok(Arc::new(service))
}