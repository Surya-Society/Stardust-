// src/payment/service.rs
use sqlx::{SqlitePool, PgPool};
use std::sync::Arc;
use crate::payment::mtn::MtnClient;
use crate::payment::mtn::MtnConfig;
use crate::payment::airtel::AirtelClient;
use crate::payment::airtel::AirtelConfig;

pub struct PaymentService {
    pub sqlite_pool: SqlitePool,
    pub pg_pool: PgPool,
    pub mtn_client: Option<MtnClient>,
    pub airtel_client: Option<AirtelClient>,
}

impl PaymentService {
    pub fn new(
        sqlite_pool: SqlitePool,
        pg_pool: PgPool,
        mtn_config: Option<MtnConfig>,
        airtel_config: Option<AirtelConfig>,
    ) -> Self {
        let mtn_client = mtn_config.map(MtnClient::new);
        let airtel_client = airtel_config.map(AirtelClient::new);
        
        Self {
            sqlite_pool,
            pg_pool,
            mtn_client,
            airtel_client,
        }
    }
}