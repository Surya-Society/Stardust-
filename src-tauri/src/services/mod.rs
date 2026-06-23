// src/services/mod.rs

pub mod licence_service;
pub mod offre;
pub mod abonnement;

pub use licence_service::LicenceService;
pub use offre::OffreService;
pub use abonnement::AbonnementService;