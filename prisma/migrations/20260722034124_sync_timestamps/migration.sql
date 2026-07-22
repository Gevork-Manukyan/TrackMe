-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "serverUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "serverUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Category_userId_serverUpdatedAt_idx" ON "Category"("userId", "serverUpdatedAt");

-- CreateIndex
CREATE INDEX "Item_userId_serverUpdatedAt_idx" ON "Item"("userId", "serverUpdatedAt");
