"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths, subYears, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export async function getFinancialAnalytics(referenceMonth: Date = new Date()) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  try {
    const rangeStart = startOfMonth(subMonths(referenceMonth, 5))
    const rangeEnd = endOfMonth(referenceMonth)

    const transactions = await prisma.financialTransaction.findMany({
      where: { userId: session.user.id, dueDate: { gte: rangeStart, lte: rangeEnd } },
    })

    // Tendência dos últimos 6 meses
    const monthBuckets: Record<string, { income: number; expense: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const key = format(subMonths(referenceMonth, i), "yyyy-MM")
      monthBuckets[key] = { income: 0, expense: 0 }
    }

    transactions.forEach((t) => {
      const key = format(t.dueDate, "yyyy-MM")
      if (!monthBuckets[key]) return
      if (t.type === "INCOME") monthBuckets[key].income += t.amount
      else monthBuckets[key].expense += t.amount
    })

    const trend = Object.entries(monthBuckets).map(([key, values]) => ({
      month: format(new Date(`${key}-01T12:00:00`), "MMM", { locale: ptBR }),
      income: values.income / 100,
      expense: values.expense / 100,
    }))

    // Despesas por categoria (mês de referência)
    const currentMonthStart = startOfMonth(referenceMonth)
    const currentMonthEnd = endOfMonth(referenceMonth)

    const currentMonthTransactions = transactions.filter(
      (t) => t.dueDate >= currentMonthStart && t.dueDate <= currentMonthEnd
    )

    const categoryTotals: Record<string, number> = {}
    currentMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const key = t.category || "Outros"
        categoryTotals[key] = (categoryTotals[key] || 0) + t.amount
      })

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount: amount / 100 }))
      .sort((a, b) => b.amount - a.amount)

    // Comparativo mês atual vs mês anterior
    const previousMonthStart = startOfMonth(subMonths(referenceMonth, 1))
    const previousMonthEnd = endOfMonth(subMonths(referenceMonth, 1))

    const previousMonthTransactions = await prisma.financialTransaction.findMany({
      where: { userId: session.user.id, dueDate: { gte: previousMonthStart, lte: previousMonthEnd } },
    })

    const currentIncome = currentMonthTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const currentExpense = currentMonthTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
    const previousIncome = previousMonthTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const previousExpense = previousMonthTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

    const monthComparison = {
      currentIncome: currentIncome / 100,
      currentExpense: currentExpense / 100,
      previousIncome: previousIncome / 100,
      previousExpense: previousExpense / 100,
    }

    // Comparativo ano a ano — só entra se existir dado no mesmo mês do ano anterior
    const lastYearStart = startOfMonth(subYears(referenceMonth, 1))
    const lastYearEnd = endOfMonth(subYears(referenceMonth, 1))

    const lastYearTransactions = await prisma.financialTransaction.findMany({
      where: { userId: session.user.id, dueDate: { gte: lastYearStart, lte: lastYearEnd } },
    })

    const yoyComparison = lastYearTransactions.length > 0
      ? {
          currentIncome: currentIncome / 100,
          previousYearIncome: lastYearTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0) / 100,
          currentExpense: currentExpense / 100,
          previousYearExpense: lastYearTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0) / 100,
        }
      : null

    return { data: { trend, categoryBreakdown, monthComparison, yoyComparison } }

  } catch (err) {
    return { error: "Falha ao buscar análises financeiras" }
  }
}