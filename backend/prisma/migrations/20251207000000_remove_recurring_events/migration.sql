-- Drop recurring event fields from Event table
ALTER TABLE "Event" DROP COLUMN IF EXISTS "isRecurring";
ALTER TABLE "Event" DROP COLUMN IF EXISTS "recurringPattern";

