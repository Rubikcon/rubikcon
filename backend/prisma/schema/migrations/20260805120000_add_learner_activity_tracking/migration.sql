-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "signupSource" TEXT NOT NULL DEFAULT 'EMAIL';
