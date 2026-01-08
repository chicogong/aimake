-- aimake.cc Database Schema (PostgreSQL 16)
-- Version: 1.0.0
-- Last Updated: 2026-01-08

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For JSONB indexing

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- NULL if OAuth only
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),

    -- OAuth
    oauth_provider VARCHAR(50),  -- 'google', 'github', NULL
    oauth_id VARCHAR(255),

    -- Subscription
    plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'pro', 'enterprise')),
    quota_hours_total FLOAT DEFAULT 10.0,
    quota_hours_used FLOAT DEFAULT 0.0,
    quota_reset_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 month'),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,

    -- Soft delete
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- User API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL UNIQUE,  -- bcrypt hash of the key
    key_prefix VARCHAR(10) NOT NULL,  -- First 8 chars for display (e.g., "sk_test_")
    name VARCHAR(100),  -- User-friendly name

    -- Permissions
    scopes TEXT[] DEFAULT ARRAY['tts:synthesize', 'dict:read'],
    rate_limit_per_min INT DEFAULT 100,

    -- Usage tracking
    last_used_at TIMESTAMP,
    usage_count BIGINT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- ============================================
-- PRONUNCIATION DICTIONARY
-- ============================================

CREATE TABLE pronunciation_dicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Word info
    word VARCHAR(200) NOT NULL,  -- Original word (e.g., "Tesla")
    pronunciation VARCHAR(300) NOT NULL,  -- IPA or Pinyin (e.g., "ˈtɛslə" or "te4 si1 la1")
    language VARCHAR(10) NOT NULL CHECK (language IN ('zh', 'en', 'ja', 'ko')),

    -- Context (optional, for disambiguation)
    context TEXT,  -- e.g., "品牌名" or "人名"
    example_sentence TEXT,

    -- Metadata
    source VARCHAR(50) DEFAULT 'manual',  -- 'manual', 'imported', 'suggested'
    confidence_score FLOAT DEFAULT 1.0,  -- For AI-suggested pronunciations

    -- Usage stats
    usage_count INT DEFAULT 0,
    last_used_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    -- Prevent duplicates
    UNIQUE (user_id, word, language, deleted_at)
);

CREATE INDEX idx_dict_user ON pronunciation_dicts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_dict_word ON pronunciation_dicts(word) WHERE deleted_at IS NULL;
CREATE INDEX idx_dict_fuzzy ON pronunciation_dicts USING gin(word gin_trgm_ops);  -- Fuzzy search
CREATE INDEX idx_dict_language ON pronunciation_dicts(language);

-- ============================================
-- CANVAS & PROJECTS
-- ============================================

CREATE TABLE canvases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Canvas metadata
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled Canvas',
    description TEXT,

    -- Canvas state (JSONB for flexibility)
    data JSONB NOT NULL DEFAULT '{
        "cards": [],
        "viewport": {"x": 0, "y": 0, "scale": 1},
        "version": "1.0"
    }'::jsonb,

    -- Sharing
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(32) UNIQUE,  -- For public sharing

    -- Version control
    version INT DEFAULT 1,
    parent_version_id UUID REFERENCES canvases(id),  -- For forking/branching

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_canvas_user ON canvases(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_canvas_share_token ON canvases(share_token) WHERE is_public = TRUE;
CREATE INDEX idx_canvas_data ON canvases USING gin(data);  -- Query by card type

-- Canvas Activity Log (for undo/redo)
CREATE TABLE canvas_activities (
    id BIGSERIAL PRIMARY KEY,
    canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Activity data
    action_type VARCHAR(50) NOT NULL,  -- 'add_card', 'move_card', 'delete_card', 'update_text'
    card_id VARCHAR(100),  -- Frontend-generated card ID
    data_before JSONB,
    data_after JSONB,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_canvas_activity ON canvas_activities(canvas_id, created_at DESC);

-- ============================================
-- AUDIO ASSETS
-- ============================================

CREATE TABLE audio_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    canvas_id UUID REFERENCES canvases(id) ON DELETE SET NULL,  -- Optional link to canvas

    -- Audio metadata
    text TEXT NOT NULL,  -- Original input text
    text_hash VARCHAR(64),  -- SHA256 of (text + settings) for deduplication
    language VARCHAR(10) NOT NULL,

    -- TTS settings (JSONB for flexibility)
    tts_settings JSONB DEFAULT '{
        "engine": "cosyvoice",
        "voice_id": "default",
        "speed": 1.0,
        "pitch": 0,
        "emotion": "neutral"
    }'::jsonb,

    -- File info
    audio_url VARCHAR(500) NOT NULL,  -- S3/R2 URL
    audio_format VARCHAR(10) DEFAULT 'mp3',  -- 'mp3', 'wav', 'ogg'
    duration_seconds FLOAT,
    file_size_bytes BIGINT,

    -- Pronunciation dict snapshot (for reproducibility)
    dict_snapshot JSONB,  -- Copy of user's dict at generation time

    -- Quality metrics
    synthesis_time_ms INT,  -- Inference latency
    rtf FLOAT,  -- Real-Time Factor

    -- Usage
    download_count INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days'),  -- Auto-delete old files
    deleted_at TIMESTAMP
);

CREATE INDEX idx_audio_user ON audio_assets(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_audio_canvas ON audio_assets(canvas_id);
CREATE INDEX idx_audio_hash ON audio_assets(text_hash);  -- Deduplication
CREATE INDEX idx_audio_expires ON audio_assets(expires_at) WHERE deleted_at IS NULL;

-- ============================================
-- SUBSCRIPTIONS & BILLING
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Subscription details
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('starter', 'pro', 'enterprise')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),

    -- Billing
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    price_per_month_cents INT NOT NULL,  -- Store in cents to avoid float precision issues

    -- Dates
    trial_ends_at TIMESTAMP,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sub_user ON subscriptions(user_id);
CREATE INDEX idx_sub_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_sub_status ON subscriptions(status) WHERE status = 'active';

-- Payment History
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

    -- Payment details
    amount_cents INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),

    -- Stripe
    stripe_payment_id VARCHAR(100),
    stripe_invoice_id VARCHAR(100),

    -- Timestamps
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_user ON payments(user_id);
CREATE INDEX idx_payment_stripe ON payments(stripe_payment_id);

-- ============================================
-- USAGE TRACKING
-- ============================================

CREATE TABLE usage_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Resource usage
    resource_type VARCHAR(50) NOT NULL,  -- 'tts', 'storage', 'api_call'
    resource_unit VARCHAR(20),  -- 'hours', 'bytes', 'requests'
    quantity FLOAT NOT NULL,

    -- Context
    audio_asset_id UUID REFERENCES audio_assets(id) ON DELETE SET NULL,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- Partitioning by month for better performance
CREATE INDEX idx_usage_user_time ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_type ON usage_logs(resource_type, created_at DESC);

-- ============================================
-- SYSTEM LOGS & ANALYTICS
-- ============================================

CREATE TABLE system_events (
    id BIGSERIAL PRIMARY KEY,

    -- Event info
    event_type VARCHAR(100) NOT NULL,  -- 'user.signup', 'tts.generated', 'error.500'
    event_category VARCHAR(50),  -- 'user', 'tts', 'system', 'security'
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),

    -- Context
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    data JSONB,  -- Flexible event data

    -- Request info
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_type ON system_events(event_type, created_at DESC);
CREATE INDEX idx_events_user ON system_events(user_id, created_at DESC);
CREATE INDEX idx_events_severity ON system_events(severity, created_at DESC) WHERE severity IN ('error', 'critical');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvases_updated_at BEFORE UPDATE ON canvases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dicts_updated_at BEFORE UPDATE ON pronunciation_dicts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Deduct quota on audio generation
CREATE OR REPLACE FUNCTION deduct_user_quota()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET quota_hours_used = quota_hours_used + NEW.duration_seconds / 3600.0
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deduct_quota_on_audio_create AFTER INSERT ON audio_assets
    FOR EACH ROW EXECUTE FUNCTION deduct_user_quota();

-- ============================================
-- VIEWS (For Analytics)
-- ============================================

-- Daily active users
CREATE VIEW daily_active_users AS
SELECT
    date_trunc('day', created_at) AS date,
    COUNT(DISTINCT user_id) AS active_users
FROM usage_logs
GROUP BY date_trunc('day', created_at)
ORDER BY date DESC;

-- User quota status
CREATE VIEW user_quota_status AS
SELECT
    u.id,
    u.email,
    u.plan_type,
    u.quota_hours_total,
    u.quota_hours_used,
    (u.quota_hours_total - u.quota_hours_used) AS quota_remaining,
    CASE
        WHEN u.quota_hours_used >= u.quota_hours_total THEN TRUE
        ELSE FALSE
    END AS is_quota_exceeded,
    u.quota_reset_at
FROM users u
WHERE u.deleted_at IS NULL;

-- Top pronunciation words
CREATE VIEW top_pronunciation_words AS
SELECT
    word,
    language,
    COUNT(*) AS user_count,
    AVG(usage_count) AS avg_usage
FROM pronunciation_dicts
WHERE deleted_at IS NULL
GROUP BY word, language
ORDER BY user_count DESC
LIMIT 100;

-- ============================================
-- SEED DATA (For Development)
-- ============================================

-- Insert test user
INSERT INTO users (email, password_hash, display_name, plan_type) VALUES
('test@aimake.cc', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU0PeC2i3Tqi', 'Test User', 'pro');

-- Insert sample pronunciation dictionary
INSERT INTO pronunciation_dicts (user_id, word, pronunciation, language, context) VALUES
((SELECT id FROM users WHERE email = 'test@aimake.cc'), 'Tesla', 'ˈtɛslə', 'en', 'Brand name'),
((SELECT id FROM users WHERE email = 'test@aimake.cc'), '特斯拉', 'te4 si1 la1', 'zh', '品牌名'),
((SELECT id FROM users WHERE email = 'test@aimake.cc'), 'Kubernetes', 'ˌkuːbərˈnɛtiːz', 'en', 'Technology');

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Delete expired audio files (run daily via cron)
-- DELETE FROM audio_assets WHERE expires_at < NOW() AND deleted_at IS NULL;

-- Reset monthly quotas (run monthly)
-- UPDATE users SET quota_hours_used = 0, quota_reset_at = (NOW() + INTERVAL '1 month') WHERE quota_reset_at < NOW();

-- Vacuum analyze (run weekly)
-- VACUUM ANALYZE users, audio_assets, pronunciation_dicts;

-- ============================================
-- PERFORMANCE NOTES
-- ============================================

-- 1. JSONB Indexing:
--    - Use GIN indexes for JSONB columns that are frequently queried
--    - Example: SELECT * FROM canvases WHERE data @> '{"cards": [{"type": "audio"}]}';

-- 2. Partitioning:
--    - usage_logs should be partitioned by month for large datasets
--    - Example: CREATE TABLE usage_logs_2026_01 PARTITION OF usage_logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- 3. Connection Pooling:
--    - Use PgBouncer with max 100 connections per instance
--    - Transaction mode for short requests, Session mode for long-running queries

-- 4. Read Replicas:
--    - Route analytics queries to read replicas
--    - Use `pg_stat_statements` to identify slow queries

-- ============================================
-- BACKUP & RECOVERY
-- ============================================

-- Daily backup command (run via cron):
-- pg_dump -Fc aimake_db > /backups/aimake_$(date +%Y%m%d).dump

-- Restore command:
-- pg_restore -d aimake_db /backups/aimake_20260108.dump

-- ============================================
-- SECURITY CHECKLIST
-- ============================================

-- [ ] Enable SSL/TLS for all connections
-- [ ] Use row-level security (RLS) for multi-tenant isolation (if needed)
-- [ ] Rotate database passwords monthly
-- [ ] Enable audit logging for sensitive tables
-- [ ] Limit public schema access
-- [ ] Use prepared statements to prevent SQL injection
