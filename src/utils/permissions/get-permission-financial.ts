"use server"

import prisma from "@/lib/prisma"
import { isTrialActive } from "./isTrialActive" 

interface GetPermissionFinancialParams {
  userId: string
}

export async function getPermissionUserToFinancial({ userId }: GetPermissionFinancialParams) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  })

  if (!user) return false

  // Assinatura Premium ativa
  if (user.subscription?.status === "active" && user.subscription.plan === "PREMIUM") {
    return true
  }

  // Ainda em trial — libera como prévia do recurso
  if (isTrialActive(user.createdAt)) {
    return true
  }

  return false
}