// src/payment/airtel/client.rs

use reqwest::{Client, StatusCode};
use serde_json::json;
use log::{info, debug, error};
use std::sync::Arc;
use tokio::sync::Mutex;
use chrono::{Utc, Duration};

use super::config::AirtelConfig;
use super::models::*;

pub struct AirtelClient {
    config: AirtelConfig,
    client: Client,
    token_cache: Arc<Mutex<Option<AirtelTokenCache>>>,
}

#[derive(Clone)]
pub struct AirtelTokenCache {
    pub access_token: String,
    pub expires_at: chrono::DateTime<Utc>,
}

impl AirtelClient {
    pub fn new(config: AirtelConfig) -> Self {
        Self {
            config,
            client: Client::new(),
            token_cache: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn get_token(&self) -> Result<String, AirtelErrorType> {
        {
            let cache = self.token_cache.lock().await;
            if let Some(token) = cache.as_ref() {
                if token.expires_at > Utc::now() {
                    return Ok(token.access_token.clone());
                }
            }
        }

        info!("🔑 Obtaining Airtel OAuth2 token...");

        let url = format!("{}/auth/oauth2/token", self.config.base_url);

        let response = self.client
            .post(&url)
            .json(&json!({
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
                "grant_type": "client_credentials"
            }))
            .send()
            .await
            .map_err(|_| AirtelErrorType::InternalServerError)?;

        match response.status() {
            StatusCode::OK => {
                let data: serde_json::Value = response.json()
                    .await
                    .map_err(|_| AirtelErrorType::InternalServerError)?;
                
                let token = data["access_token"]
                    .as_str()
                    .ok_or(AirtelErrorType::InvalidCredentials)?
                    .to_string();
                
                let expires_in = data["expires_in"].as_i64().unwrap_or(3600);
                let expires_at = Utc::now() + Duration::seconds(expires_in);
                
                let mut cache = self.token_cache.lock().await;
                *cache = Some(AirtelTokenCache {
                    access_token: token.clone(),
                    expires_at,
                });

                info!("✅ Airtel token obtained");
                Ok(token)
            }
            StatusCode::UNAUTHORIZED => {
                error!("❌ Invalid Airtel credentials");
                Err(AirtelErrorType::InvalidCredentials)
            }
            _ => {
                let error_text = response.text().await.unwrap_or_default();
                error!("❌ Airtel token error: {}", error_text);
                Err(AirtelErrorType::InternalServerError)
            }
        }
    }

    // Version simplifiée - à compléter plus tard
    pub async fn handle_callback(&self, payload: &serde_json::Value) -> Result<(), AirtelErrorType> {
        info!("📨 Airtel Callback received");
        debug!("📥 Callback data: {:?}", payload);
        Ok(())
    }
}