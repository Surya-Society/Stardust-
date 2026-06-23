// src/payment/mtn/client.rs

use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};  // ← AJOUTER
use serde_json::json;
use uuid::Uuid;
use base64::{Engine as _, engine::general_purpose::STANDARD as base64};
use log::{info, debug, error};
use std::sync::Arc;
use tokio::sync::Mutex;
use chrono::{Utc, Duration};  // ← AJOUTER

use super::config::MtnConfig;  // ← AJOUTER
use super::models::*;          // ← AJOUTER

// ================================================================
// TOKEN CACHE
// ================================================================

#[derive(Clone)]
pub struct TokenCache {
    pub access_token: String,
    pub expires_at: chrono::DateTime<Utc>,
}

// ================================================================
// MODÈLES CORRESPONDANT EXACTEMENT À LA DOC
// ================================================================

#[derive(Debug, Serialize, Deserialize)]  // ← AJOUTER Deserialize
pub struct RequestToPayRequest {
    pub amount: String,
    pub currency: String,
    pub externalId: String,
    pub payer: Payer,
    pub payerMessage: String,
    pub payeeNote: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]  // ← AJOUTER Deserialize + Clone
pub struct Payer {
    pub partyIdType: String,
    pub partyId: String,
}

#[derive(Debug, Deserialize)]
pub struct RequestToPayResponse {
    pub status: String,
    pub reference_id: String,
}

// ================================================================
// CLIENT MTN
// ================================================================

pub struct MtnClient {
    config: MtnConfig,
    client: Client,
    token_cache: Arc<Mutex<Option<TokenCache>>>,
}

impl MtnClient {
    pub fn new(config: MtnConfig) -> Self {
        Self {
            config,
            client: Client::new(),
            token_cache: Arc::new(Mutex::new(None)),
        }
    }

    // ================================================================
    // 1. OBTENIR LE TOKEN (Comme documenté)
    // ================================================================

    pub async fn get_token(&self) -> Result<String, MtnError> {
        // Vérifier le cache
        {
            let cache = self.token_cache.lock().await;
            if let Some(token) = cache.as_ref() {
                if token.expires_at > Utc::now() {
                    return Ok(token.access_token.clone());
                }
            }
        }

        info!("🔑 Obtaining MTN OAuth2 token...");

        let url = format!("{}/collection/token/", self.config.base_url);
        
        let credentials = format!("{}:{}", self.config.api_user, self.config.api_key);
        let auth_header = format!("Basic {}", base64::encode(credentials));

        let response = self.client
            .post(&url)
            .header("Authorization", &auth_header)
            .header("Ocp-Apim-Subscription-Key", &self.config.subscription_key)
            .send()
            .await
            .map_err(|e| MtnError::Network(e.to_string()))?;

        match response.status() {
            StatusCode::OK => {
                let data: serde_json::Value = response.json().await
                    .map_err(|e| MtnError::Parse(e.to_string()))?;
                
                let token = data["access_token"]
                    .as_str()
                    .ok_or(MtnError::MissingToken)?
                    .to_string();
                
                info!("✅ MTN token obtained");
                
                let expires_in = data["expires_in"].as_i64().unwrap_or(3600);
                let expires_at = Utc::now() + Duration::seconds(expires_in);
                let mut cache = self.token_cache.lock().await;
                *cache = Some(TokenCache {
                    access_token: token.clone(),
                    expires_at,
                });

                Ok(token)
            }
            StatusCode::UNAUTHORIZED => {
                error!("❌ Invalid API User or API Key");
                Err(MtnError::Unauthorized)
            }
            _ => {
                let error_text = response.text().await.unwrap_or_default();
                error!("❌ Token error: {}", error_text);
                Err(MtnError::ApiError(error_text))
            }
        }
    }

    // ================================================================
    // 2. DEMANDE DE PAIEMENT
    // ================================================================

    pub async fn request_to_pay(
        &self,
        amount: &str,
        currency: &str,
        external_id: &str,
        phone: &str,
        payer_message: &str,
        payee_note: &str,
    ) -> Result<RequestToPayResponse, MtnError> {
        info!("💳 Request to Pay: {} {} from {}", amount, currency, phone);

        let token = self.get_token().await?;
        let reference_id = Uuid::new_v4().to_string();

        let phone_cleaned = phone
            .replace('+', "")
            .replace(' ', "")
            .trim()
            .to_string();

        let request_body = RequestToPayRequest {
            amount: amount.to_string(),
            currency: currency.to_string(),
            externalId: external_id.to_string(),
            payer: Payer {
                partyIdType: "MSISDN".to_string(),
                partyId: phone_cleaned,
            },
            payerMessage: payer_message.to_string(),
            payeeNote: payee_note.to_string(),
        };

        debug!("📤 MTN Request: {:?}", request_body);

        let url = format!("{}/collection/v1_0/requesttopay", self.config.base_url);

        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", token))
            .header("X-Reference-Id", &reference_id)
            .header("X-Target-Environment", &self.config.environment)
            .header("Ocp-Apim-Subscription-Key", &self.config.subscription_key)
            .header("Content-Type", "application/json")
            .header("Cache-Control", "no-cache")
            .json(&request_body)
            .send()
            .await
            .map_err(|e| MtnError::Network(e.to_string()))?;

        match response.status() {
            StatusCode::ACCEPTED => {
                info!("✅ Payment request accepted (ref: {})", reference_id);
                
                Ok(RequestToPayResponse {
                    status: "PENDING".to_string(),
                    reference_id,
                })
            }
            StatusCode::BAD_REQUEST => {
                let error_data: serde_json::Value = response.json().await.unwrap_or_default();
                let message = error_data["message"]
                    .as_str()
                    .unwrap_or("Invalid request")
                    .to_string();
                error!("❌ Bad request: {}", message);
                Err(MtnError::BadRequest(message))
            }
            StatusCode::CONFLICT => {
                error!("❌ Reference ID already used");
                Err(MtnError::DuplicateReference)
            }
            StatusCode::INTERNAL_SERVER_ERROR => {
                error!("❌ MTN Internal Server Error");
                Err(MtnError::InternalServerError)
            }
            _ => {
                let error_text = response.text().await.unwrap_or_default();
                error!("❌ Request to Pay failed: {}", error_text);
                Err(MtnError::ApiError(error_text))
            }
        }
    }

    // ================================================================
    // 3. VÉRIFICATION DU STATUT
    // ================================================================

    pub async fn get_payment_status(
        &self,
        reference_id: &str,
    ) -> Result<PaymentStatusResponse, MtnError> {
        debug!("🔍 Checking payment status for: {}", reference_id);

        let token = self.get_token().await?;

        let url = format!(
            "{}/collection/v1_0/requesttopay/{}",
            self.config.base_url,
            reference_id
        );

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", token))
            .header("X-Target-Environment", &self.config.environment)
            .header("Ocp-Apim-Subscription-Key", &self.config.subscription_key)
            .send()
            .await
            .map_err(|e| MtnError::Network(e.to_string()))?;

        match response.status() {
            StatusCode::OK => {
                let data: serde_json::Value = response.json().await
                    .map_err(|e| MtnError::Parse(e.to_string()))?;
                
                let status = data["status"]
                    .as_str()
                    .unwrap_or("PENDING")
                    .to_string();
                
                Ok(PaymentStatusResponse {
                    status,
                    amount: data["amount"].as_str().unwrap_or("0").to_string(),
                    currency: data["currency"].as_str().unwrap_or("XOF").to_string(),
                    payer: Payer {
                        partyIdType: data["payer"]["partyIdType"]
                            .as_str()
                            .unwrap_or("MSISDN")
                            .to_string(),
                        partyId: data["payer"]["partyId"]
                            .as_str()
                            .unwrap_or("")
                            .to_string(),
                    },
                    external_id: data["externalId"].as_str().map(|s| s.to_string()),
                    financial_transaction_id: data["financialTransactionId"]
                        .as_str()
                        .map(|s| s.to_string()),
                    reason: data["reason"].as_str().map(|s| s.to_string()),
                })
            }
            StatusCode::NOT_FOUND => {
                Err(MtnError::NotFound)
            }
            _ => {
                let error_text = response.text().await.unwrap_or_default();
                Err(MtnError::ApiError(error_text))
            }
        }
    }

    // ================================================================
    // 4. GESTION DU CALLBACK
    // ================================================================

    pub async fn handle_callback(
        &self,
        payload: &serde_json::Value,
    ) -> Result<serde_json::Value, MtnError> {
        info!("📨 MTN Callback received");
        debug!("📥 Callback data: {:?}", payload);
        
        // TODO: Traiter le callback (mettre à jour la transaction en base)
        
        Ok(payload.clone())
    }
}

// ================================================================
// ERRORS
// ================================================================

#[derive(Debug, thiserror::Error)]
pub enum MtnError {
    #[error("Network error: {0}")]
    Network(String),
    
    #[error("Unauthorized - Invalid API User or API Key")]
    Unauthorized,
    
    #[error("Bad request: {0}")]
    BadRequest(String),
    
    #[error("Reference ID already used (409 Conflict)")]
    DuplicateReference,
    
    #[error("Payment not found")]
    NotFound,
    
    #[error("MTN Internal Server Error")]
    InternalServerError,
    
    #[error("API error: {0}")]
    ApiError(String),
    
    #[error("Missing token in response")]
    MissingToken,
    
    #[error("Parse error: {0}")]
    Parse(String),
}

// ================================================================
// RÉPONSE DE STATUT
// ================================================================

#[derive(Debug, Deserialize)]
pub struct PaymentStatusResponse {
    pub status: String,
    pub amount: String,
    pub currency: String,
    pub payer: Payer,
    pub external_id: Option<String>,
    pub financial_transaction_id: Option<String>,
    pub reason: Option<String>,
}