CREATE TABLE "user_profiles" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userRole" TEXT,
  "country" TEXT,
  "experienceLevel" TEXT,
  "motivation" TEXT,
  "learningInterests" TEXT[] NOT NULL DEFAULT '{}',
  "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
