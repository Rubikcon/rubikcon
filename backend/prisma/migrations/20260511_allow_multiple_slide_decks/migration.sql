-- Drop the unique constraint on weekId so a week can have multiple slide decks.
-- We drop both the constraint AND the underlying unique index, because Postgres
-- treats them as separate objects — DROP CONSTRAINT alone can leave the index in place.
ALTER TABLE "slide_decks" DROP CONSTRAINT IF EXISTS "slide_decks_weekId_key";
DROP INDEX IF EXISTS "slide_decks_weekId_key";

-- Add position column for ordering, default to 1 for existing rows
ALTER TABLE "slide_decks" ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 1;

-- Non-unique index for fast lookup by week
CREATE INDEX IF NOT EXISTS "slide_decks_weekId_idx" ON "slide_decks"("weekId");
