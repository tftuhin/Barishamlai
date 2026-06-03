-- Migration: major_modules
-- Adds Water, Garbage, Community Security modules; extends Units with occupancy/SC type;
-- adds MonthlySetup for per-month admin confirmations.
-- All operations use IF NOT EXISTS / DO NOTHING guards for idempotency.

-- ── Extend BillType enum ──────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TYPE "BillType" ADD VALUE 'GARBAGE';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "BillType" ADD VALUE 'COMMUNITY_SECURITY';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Extend ExpenseSource enum ─────────────────────────────────────────────
DO $$ BEGIN
  ALTER TYPE "ExpenseSource" ADD VALUE 'WATER';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "ExpenseSource" ADD VALUE 'GARBAGE';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "ExpenseSource" ADD VALUE 'COMMUNITY_SECURITY';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "ExpenseSource" ADD VALUE 'RENT';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Extend ServiceExpenseCategory enum ───────────────────────────────────
DO $$ BEGIN
  ALTER TYPE "ServiceExpenseCategory" ADD VALUE 'DIESEL';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "ServiceExpenseCategory" ADD VALUE 'SMALL_REPAIR';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "ServiceExpenseCategory" ADD VALUE 'WATER_BILL_PAYMENT';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "ServiceExpenseCategory" ADD VALUE 'GARBAGE_PAYMENT';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "ServiceExpenseCategory" ADD VALUE 'COMMUNITY_SECURITY_PAYMENT';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Extend FundType enum ──────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TYPE "FundType" ADD VALUE 'WATER';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "FundType" ADD VALUE 'GARBAGE';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "FundType" ADD VALUE 'COMMUNITY_SECURITY';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "FundType" ADD VALUE 'RENT';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── New enums ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "OccupancyType" AS ENUM ('OWNER_OCCUPIED', 'TENANT_OCCUPIED', 'VACANT', 'MERGED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ServiceChargeType" AS ENUM ('STANDARD', 'SPECIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Unit: new columns ─────────────────────────────────────────────────────
ALTER TABLE "Unit"
  ADD COLUMN IF NOT EXISTS "occupancyType"     "OccupancyType"     NOT NULL DEFAULT 'TENANT_OCCUPIED',
  ADD COLUMN IF NOT EXISTS "serviceChargeType" "ServiceChargeType" NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN IF NOT EXISTS "skipRentModule"    BOOLEAN             NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "ownerEmail"        TEXT,
  ADD COLUMN IF NOT EXISTS "tenantEmail"       TEXT,
  ADD COLUMN IF NOT EXISTS "tenantMoveInDate"  TIMESTAMP(3);

-- ── BuildingConfig: new columns ───────────────────────────────────────────
ALTER TABLE "BuildingConfig"
  ADD COLUMN IF NOT EXISTS "featureWater"              BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "featureCommunitySecurity"  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "garbageRate"               DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "communitySecurityRate"     DOUBLE PRECISION NOT NULL DEFAULT 0;

-- ── MonthlySetup table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "MonthlySetup" (
  "id"                    TEXT         NOT NULL,
  "buildingId"            TEXT         NOT NULL,
  "month"                 INTEGER      NOT NULL,
  "year"                  INTEGER      NOT NULL,
  "waterBillTotal"        DOUBLE PRECISION,
  "waterOccupied"         INTEGER,
  "waterBillsGenerated"   BOOLEAN      NOT NULL DEFAULT FALSE,
  "scOccupancyConfirmed"  BOOLEAN      NOT NULL DEFAULT FALSE,
  "scBillsGenerated"      BOOLEAN      NOT NULL DEFAULT FALSE,
  "garbageBillsGenerated" BOOLEAN      NOT NULL DEFAULT FALSE,
  "csBillsGenerated"      BOOLEAN      NOT NULL DEFAULT FALSE,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MonthlySetup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MonthlySetup_buildingId_month_year_key"
  ON "MonthlySetup"("buildingId", "month", "year");

ALTER TABLE "MonthlySetup"
  ADD CONSTRAINT "MonthlySetup_buildingId_fkey"
  FOREIGN KEY ("buildingId") REFERENCES "Building"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE
  DEFERRABLE INITIALLY DEFERRED;
