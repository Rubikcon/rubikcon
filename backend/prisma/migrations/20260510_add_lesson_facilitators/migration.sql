-- CreateTable lesson_facilitators
CREATE TABLE "lesson_facilitators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "facilitatorId" TEXT NOT NULL,
    CONSTRAINT "lesson_facilitators_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons" ("id") ON DELETE CASCADE,
    CONSTRAINT "lesson_facilitators_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "facilitators" ("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_facilitators_lessonId_facilitatorId_key" ON "lesson_facilitators"("lessonId", "facilitatorId");

-- CreateIndex
CREATE INDEX "lesson_facilitators_lessonId_idx" ON "lesson_facilitators"("lessonId");

-- CreateIndex
CREATE INDEX "lesson_facilitators_facilitatorId_idx" ON "lesson_facilitators"("facilitatorId");
