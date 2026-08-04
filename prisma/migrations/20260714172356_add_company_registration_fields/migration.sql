/*
  Warnings:

  - A unique constraint covering the columns `[nib]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "address" TEXT,
ADD COLUMN     "izinUsahaUrl" TEXT,
ADD COLUMN     "nib" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "suratResmiUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_nib_key" ON "Company"("nib");
