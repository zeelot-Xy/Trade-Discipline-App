-- CreateEnum
CREATE TYPE "TradeDirection" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "TradeResult" AS ENUM ('WIN', 'LOSS', 'BREAKEVEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT,
    "direction" "TradeDirection",
    "entryPrice" DECIMAL(18,4),
    "stopLoss" DECIMAL(18,4),
    "takeProfit" DECIMAL(18,4),
    "riskAmount" DECIMAL(18,2),
    "rewardAmount" DECIMAL(18,2),
    "profitLoss" DECIMAL(18,2),
    "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
    "result" "TradeResult",
    "confluenceScore" INTEGER NOT NULL,
    "setupQuality" TEXT NOT NULL,
    "checklistSnapshot" JSONB NOT NULL,
    "notes" TEXT,
    "emotionBefore" TEXT,
    "emotionAfter" TEXT,
    "tradeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
