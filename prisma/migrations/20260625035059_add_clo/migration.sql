/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "code" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CLO" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "code" TEXT,
    "text" TEXT NOT NULL,
    "paraphrase" TEXT,
    "embedding" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CLO_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CLO_courseId_idx" ON "CLO"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");

-- AddForeignKey
ALTER TABLE "CLO" ADD CONSTRAINT "CLO_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
