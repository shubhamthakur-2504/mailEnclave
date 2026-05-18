-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_configId_fkey";

-- DropForeignKey
ALTER TABLE "PrivateTag" DROP CONSTRAINT "PrivateTag_configId_fkey";

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_configId_fkey" FOREIGN KEY ("configId") REFERENCES "UserConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateTag" ADD CONSTRAINT "PrivateTag_configId_fkey" FOREIGN KEY ("configId") REFERENCES "UserConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
