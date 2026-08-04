-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "hiddenFromRecommendation" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "JobFavorite" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobView" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'detail',
    "durationMs" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobFavorite_jobId_idx" ON "JobFavorite"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobFavorite_studentId_jobId_key" ON "JobFavorite"("studentId", "jobId");

-- CreateIndex
CREATE INDEX "JobView_studentId_jobId_idx" ON "JobView"("studentId", "jobId");

-- CreateIndex
CREATE INDEX "JobView_jobId_idx" ON "JobView"("jobId");

-- CreateIndex
CREATE INDEX "JobView_created_at_idx" ON "JobView"("created_at");

-- AddForeignKey
ALTER TABLE "JobFavorite" ADD CONSTRAINT "JobFavorite_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFavorite" ADD CONSTRAINT "JobFavorite_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobView" ADD CONSTRAINT "JobView_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobView" ADD CONSTRAINT "JobView_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
