"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteScheduleBlock(blockId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  try {
    // Confere posse antes de excluir — mesmo cuidado do update-patient.ts
    const block = await prisma.scheduleBlock.findFirst({
      where: { id: blockId, userId: session.user.id },
    })

    if (!block) {
      return { error: "Bloqueio não encontrado" }
    }

    await prisma.scheduleBlock.delete({ where: { id: blockId } })

    revalidatePath("/dashboard/agenda")

    return { data: "Bloqueio removido com sucesso!" }

  } catch (err) {
    return { error: "Falha ao remover bloqueio" }
  }
}