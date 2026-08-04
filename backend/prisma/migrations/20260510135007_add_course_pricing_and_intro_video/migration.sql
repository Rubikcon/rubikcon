-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "introVideoUrl" TEXT,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;
