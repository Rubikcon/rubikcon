-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'FACILITATOR';

-- AlterTable
ALTER TABLE "facilitators" ADD COLUMN     "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "facilitators_userId_key" ON "facilitators"("userId");

-- AddForeignKey
ALTER TABLE "facilitators" ADD CONSTRAINT "facilitators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
