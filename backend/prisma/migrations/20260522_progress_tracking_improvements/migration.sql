-- Add two new columns to track explicit lesson views and manual completion.
ALTER TABLE "week_progress"
  ADD COLUMN IF NOT EXISTS "manuallyCompleted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "week_progress"
  ADD COLUMN IF NOT EXISTS "firstOpenedAt" TIMESTAMP(3);

-- Preserve existing completion state. Any row already marked COMPLETE gets
-- manuallyCompleted=true so the new derivation logic can't demote it even if
-- the underlying quiz / assignment structure changes later.
UPDATE "week_progress"
SET "manuallyCompleted" = true
WHERE "status" = 'COMPLETE' AND "manuallyCompleted" = false;

-- Backfill firstOpenedAt for in-progress and complete rows so the new
-- "IN_PROGRESS on first view" logic doesn't accidentally demote them to NOT_STARTED.
UPDATE "week_progress"
SET "firstOpenedAt" = "createdAt"
WHERE "firstOpenedAt" IS NULL AND "status" <> 'NOT_STARTED';
