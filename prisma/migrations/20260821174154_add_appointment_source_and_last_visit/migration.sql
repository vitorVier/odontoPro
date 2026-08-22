-- CreateEnum
CREATE TYPE "AppointmentSource" AS ENUM ('PATIENT', 'DENTIST');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "source" "AppointmentSource" NOT NULL DEFAULT 'DENTIST';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastDashboardVisitAt" TIMESTAMP(3);
