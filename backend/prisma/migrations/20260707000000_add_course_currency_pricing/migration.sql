-- Course pricing in USD + NGN with an optional discount percent.
-- All columns nullable => fully backwards-compatible with existing rows.
ALTER TABLE "courses"
  ADD COLUMN "priceUsd" DECIMAL(10,2),
  ADD COLUMN "priceNgn" DECIMAL(14,2),
  ADD COLUMN "discountPercent" INTEGER;

-- Speed up the catalog (published filter) and the super-admin pipeline
-- board (status filter) — both previously full-table scans.
CREATE INDEX IF NOT EXISTS "courses_status_idx" ON "courses"("status");
CREATE INDEX IF NOT EXISTS "courses_published_idx" ON "courses"("published");
