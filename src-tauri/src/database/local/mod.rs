// src/database/local/mod.rs
pub mod repositories;

// ✅ Ré-export de TOUS les repositories
pub use repositories::licence as licence_repo;
pub use repositories::etablissement as etablissement_repo;  // ✅ AJOUTER
pub use repositories::abonnement as abonnement_repo;        // ✅ AJOUTER
pub use repositories::offre as offre_repo;                  // ✅ AJOUTER