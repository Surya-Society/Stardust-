// src/services/licence_service.rs
use sqlx::SqlitePool;
use sqlx::Row;
use chrono::Utc;
use uuid::Uuid;
use crate::crypto::LicenseSigner;
use crate::models::licence::*;
use crate::utils::error::AppError;
use log::{info, error};

pub struct LicenceService {
    pool: SqlitePool,
    crypto: LicenseSigner,
}

impl LicenceService {
    pub fn new(pool: SqlitePool) -> Self {
        Self {
            pool,
            crypto: LicenseSigner::new(),
        }
    }

    // ================================================================
    // EXPORT - Générer le fichier .licpkg (avec challenge unique)
    // ================================================================

    pub async fn export_licence_key(&self, licence_id: i64) -> Result<LicenceFile, AppError> {
        let row = sqlx::query(
            r#"
            SELECT 
                key_text, school_name, plan, expires_at, max_uses, id_etablissement,
                synced, sync_date
            FROM activation_keys 
            WHERE id = ?
            "#
        )
        .bind(licence_id)
        .fetch_one(&self.pool)
        .await?;

        let key_text: String = row.get("key_text");
        let school_name: String = row.get("school_name");
        let plan: String = row.get("plan");
        let expires_at_str: String = row.get("expires_at");
        let max_uses: i64 = row.get("max_uses");
        let id_etablissement: Option<String> = row.get("id_etablissement");

        let expires_at = chrono::DateTime::parse_from_rfc3339(&expires_at_str)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|_| Utc::now());

        let challenge = uuid::Uuid::new_v4().to_string();

        info!("🔑 Challenge generated for licence {}: {}", licence_id, challenge);

        let signature = self.crypto.sign_licence_data(
            &key_text,
            &format!("key_{}", licence_id),
            &expires_at,
            &challenge,
        )?;

        let public_key = self.crypto.get_public_key_base64()?;

        let licence_file = LicenceFile {
            licence_id: format!("key_{}", licence_id),
            licence_key: key_text.clone(),
            school_id: school_name.clone(),
            plan: plan.clone(),
            issued_at: Utc::now(),
            expires_at,
            max_version: env!("CARGO_PKG_VERSION").to_string(),
            install_limit: max_uses as u32,
            signature,
            public_key,
            challenge: challenge.clone(),
            id_etablissement,
            etablissement: None,
        };

        info!("📤 Licence exported: {} with challenge: {}", licence_file.licence_key, challenge);
        Ok(licence_file)
    }

    // ================================================================
    // ✅ EXPORT AVEC ÉTABLISSEMENT - NOUVEAU
    // ================================================================

    pub async fn export_licence_key_with_etablissement(
        &self,
        licence_id: i64,
        etablissement: &EtablissementInfo,
    ) -> Result<LicenceFile, AppError> {
        let row = sqlx::query(
            r#"
            SELECT 
                key_text, school_name, plan, expires_at, max_uses, id_etablissement,
                synced, sync_date
            FROM activation_keys 
            WHERE id = ?
            "#
        )
        .bind(licence_id)
        .fetch_one(&self.pool)
        .await?;

        let key_text: String = row.get("key_text");
        let school_name: String = row.get("school_name");
        let plan: String = row.get("plan");
        let expires_at_str: String = row.get("expires_at");
        let max_uses: i64 = row.get("max_uses");
        let id_etablissement: Option<String> = row.get("id_etablissement");

        let expires_at = chrono::DateTime::parse_from_rfc3339(&expires_at_str)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|_| Utc::now());

        let challenge = uuid::Uuid::new_v4().to_string();

        info!("🔑 Challenge generated for licence {} with établissement: {}", licence_id, etablissement.nom);

        let signature = self.crypto.sign_licence_data(
            &key_text,
            &format!("key_{}", licence_id),
            &expires_at,
            &challenge,
        )?;

        let public_key = self.crypto.get_public_key_base64()?;

        let licence_file = LicenceFile {
            licence_id: format!("key_{}", licence_id),
            licence_key: key_text.clone(),
            school_id: school_name.clone(),
            plan: plan.clone(),
            issued_at: Utc::now(),
            expires_at,
            max_version: env!("CARGO_PKG_VERSION").to_string(),
            install_limit: max_uses as u32,
            signature,
            public_key,
            challenge: challenge.clone(),
            id_etablissement: Some(etablissement.id_etablissement.clone()),
            etablissement: Some(etablissement.clone()),
        };

        info!("📤 Licence exported with établissement: {} - {}", licence_file.licence_key, etablissement.nom);
        Ok(licence_file)
    }

    // ================================================================
    // ACTIVATION - Vérifier et activer une licence depuis un fichier
    // ================================================================

    pub async fn activate_from_file(
        &self,
        licence_file: &LicenceFile,
        appareil_info: &ActivationRequest,
    ) -> Result<ActivationResponse, AppError> {
        info!("🔍 === ACTIVATION LICENCE ===");
        info!("🔍 Licence key: {}", licence_file.licence_key);
        info!("🔍 Challenge: {}", licence_file.challenge);
        info!("🔍 Signature: {}", licence_file.signature);
        info!("🔍 Public key: {}", licence_file.public_key);
        info!("🔍 Appareil: {}", appareil_info.nom_appareil);
        info!("🔍 Device ID: {}", appareil_info.identifiant_unique);
        
        info!("🔍 Vérification de la signature...");
        let signature_valid = self.crypto.verify_license_signature(
            &licence_file.licence_key,
            &licence_file.signature,
            &licence_file.public_key,
            &licence_file.challenge,
        )?;

        info!("🔍 Signature valide: {}", signature_valid);

        if !signature_valid {
            error!("❌ Signature invalide pour la licence: {}", licence_file.licence_key);
            return Ok(ActivationResponse {
                success: false,
                activation_id: None,
                message: "Signature invalide - Fichier corrompu".to_string(),
                licence_details: None,
            });
        }

        info!("🔍 Vérification du challenge...");
        let challenge_used = self.is_challenge_used(&licence_file.challenge).await?;
        info!("🔍 Challenge déjà utilisé: {}", challenge_used);
        
        if challenge_used {
            error!("❌ Challenge déjà utilisé: {}", licence_file.challenge);
            return Ok(ActivationResponse {
                success: false,
                activation_id: None,
                message: "Cette licence a déjà été activée".to_string(),
                licence_details: None,
            });
        }

        info!("🔍 Recherche de la licence existante...");
        let existing = self.get_activation_key_by_text(&licence_file.licence_key).await?;
        
        if let Some(existing_key) = existing {
            info!("🔍 Licence existante trouvée: id={}", existing_key.id);
            
            if existing_key.uses >= existing_key.max_uses {
                info!("⚠️ Nombre max d'utilisations atteint: {}/{}", 
                    existing_key.uses, existing_key.max_uses);
                return Ok(ActivationResponse {
                    success: false,
                    activation_id: None,
                    message: format!("Nombre maximum d'utilisations atteint ({})", existing_key.max_uses),
                    licence_details: None,
                });
            }

            let now = Utc::now().to_rfc3339();
            let device_id = appareil_info.identifiant_unique.clone();
            let key_id = existing_key.id;

            sqlx::query(
                r#"
                UPDATE activation_keys 
                SET uses = uses + 1,
                    last_used = ?,
                    fingerprint = ?
                WHERE id = ?
                "#
            )
            .bind(&now)
            .bind(&device_id)
            .bind(key_id)
            .execute(&self.pool)
            .await?;
            
            self.mark_challenge_used(
                &licence_file.challenge,
                &licence_file.licence_key,
                &appareil_info.identifiant_unique,
            ).await?;

            let now_dt = Utc::now();
            let expiry = chrono::DateTime::parse_from_rfc3339(&existing_key.expires_at)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or(now_dt);

            let plan = existing_key.plan.clone();
            let max_uses = existing_key.max_uses;
            let uses = existing_key.uses;

            info!("✅ Activation réussie pour: {}", licence_file.licence_key);

            return Ok(ActivationResponse {
                success: true,
                activation_id: Some(format!("act_{}", existing_key.id)),
                message: "Licence activée avec succès".to_string(),
                licence_details: Some(LicenseDetails {
                    plan: plan.clone(),
                    expires_at: expiry,
                    days_remaining: (expiry - now_dt).num_days(),
                    max_installations: max_uses as u32,
                    used_installations: (uses + 1) as u32,
                    is_trial: plan == "Basic",
                }),
            });
        }

        info!("🆕 Nouvelle licence - première activation");
        let now = Utc::now().to_rfc3339();
        let key_hash = ActivationKey::generate_key_hash(&licence_file.licence_key);
        
        let licence_key = licence_file.licence_key.clone();
        let school_id = licence_file.school_id.clone();
        let plan = licence_file.plan.clone();
        let expires_at_str = licence_file.expires_at.to_rfc3339();
        let install_limit = licence_file.install_limit as i64;
        let device_id = appareil_info.identifiant_unique.clone();
        let note = format!("Importée depuis fichier .licpkg - Appareil: {}", appareil_info.nom_appareil);
        
        let id_etablissement = if let Some(ref etab) = licence_file.etablissement {
            etab.id_etablissement.clone()
        } else {
            licence_file.id_etablissement.clone()
                .unwrap_or_else(|| Uuid::new_v4().to_string())
        };

        let row = sqlx::query(
            r#"
            INSERT INTO activation_keys (
                key_text, school_name, plan, status,
                created_at, expires_at, uses, max_uses,
                hw_lock, two_fa, ip_restrict, sec_score,
                fingerprint, activation_method, revocations,
                key_hash, note, created_by, id_etablissement,
                synced, sync_date
            ) VALUES (?, ?, ?, 'active', ?, ?, 1, ?, 0, 0, 0, 70, ?, 'file', 0, ?, ?, 'system', ?, ?, ?)
            RETURNING id, key_text, school_name, plan, status,
                created_at, expires_at, uses, max_uses,
                hw_lock, two_fa, ip_restrict, sec_score,
                fingerprint, activation_method, revocations,
                key_hash, note, created_by, id_etablissement,
                synced, sync_date
            "#
        )
        .bind(&licence_key)
        .bind(&school_id)
        .bind(&plan)
        .bind(&now)
        .bind(&expires_at_str)
        .bind(install_limit)
        .bind(&device_id)
        .bind(&key_hash)
        .bind(&note)
        .bind(&id_etablissement)
        .bind(1)  // synced
        .bind(&now)  // sync_date
        .fetch_one(&self.pool)
        .await?;

        self.mark_challenge_used(
            &licence_file.challenge,
            &licence_file.licence_key,
            &appareil_info.identifiant_unique,
        ).await?;

        let expiry = licence_file.expires_at;

        let id: i64 = row.get("id");
        let result_plan: String = row.get("plan");
        let result_uses: i64 = row.get("uses");
        let result_max_uses: i64 = row.get("max_uses");
        let created_at: String = row.get("created_at");
        let expires_at: String = row.get("expires_at");
        let result_synced: i64 = row.get("synced");
        let result_sync_date: Option<String> = row.get("sync_date");

        info!("✅ Activation réussie pour la nouvelle licence: {}", licence_file.licence_key);

        Ok(ActivationResponse {
            success: true,
            activation_id: Some(format!("act_{}", id)),
            message: "Licence activée avec succès".to_string(),
            licence_details: Some(LicenseDetails {
                plan: result_plan.clone(),
                expires_at: expiry,
                days_remaining: (expiry - Utc::now()).num_days(),
                max_installations: result_max_uses as u32,
                used_installations: result_uses as u32,
                is_trial: result_plan == "Basic",
            }),
        })
    }

    // ================================================================
    // CHALLENGE - Vérification et marquage
    // ================================================================

    async fn is_challenge_used(&self, challenge: &str) -> Result<bool, AppError> {
        let result: Option<i64> = sqlx::query_scalar(
            "SELECT 1 FROM used_challenges WHERE challenge = ?"
        )
        .bind(challenge)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(result.is_some())
    }

    async fn mark_challenge_used(
        &self,
        challenge: &str,
        licence_key: &str,
        device_id: &str,
    ) -> Result<(), AppError> {
        let now = Utc::now().to_rfc3339();
        sqlx::query(
            r#"
            INSERT INTO used_challenges (challenge, licence_key, device_id, used_at)
            VALUES (?, ?, ?, ?)
            "#
        )
        .bind(challenge)
        .bind(licence_key)
        .bind(device_id)
        .bind(&now)
        .execute(&self.pool)
        .await?;
        
        info!("🔒 Challenge marked as used: {}", challenge);
        Ok(())
    }

    // ================================================================
    // FONCTIONS AUXILIAIRES
    // ================================================================

    async fn get_activation_key_by_text(&self, key_text: &str) -> Result<Option<ActivationKey>, AppError> {
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
        .fetch_optional(&self.pool)
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

    // ================================================================
    // STATISTIQUES
    // ================================================================

    pub async fn get_stats(&self) -> Result<LicenceStats, AppError> {
        let row = sqlx::query(
            r#"
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
                SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked,
                AVG(sec_score) as avg_sec_score
            FROM activation_keys
            "#
        )
        .fetch_one(&self.pool)
        .await?;

        let total: i64 = row.get("total");
        let active: Option<i64> = row.get("active");
        let expired: Option<i64> = row.get("expired");
        let suspended: Option<i64> = row.get("suspended");
        let revoked: Option<i64> = row.get("revoked");
        let avg_sec_score: Option<f64> = row.get("avg_sec_score");

        Ok(LicenceStats {
            total,
            active: active.unwrap_or(0),
            expired: expired.unwrap_or(0),
            suspended: suspended.unwrap_or(0),
            revoked: revoked.unwrap_or(0),
            avg_sec_score: avg_sec_score.unwrap_or(0.0),
        })
    }

    // ================================================================
    // CRUD - Public (pour l'API)
    // ================================================================

    pub async fn get_all_licences(&self) -> Result<Vec<ActivationKey>, AppError> {
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
        .fetch_all(&self.pool)
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

    pub async fn get_licence_by_id(&self, licence_id: i64) -> Result<Option<ActivationKey>, AppError> {
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
        .bind(licence_id)
        .fetch_optional(&self.pool)
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

    // ================================================================
    // CREATE - Avec id_etablissement automatique
    // ================================================================

    pub async fn create_licence(&self, data: CreateLicenceRequest) -> Result<ActivationKey, AppError> {
        let key_text = self.generate_key();
        let key_hash = ActivationKey::generate_key_hash(&key_text);
        let now = Utc::now().to_rfc3339();
        let sec_score = self.calculate_sec_score(data.hw_lock, data.two_fa, data.ip_restrict);
        
        let id_etablissement = data.id_etablissement
            .clone()
            .unwrap_or_else(|| Uuid::new_v4().to_string());

        let hw_lock = data.hw_lock as i64;
        let two_fa = data.two_fa as i64;
        let ip_restrict = data.ip_restrict as i64;
        let fingerprint = format!("fp_{:x}", rand::random::<u32>());

        let row = sqlx::query(
            r#"
            INSERT INTO activation_keys (
                key_text, school_name, plan, status,
                created_at, expires_at, uses, max_uses,
                hw_lock, two_fa, ip_restrict, sec_score,
                fingerprint, activation_method, revocations,
                key_hash, note, created_by, id_etablissement,
                synced, sync_date
            ) VALUES (?, ?, ?, 'active', ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
            RETURNING id, key_text, school_name, plan, status,
                created_at, expires_at, uses, max_uses,
                hw_lock, two_fa, ip_restrict, sec_score,
                fingerprint, activation_method, revocations,
                key_hash, note, created_by, id_etablissement,
                synced, sync_date
            "#
        )
        .bind(&key_text)
        .bind(&data.school_name)
        .bind(&data.plan)
        .bind(&now)
        .bind(&data.expires_at)
        .bind(&data.max_uses)
        .bind(hw_lock)
        .bind(two_fa)
        .bind(ip_restrict)
        .bind(sec_score)
        .bind(&fingerprint)
        .bind(&data.activation_method)
        .bind(&key_hash)
        .bind(&data.note)
        .bind("admin")
        .bind(&id_etablissement)
        .bind(0)  // synced
        .bind(None::<String>)  // sync_date
        .fetch_one(&self.pool)
        .await?;

        info!("✅ Licence created: {}", key_text);

        Ok(ActivationKey {
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
        })
    }

    // ================================================================
    // UPDATE
    // ================================================================

    pub async fn update_licence(&self, licence_id: i64, data: UpdateLicenceRequest) -> Result<ActivationKey, AppError> {
        let current = self.get_licence_by_id(licence_id).await?
            .ok_or_else(|| AppError::NotFound("Licence not found".to_string()))?;

        let school_name = data.school_name.unwrap_or(current.school_name);
        let plan = data.plan.unwrap_or(current.plan);
        let expires_at = data.expires_at.unwrap_or(current.expires_at);
        let max_uses = data.max_uses.unwrap_or(current.max_uses);
        let hw_lock = data.hw_lock.unwrap_or(current.hw_lock == 1);
        let two_fa = data.two_fa.unwrap_or(current.two_fa == 1);
        let ip_restrict = data.ip_restrict.unwrap_or(current.ip_restrict == 1);
        let note = data.note.or(current.note);
        let id_etablissement = data.id_etablissement.or(current.id_etablissement);
        let sec_score = self.calculate_sec_score(hw_lock, two_fa, ip_restrict);
        
        let hw_lock_i64 = hw_lock as i64;
        let two_fa_i64 = two_fa as i64;
        let ip_restrict_i64 = ip_restrict as i64;

        let row = sqlx::query(
            r#"
            UPDATE activation_keys SET
                school_name = ?,
                plan = ?,
                expires_at = ?,
                max_uses = ?,
                hw_lock = ?,
                two_fa = ?,
                ip_restrict = ?,
                sec_score = ?,
                note = ?,
                id_etablissement = ?,
                synced = ?,
                sync_date = ?
            WHERE id = ?
            RETURNING id, key_text, school_name, plan, status,
                created_at, expires_at, uses, max_uses,
                hw_lock, two_fa, ip_restrict, sec_score,
                fingerprint, activation_method, revocations,
                key_hash, note, created_by, id_etablissement,
                synced, sync_date
            "#
        )
        .bind(&school_name)
        .bind(&plan)
        .bind(&expires_at)
        .bind(max_uses)
        .bind(hw_lock_i64)
        .bind(two_fa_i64)
        .bind(ip_restrict_i64)
        .bind(sec_score)
        .bind(&note)
        .bind(&id_etablissement)
        .bind(1)  // synced
        .bind(Utc::now().to_rfc3339())  // sync_date
        .bind(licence_id)
        .fetch_one(&self.pool)
        .await?;

        let key_text: String = row.get("key_text");
        info!("📝 Licence updated: {}", key_text);

        Ok(ActivationKey {
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
        })
    }

    // ================================================================
    // REVOKE
    // ================================================================

    pub async fn revoke_licence(&self, licence_id: i64) -> Result<ActivationKey, AppError> {
        let row = sqlx::query(
            r#"
            UPDATE activation_keys
            SET status = 'revoked', revocations = revocations + 1,
                synced = 1, sync_date = ?
            WHERE id = ?
            RETURNING id, key_text, school_name, plan, status,
                created_at, expires_at, uses, max_uses,
                hw_lock, two_fa, ip_restrict, sec_score,
                fingerprint, activation_method, revocations,
                key_hash, note, created_by, id_etablissement,
                synced, sync_date
            "#
        )
        .bind(Utc::now().to_rfc3339())
        .bind(licence_id)
        .fetch_one(&self.pool)
        .await?;

        let key_text: String = row.get("key_text");
        info!("⛔ Licence revoked: {}", key_text);

        Ok(ActivationKey {
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
        })
    }

    // ================================================================
    // SUSPEND
    // ================================================================

    pub async fn suspend_licence(&self, licence_id: i64) -> Result<ActivationKey, AppError> {
        let row = sqlx::query(
            r#"
            UPDATE activation_keys
            SET status = 'suspended',
                synced = 1, sync_date = ?
            WHERE id = ?
            RETURNING id, key_text, school_name, plan, status,
                created_at, expires_at, uses, max_uses,
                hw_lock, two_fa, ip_restrict, sec_score,
                fingerprint, activation_method, revocations,
                key_hash, note, created_by, id_etablissement,
                synced, sync_date
            "#
        )
        .bind(Utc::now().to_rfc3339())
        .bind(licence_id)
        .fetch_one(&self.pool)
        .await?;

        let key_text: String = row.get("key_text");
        info!("⏸️ Licence suspended: {}", key_text);

        Ok(ActivationKey {
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
        })
    }

    // ================================================================
    // REACTIVATE
    // ================================================================

    pub async fn reactivate_licence(&self, licence_id: i64) -> Result<ActivationKey, AppError> {
        let row = sqlx::query(
            r#"
            UPDATE activation_keys
            SET status = 'active',
                synced = 1, sync_date = ?
            WHERE id = ?
            RETURNING id, key_text, school_name, plan, status,
                created_at, expires_at, uses, max_uses,
                hw_lock, two_fa, ip_restrict, sec_score,
                fingerprint, activation_method, revocations,
                key_hash, note, created_by, id_etablissement,
                synced, sync_date
            "#
        )
        .bind(Utc::now().to_rfc3339())
        .bind(licence_id)
        .fetch_one(&self.pool)
        .await?;

        let key_text: String = row.get("key_text");
        info!("🔄 Licence reactivated: {}", key_text);

        Ok(ActivationKey {
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
        })
    }

    // ================================================================
    // UTILITAIRES
    // ================================================================

    fn generate_key(&self) -> String {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let segments: Vec<String> = (0..3)
            .map(|_| format!("{:04X}", rng.gen::<u16>()))
            .collect();
        format!("SCO-2025-{}-{}-{}", 
            segments[0], segments[1], segments[2]
        )
    }

    fn calculate_sec_score(&self, hw_lock: bool, two_fa: bool, ip_restrict: bool) -> i64 {
        let base = 20;
        let score = base 
            + (if hw_lock { 30 } else { 0 })
            + (if two_fa { 30 } else { 0 })
            + (if ip_restrict { 20 } else { 0 });
        score.min(100) as i64
    }
}