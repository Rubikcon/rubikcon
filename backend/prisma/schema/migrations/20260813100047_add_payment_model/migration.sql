-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYSTACK', 'NOWPAYMENTS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "internalReference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "basePrice" DECIMAL(14,2) NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "payableAmount" DECIMAL(18,8) NOT NULL,
    "paymentCurrency" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "paymentMethod" TEXT,
    "providerReference" TEXT,
    "providerMetadata" JSONB,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_internalReference_key" ON "payments"("internalReference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_enrollmentId_key" ON "payments"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_providerReference_key" ON "payments"("providerReference");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_courseId_idx" ON "payments"("courseId");

-- CreateIndex
CREATE INDEX "payments_internalReference_idx" ON "payments"("internalReference");

-- CreateIndex
CREATE INDEX "payments_providerReference_idx" ON "payments"("providerReference");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "course_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
