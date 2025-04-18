/*
  Warnings:

  - You are about to drop the column `filename` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Photo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "filename",
DROP COLUMN "url",
ADD COLUMN     "data" BYTEA;
