// src/database/local/repositories/mod.rs
pub mod licence;
pub mod etablissement;  // ✅ AJOUTER
pub mod abonnement;     // ✅ AJOUTER
pub mod offre;          // ✅ AJOUTER

// ✅ Ré-export de TOUS les repositories
pub use licence::*;
pub use etablissement::*;
pub use abonnement::*;
pub use offre::*;