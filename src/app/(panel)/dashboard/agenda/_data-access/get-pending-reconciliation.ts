"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfDay, subDays } from "date-fns"

export async function getPendingReconciliation() {
  const session = await auth()
  if (!session?.user?.id) return []

  const today = startOfDay(new Date())

  return prisma.appointment.findMany({
    where: {
      userId: session.user.id,
      status: "SCHEDULED",
      appointmentDate: { lt: today, gte: subDays(today, 30) }, // limita a 30 dias, senão histórico antigo nunca dado baixa vira ruído permanente
    },
    include: { service: true },
    orderBy: { appointmentDate: "desc" },
  })
}