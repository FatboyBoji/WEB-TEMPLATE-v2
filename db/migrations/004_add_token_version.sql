-- Add tokenVersion column to user_wa table
ALTER TABLE user_wa ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0; 