-- Drop the unique constraint on weekId so a week can have multiple slide decks
ALTER TABLE "slide_decks" DROP CONSTRAINT IF EXISTS "slide_decks_weekId_key";

-- Add position column for ordering, default to 1 for existing rows
ALTER TABLE "slide_decks" ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 1;

-- Index for fast lookup by week
CREATE INDEX IF NOT EXISTS "slide_decks_weekId_idx" ON "slide_decks"("weekId");
