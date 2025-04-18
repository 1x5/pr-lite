/*
  Warnings:

  - Made the column `data` on table `Photo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Photo" ALTER COLUMN "data" SET NOT NULL;
