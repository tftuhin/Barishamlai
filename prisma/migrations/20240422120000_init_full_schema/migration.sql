-- Full schema migration with IF NOT EXISTS guards so it is safe to run
-- against both a fresh DB and one that already has tables from prisma db push.

-- ── Enums ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'PRESIDENT', 'SECRETARY', 'OWNER', 'TENANT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BillType" AS ENUM ('RENT', 'SERVICE_CHARGE', 'GAS', 'WATER', 'ELECTRICITY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "UnitStatus" AS ENUM ('OCCUPIED', 'VACANT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ExpenseCategory" AS ENUM ('MAINTENANCE', 'CLEANING', 'UTILITIES', 'SECURITY', 'INSURANCE', 'LEGAL', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ExpenseSource" AS ENUM ('GAS', 'SERVICE_CHARGE', 'GENERAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ServiceExpenseCategory" AS ENUM ('SECURITY_GUARD_SALARY', 'CARETAKER_SALARY', 'CLEANER_SALARY', 'LIFT_SERVICING', 'COMMON_ELECTRICITY', 'GENERATOR', 'SC_MAINTENANCE', 'GAS_CYLINDER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "FundType" AS ENUM ('SERVICE_CHARGE', 'GAS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BuildingPlan" AS ENUM ('FREE', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BuildingTier" AS ENUM ('BASIC', 'STANDARD', 'PRO', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BuildingStatus" AS ENUM ('ACTIVE', 'LOCKED', 'BLOCKED', 'BANNED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Building ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Building" (
  "id"              TEXT          NOT NULL,
  "name"            TEXT          NOT NULL,
  "plan"            "BuildingPlan" NOT NULL DEFAULT 'FREE',
  "tier"            "BuildingTier",
  "premiumUntil"    TIMESTAMP(3),
  "status"          "BuildingStatus" NOT NULL DEFAULT 'ACTIVE',
  "statusNote"      TEXT,
  "statusUpdatedAt" TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- ── User ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "User" (
  "id"                  TEXT    NOT NULL,
  "name"                TEXT    NOT NULL,
  "email"               TEXT    NOT NULL,
  "password"            TEXT    NOT NULL,
  "phone"               TEXT,
  "profileImage"        TEXT,
  "passwordResetToken"  TEXT,
  "passwordResetExpiry" TIMESTAMP(3),
  "role"                "Role"  NOT NULL DEFAULT 'TENANT',
  "buildingId"          TEXT,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"              ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- ── Unit ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Unit" (
  "id"                   TEXT         NOT NULL,
  "number"               TEXT         NOT NULL,
  "floor"                INTEGER      NOT NULL,
  "area"                 DOUBLE PRECISION,
  "monthlyRent"          DOUBLE PRECISION NOT NULL,
  "status"               "UnitStatus" NOT NULL DEFAULT 'OCCUPIED',
  "isOwnerOccupied"      BOOLEAN      NOT NULL DEFAULT false,
  "customServiceCharge"  DOUBLE PRECISION,
  "ownerContactName"     TEXT,
  "ownerPhone"           TEXT,
  "tenantContactName"    TEXT,
  "tenantPhone"          TEXT,
  "tenantNid"            TEXT,
  "buildingId"           TEXT,
  "ownerId"              TEXT,
  "tenantId"             TEXT,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Unit_ownerId_key"              ON "Unit"("ownerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Unit_tenantId_key"             ON "Unit"("tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Unit_buildingId_number_key"    ON "Unit"("buildingId", "number");

-- ── Bill ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Bill" (
  "id"           TEXT           NOT NULL,
  "unitId"       TEXT           NOT NULL,
  "buildingId"   TEXT,
  "type"         "BillType"     NOT NULL,
  "amount"       DOUBLE PRECISION NOT NULL,
  "month"        INTEGER        NOT NULL,
  "year"         INTEGER        NOT NULL,
  "dueDate"      TIMESTAMP(3)   NOT NULL,
  "status"       "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "paidAt"       TIMESTAMP(3),
  "note"         TEXT,
  "meterReading" DOUBLE PRECISION,
  "createdAt"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3)   NOT NULL,
  CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Bill_unitId_type_month_year_key" ON "Bill"("unitId", "type", "month", "year");

-- ── Receipt ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Receipt" (
  "id"          TEXT    NOT NULL,
  "billId"      TEXT    NOT NULL,
  "unitId"      TEXT    NOT NULL,
  "issuedById"  TEXT    NOT NULL,
  "recipientId" TEXT    NOT NULL,
  "amount"      DOUBLE PRECISION NOT NULL,
  "pdfUrl"      TEXT,
  "sentEmail"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Receipt_billId_key" ON "Receipt"("billId");

-- ── Expense ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Expense" (
  "id"              TEXT                    NOT NULL,
  "title"           TEXT                    NOT NULL,
  "amount"          DOUBLE PRECISION        NOT NULL,
  "category"        "ExpenseCategory"       NOT NULL,
  "serviceCategory" "ServiceExpenseCategory",
  "incomeSource"    "ExpenseSource"         NOT NULL DEFAULT 'GENERAL',
  "date"            TIMESTAMP(3)            NOT NULL,
  "description"     TEXT,
  "month"           INTEGER                 NOT NULL,
  "year"            INTEGER                 NOT NULL,
  "buildingId"      TEXT,
  "createdAt"       TIMESTAMP(3)            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)            NOT NULL,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- ── BuildingConfig ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "BuildingConfig" (
  "id"                   TEXT    NOT NULL,
  "featureRent"          BOOLEAN NOT NULL DEFAULT true,
  "featureElectricity"   BOOLEAN NOT NULL DEFAULT true,
  "featureGas"           BOOLEAN NOT NULL DEFAULT true,
  "featureLift"          BOOLEAN NOT NULL DEFAULT false,
  "featureSecurityGuard" BOOLEAN NOT NULL DEFAULT false,
  "featureGarbage"       BOOLEAN NOT NULL DEFAULT false,
  "featureServiceCharge" BOOLEAN NOT NULL DEFAULT true,
  "serviceChargeOccupied" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "serviceChargeVacant"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  "gasUnitRate"          DOUBLE PRECISION NOT NULL DEFAULT 0,
  "onboardingComplete"   BOOLEAN NOT NULL DEFAULT false,
  "updatedAt"            TIMESTAMP(3)     NOT NULL,
  CONSTRAINT "BuildingConfig_pkey" PRIMARY KEY ("id")
);

-- ── Message ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Message" (
  "id"         TEXT    NOT NULL,
  "senderId"   TEXT    NOT NULL,
  "buildingId" TEXT,
  "subject"    TEXT    NOT NULL,
  "body"       TEXT    NOT NULL,
  "isGlobal"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- ── MessageRecipient ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "MessageRecipient" (
  "id"        TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "readAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MessageRecipient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MessageRecipient_messageId_userId_key" ON "MessageRecipient"("messageId", "userId");

-- ── JoinRequest ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "JoinRequest" (
  "id"         TEXT                NOT NULL,
  "userId"     TEXT                NOT NULL,
  "buildingId" TEXT                NOT NULL,
  "role"       "Role"              NOT NULL,
  "status"     "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"  TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3)        NOT NULL,
  CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- ── SubscriptionPayment ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SubscriptionPayment" (
  "id"          TEXT                 NOT NULL,
  "buildingId"  TEXT                 NOT NULL,
  "tier"        "BuildingTier"       NOT NULL,
  "months"      INTEGER              NOT NULL DEFAULT 1,
  "amount"      DOUBLE PRECISION     NOT NULL,
  "tranId"      TEXT                 NOT NULL,
  "valId"       TEXT,
  "status"      "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"   TIMESTAMP(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SubscriptionPayment_tranId_key" ON "SubscriptionPayment"("tranId");

-- ── FundBalance ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "FundBalance" (
  "id"         TEXT             NOT NULL,
  "buildingId" TEXT             NOT NULL,
  "fundType"   "FundType"       NOT NULL,
  "amount"     DOUBLE PRECISION NOT NULL,
  "note"       TEXT,
  "setAt"      TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3)     NOT NULL,
  CONSTRAINT "FundBalance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FundBalance_buildingId_fundType_key" ON "FundBalance"("buildingId", "fundType");

-- ── UnitOpeningBalance ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "UnitOpeningBalance" (
  "id"         TEXT             NOT NULL,
  "unitId"     TEXT             NOT NULL,
  "buildingId" TEXT             NOT NULL,
  "billType"   "BillType"       NOT NULL,
  "amount"     DOUBLE PRECISION NOT NULL,
  "note"       TEXT,
  "setAt"      TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3)     NOT NULL,
  CONSTRAINT "UnitOpeningBalance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UnitOpeningBalance_unitId_billType_key" ON "UnitOpeningBalance"("unitId", "billType");

-- ── Invitation ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Invitation" (
  "id"          TEXT               NOT NULL,
  "email"       TEXT               NOT NULL,
  "buildingId"  TEXT               NOT NULL,
  "role"        "Role"             NOT NULL,
  "token"       TEXT               NOT NULL,
  "status"      "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt"   TIMESTAMP(3)       NOT NULL,
  "invitedById" TEXT               NOT NULL,
  "createdAt"   TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_token_key" ON "Invitation"("token");

-- ── UserBuilding ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "UserBuilding" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "buildingId" TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserBuilding_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserBuilding_userId_buildingId_key" ON "UserBuilding"("userId", "buildingId");

-- ── MultiPropertyRequest ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "MultiPropertyRequest" (
  "id"              TEXT NOT NULL,
  "userId"          TEXT NOT NULL,
  "buildingId"      TEXT NOT NULL,
  "phone"           TEXT NOT NULL,
  "totalProperties" INTEGER NOT NULL,
  "totalFlats"      INTEGER NOT NULL,
  "status"          TEXT    NOT NULL DEFAULT 'PENDING',
  "note"            TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MultiPropertyRequest_pkey" PRIMARY KEY ("id")
);

-- ── Foreign Keys (add if not exists via DO blocks) ────────────────────────────

DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Unit" ADD CONSTRAINT "Unit_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Unit" ADD CONSTRAINT "Unit_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Unit" ADD CONSTRAINT "Unit_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Bill" ADD CONSTRAINT "Bill_unitId_fkey"
    FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Bill" ADD CONSTRAINT "Bill_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_billId_fkey"
    FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_unitId_fkey"
    FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_issuedById_fkey"
    FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_recipientId_fkey"
    FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Expense" ADD CONSTRAINT "Expense_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "BuildingConfig" ADD CONSTRAINT "BuildingConfig_id_fkey"
    FOREIGN KEY ("id") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Message" ADD CONSTRAINT "Message_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MessageRecipient" ADD CONSTRAINT "MessageRecipient_messageId_fkey"
    FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MessageRecipient" ADD CONSTRAINT "MessageRecipient_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FundBalance" ADD CONSTRAINT "FundBalance_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UnitOpeningBalance" ADD CONSTRAINT "UnitOpeningBalance_unitId_fkey"
    FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UnitOpeningBalance" ADD CONSTRAINT "UnitOpeningBalance_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey"
    FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserBuilding" ADD CONSTRAINT "UserBuilding_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserBuilding" ADD CONSTRAINT "UserBuilding_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MultiPropertyRequest" ADD CONSTRAINT "MultiPropertyRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MultiPropertyRequest" ADD CONSTRAINT "MultiPropertyRequest_buildingId_fkey"
    FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
