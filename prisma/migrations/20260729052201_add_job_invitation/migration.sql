-- CreateTable
CREATE TABLE "JobInvitation" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "invitedById" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "respondedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobInvitation_studentId_idx" ON "JobInvitation"("studentId");

-- CreateIndex
CREATE INDEX "JobInvitation_jobId_idx" ON "JobInvitation"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobInvitation_jobId_studentId_key" ON "JobInvitation"("jobId", "studentId");

-- AddForeignKey
ALTER TABLE "JobInvitation" ADD CONSTRAINT "JobInvitation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobInvitation" ADD CONSTRAINT "JobInvitation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobInvitation" ADD CONSTRAINT "JobInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
