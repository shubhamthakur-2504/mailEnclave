-- AlterTable
ALTER TABLE "UserConfig" ADD COLUMN     "lastAccessedAt" TIMESTAMP(3),
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Email_configId_receivedAt_idx" ON "Email"("configId", "receivedAt");

-- CreateIndex
CREATE INDEX "UserConfig_lastAccessedAt_idx" ON "UserConfig"("lastAccessedAt");

-- CreateIndex
CREATE INDEX "UserConfig_lastSyncedAt_idx" ON "UserConfig"("lastSyncedAt");
