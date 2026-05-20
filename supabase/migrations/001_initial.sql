-- ============================================================
-- Truly Survival — initial schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ── users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id       TEXT        UNIQUE NOT NULL,
  discord_username TEXT        NOT NULL,
  discord_avatar   TEXT,
  tier             TEXT        NOT NULL DEFAULT 'free'
                               CHECK (tier IN ('free', 'basic', 'true', 'true_plus')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── purchases ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier                TEXT        NOT NULL CHECK (tier IN ('basic', 'true', 'true_plus')),
  stripe_customer_id  TEXT        NOT NULL,
  stripe_price_id     TEXT        NOT NULL,
  status              TEXT        NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'paused')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS users_discord_id_idx
  ON users (discord_id);

CREATE INDEX IF NOT EXISTS purchases_user_id_idx
  ON purchases (user_id);

CREATE INDEX IF NOT EXISTS purchases_stripe_customer_id_idx
  ON purchases (stripe_customer_id);

-- ── auto-update updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ─────────────────────────────────────
-- All writes go through the service role key (server-side),
-- which bypasses RLS entirely. These policies lock down
-- direct anon/browser access.

ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Block everything from anon & authenticated roles by default.
-- The server client (service_role) bypasses RLS automatically.
CREATE POLICY "deny anon users"
  ON users FOR ALL TO anon USING (false);

CREATE POLICY "deny anon purchases"
  ON purchases FOR ALL TO anon USING (false);
