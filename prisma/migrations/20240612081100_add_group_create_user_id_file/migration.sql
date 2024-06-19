/*
  Warnings:

  - Added the required column `createUserId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "createUserId" TEXT NOT NULL;
