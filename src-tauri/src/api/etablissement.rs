// src/api/etablissement.rs
use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{PgPool, Row};
use log::{info, error};
use chrono::Utc;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SyncEtablissementRequest {
    pub id_etablissement: String,
    pub nom: String,
    pub sigle: Option<String>,
    pub numero_agrement: String,
    pub numero_fiscal: String,
    pub registre_commerciale: Option<String>,
    pub type_etablissement: String,
    pub statut_juridique: String,
    pub pays: String,
    pub region: String,
    pub ville: String,
    pub commune: Option<String>,
    pub quatier: Option<String>,
    pub adresse: String,
    pub code_postal: Option<String>,
    pub telephone_principal: String,
    pub telephone_secondaire: Option<String>,
    pub email: Option<String>,
    pub site_web: Option<String>,
    pub annee_scolaire_debut: String,
    pub annee_scolaire_fin: String,
    pub statut: String,
    pub date_creation: String,
    pub date_modification: Option<String>,
}

/// ✅ Endpoint pour recevoir la synchronisation des établissements depuis Surya
pub async fn sync_etablissement(
    req: web::Json<SyncEtablissementRequest>,
    pg_pool: web::Data<PgPool>,
) -> impl Responder {
    info!("📥 Synchronisation établissement depuis Surya: {}", req.id_etablissement);
    
    let now = Utc::now().to_rfc3339();
    
    let result = sqlx::query(
        r#"
        INSERT INTO Etablissement (
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quatier, adresse, code_postal,
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
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
    .bind(&req.id_etablissement)
    .bind(&req.nom)
    .bind(&req.sigle)
    .bind(&req.numero_agrement)
    .bind(&req.numero_fiscal)
    .bind(&req.registre_commerciale)
    .bind(&req.type_etablissement)
    .bind(&req.statut_juridique)
    .bind(&req.pays)
    .bind(&req.region)
    .bind(&req.ville)
    .bind(&req.commune)
    .bind(&req.quatier)
    .bind(&req.adresse)
    .bind(&req.code_postal)
    .bind(&req.telephone_principal)
    .bind(&req.telephone_secondaire)
    .bind(&req.email)
    .bind(&req.site_web)
    .bind(&req.annee_scolaire_debut)
    .bind(&req.annee_scolaire_fin)
    .bind(&req.statut)
    .bind(&req.date_creation)
    .bind(&req.date_modification)
    .bind(1)
    .bind(&now)
    .execute(&**pg_pool)
    .await;

    match result {
        Ok(_) => {
            info!("✅ Établissement synchronisé: {}", req.id_etablissement);
            HttpResponse::Ok().json(json!({
                "success": true,
                "message": "Établissement synchronisé avec succès",
                "id": req.id_etablissement
            }))
        }
        Err(e) => {
            error!("❌ Erreur synchronisation établissement: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}

/// ✅ Endpoint pour synchroniser plusieurs établissements en une fois
pub async fn sync_etablissements_batch(
    req: web::Json<Vec<SyncEtablissementRequest>>,
    pg_pool: web::Data<PgPool>,
) -> impl Responder {
    info!("📥 Synchronisation batch de {} établissements", req.len());
    
    let mut success_count = 0;
    let mut errors = Vec::new();
    
    for etab in req.iter() {
        let now = Utc::now().to_rfc3339();
        
        let result = sqlx::query(
            r#"
            INSERT INTO Etablissement (
                id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
                registre_commerciale, type_etablissement, statut_juridique,
                pays, region, ville, commune, quatier, adresse, code_postal,
                telephone_principal, telephone_secondaire, email, site_web,
                annee_scolaire_debut, annee_scolaire_fin, statut,
                date_creation, date_modification, synced, sync_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
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
        .bind(1)
        .bind(&now)
        .execute(&**pg_pool)
        .await;

        match result {
            Ok(_) => success_count += 1,
            Err(e) => {
                errors.push(format!("{}: {}", etab.id_etablissement, e));
            }
        }
    }

    HttpResponse::Ok().json(json!({
        "success": true,
        "synchronized": success_count,
        "total": req.len(),
        "errors": errors
    }))
}

// ================================================================
// ✅ NOUVEL ENDPOINT - Récupérer un établissement par son ID
// ================================================================

/// ✅ Récupère un établissement par son ID (pour Surya)
pub async fn get_etablissement(
    path: web::Path<String>,
    pg_pool: web::Data<PgPool>,
) -> impl Responder {
    let id_etablissement = path.into_inner();
    
    info!("🔍 Récupération établissement: {}", id_etablissement);
    
    let row = sqlx::query(
        r#"
        SELECT 
            id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
            registre_commerciale, type_etablissement, statut_juridique,
            pays, region, ville, commune, quatier, adresse, code_postal,
            telephone_principal, telephone_secondaire, email, site_web,
            annee_scolaire_debut, annee_scolaire_fin, statut,
            date_creation, date_modification, synced, sync_date
        FROM Etablissement
        WHERE id_etablissement = $1
        "#
    )
    .bind(&id_etablissement)
    .fetch_optional(&**pg_pool)
    .await;

    match row {
        Ok(Some(row)) => {
            info!("✅ Établissement trouvé: {}", id_etablissement);
            
            let etablissement = json!({
                "id_etablissement": row.get::<String, _>("id_etablissement"),
                "nom": row.get::<String, _>("nom"),
                "sigle": row.get::<Option<String>, _>("sigle"),
                "numero_agrement": row.get::<String, _>("numero_agrement"),
                "numero_fiscal": row.get::<String, _>("numero_fiscal"),
                "registre_commerciale": row.get::<Option<String>, _>("registre_commerciale"),
                "type_etablissement": row.get::<String, _>("type_etablissement"),
                "statut_juridique": row.get::<String, _>("statut_juridique"),
                "pays": row.get::<String, _>("pays"),
                "region": row.get::<String, _>("region"),
                "ville": row.get::<String, _>("ville"),
                "commune": row.get::<Option<String>, _>("commune"),
                "quatier": row.get::<Option<String>, _>("quatier"),
                "adresse": row.get::<String, _>("adresse"),
                "code_postal": row.get::<Option<String>, _>("code_postal"),
                "telephone_principal": row.get::<String, _>("telephone_principal"),
                "telephone_secondaire": row.get::<Option<String>, _>("telephone_secondaire"),
                "email": row.get::<Option<String>, _>("email"),
                "site_web": row.get::<Option<String>, _>("site_web"),
                "annee_scolaire_debut": row.get::<String, _>("annee_scolaire_debut"),
                "annee_scolaire_fin": row.get::<String, _>("annee_scolaire_fin"),
                "statut": row.get::<String, _>("statut"),
                "date_creation": row.get::<String, _>("date_creation"),
                "date_modification": row.get::<Option<String>, _>("date_modification"),
                "synced": row.get::<i32, _>("synced"),
                "sync_date": row.get::<Option<String>, _>("sync_date"),
            });
            
            HttpResponse::Ok().json(json!({
                "success": true,
                "data": etablissement
            }))
        }
        Ok(None) => {
            info!("❌ Établissement non trouvé: {}", id_etablissement);
            HttpResponse::NotFound().json(json!({
                "success": false,
                "error": "Établissement non trouvé"
            }))
        }
        Err(e) => {
            error!("❌ Erreur récupération établissement: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}