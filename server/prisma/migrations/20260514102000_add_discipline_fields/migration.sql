-- AlterTable
ALTER TABLE "Trade"
ADD COLUMN     "disciplineScore" INTEGER,
ADD COLUMN     "disciplineSummary" TEXT,
ADD COLUMN     "mistakeTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
