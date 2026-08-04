-- AlterTable
ALTER TABLE "courses"
ADD COLUMN "tagline" TEXT,
ADD COLUMN "level" TEXT,
ADD COLUMN "estimatedDuration" TEXT,
ADD COLUMN "phaseLabel" TEXT,
ADD COLUMN "heroImage" TEXT,
ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "WeekDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SlideDeckViewerType" AS ENUM ('MODAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "ReadingResourceType" AS ENUM ('ARTICLE', 'COURSE', 'DOCUMENTATION', 'WHITEPAPER', 'VIDEO', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "QuizAttemptStatus" AS ENUM ('SUBMITTED');

-- CreateEnum
CREATE TYPE "AssignmentSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "WeekProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE');

-- CreateTable
CREATE TABLE "facilitators" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "organization" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "linkedinUrl" TEXT NOT NULL,
  "photoUrl" TEXT,
  "bio" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "facilitators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weeks" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "durationLabel" TEXT NOT NULL,
  "difficulty" "WeekDifficulty" NOT NULL,
  "hook" TEXT NOT NULL,
  "whatToExpect" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "estimatedCompletionMinutes" INTEGER NOT NULL,
  "videoTitle" TEXT,
  "videoUrl" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "week_facilitators" (
  "id" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "facilitatorId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,

  CONSTRAINT "week_facilitators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "week_topics" (
  "id" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "position" INTEGER NOT NULL,

  CONSTRAINT "week_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "week_objectives" (
  "id" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "position" INTEGER NOT NULL,

  CONSTRAINT "week_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slide_decks" (
  "id" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "slideCount" INTEGER NOT NULL,
  "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
  "viewerType" "SlideDeckViewerType" NOT NULL DEFAULT 'EXTERNAL',

  CONSTRAINT "slide_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slide_deck_sections" (
  "id" TEXT NOT NULL,
  "slideDeckId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "position" INTEGER NOT NULL,

  CONSTRAINT "slide_deck_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glossary_terms" (
  "id" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "term" TEXT NOT NULL,
  "definition" TEXT NOT NULL,
  "example" TEXT,
  "position" INTEGER NOT NULL,

  CONSTRAINT "glossary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_glossary_terms" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "termId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "saved_glossary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_resources" (
  "id" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "ReadingResourceType" NOT NULL,
  "position" INTEGER NOT NULL,

  CONSTRAINT "reading_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_progress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
  "id" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "passMark" INTEGER NOT NULL DEFAULT 70,
  "attemptLimit" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
  "id" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "position" INTEGER NOT NULL,

  CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_options" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "isCorrect" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL,

  CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "percentage" DOUBLE PRECISION NOT NULL,
  "status" "QuizAttemptStatus" NOT NULL DEFAULT 'SUBMITTED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "selectedOptionId" TEXT NOT NULL,

  CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_retake_unlocks" (
  "id" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "unlockedById" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "quiz_retake_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
  "id" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "instructions" TEXT NOT NULL,
  "deadline" TIMESTAMP(3) NOT NULL,
  "allowTextSubmission" BOOLEAN NOT NULL DEFAULT true,
  "allowFileUpload" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_choices" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "position" INTEGER NOT NULL,

  CONSTRAINT "assignment_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "choiceId" TEXT,
  "textResponse" TEXT,
  "attachmentName" TEXT,
  "attachmentUrl" TEXT,
  "attachmentMimeType" TEXT,
  "attachmentSizeBytes" INTEGER,
  "status" "AssignmentSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),

  CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_feedback" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "feedback" TEXT NOT NULL,
  "rating" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "assignment_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "week_progress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "weekId" TEXT NOT NULL,
  "status" "WeekProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "quizSubmitted" BOOLEAN NOT NULL DEFAULT false,
  "assignmentSubmitted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "week_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facilitators_email_key" ON "facilitators"("email");
CREATE UNIQUE INDEX "weeks_slug_key" ON "weeks"("slug");
CREATE UNIQUE INDEX "weeks_courseId_number_key" ON "weeks"("courseId", "number");
CREATE INDEX "weeks_courseId_idx" ON "weeks"("courseId");
CREATE UNIQUE INDEX "week_facilitators_weekId_facilitatorId_key" ON "week_facilitators"("weekId", "facilitatorId");
CREATE INDEX "week_facilitators_weekId_idx" ON "week_facilitators"("weekId");
CREATE INDEX "week_facilitators_facilitatorId_idx" ON "week_facilitators"("facilitatorId");
CREATE UNIQUE INDEX "week_topics_weekId_position_key" ON "week_topics"("weekId", "position");
CREATE INDEX "week_topics_weekId_idx" ON "week_topics"("weekId");
CREATE UNIQUE INDEX "week_objectives_weekId_position_key" ON "week_objectives"("weekId", "position");
CREATE INDEX "week_objectives_weekId_idx" ON "week_objectives"("weekId");
CREATE UNIQUE INDEX "slide_decks_weekId_key" ON "slide_decks"("weekId");
CREATE UNIQUE INDEX "slide_deck_sections_slideDeckId_position_key" ON "slide_deck_sections"("slideDeckId", "position");
CREATE INDEX "slide_deck_sections_slideDeckId_idx" ON "slide_deck_sections"("slideDeckId");
CREATE UNIQUE INDEX "glossary_terms_weekId_term_key" ON "glossary_terms"("weekId", "term");
CREATE UNIQUE INDEX "glossary_terms_weekId_position_key" ON "glossary_terms"("weekId", "position");
CREATE INDEX "glossary_terms_weekId_idx" ON "glossary_terms"("weekId");
CREATE UNIQUE INDEX "saved_glossary_terms_userId_termId_key" ON "saved_glossary_terms"("userId", "termId");
CREATE INDEX "saved_glossary_terms_userId_idx" ON "saved_glossary_terms"("userId");
CREATE INDEX "saved_glossary_terms_termId_idx" ON "saved_glossary_terms"("termId");
CREATE UNIQUE INDEX "reading_resources_weekId_position_key" ON "reading_resources"("weekId", "position");
CREATE INDEX "reading_resources_weekId_idx" ON "reading_resources"("weekId");
CREATE UNIQUE INDEX "reading_progress_userId_resourceId_key" ON "reading_progress"("userId", "resourceId");
CREATE INDEX "reading_progress_userId_idx" ON "reading_progress"("userId");
CREATE INDEX "reading_progress_resourceId_idx" ON "reading_progress"("resourceId");
CREATE UNIQUE INDEX "quizzes_weekId_key" ON "quizzes"("weekId");
CREATE UNIQUE INDEX "quiz_questions_quizId_position_key" ON "quiz_questions"("quizId", "position");
CREATE INDEX "quiz_questions_quizId_idx" ON "quiz_questions"("quizId");
CREATE UNIQUE INDEX "quiz_options_questionId_position_key" ON "quiz_options"("questionId", "position");
CREATE INDEX "quiz_options_questionId_idx" ON "quiz_options"("questionId");
CREATE UNIQUE INDEX "quiz_attempts_userId_quizId_submittedAt_key" ON "quiz_attempts"("userId", "quizId", "submittedAt");
CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");
CREATE INDEX "quiz_attempts_quizId_idx" ON "quiz_attempts"("quizId");
CREATE UNIQUE INDEX "quiz_answers_attemptId_questionId_key" ON "quiz_answers"("attemptId", "questionId");
CREATE INDEX "quiz_answers_attemptId_idx" ON "quiz_answers"("attemptId");
CREATE INDEX "quiz_answers_questionId_idx" ON "quiz_answers"("questionId");
CREATE INDEX "quiz_answers_selectedOptionId_idx" ON "quiz_answers"("selectedOptionId");
CREATE UNIQUE INDEX "quiz_retake_unlocks_quizId_userId_key" ON "quiz_retake_unlocks"("quizId", "userId");
CREATE INDEX "quiz_retake_unlocks_quizId_idx" ON "quiz_retake_unlocks"("quizId");
CREATE INDEX "quiz_retake_unlocks_userId_idx" ON "quiz_retake_unlocks"("userId");
CREATE INDEX "quiz_retake_unlocks_unlockedById_idx" ON "quiz_retake_unlocks"("unlockedById");
CREATE UNIQUE INDEX "assignments_weekId_position_key" ON "assignments"("weekId", "position");
CREATE INDEX "assignments_weekId_idx" ON "assignments"("weekId");
CREATE UNIQUE INDEX "assignment_choices_assignmentId_position_key" ON "assignment_choices"("assignmentId", "position");
CREATE INDEX "assignment_choices_assignmentId_idx" ON "assignment_choices"("assignmentId");
CREATE INDEX "assignment_submissions_userId_idx" ON "assignment_submissions"("userId");
CREATE INDEX "assignment_submissions_assignmentId_idx" ON "assignment_submissions"("assignmentId");
CREATE INDEX "assignment_submissions_choiceId_idx" ON "assignment_submissions"("choiceId");
CREATE INDEX "assignment_feedback_submissionId_idx" ON "assignment_feedback"("submissionId");
CREATE INDEX "assignment_feedback_reviewerId_idx" ON "assignment_feedback"("reviewerId");
CREATE UNIQUE INDEX "week_progress_userId_weekId_key" ON "week_progress"("userId", "weekId");
CREATE INDEX "week_progress_userId_idx" ON "week_progress"("userId");
CREATE INDEX "week_progress_weekId_idx" ON "week_progress"("weekId");

-- AddForeignKey
ALTER TABLE "weeks" ADD CONSTRAINT "weeks_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "week_facilitators" ADD CONSTRAINT "week_facilitators_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "week_facilitators" ADD CONSTRAINT "week_facilitators_facilitatorId_fkey"
FOREIGN KEY ("facilitatorId") REFERENCES "facilitators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "week_topics" ADD CONSTRAINT "week_topics_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "week_objectives" ADD CONSTRAINT "week_objectives_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "slide_decks" ADD CONSTRAINT "slide_decks_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "slide_deck_sections" ADD CONSTRAINT "slide_deck_sections_slideDeckId_fkey"
FOREIGN KEY ("slideDeckId") REFERENCES "slide_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "glossary_terms" ADD CONSTRAINT "glossary_terms_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saved_glossary_terms" ADD CONSTRAINT "saved_glossary_terms_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saved_glossary_terms" ADD CONSTRAINT "saved_glossary_terms_termId_fkey"
FOREIGN KEY ("termId") REFERENCES "glossary_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reading_resources" ADD CONSTRAINT "reading_resources_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_resourceId_fkey"
FOREIGN KEY ("resourceId") REFERENCES "reading_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey"
FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_questionId_fkey"
FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey"
FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attemptId_fkey"
FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_questionId_fkey"
FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_selectedOptionId_fkey"
FOREIGN KEY ("selectedOptionId") REFERENCES "quiz_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_retake_unlocks" ADD CONSTRAINT "quiz_retake_unlocks_quizId_fkey"
FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_retake_unlocks" ADD CONSTRAINT "quiz_retake_unlocks_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_retake_unlocks" ADD CONSTRAINT "quiz_retake_unlocks_unlockedById_fkey"
FOREIGN KEY ("unlockedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignments" ADD CONSTRAINT "assignments_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignment_choices" ADD CONSTRAINT "assignment_choices_assignmentId_fkey"
FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignmentId_fkey"
FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_choiceId_fkey"
FOREIGN KEY ("choiceId") REFERENCES "assignment_choices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "assignment_feedback" ADD CONSTRAINT "assignment_feedback_submissionId_fkey"
FOREIGN KEY ("submissionId") REFERENCES "assignment_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignment_feedback" ADD CONSTRAINT "assignment_feedback_reviewerId_fkey"
FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "week_progress" ADD CONSTRAINT "week_progress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "week_progress" ADD CONSTRAINT "week_progress_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
