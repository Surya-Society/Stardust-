// src/payment/mtn/models.rs
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

// ================================================================
// REQUÊTES
// ================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateApiUserRequest {
    pub provider_callback_host: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestToPayRequest {
    pub amount: String,
    pub currency: String,
    pub external_id: String,
    pub payer: PayerInfo,
    pub payer_message: String,
    pub payee_note: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PayerInfo {
    pub party_id_type: String,
    pub party_id: String,
}

// ================================================================
// RÉPONSES
// ================================================================

#[derive(Debug, Deserialize)]
pub struct CreateApiUserResponse {
    pub api_key: String,
}

#[derive(Debug, Deserialize)]
pub struct TokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
}

#[derive(Debug, Deserialize)]
pub struct RequestToPayResponse {
    pub status: String,
    pub reference_id: String,
}

#[derive(Debug, Deserialize)]
pub struct PaymentStatusResponse {
    pub status: PaymentStatus,
    pub amount: String,
    pub currency: String,
    pub payer: PayerInfo,
    pub external_id: Option<String>,
    pub financial_transaction_id: Option<String>,
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "UPPERCASE")]
pub enum PaymentStatus {
    Pending,
    Successful,
    Failed,
    Timeout,
}

// ================================================================
// CALLBACK
// ================================================================

#[derive(Debug, Deserialize)]
pub struct MtnCallbackPayload {
    pub transaction_id: String,
    pub status: String,
    pub amount: String,
    pub currency: String,
    pub payer: PayerInfo,
    pub external_id: String,
    pub financial_transaction_id: Option<String>,
    pub reason: Option<String>,
}

// ================================================================
// ERRORS
// ================================================================

#[derive(Debug, Deserialize)]
pub struct MtnError {
    pub code: String,
    pub message: String,
    pub reference_id: Option<String>,
}

#[derive(Debug, thiserror::Error)]
pub enum MtnErrorType {
    #[error("Invalid subscription key")]
    InvalidSubscriptionKey,
    
    #[error("Invalid API user or key")]
    InvalidApiUser,
    
    #[error("Invalid amount: {0}")]
    InvalidAmount(String),
    
    #[error("Payer not found: {0}")]
    PayerNotFound(String),
    
    #[error("Internal server error")]
    InternalServerError,
    
    #[error("Timeout error")]
    Timeout,
    
    #[error("Callback error: {0}")]
    CallbackError(String),
}