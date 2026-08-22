"use server"

import prisma from '@/lib/prisma'

export async function getNewAppointments(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastDashboardVisitAt: true }
  })

  const since = user?.lastDashboardVisitAt ?? new Date(0)

  const newAppointments = await prisma.appointment.findMany({
    where: {
      userId,
      source: "PATIENT",
      createdAt: { gt: since }
    },
    select: {
      id: true,
      name: true,
      time: true,
      appointmentDate: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return newAppointments
}
