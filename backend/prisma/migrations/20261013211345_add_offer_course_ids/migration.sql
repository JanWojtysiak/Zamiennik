/*
  Warnings:

  - You are about to drop the column `description` on the `Offer` table. All the data in the column will be lost.
  - Added the required column `offeredCourseId` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wantedCourseId` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "description",
ADD COLUMN     "offeredCourseId" TEXT NOT NULL,
ADD COLUMN     "wantedCourseId" TEXT NOT NULL;
