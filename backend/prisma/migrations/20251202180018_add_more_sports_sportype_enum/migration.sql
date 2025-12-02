/*
  Warnings:

  - The values [OTHER] on the enum `SportType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SportType_new" AS ENUM ('FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'TENNIS', 'RUNNING', 'CYCLING', 'SOCCER', 'SWIMMING', 'YOGA', 'PILATES', 'BOXING', 'MARTIAL_ARTS', 'GOLF', 'BADMINTON', 'TABLE_TENNIS', 'CRICKET', 'RUGBY', 'HOCKEY', 'BASEBALL');
ALTER TABLE "Event" ALTER COLUMN "sportType" TYPE "SportType_new" USING ("sportType"::text::"SportType_new");
ALTER TYPE "SportType" RENAME TO "SportType_old";
ALTER TYPE "SportType_new" RENAME TO "SportType";
DROP TYPE "SportType_old";
COMMIT;
