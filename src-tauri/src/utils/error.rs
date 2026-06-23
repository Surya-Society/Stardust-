// src/utils/error.rs
use thiserror::Error;
use serde::Serialize;

#[derive(Debug, Error, Serialize, Clone)]
pub enum AppError {
    #[error("Erreur de base de données: {0}")]
    Database(String),
    
    #[error("Erreur de cryptographie: {0}")]
    Crypto(String),
    
    #[error("Licence non trouvée: {0}")]
    NotFound(String),
    
    #[error("Erreur de validation: {0}")]
    Validation(String),
    
    #[error("Erreur interne: {0}")]
    Internal(String),
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::Database(err.to_string())
    }
}

impl From<Box<dyn std::error::Error>> for AppError {
    fn from(err: Box<dyn std::error::Error>) -> Self {
        AppError::Internal(err.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;