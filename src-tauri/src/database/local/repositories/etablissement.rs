// src/database/local/repositories/etablissement.rs
use sqlx::{SqlitePool, Row};
use crate::models::etablissement::Etablissement;
use anyhow::Result;
use log::info;

/// ✅ Récupère tous les établissements non synchronisés
pub async fn get_unsynced(pool: &SqlitePool) -> Result<Vec<Etablissement>> {
    let rows = sqlx::query(
        r#"
        SELECT 
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quatier, adresse, code_postal,
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
        etablissements.push(Etablissement {
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
            quatier: row.get("quatier"),
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
        });
    }

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

    Ok(())
}