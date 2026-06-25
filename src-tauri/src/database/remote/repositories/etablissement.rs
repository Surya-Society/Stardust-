// src/database/remote/repositories/etablissement.rs
use sqlx::{PgPool, Row};
use crate::models::etablissement::Etablissement;
use anyhow::Result;
use log::info;

/// ✅ Récupère tous les établissements depuis PostgreSQL
pub async fn get_all(pool: &PgPool) -> Result<Vec<Etablissement>> {
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
        ORDER BY date_creation DESC
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

/// ✅ Insère ou met à jour un établissement dans PostgreSQL
pub async fn upsert(pool: &PgPool, etab: &Etablissement) -> Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        INSERT INTO Etablissement (
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quatier, adresse, code_postal,
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
            quatier = EXCLUDED.quatier,
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
    .bind(&etab.id_etablissement)
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
    .bind(&etab.quatier)
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
    .bind(1)  // synced = 1 en remote
    .bind(&now)
    .execute(pool)
    .await?;

    Ok(())
}