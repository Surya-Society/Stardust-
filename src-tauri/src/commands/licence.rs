// src/commands/licence.rs
use tauri::command;
use serde_json::{json, Value};
use sqlx::SqlitePool;
use sqlx::Row;
use chrono::{Utc, Duration};
use uuid::Uuid;
use log::{info, error};

use crate::services::licence_service::LicenceService;
use crate::models::licence::*;
use crate::models::abonnement::Abonnement;

// ================================================================
// EXPORT - Générer le fichier .licpkg
// ================================================================

#[command]
pub async fn export_licence_key(
    licence_id: i64,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("🔑 EXPORT CALLED with licence_id: {}", licence_id);
    
    let service = LicenceService::new(pool.inner().clone());
    
    match service.export_licence_key(licence_id).await {
        Ok(licence_file) => {
            info!("✅ EXPORT SUCCESS: {}", licence_file.licence_key);
            Ok(serde_json::to_value(&licence_file).unwrap())
        }
        Err(e) => {
            error!("❌ EXPORT ERROR: {:?}", e);
            Err(format!("{:?}", e))
        }
    }
}

// ================================================================
// CRUD - Gestion des licences
// ================================================================

#[command]
pub async fn get_all_licences(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("📋 GET_ALL_LICENCES called");
    
    let service = LicenceService::new(pool.inner().clone());
    
    match service.get_all_licences().await {
        Ok(licences) => {
            info!("✅ GET_ALL_LICENCES: {} found", licences.len());
            Ok(serde_json::to_value(&licences).unwrap())
        }
        Err(e) => {
            error!("❌ GET_ALL_LICENCES ERROR: {:?}", e);
            Err(format!("{:?}", e))
        }
    }
}

#[command]
pub async fn get_licence_by_id(
    licence_id: i64,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("🔍 GET_LICENCE_BY_ID called: {}", licence_id);
    
    let service = LicenceService::new(pool.inner().clone());
    
    match service.get_licence_by_id(licence_id).await {
        Ok(Some(licence)) => {
            info!("✅ LICENCE FOUND: {}", licence.key_text);
            Ok(serde_json::to_value(&licence).unwrap())
        }
        Ok(None) => {
            error!("❌ LICENCE NOT FOUND: {}", licence_id);
            Err("Licence non trouvée".to_string())
        }
        Err(e) => {
            error!("❌ GET_LICENCE_BY_ID ERROR: {:?}", e);
            Err(format!("{:?}", e))
        }
    }
}

// ================================================================
// CREATE LICENCE - AVEC ABONNEMENT AUTOMATIQUE ET ÉTABLISSEMENT ✅
// ================================================================

#[command]
pub async fn create_licence(
    data: CreateLicenceRequest,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("🆕 CREATE_LICENCE called: {}", data.school_name);
    
    let service = LicenceService::new(pool.inner().clone());
    
    // 1. ✅ Si des infos établissement sont fournies, les utiliser
    //    Sinon, en créer un par défaut
    let etablissement_info = data.etablissement.clone().unwrap_or_else(|| {
        let id = data.id_etablissement.clone().unwrap_or_else(|| Uuid::new_v4().to_string());
        EtablissementInfo {
            id_etablissement: id.clone(),
            nom: data.school_name.clone(),
            sigle: None,
            numero_agrement: format!("AGR-{}", Uuid::new_v4().simple()),
            numero_fiscal: format!("FISC-{}", Uuid::new_v4().simple()),
            registre_commerciale: None,
            type_etablissement: "PRIVE".to_string(),
            statut_juridique: "AUTRE".to_string(),
            pays: "Côte d'Ivoire".to_string(),
            region: "Abidjan".to_string(),
            ville: "Abidjan".to_string(),
            commune: None,
            quatier: None,
            adresse: "N/A".to_string(),
            code_postal: None,
            telephone_principal: "00000000".to_string(),
            telephone_secondaire: None,
            email: None,
            site_web: None,
            annee_scolaire_debut: "2025".to_string(),
            annee_scolaire_fin: "2026".to_string(),
            statut: "ACTIF".to_string(),
        }
    });

    // 2. Créer la licence
    let licence = match service.create_licence(data).await {
        Ok(licence) => {
            info!("✅ LICENCE CREATED: {}", licence.key_text);
            licence
        }
        Err(e) => {
            error!("❌ CREATE_LICENCE ERROR: {:?}", e);
            return Err(format!("{:?}", e));
        }
    };

    // 3. ✅ RÉCUPÉRER L'OFFRE CORRESPONDANTE
    let offre_row = sqlx::query(
        r#"
        SELECT 
            offre_id, code, nom, duree, prix, devise,
            prix_original, reduction_pourcentage, 
            renouvellement_automatique, grace_period_jours,
            essai_gratuit, duree_essai_jours
        FROM offres
        WHERE (code = ? OR nom = ?) AND statut = 'ACTIF'
        LIMIT 1
        "#
    )
    .bind(&licence.plan)
    .bind(&licence.plan)
    .fetch_optional(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    // 4. ✅ SI OFFRE TROUVÉE → UTILISER SES VALEURS
    let (offre_id, duree, montant, devise, renouvellement_auto, grace_period) = 
        if let Some(row) = offre_row {
            let offre_id: String = row.get("offre_id");
            let duree: String = row.get("duree");
            let prix: i32 = row.get("prix");
            let devise: String = row.get("devise");
            let renouvellement_auto: bool = row.get("renouvellement_automatique");
            let grace_period: i32 = row.get("grace_period_jours");
            
            info!("📋 Offre trouvée: {} - {} {}", 
                row.get::<String, _>("nom"),
                prix,
                devise
            );
            
            (Some(offre_id), duree, prix, devise, renouvellement_auto, grace_period)
        } else {
            let (duree, montant) = match licence.plan.as_str() {
                "Basic" => ("MENSUEL", 10000),
                "Premium" => ("MENSUEL", 25000),
                "Enterprise" => ("MENSUEL", 50000),
                _ => ("MENSUEL", 10000),
            };
            
            info!("⚠️ Aucune offre trouvée pour {}, utilisation des valeurs par défaut", licence.plan);
            
            (None, duree.to_string(), montant, "XOF".to_string(), true, 7)
        };

    // 5. ✅ CRÉER L'ABONNEMENT
    let abonnement_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let date_fin = match duree.as_str() {
        "MENSUEL" => Utc::now() + Duration::days(30),
        "TRIMESTRIEL" => Utc::now() + Duration::days(90),
        "SEMESTRIEL" => Utc::now() + Duration::days(180),
        "ANNUEL" => Utc::now() + Duration::days(365),
        "A_VIE" => Utc::now() + Duration::days(365 * 100),
        _ => Utc::now() + Duration::days(30),
    };
    let date_fin_str = date_fin.to_rfc3339();

    let etablissement_id = licence.id_etablissement
        .clone()
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let _ = sqlx::query(
        r#"
        INSERT INTO abonnements (
            abonnement_id, id_etablissement, licence_id, offre_id,
            plan, duree, montant_original, montant_remise, montant_final,
            devise, date_debut, date_prochain_paiement, date_fin,
            statut, renouvellement_auto, grace_period_jours,
            metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIF', ?, ?, ?, ?, ?)
        "#
    )
    .bind(&abonnement_id)
    .bind(&etablissement_id)
    .bind(licence.id.to_string())
    .bind(&offre_id)
    .bind(&licence.plan)
    .bind(&duree)
    .bind(montant)
    .bind(0)
    .bind(montant)
    .bind(&devise)
    .bind(&now)
    .bind(&now)
    .bind(&date_fin_str)
    .bind(renouvellement_auto as i32)
    .bind(grace_period)
    .bind(json!({
        "created_from": "licence_creation",
        "licence_key": licence.key_text,
        "school_name": licence.school_name,
        "offre_id": offre_id,
        "etablissement": etablissement_info.nom,
    }).to_string())
    .bind(&now)
    .bind(&now)
    .execute(&*pool)
    .await
    .map_err(|e| {
        error!("❌ ABONNEMENT CREATE ERROR: {:?}", e);
        e.to_string()
    })?;

    info!("✅ ABONNEMENT CREATED: {}", abonnement_id);

    // 6. Récupérer l'abonnement créé
    let abonnement_row = sqlx::query(
        r#"
        SELECT 
            abonnement_id, id_etablissement, licence_id, offre_id,
            plan, duree, montant_original, montant_remise, montant_final,
            devise, date_debut, date_prochain_paiement, date_fin,
            date_annulation, statut, renouvellement_auto,
            grace_period_jours,
            metadata, synced, sync_date, created_at, updated_at
        FROM abonnements
        WHERE abonnement_id = ?
        "#
    )
    .bind(&abonnement_id)
    .fetch_one(&*pool)
    .await
    .map_err(|e| {
        error!("❌ ABONNEMENT FETCH ERROR: {:?}", e);
        e.to_string()
    })?;

    let abonnement = Abonnement {
        abonnement_id: abonnement_row.get("abonnement_id"),
        id_etablissement: abonnement_row.get("id_etablissement"),
        licence_id: abonnement_row.get("licence_id"),
        offre_id: abonnement_row.get("offre_id"),
        plan: abonnement_row.get("plan"),
        duree: abonnement_row.get("duree"),
        montant_original: abonnement_row.get("montant_original"),
        montant_remise: abonnement_row.get("montant_remise"),
        montant_final: abonnement_row.get("montant_final"),
        devise: abonnement_row.get("devise"),
        date_debut: abonnement_row.get("date_debut"),
        date_debut_periode: None,
        date_fin_periode: None,
        date_prochain_paiement: abonnement_row.get("date_prochain_paiement"),
        date_fin: abonnement_row.get("date_fin"),
        date_annulation: abonnement_row.get("date_annulation"),
        statut: abonnement_row.get("statut"),
        statut_renouvellement: "AUTO".to_string(),
        renouvellement_auto: abonnement_row.get("renouvellement_auto"),
        metadata: abonnement_row.get("metadata"),
        synced: abonnement_row.get("synced"),
        sync_date: abonnement_row.get("sync_date"),
        created_at: abonnement_row.get("created_at"),
        updated_at: abonnement_row.get("updated_at"),
    };

        let licence_file = service.export_licence_key_with_etablissement(
            licence.id,
            &etablissement_info,
        ).await.map_err(|e| e.to_string())?;

    info!("✅ LICENCE EXPORTED with établissement: {}", etablissement_info.nom);

    // 8. Retourner la licence, l'abonnement ET le fichier
    Ok(json!({
        "success": true,
        "licence": licence,
        "abonnement": abonnement,
        "licence_file": licence_file,
        "message": format!("Licence et abonnement créés pour {}", licence.school_name)
    }))
}

// ================================================================
// UPDATE LICENCE
// ================================================================

#[command]
pub async fn update_licence(
    licence_id: i64,
    data: UpdateLicenceRequest,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("📝 UPDATE_LICENCE called: {}", licence_id);
    
    let service = LicenceService::new(pool.inner().clone());
    
    match service.update_licence(licence_id, data).await {
        Ok(licence) => {
            info!("✅ LICENCE UPDATED: {}", licence.key_text);
            Ok(serde_json::to_value(&licence).unwrap())
        }
        Err(e) => {
            error!("❌ UPDATE_LICENCE ERROR: {:?}", e);
            Err(format!("{:?}", e))
        }
    }
}

// ================================================================
// REVOKE LICENCE - Met aussi à jour l'abonnement
// ================================================================

#[command]
pub async fn revoke_licence(
    licence_id: i64,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("⛔ REVOKE_LICENCE called: {}", licence_id);
    
    let service = LicenceService::new(pool.inner().clone());
    
    let licence = match service.revoke_licence(licence_id).await {
        Ok(licence) => {
            info!("✅ LICENCE REVOKED: {}", licence.key_text);
            licence
        }
        Err(e) => {
            error!("❌ REVOKE_LICENCE ERROR: {:?}", e);
            return Err(format!("{:?}", e));
        }
    };

    let _ = sqlx::query(
        r#"
        UPDATE abonnements
        SET statut = 'ANNULE',
            date_annulation = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE licence_id = ?
        "#
    )
    .bind(licence.id.to_string())
    .execute(&*pool)
    .await
    .map_err(|e| {
        error!("❌ ABONNEMENT UPDATE ERROR: {:?}", e);
        e.to_string()
    })?;

    info!("✅ ABONNEMENT ANNULE pour licence: {}", licence.key_text);

    Ok(json!({
        "success": true,
        "licence": licence,
        "message": format!("Licence et abonnement révoqués pour {}", licence.school_name)
    }))
}

// ================================================================
// SUSPEND LICENCE - Met aussi à jour l'abonnement
// ================================================================

#[command]
pub async fn suspend_licence(
    licence_id: i64,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("⏸️ SUSPEND_LICENCE called: {}", licence_id);
    
    let service = LicenceService::new(pool.inner().clone());
    
    let licence = match service.suspend_licence(licence_id).await {
        Ok(licence) => {
            info!("✅ LICENCE SUSPENDED: {}", licence.key_text);
            licence
        }
        Err(e) => {
            error!("❌ SUSPEND_LICENCE ERROR: {:?}", e);
            return Err(format!("{:?}", e));
        }
    };

    let _ = sqlx::query(
        r#"
        UPDATE abonnements
        SET statut = 'SUSPENDU',
            updated_at = CURRENT_TIMESTAMP
        WHERE licence_id = ?
        "#
    )
    .bind(licence.id.to_string())
    .execute(&*pool)
    .await
    .map_err(|e| {
        error!("❌ ABONNEMENT UPDATE ERROR: {:?}", e);
        e.to_string()
    })?;

    info!("✅ ABONNEMENT SUSPENDU pour licence: {}", licence.key_text);

    Ok(json!({
        "success": true,
        "licence": licence,
        "message": format!("Licence et abonnement suspendus pour {}", licence.school_name)
    }))
}

// ================================================================
// REACTIVATE LICENCE - Met aussi à jour l'abonnement
// ================================================================

#[command]
pub async fn reactivate_licence(
    licence_id: i64,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("🔄 REACTIVATE_LICENCE called: {}", licence_id);
    
    let service = LicenceService::new(pool.inner().clone());
    
    let licence = match service.reactivate_licence(licence_id).await {
        Ok(licence) => {
            info!("✅ LICENCE REACTIVATED: {}", licence.key_text);
            licence
        }
        Err(e) => {
            error!("❌ REACTIVATE_LICENCE ERROR: {:?}", e);
            return Err(format!("{:?}", e));
        }
    };

    let _ = sqlx::query(
        r#"
        UPDATE abonnements
        SET statut = 'ACTIF',
            updated_at = CURRENT_TIMESTAMP
        WHERE licence_id = ?
        "#
    )
    .bind(licence.id.to_string())
    .execute(&*pool)
    .await
    .map_err(|e| {
        error!("❌ ABONNEMENT UPDATE ERROR: {:?}", e);
        e.to_string()
    })?;

    info!("✅ ABONNEMENT REACTIVÉ pour licence: {}", licence.key_text);

    Ok(json!({
        "success": true,
        "licence": licence,
        "message": format!("Licence et abonnement réactivés pour {}", licence.school_name)
    }))
}

// ================================================================
// LICENCE STATS
// ================================================================

#[command]
pub async fn get_licence_stats(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("📊 GET_LICENCE_STATS called");
    
    let service = LicenceService::new(pool.inner().clone());
    
    match service.get_stats().await {
        Ok(stats) => {
            info!("✅ STATS: total={}, active={}", stats.total, stats.active);
            Ok(serde_json::to_value(&stats).unwrap())
        }
        Err(e) => {
            error!("❌ GET_LICENCE_STATS ERROR: {:?}", e);
            Err(format!("{:?}", e))
        }
    }
}

// ================================================================
// COMMANDE DE TEST
// ================================================================

#[command]
pub async fn create_test_licence(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("🧪 CREATE_TEST_LICENCE called");
    
    use chrono::Utc;
    use sha3::{Digest, Sha3_256};
    
    let key_text = format!("SCO-2025-TEST-{}", Uuid::new_v4().simple().to_string().chars().take(8).collect::<String>());
    let key_hash = format!("sha256:{:x}", Sha3_256::digest(key_text.as_bytes()));
    let now = Utc::now().to_rfc3339();
    let expires = (Utc::now() + chrono::Duration::days(365)).to_rfc3339();
    let etablissement_id = Uuid::new_v4().to_string();

    let row = sqlx::query(
        r#"
        INSERT INTO activation_keys (
            key_text, school_name, plan, status,
            created_at, expires_at, uses, max_uses,
            hw_lock, two_fa, ip_restrict, sec_score,
            fingerprint, activation_method, revocations,
            key_hash, note, created_by, id_etablissement
        ) VALUES (?, ?, ?, 'active', ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
        RETURNING 
            id, key_text, school_name, plan, status,
            created_at, expires_at, uses, max_uses,
            hw_lock, two_fa, ip_restrict, sec_score,
            fingerprint, activation_method, revocations,
            key_hash, note, created_by, id_etablissement
        "#
    )
    .bind(&key_text)
    .bind("École Test")
    .bind("Premium")
    .bind(&now)
    .bind(&expires)
    .bind(150)
    .bind(1)
    .bind(1)
    .bind(1)
    .bind(100)
    .bind("fp_test")
    .bind("file")
    .bind(&key_hash)
    .bind("Licence de test")
    .bind("admin")
    .bind(&etablissement_id)
    .fetch_one(&*pool.inner())
    .await
    .map_err(|e| {
        error!("❌ CREATE_TEST_LICENCE ERROR: {:?}", e);
        e.to_string()
    })?;

            let licence = ActivationKey {
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
            synced: row.get("synced"),           // ⬅️ AJOUTER
            sync_date: row.get("sync_date"),     // ⬅️ AJOUTER
        };
    
    info!("✅ TEST LICENCE CREATED: id={}, key={}", licence.id, licence.key_text);

    let abonnement_id = Uuid::new_v4().to_string();
    let montant = 25000;
    let duree = "MENSUEL";
    let date_fin = Utc::now() + Duration::days(30);
    let date_fin_str = date_fin.to_rfc3339();

    let _ = sqlx::query(
        r#"
        INSERT INTO abonnements (
            abonnement_id, id_etablissement, licence_id, 
            plan, duree, montant_original, montant_remise, montant_final,
            devise, date_debut, date_prochain_paiement, date_fin,
            statut, renouvellement_auto, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIF', 1, ?, ?, ?)
        "#
    )
    .bind(&abonnement_id)
    .bind(&etablissement_id)
    .bind(licence.id.to_string())
    .bind(&licence.plan)
    .bind(duree)
    .bind(montant)
    .bind(0)
    .bind(montant)
    .bind("XOF")
    .bind(&now)
    .bind(&now)
    .bind(&date_fin_str)
    .bind(json!({
        "created_from": "test_licence_creation",
        "licence_key": licence.key_text,
    }).to_string())
    .bind(&now)
    .bind(&now)
    .execute(&*pool.inner())
    .await
    .map_err(|e| {
        error!("❌ TEST ABONNEMENT CREATE ERROR: {:?}", e);
        e.to_string()
    })?;

    info!("✅ TEST ABONNEMENT CREATED: {}", abonnement_id);
    
    Ok(json!({
        "success": true,
        "licence": licence,
        "abonnement_id": abonnement_id,
        "message": format!("Licence et abonnement de test créés pour {}", licence.school_name)
    }))
}