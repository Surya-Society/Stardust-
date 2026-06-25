// src/api/offre.rs
use actix_web::{web, HttpResponse, Responder};
use serde_json::json;
use sqlx::{PgPool, Row};
use log::{info, error};

pub async fn get_publiques(
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("📋 Récupération des offres publiques");
    
    let rows = sqlx::query(
        r#"
        SELECT 
            offre_id::TEXT, code, nom, description, duree,
            prix, devise, prix_original, reduction_pourcentage,
            fonctionnalites, est_populaire, est_meilleur_rapport,
            icon, couleur, ordre_affichage
        FROM offres
        WHERE statut = 'ACTIF'
        ORDER BY ordre_affichage ASC
        "#
    )
    .fetch_all(&**pool)
    .await;

    match rows {
        Ok(rows) => {
            let mut offres = Vec::new();
            for row in rows {
                offres.push(json!({
                    "offre_id": row.get::<String, _>("offre_id"),
                    "code": row.get::<String, _>("code"),
                    "nom": row.get::<String, _>("nom"),
                    "description": row.get::<Option<String>, _>("description"),
                    "duree": row.get::<String, _>("duree"),
                    "prix": row.get::<i32, _>("prix"),
                    "devise": row.get::<String, _>("devise"),
                    "prix_original": row.get::<Option<i32>, _>("prix_original"),
                    "reduction_pourcentage": row.get::<Option<i32>, _>("reduction_pourcentage"),
                    "fonctionnalites": row.get::<Option<serde_json::Value>, _>("fonctionnalites"),
                    "est_populaire": row.get::<bool, _>("est_populaire"),
                    "est_meilleur_rapport": row.get::<bool, _>("est_meilleur_rapport"),
                    "icon": row.get::<Option<String>, _>("icon"),
                    "couleur": row.get::<Option<String>, _>("couleur"),
                    "ordre_affichage": row.get::<i32, _>("ordre_affichage"),
                }));
            }
            
            HttpResponse::Ok().json(json!({
                "success": true,
                "data": offres
            }))
        }
        Err(e) => {
            error!("❌ Erreur récupération offres: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}

pub async fn get_by_id(
    path: web::Path<String>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let offre_id = path.into_inner();
    
    info!("🔍 Récupération offre: {}", offre_id);
    
    let row = sqlx::query(
        r#"
        SELECT 
            offre_id::TEXT, code, nom, description, statut, duree,
            prix, devise, prix_original, reduction_pourcentage,
            fonctionnalites, est_populaire, est_meilleur_rapport,
            icon, couleur, ordre_affichage
        FROM offres
        WHERE offre_id = $1 AND statut = 'ACTIF'
        "#
    )
    .bind(&offre_id)
    .fetch_optional(&**pool)
    .await;

    match row {
        Ok(Some(row)) => {
            HttpResponse::Ok().json(json!({
                "success": true,
                "data": {
                    "offre_id": row.get::<String, _>("offre_id"),
                    "code": row.get::<String, _>("code"),
                    "nom": row.get::<String, _>("nom"),
                    "description": row.get::<Option<String>, _>("description"),
                    "statut": row.get::<String, _>("statut"),
                    "duree": row.get::<String, _>("duree"),
                    "prix": row.get::<i32, _>("prix"),
                    "devise": row.get::<String, _>("devise"),
                    "prix_original": row.get::<Option<i32>, _>("prix_original"),
                    "reduction_pourcentage": row.get::<Option<i32>, _>("reduction_pourcentage"),
                    "fonctionnalites": row.get::<Option<serde_json::Value>, _>("fonctionnalites"),
                    "est_populaire": row.get::<bool, _>("est_populaire"),
                    "est_meilleur_rapport": row.get::<bool, _>("est_meilleur_rapport"),
                    "icon": row.get::<Option<String>, _>("icon"),
                    "couleur": row.get::<Option<String>, _>("couleur"),
                    "ordre_affichage": row.get::<i32, _>("ordre_affichage"),
                }
            }))
        }
        Ok(None) => {
            HttpResponse::NotFound().json(json!({
                "success": false,
                "error": "Offre non trouvée"
            }))
        }
        Err(e) => {
            error!("❌ Erreur récupération offre: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "error": format!("Erreur: {}", e)
            }))
        }
    }
}