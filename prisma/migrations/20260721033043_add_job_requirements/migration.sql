-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "department" TEXT;

-- CreateTable
CREATE TABLE "JobRequirement" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "embedding" TEXT,

    CONSTRAINT "JobRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobRequirement_jobId_idx" ON "JobRequirement"("jobId");

-- AddForeignKey
ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
