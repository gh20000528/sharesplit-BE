/*
  Warnings:

  - Added the required column `createBy` to the `group_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "group_accounts" ADD COLUMN     "createBy" TEXT NOT NULL;
