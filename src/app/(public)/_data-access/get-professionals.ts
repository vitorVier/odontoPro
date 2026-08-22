"use server"

import prisma from "@/lib/prisma"
import { getTrialCutoffDate } from "@/utils/permissions/isTrialActive"

export async function getProfessionals() {
  try {
    const professionals = await prisma.user.findMany({
      where: {
        status: true,
        OR: [
          { subscription: { is: { status: "active" } } },
          { createdAt: { gte: getTrialCutoffDate() }},
        ],
      },
      include: {
        subscription: true,
        services: {
          where: { status: true },
          select: {
            id: true,
            name: true,
            duration: true,
            status: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })

    return professionals;

  } catch (err) {
    return []
  }
}