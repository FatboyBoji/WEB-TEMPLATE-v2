-- Add isBlocked column to user_wa table
ALTER TABLE user_wa ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE; 