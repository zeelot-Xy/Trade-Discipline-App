-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM (
    'INACTIVE',
    'TRIALING',
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'INCOMPLETE',
    'INCOMPLETE_EXPIRED',
    'UNPAID'
);

-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "planType" "PlanType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
