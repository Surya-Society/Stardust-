// src/database/local/repositories/abonnement.rs
use sqlx::{SqlitePool, Row};
use crate::models::abonnement::Abonnement;
use anyhow::Result;
use log::info;

/// ✅ Récupère tous les abonnements non synchronisés
pub async fn get_unsynced(pool: &SqlitePool) -> Result<Vec<Abonnement>> {
    let rows = sqlx::query(
        r#"
        SELECT 
            abonnement_id, id_etablissement, licence_id, offre_id,
            plan, duree, montant_original, montant_remise, montant_final,
            devise, date_debut, date_debut_periode, date_fin_periode,
            date_prochain_paiement, date_fin, date_annulation,
            statut, statut_renouvellement, renouvellement_auto,
            metadata, created_at, updated_at, synced, sync_date
        FROM abonnements
        WHERE synced = 0
        ORDER BY created_at ASC
        "#
    )
    .fetch_all(pool)
    .await?;

    let mut abonnements = Vec::new();
    for row in rows {
        abonnements.push(Abonnement {
            abonnement_id: row.get("abonnement_id"),
            id_etablissement: row.get("id_etablissement"),
            licence_id: row.get("licence_id"),
            offre_id: row.get("offre_id"),
            plan: row.get("plan"),
            duree: row.get("duree"),
            montant_original: row.get("montant_original"),
            montant_remise: row.get("montant_remise"),
            montant_final: row.get("montant_final"),
            devise: row.get("devise"),
            date_debut: row.get("date_debut"),
            date_debut_periode: row.get("date_debut_periode"),
            date_fin_periode: row.get("date_fin_periode"),
            date_prochain_paiement: row.get("date_prochain_paiement"),
            date_fin: row.get("date_fin"),
            date_annulation: row.get("date_annulation"),
            statut: row.get("statut"),
            statut_renouvellement: row.get("statut_renouvellement"),
            renouvellement_auto: row.get("renouvellement_auto"),
            metadata: row.get("metadata"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            synced: row.get("synced"),
            sync_date: row.get("sync_date"),
        });
    }

    Ok(abonnements)
}

/// ✅ Marque un abonnement comme synchronisé
pub async fn mark_synced(pool: &SqlitePool, abonnement_id: &str) -> Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        UPDATE abonnements 
        SET synced = 1, sync_date = ? 
        WHERE abonnement_id = ?
        "#
    )
    .bind(&now)
    .bind(abonnement_id)
    .execute(pool)
    .await?;

    Ok(())
}