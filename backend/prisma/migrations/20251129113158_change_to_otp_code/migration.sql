/*
  Warnings:

  - You are about to drop the column `token` on the `PasswordResetToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PasswordResetToken_token_idx";

-- DropIndex
DROP INDEX "PasswordResetToken_token_key";

-- AlterTable
ALTER TABLE "PasswordResetToken" DROP COLUMN "token",
ADD COLUMN     "otpCode" TEXT;

-- CreateIndex
CREATE INDEX "PasswordResetToken_otpCode_idx" ON "PasswordResetToken"("otpCode");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_otpCode_idx" ON "PasswordResetToken"("userId", "otpCode");
