/*
  Warnings:

  - Added the required column `country` to the `Holiday` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Holiday" ADD COLUMN     "country" TEXT NOT NULL;
