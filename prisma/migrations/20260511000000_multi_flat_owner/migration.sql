-- Allow one owner (User) to own multiple units by dropping the unique index on Unit.ownerId
DROP INDEX IF EXISTS "Unit_ownerId_key";
