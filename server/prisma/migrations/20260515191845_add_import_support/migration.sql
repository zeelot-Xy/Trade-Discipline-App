-- CreateEnum
CREATE TYPE "TradeEntrySource" AS ENUM ('MANUAL', 'CSV_IMPORT', 'MT_STATEMENT', 'EXCHANGE_IMPORT');

-- CreateEnum
CREATE TYPE "TradeImportSource" AS ENUM ('GENERIC_CSV', 'MT4', 'MT5', 'BINANCE', 'BYBIT');

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "entrySource" "TradeEntrySource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "exitPrice" DECIMAL(18,4),
ADD COLUMN     "externalReference" TEXT,
ADD COLUMN     "importBatchId" TEXT,
ADD COLUMN     "importSource" "TradeImportSource",
ADD COLUMN     "sourceTradeId" TEXT,
ADD COLUMN     "tradingViewUrl" TEXT,
ALTER COLUMN "confluenceScore" DROP NOT NULL,
ALTER COLUMN "setupQuality" DROP NOT NULL,
ALTER COLUMN "checklistSnapshot" DROP NOT NULL;
