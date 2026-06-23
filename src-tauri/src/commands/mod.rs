// src/commands/mod.rs

pub mod licence;
pub mod abonnement; 
pub mod paiement;   
pub mod offre; 

// Ré-export des commandes
pub use licence::*;
pub use abonnement::*;
pub use paiement::*;
pub use offre::*;