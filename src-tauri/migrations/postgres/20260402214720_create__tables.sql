-- ============================================================================
-- STARDUST - Base de données PostgreSQL COMPLÈTE (CORRIGÉE)
-- ============================================================================
-- Version: 2.0.0
-- Description: Gestion des licences, activation_keys, abonnements, offres, paiements
-- ============================================================================

-- ============================================================================
-- 1. TABLE DES CLIENTS / ÉTABLISSEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    company TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT,
    notes TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_name ON clients(name);

-- ============================================================================
-- 2. TABLE DES CLÉS D'ACTIVATION (Stardust)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activation_keys (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    id_etablissement TEXT,  -- ⬅️ AJOUTÉ
    key_text TEXT NOT NULL UNIQUE,
    school_name TEXT NOT NULL,
    plan TEXT NOT NULL CHECK(plan IN ('Basic', 'Premium', 'Enterprise')),
    status TEXT NOT NULL CHECK(status IN ('active', 'expired', 'suspended', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    uses INTEGER NOT NULL DEFAULT 0,
    max_uses INTEGER NOT NULL DEFAULT 150,
    hw_lock INTEGER NOT NULL DEFAULT 0 CHECK(hw_lock IN (0, 1)),
    two_fa INTEGER NOT NULL DEFAULT 0 CHECK(two_fa IN (0, 1)),
    ip_restrict INTEGER NOT NULL DEFAULT 0 CHECK(ip_restrict IN (0, 1)),
    auto_revoke INTEGER NOT NULL DEFAULT 0 CHECK(auto_revoke IN (0, 1)),
    fingerprint TEXT,
    last_used TIMESTAMPTZ,
    city TEXT,
    sec_score INTEGER NOT NULL DEFAULT 0 CHECK(sec_score BETWEEN 0 AND 100),
    revocations INTEGER NOT NULL DEFAULT 0,
    key_hash TEXT NOT NULL,
    activation_method TEXT NOT NULL CHECK(activation_method IN ('online', 'usb', 'file')),
    note TEXT,
    created_by TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_activation_keys_status ON activation_keys(status);
CREATE INDEX idx_activation_keys_plan ON activation_keys(plan);
CREATE INDEX idx_activation_keys_school ON activation_keys(school_name);
CREATE INDEX idx_activation_keys_expires ON activation_keys(expires_at);
CREATE INDEX idx_activation_keys_fingerprint ON activation_keys(fingerprint);
CREATE INDEX idx_activation_keys_client ON activation_keys(client_id);
CREATE INDEX idx_activation_keys_key_hash ON activation_keys(key_hash);
CREATE INDEX idx_activation_keys_etablissement ON activation_keys(id_etablissement);

-- ============================================================================
-- 3. TABLE DES ÉVÉNEMENTS DES CLÉS D'ACTIVATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS activation_key_events (
    id SERIAL PRIMARY KEY,
    activation_key_id INTEGER NOT NULL REFERENCES activation_keys(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK(event_type IN ('activation', 'suspension', 'reactivation', 'revocation', 'expiration', 'login')),
    event_message TEXT NOT NULL,
    dot_color TEXT NOT NULL,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_key_events_key_id ON activation_key_events(activation_key_id);
CREATE INDEX idx_key_events_time ON activation_key_events(event_time);

-- ============================================================================
-- 4. TABLE DES LICENCES (Licences activées par les écoles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS licences (
    licence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    licence_key TEXT UNIQUE NOT NULL,
    id_etablissement UUID NOT NULL,
    
    -- Type et statut
    type_licence TEXT NOT NULL CHECK (type_licence IN ('ENTREPRISE', 'EDUCATION', 'TRIAL')),
    statut TEXT NOT NULL CHECK (statut IN ('ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED', 'GRACE_PERIOD')),
    
    -- Dates
    date_expiration TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Activations
    activations_max INTEGER NOT NULL DEFAULT 5,
    activations_utilisees INTEGER NOT NULL DEFAULT 0,
    
    -- Durée (pour abonnement)
    duree TEXT DEFAULT 'MENSUEL' CHECK (duree IN ('MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL', 'A_VIE')),
    
    -- Notifications
    notification_envoyee_j30 BOOLEAN DEFAULT FALSE,
    notification_envoyee_j15 BOOLEAN DEFAULT FALSE,
    notification_envoyee_j7 BOOLEAN DEFAULT FALSE,
    notification_envoyee_j3 BOOLEAN DEFAULT FALSE,
    notification_envoyee_j1 BOOLEAN DEFAULT FALSE,
    
    -- Synchronisation
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ,
    
    -- Contraintes
    CHECK (activations_utilisees <= activations_max)
);

CREATE INDEX idx_licences_key ON licences(licence_key);
CREATE INDEX idx_licences_etablissement ON licences(id_etablissement);
CREATE INDEX idx_licences_statut ON licences(statut);
CREATE INDEX idx_licences_expiration ON licences(date_expiration);
CREATE INDEX idx_licences_statut_expiration ON licences(statut, date_expiration);

-- ============================================================================
-- 5. TABLE DES ACTIVATIONS APPAREILS
-- ============================================================================

CREATE TABLE IF NOT EXISTS activations_appareils (
    activation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    licence_id UUID NOT NULL REFERENCES licences(licence_id) ON DELETE CASCADE,
    id_etablissement UUID NOT NULL,
    
    nom_appareil TEXT NOT NULL,
    identifiant_unique TEXT NOT NULL,
    adresse_mac TEXT,
    
    statut TEXT NOT NULL CHECK (statut IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    date_activation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    date_derniere_verification TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    metadata JSONB,
    
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ,
    
    CONSTRAINT unique_appareil_licence UNIQUE (licence_id, identifiant_unique)
);

CREATE INDEX idx_activations_licence ON activations_appareils(licence_id);
CREATE INDEX idx_activations_identifiant ON activations_appareils(identifiant_unique);
CREATE INDEX idx_activations_statut ON activations_appareils(statut);

-- ============================================================================
-- 6. TABLE DES CHALLENGES (anti-rejeu)
-- ============================================================================

CREATE TABLE IF NOT EXISTS used_challenges (
    challenge TEXT PRIMARY KEY,
    licence_id UUID NOT NULL REFERENCES licences(licence_id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    used_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_used_challenges_licence ON used_challenges(licence_id);
CREATE INDEX idx_used_challenges_device ON used_challenges(device_id);

-- ============================================================================
-- 7. TABLE DES OFFRES
-- ============================================================================

CREATE TABLE IF NOT EXISTS offres (
    offre_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informations de base
    code TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    description TEXT,
    statut TEXT NOT NULL CHECK (statut IN ('ACTIF', 'INACTIF')) DEFAULT 'ACTIF',
    
    -- Configuration
    duree TEXT NOT NULL CHECK (duree IN ('MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL', 'A_VIE')),
    prix INTEGER NOT NULL CHECK (prix >= 0),
    devise TEXT DEFAULT 'XOF',
    
    -- Réduction
    prix_original INTEGER,
    reduction_pourcentage INTEGER CHECK (reduction_pourcentage BETWEEN 0 AND 100),
    
    -- Période d'essai
    essai_gratuit BOOLEAN DEFAULT FALSE,
    duree_essai_jours INTEGER CHECK (duree_essai_jours > 0),
    
    -- Fonctionnalités
    fonctionnalites JSONB DEFAULT '{}'::jsonb,
    
    -- Configuration de renouvellement
    renouvellement_automatique BOOLEAN DEFAULT TRUE,
    grace_period_jours INTEGER DEFAULT 7,
    
    -- Métadonnées
    icon TEXT,
    couleur TEXT,
    ordre_affichage INTEGER DEFAULT 0,
    est_populaire BOOLEAN DEFAULT FALSE,
    est_meilleur_rapport BOOLEAN DEFAULT FALSE,
    
    -- Stats
    nombre_abonnes INTEGER DEFAULT 0,
    total_revenu INTEGER DEFAULT 0,
    
    -- Dates système
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offres_statut ON offres(statut);
CREATE INDEX idx_offres_duree ON offres(duree);
CREATE INDEX idx_offres_prix ON offres(prix);
CREATE INDEX idx_offres_code ON offres(code);

-- ============================================================================
-- 8. TABLE DES ABONNEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS abonnements (
    abonnement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_etablissement UUID NOT NULL,
    licence_id UUID NOT NULL REFERENCES licences(licence_id) ON DELETE CASCADE,
    offre_id UUID REFERENCES offres(offre_id),
    
    -- Plan et durée
    plan TEXT NOT NULL CHECK (plan IN ('BASIC', 'PREMIUM', 'ENTERPRISE')),
    duree TEXT NOT NULL CHECK (duree IN ('MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL', 'A_VIE')),
    
    -- Tarifs
    montant_original INTEGER NOT NULL,
    montant_remise INTEGER DEFAULT 0,
    montant_final INTEGER NOT NULL,
    devise TEXT DEFAULT 'XOF',
    
    -- Périodes
    date_debut TIMESTAMPTZ NOT NULL,
    date_debut_periode TIMESTAMPTZ,
    date_fin_periode TIMESTAMPTZ,
    date_prochain_paiement TIMESTAMPTZ,
    date_fin TIMESTAMPTZ,
    date_annulation TIMESTAMPTZ,
    
    -- Statut
    statut TEXT NOT NULL CHECK (statut IN ('ACTIF', 'SUSPENDU', 'EXPIRE', 'ANNULE', 'EN_ATTENTE_PAIEMENT')),
    statut_renouvellement TEXT DEFAULT 'AUTO' CHECK (statut_renouvellement IN ('AUTO', 'MANUEL', 'SUSPENDU')),
    renouvellement_auto BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Métadonnées
    metadata JSONB,
    
    -- Synchronisation
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ,
    
    -- Dates système
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CHECK (montant_final = montant_original - montant_remise),
    CHECK (montant_remise >= 0),
    CHECK (montant_final >= 0)
);

CREATE INDEX idx_abonnements_etablissement ON abonnements(id_etablissement);
CREATE INDEX idx_abonnements_licence ON abonnements(licence_id);
CREATE INDEX idx_abonnements_offre ON abonnements(offre_id);
CREATE INDEX idx_abonnements_statut ON abonnements(statut);
CREATE INDEX idx_abonnements_date_fin ON abonnements(date_fin);
CREATE INDEX idx_abonnements_prochain_paiement ON abonnements(date_prochain_paiement);

-- ============================================================================
-- 9. TABLE DES TRANSACTIONS DE PAIEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions_paiement (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_etablissement UUID NOT NULL,
    abonnement_id UUID REFERENCES abonnements(abonnement_id) ON DELETE SET NULL,
    licence_id UUID REFERENCES licences(licence_id) ON DELETE SET NULL,
    
    -- Informations paiement
    montant INTEGER NOT NULL,
    devise TEXT DEFAULT 'XOF',
    methode TEXT NOT NULL CHECK (methode IN ('MTN_MONEY', 'AIRTELL_MONEY', 'ORANGE_MONEY', 'CARTE', 'MANUEL', 'WAVE')),
    description TEXT,
    
    -- Coordonnées payeur
    numero_telephone TEXT NOT NULL,
    nom_payeur TEXT,
    email_payeur TEXT,
    
    -- Références
    reference_externe TEXT UNIQUE,
    reference_interne TEXT UNIQUE,
    
    -- Statut
    statut TEXT NOT NULL CHECK (statut IN (
        'EN_ATTENTE', 'EN_COURS', 'REUSSI', 'ECHOUE', 'ANNULE', 'REMBOURSE', 'TIMEOUT'
    )),
    code_erreur TEXT,
    message_erreur TEXT,
    message_operateur TEXT,
    
    -- Dates
    date_demande TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMPTZ,
    date_expiration TIMESTAMPTZ,
    
    -- Données API
    requete_api JSONB,
    reponse_api JSONB,
    webhook_data JSONB,
    metadata JSONB,
    notes TEXT,
    
    -- Synchronisation
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ,
    
    -- Dates système
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (date_expiration IS NULL OR date_expiration >= date_demande),
    CHECK (date_validation IS NULL OR date_validation >= date_demande)
);

CREATE INDEX idx_transactions_etablissement ON transactions_paiement(id_etablissement);
CREATE INDEX idx_transactions_abonnement ON transactions_paiement(abonnement_id);
CREATE INDEX idx_transactions_licence ON transactions_paiement(licence_id);
CREATE INDEX idx_transactions_statut ON transactions_paiement(statut);
CREATE INDEX idx_transactions_methode ON transactions_paiement(methode);
CREATE INDEX idx_transactions_reference_externe ON transactions_paiement(reference_externe);
CREATE INDEX idx_transactions_reference_interne ON transactions_paiement(reference_interne);
CREATE INDEX idx_transactions_date_demande ON transactions_paiement(date_demande);

-- ============================================================================
-- 10. TABLE DES SESSIONS DE PAIEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS paiement_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_etablissement UUID NOT NULL,
    transaction_id UUID NOT NULL REFERENCES transactions_paiement(transaction_id) ON DELETE CASCADE,
    
    statut TEXT NOT NULL CHECK (statut IN ('ACTIVE', 'TIMEOUT', 'COMPLETED', 'CANCELLED')),
    token_verification TEXT,
    qr_code TEXT,
    url_paiement TEXT,
    
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMPTZ,
    date_completion TIMESTAMPTZ,
    metadata JSONB
);

CREATE INDEX idx_paiement_sessions_transaction ON paiement_sessions(transaction_id);
CREATE INDEX idx_paiement_sessions_statut ON paiement_sessions(statut);
CREATE INDEX idx_paiement_sessions_expiration ON paiement_sessions(date_expiration);

-- ============================================================================
-- 11. TABLE DES NOTIFICATIONS ENVOYÉES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications_envoyees (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_etablissement UUID NOT NULL,
    licence_id UUID NOT NULL REFERENCES licences(licence_id) ON DELETE CASCADE,
    type_notification TEXT NOT NULL CHECK (type_notification IN ('J30', 'J15', 'J7', 'J3', 'J1', 'EXPIRATION')),
    envoyee_le TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_licence ON notifications_envoyees(licence_id);
CREATE INDEX idx_notifications_type ON notifications_envoyees(type_notification);

-- ============================================================================
-- 12. TABLE DES ÉVÉNEMENTS DE LICENCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS evenements_licence (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_etablissement UUID NOT NULL,
    licence_id UUID REFERENCES licences(licence_id) ON DELETE CASCADE,
    abonnement_id UUID REFERENCES abonnements(abonnement_id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions_paiement(transaction_id) ON DELETE SET NULL,
    
    type_event TEXT NOT NULL CHECK (type_event IN (
        'ACTIVATION', 'ACTIVATION_APPAREIL', 'DESACTIVATION_APPAREIL',
        'EXPIRATION', 'SUSPENSION', 'REACTIVATION', 'REVOCATION',
        'PAIEMENT_REUSSI', 'PAIEMENT_ECHOUE', 'PAIEMENT_REMBOURSE',
        'RENOUVELLEMENT', 'ABONNEMENT_CREE', 'ABONNEMENT_ANNULE',
        'ABONNEMENT_SUSPENDU', 'ABONNEMENT_REPRIS',
        'GRACE_PERIOD_START', 'GRACE_PERIOD_END'
    )),
    message TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evenements_licence ON evenements_licence(licence_id);
CREATE INDEX idx_evenements_abonnement ON evenements_licence(abonnement_id);
CREATE INDEX idx_evenements_type ON evenements_licence(type_event);
CREATE INDEX idx_evenements_created ON evenements_licence(created_at);

-- ============================================================================
-- 13. TABLE CONFIGURATION PAIEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS configuration_paiement (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_etablissement UUID NOT NULL UNIQUE,
    
    -- MTN
    mtn_active BOOLEAN DEFAULT TRUE,
    mtn_api_key TEXT,
    mtn_api_secret TEXT,
    mtn_merchant_code TEXT,
    mtn_environment TEXT DEFAULT 'sandbox',
    mtn_callback_url TEXT,
    mtn_timeout_seconds INTEGER DEFAULT 600,
    
    -- Airtel
    airtel_active BOOLEAN DEFAULT TRUE,
    airtel_api_key TEXT,
    airtel_api_secret TEXT,
    airtel_merchant_code TEXT,
    airtel_environment TEXT DEFAULT 'sandbox',
    airtel_callback_url TEXT,
    airtel_timeout_seconds INTEGER DEFAULT 600,
    
    -- Configuration générale
    devise TEXT DEFAULT 'XOF',
    paiement_auto BOOLEAN DEFAULT TRUE,
    grace_period_days INTEGER DEFAULT 7,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 14. TABLE CACHE LICENCE (pour Surya)
-- ============================================================================

CREATE TABLE IF NOT EXISTS licence_cache (
    id INTEGER PRIMARY KEY DEFAULT 1,
    licence_key TEXT NOT NULL,
    statut TEXT NOT NULL,
    date_expiration TIMESTAMPTZ,
    jours_restants INTEGER,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 15. HISTORIQUE RENOUVELLEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS historique_renouvellements (
    renouvellement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abonnement_id UUID NOT NULL REFERENCES abonnements(abonnement_id) ON DELETE CASCADE,
    offre_id UUID NOT NULL REFERENCES offres(offre_id),
    montant INTEGER NOT NULL,
    date_renouvellement TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    date_expiration_precedente TIMESTAMPTZ,
    date_nouvelle_expiration TIMESTAMPTZ,
    statut TEXT NOT NULL CHECK (statut IN ('SUCCES', 'ECHEC', 'EN_ATTENTE')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historique_renouvellements_abonnement ON historique_renouvellements(abonnement_id);
CREATE INDEX idx_historique_renouvellements_date ON historique_renouvellements(date_renouvellement);

-- ============================================================================
-- 16. JOURNAUX D'AUDIT SÉCURITÉ
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_audit_logs (
    id SERIAL PRIMARY KEY,
    activation_key_id INTEGER REFERENCES activation_keys(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK(action IN ('view', 'copy', 'suspend', 'reactivate', 'revoke', 'generate', 'export')),
    user_id TEXT,
    user_name TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_audit_key_id ON security_audit_logs(activation_key_id);
CREATE INDEX idx_audit_created_at ON security_audit_logs(created_at);
CREATE INDEX idx_audit_action ON security_audit_logs(action);

-- ============================================================================
-- 17. TABLE DES ADMINISTRATEURS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('superadmin', 'admin', 'viewer')),
    status TEXT NOT NULL CHECK(status IN ('active', 'suspended', 'pending')),
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    last_ip TEXT,
    is_immutable INTEGER NOT NULL DEFAULT 0,
    created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_status ON admin_users(status);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ============================================================================
-- 18. TABLE DES PERMISSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('licences', 'abonnements', 'clients', 'securite', 'systeme')),
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role TEXT NOT NULL CHECK(role IN ('superadmin', 'admin', 'viewer')),
    permission_code TEXT NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ,
    UNIQUE(role, permission_code)
);

-- ============================================================================
-- 19. TABLE SESSIONS UTILISATEUR
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    device_type TEXT CHECK(device_type IN ('desktop', 'mobile', 'tablet', 'other')),
    browser TEXT,
    os TEXT,
    ip_address TEXT NOT NULL,
    location TEXT,
    is_current INTEGER NOT NULL DEFAULT 0,
    login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_current ON user_sessions(is_current);

-- ============================================================================
-- 20. TABLE LOGS D'ACTIVITÉ ADMIN
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_admin_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_activity_logs(created_at);

-- ============================================================================
-- 21. TABLE PLATFORM SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    platform_name TEXT NOT NULL DEFAULT 'Stardust',
    contact_email TEXT NOT NULL,
    support_email TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Europe/Paris',
    language TEXT NOT NULL DEFAULT 'fr',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    
    -- Sécurité
    two_factor_auth INTEGER NOT NULL DEFAULT 1,
    session_timeout TEXT NOT NULL DEFAULT '8',
    password_policy TEXT NOT NULL DEFAULT 'strong',
    max_login_attempts INTEGER NOT NULL DEFAULT 5,
    
    -- Notifications
    email_notifications INTEGER NOT NULL DEFAULT 1,
    notify_payment INTEGER NOT NULL DEFAULT 1,
    notify_expiry INTEGER NOT NULL DEFAULT 1,
    
    -- Apparence
    theme TEXT NOT NULL DEFAULT 'dark' CHECK(theme IN ('dark', 'light', 'system')),
    accent_color TEXT NOT NULL DEFAULT '#388bfd',
    compact_mode INTEGER NOT NULL DEFAULT 0,
    
    -- Facturation
    company_name TEXT,
    vat_number TEXT,
    address TEXT,
    billing_email TEXT,
    auto_invoice INTEGER NOT NULL DEFAULT 1,
    
    -- Synchronisation
    auto_sync INTEGER NOT NULL DEFAULT 1,
    sync_network TEXT NOT NULL DEFAULT 'wifi' CHECK(sync_network IN ('always', 'wifi', 'manual')),
    
    -- Sauvegardes
    backup_auto INTEGER NOT NULL DEFAULT 1,
    backup_frequency TEXT NOT NULL DEFAULT 'daily' CHECK(backup_frequency IN ('daily', 'weekly', 'monthly')),
    backup_retention INTEGER NOT NULL DEFAULT 30,
    
    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_licences_update_timestamp
    BEFORE UPDATE ON licences
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_abonnements_update_timestamp
    BEFORE UPDATE ON abonnements
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_transactions_update_timestamp
    BEFORE UPDATE ON transactions_paiement
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_offres_update_timestamp
    BEFORE UPDATE ON offres
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_configuration_paiement_update_timestamp
    BEFORE UPDATE ON configuration_paiement
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_activation_keys_update_timestamp
    BEFORE UPDATE ON activation_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- FONCTION: Mise à jour des statistiques des offres
-- ============================================================================

CREATE OR REPLACE FUNCTION update_offre_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE offres
    SET nombre_abonnes = (
        SELECT COUNT(*) 
        FROM abonnements 
        WHERE offre_id = NEW.offre_id 
        AND statut = 'ACTIF'
    )
    WHERE offre_id = NEW.offre_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_abonnements_update_stats
    AFTER INSERT OR UPDATE ON abonnements
    FOR EACH ROW
    EXECUTE FUNCTION update_offre_stats();

-- ============================================================================
-- FONCTION: Mise à jour du cache de licence
-- ============================================================================

CREATE OR REPLACE FUNCTION update_licence_cache()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO licence_cache (licence_key, statut, date_expiration, jours_restants, updated_at)
    VALUES (
        NEW.licence_key,
        NEW.statut,
        NEW.date_expiration,
        EXTRACT(DAY FROM (NEW.date_expiration - CURRENT_TIMESTAMP))::INTEGER,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
        statut = EXCLUDED.statut,
        date_expiration = EXCLUDED.date_expiration,
        jours_restants = EXCLUDED.jours_restants,
        updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_licences_update_cache
    AFTER UPDATE OF statut, date_expiration ON licences
    FOR EACH ROW
    EXECUTE FUNCTION update_licence_cache();

-- ============================================================================
-- FONCTION: Vérifier les licences expirées (automatisation)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_expired_licences()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_licence RECORD;
    v_grace_period INTEGER;
BEGIN
    FOR v_licence IN 
        SELECT l.*, COALESCE(c.grace_period_days, 7) as grace_period_days
        FROM licences l
        LEFT JOIN configuration_paiement c ON c.id_etablissement = l.id_etablissement
        WHERE l.statut IN ('ACTIVE', 'GRACE_PERIOD')
        AND l.duree != 'A_VIE'
    LOOP
        v_grace_period := COALESCE(v_licence.grace_period_days, 7);
        
        IF v_licence.date_expiration + (v_grace_period || ' days')::INTERVAL < CURRENT_TIMESTAMP THEN
            UPDATE licences 
            SET statut = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
            WHERE licence_id = v_licence.licence_id;
            
            INSERT INTO evenements_licence (
                id_etablissement, licence_id, type_event, message, details
            ) VALUES (
                v_licence.id_etablissement,
                v_licence.licence_id,
                'EXPIRATION',
                'Licence expirée automatiquement',
                jsonb_build_object('date_expiration', v_licence.date_expiration, 'grace_period', v_grace_period)
            );
            
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INSERTION DES OFFRES PAR DÉFAUT
-- ============================================================================

INSERT INTO offres (code, nom, description, duree, prix, devise, fonctionnalites, est_populaire, ordre_affichage) VALUES
('BASIC_MENSUEL', 'Basic', 'Pour les petites structures', 'MENSUEL', 10000, 'XOF', '{"users": 5, "storage": "10GB", "support": "standard"}', FALSE, 1),
('BASIC_TRIMESTRIEL', 'Basic Trimestriel', 'Économisez 10%', 'TRIMESTRIEL', 27000, 'XOF', '{"users": 5, "storage": "10GB", "support": "standard"}', FALSE, 2),
('BASIC_ANNUEL', 'Basic Annuel', 'Économisez 25%', 'ANNUEL', 90000, 'XOF', '{"users": 5, "storage": "10GB", "support": "standard"}', FALSE, 3),
('BASIC_A_VIE', 'Basic À vie', 'Payez une fois, utilisez toujours', 'A_VIE', 250000, 'XOF', '{"users": 5, "storage": "10GB", "support": "standard"}', FALSE, 4),

('PREMIUM_MENSUEL', 'Premium', 'Pour les établissements en croissance', 'MENSUEL', 25000, 'XOF', '{"users": 20, "storage": "50GB", "support": "priority", "parents": true, "api": true}', TRUE, 5),
('PREMIUM_TRIMESTRIEL', 'Premium Trimestriel', 'Économisez 10%', 'TRIMESTRIEL', 67500, 'XOF', '{"users": 20, "storage": "50GB", "support": "priority", "parents": true, "api": true}', FALSE, 6),
('PREMIUM_ANNUEL', 'Premium Annuel', 'Économisez 25%', 'ANNUEL', 225000, 'XOF', '{"users": 20, "storage": "50GB", "support": "priority", "parents": true, "api": true}', FALSE, 7),
('PREMIUM_A_VIE', 'Premium À vie', 'Payez une fois, utilisez toujours', 'A_VIE', 600000, 'XOF', '{"users": 20, "storage": "50GB", "support": "priority", "parents": true, "api": true}', FALSE, 8),

('ENTERPRISE_MENSUEL', 'Enterprise', 'Solution complète pour les grandes écoles', 'MENSUEL', 50000, 'XOF', '{"users": "illimite", "storage": "200GB", "support": "24/7", "multi_etablissement": true, "personnalisation": true}', FALSE, 9),
('ENTERPRISE_TRIMESTRIEL', 'Enterprise Trimestriel', 'Économisez 10%', 'TRIMESTRIEL', 135000, 'XOF', '{"users": "illimite", "storage": "200GB", "support": "24/7", "multi_etablissement": true, "personnalisation": true}', FALSE, 10),
('ENTERPRISE_ANNUEL', 'Enterprise Annuel', 'Économisez 25%', 'ANNUEL', 450000, 'XOF', '{"users": "illimite", "storage": "200GB", "support": "24/7", "multi_etablissement": true, "personnalisation": true}', FALSE, 11),
('ENTERPRISE_A_VIE', 'Enterprise À vie', 'Payez une fois, utilisez toujours', 'A_VIE', 1200000, 'XOF', '{"users": "illimite", "storage": "200GB", "support": "24/7", "multi_etablissement": true, "personnalisation": true}', FALSE, 12);

-- ============================================================================
-- FIN DE LA BASE DE DONNÉES COMPLÈTE
-- ============================================================================