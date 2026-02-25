-- ============================================================
-- Migration 001: Create Users Table
-- Norfolk Cleaners - ServiceM8-style staff management schema
-- Supabase (Coolify-hosted) · PostgreSQL 15+
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
-- gen_random_uuid() is built-in since PostgreSQL 13 - no pgcrypto needed.

-- ── Clean slate (safe during initial setup - no user data yet) ──
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS user_status;
DROP TYPE IF EXISTS employment_type;
DROP TYPE IF EXISTS dbs_check_status;

-- Custom ENUM types
CREATE TYPE user_role AS ENUM (
  'owner',
  'business_owner',
  'finance',
  'staff',
  'staff_no_material',
  'staff_no_pricing',
  'staff_no_pricing_no_attachments',
  'contractor',
  'strict_contractor'
);

CREATE TYPE user_status AS ENUM (
  'active',
  'on_leave',
  'suspended',
  'terminated'
);

CREATE TYPE employment_type AS ENUM (
  'full_time',
  'part_time',
  'zero_hour',
  'contractor',
  'apprentice'
);

CREATE TYPE dbs_check_status AS ENUM (
  'not_submitted',
  'pending',
  'cleared',
  'flagged',
  'expired'
);

-- ============================================================
-- Users table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  -- ── Identity ──────────────────────────────────────────────
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 VARCHAR(255) NOT NULL UNIQUE,
  password_hash         VARCHAR NOT NULL,
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  phone_number          VARCHAR(20),
  date_of_birth         DATE,
  avatar_url            TEXT,

  -- ── Role & Access ─────────────────────────────────────────
  role                  user_role NOT NULL DEFAULT 'staff',
  status                user_status NOT NULL DEFAULT 'active',

  -- ── Employment ────────────────────────────────────────────
  employment_type       employment_type NOT NULL DEFAULT 'full_time',
  employee_code         VARCHAR(20) UNIQUE,              -- e.g. NC-0042, for payslips / timesheets
  hourly_rate           DECIMAL(10,2) DEFAULT 0.00,
  start_date            DATE,                            -- first day of work
  end_date              DATE,                            -- null while employed
  max_hours_per_week    INTEGER,                         -- contractual cap
  national_insurance    VARCHAR(20),                     -- NI number (UK) for payroll
  bank_details          JSONB DEFAULT '{}',              -- { sort_code, account_number, account_name }

  -- ── Compliance & Vetting ──────────────────────────────────
  dbs_check_status      dbs_check_status DEFAULT 'not_submitted',
  dbs_certificate_number VARCHAR(50),
  dbs_check_date        DATE,
  dbs_expiry_date       DATE,
  right_to_work_verified BOOLEAN DEFAULT FALSE,
  right_to_work_expiry  DATE,

  -- ── Location & Routing ────────────────────────────────────
  home_base_address     TEXT,                            -- full address for route planning
  home_base_postcode    VARCHAR(10),                     -- separate for quick geo-lookups
  service_radius_miles  INTEGER DEFAULT 15,
  last_known_lat        DOUBLE PRECISION,
  last_known_lng        DOUBLE PRECISION,
  last_location_update  TIMESTAMPTZ,                     -- when GPS was last refreshed

  -- ── Transport ─────────────────────────────────────────────
  has_driving_license   BOOLEAN DEFAULT FALSE,
  has_own_vehicle       BOOLEAN DEFAULT FALSE,
  vehicle_registration  VARCHAR(20),

  -- ── Skills & Capabilities ────────────────────────────────
  skills_tags           TEXT[] DEFAULT '{}',              -- e.g. {'deep_clean','carpet_washing','biohazard'}
  certifications        JSONB DEFAULT '[]',              -- [{ name, issued_by, date_issued, expiry_date, file_url }]
  key_holder            BOOLEAN DEFAULT FALSE,           -- trusted to hold client property keys
  uniform_size          VARCHAR(10),                     -- XS / S / M / L / XL / XXL

  -- ── Availability ──────────────────────────────────────────
  availability          JSONB DEFAULT '{}',              -- { mon: { start: "08:00", end: "17:00" }, ... }
  preferred_areas       TEXT[] DEFAULT '{}',             -- postcodes / area names they prefer

  -- ── Performance (denormalised) ────────────────────────────
  avg_rating            DECIMAL(3,2) DEFAULT 0.00,       -- cached average from reviews
  completed_jobs_count  INTEGER DEFAULT 0,               -- fast counter for dashboards

  -- ── Notifications ─────────────────────────────────────────
  device_fcm_token      TEXT,                            -- Firebase Cloud Messaging push token
  notification_prefs    JSONB DEFAULT '{"email":true,"sms":true,"push":true}',

  -- ── HR & Admin ────────────────────────────────────────────
  emergency_contact     JSONB DEFAULT '{}',              -- { name, relation, phone }
  internal_notes        TEXT,                            -- hidden from the cleaner; admin/HR only

  -- ── Timestamps ────────────────────────────────────────────
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX idx_users_email        ON users (email);
CREATE INDEX idx_users_role         ON users (role);
CREATE INDEX idx_users_status       ON users (status);
CREATE INDEX idx_users_employee_code ON users (employee_code);
CREATE INDEX idx_users_postcode     ON users (home_base_postcode);
CREATE INDEX idx_users_skills       ON users USING GIN (skills_tags);

-- ── Auto-update updated_at trigger ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ──────────────────────────────────────
-- RLS is disabled for now; we connect directly via pg pool.
-- Enable and add policies once an auth strategy is wired up.
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
