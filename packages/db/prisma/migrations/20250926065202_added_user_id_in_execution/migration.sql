/*
  Warnings:

  - Added the required column `userId` to the `WorkflowExecution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."WorkflowNodeExecution" DROP CONSTRAINT "WorkflowNodeExecution_executionId_fkey";

-- AlterTable
ALTER TABLE "public"."WorkflowExecution" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."WorkflowNodeExecution" ADD CONSTRAINT "WorkflowNodeExecution_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "public"."WorkflowExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
