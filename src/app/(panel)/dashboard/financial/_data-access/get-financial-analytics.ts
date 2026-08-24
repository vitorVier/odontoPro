"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths, subYears, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getAppointmentRevenue } from "../../_data-access/get-appointment-revenue" 

export async function getFinancialAnalytics(referenceMonth: Date = new Date()) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  const userId = session.user.id

  try {
    const rangeStart = startOfMonth(subMonths(referenceMonth, 5))
    const rangeEnd = endOfMonth(referenceMonth)

    const transactions = await prisma.financialTransaction.findMany({
      where: { userId, dueDate: { gte: rangeStart, lte: rangeEnd } },
    })

    const appointments = await prisma.appointment.findMany({
      where: {
        userId,
        appointmentDate: { gte: rangeStart, lte: rangeEnd },
        status: "COMPLETED", // tendência de receita só considera consultas com baixa confirmada
      },
      include: { service: true },
    })

    // Tendência dos últimos 6 meses (manual + agendamentos concluídos)
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

    appointments.forEach((a) => {
      const key = format(a.appointmentDate, "yyyy-MM")
      if (!monthBuckets[key]) return
      monthBuckets[key].income += a.service?.price ?? 0
    })

    const trend = Object.entries(monthBuckets).map(([key, values]) => ({
      month: format(new Date(`${key}-01T12:00:00`), "MMM", { locale: ptBR }),
      income: values.income / 100,
      expense: values.expense / 100,
    }))

    // Despesas por categoria — permanece só manual (agendamento não tem categoria)
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

    // Comparativo mês atual vs mês anterior (manual + agendamentos)
    const previousMonthStart = startOfMonth(subMonths(referenceMonth, 1))
    const previousMonthEnd = endOfMonth(subMonths(referenceMonth, 1))

    const [previousMonthTransactions, currentAppointmentRevenue, previousAppointmentRevenue] = await Promise.all([
      prisma.financialTransaction.findMany({
        where: { userId, dueDate: { gte: previousMonthStart, lte: previousMonthEnd } },
      }),
      getAppointmentRevenue({ userId, start: currentMonthStart, end: currentMonthEnd }),
      getAppointmentRevenue({ userId, start: previousMonthStart, end: previousMonthEnd }),
    ])

    const currentManualIncome = currentMonthTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const currentExpense = currentMonthTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
    const previousManualIncome = previousMonthTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const previousExpense = previousMonthTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

    const currentIncome = currentManualIncome + currentAppointmentRevenue.confirmed
    const previousIncome = previousManualIncome + previousAppointmentRevenue.confirmed

    const monthComparison = {
      currentIncome: currentIncome / 100,
      currentExpense: currentExpense / 100,
      previousIncome: previousIncome / 100,
      previousExpense: previousExpense / 100,
    }

    // Comparativo ano a ano
    const lastYearStart = startOfMonth(subYears(referenceMonth, 1))
    const lastYearEnd = endOfMonth(subYears(referenceMonth, 1))

    const [lastYearTransactions, lastYearAppointmentRevenue] = await Promise.all([
      prisma.financialTransaction.findMany({
        where: { userId, dueDate: { gte: lastYearStart, lte: lastYearEnd } },
      }),
      getAppointmentRevenue({ userId, start: lastYearStart, end: lastYearEnd }),
    ])

    const yoyComparison = (lastYearTransactions.length > 0 || lastYearAppointmentRevenue.confirmed > 0)
      ? {
          currentIncome: currentIncome / 100,
          previousYearIncome: (lastYearTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0) + lastYearAppointmentRevenue.confirmed) / 100,
          currentExpense: currentExpense / 100,
          previousYearExpense: lastYearTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0) / 100,
        }
      : null

    return { data: { trend, categoryBreakdown, monthComparison, yoyComparison } }

  } catch (err) {
    return { error: "Falha ao buscar análises financeiras" }
  }
}