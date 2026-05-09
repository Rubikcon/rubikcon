-- Add description to modules
ALTER TABLE "modules" ADD COLUMN "description" TEXT;

-- Add moduleId to weeks
ALTER TABLE "weeks" ADD COLUMN "moduleId" TEXT;
ALTER TABLE "weeks" ADD CONSTRAINT "weeks_moduleId_fkey"
  FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "weeks_moduleId_idx" ON "weeks"("moduleId");

-- Create week_videos table
CREATE TABLE "week_videos" (
  "id" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT,
  "position" INTEGER NOT NULL,
  CONSTRAINT "week_videos_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "week_videos_weekId_position_key" ON "week_videos"("weekId", "position");
CREATE INDEX "week_videos_weekId_idx" ON "week_videos"("weekId");
ALTER TABLE "week_videos" ADD CONSTRAINT "week_videos_weekId_fkey"
  FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
