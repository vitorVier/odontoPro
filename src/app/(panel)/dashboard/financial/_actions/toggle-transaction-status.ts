"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleTransactionStatus(transactionId: string) {
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

    const newStatus = transaction.status === "PAID" ? "PENDING" : "PAID"

    await prisma.financialTransaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus,
        paidAt: newStatus === "PAID" ? new Date() : null,
      },
    })

    revalidatePath("/dashboard/financial")
    return { data: newStatus === "PAID" ? "Marcado como pago!" : "Marcado como pendente." }

  } catch (err) {
    return { error: "Falha ao atualizar status" }
  }
}