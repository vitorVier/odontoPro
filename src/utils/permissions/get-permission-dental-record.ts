"use server"

import prisma from "@/lib/prisma"
import { isTrialActive } from "./isTrialActive" 

export async function getPermissionUserToDentalRecord({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  })

  if (!user) return false

  if (user.subscription?.status === "active" &&
      (user.subscription.plan === "PROFESSIONAL" || user.subscription.plan === "PREMIUM")) {
    return true
  }

  if (isTrialActive(user.createdAt)) {
    return true
  }

  return false
}