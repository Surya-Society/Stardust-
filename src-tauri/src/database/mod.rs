// src/database/mod.rs
pub mod connection;
pub mod local;
pub mod remote;

// Ré-export des fonctions principales
pub use connection::init_sqlite_pool;
pub use connection::init_pg_pool;