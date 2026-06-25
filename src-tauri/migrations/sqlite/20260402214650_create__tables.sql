-- ============================================================================
-- STARDUST - Base de données SQLite COMPLÈTE (CORRIGÉE)
-- ============================================================================
-- Version: 2.0.0
-- Description: Gestion des licences, activation_keys, abonnements, offres, paiements
-- ============================================================================

-- ============================================================================
-- 1. TABLE DES CLIENTS / ÉTABLISSEMENTS
-- ============================================================================

-- ============================================================================
-- TABLE: Etablissement (pour synchronisation avec Surya)
-- ============================================================================
-- Cette table est utilisée pour synchroniser les établissements depuis Surya
-- et pour les afficher dans l'interface d'administration
-- ============================================================================

CREATE TABLE IF NOT EXISTS Etablissement (
    id_etablissement TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    sigle TEXT,
    numero_agrement TEXT,
    numero_fiscal TEXT,
    registre_commerciale TEXT,
    type_etablissement TEXT NOT NULL CHECK(type_etablissement IN ('PUBLIC', 'PRIVE', 'MIXTE')),
    statut_juridique TEXT NOT NULL CHECK(statut_juridique IN ('SARL', 'SA', 'ASSOCIATION', 'GIE', 'AUTRE')),
    pays TEXT NOT NULL,
    region TEXT NOT NULL,
    ville TEXT NOT NULL,
    commune TEXT,
    quatier TEXT,
    adresse TEXT NOT NULL,
    code_postal TEXT,
    telephone_principal TEXT NOT NULL,
    telephone_secondaire TEXT,
    email TEXT,
    site_web TEXT,
    annee_scolaire_debut TEXT NOT NULL,
    annee_scolaire_fin TEXT NOT NULL,
    statut TEXT NOT NULL CHECK(statut IN ('ACTIF', 'INACTIF', 'EN_ATTENTE')),
    date_creation TEXT NOT NULL,
    date_modification TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TEXT
);

CREATE INDEX idx_etablissement_nom ON Etablissement(nom);
CREATE INDEX idx_etablissement_ville ON Etablissement(ville);
CREATE INDEX idx_etablissement_statut ON Etablissement(statut);
CREATE INDEX idx_etablissement_synced ON Etablissement(synced);

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    company TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT,
    notes TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TEXT
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_name ON clients(name);

-- ============================================================================
-- 2. TABLE DES CLÉS D'ACTIVATION (Licences générées par Stardust)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activation_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    id_etablissement TEXT,  -- ⬅️ AJOUTÉ
    key_text TEXT NOT NULL UNIQUE,
    school_name TEXT NOT NULL,
    plan TEXT NOT NULL CHECK(plan IN ('Basic', 'Premium', 'Enterprise')),
    status TEXT NOT NULL CHECK(status IN ('active', 'expired', 'suspended', 'revoked')),
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    uses INTEGER NOT NULL DEFAULT 0,
    max_uses INTEGER NOT NULL DEFAULT 150,
    hw_lock INTEGER NOT NULL DEFAULT 0 CHECK(hw_lock IN (0, 1)),
    two_fa INTEGER NOT NULL DEFAULT 0 CHECK(two_fa IN (0, 1)),
    ip_restrict INTEGER NOT NULL DEFAULT 0 CHECK(ip_restrict IN (0, 1)),
    auto_revoke INTEGER NOT NULL DEFAULT 0 CHECK(auto_revoke IN (0, 1)),
    fingerprint TEXT,
    last_used TEXT,
    city TEXT,
    sec_score INTEGER NOT NULL DEFAULT 0 CHECK(sec_score BETWEEN 0 AND 100),
    revocations INTEGER NOT NULL DEFAULT 0,
    key_hash TEXT NOT NULL,
    activation_method TEXT NOT NULL CHECK(activation_method IN ('online', 'usb', 'file')),
    note TEXT,
    created_by TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TEXT,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE INDEX idx_activation_keys_status ON activation_keys(status);
CREATE INDEX idx_activation_keys_plan ON activation_keys(plan);
CREATE INDEX idx_activation_keys_school ON activation_keys(school_name);
CREATE INDEX idx_activation_keys_expires ON activation_keys(expires_at);
CREATE INDEX idx_activation_keys_fingerprint ON activation_keys(fingerprint);
CREATE INDEX idx_activation_keys_client ON activation_keys(client_id);
CREATE INDEX idx_activation_keys_etablissement ON activation_keys(id_etablissement);

-- ============================================================================
-- 3. TABLE DES LICENCES (Licences activées par les écoles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS licences (
    licence_id TEXT PRIMARY KEY,
    licence_key TEXT UNIQUE NOT NULL,
    id_etablissement TEXT NOT NULL,
    
    -- Type et statut
    type_licence TEXT NOT NULL CHECK (type_licence IN ('ENTREPRISE', 'EDUCATION', 'TRIAL')),
    statut TEXT NOT NULL CHECK (statut IN ('ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED', 'GRACE_PERIOD')),
    
    -- Dates
    date_expiration DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Activations
    activations_max INTEGER NOT NULL DEFAULT 5,
    activations_utilisees INTEGER NOT NULL DEFAULT 0,
    
    -- Durée (pour abonnement)
    duree TEXT DEFAULT 'MENSUEL' CHECK (duree IN ('MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL', 'A_VIE')),
    
    -- Notifications
    notification_envoyee_j30 INTEGER DEFAULT 0,
    notification_envoyee_j15 INTEGER DEFAULT 0,
    notification_envoyee_j7 INTEGER DEFAULT 0,
    notification_envoyee_j3 INTEGER DEFAULT 0,
    notification_envoyee_j1 INTEGER DEFAULT 0,
    
    -- Synchronisation
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date DATETIME,
    
    -- Contraintes
    CHECK (activations_utilisees <= activations_max)
);

CREATE INDEX idx_licences_key ON licences(licence_key);
CREATE INDEX idx_licences_etablissement ON licences(id_etablissement);
CREATE INDEX idx_licences_statut ON licences(statut);
CREATE INDEX idx_licences_expiration ON licences(date_expiration);

-- ============================================================================
-- 4. TABLE DES ÉVÉNEMENTS DES CLÉS D'ACTIVATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS activation_key_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activation_key_id INTEGER NOT NULL,
    event_type TEXT NOT NULL CHECK(event_type IN ('activation', 'suspension', 'reactivation', 'revocation', 'expiration', 'login')),
    event_message TEXT NOT NULL,
    dot_color TEXT NOT NULL,
    event_time TEXT NOT NULL,
    metadata TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TEXT,
    
    FOREIGN KEY (activation_key_id) REFERENCES activation_keys(id) ON DELETE CASCADE
);

CREATE INDEX idx_key_events_key_id ON activation_key_events(activation_key_id);
CREATE INDEX idx_key_events_time ON activation_key_events(event_time);

-- ============================================================================
-- 5. TABLE DES ACTIVATIONS APPAREILS
-- ============================================================================

CREATE TABLE IF NOT EXISTS activations_appareils (
    activation_id TEXT PRIMARY KEY,
    licence_id TEXT NOT NULL,
    id_etablissement TEXT NOT NULL,
    
    nom_appareil TEXT NOT NULL,
    identifiant_unique TEXT NOT NULL,
    adresse_mac TEXT,
    
    statut TEXT NOT NULL CHECK (statut IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    date_activation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_derniere_verification DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    metadata TEXT,
    
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date DATETIME,
    
    FOREIGN KEY (licence_id) REFERENCES licences(licence_id) ON DELETE CASCADE,
    CONSTRAINT unique_appareil_licence UNIQUE (licence_id, identifiant_unique)
);

CREATE INDEX idx_activations_licence ON activations_appareils(licence_id);
CREATE INDEX idx_activations_identifiant ON activations_appareils(identifiant_unique);

-- ============================================================================
-- 6. TABLE DES CHALLENGES (anti-rejeu)
-- ============================================================================

CREATE TABLE IF NOT EXISTS used_challenges (
    challenge TEXT PRIMARY KEY,
    licence_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date DATETIME,
    
    FOREIGN KEY (licence_id) REFERENCES licences(licence_id) ON DELETE CASCADE
);

CREATE INDEX idx_used_challenges_licence ON used_challenges(licence_id);
CREATE INDEX idx_used_challenges_device ON used_challenges(device_id);

-- ============================================================================
-- 7. TABLE DES OFFRES
-- ============================================================================

CREATE TABLE IF NOT EXISTS offres (
    offre_id TEXT PRIMARY KEY,
    
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
    essai_gratuit INTEGER DEFAULT 0,
    duree_essai_jours INTEGER CHECK (duree_essai_jours > 0),
    
    -- Fonctionnalités
    fonctionnalites TEXT,
    
    -- Configuration de renouvellement
    renouvellement_automatique INTEGER DEFAULT 1,
    grace_period_jours INTEGER DEFAULT 7,
    
    -- Métadonnées
    icon TEXT,
    couleur TEXT,
    ordre_affichage INTEGER DEFAULT 0,
    est_populaire INTEGER DEFAULT 0,
    est_meilleur_rapport INTEGER DEFAULT 0,
    
    -- Stats
    nombre_abonnes INTEGER DEFAULT 0,
    total_revenu INTEGER DEFAULT 0,
    
    -- Dates système
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offres_statut ON offres(statut);
CREATE INDEX idx_offres_duree ON offres(duree);
CREATE INDEX idx_offres_prix ON offres(prix);
CREATE INDEX idx_offres_code ON offres(code);

-- ============================================================================
-- 8. TABLE DES ABONNEMENTS
-- ============================================================================

-- ============================================================================
-- TABLE: abonnements (SQLite)
-- ============================================================================

CREATE TABLE IF NOT EXISTS abonnements (
    abonnement_id TEXT PRIMARY KEY,
    id_etablissement TEXT NOT NULL,
    licence_id TEXT NOT NULL,
    offre_id TEXT,
    
    -- Plan et durée
    plan TEXT NOT NULL CHECK (plan IN ('BASIC', 'PREMIUM', 'ENTERPRISE')),
    duree TEXT NOT NULL CHECK (duree IN ('MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL', 'A_VIE')),
    
    -- Tarifs
    montant_original INTEGER NOT NULL,
    montant_remise INTEGER DEFAULT 0,
    montant_final INTEGER NOT NULL,
    devise TEXT DEFAULT 'XOF',
    
    -- Périodes
    date_debut DATETIME NOT NULL,
    date_debut_periode DATETIME,
    date_fin_periode DATETIME,
    date_prochain_paiement DATETIME,
    date_fin DATETIME,
    date_annulation DATETIME,
    
    -- Statut
    statut TEXT NOT NULL CHECK (statut IN ('ACTIF', 'SUSPENDU', 'EXPIRE', 'ANNULE', 'EN_ATTENTE_PAIEMENT')),
    statut_renouvellement TEXT DEFAULT 'AUTO' CHECK (statut_renouvellement IN ('AUTO', 'MANUEL', 'SUSPENDU')),
    renouvellement_auto INTEGER NOT NULL DEFAULT 1,
    
    -- ✅ Période de grâce (jours après expiration avant désactivation)
    grace_period_jours INTEGER DEFAULT 7,
    
    -- Métadonnées
    metadata TEXT,
    
    -- Synchronisation
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date DATETIME,
    
    -- Dates système
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (licence_id) REFERENCES licences(licence_id) ON DELETE CASCADE,
    FOREIGN KEY (offre_id) REFERENCES offres(offre_id) ON DELETE SET NULL,
    
    CHECK (montant_final = montant_original - montant_remise),
    CHECK (montant_remise >= 0),
    CHECK (montant_final >= 0)
);

-- Index
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
    transaction_id TEXT PRIMARY KEY,
    id_etablissement TEXT NOT NULL,
    abonnement_id TEXT,
    licence_id TEXT,
    
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
    date_demande DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_validation DATETIME,
    date_expiration DATETIME,
    
    -- Données API
    requete_api TEXT,
    reponse_api TEXT,
    webhook_data TEXT,
    metadata TEXT,
    notes TEXT,
    
    -- Synchronisation
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date DATETIME,
    
    -- Dates système
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (abonnement_id) REFERENCES abonnements(abonnement_id) ON DELETE SET NULL,
    FOREIGN KEY (licence_id) REFERENCES licences(licence_id) ON DELETE SET NULL,
    
    CHECK (date_expiration IS NULL OR date_expiration >= date_demande),
    CHECK (date_validation IS NULL OR date_validation >= date_demande)
);

CREATE INDEX idx_transactions_etablissement ON transactions_paiement(id_etablissement);
CREATE INDEX idx_transactions_abonnement ON transactions_paiement(abonnement_id);
CREATE INDEX idx_transactions_licence ON transactions_paiement(licence_id);
CREATE INDEX idx_transactions_statut ON transactions_paiement(statut);
CREATE INDEX idx_transactions_reference ON transactions_paiement(reference_externe);
CREATE INDEX idx_transactions_date_demande ON transactions_paiement(date_demande);

-- ============================================================================
-- 10. TABLE DES SESSIONS DE PAIEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS paiement_sessions (
    session_id TEXT PRIMARY KEY,
    id_etablissement TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    
    statut TEXT NOT NULL CHECK (statut IN ('ACTIVE', 'TIMEOUT', 'COMPLETED', 'CANCELLED')),
    token_verification TEXT,
    qr_code TEXT,
    url_paiement TEXT,
    
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_expiration DATETIME,
    date_completion DATETIME,
    metadata TEXT,
    
    FOREIGN KEY (transaction_id) REFERENCES transactions_paiement(transaction_id) ON DELETE CASCADE
);

CREATE INDEX idx_paiement_sessions_transaction ON paiement_sessions(transaction_id);
CREATE INDEX idx_paiement_sessions_statut ON paiement_sessions(statut);

-- ============================================================================
-- 11. TABLE DES NOTIFICATIONS ENVOYÉES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications_envoyees (
    notification_id TEXT PRIMARY KEY,
    id_etablissement TEXT NOT NULL,
    licence_id TEXT NOT NULL,
    type_notification TEXT NOT NULL CHECK (type_notification IN ('J30', 'J15', 'J7', 'J3', 'J1', 'EXPIRATION')),
    envoyee_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (licence_id) REFERENCES licences(licence_id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_licence ON notifications_envoyees(licence_id);
CREATE INDEX idx_notifications_type ON notifications_envoyees(type_notification);

-- ============================================================================
-- 12. TABLE DES ÉVÉNEMENTS DE LICENCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS evenements_licence (
    event_id TEXT PRIMARY KEY,
    id_etablissement TEXT NOT NULL,
    licence_id TEXT,
    abonnement_id TEXT,
    transaction_id TEXT,
    
    type_event TEXT NOT NULL CHECK (type_event IN (
        'ACTIVATION', 'ACTIVATION_APPAREIL', 'DESACTIVATION_APPAREIL',
        'EXPIRATION', 'SUSPENSION', 'REACTIVATION', 'REVOCATION',
        'PAIEMENT_REUSSI', 'PAIEMENT_ECHOUE', 'PAIEMENT_REMBOURSE',
        'RENOUVELLEMENT', 'ABONNEMENT_CREE', 'ABONNEMENT_ANNULE',
        'ABONNEMENT_SUSPENDU', 'ABONNEMENT_REPRIS',
        'GRACE_PERIOD_START', 'GRACE_PERIOD_END'
    )),
    message TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (licence_id) REFERENCES licences(licence_id) ON DELETE SET NULL,
    FOREIGN KEY (abonnement_id) REFERENCES abonnements(abonnement_id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions_paiement(transaction_id) ON DELETE SET NULL
);

CREATE INDEX idx_evenements_licence ON evenements_licence(licence_id);
CREATE INDEX idx_evenements_type ON evenements_licence(type_event);
CREATE INDEX idx_evenements_created ON evenements_licence(created_at);

-- ============================================================================
-- 13. TABLE CONFIGURATION PAIEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS configuration_paiement (
    config_id TEXT PRIMARY KEY,
    id_etablissement TEXT NOT NULL UNIQUE,
    
    -- MTN
    mtn_active INTEGER DEFAULT 1,
    mtn_api_key TEXT,
    mtn_api_secret TEXT,
    mtn_merchant_code TEXT,
    mtn_environment TEXT DEFAULT 'sandbox',
    mtn_callback_url TEXT,
    mtn_timeout_seconds INTEGER DEFAULT 600,
    
    -- Airtel
    airtel_active INTEGER DEFAULT 1,
    airtel_api_key TEXT,
    airtel_api_secret TEXT,
    airtel_merchant_code TEXT,
    airtel_environment TEXT DEFAULT 'sandbox',
    airtel_callback_url TEXT,
    airtel_timeout_seconds INTEGER DEFAULT 600,
    
    -- Configuration générale
    devise TEXT DEFAULT 'XOF',
    paiement_auto INTEGER DEFAULT 1,
    grace_period_days INTEGER DEFAULT 7,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 14. TABLE CACHE LICENCE (pour Surya)
-- ============================================================================

CREATE TABLE IF NOT EXISTS licence_cache (
    id INTEGER PRIMARY KEY DEFAULT 1,
    licence_key TEXT NOT NULL,
    statut TEXT NOT NULL,
    date_expiration DATETIME,
    jours_restants INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 15. HISTORIQUE RENOUVELLEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS historique_renouvellements (
    renouvellement_id TEXT PRIMARY KEY,
    abonnement_id TEXT NOT NULL,
    offre_id TEXT NOT NULL,
    montant INTEGER NOT NULL,
    date_renouvellement DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_expiration_precedente DATETIME,
    date_nouvelle_expiration DATETIME,
    statut TEXT NOT NULL CHECK (statut IN ('SUCCES', 'ECHEC', 'EN_ATTENTE')),
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (abonnement_id) REFERENCES abonnements(abonnement_id) ON DELETE CASCADE,
    FOREIGN KEY (offre_id) REFERENCES offres(offre_id)
);

CREATE INDEX idx_historique_renouvellements_abonnement ON historique_renouvellements(abonnement_id);
CREATE INDEX idx_historique_renouvellements_date ON historique_renouvellements(date_renouvellement);

-- ============================================================================
-- 16. JOURNAUX D'AUDIT SÉCURITÉ
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activation_key_id INTEGER,
    action TEXT NOT NULL CHECK(action IN ('view', 'copy', 'suspend', 'reactivate', 'revoke', 'generate', 'export')),
    user_id TEXT,
    user_name TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TEXT,
    
    FOREIGN KEY (activation_key_id) REFERENCES activation_keys(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_key_id ON security_audit_logs(activation_key_id);
CREATE INDEX idx_audit_created_at ON security_audit_logs(created_at);
CREATE INDEX idx_audit_action ON security_audit_logs(action);

-- ============================================================================
-- 17. TABLE DES ADMINISTRATEURS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('superadmin', 'admin', 'viewer')),
    status TEXT NOT NULL CHECK(status IN ('active', 'suspended', 'pending')),
    avatar TEXT,
    created_at TEXT NOT NULL,
    last_login TEXT,
    last_ip TEXT,
    is_immutable INTEGER NOT NULL DEFAULT 0,
    created_by INTEGER,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TEXT,
    
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_status ON admin_users(status);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ============================================================================
-- 18. TABLE DES PERMISSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('licences', 'abonnements', 'clients', 'securite', 'systeme')),
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK(role IN ('superadmin', 'admin', 'viewer')),
    permission_code TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TEXT,
    
    FOREIGN KEY (permission_code) REFERENCES permissions(code) ON DELETE CASCADE,
    UNIQUE(role, permission_code)
);

-- ============================================================================
-- 19. TABLE SESSIONS UTILISATEUR
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT CHECK(device_type IN ('desktop', 'mobile', 'tablet', 'other')),
    browser TEXT,
    os TEXT,
    ip_address TEXT NOT NULL,
    location TEXT,
    is_current INTEGER NOT NULL DEFAULT 0,
    login_at TEXT NOT NULL,
    last_activity_at TEXT NOT NULL,
    expires_at TEXT,
    revoked_at TEXT,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TEXT,
    
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_current ON user_sessions(is_current);

-- ============================================================================
-- 20. TABLE LOGS D'ACTIVITÉ ADMIN
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TEXT,
    
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_activity_logs(created_at);

-- ============================================================================
-- 21. TABLE PLATFORM SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    updated_by INTEGER,
    synced INTEGER NOT NULL DEFAULT 0,
    sync_date TEXT,
    
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- ============================================================================
-- INSERTION DES OFFRES PAR DÉFAUT
-- ============================================================================

INSERT OR IGNORE INTO offres (offre_id, code, nom, description, duree, prix, devise, fonctionnalites, est_populaire, ordre_affichage) VALUES
('offre_basic_mensuel', 'BASIC_MENSUEL', 'Basic', 'Pour les petites structures', 'MENSUEL', 10000, 'XOF', '{"users": 5, "storage": "10GB", "support": "standard"}', 0, 1),
('offre_basic_trimestriel', 'BASIC_TRIMESTRIEL', 'Basic Trimestriel', 'Économisez 10%', 'TRIMESTRIEL', 27000, 'XOF', '{"users": 5, "storage": "10GB", "support": "standard"}', 0, 2),
('offre_basic_annuel', 'BASIC_ANNUEL', 'Basic Annuel', 'Économisez 25%', 'ANNUEL', 90000, 'XOF', '{"users": 5, "storage": "10GB", "support": "standard"}', 0, 3),
('offre_basic_a_vie', 'BASIC_A_VIE', 'Basic À vie', 'Payez une fois, utilisez toujours', 'A_VIE', 250000, 'XOF', '{"users": 5, "storage": "10GB", "support": "standard"}', 0, 4),

('offre_premium_mensuel', 'PREMIUM_MENSUEL', 'Premium', 'Pour les établissements en croissance', 'MENSUEL', 25000, 'XOF', '{"users": 20, "storage": "50GB", "support": "priority", "parents": true, "api": true}', 1, 5),
('offre_premium_trimestriel', 'PREMIUM_TRIMESTRIEL', 'Premium Trimestriel', 'Économisez 10%', 'TRIMESTRIEL', 67500, 'XOF', '{"users": 20, "storage": "50GB", "support": "priority", "parents": true, "api": true}', 0, 6),
('offre_premium_annuel', 'PREMIUM_ANNUEL', 'Premium Annuel', 'Économisez 25%', 'ANNUEL', 225000, 'XOF', '{"users": 20, "storage": "50GB", "support": "priority", "parents": true, "api": true}', 0, 7),
('offre_premium_a_vie', 'PREMIUM_A_VIE', 'Premium À vie', 'Payez une fois, utilisez toujours', 'A_VIE', 600000, 'XOF', '{"users": 20, "storage": "50GB", "support": "priority", "parents": true, "api": true}', 0, 8),

('offre_enterprise_mensuel', 'ENTERPRISE_MENSUEL', 'Enterprise', 'Solution complète pour les grandes écoles', 'MENSUEL', 50000, 'XOF', '{"users": "illimite", "storage": "200GB", "support": "24/7", "multi_etablissement": true, "personnalisation": true}', 0, 9),
('offre_enterprise_trimestriel', 'ENTERPRISE_TRIMESTRIEL', 'Enterprise Trimestriel', 'Économisez 10%', 'TRIMESTRIEL', 135000, 'XOF', '{"users": "illimite", "storage": "200GB", "support": "24/7", "multi_etablissement": true, "personnalisation": true}', 0, 10),
('offre_enterprise_annuel', 'ENTERPRISE_ANNUEL', 'Enterprise Annuel', 'Économisez 25%', 'ANNUEL', 450000, 'XOF', '{"users": "illimite", "storage": "200GB", "support": "24/7", "multi_etablissement": true, "personnalisation": true}', 0, 11),
('offre_enterprise_a_vie', 'ENTERPRISE_A_VIE', 'Enterprise À vie', 'Payez une fois, utilisez toujours', 'A_VIE', 1200000, 'XOF', '{"users": "illimite", "storage": "200GB", "support": "24/7", "multi_etablissement": true, "personnalisation": true}', 0, 12);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger pour mise à jour des statistiques des offres
CREATE TRIGGER IF NOT EXISTS trg_abonnements_update_stats
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

CREATE TRIGGER IF NOT EXISTS trg_abonnements_update_stats_delete
AFTER DELETE ON abonnements
BEGIN
    UPDATE offres
    SET nombre_abonnes = (
        SELECT COUNT(*) 
        FROM abonnements 
        WHERE offre_id = OLD.offre_id 
        AND statut = 'ACTIF'
    )
    WHERE offre_id = OLD.offre_id;
END;

-- Trigger pour mise à jour du cache de licence
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
-- FIN DE LA BASE DE DONNÉES SQLITE COMPLÈTE
-- ============================================================================