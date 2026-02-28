-- Add progress tracking columns to podcasts table
-- These support the new Agent SDK-based podcast generation pipeline

ALTER TABLE podcasts ADD COLUMN progress INTEGER DEFAULT 0;
ALTER TABLE podcasts ADD COLUMN current_stage TEXT;
ALTER TABLE podcasts ADD COLUMN error_code TEXT;
ALTER TABLE podcasts ADD COLUMN error_message TEXT;
ALTER TABLE podcasts ADD COLUMN is_deleted INTEGER DEFAULT 0;
