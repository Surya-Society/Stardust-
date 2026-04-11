-- Add migration script here
-- ============================================================================
-- Migration PostgreSQL pour Nova
-- ============================================================================

-- ============================================================================
-- Table des clés d'activation (licences)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activation_keys (
    id SERIAL PRIMARY KEY,
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
    fingerprint TEXT NOT NULL,
    last_used TEXT,
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

-- Indexes pour les clés d'activation
CREATE INDEX idx_activation_keys_status ON activation_keys(status);
CREATE INDEX idx_activation_keys_plan ON activation_keys(plan);
CREATE INDEX idx_activation_keys_school ON activation_keys(school_name);
CREATE INDEX idx_activation_keys_expires ON activation_keys(expires_at);
CREATE INDEX idx_activation_keys_fingerprint ON activation_keys(fingerprint);

-- ============================================================================
-- Table des événements des clés d'activation
-- ============================================================================

CREATE TABLE IF NOT EXISTS activation_key_events (
    id SERIAL PRIMARY KEY,
    activation_key_id INTEGER NOT NULL REFERENCES activation_keys(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK(event_type IN ('activation', 'suspension', 'reactivation', 'revocation', 'expiration', 'login')),
    event_message TEXT NOT NULL,
    dot_color TEXT NOT NULL,
    event_time TEXT NOT NULL,
    metadata JSONB,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_key_events_key_id ON activation_key_events(activation_key_id);
CREATE INDEX idx_key_events_time ON activation_key_events(event_time);

-- ============================================================================
-- Table des journaux d'audit sécurité
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
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_audit_key_id ON security_audit_logs(activation_key_id);
CREATE INDEX idx_audit_created_at ON security_audit_logs(created_at);
CREATE INDEX idx_audit_action ON security_audit_logs(action);

-- ============================================================================
-- Table des algorithmes
-- ============================================================================

CREATE TABLE IF NOT EXISTS algorithms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('encryption', 'compression', 'image-processing', 'quantum', 'ai')),
    version TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('stable', 'beta', 'deprecated')),
    usage_count INTEGER NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 0 CHECK(rating BETWEEN 0 AND 5),
    documentation_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_algorithms_type ON algorithms(type);
CREATE INDEX idx_algorithms_status ON algorithms(status);
CREATE INDEX idx_algorithms_usage ON algorithms(usage_count);

-- ============================================================================
-- Table des langages supportés par les algorithmes
-- ============================================================================

CREATE TABLE IF NOT EXISTS algorithm_languages (
    id SERIAL PRIMARY KEY,
    algorithm_id INTEGER NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
    language_name TEXT NOT NULL,
    language_version TEXT NOT NULL,
    downloads INTEGER NOT NULL DEFAULT 0,
    icon_name TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(algorithm_id, language_name, language_version)
);

CREATE INDEX idx_alg_lang_algorithm ON algorithm_languages(algorithm_id);
CREATE INDEX idx_alg_lang_downloads ON algorithm_languages(downloads);

-- ============================================================================
-- Table des versions des algorithmes
-- ============================================================================

CREATE TABLE IF NOT EXISTS algorithm_versions (
    id SERIAL PRIMARY KEY,
    algorithm_id INTEGER NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    changelog TEXT,
    release_date TEXT NOT NULL,
    is_current INTEGER NOT NULL DEFAULT 0 CHECK(is_current IN (0, 1)),
    download_url TEXT,
    file_size INTEGER,
    checksum TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(algorithm_id, version)
);

CREATE INDEX idx_alg_versions_algorithm ON algorithm_versions(algorithm_id);
CREATE INDEX idx_alg_versions_current ON algorithm_versions(is_current);

-- ============================================================================
-- Table des templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('badge', 'invoice', 'certificate', 'report')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    format TEXT NOT NULL CHECK(format IN ('pdf', 'png', 'svg', 'html')),
    preview_url TEXT,
    preview_data TEXT,
    downloads INTEGER NOT NULL DEFAULT 0,
    uses INTEGER NOT NULL DEFAULT 0,
    customizable INTEGER NOT NULL DEFAULT 1 CHECK(customizable IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_downloads ON templates(downloads);
CREATE INDEX idx_templates_active ON templates(is_active);

-- ============================================================================
-- Table des tags des templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS template_tags (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(template_id, tag)
);

CREATE INDEX idx_template_tags_template ON template_tags(template_id);
CREATE INDEX idx_template_tags_tag ON template_tags(tag);

-- ============================================================================
-- Table des champs personnalisables des templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS template_custom_fields (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK(field_type IN ('text', 'image', 'qrcode', 'date', 'select')),
    default_value TEXT,
    is_required INTEGER NOT NULL DEFAULT 1 CHECK(is_required IN (0, 1)),
    position_x INTEGER,
    position_y INTEGER,
    width INTEGER,
    height INTEGER,
    options JSONB,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_template_fields_template ON template_custom_fields(template_id);

-- ============================================================================
-- Table des clés API
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    key_text TEXT NOT NULL UNIQUE,
    key_hash TEXT NOT NULL UNIQUE,
    scope TEXT NOT NULL CHECK(scope IN ('read', 'write', 'read,write', 'admin')),
    algorithm_id INTEGER REFERENCES algorithms(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'expired', 'revoked')),
    requests_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    expires_at TEXT,
    last_used_at TEXT,
    created_by TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_algorithm ON api_keys(algorithm_id);
CREATE INDEX idx_api_keys_requests ON api_keys(requests_count);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- ============================================================================
-- Table des logs d'utilisation des clés API
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_key_logs (
    id SERIAL PRIMARY KEY,
    api_key_id INTEGER NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    response_time INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_api_logs_key ON api_key_logs(api_key_id);
CREATE INDEX idx_api_logs_created_at ON api_key_logs(created_at);
CREATE INDEX idx_api_logs_endpoint ON api_key_logs(endpoint);

-- ============================================================================
-- Table des clients
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    school TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    joined_at TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'suspended', 'pending')),
    last_active TEXT,
    notes TEXT,
    avatar_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

-- Indexes pour les clients
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_school ON clients(school);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_joined ON clients(joined_at);
CREATE INDEX idx_clients_last_active ON clients(last_active);

-- ============================================================================
-- Table des statistiques des clients
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_stats (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    total_requests INTEGER NOT NULL DEFAULT 0,
    open_requests INTEGER NOT NULL DEFAULT 0,
    completed_requests INTEGER NOT NULL DEFAULT 0,
    urgent_requests INTEGER NOT NULL DEFAULT 0,
    last_request_at TEXT,
    average_response_time INTEGER,
    satisfaction_score REAL CHECK(satisfaction_score BETWEEN 0 AND 5),
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_client_stats_client ON client_stats(client_id);
CREATE INDEX idx_client_stats_open ON client_stats(open_requests);

-- ============================================================================
-- Table des demandes clients
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_requests (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('template', 'feature', 'bug', 'support', 'complaint', 'custom')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('new', 'in-progress', 'completed', 'rejected', 'urgent')),
    priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT,
    
    -- Champs spécifiques aux templates
    template_type TEXT CHECK(template_type IN ('badge', 'invoice', 'certificate', 'report')),
    specifications TEXT,
    
    -- Métadonnées
    category TEXT,
    attachments JSONB,
    assigned_to TEXT,
    resolution_notes TEXT,
    
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_requests_client ON client_requests(client_id);
CREATE INDEX idx_requests_status ON client_requests(status);
CREATE INDEX idx_requests_priority ON client_requests(priority);
CREATE INDEX idx_requests_type ON client_requests(type);
CREATE INDEX idx_requests_created ON client_requests(created_at);
CREATE INDEX idx_requests_updated ON client_requests(updated_at);
CREATE INDEX idx_requests_status_priority ON client_requests(status, priority);

-- ============================================================================
-- Table des commentaires sur les demandes
-- ============================================================================

CREATE TABLE IF NOT EXISTS request_comments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
    user_id INTEGER,
    user_name TEXT NOT NULL,
    user_role TEXT CHECK(user_role IN ('support', 'client', 'admin')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_internal INTEGER NOT NULL DEFAULT 0 CHECK(is_internal IN (0, 1)),
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_comments_request ON request_comments(request_id);
CREATE INDEX idx_comments_created ON request_comments(created_at);
CREATE INDEX idx_comments_user ON request_comments(user_id);

-- ============================================================================
-- Table des templates personnalisés par client
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_templates (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    custom_name TEXT NOT NULL,
    custom_config JSONB NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_used_at TEXT,
    usage_count INTEGER NOT NULL DEFAULT 0,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(client_id, template_id, custom_name)
);

CREATE INDEX idx_client_templates_client ON client_templates(client_id);
CREATE INDEX idx_client_templates_template ON client_templates(template_id);
CREATE INDEX idx_client_templates_active ON client_templates(is_active);

-- ============================================================================
-- Table des historiques de statut des demandes
-- ============================================================================

CREATE TABLE IF NOT EXISTS request_status_history (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    changed_at TEXT NOT NULL,
    reason TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_status_history_request ON request_status_history(request_id);
CREATE INDEX idx_status_history_changed_at ON request_status_history(changed_at);

-- ============================================================================
-- Table des notifications clients
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_notifications (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('request_update', 'template_ready', 'invoice', 'reminder', 'announcement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0 CHECK(is_read IN (0, 1)),
    created_at TEXT NOT NULL,
    read_at TEXT,
    action_url TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_notifications_client ON client_notifications(client_id);
CREATE INDEX idx_notifications_read ON client_notifications(is_read);
CREATE INDEX idx_notifications_created ON client_notifications(created_at);
CREATE INDEX idx_notifications_type ON client_notifications(type);

-- ============================================================================
-- Insertion des données initiales des algorithmes
-- ============================================================================

INSERT INTO algorithms (name, description, type, version, status, usage_count, rating, documentation_url, created_at, updated_at) VALUES
('NovaQuantum Crypt', 'Algorithme de cryptage quantique post-quantique basé sur les réseaux euclidiens. Résistant aux attaques des ordinateurs quantiques.', 'quantum', '2.1.0', 'stable', 15678, 4.8, '/docs/quantum-crypt', '2025-01-10', '2026-02-15'),
('NovaImageCompress', 'Transforme les images en texte compressé avec ratio 10:1. Stockage optimisé sans serveur, reconstruction parfaite.', 'compression', '2.0.0', 'stable', 23456, 4.9, '/docs/image-compress', '2025-02-05', '2026-02-20'),
('NovaEncrypt', 'Cryptage symétrique/asymétrique haute performance avec gestion des clés et rotation automatique.', 'encryption', '3.1.0', 'stable', 34567, 4.7, '/docs/encrypt', '2024-12-20', '2026-02-10')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Insertion des langages pour les algorithmes
-- ============================================================================

-- NovaQuantum Crypt (id 1)
INSERT INTO algorithm_languages (algorithm_id, language_name, language_version, downloads, icon_name) VALUES
(1, 'Rust', '1.2.0', 1234, 'SiRust'),
(1, 'C++', '2.0.1', 3456, 'SiCplusplus'),
(1, 'C', '1.5.0', 2345, 'SiC'),
(1, 'Java', '1.8.0', 1876, 'FaJava'),
(1, 'Python', '3.9.0', 5678, 'SiPython')
ON CONFLICT DO NOTHING;

-- NovaImageCompress (id 2)
INSERT INTO algorithm_languages (algorithm_id, language_name, language_version, downloads, icon_name) VALUES
(2, 'Rust', '1.0.0', 892, 'SiRust'),
(2, 'C++', '1.2.0', 1456, 'SiCplusplus'),
(2, 'Java', '1.1.0', 2341, 'FaJava'),
(2, 'Python', '2.0.0', 4567, 'SiPython'),
(2, 'JavaScript', '1.5.0', 6789, 'SiJavascript'),
(2, 'TypeScript', '1.5.0', 4321, 'SiTypescript'),
(2, 'Go', '1.0.0', 987, 'SiGo')
ON CONFLICT DO NOTHING;

-- NovaEncrypt (id 3)
INSERT INTO algorithm_languages (algorithm_id, language_name, language_version, downloads, icon_name) VALUES
(3, 'Rust', '2.1.0', 3456, 'SiRust'),
(3, 'C++', '3.0.0', 5678, 'SiCplusplus'),
(3, 'C', '2.0.0', 2345, 'SiC'),
(3, 'Java', '2.5.0', 4321, 'FaJava'),
(3, 'Python', '3.2.0', 7890, 'SiPython'),
(3, 'Go', '1.8.0', 2341, 'SiGo'),
(3, 'PHP', '2.0.0', 1234, 'SiPhp')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insertion des templates initiaux
-- ============================================================================

INSERT INTO templates (name, type, category, description, format, downloads, uses, customizable, created_at, updated_at) VALUES
('Badge scolaire moderne', 'badge', 'Élève', 'Badge épuré avec photo, nom, classe et QR code pour pointage', 'png', 2345, 456, 1, '2026-01-01', '2026-01-01'),
('Badge professeur premium', 'badge', 'Professeur', 'Badge avec photo, titre, département et accès prioritaires', 'svg', 1234, 234, 1, '2026-01-05', '2026-01-05'),
('Facture standard', 'invoice', 'Facturation', 'Template de facture professionnelle avec logo, TVA et conditions', 'pdf', 5678, 1234, 1, '2026-01-10', '2026-01-10'),
('Badge visiteur temporaire', 'badge', 'Visiteur', 'Badge temporaire avec date d''expiration et zone d''accès', 'png', 892, 156, 1, '2026-01-15', '2026-01-15'),
('Facture détaillée', 'invoice', 'Facturation', 'Facture avec tableau détaillé, échéances et conditions de paiement', 'pdf', 3456, 789, 1, '2026-01-20', '2026-01-20'),
('Certificat de scolarité', 'certificate', 'Document', 'Certificat officiel avec sceau et signature numérique', 'pdf', 2341, 567, 1, '2026-01-25', '2026-01-25')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insertion des tags pour les templates
-- ============================================================================

INSERT INTO template_tags (template_id, tag) VALUES
(1, 'élève'), (1, 'qr-code'), (1, 'moderne'),
(2, 'professeur'), (2, 'premium'), (2, 'accès'),
(3, 'facture'), (3, 'professionnel'), (3, 'tva'),
(4, 'visiteur'), (4, 'temporaire'), (4, 'sécurité'),
(5, 'facture'), (5, 'détaillé'), (5, 'échéance'),
(6, 'certificat'), (6, 'officiel'), (6, 'scolarité')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insertion des clés API initiales
-- ============================================================================

INSERT INTO api_keys (name, key_text, key_hash, scope, algorithm_id, status, requests_count, created_at, last_used_at) VALUES
('NovaQuantum Crypt - Production', 'nqc_live_xK9mP2qR4tW8zY3n', 'hash_nqc_001', 'read,write', 1, 'active', 45678, '2026-01-01', NOW() - INTERVAL '5 minutes'),
('NovaImageCompress - API', 'nic_live_aB7nC3dE5fG8hJ2k', 'hash_nic_001', 'write', 2, 'active', 123456, '2026-01-15', NOW() - INTERVAL '2 minutes'),
('NovaEncrypt - Service', 'ne_live_dE4oF5gH6iJ9kL1m', 'hash_ne_001', 'read,write', 3, 'active', 89123, '2026-01-20', NOW() - INTERVAL '15 minutes')
ON CONFLICT (key_text) DO NOTHING;

-- ============================================================================
-- Insertion des clés d'activation initiales
-- ============================================================================

INSERT INTO activation_keys (key_text, school_name, plan, status, created_at, expires_at, uses, max_uses, hw_lock, two_fa, ip_restrict, auto_revoke, fingerprint, last_used, city, sec_score, revocations, key_hash, activation_method) VALUES
('SCO-2025-ABCD-1234', 'Lycée Victor Hugo', 'Enterprise', 'active', '12 Jan 2025', '12 Jan 2026', 48, 150, 1, 1, 0, 0, 'a3f2b1c9', 'Il y a 2h', 'Paris, FR', 92, 0, 'sha256:8f4a', 'online'),
('SCO-2025-EFGH-5678', 'Collège Jean Moulin', 'Enterprise', 'active', '03 Fév 2025', '03 Fév 2026', 120, 200, 1, 1, 1, 0, 'd7e5f3a2', 'Il y a 15min', 'Lyon, FR', 98, 0, 'sha256:2c9e', 'usb'),
('SCO-2024-IJKL-9012', 'École Primaire Pasteur', 'Basic', 'expired', '15 Nov 2023', '15 Nov 2024', 30, 50, 0, 0, 0, 0, 'b1c4d8e0', 'Il y a 45j', 'Bordeaux, FR', 34, 0, 'sha256:5f1b', 'file'),
('SCO-2025-MNOP-3456', 'Lycée Technique Rodin', 'Premium', 'suspended', '22 Mar 2025', '22 Mar 2026', 0, 100, 0, 0, 0, 0, 'f9a2c7b5', 'Jamais', 'Marseille, FR', 15, 1, 'sha256:3d8c', 'online'),
('SCO-2025-QRST-7890', 'IUT de Bordeaux', 'Enterprise', 'active', '01 Avr 2025', '01 Avr 2026', 89, 250, 1, 1, 1, 0, 'e4d3c2b1', 'Il y a 5min', 'Bordeaux, FR', 100, 0, 'sha256:7a2f', 'usb'),
('SCO-2025-UVWX-4321', 'Lycée Carnot', 'Premium', 'active', '10 Fév 2025', '10 Fév 2026', 67, 120, 1, 0, 0, 0, 'c3b2a1d0', 'Il y a 1h', 'Dijon, FR', 61, 0, 'sha256:1a3c', 'online')
ON CONFLICT (key_text) DO NOTHING;

-- ============================================================================
-- Insertion des événements pour les clés d'activation
-- ============================================================================

INSERT INTO activation_key_events (activation_key_id, event_type, event_message, dot_color, event_time) VALUES
(1, 'activation', 'Activation en ligne réussie', '#3fb950', '12 Jan 2025 · 14:23'),
(1, 'activation', 'Renouvellement automatique configuré', '#388bfd', '12 Jan 2025 · 14:25'),
(1, 'login', '48 nouvelles sessions actives', '#388bfd', TO_CHAR(NOW() - INTERVAL '1 day', 'DD Mon YYYY · HH24:MI') || ' · 09:00'),
(2, 'activation', 'Activation USB (Ed25519 validé)', '#3fb950', '03 Fév 2025 · 11:05'),
(2, 'activation', 'Restriction IP activée', '#d29922', '03 Fév 2025 · 11:10'),
(3, 'activation', 'Activation via fichier .licpkg', '#3fb950', '15 Nov 2023 · 09:00'),
(3, 'expiration', 'Licence expirée — accès bloqué', '#f85149', '15 Nov 2024 · 00:00'),
(4, 'suspension', 'Suspension administrative (impayé)', '#f85149', '22 Mar 2025 · 16:00'),
(4, 'login', 'Tentative d''accès bloquée', '#d29922', '24 Mar 2025 · 10:42'),
(5, 'activation', 'Activation USB + Hardware lock', '#3fb950', '01 Avr 2025 · 08:00'),
(5, 'activation', '2FA configuré', '#3fb950', '01 Avr 2025 · 08:05'),
(6, 'activation', 'Activation en ligne réussie', '#3fb950', '10 Fév 2025 · 10:00')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Migration PostgreSQL pour Nova (suite)
-- ============================================================================

-- ============================================================================
-- Table des abonnements
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK(plan IN ('Basic', 'Premium', 'Enterprise')),
    amount_fcfa INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('paid', 'overdue', 'cancelled', 'suspended', 'pending')),
    start_date TEXT NOT NULL,
    next_billing_date TEXT NOT NULL,
    end_date TEXT,
    users_count INTEGER NOT NULL DEFAULT 0,
    features JSONB,
    payment_method TEXT CHECK(payment_method IN ('card', 'bank_transfer', 'mobile_money', 'manual')),
    auto_renew INTEGER NOT NULL DEFAULT 1 CHECK(auto_renew IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date);

-- ============================================================================
-- Table des historiques de paiement
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payment_date TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT UNIQUE,
    status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'pending', 'refunded')),
    receipt_url TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_payment_subscription ON payment_history(subscription_id);
CREATE INDEX idx_payment_date ON payment_history(payment_date);
CREATE INDEX idx_payment_status ON payment_history(status);

-- ============================================================================
-- Table des rappels d'échéance
-- ============================================================================

CREATE TABLE IF NOT EXISTS billing_reminders (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK(reminder_type IN ('7days', '3days', '1day', 'overdue')),
    sent_at TEXT NOT NULL,
    sent_to TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('sent', 'delivered', 'failed')),
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_reminders_subscription ON billing_reminders(subscription_id);
CREATE INDEX idx_reminders_sent_at ON billing_reminders(sent_at);

-- ============================================================================
-- Table des applications
-- ============================================================================

CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('desktop', 'mobile-parents', 'mobile-teachers', 'mobile-exams', 'web', 'other')),
    platform TEXT NOT NULL,
    version TEXT NOT NULL,
    users_count INTEGER NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    downloads INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('published', 'beta', 'development', 'deprecated')),
    updated_at TEXT NOT NULL,
    icon_name TEXT,
    description TEXT,
    size_mb REAL,
    rating REAL CHECK(rating BETWEEN 0 AND 5),
    developer TEXT,
    compatibility JSONB,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_applications_type ON applications(type);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_downloads ON applications(downloads);

-- ============================================================================
-- Table des liens de téléchargement
-- ============================================================================

CREATE TABLE IF NOT EXISTS download_links (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    version TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(application_id, platform)
);

CREATE INDEX idx_download_links_application ON download_links(application_id);

-- ============================================================================
-- Table des statistiques des applications (journalières)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_daily_stats (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    users INTEGER NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    downloads INTEGER NOT NULL DEFAULT 0,
    crashes INTEGER NOT NULL DEFAULT 0,
    avg_response_time REAL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(application_id, date)
);

CREATE INDEX idx_app_stats_application ON app_daily_stats(application_id);
CREATE INDEX idx_app_stats_date ON app_daily_stats(date);

-- ============================================================================
-- Table des sujets d'examen
-- ============================================================================

CREATE TABLE IF NOT EXISTS exam_subjects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    level TEXT NOT NULL,
    subject TEXT NOT NULL,
    author TEXT NOT NULL,
    author_id INTEGER,
    content TEXT,
    file_url TEXT,
    file_size INTEGER,
    file_type TEXT,
    date_published TEXT NOT NULL,
    downloads INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('published', 'pending', 'blocked')),
    reported INTEGER NOT NULL DEFAULT 0 CHECK(reported IN (0, 1)),
    report_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_by TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_exam_subjects_status ON exam_subjects(status);
CREATE INDEX idx_exam_subjects_subject ON exam_subjects(subject);
CREATE INDEX idx_exam_subjects_level ON exam_subjects(level);
CREATE INDEX idx_exam_subjects_downloads ON exam_subjects(downloads);
CREATE INDEX idx_exam_subjects_reported ON exam_subjects(reported);

-- ============================================================================
-- Table des signalements de sujets
-- ============================================================================

CREATE TABLE IF NOT EXISTS exam_subject_reports (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
    reporter_id INTEGER,
    reporter_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    created_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by TEXT,
    action_taken TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_reports_subject ON exam_subject_reports(subject_id);
CREATE INDEX idx_reports_status ON exam_subject_reports(status);

-- ============================================================================
-- Table des utilisateurs de l'application examens
-- ============================================================================

CREATE TABLE IF NOT EXISTS exam_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    user_type TEXT NOT NULL CHECK(user_type IN ('student', 'teacher', 'parent')),
    status TEXT NOT NULL CHECK(status IN ('online', 'offline')),
    blocked INTEGER NOT NULL DEFAULT 0 CHECK(blocked IN (0, 1)),
    reports_count INTEGER NOT NULL DEFAULT 0,
    last_active TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_exam_users_type ON exam_users(user_type);
CREATE INDEX idx_exam_users_status ON exam_users(status);
CREATE INDEX idx_exam_users_blocked ON exam_users(blocked);
CREATE INDEX idx_exam_users_email ON exam_users(email);

-- ============================================================================
-- Table des téléchargements de sujets par utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS exam_subject_downloads (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES exam_users(id) ON DELETE CASCADE,
    downloaded_at TEXT NOT NULL,
    ip_address TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(subject_id, user_id)
);

CREATE INDEX idx_downloads_subject ON exam_subject_downloads(subject_id);
CREATE INDEX idx_downloads_user ON exam_subject_downloads(user_id);

-- ============================================================================
-- Table des administrateurs
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('superadmin', 'admin', 'moderator', 'viewer')),
    status TEXT NOT NULL CHECK(status IN ('active', 'suspended', 'pending')),
    avatar TEXT,
    created_at TEXT NOT NULL,
    last_login TEXT,
    last_ip TEXT,
    is_immutable INTEGER NOT NULL DEFAULT 0 CHECK(is_immutable IN (0, 1)),
    created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_status ON admin_users(status);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ============================================================================
-- Table des permissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('gestion', 'acces', 'securite', 'systeme')),
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

-- ============================================================================
-- Table des rôles et permissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role TEXT NOT NULL CHECK(role IN ('superadmin', 'admin', 'moderator', 'viewer')),
    permission_code TEXT NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(role, permission_code)
);

-- ============================================================================
-- Table des permissions des administrateurs
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_permissions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    permission_code TEXT NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
    granted INTEGER NOT NULL DEFAULT 1 CHECK(granted IN (0, 1)),
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(admin_id, permission_code)
);

CREATE INDEX idx_admin_permissions_admin ON admin_permissions(admin_id);

-- ============================================================================
-- Table des logs d'activité des administrateurs
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
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_admin_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_activity_logs(created_at);
CREATE INDEX idx_admin_logs_action ON admin_activity_logs(action);

-- ============================================================================
-- Insertion des permissions
-- ============================================================================

INSERT INTO permissions (code, label, description, category) VALUES
-- Accès
('keys.read', 'Lire les clés', 'Consulter les clés d''activation', 'acces'),
('keys.write', 'Gérer les clés', 'Créer, modifier, révoquer les clés', 'acces'),
('keys.revoke', 'Révoquer les clés', 'Révoquer toute clé active', 'securite'),
('subs.read', 'Voir les abonnements', 'Consulter les abonnements actifs', 'acces'),
('subs.write', 'Gérer les abonnements', 'Modifier les abonnements', 'acces'),
('api.read', 'Voir les clés API', 'Consulter les clés API', 'acces'),
('api.write', 'Gérer les clés API', 'Créer et révoquer les clés API', 'securite'),
('clients.read', 'Voir les clients', 'Consulter la base clients', 'acces'),
('clients.write', 'Gérer les clients', 'Modifier les données clients', 'gestion'),
('apps.read', 'Voir les applications', 'Consulter les applications', 'acces'),
('apps.write', 'Gérer les applications', 'Modifier les applications', 'gestion'),
('exams.read', 'Voir les sujets', 'Consulter les sujets d''examen', 'acces'),
('exams.write', 'Gérer les sujets', 'Modifier les sujets d''examen', 'gestion'),
('exams.moderate', 'Modérer les sujets', 'Bloquer/débloquer les sujets', 'securite'),
('users.read', 'Voir les utilisateurs', 'Consulter la liste des comptes', 'gestion'),
('users.write', 'Gérer les utilisateurs', 'Créer et modifier des comptes', 'gestion'),
('users.delete', 'Supprimer des comptes', 'Supprimer des comptes utilisateurs', 'gestion'),
('users.block', 'Bloquer des utilisateurs', 'Bloquer/débloquer des utilisateurs', 'securite'),
('admin.manage', 'Gérer les admins', 'Ajouter et modifier des admins', 'securite'),
('logs.read', 'Voir les journaux', 'Accéder aux journaux système', 'systeme'),
('system.config', 'Configuration système', 'Modifier les paramètres globaux', 'systeme'),
('system.backup', 'Sauvegardes', 'Gérer les sauvegardes', 'systeme'),
('system.monitoring', 'Monitoring', 'Accéder aux métriques système', 'systeme')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- Insertion des rôles et permissions
-- ============================================================================

-- Superadmin : toutes les permissions
INSERT INTO role_permissions (role, permission_code)
SELECT 'superadmin', code FROM permissions
ON CONFLICT DO NOTHING;

-- Admin
INSERT INTO role_permissions (role, permission_code) VALUES
('admin', 'keys.read'), ('admin', 'keys.write'), ('admin', 'keys.revoke'),
('admin', 'subs.read'), ('admin', 'subs.write'),
('admin', 'api.read'), ('admin', 'api.write'),
('admin', 'clients.read'), ('admin', 'clients.write'),
('admin', 'apps.read'), ('admin', 'apps.write'),
('admin', 'exams.read'), ('admin', 'exams.write'), ('admin', 'exams.moderate'),
('admin', 'users.read'), ('admin', 'users.write'), ('admin', 'users.block'),
('admin', 'logs.read')
ON CONFLICT DO NOTHING;

-- Modérateur
INSERT INTO role_permissions (role, permission_code) VALUES
('moderator', 'keys.read'),
('moderator', 'subs.read'),
('moderator', 'clients.read'),
('moderator', 'apps.read'),
('moderator', 'exams.read'), ('moderator', 'exams.moderate'),
('moderator', 'users.read'), ('moderator', 'users.block'),
('moderator', 'logs.read')
ON CONFLICT DO NOTHING;

-- Lecteur
INSERT INTO role_permissions (role, permission_code) VALUES
('viewer', 'keys.read'),
('viewer', 'subs.read'),
('viewer', 'clients.read'),
('viewer', 'apps.read'),
('viewer', 'exams.read')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Table des avis / commentaires
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    school TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    content TEXT NOT NULL,
    date_published TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0 CHECK(verified IN (0, 1)),
    response TEXT,
    reported INTEGER NOT NULL DEFAULT 0 CHECK(reported IN (0, 1)),
    report_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published', 'hidden', 'deleted')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_by TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_date ON reviews(date_published);
CREATE INDEX idx_reviews_reported ON reviews(reported);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ============================================================================
-- Table des signalements d'avis
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_reports (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    reporter_id INTEGER,
    reporter_name TEXT NOT NULL,
    reporter_email TEXT,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    created_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by TEXT,
    action_taken TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_review_reports_review ON review_reports(review_id);
CREATE INDEX idx_review_reports_status ON review_reports(status);

-- ============================================================================
-- Table des utilisateurs du portail
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'moderator', 'user')),
    status TEXT NOT NULL DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'away')),
    last_active TEXT,
    joined_at TEXT NOT NULL,
    comments_count INTEGER NOT NULL DEFAULT 0,
    likes_received INTEGER NOT NULL DEFAULT 0,
    avatar_url TEXT,
    blocked INTEGER NOT NULL DEFAULT 0 CHECK(blocked IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_portal_users_role ON portal_users(role);
CREATE INDEX idx_portal_users_status ON portal_users(status);
CREATE INDEX idx_portal_users_email ON portal_users(email);
CREATE INDEX idx_portal_users_blocked ON portal_users(blocked);

-- ============================================================================
-- Table des activités récentes
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES portal_users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK(action_type IN ('comment', 'like', 'report', 'login', 'register', 'review', 'subscription')),
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    metadata JSONB,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at);
CREATE INDEX idx_activities_type ON activities(action_type);

-- ============================================================================
-- Table des likes sur les avis
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_likes (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(review_id, user_id)
);

CREATE INDEX idx_review_likes_review ON review_likes(review_id);
CREATE INDEX idx_review_likes_user ON review_likes(user_id);

-- ============================================================================
-- Table des membres de l'équipe
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    social_twitter TEXT,
    social_facebook TEXT,
    social_linkedin TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1 CHECK(visible IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_team_members_order ON team_members(display_order);
CREATE INDEX idx_team_members_visible ON team_members(visible);

-- ============================================================================
-- Table des statistiques mensuelles pour le dashboard
-- ============================================================================

CREATE TABLE IF NOT EXISTS monthly_stats (
    id SERIAL PRIMARY KEY,
    month TEXT NOT NULL UNIQUE,
    revenue INTEGER NOT NULL DEFAULT 0,
    users_count INTEGER NOT NULL DEFAULT 0,
    subscriptions_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_monthly_stats_month ON monthly_stats(month);

-- ============================================================================
-- Table des répartition des plans
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_distribution (
    id SERIAL PRIMARY KEY,
    plan_name TEXT NOT NULL CHECK(plan_name IN ('Basic', 'Premium', 'Enterprise')),
    percentage INTEGER NOT NULL CHECK(percentage BETWEEN 0 AND 100),
    color TEXT NOT NULL,
    month TEXT NOT NULL,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(plan_name, month)
);

CREATE INDEX idx_plan_distribution_month ON plan_distribution(month);

-- ============================================================================
-- Table des clients à risque
-- ============================================================================

CREATE TABLE IF NOT EXISTS risk_clients (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    risk_type TEXT NOT NULL CHECK(risk_type IN ('payment_overdue', 'inactive', 'suspended', 'pending_activation')),
    alert_message TEXT NOT NULL,
    detected_at TEXT NOT NULL,
    resolved INTEGER NOT NULL DEFAULT 0 CHECK(resolved IN (0, 1)),
    resolved_at TEXT,
    resolved_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_risk_clients_client ON risk_clients(client_id);
CREATE INDEX idx_risk_clients_resolved ON risk_clients(resolved);
CREATE INDEX idx_risk_clients_type ON risk_clients(risk_type);

-- ============================================================================
-- Table des transactions financières
-- ============================================================================

CREATE TABLE IF NOT EXISTS finance_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('in', 'out')),
    status TEXT NOT NULL CHECK(status IN ('completed', 'pending', 'failed')),
    label TEXT NOT NULL,
    sublabel TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'XAF',
    date TEXT NOT NULL,
    source TEXT NOT NULL CHECK(source IN ('mobile_money', 'bank', 'internal')),
    category TEXT NOT NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_finance_transactions_type ON finance_transactions(type);
CREATE INDEX idx_finance_transactions_status ON finance_transactions(status);
CREATE INDEX idx_finance_transactions_date ON finance_transactions(date);
CREATE INDEX idx_finance_transactions_source ON finance_transactions(source);
CREATE INDEX idx_finance_transactions_category ON finance_transactions(category);

-- ============================================================================
-- Table des soldes journaliers
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_balances (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    balance INTEGER NOT NULL,
    mobile_balance INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_daily_balances_date ON daily_balances(date);

-- ============================================================================
-- Table des flux mensuels
-- ============================================================================

CREATE TABLE IF NOT EXISTS monthly_flows (
    id SERIAL PRIMARY KEY,
    month TEXT NOT NULL UNIQUE,
    income INTEGER NOT NULL DEFAULT 0,
    expenses INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_monthly_flows_month ON monthly_flows(month);

-- ============================================================================
-- Table des paramètres généraux de la plateforme
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    platform_name TEXT NOT NULL DEFAULT 'Scolarys Admin',
    contact_email TEXT NOT NULL,
    support_email TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Europe/Paris',
    language TEXT NOT NULL DEFAULT 'fr',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    
    -- Sécurité
    two_factor_auth INTEGER NOT NULL DEFAULT 1 CHECK(two_factor_auth IN (0, 1)),
    session_timeout TEXT NOT NULL DEFAULT '8',
    password_policy TEXT NOT NULL DEFAULT 'strong',
    max_login_attempts INTEGER NOT NULL DEFAULT 5,
    
    -- Notifications
    email_notifications INTEGER NOT NULL DEFAULT 1 CHECK(email_notifications IN (0, 1)),
    slack_webhook TEXT,
    discord_webhook TEXT,
    notify_payment INTEGER NOT NULL DEFAULT 1 CHECK(notify_payment IN (0, 1)),
    notify_signup INTEGER NOT NULL DEFAULT 1 CHECK(notify_signup IN (0, 1)),
    notify_system INTEGER NOT NULL DEFAULT 1 CHECK(notify_system IN (0, 1)),
    notify_expiry INTEGER NOT NULL DEFAULT 1 CHECK(notify_expiry IN (0, 1)),
    
    -- Apparence
    theme TEXT NOT NULL DEFAULT 'dark' CHECK(theme IN ('dark', 'light', 'system')),
    accent_color TEXT NOT NULL DEFAULT '#388bfd',
    compact_mode INTEGER NOT NULL DEFAULT 0 CHECK(compact_mode IN (0, 1)),
    show_avatars INTEGER NOT NULL DEFAULT 1 CHECK(show_avatars IN (0, 1)),
    
    -- Facturation
    company_name TEXT,
    vat_number TEXT,
    address TEXT,
    billing_email TEXT,
    auto_invoice INTEGER NOT NULL DEFAULT 1 CHECK(auto_invoice IN (0, 1)),
    
    -- API
    api_enabled INTEGER NOT NULL DEFAULT 1 CHECK(api_enabled IN (0, 1)),
    rate_limit INTEGER NOT NULL DEFAULT 1000,
    webhook_url TEXT,
    allow_cors INTEGER NOT NULL DEFAULT 1 CHECK(allow_cors IN (0, 1)),
    
    -- Synchronisation
    auto_sync INTEGER NOT NULL DEFAULT 1 CHECK(auto_sync IN (0, 1)),
    sync_network TEXT NOT NULL DEFAULT 'wifi' CHECK(sync_network IN ('always', 'wifi', 'manual')),
    sync_bandwidth_limit INTEGER NOT NULL DEFAULT 0,
    sync_conflict_resolution TEXT NOT NULL DEFAULT 'LWW' CHECK(sync_conflict_resolution IN ('LWW', 'manual', 'rules')),
    
    -- Sauvegardes
    backup_auto INTEGER NOT NULL DEFAULT 1 CHECK(backup_auto IN (0, 1)),
    backup_frequency TEXT NOT NULL DEFAULT 'daily' CHECK(backup_frequency IN ('daily', 'weekly', 'monthly')),
    backup_time TEXT NOT NULL DEFAULT '02:00:00',
    backup_retention INTEGER NOT NULL DEFAULT 30,
    
    -- Chiffrement
    encryption_algorithm TEXT NOT NULL DEFAULT 'AES-256-GCM',
    signature_algorithm TEXT NOT NULL DEFAULT 'Ed25519',
    
    -- Télémétrie
    telemetry_enabled INTEGER NOT NULL DEFAULT 0 CHECK(telemetry_enabled IN (0, 1)),
    telemetry_level TEXT NOT NULL DEFAULT 'standard' CHECK(telemetry_level IN ('minimal', 'standard', 'detailed')),
    
    -- Métadonnées
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    updated_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

-- ============================================================================
-- Table des IP autorisées
-- ============================================================================

CREATE TABLE IF NOT EXISTS allowed_ips (
    id SERIAL PRIMARY KEY,
    ip_address TEXT NOT NULL,
    cidr INTEGER,
    description TEXT,
    created_at TEXT NOT NULL,
    created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(ip_address, cidr)
);

CREATE INDEX idx_allowed_ips_ip ON allowed_ips(ip_address);

-- ============================================================================
-- Migration PostgreSQL pour Nova (suite et fin)
-- ============================================================================

-- ============================================================================
-- Table des clés USB autorisées
-- ============================================================================

CREATE TABLE IF NOT EXISTS usb_keys (
    id SERIAL PRIMARY KEY,
    key_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    last_used TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'revoked', 'expired')),
    created_at TEXT NOT NULL,
    created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    revoked_at TEXT,
    revoked_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_usb_keys_status ON usb_keys(status);

-- ============================================================================
-- Table des rôles et permissions détaillées
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL,
    is_system INTEGER NOT NULL DEFAULT 0 CHECK(is_system IN (0, 1)),
    users_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_roles_name ON roles(name);

-- ============================================================================
-- Table des permissions des rôles
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions_detail (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_code TEXT NOT NULL,
    granted INTEGER NOT NULL DEFAULT 1 CHECK(granted IN (0, 1)),
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ,
    UNIQUE(role_id, permission_code)
);

CREATE INDEX idx_role_permissions_role ON role_permissions_detail(role_id);

-- ============================================================================
-- Table des logs système
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level TEXT NOT NULL CHECK(level IN ('info', 'warn', 'error', 'debug')),
    timestamp TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT,
    user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    ip_address TEXT,
    metadata JSONB,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);

-- ============================================================================
-- Table des sessions utilisateur (pour le modal profil)
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
    is_current INTEGER NOT NULL DEFAULT 0 CHECK(is_current IN (0, 1)),
    login_at TEXT NOT NULL,
    last_activity_at TEXT NOT NULL,
    expires_at TEXT,
    revoked_at TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_current ON user_sessions(is_current);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity_at);

-- ============================================================================
-- Table de l'historique des activités utilisateur (pour le modal profil)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK(action_type IN ('login', 'logout', 'key_revoke', 'admin_add', 'export', 'settings_change', 'backup', 'sync')),
    details TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_user_activities_user ON user_activities(user_id);
CREATE INDEX idx_user_activities_created ON user_activities(created_at);
CREATE INDEX idx_user_activities_type ON user_activities(action_type);

-- ============================================================================
-- Table des emplacements de sauvegarde
-- ============================================================================

CREATE TABLE IF NOT EXISTS backup_locations (
    id SERIAL PRIMARY KEY,
    path TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('local', 'network', 'cloud')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    last_backup TEXT,
    size_bytes INTEGER,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_backup_locations_active ON backup_locations(is_active);

-- ============================================================================
-- Table de l'historique des sauvegardes
-- ============================================================================

CREATE TABLE IF NOT EXISTS backup_history (
    id SERIAL PRIMARY KEY,
    backup_type TEXT NOT NULL CHECK(backup_type IN ('full', 'incremental', 'sql')),
    location_id INTEGER REFERENCES backup_locations(id) ON DELETE SET NULL,
    size_bytes INTEGER,
    status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'in_progress')),
    error_message TEXT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    triggered_by TEXT CHECK(triggered_by IN ('auto', 'manual')),
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_backup_history_started ON backup_history(started_at);
CREATE INDEX idx_backup_history_status ON backup_history(status);

-- ============================================================================
-- Table de l'historique des synchronisations
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_history (
    id SERIAL PRIMARY KEY,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    records_processed INTEGER DEFAULT 0,
    conflicts_resolved INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'in_progress')),
    error_message TEXT,
    triggered_by TEXT CHECK(triggered_by IN ('auto', 'manual', 'scheduled')),
    duration_ms INTEGER,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_sync_history_started ON sync_history(started_at);
CREATE INDEX idx_sync_history_status ON sync_history(status);

-- ============================================================================
-- Table des notifications clients (déjà faite, mais ajout si manquante)
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_notifications (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('request_update', 'template_ready', 'invoice', 'reminder', 'announcement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0 CHECK(is_read IN (0, 1)),
    created_at TEXT NOT NULL,
    read_at TEXT,
    action_url TEXT,
    synced INTEGER NOT NULL DEFAULT 0 CHECK(synced IN (0, 1)),
    sync_date TIMESTAMPTZ
);

CREATE INDEX idx_notifications_client ON client_notifications(client_id);
CREATE INDEX idx_notifications_read ON client_notifications(is_read);
CREATE INDEX idx_notifications_created ON client_notifications(created_at);
CREATE INDEX idx_notifications_type ON client_notifications(type);