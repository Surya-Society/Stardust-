use sqlx::{PgPool, Row};
use anyhow::Result;
use log::info;
use chrono::Utc;

use crate::models::offre::{Offre, CreateOffreRequest, UpdateOffreRequest};

pub struct OffreService {
    pool: PgPool,
}

impl OffreService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    // ✅ CORRIGÉ : ajout de offre_id::TEXT dans la requête
    pub async fn get_all_offres(&self, actif_seulement: bool) -> Result<Vec<Offre>> {
        let query = if actif_seulement {
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
        } else {
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
        };

        let offres = sqlx::query_as::<_, Offre>(query)
            .fetch_all(&self.pool)
            .await?;

        Ok(offres)
    }

    // ✅ CORRIGÉ : offre_id en &str + offre_id::TEXT
    pub async fn get_offre_by_id(&self, offre_id: &str) -> Result<Option<Offre>> {
        let offre = sqlx::query_as::<_, Offre>(
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
        .fetch_optional(&self.pool)
        .await?;

        Ok(offre)
    }

    pub async fn create_offre(&self, request: CreateOffreRequest) -> Result<Offre> {
        let offre_id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now();

        let offre = sqlx::query_as::<_, Offre>(
            r#"
            INSERT INTO offres (
                offre_id, code, nom, description, statut, duree,
                prix, devise, prix_original, reduction_pourcentage,
                fonctionnalites, renouvellement_automatique, grace_period_jours,
                icon, couleur, ordre_affichage, est_populaire, est_meilleur_rapport,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, 'ACTIF', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING 
                offre_id::TEXT, code, nom, description, statut, duree,
                prix, devise, prix_original, reduction_pourcentage,
                essai_gratuit, duree_essai_jours, fonctionnalites,
                renouvellement_automatique, grace_period_jours,
                icon, couleur, ordre_affichage, est_populaire, est_meilleur_rapport,
                nombre_abonnes, total_revenu, created_at, updated_at
            "#
        )
        .bind(&offre_id)
        .bind(&request.code)
        .bind(&request.nom)
        .bind(&request.description)
        .bind(&request.duree)
        .bind(request.prix)
        .bind(&request.devise.clone().unwrap_or_else(|| "XOF".to_string()))
        .bind(request.prix_original)
        .bind(request.reduction_pourcentage)
        .bind(&request.fonctionnalites)
        .bind(request.renouvellement_automatique.unwrap_or(true))
        .bind(request.grace_period_jours.unwrap_or(7))
        .bind(&request.icon)
        .bind(&request.couleur)
        .bind(request.ordre_affichage.unwrap_or(0))
        .bind(request.est_populaire.unwrap_or(false))
        .bind(request.est_meilleur_rapport.unwrap_or(false))
        .bind(now)
        .bind(now)
        .fetch_one(&self.pool)
        .await?;

        info!("✅ Offre créée: {} - {}", offre.code, offre.nom);
        
        Ok(offre)
    }

    // ✅ CORRIGÉ : offre_id en &str
    pub async fn update_offre(&self, offre_id: &str, request: UpdateOffreRequest) -> Result<Offre> {
        let offre = sqlx::query_as::<_, Offre>(
            r#"
            UPDATE offres
            SET 
                nom = COALESCE($1, nom),
                description = COALESCE($2, description),
                statut = COALESCE($3, statut),
                prix = COALESCE($4, prix),
                prix_original = COALESCE($5, prix_original),
                reduction_pourcentage = COALESCE($6, reduction_pourcentage),
                fonctionnalites = COALESCE($7, fonctionnalites),
                renouvellement_automatique = COALESCE($8, renouvellement_automatique),
                grace_period_jours = COALESCE($9, grace_period_jours),
                icon = COALESCE($10, icon),
                couleur = COALESCE($11, couleur),
                ordre_affichage = COALESCE($12, ordre_affichage),
                est_populaire = COALESCE($13, est_populaire),
                est_meilleur_rapport = COALESCE($14, est_meilleur_rapport),
                updated_at = CURRENT_TIMESTAMP
            WHERE offre_id = $15
            RETURNING 
                offre_id::TEXT, code, nom, description, statut, duree,
                prix, devise, prix_original, reduction_pourcentage,
                essai_gratuit, duree_essai_jours, fonctionnalites,
                renouvellement_automatique, grace_period_jours,
                icon, couleur, ordre_affichage, est_populaire, est_meilleur_rapport,
                nombre_abonnes, total_revenu, created_at, updated_at
            "#
        )
        .bind(&request.nom)
        .bind(&request.description)
        .bind(&request.statut)
        .bind(request.prix)
        .bind(request.prix_original)
        .bind(request.reduction_pourcentage)
        .bind(&request.fonctionnalites)
        .bind(request.renouvellement_automatique)
        .bind(request.grace_period_jours)
        .bind(&request.icon)
        .bind(&request.couleur)
        .bind(request.ordre_affichage)
        .bind(request.est_populaire)
        .bind(request.est_meilleur_rapport)
        .bind(offre_id)
        .fetch_one(&self.pool)
        .await?;

        info!("📝 Offre mise à jour: {} - {}", offre.code, offre.nom);
        
        Ok(offre)
    }

    // ✅ CORRIGÉ : offre_id en &str
    pub async fn delete_offre(&self, offre_id: &str) -> Result<bool> {
        let result = sqlx::query(
            r#"
            DELETE FROM offres WHERE offre_id = $1
            "#
        )
        .bind(offre_id)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    // ✅ CORRIGÉ : offre_id en &str + offre_id::TEXT
    pub async fn get_offre_stats(&self, offre_id: &str) -> Result<serde_json::Value> {
        let row = sqlx::query(
            r#"
            SELECT 
                COUNT(*) as total_abonnes,
                COALESCE(SUM(CASE WHEN a.statut = 'ACTIF' THEN 1 ELSE 0 END), 0) as abonnes_actifs,
                COALESCE(SUM(a.montant_final), 0) as revenu_total,
                COALESCE(AVG(a.montant_final)::FLOAT, 0.0) as revenu_moyen
            FROM abonnements a
            WHERE a.offre_id = $1
            "#
        )
        .bind(offre_id)
        .fetch_one(&self.pool)
        .await?;

        let total_abonnes: i64 = row.get("total_abonnes");
        let abonnes_actifs: i64 = row.get("abonnes_actifs");
        let revenu_total: i64 = row.get("revenu_total");
        let revenu_moyen: f64 = row.get("revenu_moyen");

        Ok(serde_json::json!({
            "total_abonnes": total_abonnes,
            "abonnes_actifs": abonnes_actifs,
            "revenu_total": revenu_total,
            "revenu_moyen": revenu_moyen,
        }))
    }

    // ✅ CORRIGÉ : offre_id::TEXT
    pub async fn get_offres_publiques(&self) -> Result<Vec<Offre>> {
        let offres = sqlx::query_as::<_, Offre>(
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
        .fetch_all(&self.pool)
        .await?;

        Ok(offres)
    }
}