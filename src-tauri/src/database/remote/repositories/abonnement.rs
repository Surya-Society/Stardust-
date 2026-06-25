// src/database/remote/repositories/abonnement.rs
use sqlx::{PgPool, Row};
use crate::models::abonnement::Abonnement;
use anyhow::Result;
use log::info;

/// ✅ Récupère tous les abonnements depuis PostgreSQL
pub async fn get_all(pool: &PgPool) -> Result<Vec<Abonnement>> {
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
        ORDER BY created_at DESC
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

/// ✅ Insère ou met à jour un abonnement dans PostgreSQL
pub async fn upsert(pool: &PgPool, abonnement: &Abonnement) -> Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        INSERT INTO abonnements (
            abonnement_id, id_etablissement, licence_id, offre_id,
            plan, duree, montant_original, montant_remise, montant_final,
            devise, date_debut, date_debut_periode, date_fin_periode,
            date_prochain_paiement, date_fin, date_annulation,
            statut, statut_renouvellement, renouvellement_auto,
            metadata, created_at, updated_at, synced, sync_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (abonnement_id) DO UPDATE SET
            id_etablissement = EXCLUDED.id_etablissement,
            licence_id = EXCLUDED.licence_id,
            offre_id = EXCLUDED.offre_id,
            plan = EXCLUDED.plan,
            duree = EXCLUDED.duree,
            montant_original = EXCLUDED.montant_original,
            montant_remise = EXCLUDED.montant_remise,
            montant_final = EXCLUDED.montant_final,
            devise = EXCLUDED.devise,
            date_debut = EXCLUDED.date_debut,
            date_debut_periode = EXCLUDED.date_debut_periode,
            date_fin_periode = EXCLUDED.date_fin_periode,
            date_prochain_paiement = EXCLUDED.date_prochain_paiement,
            date_fin = EXCLUDED.date_fin,
            date_annulation = EXCLUDED.date_annulation,
            statut = EXCLUDED.statut,
            statut_renouvellement = EXCLUDED.statut_renouvellement,
            renouvellement_auto = EXCLUDED.renouvellement_auto,
            metadata = EXCLUDED.metadata,
            updated_at = EXCLUDED.updated_at,
            synced = EXCLUDED.synced,
            sync_date = EXCLUDED.sync_date
        "#
    )
    .bind(&abonnement.abonnement_id)
    .bind(&abonnement.id_etablissement)
    .bind(&abonnement.licence_id)
    .bind(&abonnement.offre_id)
    .bind(&abonnement.plan)
    .bind(&abonnement.duree)
    .bind(abonnement.montant_original)
    .bind(abonnement.montant_remise)
    .bind(abonnement.montant_final)
    .bind(&abonnement.devise)
    .bind(&abonnement.date_debut)
    .bind(&abonnement.date_debut_periode)
    .bind(&abonnement.date_fin_periode)
    .bind(&abonnement.date_prochain_paiement)
    .bind(&abonnement.date_fin)
    .bind(&abonnement.date_annulation)
    .bind(&abonnement.statut)
    .bind(&abonnement.statut_renouvellement)
    .bind(abonnement.renouvellement_auto)
    .bind(&abonnement.metadata)
    .bind(&abonnement.created_at)
    .bind(&abonnement.updated_at)
    .bind(1)
    .bind(&now)
    .execute(pool)
    .await?;

    Ok(())
}

/// ✅ Récupère les abonnements modifiés depuis une date
pub async fn get_updated_since(
    pool: &PgPool,
    since: &str,
) -> Result<Vec<Abonnement>> {
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
        WHERE sync_date > $1 OR updated_at > $1
        "#
    )
    .bind(since)
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