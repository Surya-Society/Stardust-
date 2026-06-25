// src/database/local/repositories/licence.rs
use sqlx::{SqlitePool, Row};
use crate::models::licence::ActivationKey;
use anyhow::Result;
use log::info;

/// ✅ Récupère toutes les licences non synchronisées
pub async fn get_unsynced(pool: &SqlitePool) -> Result<Vec<ActivationKey>> {
    let rows = sqlx::query(
        r#"
        SELECT 
            id, key_text, school_name, plan, status,
            created_at, expires_at, uses, max_uses,
            hw_lock, two_fa, ip_restrict, sec_score,
            fingerprint, activation_method, revocations,
            key_hash, note, created_by, id_etablissement,
            synced, sync_date
        FROM activation_keys 
        WHERE synced = 0
        "#
    )
    .fetch_all(pool)
    .await?;

    let mut keys = Vec::new();
    for row in rows {
        keys.push(ActivationKey {
            id: row.get("id"),
            key_text: row.get("key_text"),
            school_name: row.get("school_name"),
            plan: row.get("plan"),
            status: row.get("status"),
            created_at: row.get("created_at"),
            expires_at: row.get("expires_at"),
            uses: row.get("uses"),
            max_uses: row.get("max_uses"),
            hw_lock: row.get("hw_lock"),
            two_fa: row.get("two_fa"),
            ip_restrict: row.get("ip_restrict"),
            sec_score: row.get("sec_score"),
            fingerprint: row.get("fingerprint"),
            activation_method: row.get("activation_method"),
            revocations: row.get("revocations"),
            key_hash: row.get("key_hash"),
            note: row.get("note"),
            created_by: row.get("created_by"),
            id_etablissement: row.get("id_etablissement"),
            synced: row.get("synced"),
            sync_date: row.get("sync_date"),
        });
    }

    Ok(keys)
}

/// ✅ Marque une licence comme synchronisée
pub async fn mark_synced(pool: &SqlitePool, id: i64) -> Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        UPDATE activation_keys 
        SET synced = 1, sync_date = ? 
        WHERE id = ?
        "#
    )
    .bind(&now)
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}