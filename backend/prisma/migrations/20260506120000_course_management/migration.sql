-- AlterEnum: add SUPER_ADMIN to Role
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- CreateEnum: CourseStatus
DO $$ BEGIN
  CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: ApprovalAction
DO $$ BEGIN
  CREATE TYPE "ApprovalAction" AS ENUM ('APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AlterTable: add new columns to courses
ALTER TABLE "courses"
  ADD COLUMN IF NOT EXISTS "status"         "CourseStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "createdById"    TEXT,
  ADD COLUMN IF NOT EXISTS "approvalNotes"  TEXT,
  ADD COLUMN IF NOT EXISTS "submittedAt"    TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "approvedAt"     TIMESTAMP(3);

-- AddForeignKey: courses.createdById -> users.id
ALTER TABLE "courses"
  ADD CONSTRAINT "courses_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex on courses.createdById
CREATE INDEX IF NOT EXISTS "courses_createdById_idx" ON "courses"("createdById");

-- CreateTable: course_facilitators
CREATE TABLE IF NOT EXISTS "course_facilitators" (
  "id"            TEXT NOT NULL,
  "courseId"      TEXT NOT NULL,
  "facilitatorId" TEXT NOT NULL,
  "position"      INTEGER NOT NULL,
  CONSTRAINT "course_facilitators_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "course_facilitators_courseId_facilitatorId_key"
  ON "course_facilitators"("courseId", "facilitatorId");
CREATE INDEX IF NOT EXISTS "course_facilitators_courseId_idx" ON "course_facilitators"("courseId");
CREATE INDEX IF NOT EXISTS "course_facilitators_facilitatorId_idx" ON "course_facilitators"("facilitatorId");

ALTER TABLE "course_facilitators"
  ADD CONSTRAINT "course_facilitators_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_facilitators"
  ADD CONSTRAINT "course_facilitators_facilitatorId_fkey"
  FOREIGN KEY ("facilitatorId") REFERENCES "facilitators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: course_approvals
CREATE TABLE IF NOT EXISTS "course_approvals" (
  "id"         TEXT NOT NULL,
  "courseId"   TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "action"     "ApprovalAction" NOT NULL,
  "notes"      TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "course_approvals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "course_approvals_courseId_idx" ON "course_approvals"("courseId");
CREATE INDEX IF NOT EXISTS "course_approvals_reviewerId_idx" ON "course_approvals"("reviewerId");

ALTER TABLE "course_approvals"
  ADD CONSTRAINT "course_approvals_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_approvals"
  ADD CONSTRAINT "course_approvals_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
