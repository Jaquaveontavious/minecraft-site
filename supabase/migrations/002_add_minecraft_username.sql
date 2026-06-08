-- Add minecraft_username to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS minecraft_username TEXT;