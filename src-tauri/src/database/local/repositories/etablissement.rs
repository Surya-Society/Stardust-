// src/database/local/repositories/etablissement.rs - VERSION COMPLÈTE CORRIGÉE
use sqlx::{SqlitePool, Row};
use crate::models::etablissement::Etablissement;
use anyhow::Result;
use log::{info, warn};
use uuid::Uuid;

/// ✅ Récupère tous les établissements non synchronisés
/// ✅ CORRIGÉ: Génère un UUID si l'ID est vide
/// ✅ CORRIGÉ: Utilise `quartier` au lieu de `quatier`
pub async fn get_unsynced(pool: &SqlitePool) -> Result<Vec<Etablissement>> {
    let rows = sqlx::query(
        r#"
        SELECT 
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quartier, adresse, code_postal,  -- ✅ quartier
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        FROM Etablissement 
        WHERE synced = 0
        "#
    )
    .fetch_all(pool)
    .await?;

    let mut etablissements = Vec::new();
    
    for row in rows {
        let mut etab = Etablissement {
            id_etablissement: row.get("id_etablissement"),
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
            quartier: row.get("quartier"),  // ✅ quartier
            adresse: row.get("adresse"),
            code_postal: row.get("code_postal"),
            telephone_principal: row.get("telephone_principal"),
            telephone_secondaire: row.get("telephone_secondaire"),
            email: row.get("email"),
            site_web: row.get("site_web"),
            annee_scolaire_debut: row.get("annee_scolaire_debut"),
            annee_scolaire_fin: row.get("annee_scolaire_fin"),
            statut: row.get("statut"),
            date_creation: row.get("date_creation"),
            date_modification: row.get("date_modification"),
            synced: row.get("synced"),
            sync_date: row.get("sync_date"),
        };
        
        // ✅ CORRECTION: Générer un UUID si l'ID est vide
        if etab.id_etablissement.is_empty() {
            let new_id = Uuid::new_v4().to_string();
            warn!("🆔 ID d'établissement vide pour '{}', génération: {}", etab.nom, new_id);
            
            // ✅ Mettre à jour en base avec le nouvel ID
            let now = chrono::Utc::now().to_rfc3339();
            sqlx::query(
                r#"
                UPDATE Etablissement 
                SET id_etablissement = ?, sync_date = ? 
                WHERE id_etablissement = '' AND nom = ?
                "#
            )
            .bind(&new_id)
            .bind(&now)
            .bind(&etab.nom)
            .execute(pool)
            .await?;
            
            etab.id_etablissement = new_id;
            info!("✅ ID généré et mis à jour pour '{}'", etab.nom);
        }
        
        etablissements.push(etab);
    }

    info!("📤 {} établissements non synchronisés récupérés", etablissements.len());
    Ok(etablissements)
}

/// ✅ Marque un établissement comme synchronisé
pub async fn mark_synced(pool: &SqlitePool, id: &str) -> Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        UPDATE Etablissement 
        SET synced = 1, sync_date = ? 
        WHERE id_etablissement = ?
        "#
    )
    .bind(&now)
    .bind(id)
    .execute(pool)
    .await?;

    info!("✅ Établissement marqué synchronisé: {}", id);
    Ok(())
}

/// ✅ Récupère un établissement par son ID
/// ✅ CORRIGÉ: Utilise `quartier` au lieu de `quatier`
pub async fn get_by_id(pool: &SqlitePool, id: &str) -> Result<Option<Etablissement>> {
    let row = sqlx::query(
        r#"
        SELECT 
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quartier, adresse, code_postal,  -- ✅ quartier
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        FROM Etablissement 
        WHERE id_etablissement = ?
        "#
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    if let Some(row) = row {
        Ok(Some(Etablissement {
            id_etablissement: row.get("id_etablissement"),
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
            quartier: row.get("quartier"),  // ✅ quartier
            adresse: row.get("adresse"),
            code_postal: row.get("code_postal"),
            telephone_principal: row.get("telephone_principal"),
            telephone_secondaire: row.get("telephone_secondaire"),
            email: row.get("email"),
            site_web: row.get("site_web"),
            annee_scolaire_debut: row.get("annee_scolaire_debut"),
            annee_scolaire_fin: row.get("annee_scolaire_fin"),
            statut: row.get("statut"),
            date_creation: row.get("date_creation"),
            date_modification: row.get("date_modification"),
            synced: row.get("synced"),
            sync_date: row.get("sync_date"),
        }))
    } else {
        Ok(None)
    }
}

/// ✅ Met à jour l'ID d'un établissement (correction des IDs vides)
pub async fn fix_empty_ids(pool: &SqlitePool) -> Result<usize> {
    info!("🔧 Recherche des établissements avec ID vide...");
    
    let rows = sqlx::query(
        r#"
        SELECT nom, date_creation 
        FROM Etablissement 
        WHERE id_etablissement = '' OR id_etablissement IS NULL
        "#
    )
    .fetch_all(pool)
    .await?;

    if rows.is_empty() {
        info!("✅ Aucun établissement avec ID vide trouvé");
        return Ok(0);
    }

    info!("🔧 {} établissements avec ID vide trouvés", rows.len());

    let mut count = 0;
    let now = chrono::Utc::now().to_rfc3339();

    for row in rows {
        let nom: String = row.get("nom");
        let new_id = Uuid::new_v4().to_string();
        
        sqlx::query(
            r#"
            UPDATE Etablissement 
            SET id_etablissement = ?, sync_date = ? 
            WHERE id_etablissement = '' AND nom = ?
            "#
        )
        .bind(&new_id)
        .bind(&now)
        .bind(&nom)
        .execute(pool)
        .await?;
        
        count += 1;
        info!("✅ ID généré pour '{}' → {}", nom, new_id);
    }

    info!("✅ {} ID d'établissements corrigés", count);
    Ok(count)
}

/// ✅ Insère ou met à jour un établissement (avec génération d'ID si vide)
/// ✅ CORRIGÉ: Utilise `quartier` au lieu de `quatier`
pub async fn upsert(pool: &SqlitePool, etab: &Etablissement) -> Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    
    // ✅ Générer un ID si vide
    let id_etablissement = if etab.id_etablissement.is_empty() {
        let new_id = Uuid::new_v4().to_string();
        info!("🆔 ID généré pour upsert: {}", new_id);
        new_id
    } else {
        etab.id_etablissement.clone()
    };
    
    sqlx::query(
        r#"
        INSERT INTO Etablissement (
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quartier, adresse, code_postal,  -- ✅ quartier
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            quartier = EXCLUDED.quartier,  -- ✅ quartier
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
    .bind(&id_etablissement)
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
    .bind(&etab.quartier)  // ✅ quartier
    .bind(&etab.adresse)
    .bind(&etab.code_postal)
    .bind(&etab.telephone_principal)
    .bind(&etab.telephone_secondaire)
    .bind(&etab.email)
    .bind(&etab.site_web)
    .bind(&etab.annee_scolaire_debut)
    .bind(&etab.annee_scolaire_fin)
    .bind(&etab.statut)
    .bind(&etab.date_creation)
    .bind(&etab.date_modification)
    .bind(etab.synced)
    .bind(&etab.sync_date)
    .execute(pool)
    .await?;

    Ok(())
}