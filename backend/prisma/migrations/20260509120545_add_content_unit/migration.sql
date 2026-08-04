-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "contentUnit" TEXT NOT NULL DEFAULT 'Lesson';

-- AlterTable
ALTER TABLE "user_profiles" ALTER COLUMN "learningInterests" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;
