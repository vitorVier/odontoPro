/*
  Warnings:

  - A unique constraint covering the columns `[userId,appointmentDate,time]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Appointment_userId_appointmentDate_time_key" ON "Appointment"("userId", "appointmentDate", "time");
