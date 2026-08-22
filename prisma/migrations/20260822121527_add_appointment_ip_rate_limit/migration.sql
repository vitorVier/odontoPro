-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "ipAddress" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_ipAddress_createdAt_idx" ON "Appointment"("ipAddress", "createdAt");
