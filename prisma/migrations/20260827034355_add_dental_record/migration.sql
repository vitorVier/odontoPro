-- CreateEnum
CREATE TYPE "ToothCondition" AS ENUM ('HEALTHY', 'CAVITY', 'RESTORED', 'ROOT_CANAL', 'CROWN', 'EXTRACTED', 'MISSING', 'IMPLANT');

-- CreateTable
CREATE TABLE "ToothRecord" (
    "id" TEXT NOT NULL,
    "toothNumber" INTEGER NOT NULL,
    "condition" "ToothCondition" NOT NULL DEFAULT 'HEALTHY',
    "notes" TEXT,
    "patientId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToothRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToothRecord_patientId_toothNumber_key" ON "ToothRecord"("patientId", "toothNumber");

-- CreateIndex
CREATE INDEX "ClinicalRecord_patientId_createdAt_idx" ON "ClinicalRecord"("patientId", "createdAt");

-- AddForeignKey
ALTER TABLE "ToothRecord" ADD CONSTRAINT "ToothRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalRecord" ADD CONSTRAINT "ClinicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalRecord" ADD CONSTRAINT "ClinicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
