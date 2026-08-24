"use server"

import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"

export async function getShowRate({ userId, month = new Date() }: { userId: string; month?: Date }) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)

  const [completed, noShow] = await Promise.all([
    prisma.appointment.count({
      where: { userId, appointmentDate: { gte: start, lte: end }, status: "COMPLETED" },
    }),
    prisma.appointment.count({
      where: { userId, appointmentDate: { gte: start, lte: end }, status: "NO_SHOW" },
    }),
  ])

  const resolved = completed + noShow // CANCELED e SCHEDULED não entram na conta — não são "resultado" ainda
  const rate = resolved > 0 ? (completed / resolved) * 100 : null // null = sem dado suficiente ainda

  return { rate, completed, noShow }
}