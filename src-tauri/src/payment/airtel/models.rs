// src/payment/airtel/models.rs

use serde::{Deserialize, Serialize};

// ================================================================
// REQUÊTES
// ================================================================

#[derive(Debug, Serialize)]
pub struct AirtelPaymentRequest {
    pub reference: String,
    pub amount: f64,
    pub phone: String,
    pub description: String,
    pub country: String,
    pub currency: String,
    pub callback_url: String,
}

// ================================================================
// RÉPONSES
// ================================================================

#[derive(Debug, Deserialize)]
pub struct AirtelPaymentResponse {
    pub reference: String,
    pub status: String,
    pub message: String,
    pub data: Option<AirtelPaymentData>,
}

#[derive(Debug, Deserialize)]
pub struct AirtelPaymentData {
    pub transaction_id: String,
    pub amount: f64,
    pub currency: String,
    pub phone: String,
    pub status: String,
}

// ================================================================
// ERRORS
// ================================================================

#[derive(Debug, thiserror::Error)]
pub enum AirtelErrorType {
    #[error("Invalid client ID or secret")]
    InvalidCredentials,
    
    #[error("Invalid amount: {0}")]
    InvalidAmount(String),
    
    #[error("Internal server error")]
    InternalServerError,
    
    #[error("Timeout error")]
    Timeout,
    
    #[error("Callback error: {0}")]
    CallbackError(String),
}