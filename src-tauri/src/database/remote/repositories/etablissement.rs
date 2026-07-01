// src/database/remote/repositories/etablissement.rs - VERSION COMPLÈTE CORRIGÉE
use sqlx::{PgPool, Row, Executor, Postgres};
use crate::models::etablissement::Etablissement;
use anyhow::Result;
use log::{info, error, warn};
use uuid::Uuid;

/// ✅ Récupère tous les établissements depuis PostgreSQL
/// ✅ CORRIGÉ: Convertit UUID → String et TIMESTAMPTZ → String
pub async fn get_all(pool: &PgPool) -> Result<Vec<Etablissement>> {
    let rows = sqlx::query(
        r#"
        SELECT 
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quartier, adresse, code_postal,
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        FROM Etablissement
        ORDER BY date_creation DESC
        "#
    )
    .fetch_all(pool)
    .await?;

    let mut etablissements = Vec::new();
    for row in rows {
        // ✅ UUID → String
        let id_uuid: Uuid = row.get("id_etablissement");
        let id_etablissement = id_uuid.to_string();
        
        // ✅ TIMESTAMPTZ → String
        let date_creation: chrono::DateTime<chrono::Utc> = row.get("date_creation");
        let date_creation_str = date_creation.to_rfc3339();
        
        let date_modification: Option<chrono::DateTime<chrono::Utc>> = row.get("date_modification");
        let date_modification_str = date_modification.map(|d| d.to_rfc3339());
        
        let sync_date: Option<chrono::DateTime<chrono::Utc>> = row.get("sync_date");
        let sync_date_str = sync_date.map(|d| d.to_rfc3339());

        etablissements.push(Etablissement {
            id_etablissement,
            nom: row.get("nom"),
            sigle: row.get("sigle"),
            numero_agrement: row.get("numero_agrement"),
            numero_fiscal: row.get("numero_fiscal"),
            registre_commerciale: row.get("registre_commerciale"),
            type_etablissement: row.get("type_etablissement"),
            statut_juridique: row.get("statut_juridique"),
            pays: row.get("pays"),
            region: row.get("region"),
            ville: row.get("ville"),
            commune: row.get("commune"),
            quartier: row.get("quartier"),
            adresse: row.get("adresse"),
            code_postal: row.get("code_postal"),
            telephone_principal: row.get("telephone_principal"),
            telephone_secondaire: row.get("telephone_secondaire"),
            email: row.get("email"),
            site_web: row.get("site_web"),
            annee_scolaire_debut: row.get("annee_scolaire_debut"),
            annee_scolaire_fin: row.get("annee_scolaire_fin"),
            statut: row.get("statut"),
            date_creation: date_creation_str,
            date_modification: date_modification_str,
            synced: row.get("synced"),
            sync_date: sync_date_str,
        });
    }

    info!("📥 {} établissements récupérés depuis PostgreSQL", etablissements.len());
    Ok(etablissements)
}

/// ✅ Récupère un établissement par son ID
/// ✅ CORRIGÉ: Convertit UUID → String et TIMESTAMPTZ → String
pub async fn get_by_id(pool: &PgPool, id: &str) -> Result<Option<Etablissement>> {
    let row = sqlx::query(
        r#"
        SELECT 
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quartier, adresse, code_postal,
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        FROM Etablissement
        WHERE id_etablissement = $1
        "#
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    if let Some(row) = row {
        // ✅ UUID → String
        let id_uuid: Uuid = row.get("id_etablissement");
        let id_etablissement = id_uuid.to_string();
        
        // ✅ TIMESTAMPTZ → String
        let date_creation: chrono::DateTime<chrono::Utc> = row.get("date_creation");
        let date_creation_str = date_creation.to_rfc3339();
        
        let date_modification: Option<chrono::DateTime<chrono::Utc>> = row.get("date_modification");
        let date_modification_str = date_modification.map(|d| d.to_rfc3339());
        
        let sync_date: Option<chrono::DateTime<chrono::Utc>> = row.get("sync_date");
        let sync_date_str = sync_date.map(|d| d.to_rfc3339());

        Ok(Some(Etablissement {
            id_etablissement,
            nom: row.get("nom"),
            sigle: row.get("sigle"),
            numero_agrement: row.get("numero_agrement"),
            numero_fiscal: row.get("numero_fiscal"),
            registre_commerciale: row.get("registre_commerciale"),
            type_etablissement: row.get("type_etablissement"),
            statut_juridique: row.get("statut_juridique"),
            pays: row.get("pays"),
            region: row.get("region"),
            ville: row.get("ville"),
            commune: row.get("commune"),
            quartier: row.get("quartier"),
            adresse: row.get("adresse"),
            code_postal: row.get("code_postal"),
            telephone_principal: row.get("telephone_principal"),
            telephone_secondaire: row.get("telephone_secondaire"),
            email: row.get("email"),
            site_web: row.get("site_web"),
            annee_scolaire_debut: row.get("annee_scolaire_debut"),
            annee_scolaire_fin: row.get("annee_scolaire_fin"),
            statut: row.get("statut"),
            date_creation: date_creation_str,
            date_modification: date_modification_str,
            synced: row.get("synced"),
            sync_date: sync_date_str,
        }))
    } else {
        Ok(None)
    }
}

/// ✅ Insère ou met à jour un établissement dans PostgreSQL
/// ✅ CORRIGÉ: Convertit l'ID en UUID
/// ✅ CORRIGÉ: Convertit les dates en TIMESTAMPTZ
pub async fn upsert<'a, E>(executor: E, etab: &Etablissement) -> Result<()>
where
    E: Executor<'a, Database = Postgres>,
{
    // ✅ Convertir l'ID en UUID
    let id_uuid = match Uuid::parse_str(&etab.id_etablissement) {
        Ok(uuid) => uuid,
        Err(_) => {
            let new_id = Uuid::new_v4();
            warn!("🆔 ID invalide '{}', remplacement par {}", etab.id_etablissement, new_id);
            new_id
        }
    };
    
    // ✅ Convertir les dates en TIMESTAMPTZ
    let created_at = chrono::DateTime::parse_from_rfc3339(&etab.date_creation)
        .map(|dt| dt.with_timezone(&chrono::Utc))
        .unwrap_or_else(|_| chrono::Utc::now());
    
    let updated_at = etab.date_modification.as_ref()
        .and_then(|d| chrono::DateTime::parse_from_rfc3339(d).ok())
        .map(|dt| dt.with_timezone(&chrono::Utc));
    
    let sync_date = etab.sync_date.as_ref()
        .and_then(|d| chrono::DateTime::parse_from_rfc3339(d).ok())
        .map(|dt| dt.with_timezone(&chrono::Utc));
    
    info!("📝 Upsert établissement: {} ({})", etab.nom, id_uuid);
    
    let result = sqlx::query(
        r#"
        INSERT INTO Etablissement (
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quartier, adresse, code_postal,
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
        ON CONFLICT (id_etablissement) DO UPDATE SET
            nom = EXCLUDED.nom,
            sigle = EXCLUDED.sigle,
            numero_agrement = EXCLUDED.numero_agrement,
            numero_fiscal = EXCLUDED.numero_fiscal,
            registre_commerciale = EXCLUDED.registre_commerciale,
            type_etablissement = EXCLUDED.type_etablissement,
            statut_juridique = EXCLUDED.statut_juridique,
            pays = EXCLUDED.pays,
            region = EXCLUDED.region,
            ville = EXCLUDED.ville,
            commune = EXCLUDED.commune,
            quartier = EXCLUDED.quartier,
            adresse = EXCLUDED.adresse,
            code_postal = EXCLUDED.code_postal,
            telephone_principal = EXCLUDED.telephone_principal,
            telephone_secondaire = EXCLUDED.telephone_secondaire,
            email = EXCLUDED.email,
            site_web = EXCLUDED.site_web,
            annee_scolaire_debut = EXCLUDED.annee_scolaire_debut,
            annee_scolaire_fin = EXCLUDED.annee_scolaire_fin,
            statut = EXCLUDED.statut,
            date_modification = EXCLUDED.date_modification,
            synced = EXCLUDED.synced,
            sync_date = EXCLUDED.sync_date
        "#
    )
    .bind(id_uuid)  // ✅ UUID
    .bind(&etab.nom)
    .bind(&etab.sigle)
    .bind(&etab.numero_agrement)
    .bind(&etab.numero_fiscal)
    .bind(&etab.registre_commerciale)
    .bind(&etab.type_etablissement)
    .bind(&etab.statut_juridique)
    .bind(&etab.pays)
    .bind(&etab.region)
    .bind(&etab.ville)
    .bind(&etab.commune)
    .bind(&etab.quartier)
    .bind(&etab.adresse)
    .bind(&etab.code_postal)
    .bind(&etab.telephone_principal)
    .bind(&etab.telephone_secondaire)
    .bind(&etab.email)
    .bind(&etab.site_web)
    .bind(&etab.annee_scolaire_debut)
    .bind(&etab.annee_scolaire_fin)
    .bind(&etab.statut)
    .bind(created_at)  // ✅ TIMESTAMPTZ
    .bind(updated_at)  // ✅ TIMESTAMPTZ
    .bind(1)  // synced
    .bind(sync_date)   // ✅ TIMESTAMPTZ
    .execute(executor)
    .await;

    match result {
        Ok(_) => {
            info!("✅ Établissement synchronisé vers PostgreSQL: {} ({})", etab.nom, id_uuid);
            Ok(())
        }
        Err(e) => {
            error!("❌ Erreur upsert établissement {}: {}", id_uuid, e);
            Err(e.into())
        }
    }
}

/// ✅ Version simplifiée pour PgPool
pub async fn upsert_simple(pool: &PgPool, etab: &Etablissement) -> Result<()> {
    upsert(pool, etab).await
}

/// ✅ Insère ou met à jour plusieurs établissements en batch
pub async fn upsert_batch(pool: &PgPool, etablissements: &[Etablissement]) -> Result<usize> {
    if etablissements.is_empty() {
        return Ok(0);
    }

    info!("📤 Upsert batch de {} établissements", etablissements.len());
    
    let mut tx = pool.begin().await?;
    let mut success_count = 0;
    let mut errors = Vec::new();

    for etab in etablissements {
        match upsert(&mut *tx, etab).await {
            Ok(_) => success_count += 1,
            Err(e) => {
                error!("❌ Erreur upsert {}: {}", etab.nom, e);
                errors.push(format!("{}: {}", etab.nom, e));
            }
        }
    }

    if !errors.is_empty() {
        error!("❌ Erreurs batch: {:?}", errors);
    }

    tx.commit().await?;
    
    info!("✅ {} établissements upsertés avec succès", success_count);
    Ok(success_count)
}

/// ✅ Récupère les établissements modifiés depuis une date
/// ✅ CORRIGÉ: Convertit UUID → String et TIMESTAMPTZ → String
pub async fn get_updated_since(pool: &PgPool, since: &str) -> Result<Vec<Etablissement>> {
    let rows = sqlx::query(
        r#"
        SELECT 
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quartier, adresse, code_postal,
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        FROM Etablissement
        WHERE date_modification > $1 OR sync_date > $1
        ORDER BY date_modification DESC
        "#
    )
    .bind(since)
    .fetch_all(pool)
    .await?;

    let mut etablissements = Vec::new();
    for row in rows {
        // ✅ UUID → String
        let id_uuid: Uuid = row.get("id_etablissement");
        let id_etablissement = id_uuid.to_string();
        
        // ✅ TIMESTAMPTZ → String
        let date_creation: chrono::DateTime<chrono::Utc> = row.get("date_creation");
        let date_creation_str = date_creation.to_rfc3339();
        
        let date_modification: Option<chrono::DateTime<chrono::Utc>> = row.get("date_modification");
        let date_modification_str = date_modification.map(|d| d.to_rfc3339());
        
        let sync_date: Option<chrono::DateTime<chrono::Utc>> = row.get("sync_date");
        let sync_date_str = sync_date.map(|d| d.to_rfc3339());

        etablissements.push(Etablissement {
            id_etablissement,
            nom: row.get("nom"),
            sigle: row.get("sigle"),
            numero_agrement: row.get("numero_agrement"),
            numero_fiscal: row.get("numero_fiscal"),
            registre_commerciale: row.get("registre_commerciale"),
            type_etablissement: row.get("type_etablissement"),
            statut_juridique: row.get("statut_juridique"),
            pays: row.get("pays"),
            region: row.get("region"),
            ville: row.get("ville"),
            commune: row.get("commune"),
            quartier: row.get("quartier"),
            adresse: row.get("adresse"),
            code_postal: row.get("code_postal"),
            telephone_principal: row.get("telephone_principal"),
            telephone_secondaire: row.get("telephone_secondaire"),
            email: row.get("email"),
            site_web: row.get("site_web"),
            annee_scolaire_debut: row.get("annee_scolaire_debut"),
            annee_scolaire_fin: row.get("annee_scolaire_fin"),
            statut: row.get("statut"),
            date_creation: date_creation_str,
            date_modification: date_modification_str,
            synced: row.get("synced"),
            sync_date: sync_date_str,
        });
    }

    info!("📥 {} établissements modifiés depuis {}", etablissements.len(), since);
    Ok(etablissements)
}

/// ✅ Vérifie si un établissement existe
pub async fn exists(pool: &PgPool, id: &str) -> Result<bool> {
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM Etablissement WHERE id_etablissement = $1"
    )
    .bind(id)
    .fetch_one(pool)
    .await?;
    
    Ok(count > 0)
}

/// ✅ Supprime un établissement (soft delete)
pub async fn soft_delete(pool: &PgPool, id: &str) -> Result<bool> {
    let result = sqlx::query(
        r#"
        UPDATE Etablissement 
        SET statut = 'INACTIF', date_modification = CURRENT_TIMESTAMP 
        WHERE id_etablissement = $1
        "#
    )
    .bind(id)
    .execute(pool)
    .await?;
    
    Ok(result.rows_affected() > 0)
}