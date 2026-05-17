-- Add mergedWithUnitId to Unit so one flat can be declared merged into another
ALTER TABLE "Unit" ADD COLUMN IF NOT EXISTS "mergedWithUnitId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Unit" ADD CONSTRAINT "Unit_mergedWithUnitId_fkey"
    FOREIGN KEY ("mergedWithUnitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
