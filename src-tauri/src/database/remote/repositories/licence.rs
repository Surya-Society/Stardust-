// src/database/remote/repositories/licence.rs - VERSION COMPLÈTE CORRIGÉE
use sqlx::{PgPool, Row, Executor, Postgres};
use crate::models::licence::ActivationKey;
use anyhow::Result;
use log::info;

/// ✅ Récupère toutes les licences depuis PostgreSQL
/// ✅ CORRIGÉ: Convertit INT4 → i64, TIMESTAMPTZ → String
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
        // ✅ Convertir id de INT4 à i64
        let id_i32: i32 = row.get("id");
        let id = id_i32 as i64;
        
        // ✅ Convertir TIMESTAMPTZ → String
        let created_at: chrono::DateTime<chrono::Utc> = row.get("created_at");
        let created_at_str = created_at.to_rfc3339();
        
        let expires_at: chrono::DateTime<chrono::Utc> = row.get("expires_at");
        let expires_at_str = expires_at.to_rfc3339();
        
        let sync_date: Option<chrono::DateTime<chrono::Utc>> = row.get("sync_date");
        let sync_date_str = sync_date.map(|d| d.to_rfc3339());
        
        // ✅ Convertir uses de INT4 à i64
        let uses_i32: i32 = row.get("uses");
        let uses = uses_i32 as i64;
        
        // ✅ Convertir max_uses de INT4 à i64
        let max_uses_i32: i32 = row.get("max_uses");
        let max_uses = max_uses_i32 as i64;
        
        // ✅ Convertir hw_lock de INT4 à i64
        let hw_lock_i32: i32 = row.get("hw_lock");
        let hw_lock = hw_lock_i32 as i64;
        
        // ✅ Convertir two_fa de INT4 à i64
        let two_fa_i32: i32 = row.get("two_fa");
        let two_fa = two_fa_i32 as i64;
        
        // ✅ Convertir ip_restrict de INT4 à i64
        let ip_restrict_i32: i32 = row.get("ip_restrict");
        let ip_restrict = ip_restrict_i32 as i64;
        
        // ✅ Convertir sec_score de INT4 à i64
        let sec_score_i32: i32 = row.get("sec_score");
        let sec_score = sec_score_i32 as i64;
        
        // ✅ Convertir revocations de INT4 à i64
        let revocations_i32: i32 = row.get("revocations");
        let revocations = revocations_i32 as i64;
        
        // ✅ Convertir synced de INT4 à i64
        let synced_i32: i32 = row.get("synced");
        let synced = synced_i32 as i64;

        keys.push(ActivationKey {
            id,
            key_text: row.get("key_text"),
            school_name: row.get("school_name"),
            plan: row.get("plan"),
            status: row.get("status"),
            created_at: created_at_str,
            expires_at: expires_at_str,
            uses,
            max_uses,
            hw_lock,
            two_fa,
            ip_restrict,
            sec_score,
            fingerprint: row.get("fingerprint"),
            activation_method: row.get("activation_method"),
            revocations,
            key_hash: row.get("key_hash"),
            note: row.get("note"),
            created_by: row.get("created_by"),
            id_etablissement: row.get("id_etablissement"),
            synced,
            sync_date: sync_date_str,
        });
    }

    info!("📋 {} licences récupérées depuis PostgreSQL", keys.len());
    Ok(keys)
}

/// ✅ Insère ou met à jour une licence dans PostgreSQL
/// ✅ CORRIGÉ: Convertit les dates en TIMESTAMPTZ
pub async fn upsert<'a, E>(executor: E, key: &ActivationKey) -> Result<()>
where
    E: Executor<'a, Database = Postgres>,
{
    // ✅ Convertir les dates en TIMESTAMPTZ
    let created_at = chrono::DateTime::parse_from_rfc3339(&key.created_at)
        .map(|dt| dt.with_timezone(&chrono::Utc))
        .unwrap_or_else(|_| chrono::Utc::now());
    
    let expires_at = chrono::DateTime::parse_from_rfc3339(&key.expires_at)
        .map(|dt| dt.with_timezone(&chrono::Utc))
        .unwrap_or_else(|_| chrono::Utc::now());
    
    let sync_date = key.sync_date.as_ref()
        .and_then(|d| chrono::DateTime::parse_from_rfc3339(d).ok())
        .map(|dt| dt.with_timezone(&chrono::Utc));
    
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
    .bind(key.id)  // ✅ i64
    .bind(&key.key_text)
    .bind(&key.school_name)
    .bind(&key.plan)
    .bind(&key.status)
    .bind(created_at)  // ✅ TIMESTAMPTZ
    .bind(expires_at)  // ✅ TIMESTAMPTZ
    .bind(key.uses)    // ✅ i64
    .bind(key.max_uses) // ✅ i64
    .bind(key.hw_lock)  // ✅ i64
    .bind(key.two_fa)   // ✅ i64
    .bind(key.ip_restrict) // ✅ i64
    .bind(key.sec_score) // ✅ i64
    .bind(&key.fingerprint)
    .bind(&key.activation_method)
    .bind(key.revocations) // ✅ i64
    .bind(&key.key_hash)
    .bind(&key.note)
    .bind(&key.created_by)
    .bind(&key.id_etablissement)
    .bind(1)  // synced
    .bind(sync_date)  // ✅ TIMESTAMPTZ
    .execute(executor)
    .await?;

    Ok(())
}

/// ✅ Version simplifiée pour PgPool
pub async fn upsert_simple(pool: &PgPool, key: &ActivationKey) -> Result<()> {
    upsert(pool, key).await
}