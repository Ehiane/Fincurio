-- ============================================================
-- Fincurio — Supabase Catch-Up Script
-- ============================================================
-- Run this in the Supabase SQL Editor to sync your production
-- database with all EF Core migrations applied to local Docker.
--
-- This script is IDEMPOTENT — safe to run multiple times.
-- It uses IF NOT EXISTS / IF EXISTS guards everywhere.
--
-- Migrations covered:
--   1. 20260212150208_UpdateDeductionFieldsV2  (partial — you already ran 4 ALTER TABLEs)
--   2. 20260214074644_AddHasCompletedOnboarding
--   3. 20260214092843_AddLastSeenAnnouncementId
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────────────────────
-- 1. USERS — add has_completed_onboarding
-- ──────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean NOT NULL DEFAULT false;

-- ──────────────────────────────────────────────────────────
-- 1b. USERS — add last_seen_announcement_id
-- ──────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_seen_announcement_id character varying(100);


-- ──────────────────────────────────────────────────────────
-- 2. INCOME_PROFILES — widen varchar columns
--    (Original was varchar(20) / varchar(2), now varchar(50) / varchar(10))
-- ──────────────────────────────────────────────────────────
ALTER TABLE income_profiles
  ALTER COLUMN employment_type TYPE character varying(50);

ALTER TABLE income_profiles
  ALTER COLUMN earning_method TYPE character varying(50);

ALTER TABLE income_profiles
  ALTER COLUMN pay_frequency TYPE character varying(50);

ALTER TABLE income_profiles
  ALTER COLUMN state_tax_code TYPE character varying(10);


-- ──────────────────────────────────────────────────────────
-- 3. INCOME_PROFILES — ensure all columns exist
--    (These may already be present from the original table creation.
--     ADD COLUMN IF NOT EXISTS guards against duplicates.)
-- ──────────────────────────────────────────────────────────
ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS estimated_federal_tax numeric(12,2) NOT NULL DEFAULT 0.0;

ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS estimated_state_tax numeric(12,2) NOT NULL DEFAULT 0.0;

ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS health_insurance numeric(12,2) NOT NULL DEFAULT 0.0;

ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS retirement_contribution numeric(12,2) NOT NULL DEFAULT 0.0;

ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS other_deductions numeric(12,2) NOT NULL DEFAULT 0.0;

ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS gross_annual_income numeric(12,2) NOT NULL DEFAULT 0.0;

ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS net_annual_income numeric(12,2) NOT NULL DEFAULT 0.0;

-- These 3 were already added via your manual ALTER TABLEs, but guard just in case:
ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS health_insurance_per_paycheck numeric(10,2) NOT NULL DEFAULT 0.0;

ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS retirement_percent numeric(5,2) NOT NULL DEFAULT 0.0;

ALTER TABLE income_profiles
  ADD COLUMN IF NOT EXISTS other_deductions_json jsonb;


-- ──────────────────────────────────────────────────────────
-- 4. BUDGET_GOALS — ensure monthly_budget_target exists
--    (Already added manually, guarded here)
-- ──────────────────────────────────────────────────────────
ALTER TABLE budget_goals
  ADD COLUMN IF NOT EXISTS monthly_budget_target numeric(12,2) NOT NULL DEFAULT 0.0;

-- Drop legacy columns if they still exist from original V1 migration:
ALTER TABLE budget_goals
  DROP COLUMN IF EXISTS monthly_savings_target;

ALTER TABLE budget_goals
  DROP COLUMN IF EXISTS monthly_spending_cap;


-- ──────────────────────────────────────────────────────────
-- 5. CATEGORY_BUDGETS — create table OR fix V1 → V2 schema
-- ──────────────────────────────────────────────────────────

-- 5a. If table doesn't exist at all, create it fresh with V2 schema:
CREATE TABLE IF NOT EXISTS category_budgets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  category_id   uuid NOT NULL,
  monthly_limit numeric(12,2) NOT NULL DEFAULT 0.0,
  created_at    timestamp with time zone NOT NULL DEFAULT now(),
  updated_at    timestamp with time zone NOT NULL DEFAULT now()
);

-- 5b. If table exists with V1 column "budget_goal_id", rename it to "user_id"
--     and clean up old FK / index BEFORE creating new indexes:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'category_budgets' AND column_name = 'budget_goal_id'
  ) THEN
    -- Drop the old FK first
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'FK_category_budgets_budget_goals_budget_goal_id'
        AND table_name = 'category_budgets'
    ) THEN
      ALTER TABLE category_budgets
        DROP CONSTRAINT "FK_category_budgets_budget_goals_budget_goal_id";
    END IF;

    -- Drop the old composite index
    DROP INDEX IF EXISTS idx_category_budgets_goal_category;

    -- Rename the column
    ALTER TABLE category_budgets RENAME COLUMN budget_goal_id TO user_id;
  END IF;
END $$;

-- 5c. Now safe to create indexes (user_id column guaranteed to exist):
CREATE UNIQUE INDEX IF NOT EXISTS idx_category_budgets_user_category
  ON category_budgets (user_id, category_id);

CREATE INDEX IF NOT EXISTS idx_category_budgets_category_id
  ON category_budgets (category_id);

-- 5d. Foreign keys (skip if they already exist):
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'FK_category_budgets_users_user_id'
      AND table_name = 'category_budgets'
  ) THEN
    ALTER TABLE category_budgets
      ADD CONSTRAINT "FK_category_budgets_users_user_id"
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'FK_category_budgets_categories_category_id'
      AND table_name = 'category_budgets'
  ) THEN
    ALTER TABLE category_budgets
      ADD CONSTRAINT "FK_category_budgets_categories_category_id"
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;
  END IF;
END $$;


-- ──────────────────────────────────────────────────────────
-- 7. Record in __EFMigrationsHistory so EF Core knows
--    these migrations have been applied.
-- ──────────────────────────────────────────────────────────
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260212150208_UpdateDeductionFieldsV2', '10.0.2')
ON CONFLICT ("MigrationId") DO NOTHING;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260214074644_AddHasCompletedOnboarding', '10.0.2')
ON CONFLICT ("MigrationId") DO NOTHING;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260214092843_AddLastSeenAnnouncementId', '10.0.2')
ON CONFLICT ("MigrationId") DO NOTHING;

-- ─── AddFicaTaxFields migration ────────────────────────────────────────────
ALTER TABLE income_profiles ADD COLUMN IF NOT EXISTS social_security_tax numeric(12,2) NOT NULL DEFAULT 0.0;
ALTER TABLE income_profiles ADD COLUMN IF NOT EXISTS medicare_tax numeric(12,2) NOT NULL DEFAULT 0.0;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260214100031_AddFicaTaxFields', '10.0.2')
ON CONFLICT ("MigrationId") DO NOTHING;


COMMIT;

-- ============================================================
-- DONE! Verify with:
--   SELECT * FROM "__EFMigrationsHistory" ORDER BY "MigrationId";
-- ============================================================
