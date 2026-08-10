-- AlterTable
ALTER TABLE "CLO" ADD COLUMN     "weight" INTEGER;

-- CreateTable
CREATE TABLE "CLOGrade" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "cloId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CLOGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CLOGrade_cloId_idx" ON "CLOGrade"("cloId");

-- CreateIndex
CREATE UNIQUE INDEX "CLOGrade_studentId_cloId_key" ON "CLOGrade"("studentId", "cloId");

-- AddForeignKey
ALTER TABLE "CLOGrade" ADD CONSTRAINT "CLOGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CLOGrade" ADD CONSTRAINT "CLOGrade_cloId_fkey" FOREIGN KEY ("cloId") REFERENCES "CLO"("id") ON DELETE CASCADE ON UPDATE CASCADE;
