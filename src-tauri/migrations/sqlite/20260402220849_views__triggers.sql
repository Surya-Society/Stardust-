-- Add migration script here
-- ============================================================================
-- VUES pour les clés d'activation
-- ============================================================================

-- Vue des clés actives avec informations de sécurité
CREATE VIEW IF NOT EXISTS v_active_keys AS
SELECT 
    id,
    key_text,
    school_name,
    plan,
    status,
    created_at,
    expires_at,
    uses,
    max_uses,
    hw_lock,
    two_fa,
    ip_restrict,
    sec_score,
    fingerprint,
    activation_method,
    CASE 
        WHEN julianday('now') > julianday(expires_at) THEN 'expired'
        WHEN status = 'suspended' THEN 'suspended'
        WHEN status = 'revoked' THEN 'revoked'
        ELSE 'active'
    END AS current_status,
    (julianday(expires_at) - julianday('now')) AS days_remaining,
    CAST(uses AS REAL) / max_uses * 100 AS usage_rate
FROM activation_keys
WHERE status = 'active' AND julianday('now') <= julianday(expires_at);

-- Vue des statistiques par plan
CREATE VIEW IF NOT EXISTS v_keys_stats_by_plan AS
SELECT 
    plan,
    COUNT(*) AS total_keys,
    SUM(CASE WHEN status = 'active' AND julianday('now') <= julianday(expires_at) THEN 1 ELSE 0 END) AS active_keys,
    SUM(CASE WHEN status = 'expired' OR julianday('now') > julianday(expires_at) THEN 1 ELSE 0 END) AS expired_keys,
    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended_keys,
    SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) AS revoked_keys,
    SUM(uses) AS total_uses,
    AVG(sec_score) AS avg_sec_score,
    SUM(CASE WHEN hw_lock = 1 THEN 1 ELSE 0 END) AS hw_lock_count,
    SUM(CASE WHEN two_fa = 1 THEN 1 ELSE 0 END) AS two_fa_count
FROM activation_keys
GROUP BY plan;

-- Vue des clés expirant dans les 30 jours
CREATE VIEW IF NOT EXISTS v_keys_expiring_soon AS
SELECT 
    id,
    key_text,
    school_name,
    plan,
    expires_at,
    julianday(expires_at) - julianday('now') AS days_remaining,
    uses,
    max_uses,
    contact_email
FROM activation_keys a
LEFT JOIN clients c ON a.school_name = c.school
WHERE status = 'active' 
  AND julianday(expires_at) - julianday('now') BETWEEN 0 AND 30
ORDER BY days_remaining ASC;

-- ============================================================================
-- TRIGGERS pour les clés d'activation
-- ============================================================================

-- Trigger pour mettre à jour le statut des clés expirées
CREATE TRIGGER IF NOT EXISTS trg_update_expired_keys
AFTER UPDATE ON activation_keys
BEGIN
    UPDATE activation_keys
    SET status = 'expired'
    WHERE julianday('now') > julianday(expires_at) 
      AND status = 'active'
      AND id = NEW.id;
END;

-- Trigger pour logger la révocation des clés
CREATE TRIGGER IF NOT EXISTS trg_log_key_revocation
AFTER UPDATE OF status ON activation_keys
WHEN NEW.status = 'revoked' AND OLD.status != 'revoked'
BEGIN
    INSERT INTO security_audit_logs (activation_key_id, action, user_id, user_name, ip_address, details, created_at)
    VALUES (NEW.id, 'revoke', NULL, 'system', NULL, 'Key revoked automatically', datetime('now'));
END;

-- Trigger pour mettre à jour le score de sécurité
CREATE TRIGGER IF NOT EXISTS trg_update_sec_score
AFTER UPDATE OF hw_lock, two_fa, ip_restrict ON activation_keys
BEGIN
    UPDATE activation_keys
    SET sec_score = 20 
        + (CASE WHEN NEW.hw_lock = 1 THEN 30 ELSE 0 END)
        + (CASE WHEN NEW.two_fa = 1 THEN 30 ELSE 0 END)
        + (CASE WHEN NEW.ip_restrict = 1 THEN 20 ELSE 0 END)
    WHERE id = NEW.id;
END;

-- Trigger pour incrémenter le compteur d'utilisations
CREATE TRIGGER IF NOT EXISTS trg_increment_uses
AFTER UPDATE OF last_used ON activation_keys
WHEN NEW.last_used != OLD.last_used
BEGIN
    UPDATE activation_keys
    SET uses = uses + 1
    WHERE id = NEW.id;
END;

-- ============================================================================
-- VUES pour les algorithmes
-- ============================================================================

-- Vue des algorithmes avec leurs langages supportés
CREATE VIEW IF NOT EXISTS v_algorithms_with_languages AS
SELECT 
    a.id,
    a.name,
    a.description,
    a.type,
    a.version,
    a.status,
    a.usage_count,
    a.rating,
    a.created_at,
    a.updated_at,
    GROUP_CONCAT(al.language_name || ' ' || al.language_version, ', ') AS languages,
    COUNT(al.id) AS languages_count,
    SUM(al.downloads) AS total_downloads
FROM algorithms a
LEFT JOIN algorithm_languages al ON a.id = al.algorithm_id
GROUP BY a.id;

-- Vue des algorithmes les plus populaires
CREATE VIEW IF NOT EXISTS v_top_algorithms AS
SELECT 
    id,
    name,
    type,
    version,
    status,
    usage_count,
    rating,
    ROUND(rating * usage_count / 1000, 2) AS popularity_score
FROM algorithms
WHERE status = 'stable'
ORDER BY usage_count DESC, rating DESC
LIMIT 10;

-- Vue des statistiques par type d'algorithme
CREATE VIEW IF NOT EXISTS v_algorithms_stats_by_type AS
SELECT 
    type,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'stable' THEN 1 ELSE 0 END) AS stable_count,
    SUM(CASE WHEN status = 'beta' THEN 1 ELSE 0 END) AS beta_count,
    SUM(usage_count) AS total_usage,
    AVG(rating) AS avg_rating,
    SUM((
        SELECT SUM(downloads) 
        FROM algorithm_languages 
        WHERE algorithm_id = algorithms.id
    )) AS total_downloads
FROM algorithms
GROUP BY type;

-- ============================================================================
-- TRIGGERS pour les algorithmes
-- ============================================================================

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER IF NOT EXISTS trg_algorithms_updated
AFTER UPDATE ON algorithms
BEGIN
    UPDATE algorithms
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;

-- Trigger pour maintenir la version courante unique
CREATE TRIGGER IF NOT EXISTS trg_algorithm_current_version
AFTER UPDATE OF is_current ON algorithm_versions
WHEN NEW.is_current = 1
BEGIN
    UPDATE algorithm_versions
    SET is_current = 0
    WHERE algorithm_id = NEW.algorithm_id 
      AND id != NEW.id;
END;

-- Trigger pour mettre à jour la version de l'algorithme parent
CREATE TRIGGER IF NOT EXISTS trg_update_algorithm_version
AFTER INSERT ON algorithm_versions
WHEN NEW.is_current = 1
BEGIN
    UPDATE algorithms
    SET version = NEW.version,
        updated_at = datetime('now')
    WHERE id = NEW.algorithm_id;
END;

-- ============================================================================
-- VUES pour les templates
-- ============================================================================

-- Vue des templates avec leurs tags
CREATE VIEW IF NOT EXISTS v_templates_with_tags AS
SELECT 
    t.id,
    t.name,
    t.type,
    t.category,
    t.description,
    t.format,
    t.downloads,
    t.uses,
    t.customizable,
    t.is_active,
    t.created_at,
    t.updated_at,
    GROUP_CONCAT(tt.tag, ', ') AS tags,
    COUNT(tt.id) AS tags_count
FROM templates t
LEFT JOIN template_tags tt ON t.id = tt.template_id
GROUP BY t.id;

-- Vue des templates les plus utilisés
CREATE VIEW IF NOT EXISTS v_top_templates AS
SELECT 
    id,
    name,
    type,
    category,
    format,
    downloads,
    uses,
    customizable,
    ROUND(CAST(uses AS REAL) / downloads * 100, 2) AS conversion_rate
FROM templates
WHERE is_active = 1
ORDER BY uses DESC, downloads DESC
LIMIT 20;

-- Vue des statistiques par catégorie de template
CREATE VIEW IF NOT EXISTS v_templates_stats_by_category AS
SELECT 
    category,
    type,
    COUNT(*) AS total,
    SUM(downloads) AS total_downloads,
    SUM(uses) AS total_uses,
    AVG(CAST(uses AS REAL) / NULLIF(downloads, 0)) AS avg_usage_rate
FROM templates
WHERE is_active = 1
GROUP BY category, type;

-- Vue des templates personnalisables
CREATE VIEW IF NOT EXISTS v_customizable_templates AS
SELECT 
    id,
    name,
    type,
    category,
    format,
    downloads,
    uses,
    (
        SELECT COUNT(*) 
        FROM template_custom_fields 
        WHERE template_id = templates.id
    ) AS fields_count
FROM templates
WHERE customizable = 1 AND is_active = 1;

-- ============================================================================
-- TRIGGERS pour les templates
-- ============================================================================

-- Trigger pour incrémenter les téléchargements
CREATE TRIGGER IF NOT EXISTS trg_increment_template_downloads
AFTER UPDATE OF downloads ON templates
WHEN NEW.downloads > OLD.downloads
BEGIN
    UPDATE templates
    SET downloads = downloads + 1
    WHERE id = NEW.id;
END;

-- Trigger pour incrémenter les utilisations
CREATE TRIGGER IF NOT EXISTS trg_increment_template_uses
AFTER UPDATE OF uses ON templates
WHEN NEW.uses > OLD.uses
BEGIN
    UPDATE templates
    SET uses = uses + 1
    WHERE id = NEW.id;
END;

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER IF NOT EXISTS trg_templates_updated
AFTER UPDATE ON templates
BEGIN
    UPDATE templates
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;

-- ============================================================================
-- VUES pour les clés API
-- ============================================================================

-- Vue des clés API actives
CREATE VIEW IF NOT EXISTS v_active_api_keys AS
SELECT 
    k.id,
    k.name,
    k.scope,
    k.algorithm_id,
    a.name AS algorithm_name,
    k.status,
    k.requests_count,
    k.created_at,
    k.expires_at,
    k.last_used_at,
    CASE 
        WHEN k.expires_at IS NULL THEN 'never'
        WHEN julianday('now') > julianday(k.expires_at) THEN 'expired'
        ELSE 'active'
    END AS expiry_status,
    julianday('now') - julianday(k.last_used_at) AS days_since_last_use
FROM api_keys k
LEFT JOIN algorithms a ON k.algorithm_id = a.id
WHERE k.status = 'active'
  AND (k.expires_at IS NULL OR julianday('now') <= julianday(k.expires_at));

-- Vue des statistiques d'utilisation des clés API
CREATE VIEW IF NOT EXISTS v_api_keys_usage_stats AS
SELECT 
    k.id,
    k.name,
    k.scope,
    k.requests_count,
    COUNT(l.id) AS log_entries,
    MAX(l.created_at) AS last_request,
    AVG(l.response_time) AS avg_response_time,
    COUNT(CASE WHEN l.status_code >= 400 THEN 1 END) AS error_count
FROM api_keys k
LEFT JOIN api_key_logs l ON k.id = l.api_key_id
GROUP BY k.id;

-- Vue des clés API à risque (inactives depuis longtemps)
CREATE VIEW IF NOT EXISTS v_at_risk_api_keys AS
SELECT 
    id,
    name,
    scope,
    status,
    requests_count,
    created_at,
    last_used_at,
    julianday('now') - julianday(COALESCE(last_used_at, created_at)) AS days_inactive
FROM api_keys
WHERE status = 'active'
  AND (last_used_at IS NULL OR julianday('now') - julianday(last_used_at) > 90)
ORDER BY days_inactive DESC;

-- ============================================================================
-- TRIGGERS pour les clés API
-- ============================================================================

-- Trigger pour mettre à jour la date de dernière utilisation
CREATE TRIGGER IF NOT EXISTS trg_update_api_key_last_used
AFTER INSERT ON api_key_logs
BEGIN
    UPDATE api_keys
    SET last_used_at = datetime('now'),
        requests_count = requests_count + 1
    WHERE id = NEW.api_key_id;
END;

-- Trigger pour expirer automatiquement les clés API
CREATE TRIGGER IF NOT EXISTS trg_expire_api_keys
AFTER UPDATE ON api_keys
BEGIN
    UPDATE api_keys
    SET status = 'expired'
    WHERE expires_at IS NOT NULL 
      AND julianday('now') > julianday(expires_at)
      AND status = 'active';
END;

-- Trigger pour logger la création de clé API
CREATE TRIGGER IF NOT EXISTS trg_log_api_key_creation
AFTER INSERT ON api_keys
BEGIN
    INSERT INTO security_audit_logs (action, user_id, user_name, details, created_at)
    VALUES ('api_key_create', NEW.created_by, NULL, 'Created API key: ' || NEW.name, datetime('now'));
END;

-- Trigger pour logger la révocation de clé API
CREATE TRIGGER IF NOT EXISTS trg_log_api_key_revocation
AFTER UPDATE OF status ON api_keys
WHEN NEW.status = 'revoked' AND OLD.status != 'revoked'
BEGIN
    INSERT INTO security_audit_logs (action, user_id, user_name, details, created_at)
    VALUES ('api_key_revoke', NULL, NULL, 'Revoked API key: ' || NEW.name, datetime('now'));
END;

-- ============================================================================
-- VUE globale des statistiques de la plateforme
-- ============================================================================

CREATE VIEW IF NOT EXISTS v_platform_stats AS
SELECT 
    (SELECT COUNT(*) FROM activation_keys) AS total_keys,
    (SELECT COUNT(*) FROM activation_keys WHERE status = 'active' AND julianday('now') <= julianday(expires_at)) AS active_keys,
    (SELECT COUNT(*) FROM algorithms) AS total_algorithms,
    (SELECT COUNT(*) FROM templates) AS total_templates,
    (SELECT COUNT(*) FROM api_keys) AS total_api_keys,
    (SELECT COUNT(*) FROM api_keys WHERE status = 'active') AS active_api_keys,
    (SELECT SUM(uses) FROM activation_keys) AS total_key_uses,
    (SELECT SUM(requests_count) FROM api_keys) AS total_api_requests,
    (SELECT SUM(downloads) FROM templates) AS total_template_downloads,
    (SELECT SUM(downloads) FROM algorithm_languages) AS total_algorithm_downloads,
    datetime('now') AS calculated_at;

    -- ============================================================================
-- VUES pour les clients
-- ============================================================================

-- Vue des clients actifs avec leurs statistiques
CREATE VIEW IF NOT EXISTS v_clients_active AS
SELECT 
    c.id,
    c.name,
    c.role,
    c.school,
    c.email,
    c.phone,
    c.joined_at,
    c.status,
    c.last_active,
    cs.total_requests,
    cs.open_requests,
    cs.completed_requests,
    cs.urgent_requests,
    cs.satisfaction_score,
    julianday('now') - julianday(c.last_active) AS days_inactive
FROM clients c
LEFT JOIN client_stats cs ON c.id = cs.client_id
WHERE c.status = 'active'
  AND (c.last_active IS NULL OR julianday('now') - julianday(c.last_active) <= 30);

-- Vue des clients à risque (inactifs ou avec demandes urgentes)
CREATE VIEW IF NOT EXISTS v_clients_at_risk AS
SELECT 
    c.id,
    c.name,
    c.school,
    c.status,
    c.last_active,
    cs.open_requests,
    cs.urgent_requests,
    cs.satisfaction_score,
    julianday('now') - julianday(c.last_active) AS days_inactive,
    CASE 
        WHEN c.status = 'suspended' THEN 'suspended'
        WHEN julianday('now') - julianday(c.last_active) > 30 THEN 'inactive_30d'
        WHEN cs.urgent_requests > 0 THEN 'has_urgent_requests'
        WHEN cs.satisfaction_score < 3 THEN 'low_satisfaction'
        ELSE NULL
    END AS risk_reason
FROM clients c
LEFT JOIN client_stats cs ON c.id = cs.client_id
WHERE c.status IN ('suspended', 'inactive')
   OR julianday('now') - julianday(c.last_active) > 30
   OR cs.urgent_requests > 0
   OR cs.satisfaction_score < 3;

-- Vue des statistiques globales des clients
CREATE VIEW IF NOT EXISTS v_clients_stats_global AS
SELECT 
    COUNT(*) AS total_clients,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_clients,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive_clients,
    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended_clients,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_clients,
    AVG(CASE WHEN satisfaction_score IS NOT NULL THEN satisfaction_score END) AS avg_satisfaction,
    SUM(open_requests) AS total_open_requests,
    SUM(urgent_requests) AS total_urgent_requests
FROM clients c
LEFT JOIN client_stats cs ON c.id = cs.client_id;

-- ============================================================================
-- TRIGGERS pour les clients
-- ============================================================================

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER IF NOT EXISTS trg_clients_updated
AFTER UPDATE ON clients
BEGIN
    UPDATE clients
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;

-- Trigger pour créer automatiquement les statistiques client
CREATE TRIGGER IF NOT EXISTS trg_create_client_stats
AFTER INSERT ON clients
BEGIN
    INSERT INTO client_stats (client_id, updated_at)
    VALUES (NEW.id, datetime('now'));
END;

-- Trigger pour mettre à jour les statistiques client après une demande
CREATE TRIGGER IF NOT EXISTS trg_update_client_stats_on_request
AFTER INSERT ON client_requests
BEGIN
    UPDATE client_stats
    SET total_requests = total_requests + 1,
        open_requests = open_requests + 1,
        last_request_at = datetime('now'),
        updated_at = datetime('now')
    WHERE client_id = NEW.client_id;
    
    -- Si la demande est urgente, incrémenter aussi urgent_requests
    UPDATE client_stats
    SET urgent_requests = urgent_requests + 1
    WHERE client_id = NEW.client_id AND NEW.priority = 'urgent';
END;

-- Trigger pour mettre à jour les statistiques client après changement de statut de demande
CREATE TRIGGER IF NOT EXISTS trg_update_client_stats_on_request_status
AFTER UPDATE OF status ON client_requests
BEGIN
    -- Décrémenter open_requests si la demande n'est plus ouverte
    UPDATE client_stats
    SET open_requests = open_requests - 1
    WHERE client_id = NEW.client_id 
      AND OLD.status IN ('new', 'in-progress', 'urgent')
      AND NEW.status NOT IN ('new', 'in-progress', 'urgent');
    
    -- Incrémenter completed_requests si terminée
    UPDATE client_stats
    SET completed_requests = completed_requests + 1
    WHERE client_id = NEW.client_id AND NEW.status = 'completed' AND OLD.status != 'completed';
END;

-- ============================================================================
-- VUES pour les abonnements
-- ============================================================================

-- Vue des abonnements actifs
CREATE VIEW IF NOT EXISTS v_active_subscriptions AS
SELECT 
    s.id,
    c.name AS client_name,
    c.school,
    s.plan,
    s.amount_fcfa,
    s.status,
    s.start_date,
    s.next_billing_date,
    s.users_count,
    s.auto_renew,
    julianday(s.next_billing_date) - julianday('now') AS days_until_billing,
    CASE 
        WHEN julianday('now') > julianday(s.next_billing_date) THEN 'overdue'
        WHEN julianday(s.next_billing_date) - julianday('now') <= 7 THEN 'due_soon'
        ELSE 'active'
    END AS billing_status
FROM subscriptions s
JOIN clients c ON s.client_id = c.id
WHERE s.status IN ('paid', 'pending')
  AND (s.end_date IS NULL OR julianday('now') <= julianday(s.end_date));

-- Vue des revenus mensuels par plan
CREATE VIEW IF NOT EXISTS v_monthly_revenue_by_plan AS
SELECT 
    strftime('%Y-%m', s.created_at) AS month,
    s.plan,
    COUNT(*) AS subscriptions_count,
    SUM(s.amount_fcfa) AS total_revenue,
    AVG(s.amount_fcfa) AS avg_revenue
FROM subscriptions s
WHERE s.status = 'paid'
GROUP BY strftime('%Y-%m', s.created_at), s.plan
ORDER BY month DESC;

-- Vue des abonnements expirant bientôt
CREATE VIEW IF NOT EXISTS v_subscriptions_expiring_soon AS
SELECT 
    s.id,
    c.name AS client_name,
    c.school,
    c.email,
    s.plan,
    s.amount_fcfa,
    s.next_billing_date,
    julianday(s.next_billing_date) - julianday('now') AS days_remaining
FROM subscriptions s
JOIN clients c ON s.client_id = c.id
WHERE s.status = 'paid'
  AND julianday(s.next_billing_date) - julianday('now') BETWEEN 0 AND 30
ORDER BY days_remaining ASC;

-- ============================================================================
-- TRIGGERS pour les abonnements
-- ============================================================================

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER IF NOT EXISTS trg_subscriptions_updated
AFTER UPDATE ON subscriptions
BEGIN
    UPDATE subscriptions
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;

-- Trigger pour marquer les abonnements en retard
CREATE TRIGGER IF NOT EXISTS trg_update_overdue_subscriptions
AFTER UPDATE ON subscriptions
BEGIN
    UPDATE subscriptions
    SET status = 'overdue'
    WHERE status = 'paid'
      AND julianday('now') > julianday(next_billing_date);
END;

-- Trigger pour logger les paiements
CREATE TRIGGER IF NOT EXISTS trg_log_payment
AFTER INSERT ON payment_history
BEGIN
    -- Mettre à jour la date de prochaine facturation
    UPDATE subscriptions
    SET next_billing_date = datetime(
        'now', 
        '+' || CASE 
            WHEN plan = 'Monthly' THEN '1 month'
            WHEN plan = 'Quarterly' THEN '3 months'
            WHEN plan = 'Yearly' THEN '1 year'
        END
    ),
    status = 'paid',
    updated_at = datetime('now')
    WHERE id = NEW.subscription_id;
END;

-- Trigger pour créer un rappel d'échéance
CREATE TRIGGER IF NOT EXISTS trg_create_billing_reminder
AFTER UPDATE OF next_billing_date ON subscriptions
WHEN julianday(NEW.next_billing_date) - julianday('now') <= 7
BEGIN
    INSERT INTO billing_reminders (subscription_id, reminder_type, sent_at, sent_to, status, created_at)
    VALUES (NEW.id, '7days', datetime('now'), 
            (SELECT email FROM clients WHERE id = NEW.client_id),
            'sent', datetime('now'));
END;

-- ============================================================================
-- VUES pour les applications
-- ============================================================================

-- Vue des applications avec taux d'activité
CREATE VIEW IF NOT EXISTS v_applications_activity AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.platform,
    a.version,
    a.status,
    a.users_count,
    a.active_users,
    a.downloads,
    ROUND(CAST(a.active_users AS REAL) / NULLIF(a.users_count, 0) * 100, 2) AS activity_rate,
    ROUND(CAST(a.downloads AS REAL) / NULLIF(a.users_count, 0), 2) AS downloads_per_user,
    a.updated_at
FROM applications a
WHERE a.status != 'deprecated';

-- Vue des statistiques journalières des applications
CREATE VIEW IF NOT EXISTS v_app_daily_stats_view AS
SELECT 
    a.name,
    a.type,
    ads.date,
    ads.users,
    ads.active_users,
    ads.downloads,
    ads.crashes,
    ROUND(CAST(ads.active_users AS REAL) / NULLIF(ads.users, 0) * 100, 2) AS daily_activity_rate
FROM app_daily_stats ads
JOIN applications a ON ads.application_id = a.id
ORDER BY ads.date DESC;

-- Vue des applications les plus téléchargées
CREATE VIEW IF NOT EXISTS v_top_applications AS
SELECT 
    id,
    name,
    type,
    platform,
    downloads,
    users_count,
    rating,
    ROUND(downloads / NULLIF(users_count, 0), 2) AS adoption_rate
FROM applications
WHERE status = 'published'
ORDER BY downloads DESC
LIMIT 10;

-- ============================================================================
-- TRIGGERS pour les applications
-- ============================================================================

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER IF NOT EXISTS trg_applications_updated
AFTER UPDATE ON applications
BEGIN
    UPDATE applications
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;

-- Trigger pour créer une entrée de statistiques journalière
CREATE TRIGGER IF NOT EXISTS trg_create_daily_stats
AFTER UPDATE OF users_count, active_users, downloads ON applications
BEGIN
    INSERT OR REPLACE INTO app_daily_stats (application_id, date, users, active_users, downloads, crashes, avg_response_time)
    VALUES (NEW.id, date('now'), NEW.users_count, NEW.active_users, NEW.downloads, 0, NULL);
END;

-- ============================================================================
-- VUES pour les examens
-- ============================================================================

-- Vue des sujets d'examen publiés
CREATE VIEW IF NOT EXISTS v_published_exam_subjects AS
SELECT 
    es.id,
    es.title,
    es.description,
    es.level,
    es.subject,
    es.author,
    es.date_published,
    es.downloads,
    es.report_count,
    COUNT(esr.id) AS active_reports,
    (SELECT COUNT(*) FROM exam_subject_downloads WHERE subject_id = es.id) AS unique_downloads
FROM exam_subjects es
LEFT JOIN exam_subject_reports esr ON es.id = esr.subject_id AND esr.status = 'pending'
WHERE es.status = 'published'
GROUP BY es.id;

-- Vue des sujets signalés en attente de modération
CREATE VIEW IF NOT EXISTS v_reported_exam_subjects AS
SELECT 
    es.id,
    es.title,
    es.subject,
    es.level,
    es.author,
    es.date_published,
    COUNT(esr.id) AS report_count,
    GROUP_CONCAT(DISTINCT esr.reason, ', ') AS reasons
FROM exam_subjects es
JOIN exam_subject_reports esr ON es.id = esr.subject_id
WHERE esr.status = 'pending'
GROUP BY es.id
ORDER BY report_count DESC;

-- Vue des statistiques par matière
CREATE VIEW IF NOT EXISTS v_exam_stats_by_subject AS
SELECT 
    subject,
    COUNT(*) AS total_subjects,
    SUM(downloads) AS total_downloads,
    AVG(downloads) AS avg_downloads,
    SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published_count,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
    SUM(CASE WHEN reported = 1 THEN 1 ELSE 0 END) AS reported_count
FROM exam_subjects
GROUP BY subject
ORDER BY total_downloads DESC;

-- ============================================================================
-- TRIGGERS pour les examens
-- ============================================================================

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER IF NOT EXISTS trg_exam_subjects_updated
AFTER UPDATE ON exam_subjects
BEGIN
    UPDATE exam_subjects
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;

-- Trigger pour incrémenter les téléchargements
CREATE TRIGGER IF NOT EXISTS trg_increment_exam_downloads
AFTER INSERT ON exam_subject_downloads
BEGIN
    UPDATE exam_subjects
    SET downloads = downloads + 1
    WHERE id = NEW.subject_id;
END;

-- Trigger pour mettre à jour le compteur de signalements
CREATE TRIGGER IF NOT EXISTS trg_update_report_count
AFTER INSERT ON exam_subject_reports
BEGIN
    UPDATE exam_subjects
    SET reported = 1,
        report_count = report_count + 1
    WHERE id = NEW.subject_id;
END;

-- ============================================================================
-- VUES pour les administrateurs
-- ============================================================================

-- Vue des administrateurs actifs
CREATE VIEW IF NOT EXISTS v_active_admins AS
SELECT 
    id,
    name,
    email,
    role,
    status,
    created_at,
    last_login,
    julianday('now') - julianday(last_login) AS days_since_last_login
FROM admin_users
WHERE status = 'active'
ORDER BY role, name;

-- Vue des permissions par rôle
CREATE VIEW IF NOT EXISTS v_role_permissions_view AS
SELECT 
    rp.role,
    COUNT(rp.permission_code) AS permissions_count,
    GROUP_CONCAT(rp.permission_code, ', ') AS permission_codes
FROM role_permissions rp
GROUP BY rp.role;

-- Vue des logs d'activité récents
CREATE VIEW IF NOT EXISTS v_recent_admin_activity AS
SELECT 
    aal.id,
    au.name AS admin_name,
    au.role,
    aal.action,
    aal.resource_type,
    aal.resource_id,
    aal.details,
    aal.ip_address,
    aal.created_at
FROM admin_activity_logs aal
JOIN admin_users au ON aal.admin_id = au.id
ORDER BY aal.created_at DESC
LIMIT 100;

-- ============================================================================
-- TRIGGERS pour les administrateurs
-- ============================================================================

-- Trigger pour mettre à jour la date de dernière connexion
CREATE TRIGGER IF NOT EXISTS trg_update_admin_last_login
AFTER UPDATE OF last_login ON admin_users
BEGIN
    UPDATE admin_users
    SET last_login = datetime('now')
    WHERE id = NEW.id;
END;

-- Trigger pour logger la connexion admin
CREATE TRIGGER IF NOT EXISTS trg_log_admin_login
AFTER UPDATE OF last_login ON admin_users
WHEN NEW.last_login != OLD.last_login
BEGIN
    INSERT INTO admin_activity_logs (admin_id, action, resource_type, resource_id, details, ip_address, created_at)
    VALUES (NEW.id, 'login', 'admin', NEW.id, 'Admin logged in', NEW.last_ip, datetime('now'));
END;

-- Trigger pour empêcher la suppression du dernier superadmin
CREATE TRIGGER IF NOT EXISTS trg_prevent_last_superadmin_delete
BEFORE DELETE ON admin_users
WHEN OLD.role = 'superadmin' 
  AND (SELECT COUNT(*) FROM admin_users WHERE role = 'superadmin') = 1
BEGIN
    SELECT RAISE(ABORT, 'Cannot delete the last superadmin user');
END;

-- ============================================================================
-- VUE globale du tableau de bord administrateur
-- ============================================================================

CREATE VIEW IF NOT EXISTS v_admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM clients WHERE status = 'active') AS active_clients,
    (SELECT COUNT(*) FROM clients WHERE status = 'active' AND julianday('now') - julianday(last_active) <= 7) AS active_last_7d,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'paid') AS active_subscriptions,
    (SELECT SUM(amount_fcfa) FROM subscriptions WHERE status = 'paid') AS monthly_recurring_revenue,
    (SELECT COUNT(*) FROM activation_keys WHERE status = 'active' AND julianday('now') <= julianday(expires_at)) AS active_licenses,
    (SELECT COUNT(*) FROM client_requests WHERE status IN ('new', 'in-progress', 'urgent')) AS open_requests,
    (SELECT COUNT(*) FROM client_requests WHERE priority = 'urgent' AND status != 'completed') AS urgent_requests,
    (SELECT COUNT(*) FROM exam_subjects WHERE status = 'pending') AS pending_exam_subjects,
    (SELECT COUNT(*) FROM exam_subject_reports WHERE status = 'pending') AS pending_reports,
    (SELECT COUNT(*) FROM admin_users WHERE status = 'active') AS active_admins,
    datetime('now') AS generated_at;

    -- ============================================================================
-- VUES pour les avis
-- ============================================================================

-- Vue des avis vérifiés avec haute note
CREATE VIEW IF NOT EXISTS v_featured_reviews AS
SELECT 
    r.id,
    r.author,
    r.school,
    r.rating,
    r.content,
    r.date_published,
    r.verified,
    r.response,
    COUNT(rl.id) AS likes_count
FROM reviews r
LEFT JOIN review_likes rl ON r.id = rl.review_id
WHERE r.status = 'published' 
  AND r.verified = 1 
  AND r.rating >= 4
GROUP BY r.id
ORDER BY r.rating DESC, likes_count DESC
LIMIT 10;

-- Vue des avis signalés en attente de modération
CREATE VIEW IF NOT EXISTS v_reported_reviews AS
SELECT 
    r.id,
    r.author,
    r.school,
    r.rating,
    r.content,
    r.date_published,
    r.report_count,
    GROUP_CONCAT(DISTINCT rr.reason, ', ') AS report_reasons,
    MIN(rr.created_at) AS first_report_at
FROM reviews r
JOIN review_reports rr ON r.id = rr.review_id
WHERE r.reported = 1 
  AND r.status = 'published'
  AND rr.status = 'pending'
GROUP BY r.id
ORDER BY r.report_count DESC, first_report_at ASC;

-- Vue des statistiques des avis par note
CREATE VIEW IF NOT EXISTS v_reviews_stats_by_rating AS
SELECT 
    rating,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reviews WHERE status = 'published'), 2) AS percentage,
    AVG(CASE WHEN verified = 1 THEN 1 ELSE 0 END) * 100 AS verified_percentage
FROM reviews
WHERE status = 'published'
GROUP BY rating
ORDER BY rating DESC;

-- Vue des avis récents avec réponses
CREATE VIEW IF NOT EXISTS v_recent_reviews_with_responses AS
SELECT 
    r.id,
    r.author,
    r.school,
    r.rating,
    r.content,
    r.date_published,
    r.response,
    r.response IS NOT NULL AS has_response,
    julianday('now') - julianday(r.date_published) AS days_ago
FROM reviews r
WHERE r.status = 'published'
ORDER BY r.date_published DESC
LIMIT 20;

-- ============================================================================
-- TRIGGERS pour les avis
-- ============================================================================

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER IF NOT EXISTS trg_reviews_updated
AFTER UPDATE ON reviews
BEGIN
    UPDATE reviews
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;

-- Trigger pour incrémenter le compteur de signalements
CREATE TRIGGER IF NOT EXISTS trg_increment_review_report_count
AFTER INSERT ON review_reports
BEGIN
    UPDATE reviews
    SET reported = 1,
        report_count = report_count + 1,
        updated_at = datetime('now')
    WHERE id = NEW.review_id;
END;

-- Trigger pour créer une activité lors d'un nouvel avis
CREATE TRIGGER IF NOT EXISTS trg_activity_on_new_review
AFTER INSERT ON reviews
BEGIN
    INSERT INTO activities (user_name, action_type, action, target, created_at)
    VALUES (NEW.author, 'review', 'a posté un avis', NEW.school || ' - Note: ' || NEW.rating || '/5', datetime('now'));
END;

-- Trigger pour créer une activité lors d'un like
CREATE TRIGGER IF NOT EXISTS trg_activity_on_review_like
AFTER INSERT ON review_likes
BEGIN
    INSERT INTO activities (user_id, user_name, action_type, action, target, created_at)
    VALUES (
        NEW.user_id, 
        (SELECT name FROM portal_users WHERE id = NEW.user_id),
        'like', 
        'a aimé un avis', 
        (SELECT author || ' - ' || SUBSTR(content, 1, 50) FROM reviews WHERE id = NEW.review_id),
        datetime('now')
    );
END;

-- ============================================================================
-- VUES pour les utilisateurs du portail
-- ============================================================================

-- Vue des utilisateurs actifs en ligne
CREATE VIEW IF NOT EXISTS v_online_portal_users AS
SELECT 
    id,
    name,
    email,
    role,
    last_active,
    comments_count,
    likes_received,
    julianday('now') - julianday(last_active) AS minutes_since_active
FROM portal_users
WHERE status = 'online' 
  AND julianday('now') - julianday(last_active) < 0.0104  -- moins de 15 minutes
ORDER BY last_active DESC;

-- Vue des utilisateurs les plus actifs
CREATE VIEW IF NOT EXISTS v_top_active_portal_users AS
SELECT 
    id,
    name,
    role,
    comments_count,
    likes_received,
    comments_count + likes_received AS total_engagement,
    julianday('now') - julianday(joined_at) AS days_member
FROM portal_users
WHERE blocked = 0
ORDER BY total_engagement DESC
LIMIT 20;

-- Vue des statistiques des utilisateurs par rôle
CREATE VIEW IF NOT EXISTS v_portal_users_stats_by_role AS
SELECT 
    role,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) AS online,
    SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) AS blocked,
    AVG(comments_count) AS avg_comments,
    AVG(likes_received) AS avg_likes
FROM portal_users
GROUP BY role;

-- ============================================================================
-- TRIGGERS pour les utilisateurs du portail
-- ============================================================================

-- Trigger pour mettre à jour la date de dernière activité
CREATE TRIGGER IF NOT EXISTS trg_update_portal_user_activity
AFTER UPDATE OF last_active ON portal_users
BEGIN
    UPDATE portal_users
    SET status = CASE 
        WHEN julianday('now') - julianday(NEW.last_active) < 0.0104 THEN 'online'
        WHEN julianday('now') - julianday(NEW.last_active) < 0.0417 THEN 'away'
        ELSE 'offline'
    END,
    updated_at = datetime('now')
    WHERE id = NEW.id;
END;

-- Trigger pour créer une activité lors de l'inscription
CREATE TRIGGER IF NOT EXISTS trg_activity_on_user_register
AFTER INSERT ON portal_users
BEGIN
    INSERT INTO activities (user_id, user_name, action_type, action, target, created_at)
    VALUES (NEW.id, NEW.name, 'register', 's\'est inscrit', 'Nouveau membre', datetime('now'));
END;

-- ============================================================================
-- VUES pour les activités
-- ============================================================================

-- Vue des activités récentes avec détails utilisateur
CREATE VIEW IF NOT EXISTS v_recent_activities AS
SELECT 
    a.id,
    a.user_name,
    a.action_type,
    a.action,
    a.target,
    a.created_at,
    pu.role AS user_role,
    pu.status AS user_status,
    CASE 
        WHEN a.action_type = 'comment' THEN '💬'
        WHEN a.action_type = 'like' THEN '❤️'
        WHEN a.action_type = 'report' THEN '⚠️'
        WHEN a.action_type = 'login' THEN '🔑'
        WHEN a.action_type = 'register' THEN '📝'
        WHEN a.action_type = 'subscription' THEN '💳'
        ELSE '📌'
    END AS emoji
FROM activities a
LEFT JOIN portal_users pu ON a.user_id = pu.id
ORDER BY a.created_at DESC
LIMIT 50;

-- Vue des statistiques d'activité par type
CREATE VIEW IF NOT EXISTS v_activity_stats_by_type AS
SELECT 
    action_type,
    COUNT(*) AS total,
    DATE(created_at) AS activity_date,
    COUNT(DISTINCT user_id) AS unique_users
FROM activities
WHERE created_at >= date('now', '-30 days')
GROUP BY action_type, DATE(created_at)
ORDER BY activity_date DESC, action_type;

-- ============================================================================
-- TRIGGERS pour les activités
-- ============================================================================

-- Trigger pour nettoyer les vieilles activités (garder 90 jours)
CREATE TRIGGER IF NOT EXISTS trg_cleanup_old_activities
AFTER INSERT ON activities
BEGIN
    DELETE FROM activities
    WHERE created_at < datetime('now', '-90 days');
END;

-- ============================================================================
-- VUES pour les membres de l'équipe
-- ============================================================================

-- Vue des membres visibles de l'équipe (pour le site public)
CREATE VIEW IF NOT EXISTS v_public_team_members AS
SELECT 
    id,
    name,
    role,
    bio,
    avatar_url,
    social_twitter,
    social_facebook,
    social_linkedin,
    display_order
FROM team_members
WHERE visible = 1
ORDER BY display_order ASC;

-- Vue des membres par rôle
CREATE VIEW IF NOT EXISTS v_team_members_by_role AS
SELECT 
    role,
    COUNT(*) AS count,
    GROUP_CONCAT(name, ', ') AS members
FROM team_members
WHERE visible = 1
GROUP BY role
ORDER BY count DESC;

-- ============================================================================
-- TRIGGERS pour les membres de l'équipe
-- ============================================================================

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER IF NOT EXISTS trg_team_members_updated
AFTER UPDATE ON team_members
BEGIN
    UPDATE team_members
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;

-- ============================================================================
-- VUES pour le dashboard
-- ============================================================================

-- Vue des indicateurs clés du dashboard
CREATE VIEW IF NOT EXISTS v_dashboard_kpi AS
SELECT 
    (SELECT COUNT(*) FROM clients WHERE status = 'active') AS total_active_clients,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'paid') AS active_subscriptions,
    (SELECT IFNULL(SUM(amount_fcfa), 0) FROM subscriptions WHERE status = 'paid') AS mrr,
    (SELECT COUNT(*) FROM activation_keys WHERE status = 'active' AND julianday('now') <= julianday(expires_at)) AS active_licenses,
    (SELECT COUNT(*) FROM client_requests WHERE status IN ('new', 'in-progress', 'urgent')) AS open_requests,
    (SELECT COUNT(*) FROM client_requests WHERE priority = 'urgent' AND status != 'completed') AS urgent_requests,
    (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE status = 'published') AS avg_rating,
    (SELECT COUNT(*) FROM reviews WHERE reported = 1 AND status = 'published') AS pending_reports,
    (SELECT COUNT(*) FROM portal_users WHERE status = 'online') AS online_users,
    (SELECT COUNT(*) FROM admin_users WHERE status = 'active') AS active_admins,
    (SELECT COUNT(*) FROM exam_subjects WHERE status = 'pending') AS pending_exams,
    datetime('now') AS generated_at;

-- Vue des tendances mensuelles
CREATE VIEW IF NOT EXISTS v_monthly_trends AS
SELECT 
    ms.month,
    ms.revenue,
    ms.users_count,
    ms.subscriptions_count,
    LAG(ms.revenue, 1, 0) OVER (ORDER BY ms.month) AS prev_revenue,
    LAG(ms.users_count, 1, 0) OVER (ORDER BY ms.month) AS prev_users,
    ROUND((ms.revenue - LAG(ms.revenue, 1, 0) OVER (ORDER BY ms.month)) * 100.0 / NULLIF(LAG(ms.revenue, 1, 0) OVER (ORDER BY ms.month), 0), 2) AS revenue_growth_pct,
    ROUND((ms.users_count - LAG(ms.users_count, 1, 0) OVER (ORDER BY ms.month)) * 100.0 / NULLIF(LAG(ms.users_count, 1, 0) OVER (ORDER BY ms.month), 0), 2) AS users_growth_pct
FROM monthly_stats ms
ORDER BY ms.month DESC
LIMIT 12;

-- Vue des clients à risque avec alertes
CREATE VIEW IF NOT EXISTS v_risk_alerts AS
SELECT 
    rc.id,
    c.name AS client_name,
    c.school,
    rc.risk_type,
    rc.alert_message,
    rc.detected_at,
    CASE 
        WHEN rc.risk_type = 'payment_overdue' THEN '🔴'
        WHEN rc.risk_type = 'inactive' THEN '🟡'
        WHEN rc.risk_type = 'suspended' THEN '🔴'
        WHEN rc.risk_type = 'pending_activation' THEN '🟠'
    END AS severity_icon
FROM risk_clients rc
JOIN clients c ON rc.client_id = c.id
WHERE rc.resolved = 0
ORDER BY rc.detected_at DESC;

-- ============================================================================
-- TRIGGERS pour les statistiques
-- ============================================================================

-- Trigger pour mettre à jour les statistiques mensuelles
CREATE TRIGGER IF NOT EXISTS trg_update_monthly_stats
AFTER INSERT ON subscriptions
WHEN NEW.status = 'paid'
BEGIN
    INSERT OR REPLACE INTO monthly_stats (month, revenue, users_count, subscriptions_count, created_at, updated_at)
    VALUES (
        strftime('%Y-%m', 'now'),
        COALESCE((SELECT SUM(amount_fcfa) FROM subscriptions WHERE status = 'paid' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')), 0),
        COALESCE((SELECT COUNT(DISTINCT client_id) FROM subscriptions WHERE status = 'paid'), 0),
        COALESCE((SELECT COUNT(*) FROM subscriptions WHERE status = 'paid' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')), 0),
        datetime('now'),
        datetime('now')
    );
END;

-- Trigger pour détecter les clients inactifs
CREATE TRIGGER IF NOT EXISTS trg_detect_inactive_clients
AFTER UPDATE OF last_active ON clients
WHEN julianday('now') - julianday(NEW.last_active) > 30
  AND NOT EXISTS (SELECT 1 FROM risk_clients WHERE client_id = NEW.id AND risk_type = 'inactive' AND resolved = 0)
BEGIN
    INSERT INTO risk_clients (client_id, risk_type, alert_message, detected_at)
    VALUES (NEW.id, 'inactive', 'Client inactif depuis plus de 30 jours', datetime('now'));
END;

-- ============================================================================
-- VUES pour les finances
-- ============================================================================

-- Vue du bilan financier
CREATE VIEW IF NOT EXISTS v_financial_balance AS
SELECT 
    (SELECT IFNULL(SUM(amount), 0) FROM finance_transactions WHERE type = 'in' AND status = 'completed') AS total_income,
    (SELECT IFNULL(SUM(amount), 0) FROM finance_transactions WHERE type = 'out' AND status = 'completed') AS total_expenses,
    (SELECT IFNULL(SUM(amount), 0) FROM finance_transactions WHERE type = 'in' AND status = 'completed') -
    (SELECT IFNULL(SUM(amount), 0) FROM finance_transactions WHERE type = 'out' AND status = 'completed') AS net_balance,
    (SELECT IFNULL(SUM(amount), 0) FROM finance_transactions WHERE type = 'in' AND status = 'pending') AS pending_income,
    db.balance AS current_balance,
    db.mobile_balance AS current_mobile_balance
FROM daily_balances db
WHERE db.date = DATE('now');

-- Vue des flux financiers par mois
CREATE VIEW IF NOT EXISTS v_financial_flows_by_month AS
SELECT 
    mf.month,
    mf.income,
    mf.expenses,
    mf.income - mf.expenses AS net_flow,
    LAG(mf.income, 1, 0) OVER (ORDER BY mf.month) AS prev_income,
    ROUND((mf.income - LAG(mf.income, 1, 0) OVER (ORDER BY mf.month)) * 100.0 / NULLIF(LAG(mf.income, 1, 0) OVER (ORDER BY mf.month), 0), 2) AS income_growth
FROM monthly_flows mf
ORDER BY mf.month DESC
LIMIT 12;

-- Vue des transactions récentes
CREATE VIEW IF NOT EXISTS v_recent_transactions AS
SELECT 
    ft.transaction_id,
    ft.type,
    ft.status,
    ft.label,
    ft.sublabel,
    ft.amount,
    ft.currency,
    ft.date,
    ft.source,
    ft.category,
    c.name AS client_name
FROM finance_transactions ft
LEFT JOIN clients c ON ft.client_id = c.id
ORDER BY ft.date DESC
LIMIT 50;

-- ============================================================================
-- TRIGGERS pour les finances
-- ============================================================================

-- Trigger pour mettre à jour les soldes journaliers
CREATE TRIGGER IF NOT EXISTS trg_update_daily_balance
AFTER INSERT ON finance_transactions
WHEN NEW.status = 'completed'
BEGIN
    INSERT OR REPLACE INTO daily_balances (date, balance, mobile_balance, created_at)
    VALUES (
        DATE('now'),
        COALESCE((SELECT SUM(amount) FROM finance_transactions WHERE type = 'in' AND status = 'completed'), 0) -
        COALESCE((SELECT SUM(amount) FROM finance_transactions WHERE type = 'out' AND status = 'completed'), 0),
        COALESCE((SELECT SUM(amount) FROM finance_transactions WHERE source = 'mobile_money' AND type = 'in' AND status = 'completed'), 0) -
        COALESCE((SELECT SUM(amount) FROM finance_transactions WHERE source = 'mobile_money' AND type = 'out' AND status = 'completed'), 0),
        datetime('now')
    );
END;

-- Trigger pour mettre à jour les flux mensuels
CREATE TRIGGER IF NOT EXISTS trg_update_monthly_flows
AFTER INSERT ON finance_transactions
WHEN NEW.status = 'completed'
BEGIN
    INSERT OR REPLACE INTO monthly_flows (month, income, expenses, created_at, updated_at)
    VALUES (
        strftime('%Y-%m', NEW.date),
        COALESCE((SELECT SUM(amount) FROM finance_transactions WHERE type = 'in' AND status = 'completed' AND strftime('%Y-%m', date) = strftime('%Y-%m', NEW.date)), 0),
        COALESCE((SELECT SUM(amount) FROM finance_transactions WHERE type = 'out' AND status = 'completed' AND strftime('%Y-%m', date) = strftime('%Y-%m', NEW.date)), 0),
        datetime('now'),
        datetime('now')
    );
END;

-- ============================================================================
-- VUE globale des statistiques de la plateforme (version complète)
-- ============================================================================

CREATE VIEW IF NOT EXISTS v_platform_complete_stats AS
SELECT 
    (SELECT COUNT(*) FROM clients) AS total_clients,
    (SELECT COUNT(*) FROM clients WHERE status = 'active') AS active_clients,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'paid') AS active_subscriptions,
    (SELECT IFNULL(SUM(amount_fcfa), 0) FROM subscriptions WHERE status = 'paid') AS mrr,
    (SELECT COUNT(*) FROM activation_keys WHERE status = 'active') AS active_licenses,
    (SELECT COUNT(*) FROM reviews WHERE status = 'published') AS total_reviews,
    (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE status = 'published') AS avg_rating,
    (SELECT COUNT(*) FROM portal_users WHERE blocked = 0) AS total_portal_users,
    (SELECT COUNT(*) FROM portal_users WHERE status = 'online') AS online_portal_users,
    (SELECT COUNT(*) FROM admin_users WHERE status = 'active') AS active_admins,
    (SELECT COUNT(*) FROM exam_subjects WHERE status = 'published') AS published_exams,
    (SELECT COUNT(*) FROM templates WHERE is_active = 1) AS active_templates,
    (SELECT COUNT(*) FROM algorithms WHERE status = 'stable') AS stable_algorithms,
    (SELECT COUNT(*) FROM client_requests WHERE status IN ('new', 'in-progress', 'urgent')) AS open_requests,
    (SELECT COUNT(*) FROM client_requests WHERE priority = 'urgent' AND status != 'completed') AS urgent_requests,
    (SELECT COUNT(*) FROM review_reports WHERE status = 'pending') AS pending_reports,
    (SELECT COUNT(*) FROM exam_subject_reports WHERE status = 'pending') AS pending_exam_reports,
    datetime('now') AS generated_at;