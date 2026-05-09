CREATE TABLE "course_enrollments" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "course_enrollments_userId_courseId_key" ON "course_enrollments"("userId", "courseId");
CREATE INDEX "course_enrollments_userId_idx" ON "course_enrollments"("userId");
