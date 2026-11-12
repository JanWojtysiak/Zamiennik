-- CreateEnum
CREATE TYPE "OfferCategory" AS ENUM ('COURSE', 'SPORT');

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "category" "OfferCategory" NOT NULL DEFAULT 'COURSE';

-- CreateIndex
CREATE INDEX "Offer_category_idx" ON "Offer"("category");
