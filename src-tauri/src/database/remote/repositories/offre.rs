// src/database/remote/repositories/offre.rs
use sqlx::{PgPool, Row};
use crate::models::offre::Offre;
use anyhow::Result;
use log::info;

/// ✅ Récupère toutes les offres actives depuis PostgreSQL
pub async fn get_active_offres(pool: &PgPool) -> Result<Vec<Offre>> {
    let rows = sqlx::query(
        r#"
        SELECT 
            offre_id::TEXT, code, nom, description, statut, duree,
            prix, devise, prix_original, reduction_pourcentage,
            essai_gratuit, duree_essai_jours, fonctionnalites,
            renouvellement_automatique, grace_period_jours,
            icon, couleur, ordre_affichage, est_populaire, est_meilleur_rapport,
            nombre_abonnes, total_revenu, created_at, updated_at
        FROM offres
        WHERE statut = 'ACTIF'
        ORDER BY ordre_affichage ASC
        "#
    )
    .fetch_all(pool)
    .await?;

    let mut offres = Vec::new();
    for row in rows {
        offres.push(Offre {
            offre_id: row.get("offre_id"),  // ✅ Maintenant compatible avec String
            code: row.get("code"),
            nom: row.get("nom"),
            description: row.get("description"),
            statut: row.get("statut"),
            duree: row.get("duree"),
            prix: row.get("prix"),
            devise: row.get("devise"),
            prix_original: row.get("prix_original"),
            reduction_pourcentage: row.get("reduction_pourcentage"),
            essai_gratuit: row.get("essai_gratuit"),
            duree_essai_jours: row.get("duree_essai_jours"),
            fonctionnalites: row.get("fonctionnalites"),
            renouvellement_automatique: row.get("renouvellement_automatique"),
            grace_period_jours: row.get("grace_period_jours"),
            icon: row.get("icon"),
            couleur: row.get("couleur"),
            ordre_affichage: row.get("ordre_affichage"),
            est_populaire: row.get("est_populaire"),
            est_meilleur_rapport: row.get("est_meilleur_rapport"),
            nombre_abonnes: row.get("nombre_abonnes"),
            total_revenu: row.get("total_revenu"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    Ok(offres)
}

/// ✅ Récupère une offre par son ID
pub async fn get_by_id(pool: &PgPool, offre_id: &str) -> Result<Option<Offre>> {
    let row = sqlx::query(
        r#"
        SELECT 
            offre_id::TEXT, code, nom, description, statut, duree,
            prix, devise, prix_original, reduction_pourcentage,
            essai_gratuit, duree_essai_jours, fonctionnalites,
            renouvellement_automatique, grace_period_jours,
            icon, couleur, ordre_affichage, est_populaire, est_meilleur_rapport,
            nombre_abonnes, total_revenu, created_at, updated_at
        FROM offres
        WHERE offre_id = $1
        "#
    )
    .bind(offre_id)
    .fetch_optional(pool)
    .await?;

    if let Some(row) = row {
        Ok(Some(Offre {
            offre_id: row.get("offre_id"),
            code: row.get("code"),
            nom: row.get("nom"),
            description: row.get("description"),
            statut: row.get("statut"),
            duree: row.get("duree"),
            prix: row.get("prix"),
            devise: row.get("devise"),
            prix_original: row.get("prix_original"),
            reduction_pourcentage: row.get("reduction_pourcentage"),
            essai_gratuit: row.get("essai_gratuit"),
            duree_essai_jours: row.get("duree_essai_jours"),
            fonctionnalites: row.get("fonctionnalites"),
            renouvellement_automatique: row.get("renouvellement_automatique"),
            grace_period_jours: row.get("grace_period_jours"),
            icon: row.get("icon"),
            couleur: row.get("couleur"),
            ordre_affichage: row.get("ordre_affichage"),
            est_populaire: row.get("est_populaire"),
            est_meilleur_rapport: row.get("est_meilleur_rapport"),
            nombre_abonnes: row.get("nombre_abonnes"),
            total_revenu: row.get("total_revenu"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }))
    } else {
        Ok(None)
    }
}