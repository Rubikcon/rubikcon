-- DropForeignKey
ALTER TABLE "lesson_facilitators" DROP CONSTRAINT "lesson_facilitators_facilitatorId_fkey";

-- DropForeignKey
ALTER TABLE "lesson_facilitators" DROP CONSTRAINT "lesson_facilitators_lessonId_fkey";

-- AddForeignKey
ALTER TABLE "lesson_facilitators" ADD CONSTRAINT "lesson_facilitators_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_facilitators" ADD CONSTRAINT "lesson_facilitators_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "facilitators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
