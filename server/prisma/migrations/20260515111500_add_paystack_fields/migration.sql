-- AlterTable
ALTER TABLE "User"
ADD COLUMN "paystackCustomerCode" TEXT,
ADD COLUMN "paystackSubscriptionCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_paystackCustomerCode_key" ON "User"("paystackCustomerCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_paystackSubscriptionCode_key" ON "User"("paystackSubscriptionCode");
