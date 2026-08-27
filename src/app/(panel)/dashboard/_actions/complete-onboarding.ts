"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function completeOnboarding() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompletedAt: new Date() },
    })

    revalidatePath("/dashboard")
    return { data: true }

  } catch (err) {
    return { error: "Falha ao concluir onboarding" }
  }
}

export async function skipOnboarding() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingSkippedAt: new Date() },
    })

    revalidatePath("/dashboard")
    return { data: true }

  } catch (err) {
    return { error: "Falha ao pular onboarding" }
  }
}