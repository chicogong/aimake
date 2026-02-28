-- Universal Jobs Migration
-- Merges tts_jobs + podcasts + audios → unified jobs table
-- Run: npx wrangler d1 migrations apply aimake-db --local

-- Create the new unified jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content_type TEXT NOT NULL,       -- 'podcast'|'audiobook'|'voiceover'|'education'|'tts'
  source_type TEXT NOT NULL,        -- 'text'|'url'|'document'
  source_content TEXT NOT NULL,
  source_mime_type TEXT,
  settings TEXT NOT NULL DEFAULT '{}',
  script TEXT,
  detected_content_type TEXT,
  audio_url TEXT,
  audio_format TEXT DEFAULT 'mp3',
  duration REAL,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  current_stage TEXT,
  error_code TEXT,
  error_message TEXT,
  is_deleted INTEGER DEFAULT 0,
  is_quick_tts INTEGER DEFAULT 0,
  stream_token TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_content_type ON jobs(content_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Update usage_logs to reference jobs instead of audios/podcasts
-- Add job_id column
ALTER TABLE usage_logs ADD COLUMN job_id TEXT REFERENCES jobs(id);
