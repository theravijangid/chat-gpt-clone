/*
  Warnings:

  - The values [COMPLETED] on the enum `MessageStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `lastMessageAt` on table `Conversation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MessageStatus_new" AS ENUM ('PENDING', 'ERROR', 'COMPLETE', 'FAILED');
ALTER TABLE "Message" ALTER COLUMN "status" TYPE "MessageStatus_new" USING ("status"::text::"MessageStatus_new");
ALTER TYPE "MessageStatus" RENAME TO "MessageStatus_old";
ALTER TYPE "MessageStatus_new" RENAME TO "MessageStatus";
DROP TYPE "public"."MessageStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "lastMessageAt" SET NOT NULL,
ALTER COLUMN "lastMessageAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "status" SET DEFAULT 'COMPLETE';
