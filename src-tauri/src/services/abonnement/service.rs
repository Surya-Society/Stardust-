use sqlx::{PgPool, Row};
use chrono::{Utc, DateTime};
use log::{info, warn};
use anyhow::Result;
use uuid::Uuid;
use serde_json::json;

#[derive(sqlx::FromRow)]
struct LicenceExpiration {
    pub licence_id: Uuid,
    pub id_etablissement: Uuid,
    pub date_expiration: DateTime<Utc>,
    pub licence_key: String,
    pub duree: Option<String>,
    pub grace_period_jours: Option<i32>,
}

pub struct AbonnementService {
    pool: PgPool,
}

impl AbonnementService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn verifier_licences_expirees(&self) -> Result<Vec<Uuid>> {
        let now = Utc::now();
        
        let licences = sqlx::query_as::<_, LicenceExpiration>(
            r#"
            SELECT 
                l.licence_id, 
                l.id_etablissement, 
                l.date_expiration, 
                l.licence_key, 
                l.duree,
                COALESCE(o.grace_period_jours, c.grace_period_days, 7) as grace_period_jours
            FROM licences l
            LEFT JOIN abonnements a ON a.licence_id = l.licence_id
            LEFT JOIN offres o ON o.offre_id = a.offre_id
            LEFT JOIN configuration_paiement c ON c.id_etablissement = l.id_etablissement
            WHERE l.statut IN ('ACTIVE', 'GRACE_PERIOD')
            AND l.duree != 'A_VIE'
            AND l.date_expiration IS NOT NULL
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        let mut expirations = Vec::new();

        for licence in licences {
            let expiration = licence.date_expiration;
            let jours_restants = (expiration - now).num_days();
            let grace_period = licence.grace_period_jours.unwrap_or(7) as i64;

            if jours_restants < -grace_period {
                // ✅ Remplacer sqlx::query! par sqlx::query
                sqlx::query(
                    r#"
                    UPDATE licences
                    SET statut = 'EXPIRED',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE licence_id = $1
                    "#
                )
                .bind(licence.licence_id)
                .execute(&self.pool)
                .await?;

                sqlx::query(
                    r#"
                    UPDATE abonnements
                    SET statut = 'EXPIRE',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE licence_id = $1
                    AND statut = 'ACTIF'
                    "#
                )
                .bind(licence.licence_id)
                .execute(&self.pool)
                .await?;

                expirations.push(licence.licence_id);

                sqlx::query(
                    r#"
                    INSERT INTO evenements_licence (
                        id_etablissement, licence_id, type_event, message, details
                    ) VALUES ($1, $2, 'EXPIRATION', $3, $4)
                    "#
                )
                .bind(licence.id_etablissement)
                .bind(licence.licence_id)
                .bind(format!("Licence expirée - {} jours après la période de grâce", -jours_restants - grace_period))
                .bind(json!({
                    "date_expiration": licence.date_expiration,
                    "grace_period": grace_period,
                    "jours_restants": jours_restants
                }))
                .execute(&self.pool)
                .await?;

                info!("⛔ Licence expirée: {}", licence.licence_key);

            } else if jours_restants < 0 {
                sqlx::query(
                    r#"
                    UPDATE licences
                    SET statut = 'GRACE_PERIOD',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE licence_id = $1
                    "#
                )
                .bind(licence.licence_id)
                .execute(&self.pool)
                .await?;

                warn!("⏳ Licence en période de grâce: {} ({} jours)", 
                    licence.licence_key, -jours_restants);
            }
        }

        Ok(expirations)
    }

    pub async fn get_statut_licence(&self, licence_key: &str) -> Result<LicenceStatusResponse> {
        // ✅ Remplacer sqlx::query! par sqlx::query avec Row::get
        let row = sqlx::query(
            r#"
            SELECT 
                l.licence_id,
                l.statut,
                l.date_expiration,
                l.duree,
                COALESCE(o.grace_period_jours, c.grace_period_days, 7) as grace_period_jours
            FROM licences l
            LEFT JOIN abonnements a ON a.licence_id = l.licence_id
            LEFT JOIN offres o ON o.offre_id = a.offre_id
            LEFT JOIN configuration_paiement c ON c.id_etablissement = l.id_etablissement
            WHERE l.licence_key = $1
            "#
        )
        .bind(licence_key)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            // ✅ Utiliser row.get() pour récupérer les valeurs
            let licence_id: Uuid = row.get("licence_id");
            let statut: String = row.get("statut");
            let date_expiration: DateTime<Utc> = row.get("date_expiration");
            let duree: Option<String> = row.get("duree");
            let grace_period_jours: Option<i32> = row.get("grace_period_jours");

            let now = Utc::now();
            let jours_restants = (date_expiration - now).num_days();
            let grace_period = grace_period_jours.unwrap_or(7) as i64;

            let (statut_final, est_actif, est_suspendu, est_expire, est_en_grace_period) = 
                if duree.as_deref() == Some("A_VIE") {
                    ("ACTIVE".to_string(), true, false, false, false)
                } else if statut == "REVOKED" {
                    ("REVOKED".to_string(), false, false, true, false)
                } else if statut == "SUSPENDED" {
                    ("SUSPENDED".to_string(), false, true, false, false)
                } else if jours_restants > 0 {
                    ("ACTIVE".to_string(), true, false, false, false)
                } else if jours_restants >= -grace_period {
                    ("GRACE_PERIOD".to_string(), false, false, false, true)
                } else {
                    ("EXPIRED".to_string(), false, false, true, false)
                };

            let statut_clone = statut_final.clone();

            Ok(LicenceStatusResponse {
                statut: statut_final,
                date_expiration: Some(date_expiration),
                jours_restants: Some(jours_restants),
                est_actif,
                est_suspendu,
                est_expire,
                est_en_grace_period,
                grace_period_restante: if est_en_grace_period { Some(grace_period + jours_restants) } else { None },
                message: match statut_clone.as_str() {
                    "ACTIVE" => format!("✅ Licence active - {} jours restants", jours_restants),
                    "GRACE_PERIOD" => format!("⚠️ Période de grâce - {} jours restants", grace_period + jours_restants),
                    "EXPIRED" => "❌ Licence expirée - Veuillez renouveler".to_string(),
                    "SUSPENDED" => "⛔ Licence suspendue - Contactez l'administrateur".to_string(),
                    "REVOKED" => "🚫 Licence révoquée".to_string(),
                    _ => "Statut inconnu".to_string(),
                },
            })
        } else {
            Ok(LicenceStatusResponse {
                statut: "INEXISTANT".to_string(),
                date_expiration: None,
                jours_restants: None,
                est_actif: false,
                est_suspendu: false,
                est_expire: false,
                est_en_grace_period: false,
                grace_period_restante: None,
                message: "Licence non trouvée".to_string(),
            })
        }
    }
}

#[derive(Debug, serde::Serialize)]
pub struct LicenceStatusResponse {
    pub statut: String,
    pub date_expiration: Option<DateTime<Utc>>,
    pub jours_restants: Option<i64>,
    pub est_actif: bool,
    pub est_suspendu: bool,
    pub est_expire: bool,
    pub est_en_grace_period: bool,
    pub grace_period_restante: Option<i64>,
    pub message: String,
}