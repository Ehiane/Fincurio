-- =============================================
-- Fincurio Full Migration + Seed Data
-- Run this in Supabase SQL Editor
-- =============================================

-- EF Core migration history table
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

-- =============================================
-- Migration: InitialCreate
-- =============================================
START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE TABLE categories (
        id uuid NOT NULL,
        name character varying(100) NOT NULL,
        display_name character varying(100) NOT NULL,
        type character varying(20) NOT NULL,
        icon character varying(50),
        color character varying(7),
        sort_order integer NOT NULL DEFAULT 0,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_categories" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE TABLE users (
        id uuid NOT NULL,
        email character varying(255) NOT NULL,
        password_hash character varying(255) NOT NULL,
        first_name character varying(100),
        last_name character varying(100),
        profile_image_url text,
        financial_intention text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        last_login_at timestamp with time zone,
        is_active boolean NOT NULL DEFAULT TRUE,
        CONSTRAINT "PK_users" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE TABLE refresh_tokens (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        token character varying(500) NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        created_at timestamp with time zone NOT NULL,
        revoked_at timestamp with time zone,
        is_revoked boolean NOT NULL DEFAULT FALSE,
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY (id),
        CONSTRAINT "FK_refresh_tokens_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE TABLE transactions (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        category_id uuid NOT NULL,
        date date NOT NULL,
        time time,
        merchant character varying(255) NOT NULL,
        amount numeric(12,2) NOT NULL,
        type character varying(20) NOT NULL,
        notes text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_transactions" PRIMARY KEY (id),
        CONSTRAINT "FK_transactions_categories_category_id" FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
        CONSTRAINT "FK_transactions_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE TABLE user_preferences (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        currency character varying(3) NOT NULL DEFAULT 'USD',
        timezone character varying(50) NOT NULL DEFAULT 'UTC',
        monthly_budget_goal numeric(12,2),
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_user_preferences" PRIMARY KEY (id),
        CONSTRAINT "FK_user_preferences_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE UNIQUE INDEX idx_refresh_tokens_token ON refresh_tokens (token);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE INDEX idx_transactions_category ON transactions (category_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE INDEX idx_transactions_date ON transactions (date);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE INDEX idx_transactions_user_date ON transactions (user_id, date);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE INDEX idx_transactions_user_id ON transactions (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE UNIQUE INDEX idx_user_preferences_user_id ON user_preferences (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    CREATE UNIQUE INDEX idx_users_email ON users (email);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260206123228_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260206123228_InitialCreate', '10.0.2');
    END IF;
END $EF$;
COMMIT;

-- =============================================
-- Migration: AddMerchantsTable
-- =============================================
START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207004403_AddMerchantsTable') THEN
    CREATE TABLE merchants (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        name character varying(255) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_merchants" PRIMARY KEY (id),
        CONSTRAINT "FK_merchants_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207004403_AddMerchantsTable') THEN
    CREATE INDEX "IX_merchants_user_id" ON merchants (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207004403_AddMerchantsTable') THEN
    CREATE UNIQUE INDEX "IX_merchants_user_id_name" ON merchants (user_id, name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207004403_AddMerchantsTable') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260207004403_AddMerchantsTable', '10.0.2');
    END IF;
END $EF$;
COMMIT;

-- =============================================
-- Migration: AddCustomCategoriesSupport
-- =============================================
START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207004714_AddCustomCategoriesSupport') THEN
    ALTER TABLE categories ADD user_id uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207004714_AddCustomCategoriesSupport') THEN
    CREATE INDEX "IX_categories_user_id" ON categories (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207004714_AddCustomCategoriesSupport') THEN
    ALTER TABLE categories ADD CONSTRAINT "FK_categories_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207004714_AddCustomCategoriesSupport') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260207004714_AddCustomCategoriesSupport', '10.0.2');
    END IF;
END $EF$;
COMMIT;

-- =============================================
-- Migration: AddEmailVerificationAndPasswordReset
-- =============================================
START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207050956_AddEmailVerificationAndPasswordReset') THEN
    ALTER TABLE users ADD "EmailVerificationToken" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207050956_AddEmailVerificationAndPasswordReset') THEN
    ALTER TABLE users ADD "EmailVerificationTokenExpiry" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207050956_AddEmailVerificationAndPasswordReset') THEN
    ALTER TABLE users ADD "IsEmailVerified" boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207050956_AddEmailVerificationAndPasswordReset') THEN
    ALTER TABLE users ADD "PasswordResetToken" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207050956_AddEmailVerificationAndPasswordReset') THEN
    ALTER TABLE users ADD "PasswordResetTokenExpiry" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207050956_AddEmailVerificationAndPasswordReset') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260207050956_AddEmailVerificationAndPasswordReset', '10.0.2');
    END IF;
END $EF$;
COMMIT;

-- =============================================
-- Migration: FixEmailVerificationColumnNames
-- =============================================
START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207053256_FixEmailVerificationColumnNames') THEN
    ALTER TABLE users RENAME COLUMN "PasswordResetTokenExpiry" TO password_reset_token_expiry;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207053256_FixEmailVerificationColumnNames') THEN
    ALTER TABLE users RENAME COLUMN "PasswordResetToken" TO password_reset_token;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207053256_FixEmailVerificationColumnNames') THEN
    ALTER TABLE users RENAME COLUMN "IsEmailVerified" TO is_email_verified;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207053256_FixEmailVerificationColumnNames') THEN
    ALTER TABLE users RENAME COLUMN "EmailVerificationTokenExpiry" TO email_verification_token_expiry;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207053256_FixEmailVerificationColumnNames') THEN
    ALTER TABLE users RENAME COLUMN "EmailVerificationToken" TO email_verification_token;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207053256_FixEmailVerificationColumnNames') THEN
    ALTER TABLE users ALTER COLUMN is_email_verified SET DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260207053256_FixEmailVerificationColumnNames') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260207053256_FixEmailVerificationColumnNames', '10.0.2');
    END IF;
END $EF$;
COMMIT;

-- =============================================
-- Seed Data: Default Categories
-- =============================================
INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at)
SELECT gen_random_uuid(), 'Tech', 'Tech', 'expense', 'laptop_mac', '#E6501B', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tech' AND user_id IS NULL);

INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at)
SELECT gen_random_uuid(), 'Groceries', 'Nourishment', 'expense', 'restaurant', '#280905', 2, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Groceries' AND user_id IS NULL);

INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at)
SELECT gen_random_uuid(), 'Salary', 'Salary', 'income', 'payments', '#10B981', 3, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Salary' AND user_id IS NULL);

INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at)
SELECT gen_random_uuid(), 'Dining', 'Dining', 'expense', 'local_cafe', '#F59E0B', 4, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Dining' AND user_id IS NULL);

INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at)
SELECT gen_random_uuid(), 'Subscription', 'Subscription', 'expense', 'music_note', '#8B5CF6', 5, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Subscription' AND user_id IS NULL);

INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at)
SELECT gen_random_uuid(), 'Transport', 'Transport', 'expense', 'commute', '#3B82F6', 6, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transport' AND user_id IS NULL);

INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at)
SELECT gen_random_uuid(), 'Shelter', 'Shelter', 'expense', 'home', '#6B7280', 7, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Shelter' AND user_id IS NULL);

INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at)
SELECT gen_random_uuid(), 'Wellness', 'Wellness', 'expense', 'spa', '#EC4899', 8, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Wellness' AND user_id IS NULL);

INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at)
SELECT gen_random_uuid(), 'Culture', 'Culture', 'expense', 'theater_comedy', '#14B8A6', 9, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Culture' AND user_id IS NULL);
