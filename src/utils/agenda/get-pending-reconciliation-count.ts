"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfDay, subDays } from "date-fns"

export async function getPendingReconciliationCount() {
  const session = await auth()
  if (!session?.user?.id) return 0

  const today = startOfDay(new Date())

  return prisma.appointment.count({
    where: {
      userId: session.user.id,
      status: "SCHEDULED",
      appointmentDate: { lt: today, gte: subDays(today, 30) },
    },
  })
}