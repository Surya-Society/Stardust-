-- ============================================================================
-- STARDUST - Vues et Triggers SQLite (CORRIGÉS)
-- ============================================================================
-- Version: 2.0.0
-- Description: Vues et triggers pour SQLite (utilise licences, pas activation_keys)
-- ============================================================================

-- ============================================================================
-- VUES pour les licences
-- ============================================================================

-- Vue des licences actives avec informations de sécurité
CREATE VIEW IF NOT EXISTS v_active_licences AS
SELECT 
    l.licence_id,
    l.licence_key,
    l.id_etablissement,
    l.type_licence,
    l.statut,
    l.date_expiration,
    l.activations_max,
    l.activations_utilisees,
    l.duree,
    julianday(l.date_expiration) - julianday('now') AS days_remaining,
    CAST(l.activations_utilisees AS REAL) / l.activations_max * 100 AS usage_rate,
    c.name AS client_name,
    c.email AS client_email,
    o.nom AS offre_nom,
    o.code AS offre_code
FROM licences l
LEFT JOIN clients c ON l.id_etablissement = c.id
LEFT JOIN abonnements a ON a.licence_id = l.licence_id
LEFT JOIN offres o ON o.offre_id = a.offre_id
WHERE l.statut = 'ACTIVE' 
  AND julianday('now') <= julianday(l.date_expiration);

-- Vue des statistiques par type de licence
CREATE VIEW IF NOT EXISTS v_licences_stats_by_type AS
SELECT 
    type_licence,
    COUNT(*) AS total_licences,
    SUM(CASE WHEN statut = 'ACTIVE' AND julianday('now') <= julianday(date_expiration) THEN 1 ELSE 0 END) AS active_licences,
    SUM(CASE WHEN statut = 'EXPIRED' OR julianday('now') > julianday(date_expiration) THEN 1 ELSE 0 END) AS expired_licences,
    SUM(CASE WHEN statut = 'SUSPENDED' THEN 1 ELSE 0 END) AS suspended_licences,
    SUM(CASE WHEN statut = 'REVOKED' THEN 1 ELSE 0 END) AS revoked_licences,
    SUM(activations_utilisees) AS total_activations,
    AVG(activations_max) AS avg_max_activations
FROM licences
GROUP BY type_licence;

-- Vue des licences expirant dans les 30 jours
CREATE VIEW IF NOT EXISTS v_licences_expiring_soon AS
SELECT 
    l.licence_id,
    l.licence_key,
    l.id_etablissement,
    l.type_licence,
    l.date_expiration,
    julianday(l.date_expiration) - julianday('now') AS days_remaining,
    l.activations_utilisees,
    l.activations_max,
    c.name AS client_name,
    c.email AS client_email,
    c.phone AS client_phone
FROM licences l
LEFT JOIN clients c ON l.id_etablissement = c.id
WHERE l.statut = 'ACTIVE' 
  AND julianday(l.date_expiration) - julianday('now') BETWEEN 0 AND 30
ORDER BY days_remaining ASC;

-- Vue des licences en période de grâce
CREATE VIEW IF NOT EXISTS v_licences_grace_period AS
SELECT 
    l.licence_id,
    l.licence_key,
    l.id_etablissement,
    l.type_licence,
    l.date_expiration,
    julianday('now') - julianday(l.date_expiration) AS days_overdue,
    COALESCE(o.grace_period_jours, 7) AS grace_period_days,
    julianday('now') - julianday(l.date_expiration) - COALESCE(o.grace_period_jours, 7) AS days_until_expired,
    c.name AS client_name
FROM licences l
LEFT JOIN abonnements a ON a.licence_id = l.licence_id
LEFT JOIN offres o ON o.offre_id = a.offre_id
LEFT JOIN clients c ON l.id_etablissement = c.id
WHERE l.statut = 'GRACE_PERIOD'
  OR (l.statut = 'ACTIVE' AND julianday('now') > julianday(l.date_expiration))
ORDER BY days_overdue DESC;

-- ============================================================================
-- VUES pour les offres
-- ============================================================================

-- Vue des offres actives avec statistiques
CREATE VIEW IF NOT EXISTS v_offres_actives AS
SELECT 
    o.offre_id,
    o.code,
    o.nom,
    o.description,
    o.duree,
    o.prix,
    o.devise,
    o.prix_original,
    o.reduction_pourcentage,
    o.fonctionnalites,
    o.est_populaire,
    o.est_meilleur_rapport,
    o.ordre_affichage,
    o.nombre_abonnes,
    o.total_revenu,
    CASE 
        WHEN o.est_populaire = 1 THEN '⭐ Populaire'
        WHEN o.est_meilleur_rapport = 1 THEN '💎 Meilleur rapport'
        ELSE ''
    END AS badge,
    o.prix - COALESCE(o.prix_original, o.prix) AS reduction_montant,
    ROUND(CAST(COALESCE(o.reduction_pourcentage, 0) AS REAL), 0) AS reduction_pct
FROM offres o
WHERE o.statut = 'ACTIF'
ORDER BY o.ordre_affichage ASC;

-- Vue des offres les plus populaires
CREATE VIEW IF NOT EXISTS v_offres_populaires AS
SELECT 
    o.offre_id,
    o.code,
    o.nom,
    o.prix,
    o.duree,
    o.nombre_abonnes,
    o.total_revenu,
    ROUND(CAST(o.nombre_abonnes AS REAL) / (SELECT COUNT(*) FROM abonnements WHERE statut = 'ACTIF') * 100, 2) AS pourcentage_abonnes
FROM offres o
WHERE o.statut = 'ACTIF'
  AND o.nombre_abonnes > 0
ORDER BY o.nombre_abonnes DESC;

-- ============================================================================
-- VUES pour les abonnements
-- ============================================================================

-- Vue des abonnements actifs
CREATE VIEW IF NOT EXISTS v_abonnements_actifs AS
SELECT 
    a.abonnement_id,
    a.id_etablissement,
    a.licence_id,
    a.offre_id,
    a.plan,
    a.duree,
    a.montant_final,
    a.devise,
    a.date_debut,
    a.date_prochain_paiement,
    a.date_fin,
    a.statut,
    a.renouvellement_auto,
    julianday(a.date_prochain_paiement) - julianday('now') AS jours_avant_paiement,
    julianday(a.date_fin) - julianday('now') AS jours_restants,
    c.name AS etablissement_nom,
    o.nom AS offre_nom,
    o.code AS offre_code,
    CASE 
        WHEN julianday('now') > julianday(a.date_prochain_paiement) THEN '🔴 En retard'
        WHEN julianday(a.date_prochain_paiement) - julianday('now') <= 7 THEN '🟡 Bientôt'
        ELSE '🟢 Actif'
    END AS statut_paiement
FROM abonnements a
JOIN clients c ON a.id_etablissement = c.id
LEFT JOIN offres o ON a.offre_id = o.offre_id
WHERE a.statut = 'ACTIF'
  AND (a.date_fin IS NULL OR julianday('now') <= julianday(a.date_fin));

-- Vue des abonnements expirant bientôt
CREATE VIEW IF NOT EXISTS v_abonnements_expirant_bientot AS
SELECT 
    a.abonnement_id,
    a.id_etablissement,
    a.licence_id,
    a.plan,
    a.duree,
    a.date_fin,
    julianday(a.date_fin) - julianday('now') AS jours_restants,
    a.montant_final,
    c.name AS etablissement_nom,
    c.email AS etablissement_email,
    c.phone AS etablissement_phone
FROM abonnements a
JOIN clients c ON a.id_etablissement = c.id
WHERE a.statut = 'ACTIF'
  AND julianday(a.date_fin) - julianday('now') BETWEEN 0 AND 30
ORDER BY jours_restants ASC;

-- Vue des abonnements en retard de paiement
CREATE VIEW IF NOT EXISTS v_abonnements_retard AS
SELECT 
    a.abonnement_id,
    a.id_etablissement,
    a.licence_id,
    a.plan,
    a.duree,
    a.date_prochain_paiement,
    julianday('now') - julianday(a.date_prochain_paiement) AS jours_retard,
    a.montant_final,
    c.name AS etablissement_nom,
    c.email AS etablissement_email,
    c.phone AS etablissement_phone,
    l.licence_key
FROM abonnements a
JOIN clients c ON a.id_etablissement = c.id
JOIN licences l ON a.licence_id = l.licence_id
WHERE a.statut = 'ACTIF'
  AND julianday('now') > julianday(a.date_prochain_paiement)
ORDER BY jours_retard DESC;

-- Vue des statistiques globales des abonnements
CREATE VIEW IF NOT EXISTS v_abonnements_stats_global AS
SELECT 
    COUNT(*) AS total_abonnements,
    SUM(CASE WHEN statut = 'ACTIF' THEN 1 ELSE 0 END) AS actifs,
    SUM(CASE WHEN statut = 'SUSPENDU' THEN 1 ELSE 0 END) AS suspendus,
    SUM(CASE WHEN statut = 'EXPIRE' THEN 1 ELSE 0 END) AS expires,
    SUM(CASE WHEN statut = 'ANNULE' THEN 1 ELSE 0 END) AS annules,
    SUM(CASE WHEN statut = 'EN_ATTENTE_PAIEMENT' THEN 1 ELSE 0 END) AS en_attente,
    SUM(CASE WHEN statut = 'ACTIF' THEN montant_final ELSE 0 END) AS revenu_total,
    AVG(CASE WHEN statut = 'ACTIF' THEN montant_final END) AS revenu_moyen,
    COUNT(DISTINCT id_etablissement) AS clients_uniques
FROM abonnements;

-- ============================================================================
-- VUES pour les paiements
-- ============================================================================

-- Vue de l'historique des paiements
CREATE VIEW IF NOT EXISTS v_paiements_historique AS
SELECT 
    t.transaction_id,
    t.id_etablissement,
    t.abonnement_id,
    t.licence_id,
    t.montant,
    t.devise,
    t.methode,
    t.description,
    t.numero_telephone,
    t.statut,
    t.date_demande,
    t.date_validation,
    t.reference_externe,
    t.reference_interne,
    c.name AS etablissement_nom,
    o.nom AS offre_nom,
    CASE 
        WHEN t.statut = 'REUSSI' THEN '✅'
        WHEN t.statut = 'ECHOUE' THEN '❌'
        WHEN t.statut = 'EN_ATTENTE' THEN '⏳'
        WHEN t.statut = 'EN_COURS' THEN '🔄'
        WHEN t.statut = 'ANNULE' THEN '🚫'
        WHEN t.statut = 'REMBOURSE' THEN '↩️'
        WHEN t.statut = 'TIMEOUT' THEN '⏰'
    END AS statut_icone
FROM transactions_paiement t
LEFT JOIN clients c ON t.id_etablissement = c.id
LEFT JOIN abonnements a ON t.abonnement_id = a.abonnement_id
LEFT JOIN offres o ON a.offre_id = o.offre_id
ORDER BY t.date_demande DESC;

-- Vue des paiements récents (7 derniers jours)
CREATE VIEW IF NOT EXISTS v_paiements_recents AS
SELECT 
    transaction_id,
    montant,
    devise,
    methode,
    statut,
    date_demande,
    date_validation,
    numero_telephone,
    julianday('now') - julianday(date_demande) AS jours_depuis
FROM transactions_paiement
WHERE date_demande >= datetime('now', '-7 days')
ORDER BY date_demande DESC;

-- Vue des revenus par méthode de paiement
CREATE VIEW IF NOT EXISTS v_revenus_par_methode AS
SELECT 
    methode,
    COUNT(*) AS nb_transactions,
    SUM(montant) AS total_montant,
    AVG(montant) AS moyenne_montant,
    SUM(CASE WHEN statut = 'REUSSI' THEN 1 ELSE 0 END) AS succes,
    ROUND(CAST(SUM(CASE WHEN statut = 'REUSSI' THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 2) AS taux_succes
FROM transactions_paiement
GROUP BY methode
ORDER BY total_montant DESC;

-- ============================================================================
-- VUES pour les clients
-- ============================================================================

-- Vue des clients avec leurs abonnements actifs
CREATE VIEW IF NOT EXISTS v_clients_avec_abonnements AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.company,
    c.status AS client_status,
    c.created_at,
    COUNT(a.abonnement_id) AS total_abonnements,
    SUM(CASE WHEN a.statut = 'ACTIF' THEN 1 ELSE 0 END) AS abonnements_actifs,
    SUM(CASE WHEN a.statut = 'ACTIF' THEN a.montant_final ELSE 0 END) AS revenu_total,
    MAX(a.date_fin) AS prochaine_expiration,
    GROUP_CONCAT(DISTINCT o.nom, ', ') AS offres
FROM clients c
LEFT JOIN abonnements a ON c.id = a.id_etablissement
LEFT JOIN offres o ON a.offre_id = o.offre_id
GROUP BY c.id;

-- Vue des clients à risque
CREATE VIEW IF NOT EXISTS v_clients_a_risque AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.company,
    c.status AS client_status,
    c.created_at,
    julianday('now') - julianday(c.created_at) AS jours_depuis_inscription,
    COUNT(a.abonnement_id) AS total_abonnements,
    SUM(CASE WHEN a.statut = 'SUSPENDU' THEN 1 ELSE 0 END) AS suspendus,
    SUM(CASE WHEN a.statut = 'EXPIRE' THEN 1 ELSE 0 END) AS expires,
    CASE 
        WHEN c.status = 'suspended' THEN '🔴 Suspendu'
        WHEN EXISTS (SELECT 1 FROM abonnements WHERE id_etablissement = c.id AND statut = 'EXPIRE') THEN '🟠 Abonnement expiré'
        WHEN COUNT(a.abonnement_id) = 0 THEN '🟡 Aucun abonnement'
        WHEN julianday('now') - julianday(c.created_at) > 365 AND COUNT(a.abonnement_id) = 1 THEN '🟡 Client ancien avec seul abonnement'
        ELSE '🟢 Actif'
    END AS statut_risque
FROM clients c
LEFT JOIN abonnements a ON c.id = a.id_etablissement
GROUP BY c.id
HAVING statut_risque != '🟢 Actif'
ORDER BY 
    CASE 
        WHEN statut_risque LIKE '🔴%' THEN 1
        WHEN statut_risque LIKE '🟠%' THEN 2
        WHEN statut_risque LIKE '🟡%' THEN 3
        ELSE 4
    END;

-- ============================================================================
-- VUES Dashboard
-- ============================================================================

-- Vue des statistiques du dashboard
CREATE VIEW IF NOT EXISTS v_dashboard_stats AS
SELECT 
    -- Clients
    (SELECT COUNT(*) FROM clients WHERE status = 'active') AS clients_actifs,
    (SELECT COUNT(*) FROM clients WHERE status = 'active' AND julianday('now') - julianday(created_at) <= 30) AS nouveaux_clients_30j,
    
    -- Licences
    (SELECT COUNT(*) FROM licences WHERE statut = 'ACTIVE' AND julianday('now') <= julianday(date_expiration)) AS licences_actives,
    (SELECT COUNT(*) FROM licences WHERE statut = 'ACTIVE' AND julianday(date_expiration) - julianday('now') <= 30) AS licences_expirant_bientot,
    (SELECT COUNT(*) FROM licences WHERE statut = 'GRACE_PERIOD') AS licences_grace_period,
    
    -- Abonnements
    (SELECT COUNT(*) FROM abonnements WHERE statut = 'ACTIF') AS abonnements_actifs,
    (SELECT SUM(montant_final) FROM abonnements WHERE statut = 'ACTIF') AS revenu_mensuel,
    (SELECT COUNT(*) FROM abonnements WHERE statut = 'EN_ATTENTE_PAIEMENT') AS abonnements_en_attente,
    
    -- Paiements
    (SELECT COUNT(*) FROM transactions_paiement WHERE statut = 'REUSSI' AND date_demande >= datetime('now', '-30 days')) AS paiements_30j,
    (SELECT SUM(montant) FROM transactions_paiement WHERE statut = 'REUSSI' AND date_demande >= datetime('now', '-30 days')) AS revenu_30j,
    
    -- Offres
    (SELECT COUNT(*) FROM offres WHERE statut = 'ACTIF') AS offres_actives,
    (SELECT COUNT(*) FROM offres WHERE est_populaire = 1) AS offres_populaires,
    
    datetime('now') AS genere_le;

-- ============================================================================
-- TRIGGERS pour les licences
-- ============================================================================

-- Trigger pour mettre à jour le statut des licences expirées
CREATE TRIGGER IF NOT EXISTS trg_licences_update_expired
AFTER UPDATE ON licences
BEGIN
    UPDATE licences
    SET statut = 'EXPIRED'
    WHERE julianday('now') > julianday(date_expiration) 
      AND statut = 'ACTIVE'
      AND licence_id = NEW.licence_id;
END;

-- Trigger pour logger la révocation
CREATE TRIGGER IF NOT EXISTS trg_licences_log_revocation
AFTER UPDATE OF statut ON licences
WHEN NEW.statut = 'REVOKED' AND OLD.statut != 'REVOKED'
BEGIN
    INSERT INTO evenements_licence (id_etablissement, licence_id, type_event, message, source)
    VALUES (NEW.id_etablissement, NEW.licence_id, 'REVOCATION', 'Licence révoquée: ' || NEW.licence_key, 'SYSTEM');
END;

-- Trigger pour créer un événement lors de la création d'une licence
CREATE TRIGGER IF NOT EXISTS trg_licences_create_event
AFTER INSERT ON licences
BEGIN
    INSERT INTO evenements_licence (id_etablissement, licence_id, type_event, message, source)
    VALUES (NEW.id_etablissement, NEW.licence_id, 'ACTIVATION', 'Licence créée: ' || NEW.licence_key, 'SYSTEM');
END;

-- Trigger pour mettre à jour le cache
CREATE TRIGGER IF NOT EXISTS trg_licences_update_cache
AFTER UPDATE OF statut, date_expiration ON licences
BEGIN
    INSERT OR REPLACE INTO licence_cache (id, licence_key, statut, date_expiration, jours_restants, updated_at)
    VALUES (
        1,
        NEW.licence_key,
        NEW.statut,
        NEW.date_expiration,
        CAST(julianday(NEW.date_expiration) - julianday('now') AS INTEGER),
        datetime('now')
    );
END;

-- ============================================================================
-- TRIGGERS pour les abonnements
-- ============================================================================

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER IF NOT EXISTS trg_abonnements_updated
AFTER UPDATE ON abonnements
BEGIN
    UPDATE abonnements
    SET updated_at = datetime('now')
    WHERE abonnement_id = NEW.abonnement_id;
END;

-- Trigger pour mettre à jour les statistiques des offres
CREATE TRIGGER IF NOT EXISTS trg_abonnements_update_offre_stats
AFTER INSERT ON abonnements
BEGIN
    UPDATE offres
    SET nombre_abonnes = (
        SELECT COUNT(*) 
        FROM abonnements 
        WHERE offre_id = NEW.offre_id 
        AND statut = 'ACTIF'
    )
    WHERE offre_id = NEW.offre_id;
END;

-- Trigger pour marquer les abonnements expirés
CREATE TRIGGER IF NOT EXISTS trg_abonnements_update_expired
AFTER UPDATE ON abonnements
BEGIN
    UPDATE abonnements
    SET statut = 'EXPIRE'
    WHERE date_fin IS NOT NULL
      AND julianday('now') > julianday(date_fin)
      AND statut = 'ACTIF';
END;

-- ============================================================================
-- TRIGGERS pour les paiements
-- ============================================================================

-- Trigger pour mettre à jour le statut des paiements en attente
CREATE TRIGGER IF NOT EXISTS trg_paiements_update_timeout
AFTER UPDATE ON transactions_paiement
BEGIN
    UPDATE transactions_paiement
    SET statut = 'TIMEOUT'
    WHERE statut = 'EN_ATTENTE'
      AND date_expiration IS NOT NULL
      AND julianday('now') > julianday(date_expiration);
END;

-- Trigger pour logger un paiement réussi
CREATE TRIGGER IF NOT EXISTS trg_paiements_log_success
AFTER UPDATE OF statut ON transactions_paiement
WHEN NEW.statut = 'REUSSI' AND OLD.statut != 'REUSSI'
BEGIN
    INSERT INTO evenements_licence (id_etablissement, licence_id, abonnement_id, type_event, message, source)
    VALUES (
        NEW.id_etablissement, 
        NEW.licence_id, 
        NEW.abonnement_id,
        'PAIEMENT_REUSSI', 
        'Paiement réussi de ' || NEW.montant || ' ' || NEW.devise || ' par ' || NEW.methode,
        'SYSTEM'
    );
END;

-- ============================================================================
-- VUE globale des statistiques de sécurité
-- ============================================================================

CREATE VIEW IF NOT EXISTS v_securite_stats AS
SELECT 
    COUNT(*) AS total_licences,
    SUM(CASE WHEN statut = 'ACTIVE' THEN 1 ELSE 0 END) AS actives,
    SUM(CASE WHEN statut = 'GRACE_PERIOD' THEN 1 ELSE 0 END) AS grace_period,
    SUM(CASE WHEN statut = 'EXPIRED' THEN 1 ELSE 0 END) AS expirees,
    SUM(CASE WHEN statut = 'SUSPENDED' THEN 1 ELSE 0 END) AS suspendues,
    SUM(CASE WHEN statut = 'REVOKED' THEN 1 ELSE 0 END) AS revoquees,
    AVG(activations_max) AS avg_activations_max,
    AVG(activations_utilisees) AS avg_activations_utilisees,
    (SELECT COUNT(*) FROM used_challenges) AS challenges_utilises
FROM licences;

-- ============================================================================
-- FIN DES VUES ET TRIGGERS SQLITE
-- ============================================================================