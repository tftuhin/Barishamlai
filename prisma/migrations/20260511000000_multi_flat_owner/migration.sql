-- Allow one owner (User) to own multiple units by dropping the unique constraint on Unit.ownerId
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_ownerId_key";
