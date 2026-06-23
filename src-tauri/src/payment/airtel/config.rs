// src/payment/airtel/config.rs

use serde::Deserialize;
use dotenv::dotenv;
use std::env;

#[derive(Debug, Clone, Deserialize)]
pub struct AirtelConfig {
    pub base_url: String,
    pub client_id: String,
    pub client_secret: String,
    pub country: String,
    pub currency: String,
    pub callback_url: String,
    pub timeout_seconds: u64,
}

impl AirtelConfig {
    pub fn from_env() -> Result<Self, String> {
        dotenv().ok();
        
        let base_url = env::var("AIRTELL_BASE_URL")
            .unwrap_or_else(|_| "https://openapiuat.airtel.africa".to_string());

        let client_id = env::var("AIRTELL_CLIENT_ID")
            .map_err(|_| "AIRTELL_CLIENT_ID must be set in .env".to_string())?;
        
        let client_secret = env::var("AIRTELL_CLIENT_SECRET")
            .map_err(|_| "AIRTELL_CLIENT_SECRET must be set in .env".to_string())?;

        let country = env::var("AIRTELL_COUNTRY")
            .unwrap_or_else(|_| "CI".to_string());

        let currency = env::var("AIRTELL_CURRENCY")
            .unwrap_or_else(|_| "XOF".to_string());

        let callback_url = env::var("AIRTELL_CALLBACK_URL")
            .unwrap_or_else(|_| "https://localhost:8080/webhooks/airtel".to_string());

        let timeout_seconds = env::var("AIRTELL_TIMEOUT_SECONDS")
            .unwrap_or_else(|_| "600".to_string())
            .parse()
            .unwrap_or(600);

        let config = Self {
            base_url,
            client_id,
            client_secret,
            country,
            currency,
            callback_url,
            timeout_seconds,
        };

        config.validate()?;
        
        Ok(config)
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.client_id.is_empty() {
            return Err("AIRTELL_CLIENT_ID is empty".to_string());
        }
        if self.client_secret.is_empty() {
            return Err("AIRTELL_CLIENT_SECRET is empty".to_string());
        }
        Ok(())
    }
}