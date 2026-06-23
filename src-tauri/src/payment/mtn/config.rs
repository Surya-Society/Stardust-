// src/payment/mtn/config.rs

use serde::Deserialize;
use dotenv::dotenv;
use std::env;

#[derive(Debug, Clone, Deserialize)]
pub struct MtnConfig {
    pub base_url: String,
    pub subscription_key: String,
    pub api_user: String,
    pub api_key: String,
    pub environment: String,
    pub callback_url: String,
    pub timeout_seconds: u64,
}

impl MtnConfig {
    pub fn from_env() -> Result<Self, String> {
        dotenv().ok();
        
        let environment = env::var("MTN_ENVIRONMENT").unwrap_or_else(|_| "sandbox".to_string());
        
        // ✅ CORRECTION : Lire les URLs depuis .env
        let base_url = match environment.as_str() {
            "production" => env::var("MTN_BASE_URL_PRODUCTION")
                .unwrap_or_else(|_| "https://api.mtn.com".to_string()),
            _ => env::var("MTN_BASE_URL_SANDBOX")
                .unwrap_or_else(|_| "https://sandbox.momodeveloper.mtn.com".to_string()),
        };

        let subscription_key = env::var("MTN_SUBSCRIPTION_KEY")
            .map_err(|_| "MTN_SUBSCRIPTION_KEY must be set in .env".to_string())?;
        
        let api_user = env::var("MTN_API_USER")
            .map_err(|_| "MTN_API_USER must be set in .env".to_string())?;
        
        let api_key = env::var("MTN_API_KEY")
            .map_err(|_| "MTN_API_KEY must be set in .env".to_string())?;

        // ✅ CORRECTION : Supprimer les espaces autour des valeurs
        let subscription_key = subscription_key.trim().to_string();
        let api_user = api_user.trim().to_string();
        let api_key = api_key.trim().to_string();

        let callback_url = env::var("MTN_CALLBACK_URL")
            .unwrap_or_else(|_| "https://localhost:8080/webhooks/mtn".to_string());

        let timeout_seconds = env::var("MTN_TIMEOUT_SECONDS")
            .unwrap_or_else(|_| "600".to_string())
            .parse()
            .unwrap_or(600);

        let config = Self {
            base_url,
            subscription_key,
            api_user,
            api_key,
            environment,
            callback_url,
            timeout_seconds,
        };

        config.validate()?;
        
        Ok(config)
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.subscription_key.is_empty() {
            return Err("MTN_SUBSCRIPTION_KEY is empty".to_string());
        }
        if self.api_user.is_empty() {
            return Err("MTN_API_USER is empty".to_string());
        }
        if self.api_key.is_empty() {
            return Err("MTN_API_KEY is empty".to_string());
        }
        if !["sandbox", "production"].contains(&self.environment.as_str()) {
            return Err("MTN_ENVIRONMENT must be 'sandbox' or 'production'".to_string());
        }
        Ok(())
    }
}