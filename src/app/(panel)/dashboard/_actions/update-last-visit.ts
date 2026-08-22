"use server"

import prisma from '@/lib/prisma'

export async function updateLastDashboardVisit(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastDashboardVisitAt: new Date() }
  })
}
