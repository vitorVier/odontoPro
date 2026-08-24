"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth, startOfDay } from "date-fns"

export async function getFinancialOverview(month: Date = new Date()) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const today = startOfDay(new Date())

  try {
    const [monthTransactions, overdue, upcoming] = await Promise.all([
      prisma.financialTransaction.findMany({
        where: { userId: session.user.id, dueDate: { gte: start, lte: end } },
      }),
      prisma.financialTransaction.findMany({
        where: {
          userId: session.user.id,
          status: "PENDING",
          dueDate: { lt: today },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.financialTransaction.findMany({
        where: {
          userId: session.user.id,
          status: "PENDING",
          dueDate: { gte: today },
        },
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
    ])

    const totalIncome = monthTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const totalExpense = monthTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
    const pendingIncome = monthTransactions.filter(t => t.type === "INCOME" && t.status === "PENDING").reduce((s, t) => s + t.amount, 0)
    const pendingExpense = monthTransactions.filter(t => t.type === "EXPENSE" && t.status === "PENDING").reduce((s, t) => s + t.amount, 0)

    return {
      data: {
        summary: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          pendingIncome,
          pendingExpense,
        },
        overdue: {
          count: overdue.length,
          amount: overdue.reduce((s, t) => s + t.amount, 0),
          items: overdue.slice(0, 5),
        },
        upcoming,
      },
    }
  } catch (err) {
    return { error: "Falha ao buscar visão geral financeira" }
  }
}