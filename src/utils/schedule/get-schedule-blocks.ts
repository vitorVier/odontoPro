"use server"

import prisma from "@/lib/prisma"

interface GetScheduleBlocksParams {
  userId: string
  startDate: Date
  endDate: Date
}

export async function getScheduleBlocks({ userId, startDate, endDate }: GetScheduleBlocksParams) {
  const blocks = await prisma.scheduleBlock.findMany({
    where: {
      userId,
      OR: [
        // bloqueios recorrentes que já começaram a valer
        { recurring: true, startDate: { lte: endDate } },
        // bloqueios de data específica que colidem com o intervalo pedido
        {
          recurring: false,
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      ],
    },
    orderBy: { startDate: "asc" },
  })

  return blocks
}