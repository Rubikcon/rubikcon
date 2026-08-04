-- Recreate the lesson_facilitators FKs with ON DELETE CASCADE.
-- Guarded because migration folders sort lexicographically and the sibling
-- "20260510_add_lesson_facilitators" (which CREATEs the table with cascading
-- FKs already) sorts AFTER this one — on a fresh database the table doesn't
-- exist yet when this runs, which used to break `prisma migrate deploy`.

DO $$
BEGIN
  IF to_regclass('public.lesson_facilitators') IS NOT NULL THEN
    ALTER TABLE "lesson_facilitators" DROP CONSTRAINT IF EXISTS "lesson_facilitators_facilitatorId_fkey";
    ALTER TABLE "lesson_facilitators" DROP CONSTRAINT IF EXISTS "lesson_facilitators_lessonId_fkey";
    ALTER TABLE "lesson_facilitators" ADD CONSTRAINT "lesson_facilitators_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ALTER TABLE "lesson_facilitators" ADD CONSTRAINT "lesson_facilitators_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "facilitators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
