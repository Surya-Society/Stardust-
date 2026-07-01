// src/database/local/repositories/licence.rs
use sqlx::{SqlitePool, Row};
use crate::models::licence::ActivationKey;
use anyhow::Result;
use log::{info, warn};

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

    info!("📤 {} licences non synchronisées récupérées", keys.len());
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

    info!("✅ Licence marquée synchronisée: id={}", id);
    Ok(())
}

/// ✅ Récupère une licence par sa clé
pub async fn get_by_key(pool: &SqlitePool, key_text: &str) -> Result<Option<ActivationKey>> {
    let row = sqlx::query(
        r#"
        SELECT 
            id, key_text, school_name, plan, status,
            created_at, expires_at, uses, max_uses,
            hw_lock, two_fa, ip_restrict, sec_score,
            fingerprint, activation_method, revocations,
            key_hash, note, created_by, id_etablissement,
            synced, sync_date
        FROM activation_keys 
        WHERE key_text = ?
        "#
    )
    .bind(key_text)
    .fetch_optional(pool)
    .await?;

    if let Some(row) = row {
        Ok(Some(ActivationKey {
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
        }))
    } else {
        Ok(None)
    }
}

/// ✅ Récupère une licence par son ID
pub async fn get_by_id(pool: &SqlitePool, id: i64) -> Result<Option<ActivationKey>> {
    let row = sqlx::query(
        r#"
        SELECT 
            id, key_text, school_name, plan, status,
            created_at, expires_at, uses, max_uses,
            hw_lock, two_fa, ip_restrict, sec_score,
            fingerprint, activation_method, revocations,
            key_hash, note, created_by, id_etablissement,
            synced, sync_date
        FROM activation_keys 
        WHERE id = ?
        "#
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    if let Some(row) = row {
        Ok(Some(ActivationKey {
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
        }))
    } else {
        Ok(None)
    }
}

/// ✅ Récupère toutes les licences (avec ou sans filtrage)
pub async fn get_all(pool: &SqlitePool, only_active: bool) -> Result<Vec<ActivationKey>> {
    let query = if only_active {
        r#"
        SELECT 
            id, key_text, school_name, plan, status,
            created_at, expires_at, uses, max_uses,
            hw_lock, two_fa, ip_restrict, sec_score,
            fingerprint, activation_method, revocations,
            key_hash, note, created_by, id_etablissement,
            synced, sync_date
        FROM activation_keys 
        WHERE status = 'active'
        ORDER BY created_at DESC
        "#
    } else {
        r#"
        SELECT 
            id, key_text, school_name, plan, status,
            created_at, expires_at, uses, max_uses,
            hw_lock, two_fa, ip_restrict, sec_score,
            fingerprint, activation_method, revocations,
            key_hash, note, created_by, id_etablissement,
            synced, sync_date
        FROM activation_keys 
        ORDER BY created_at DESC
        "#
    };

    let rows = sqlx::query(query)
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

    info!("📋 {} licences récupérées", keys.len());
    Ok(keys)
}

/// ✅ Récupère les licences expirées
pub async fn get_expired(pool: &SqlitePool) -> Result<Vec<ActivationKey>> {
    let now = chrono::Utc::now().to_rfc3339();
    
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
        WHERE status = 'active' AND expires_at < ?
        ORDER BY expires_at ASC
        "#
    )
    .bind(&now)
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

    if !keys.is_empty() {
        warn!("⏰ {} licences expirées trouvées", keys.len());
    }
    
    Ok(keys)
}

/// ✅ Compte les licences par statut
pub async fn count_by_status(pool: &SqlitePool, status: &str) -> Result<i64> {
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM activation_keys WHERE status = ?"
    )
    .bind(status)
    .fetch_one(pool)
    .await?;
    
    Ok(count)
}

/// ✅ Compte toutes les licences
pub async fn count_all(pool: &SqlitePool) -> Result<i64> {
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM activation_keys"
    )
    .fetch_one(pool)
    .await?;
    
    Ok(count)
}

/// ✅ Met à jour une licence
pub async fn update(pool: &SqlitePool, key: &ActivationKey) -> Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        UPDATE activation_keys SET
            school_name = ?,
            plan = ?,
            status = ?,
            expires_at = ?,
            max_uses = ?,
            hw_lock = ?,
            two_fa = ?,
            ip_restrict = ?,
            sec_score = ?,
            fingerprint = ?,
            activation_method = ?,
            revocations = ?,
            key_hash = ?,
            note = ?,
            created_by = ?,
            id_etablissement = ?,
            synced = ?,
            sync_date = ?
        WHERE id = ?
        "#
    )
    .bind(&key.school_name)
    .bind(&key.plan)
    .bind(&key.status)
    .bind(&key.expires_at)
    .bind(key.max_uses)
    .bind(key.hw_lock)
    .bind(key.two_fa)
    .bind(key.ip_restrict)
    .bind(key.sec_score)
    .bind(&key.fingerprint)
    .bind(&key.activation_method)
    .bind(key.revocations)
    .bind(&key.key_hash)
    .bind(&key.note)
    .bind(&key.created_by)
    .bind(&key.id_etablissement)
    .bind(key.synced)
    .bind(&now)
    .bind(key.id)
    .execute(pool)
    .await?;

    info!("📝 Licence mise à jour: id={}", key.id);
    Ok(())
}

/// ✅ Supprime une licence
pub async fn delete(pool: &SqlitePool, id: i64) -> Result<bool> {
    let result = sqlx::query(
        "DELETE FROM activation_keys WHERE id = ?"
    )
    .bind(id)
    .execute(pool)
    .await?;
    
    let deleted = result.rows_affected() > 0;
    if deleted {
        info!("🗑️ Licence supprimée: id={}", id);
    }
    
    Ok(deleted)
}