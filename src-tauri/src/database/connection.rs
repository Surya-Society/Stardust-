// src/database/connection.rs

use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use sqlx::postgres::{PgPool, PgPoolOptions};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use log::info;
use std::fs;
use std::env;

pub async fn ensure_db_exists(app_handle: &AppHandle) -> Result<PathBuf, Box<dyn std::error::Error + Send + Sync + 'static>> {
    let db_path = if let Ok(db_url) = env::var("DATABASE_URL") {
        let path_str = db_url
            .strip_prefix("sqlite://")
            .unwrap_or(&db_url);
        PathBuf::from(path_str)
    } else {
        let app_dir = app_handle.path()
            .app_data_dir()
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync + 'static>)?;
        
        if !app_dir.exists() {
            fs::create_dir_all(&app_dir)?;
        }
        app_dir.join("Stardust.sqlite")
    };
    
    if let Some(parent) = db_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }
    
    if !db_path.exists() {
        info!("📄 Creating new database at: {}", db_path.display());
        fs::File::create(&db_path)?;
    }
    
    info!("📁 Database path: {}", db_path.display());
    Ok(db_path)
}

// ✅ Fonction init_sqlite_pool pour SQLite
pub async fn init_sqlite_pool(app_handle: &AppHandle) -> Result<SqlitePool, sqlx::Error> {
    let db_path = ensure_db_exists(app_handle)
        .await
        .map_err(|e| sqlx::Error::Configuration(e))?;
    
    let url = format!("sqlite:{}?mode=rwc", db_path.display());
    
    info!("📁 SQLite database: {}", url);
    
    SqlitePoolOptions::new()
        .max_connections(10)
        .acquire_timeout(std::time::Duration::from_secs(30))
        .connect(&url)
        .await
}

// ✅ Fonction init_pg_pool pour PostgreSQL
pub async fn init_pg_pool() -> Result<PgPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL_PG")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/stardust".to_string());
    
    info!("☁️ Connecting to PostgreSQL...");
    
    PgPoolOptions::new()
        .max_connections(10)
        .min_connections(2)
        .acquire_timeout(std::time::Duration::from_secs(30))
        .connect(&database_url)
        .await
}