-- Add lessonContent to weeks
ALTER TABLE "weeks" ADD COLUMN IF NOT EXISTS "lessonContent" TEXT;

-- CreateTable: week_images
CREATE TABLE IF NOT EXISTS "week_images" (
  "id"       TEXT NOT NULL,
  "weekId"   TEXT NOT NULL,
  "url"      TEXT NOT NULL,
  "alt"      TEXT,
  "caption"  TEXT,
  "position" INTEGER NOT NULL,
  CONSTRAINT "week_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "week_images_weekId_idx" ON "week_images"("weekId");

ALTER TABLE "week_images"
  ADD CONSTRAINT "week_images_weekId_fkey"
  FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
