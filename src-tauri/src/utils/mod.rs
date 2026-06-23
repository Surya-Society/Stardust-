// src/utils/mod.rs
//! Utilitaires de l'application

pub mod logger;
pub mod error;

pub use logger::init_logger;
pub use error::AppError;