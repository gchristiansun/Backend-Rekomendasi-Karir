/*
  Warnings:

  - You are about to drop the column `courseId` on the `CLO` table. All the data in the column will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseTaken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subjectId` to the `CLO` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CLO" DROP CONSTRAINT "CLO_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_universityId_fkey";

-- DropForeignKey
ALTER TABLE "CourseSkill" DROP CONSTRAINT "CourseSkill_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseSkill" DROP CONSTRAINT "CourseSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "CourseTaken" DROP CONSTRAINT "CourseTaken_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseTaken" DROP CONSTRAINT "CourseTaken_studentId_fkey";

-- DropIndex
DROP INDEX "CLO_courseId_idx";

-- AlterTable
ALTER TABLE "CLO" DROP COLUMN "courseId",
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "CourseSkill";

-- DropTable
DROP TABLE "CourseTaken";

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "universityId" TEXT,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "sks" INTEGER,
    "semester" INTEGER,
    "rps" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectSkill" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "SubjectSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectTaken" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "grade" TEXT,
    "semester" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectTaken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "Subject_universityId_idx" ON "Subject"("universityId");

-- CreateIndex
CREATE INDEX "SubjectSkill_skillId_idx" ON "SubjectSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectSkill_subjectId_skillId_key" ON "SubjectSkill"("subjectId", "skillId");

-- CreateIndex
CREATE INDEX "SubjectTaken_subjectId_idx" ON "SubjectTaken"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectTaken_studentId_subjectId_key" ON "SubjectTaken"("studentId", "subjectId");

-- CreateIndex
CREATE INDEX "CLO_subjectId_idx" ON "CLO"("subjectId");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectSkill" ADD CONSTRAINT "SubjectSkill_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectSkill" ADD CONSTRAINT "SubjectSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTaken" ADD CONSTRAINT "SubjectTaken_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTaken" ADD CONSTRAINT "SubjectTaken_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CLO" ADD CONSTRAINT "CLO_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
