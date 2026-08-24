"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteTransaction(transactionId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  try {
    const transaction = await prisma.financialTransaction.findFirst({
      where: { id: transactionId, userId: session.user.id },
    })

    if (!transaction) {
      return { error: "Lançamento não encontrado" }
    }

    await prisma.financialTransaction.delete({ where: { id: transactionId } })

    revalidatePath("/dashboard/financial")
    return { data: "Lançamento removido com sucesso!" }

  } catch (err) {
    return { error: "Falha ao remover lançamento" }
  }
}