// src/database/local/repositories/offre.rs
use sqlx::{PgPool, Row};  
use crate::models::offre::Offre;
use anyhow::Result;
use log::info;

/// ✅ Récupère toutes les offres depuis PostgreSQL
pub async fn get_all(pool: &PgPool) -> Result<Vec<Offre>> {
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
            offre_id: row.get("offre_id"),  // ✅ Maintenant c'est un TEXT
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

/// ✅ Récupère toutes les offres (y compris inactives) depuis PostgreSQL
pub async fn get_all_with_inactive(pool: &PgPool) -> Result<Vec<Offre>> {
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
        ORDER BY ordre_affichage ASC
        "#
    )
    .fetch_all(pool)
    .await?;

    let mut offres = Vec::new();
    for row in rows {
        offres.push(Offre {
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
        });
    }

    Ok(offres)
}

/// ✅ Insère ou met à jour une offre dans PostgreSQL (avec conversion UUID → TEXT)
pub async fn upsert(pool: &PgPool, offre: &Offre) -> Result<()> {
    sqlx::query(
        r#"
        INSERT INTO offres (
            offre_id, code, nom, description, statut, duree,
            prix, devise, prix_original, reduction_pourcentage,
            essai_gratuit, duree_essai_jours, fonctionnalites,
            renouvellement_automatique, grace_period_jours,
            icon, couleur, ordre_affichage, est_populaire, est_meilleur_rapport,
            nombre_abonnes, total_revenu, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'ACTIF', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        ON CONFLICT (offre_id) DO UPDATE SET
            code = EXCLUDED.code,
            nom = EXCLUDED.nom,
            description = EXCLUDED.description,
            statut = EXCLUDED.statut,
            duree = EXCLUDED.duree,
            prix = EXCLUDED.prix,
            devise = EXCLUDED.devise,
            prix_original = EXCLUDED.prix_original,
            reduction_pourcentage = EXCLUDED.reduction_pourcentage,
            essai_gratuit = EXCLUDED.essai_gratuit,
            duree_essai_jours = EXCLUDED.duree_essai_jours,
            fonctionnalites = EXCLUDED.fonctionnalites,
            renouvellement_automatique = EXCLUDED.renouvellement_automatique,
            grace_period_jours = EXCLUDED.grace_period_jours,
            icon = EXCLUDED.icon,
            couleur = EXCLUDED.couleur,
            ordre_affichage = EXCLUDED.ordre_affichage,
            est_populaire = EXCLUDED.est_populaire,
            est_meilleur_rapport = EXCLUDED.est_meilleur_rapport,
            nombre_abonnes = EXCLUDED.nombre_abonnes,
            total_revenu = EXCLUDED.total_revenu,
            updated_at = EXCLUDED.updated_at
        "#
    )
    .bind(&offre.offre_id)  // ✅ String compatible avec UUID::parse
    .bind(&offre.code)
    .bind(&offre.nom)
    .bind(&offre.description)
    .bind(&offre.duree)
    .bind(offre.prix)
    .bind(&offre.devise)
    .bind(offre.prix_original)
    .bind(offre.reduction_pourcentage)
    .bind(offre.essai_gratuit)
    .bind(offre.duree_essai_jours)
    .bind(&offre.fonctionnalites)
    .bind(offre.renouvellement_automatique)
    .bind(offre.grace_period_jours)
    .bind(&offre.icon)
    .bind(&offre.couleur)
    .bind(offre.ordre_affichage)
    .bind(offre.est_populaire)
    .bind(offre.est_meilleur_rapport)
    .bind(offre.nombre_abonnes)
    .bind(offre.total_revenu)
    .bind(&offre.created_at)
    .bind(&offre.updated_at)
    .execute(pool)
    .await?;

    Ok(())
}