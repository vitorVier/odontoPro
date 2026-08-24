"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { TransactionStatus, TransactionType } from "@prisma/client"

interface GetFinancialTransactionsParams {
  month?: Date
  type?: TransactionType
  status?: TransactionStatus
}

export async function getFinancialTransactions({ month, type, status }: GetFinancialTransactionsParams = {}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { data: [], summary: null, error: "Usuário não encontrado" }
  }

  try {
    const referenceMonth = month ?? new Date()
    const start = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), 1)
    const end = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth() + 1, 0, 23, 59, 59)

    const transactions = await prisma.financialTransaction.findMany({
      where: {
        userId: session.user.id,
        dueDate: { gte: start, lte: end },
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { dueDate: "asc" },
    })

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0)

    const pendingIncome = transactions
      .filter((t) => t.type === "INCOME" && t.status === "PENDING")
      .reduce((sum, t) => sum + t.amount, 0)

    const pendingExpense = transactions
      .filter((t) => t.type === "EXPENSE" && t.status === "PENDING")
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      data: transactions,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        pendingIncome,
        pendingExpense,
      },
    }

  } catch (err) {
    return { data: [], summary: null, error: "Falha ao buscar transações financeiras" }
  }
}