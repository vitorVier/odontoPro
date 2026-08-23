"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getActiveScheduleBlocks() {
  const session = await auth()

  if (!session?.user?.id) {
    return []
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0))

  const blocks = await prisma.scheduleBlock.findMany({
    where: {
      userId: session.user.id,
      OR: [
        { recurring: true },
        { endDate: { gte: today } }, // esconde bloqueios de datas totalmente passadas
      ],
    },
    orderBy: [{ recurring: "desc" }, { startDate: "asc" }],
  })

  return blocks
}