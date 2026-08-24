"use server"

import prisma from "@/lib/prisma"

interface GetAppointmentRevenueParams {
  userId: string
  start: Date
  end: Date
}

export async function getAppointmentRevenue({ userId, start, end }: GetAppointmentRevenueParams) {
  const appointments = await prisma.appointment.findMany({
    where: {
      userId,
      appointmentDate: { gte: start, lte: end },
      status: { in: ["COMPLETED", "SCHEDULED"] }, // NO_SHOW e CANCELED nunca entram na conta
    },
    include: { service: true },
  })

  let confirmed = 0
  let provisional = 0

  for (const appointment of appointments) {
    const price = appointment.service?.price ?? 0

    if (appointment.status === "COMPLETED") {
      confirmed += price
    } else {
      provisional += price
    }
  }

  return { confirmed, provisional }
}