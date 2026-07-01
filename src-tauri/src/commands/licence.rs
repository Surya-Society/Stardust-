// src/commands/licence.rs - VERSION COMPLÈTE CORRIGÉE
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
// FONCTION UTILITAIRE - Capitaliser le plan
// ================================================================

/// ✅ Capitalise le plan de licence (Basic, Premium, Gold)
fn capitalize_plan(plan: &str) -> String {
    let lower = plan.to_lowercase();
    match lower.as_str() {
        "basic" => "Basic".to_string(),
        "premium" => "Premium".to_string(),
        "gold" => "Gold".to_string(),
        _ => {
            let mut chars = lower.chars();
            match chars.next() {
                None => String::new(),
                Some(c) => c.to_uppercase().collect::<String>() + chars.as_str(),
            }
        }
    }
}

// ================================================================
// FONCTION UTILITAIRE - Créer ou récupérer un établissement
// ================================================================

/// ✅ Crée un établissement dans Stardust si il n'existe pas déjà
async fn create_or_get_etablissement(
    pool: &SqlitePool,
    etablissement_info: &EtablissementInfo,
) -> Result<EtablissementInfo, String> {
    let exists = sqlx::query_scalar::<_, i64>(
        "SELECT 1 FROM Etablissement WHERE id_etablissement = ?"
    )
    .bind(&etablissement_info.id_etablissement)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Erreur vérification établissement: {}", e))?
    .unwrap_or(0) == 1;

    if exists {
        info!("✅ Établissement existe déjà dans Stardust: {}", etablissement_info.nom);
        return Ok(etablissement_info.clone());
    }

    info!("🏫 Création de l'établissement dans Stardust: {}", etablissement_info.nom);

    let now = Utc::now().to_rfc3339();

    sqlx::query(
        r#"
        INSERT INTO Etablissement (
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quartier, adresse, code_postal,
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&etablissement_info.id_etablissement)
    .bind(&etablissement_info.nom)
    .bind(&etablissement_info.sigle)
    .bind(&etablissement_info.numero_agrement)
    .bind(&etablissement_info.numero_fiscal)
    .bind(&etablissement_info.registre_commerciale)
    .bind(&etablissement_info.type_etablissement)
    .bind(&etablissement_info.statut_juridique)
    .bind(&etablissement_info.pays)
    .bind(&etablissement_info.region)
    .bind(&etablissement_info.ville)
    .bind(&etablissement_info.commune)
    .bind(&etablissement_info.quartier)
    .bind(&etablissement_info.adresse)
    .bind(&etablissement_info.code_postal)
    .bind(&etablissement_info.telephone_principal)
    .bind(&etablissement_info.telephone_secondaire)
    .bind(&etablissement_info.email)
    .bind(&etablissement_info.site_web)
    .bind(&etablissement_info.annee_scolaire_debut)
    .bind(&etablissement_info.annee_scolaire_fin)
    .bind(&etablissement_info.statut)
    .bind(&now)
    .bind(0)
    .execute(pool)
    .await
    .map_err(|e| format!("Erreur création établissement dans Stardust: {}", e))?;

    info!("✅ Établissement créé dans Stardust: {}", etablissement_info.nom);

    Ok(etablissement_info.clone())
}

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
// CREATE LICENCE - SOLUTION 1 : CRÉATION D'ABORD DANS `licences`
// ================================================================

#[command]
pub async fn create_licence(
    data: CreateLicenceRequest,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Value, String> {
    info!("🆕 CREATE_LICENCE called: {}", data.school_name);
    
    // ✅ Convertir le plan en capitalisé
    let mut data_upper = data;
    data_upper.plan = capitalize_plan(&data_upper.plan);
    
    // ✅ VALIDER LE PLAN
    let valid_plans = ["Basic", "Premium", "Gold"];
    if !valid_plans.contains(&data_upper.plan.as_str()) {
        return Ok(json!({
            "success": false,
            "error": format!("Plan invalide: {}. Plans valides: Basic, Premium, Gold", data_upper.plan)
        }));
    }
    
    let service = LicenceService::new(pool.inner().clone());
    
    // 1. ✅ Créer ou récupérer l'établissement
    let etablissement_info = data_upper.etablissement.clone().unwrap_or_else(|| {
        let id = data_upper.id_etablissement.clone().unwrap_or_else(|| Uuid::new_v4().to_string());
        EtablissementInfo {
            id_etablissement: id.clone(),
            nom: data_upper.school_name.clone(),
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
            quartier: None,
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

    let etablissement = create_or_get_etablissement(&pool, &etablissement_info).await?;

    // 2. ✅ Créer la CLÉ D'ACTIVATION (activation_keys)
    let activation_key = match service.create_licence(data_upper).await {
        Ok(key) => {
            info!("✅ CLÉ D'ACTIVATION CREATED: {}", key.key_text);
            key
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
    .bind(&activation_key.plan)
    .bind(&activation_key.plan)
    .fetch_optional(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    // 4. ✅ UTILISER LES VALEURS DE L'OFFRE
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
            let (duree, montant) = match activation_key.plan.as_str() {
                "Basic" => ("MENSUEL", 10000),
                "Premium" => ("MENSUEL", 25000),
                "Gold" => ("MENSUEL", 35000),
                _ => ("MENSUEL", 10000),
            };
            
            info!("⚠️ Aucune offre trouvée pour {}, utilisation des valeurs par défaut", activation_key.plan);
            
            (None, duree.to_string(), montant, "XOF".to_string(), true, 7)
        };

    // 5. ✅ CRÉER LA LICENCE DANS LA TABLE `licences` (SOLUTION 1)
    let licence_uuid = Uuid::new_v4().to_string();
    let etablissement_id = activation_key.id_etablissement
        .clone()
        .unwrap_or_else(|| etablissement.id_etablissement.clone());
    
    let date_fin = match duree.as_str() {
        "MENSUEL" => Utc::now() + Duration::days(30),
        "TRIMESTRIEL" => Utc::now() + Duration::days(90),
        "SEMESTRIEL" => Utc::now() + Duration::days(180),
        "ANNUEL" => Utc::now() + Duration::days(365),
        "A_VIE" => Utc::now() + Duration::days(365 * 100),
        _ => Utc::now() + Duration::days(30),
    };
    let date_fin_str = date_fin.to_rfc3339();
    let now = Utc::now().to_rfc3339();

    // ✅ Insertion dans la table licences
    let _ = sqlx::query(
        r#"
        INSERT INTO licences (
            licence_id, licence_key, id_etablissement, 
            type_licence, statut, date_expiration,
            activations_max, activations_utilisees, duree,
            created_at, updated_at
        ) VALUES (?, ?, ?, 'EDUCATION', 'ACTIVE', ?, 5, 0, ?, ?, ?)
        "#
    )
    .bind(&licence_uuid)
    .bind(&activation_key.key_text)
    .bind(&etablissement_id)
    .bind(&date_fin_str)
    .bind(&duree)
    .bind(&now)
    .bind(&now)
    .execute(&*pool)
    .await
    .map_err(|e| {
        error!("❌ LICENCE INSERT ERROR: {:?}", e);
        e.to_string()
    })?;

    info!("✅ LICENCE INSERTED: {}", licence_uuid);

    // 6. ✅ CRÉER L'ABONNEMENT AVEC LE BON ID (licence_uuid)
    let abonnement_id = Uuid::new_v4().to_string();

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
    .bind(&licence_uuid)  // ✅ BON ID (table licences)
    .bind(&offre_id)
    .bind(&activation_key.plan)
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
        "licence_key": activation_key.key_text,
        "school_name": activation_key.school_name,
        "offre_id": offre_id,
        "etablissement": etablissement.nom,
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

    // 7. Récupérer l'abonnement créé
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

    // 8. Exporter la licence avec l'établissement
    let licence_file = service.export_licence_key_with_etablissement(
        activation_key.id,
        &etablissement,
    ).await.map_err(|e| e.to_string())?;

    info!("✅ LICENCE EXPORTED with établissement: {}", etablissement.nom);

    // 9. Retourner le résultat
    Ok(json!({
        "success": true,
        "activation_key": activation_key,
        "licence_id": licence_uuid,
        "abonnement": abonnement,
        "licence_file": licence_file,
        "message": format!("Licence et abonnement créés pour {}", activation_key.school_name)
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
// REVOKE LICENCE
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
// SUSPEND LICENCE
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
// REACTIVATE LICENCE
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

    let activation_key = ActivationKey {
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
    };
    
    info!("✅ TEST ACTIVATION KEY CREATED: id={}, key={}", activation_key.id, activation_key.key_text);

    // ✅ Créer la licence dans la table licences
    let licence_uuid = Uuid::new_v4().to_string();
    let date_fin = Utc::now() + Duration::days(30);
    let date_fin_str = date_fin.to_rfc3339();

    let _ = sqlx::query(
        r#"
        INSERT INTO licences (
            licence_id, licence_key, id_etablissement, 
            type_licence, statut, date_expiration,
            activations_max, activations_utilisees, duree,
            created_at, updated_at
        ) VALUES (?, ?, ?, 'EDUCATION', 'ACTIVE', ?, 5, 0, 'MENSUEL', ?, ?)
        "#
    )
    .bind(&licence_uuid)
    .bind(&activation_key.key_text)
    .bind(&etablissement_id)
    .bind(&date_fin_str)
    .bind(&now)
    .bind(&now)
    .execute(&*pool.inner())
    .await
    .map_err(|e| {
        error!("❌ LICENCE INSERT ERROR: {:?}", e);
        e.to_string()
    })?;

    info!("✅ TEST LICENCE INSERTED: {}", licence_uuid);

    // ✅ Créer l'abonnement
    let abonnement_id = Uuid::new_v4().to_string();
    let montant = 25000;

    let _ = sqlx::query(
        r#"
        INSERT INTO abonnements (
            abonnement_id, id_etablissement, licence_id, 
            plan, duree, montant_original, montant_remise, montant_final,
            devise, date_debut, date_prochain_paiement, date_fin,
            statut, renouvellement_auto, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'MENSUEL', ?, 0, ?, 'XOF', ?, ?, ?, 'ACTIF', 1, ?, ?, ?)
        "#
    )
    .bind(&abonnement_id)
    .bind(&etablissement_id)
    .bind(&licence_uuid)  // ✅ BON ID
    .bind(&activation_key.plan)
    .bind(montant)
    .bind(montant)
    .bind(&now)
    .bind(&now)
    .bind(&date_fin_str)
    .bind(json!({
        "created_from": "test_licence_creation",
        "licence_key": activation_key.key_text,
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
        "activation_key": activation_key,
        "licence_id": licence_uuid,
        "abonnement_id": abonnement_id,
        "message": format!("Licence et abonnement de test créés pour {}", activation_key.school_name)
    }))
}