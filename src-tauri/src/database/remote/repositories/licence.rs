// src/database/remote/repositories/licence.rs
use sqlx::{PgPool, Row};
use crate::models::licence::ActivationKey;
use anyhow::Result;

/// ✅ Récupère toutes les licences depuis PostgreSQL
pub async fn get_all(pool: &PgPool) -> Result<Vec<ActivationKey>> {
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
        ORDER BY created_at DESC
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

/// ✅ Insère ou met à jour une licence dans PostgreSQL
pub async fn upsert(pool: &PgPool, key: &ActivationKey) -> Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        INSERT INTO activation_keys (
            id, key_text, school_name, plan, status,
            created_at, expires_at, uses, max_uses,
            hw_lock, two_fa, ip_restrict, sec_score,
            fingerprint, activation_method, revocations,
            key_hash, note, created_by, id_etablissement,
            synced, sync_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        ON CONFLICT (id) DO UPDATE SET
            key_text = EXCLUDED.key_text,
            school_name = EXCLUDED.school_name,
            plan = EXCLUDED.plan,
            status = EXCLUDED.status,
            expires_at = EXCLUDED.expires_at,
            uses = EXCLUDED.uses,
            max_uses = EXCLUDED.max_uses,
            hw_lock = EXCLUDED.hw_lock,
            two_fa = EXCLUDED.two_fa,
            ip_restrict = EXCLUDED.ip_restrict,
            sec_score = EXCLUDED.sec_score,
            fingerprint = EXCLUDED.fingerprint,
            activation_method = EXCLUDED.activation_method,
            revocations = EXCLUDED.revocations,
            key_hash = EXCLUDED.key_hash,
            note = EXCLUDED.note,
            created_by = EXCLUDED.created_by,
            id_etablissement = EXCLUDED.id_etablissement,
            synced = EXCLUDED.synced,
            sync_date = EXCLUDED.sync_date
        "#
    )
    .bind(key.id)
    .bind(&key.key_text)
    .bind(&key.school_name)
    .bind(&key.plan)
    .bind(&key.status)
    .bind(&key.created_at)
    .bind(&key.expires_at)
    .bind(key.uses)
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
    .bind(1)
    .bind(&now)
    .execute(pool)
    .await?;

    Ok(())
}