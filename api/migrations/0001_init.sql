-- AIMake Database Schema
-- Migration: 0001_init

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  quota_limit INTEGER DEFAULT 600,
  quota_used INTEGER DEFAULT 0,
  quota_reset_at TEXT,
  stripe_customer_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- Voices Table
CREATE TABLE IF NOT EXISTS voices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'elevenlabs', 'azure', 'tencent', 'minimax', 'siliconflow')),
  provider_voice_id TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'neutral')),
  language TEXT,
  style TEXT,
  description TEXT,
  preview_url TEXT,
  is_premium INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_voices_provider ON voices(provider);
CREATE INDEX idx_voices_is_active ON voices(is_active);

-- Audios Table
CREATE TABLE IF NOT EXISTS audios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  text TEXT NOT NULL,
  text_length INTEGER NOT NULL,
  voice_id TEXT REFERENCES voices(id),
  audio_url TEXT NOT NULL,
  audio_format TEXT DEFAULT 'mp3' CHECK (audio_format IN ('mp3', 'wav')),
  duration REAL NOT NULL,
  file_size INTEGER,
  speed REAL DEFAULT 1.0,
  pitch REAL DEFAULT 0,
  type TEXT DEFAULT 'tts' CHECK (type IN ('tts', 'podcast')),
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audios_user_id ON audios(user_id);
CREATE INDEX idx_audios_created_at ON audios(created_at);
CREATE INDEX idx_audios_type ON audios(type);

-- TTS Jobs Table
CREATE TABLE IF NOT EXISTS tts_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  speed REAL DEFAULT 1.0,
  pitch REAL DEFAULT 0,
  format TEXT DEFAULT 'mp3' CHECK (format IN ('mp3', 'wav')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  audio_id TEXT,
  error_code TEXT,
  error_message TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tts_jobs_user_id ON tts_jobs(user_id);
CREATE INDEX idx_tts_jobs_status ON tts_jobs(status);

-- Podcasts Table
CREATE TABLE IF NOT EXISTS podcasts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('url', 'text', 'topic')),
  source_content TEXT NOT NULL,
  target_duration INTEGER DEFAULT 600,
  style TEXT DEFAULT 'casual' CHECK (style IN ('casual', 'professional', 'debate')),
  script TEXT,
  host_voice_id TEXT REFERENCES voices(id),
  guest_voice_id TEXT REFERENCES voices(id),
  audio_url TEXT,
  duration REAL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'scripting', 'synthesizing', 'completed', 'failed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX idx_podcasts_status ON podcasts(status);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'team')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at TEXT,
  canceled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Usage Logs Table
CREATE TABLE IF NOT EXISTS usage_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tts', 'podcast')),
  chars_used INTEGER NOT NULL DEFAULT 0,
  duration_used REAL NOT NULL DEFAULT 0,
  audio_id TEXT,
  podcast_id TEXT,
  provider TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);

-- Seed Voices
INSERT OR IGNORE INTO voices (id, name, name_zh, provider, gender, language, style, description, is_premium, is_active, sort_order) VALUES
  ('openai-alloy', 'Alloy', '合金', 'openai', 'neutral', 'zh-CN', '平稳专业', '中性、平稳的声音，适合新闻播报和专业场景', 0, 1, 1),
  ('openai-echo', 'Echo', '回声', 'openai', 'male', 'zh-CN', '温暖男声', '温暖的男性声音，适合叙述和讲故事', 0, 1, 2),
  ('openai-fable', 'Fable', '寓言', 'openai', 'female', 'zh-CN', '活泼女声', '活泼的女性声音，适合轻松内容', 0, 1, 3),
  ('openai-onyx', 'Onyx', '玛瑙', 'openai', 'male', 'zh-CN', '磁性男声', '低沉磁性的男性声音，适合配音和广告', 0, 1, 4),
  ('openai-nova', 'Nova', '新星', 'openai', 'female', 'zh-CN', '温柔女声', '温柔的女性声音，适合有声读物', 0, 1, 5),
  ('openai-shimmer', 'Shimmer', '微光', 'openai', 'female', 'zh-CN', '清新女声', '清新的女性声音，适合教育内容', 0, 1, 6),
  -- SiliconFlow FishAudio voices
  ('sf-alex', 'Alex', '艾利克斯', 'siliconflow', 'male', 'zh-CN', '稳重男声', 'FishAudio 稳重男声，适合新闻播报', 0, 1, 20),
  ('sf-benjamin', 'Benjamin', '本杰明', 'siliconflow', 'male', 'zh-CN', '温暖男声', 'FishAudio 温暖男声，适合叙述', 0, 1, 21),
  ('sf-charles', 'Charles', '查尔斯', 'siliconflow', 'male', 'zh-CN', '磁性男声', 'FishAudio 磁性男声，适合广告配音', 0, 1, 22),
  ('sf-david', 'David', '大卫', 'siliconflow', 'male', 'zh-CN', '成熟男声', 'FishAudio 成熟男声', 0, 1, 23),
  ('sf-anna', 'Anna', '安娜', 'siliconflow', 'female', 'zh-CN', '甜美女声', 'FishAudio 甜美女声，自然流畅', 0, 1, 24),
  ('sf-bella', 'Bella', '贝拉', 'siliconflow', 'female', 'zh-CN', '活泼女声', 'FishAudio 活泼女声', 0, 1, 25),
  ('sf-claire', 'Claire', '克莱尔', 'siliconflow', 'female', 'zh-CN', '温柔女声', 'FishAudio 温柔女声，适合有声读物', 0, 1, 26),
  ('sf-diana', 'Diana', '黛安娜', 'siliconflow', 'female', 'zh-CN', '清新女声', 'FishAudio 清新女声，适合教育内容', 0, 1, 27);
