// src/sync/engine.rs
use sqlx::{SqlitePool, PgPool, Row};
use anyhow::Result;
use log::{info, error, warn};
use crate::database::local::repositories as LocalRepo;
use crate::database::remote::repositories as RemoteRepo;

pub struct SyncEngine {
    local: SqlitePool,
    remote: PgPool,
}

impl SyncEngine {
    pub fn new(local: SqlitePool, remote: PgPool) -> Self {
        Self { local, remote }
    }

    // ================================================================
    // FULL SYNC - COMPLET AVEC TOUTES LES TABLES
    // ================================================================

    pub async fn full_sync(&self) -> Result<(usize, usize)> {
        info!("🔄 Synchronisation complète...");
        
        let mut total_uploaded = 0;
        let mut total_downloaded = 0;
        
        // ✅ 1. Synchronisation des établissements
        match self.sync_etablissements_local_to_remote().await {
            Ok(count) => {
                total_uploaded += count;
                info!("✅ Établissements uploadés: {}", count);
            }
            Err(e) => {
                error!("❌ Erreur sync établissements local→remote: {}", e);
            }
        }
        match self.sync_etablissements_remote_to_local().await {
            Ok(count) => {
                total_downloaded += count;
                info!("✅ Établissements downloadés: {}", count);
            }
            Err(e) => {
                error!("❌ Erreur sync établissements remote→local: {}", e);
            }
        }

        // ✅ 2. Synchronisation des offres (PostgreSQL → SQLite seulement)
        match self.sync_offres_remote_to_local().await {
            Ok(count) => {
                total_downloaded += count;
                info!("✅ Offres downloadées: {}", count);
            }
            Err(e) => {
                error!("❌ Erreur sync offres remote→local: {}", e);
            }
        }

        // ✅ 3. Synchronisation des licences
        match self.sync_licences_local_to_remote().await {
            Ok(count) => {
                total_uploaded += count;
                info!("✅ Licences uploadées: {}", count);
            }
            Err(e) => {
                error!("❌ Erreur sync licences local→remote: {}", e);
            }
        }
        match self.sync_licences_remote_to_local().await {
            Ok(count) => {
                total_downloaded += count;
                info!("✅ Licences downloadées: {}", count);
            }
            Err(e) => {
                error!("❌ Erreur sync licences remote→local: {}", e);
            }
        }

        // ✅ 4. Synchronisation des abonnements
        match self.sync_abonnements_local_to_remote().await {
            Ok(count) => {
                total_uploaded += count;
                info!("✅ Abonnements uploadés: {}", count);
            }
            Err(e) => {
                error!("❌ Erreur sync abonnements local→remote: {}", e);
            }
        }
        match self.sync_abonnements_remote_to_local().await {
            Ok(count) => {
                total_downloaded += count;
                info!("✅ Abonnements downloadés: {}", count);
            }
            Err(e) => {
                error!("❌ Erreur sync abonnements remote→local: {}", e);
            }
        }

        info!("✅ Sync complète: {} uploadés, {} downloadés", total_uploaded, total_downloaded);
        
        Ok((total_uploaded, total_downloaded))
    }

    // ================================================================
    // SYNC ÉTABLISSEMENTS - Local → Remote (SQLite → PostgreSQL)
    // ================================================================

    pub async fn sync_etablissements_local_to_remote(&self) -> Result<usize> {
        info!("📤 Synchronisation établissements: SQLite → PostgreSQL");
        
        let etablissements = LocalRepo::etablissement::get_unsynced(&self.local).await?;
        
        if etablissements.is_empty() {
            info!("📤 Aucun établissement à synchroniser");
            return Ok(0);
        }

        info!("📤 {} établissements à synchroniser", etablissements.len());

        for etab in &etablissements {
            RemoteRepo::etablissement::upsert(&self.remote, etab).await?;
            LocalRepo::etablissement::mark_synced(&self.local, &etab.id_etablissement).await?;
        }

        info!("✅ {} établissements synchronisés", etablissements.len());
        Ok(etablissements.len())
    }

    // ================================================================
    // SYNC ÉTABLISSEMENTS - Remote → Local (PostgreSQL → SQLite)
    // ================================================================

    pub async fn sync_etablissements_remote_to_local(&self) -> Result<usize> {
        info!("📥 Synchronisation établissements: PostgreSQL → SQLite");
        
        let etablissements = RemoteRepo::etablissement::get_all(&self.remote).await?;
        
        if etablissements.is_empty() {
            info!("📥 Aucun établissement à synchroniser");
            return Ok(0);
        }

        let mut count = 0;
        for etab in &etablissements {
            let exists = sqlx::query_scalar::<_, i64>(
                "SELECT 1 FROM Etablissement WHERE id_etablissement = ?"
            )
            .bind(&etab.id_etablissement)
            .fetch_optional(&self.local)
            .await?
            .is_some();

            if !exists {
                sqlx::query(
                    r#"
                    INSERT INTO Etablissement (
                        id_etablissement, nom, sigle, numero_agrement, numero_fiscal,
                        registre_commerciale, type_etablissement, statut_juridique,
                        pays, region, ville, commune, quatier, adresse, code_postal,
                        telephone_principal, telephone_secondaire, email, site_web,
                        annee_scolaire_debut, annee_scolaire_fin, statut,
                        date_creation, date_modification, synced, sync_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                .bind(etab.synced)
                .bind(&etab.sync_date)
                .execute(&self.local)
                .await?;

                count += 1;
                info!("✅ Établissement importé: {} ({})", etab.nom, etab.id_etablissement);
            }
        }

        info!("✅ {} établissements synchronisés", count);
        Ok(count)
    }

    // ================================================================
    // SYNC OFFRES - Remote → Local (PostgreSQL → SQLite)
    // ================================================================

    pub async fn sync_offres_remote_to_local(&self) -> Result<usize> {
        info!("📥 Synchronisation offres: PostgreSQL → SQLite");
        
        // ✅ Récupérer toutes les offres actives depuis PostgreSQL
        let remote_offres = sqlx::query(
            r#"
            SELECT 
                offre_id, code, nom, description, statut, duree,
                prix, devise, prix_original, reduction_pourcentage,
                essai_gratuit, duree_essai_jours, fonctionnalites,
                renouvellement_automatique, grace_period_jours,
                icon, couleur, ordre_affichage, est_populaire, est_meilleur_rapport,
                nombre_abonnes, total_revenu, created_at, updated_at
            FROM offres
            WHERE statut = 'ACTIF'
            "#
        )
        .fetch_all(&self.remote)
        .await?;

        if remote_offres.is_empty() {
            info!("📥 Aucune offre à synchroniser");
            return Ok(0);
        }

        info!("📥 {} offres à synchroniser", remote_offres.len());

        let mut count = 0;
        for record in remote_offres {
            let offre_id: String = record.get("offre_id");
            let code: String = record.get("code");
            let nom: String = record.get("nom");
            let description: Option<String> = record.get("description");
            let statut: String = record.get("statut");
            let duree: String = record.get("duree");
            let prix: i32 = record.get("prix");
            let devise: String = record.get("devise");
            let prix_original: Option<i32> = record.get("prix_original");
            let reduction_pourcentage: Option<i32> = record.get("reduction_pourcentage");
            let essai_gratuit: i32 = record.get("essai_gratuit");
            let duree_essai_jours: Option<i32> = record.get("duree_essai_jours");
            let fonctionnalites: Option<String> = record.get("fonctionnalites");
            let renouvellement_automatique: i32 = record.get("renouvellement_automatique");
            let grace_period_jours: i32 = record.get("grace_period_jours");
            let icon: Option<String> = record.get("icon");
            let couleur: Option<String> = record.get("couleur");
            let ordre_affichage: i32 = record.get("ordre_affichage");
            let est_populaire: i32 = record.get("est_populaire");
            let est_meilleur_rapport: i32 = record.get("est_meilleur_rapport");
            let nombre_abonnes: i32 = record.get("nombre_abonnes");
            let total_revenu: i32 = record.get("total_revenu");
            let created_at: String = record.get("created_at");
            let updated_at: String = record.get("updated_at");

            // ✅ Vérifier si l'offre existe déjà en local
            let exists = sqlx::query_scalar::<_, i64>(
                "SELECT 1 FROM offres_cache WHERE offre_id = ?"
            )
            .bind(&offre_id)
            .fetch_optional(&self.local)
            .await?
            .is_some();

            if exists {
                // ✅ Mise à jour
                sqlx::query(
                    r#"
                    UPDATE offres_cache SET
                        code = ?, nom = ?, description = ?,
                        statut = ?, duree = ?,
                        prix = ?, devise = ?,
                        prix_original = ?, reduction_pourcentage = ?,
                        essai_gratuit = ?, duree_essai_jours = ?,
                        fonctionnalites = ?,
                        renouvellement_automatique = ?, grace_period_jours = ?,
                        icon = ?, couleur = ?,
                        ordre_affichage = ?, est_populaire = ?, est_meilleur_rapport = ?,
                        nombre_abonnes = ?, total_revenu = ?,
                        updated_at = ?
                    WHERE offre_id = ?
                    "#
                )
                .bind(&code)
                .bind(&nom)
                .bind(&description)
                .bind(&statut)
                .bind(&duree)
                .bind(prix)
                .bind(&devise)
                .bind(prix_original)
                .bind(reduction_pourcentage)
                .bind(essai_gratuit)
                .bind(duree_essai_jours)
                .bind(&fonctionnalites)
                .bind(renouvellement_automatique)
                .bind(grace_period_jours)
                .bind(&icon)
                .bind(&couleur)
                .bind(ordre_affichage)
                .bind(est_populaire)
                .bind(est_meilleur_rapport)
                .bind(nombre_abonnes)
                .bind(total_revenu)
                .bind(&updated_at)
                .bind(&offre_id)
                .execute(&self.local)
                .await?;
            } else {
                // ✅ Insertion
                sqlx::query(
                    r#"
                    INSERT INTO offres_cache (
                        offre_id, code, nom, description, statut, duree,
                        prix, devise, prix_original, reduction_pourcentage,
                        essai_gratuit, duree_essai_jours, fonctionnalites,
                        renouvellement_automatique, grace_period_jours,
                        icon, couleur, ordre_affichage, est_populaire, est_meilleur_rapport,
                        nombre_abonnes, total_revenu, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    "#
                )
                .bind(&offre_id)
                .bind(&code)
                .bind(&nom)
                .bind(&description)
                .bind(&statut)
                .bind(&duree)
                .bind(prix)
                .bind(&devise)
                .bind(prix_original)
                .bind(reduction_pourcentage)
                .bind(essai_gratuit)
                .bind(duree_essai_jours)
                .bind(&fonctionnalites)
                .bind(renouvellement_automatique)
                .bind(grace_period_jours)
                .bind(&icon)
                .bind(&couleur)
                .bind(ordre_affichage)
                .bind(est_populaire)
                .bind(est_meilleur_rapport)
                .bind(nombre_abonnes)
                .bind(total_revenu)
                .bind(&created_at)
                .bind(&updated_at)
                .execute(&self.local)
                .await?;
            }

            count += 1;
            info!("✅ Offre synchronisée: {} ({})", nom, code);
        }

        info!("✅ {} offres synchronisées", count);
        Ok(count)
    }

    // ================================================================
    // SYNC LICENCES - Local → Remote (SQLite → PostgreSQL)
    // ================================================================

    pub async fn sync_licences_local_to_remote(&self) -> Result<usize> {
        info!("📤 Synchronisation licences: SQLite → PostgreSQL");
        
        let licences = LocalRepo::licence::get_unsynced(&self.local).await?;
        
        if licences.is_empty() {
            info!("📤 Aucune licence à synchroniser");
            return Ok(0);
        }

        info!("📤 {} licences à synchroniser", licences.len());

        for licence in &licences {
            RemoteRepo::licence::upsert(&self.remote, licence).await?;
            LocalRepo::licence::mark_synced(&self.local, licence.id).await?;
        }

        info!("✅ {} licences synchronisées", licences.len());
        Ok(licences.len())
    }

    // ================================================================
    // SYNC LICENCES - Remote → Local (PostgreSQL → SQLite)
    // ================================================================

    pub async fn sync_licences_remote_to_local(&self) -> Result<usize> {
        info!("📥 Synchronisation licences: PostgreSQL → SQLite");
        
        let licences = RemoteRepo::licence::get_all(&self.remote).await?;
        
        if licences.is_empty() {
            info!("📥 Aucune licence à synchroniser");
            return Ok(0);
        }

        let mut count = 0;
        for licence in &licences {
            let exists = sqlx::query_scalar::<_, i64>(
                "SELECT 1 FROM activation_keys WHERE id = ?"
            )
            .bind(licence.id)
            .fetch_optional(&self.local)
            .await?
            .is_some();

            if !exists {
                sqlx::query(
                    r#"
                    INSERT INTO activation_keys (
                        id, key_text, school_name, plan, status,
                        created_at, expires_at, uses, max_uses,
                        hw_lock, two_fa, ip_restrict, sec_score,
                        fingerprint, activation_method, revocations,
                        key_hash, note, created_by, id_etablissement,
                        synced, sync_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    "#
                )
                .bind(licence.id)
                .bind(&licence.key_text)
                .bind(&licence.school_name)
                .bind(&licence.plan)
                .bind(&licence.status)
                .bind(&licence.created_at)
                .bind(&licence.expires_at)
                .bind(licence.uses)
                .bind(licence.max_uses)
                .bind(licence.hw_lock)
                .bind(licence.two_fa)
                .bind(licence.ip_restrict)
                .bind(licence.sec_score)
                .bind(&licence.fingerprint)
                .bind(&licence.activation_method)
                .bind(licence.revocations)
                .bind(&licence.key_hash)
                .bind(&licence.note)
                .bind(&licence.created_by)
                .bind(&licence.id_etablissement)
                .bind(licence.synced)
                .bind(&licence.sync_date)
                .execute(&self.local)
                .await?;

                count += 1;
                info!("✅ Licence importée: {} ({})", licence.key_text, licence.school_name);
            }
        }

        info!("✅ {} licences synchronisées", count);
        Ok(count)
    }

    // ================================================================
    // SYNC ABONNEMENTS - Local → Remote (SQLite → PostgreSQL)
    // ================================================================

    pub async fn sync_abonnements_local_to_remote(&self) -> Result<usize> {
        info!("📤 Synchronisation abonnements: SQLite → PostgreSQL");
        
        let abonnements = sqlx::query(
            r#"
            SELECT 
                abonnement_id, id_etablissement, licence_id, offre_id,
                plan, duree, montant_original, montant_remise, montant_final,
                devise, date_debut, date_debut_periode, date_fin_periode,
                date_prochain_paiement, date_fin, date_annulation,
                statut, statut_renouvellement, renouvellement_auto,
                metadata, created_at, updated_at
            FROM abonnements
            WHERE synced = 0
            ORDER BY created_at ASC
            "#
        )
        .fetch_all(&self.local)
        .await?;

        if abonnements.is_empty() {
            info!("📤 Aucun abonnement à synchroniser");
            return Ok(0);
        }

        info!("📤 {} abonnements à synchroniser", abonnements.len());

        let mut count = 0;
        for record in abonnements {
            let abonnement_id: String = record.get("abonnement_id");
            let id_etablissement: String = record.get("id_etablissement");
            let licence_id: String = record.get("licence_id");
            let offre_id: Option<String> = record.get("offre_id");
            let plan: String = record.get("plan");
            let duree: String = record.get("duree");
            let montant_original: i32 = record.get("montant_original");
            let montant_remise: i32 = record.get("montant_remise");
            let montant_final: i32 = record.get("montant_final");
            let devise: String = record.get("devise");
            let date_debut: String = record.get("date_debut");
            let date_debut_periode: Option<String> = record.get("date_debut_periode");
            let date_fin_periode: Option<String> = record.get("date_fin_periode");
            let date_prochain_paiement: Option<String> = record.get("date_prochain_paiement");
            let date_fin: Option<String> = record.get("date_fin");
            let date_annulation: Option<String> = record.get("date_annulation");
            let statut: String = record.get("statut");
            let statut_renouvellement: String = record.get("statut_renouvellement");
            let renouvellement_auto: i32 = record.get("renouvellement_auto");
            let metadata: Option<String> = record.get("metadata");
            let created_at: String = record.get("created_at");
            let updated_at: String = record.get("updated_at");

            // ✅ Vérifier si l'abonnement existe en remote
            let exists = sqlx::query_scalar::<_, i64>(
                "SELECT 1 FROM abonnements WHERE abonnement_id = $1"
            )
            .bind(&abonnement_id)
            .fetch_optional(&self.remote)
            .await?
            .is_some();

            if exists {
                // ✅ Mise à jour
                sqlx::query(
                    r#"
                    UPDATE abonnements SET
                        id_etablissement = $1,
                        licence_id = $2,
                        offre_id = $3,
                        plan = $4,
                        duree = $5,
                        montant_original = $6,
                        montant_remise = $7,
                        montant_final = $8,
                        devise = $9,
                        date_debut = $10,
                        date_debut_periode = $11,
                        date_fin_periode = $12,
                        date_prochain_paiement = $13,
                        date_fin = $14,
                        date_annulation = $15,
                        statut = $16,
                        statut_renouvellement = $17,
                        renouvellement_auto = $18,
                        metadata = $19,
                        updated_at = $20,
                        synced = 1,
                        sync_date = $21
                    WHERE abonnement_id = $22
                    "#
                )
                .bind(&id_etablissement)
                .bind(&licence_id)
                .bind(&offre_id)
                .bind(&plan)
                .bind(&duree)
                .bind(montant_original)
                .bind(montant_remise)
                .bind(montant_final)
                .bind(&devise)
                .bind(&date_debut)
                .bind(&date_debut_periode)
                .bind(&date_fin_periode)
                .bind(&date_prochain_paiement)
                .bind(&date_fin)
                .bind(&date_annulation)
                .bind(&statut)
                .bind(&statut_renouvellement)
                .bind(renouvellement_auto)
                .bind(&metadata)
                .bind(&updated_at)
                .bind(chrono::Utc::now().to_rfc3339())
                .bind(&abonnement_id)
                .execute(&self.remote)
                .await?;
            } else {
                // ✅ Insertion
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
                    "#
                )
                .bind(&abonnement_id)
                .bind(&id_etablissement)
                .bind(&licence_id)
                .bind(&offre_id)
                .bind(&plan)
                .bind(&duree)
                .bind(montant_original)
                .bind(montant_remise)
                .bind(montant_final)
                .bind(&devise)
                .bind(&date_debut)
                .bind(&date_debut_periode)
                .bind(&date_fin_periode)
                .bind(&date_prochain_paiement)
                .bind(&date_fin)
                .bind(&date_annulation)
                .bind(&statut)
                .bind(&statut_renouvellement)
                .bind(renouvellement_auto)
                .bind(&metadata)
                .bind(&created_at)
                .bind(&updated_at)
                .bind(1)
                .bind(chrono::Utc::now().to_rfc3339())
                .execute(&self.remote)
                .await?;
            }

            // ✅ Marquer comme synchronisé en local
            sqlx::query(
                r#"
                UPDATE abonnements
                SET synced = 1, sync_date = ?
                WHERE abonnement_id = ?
                "#
            )
            .bind(chrono::Utc::now().to_rfc3339())
            .bind(&abonnement_id)
            .execute(&self.local)
            .await?;

            count += 1;
            info!("✅ Abonnement synchronisé: {} ({})", abonnement_id, plan);
        }

        info!("✅ {} abonnements synchronisés", count);
        Ok(count)
    }

    // ================================================================
    // SYNC ABONNEMENTS - Remote → Local (PostgreSQL → SQLite)
    // ================================================================

    pub async fn sync_abonnements_remote_to_local(&self) -> Result<usize> {
        info!("📥 Synchronisation abonnements: PostgreSQL → SQLite");
        
        let remote_abonnements = sqlx::query(
            r#"
            SELECT 
                abonnement_id, id_etablissement, licence_id, offre_id,
                plan, duree, montant_original, montant_remise, montant_final,
                devise, date_debut, date_debut_periode, date_fin_periode,
                date_prochain_paiement, date_fin, date_annulation,
                statut, statut_renouvellement, renouvellement_auto,
                metadata, created_at, updated_at
            FROM abonnements
            WHERE sync_date > COALESCE(
                (SELECT MAX(sync_date) FROM abonnements WHERE synced = 0),
                '1970-01-01'
            )
            "#
        )
        .fetch_all(&self.remote)
        .await?;

        if remote_abonnements.is_empty() {
            info!("📥 Aucun abonnement à synchroniser");
            return Ok(0);
        }

        info!("📥 {} abonnements à synchroniser", remote_abonnements.len());

        let mut count = 0;
        for record in remote_abonnements {
            let abonnement_id: String = record.get("abonnement_id");
            let id_etablissement: String = record.get("id_etablissement");
            let licence_id: String = record.get("licence_id");
            let offre_id: Option<String> = record.get("offre_id");
            let plan: String = record.get("plan");
            let duree: String = record.get("duree");
            let montant_original: i32 = record.get("montant_original");
            let montant_remise: i32 = record.get("montant_remise");
            let montant_final: i32 = record.get("montant_final");
            let devise: String = record.get("devise");
            let date_debut: String = record.get("date_debut");
            let date_debut_periode: Option<String> = record.get("date_debut_periode");
            let date_fin_periode: Option<String> = record.get("date_fin_periode");
            let date_prochain_paiement: Option<String> = record.get("date_prochain_paiement");
            let date_fin: Option<String> = record.get("date_fin");
            let date_annulation: Option<String> = record.get("date_annulation");
            let statut: String = record.get("statut");
            let statut_renouvellement: String = record.get("statut_renouvellement");
            let renouvellement_auto: i32 = record.get("renouvellement_auto");
            let metadata: Option<String> = record.get("metadata");
            let created_at: String = record.get("created_at");
            let updated_at: String = record.get("updated_at");

            let exists = sqlx::query_scalar::<_, i64>(
                "SELECT 1 FROM abonnements WHERE abonnement_id = ?"
            )
            .bind(&abonnement_id)
            .fetch_optional(&self.local)
            .await?
            .is_some();

            let now = chrono::Utc::now().to_rfc3339();

            if exists {
                sqlx::query(
                    r#"
                    UPDATE abonnements SET
                        id_etablissement = ?,
                        licence_id = ?,
                        offre_id = ?,
                        plan = ?,
                        duree = ?,
                        montant_original = ?,
                        montant_remise = ?,
                        montant_final = ?,
                        devise = ?,
                        date_debut = ?,
                        date_debut_periode = ?,
                        date_fin_periode = ?,
                        date_prochain_paiement = ?,
                        date_fin = ?,
                        date_annulation = ?,
                        statut = ?,
                        statut_renouvellement = ?,
                        renouvellement_auto = ?,
                        metadata = ?,
                        updated_at = ?,
                        synced = 1,
                        sync_date = ?
                    WHERE abonnement_id = ?
                    "#
                )
                .bind(&id_etablissement)
                .bind(&licence_id)
                .bind(&offre_id)
                .bind(&plan)
                .bind(&duree)
                .bind(montant_original)
                .bind(montant_remise)
                .bind(montant_final)
                .bind(&devise)
                .bind(&date_debut)
                .bind(&date_debut_periode)
                .bind(&date_fin_periode)
                .bind(&date_prochain_paiement)
                .bind(&date_fin)
                .bind(&date_annulation)
                .bind(&statut)
                .bind(&statut_renouvellement)
                .bind(renouvellement_auto)
                .bind(&metadata)
                .bind(&updated_at)
                .bind(&now)
                .bind(&abonnement_id)
                .execute(&self.local)
                .await?;
            } else {
                sqlx::query(
                    r#"
                    INSERT INTO abonnements (
                        abonnement_id, id_etablissement, licence_id, offre_id,
                        plan, duree, montant_original, montant_remise, montant_final,
                        devise, date_debut, date_debut_periode, date_fin_periode,
                        date_prochain_paiement, date_fin, date_annulation,
                        statut, statut_renouvellement, renouvellement_auto,
                        metadata, created_at, updated_at, synced, sync_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    "#
                )
                .bind(&abonnement_id)
                .bind(&id_etablissement)
                .bind(&licence_id)
                .bind(&offre_id)
                .bind(&plan)
                .bind(&duree)
                .bind(montant_original)
                .bind(montant_remise)
                .bind(montant_final)
                .bind(&devise)
                .bind(&date_debut)
                .bind(&date_debut_periode)
                .bind(&date_fin_periode)
                .bind(&date_prochain_paiement)
                .bind(&date_fin)
                .bind(&date_annulation)
                .bind(&statut)
                .bind(&statut_renouvellement)
                .bind(renouvellement_auto)
                .bind(&metadata)
                .bind(&created_at)
                .bind(&updated_at)
                .bind(1)
                .bind(&now)
                .execute(&self.local)
                .await?;
            }

            count += 1;
            info!("✅ Abonnement importé: {} ({})", abonnement_id, plan);
        }

        info!("✅ {} abonnements synchronisés", count);
        Ok(count)
    }

    // ================================================================
    // UTILITAIRES
    // ================================================================

    pub async fn get_pending_changes(&self) -> Result<usize> {
        let licences: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM licences WHERE synced = 0"
        )
        .fetch_one(&self.local)
        .await?;
        
        let abonnements: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM abonnements WHERE synced = 0"
        )
        .fetch_one(&self.local)
        .await?;
        
        let etablissements: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM Etablissement WHERE synced = 0"
        )
        .fetch_one(&self.local)
        .await?;
        
        Ok((licences + abonnements + etablissements) as usize)
    }
}

// ✅ Implémentation de Clone pour SyncEngine
impl Clone for SyncEngine {
    fn clone(&self) -> Self {
        Self {
            local: self.local.clone(),
            remote: self.remote.clone(),
        }
    }
}