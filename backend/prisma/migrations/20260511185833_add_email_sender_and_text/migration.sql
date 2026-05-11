-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "from" TEXT,
ADD COLUMN     "textBody" TEXT;

-- CreateIndex
CREATE INDEX "Email_isPrivate_idx" ON "Email"("isPrivate");
