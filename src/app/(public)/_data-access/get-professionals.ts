"use server"

import prisma from "@/lib/prisma"

export async function getProfessionals() {

  try {
    const professionals = await prisma.user.findMany({
      where: {
        status: true,
      },
      include: {
        subscription: true,
        services: {
          select: {
            name: true
          },
          take: 3
        }
      }
    })

    return professionals;

  } catch (err) {
    return []
  }

}