"use server"

import prisma from "@/lib/prisma"
import { addDays, differenceInDays } from 'date-fns'
import { TRIAL_DAYS } from '@/utils/permissions/trial-limits'
import { isTrialActive } from "./isTrialActive"

export async function checkSubscription(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      subscription: true,
    }
  })

  if (!user) {
    throw new Error("Usuário nao encontrado")
  }

  if (user.subscription && user.subscription.status === 'active') {
    return {
      subscriptionStatus: "active",
      message: "Assinatura ativa.",
      planId: user.subscription.plan
    }
  }

  if (!isTrialActive(user.createdAt)) {
    return {
      subscriptionStatus: "EXPIRED",
      message: "Seu período de teste expirou.",
      planId: "TRIAL"
    }
  }

  const trialEndDate = addDays(user.createdAt, TRIAL_DAYS)
  const daysRemaining = differenceInDays(trialEndDate, new Date())

  const message = daysRemaining === 0 
    ? "Último dia para aproveitar." 
    : `Você está no período de teste gratuito. Faltam ${daysRemaining} dias.`

  return {
    subscriptionStatus: "TRIAL",
    message: message,
    planId: "TRIAL"
  }
}
