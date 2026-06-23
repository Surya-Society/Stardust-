// src/payment/airtel/mod.rs

pub mod config;
pub mod models;
pub mod client;

pub use config::AirtelConfig;
pub use models::*;
pub use client::AirtelClient;

// Version simplifiée pour l'instant
// À compléter plus tard avec la vraie intégration Airtel