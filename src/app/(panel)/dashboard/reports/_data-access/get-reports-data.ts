"use server"

import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export async function getReportsData({ userId }: { userId: string }) {
  if (!userId) return null

  try {
    const now = new Date()
    const startThisMonth = startOfMonth(now)
    const endThisMonth = endOfMonth(now)
    const startLastMonth = startOfMonth(subMonths(now, 1))
    const endLastMonth = endOfMonth(subMonths(now, 1))

    // Todos os agendamentos do mês (para métricas de VOLUME: quantidade, dia da semana)
    const appointmentsThisMonth = await prisma.appointment.findMany({
      where: {
        userId,
        appointmentDate: { gte: startThisMonth, lte: endThisMonth },
      },
      include: { service: true },
    })

    const appointmentsLastMonth = await prisma.appointment.findMany({
      where: {
        userId,
        appointmentDate: { gte: startLastMonth, lte: endLastMonth },
      },
      include: { service: true },
    })

    // Só consultas com baixa confirmada contam como FATURAMENTO real.
    // Faltas e cancelamentos nunca geraram receita, mesmo estando registradas na agenda.
    const completedThisMonth = appointmentsThisMonth.filter((a) => a.status === "COMPLETED")
    const completedLastMonth = appointmentsLastMonth.filter((a) => a.status === "COMPLETED")

    // Faturamento
    const revenueThisMonth = completedThisMonth.reduce(
      (sum, a) => sum + (a.service?.price ?? 0),
      0
    )
    const revenueLastMonth = completedLastMonth.reduce(
      (sum, a) => sum + (a.service?.price ?? 0),
      0
    )

    // Ticket médio — também só sobre consultas concluídas, senão o "médio" fica
    // inflado por agendamentos que nunca geraram receita.
    const avgTicketThisMonth =
      completedThisMonth.length > 0
        ? revenueThisMonth / completedThisMonth.length
        : 0

    // Serviços mais agendados (top 5) — contagem por volume (todos os status),
    // mas receita do serviço só soma o que foi de fato concluído.
    const serviceCount: Record<string, { name: string; count: number; revenue: number }> = {}
    for (const a of appointmentsThisMonth) {
      if (!a.service) continue
      if (!serviceCount[a.serviceId]) {
        serviceCount[a.serviceId] = { name: a.service.name, count: 0, revenue: 0 }
      }
      serviceCount[a.serviceId].count++
      if (a.status === "COMPLETED") {
        serviceCount[a.serviceId].revenue += a.service.price
      }
    }
    const topServices = Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Agendamentos por dia da semana (mês atual) — volume, todos os status
    const byWeekday = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      count: appointmentsThisMonth.filter(
        (a) => new Date(a.appointmentDate).getDay() === day
      ).length,
    }))

    // Agendamentos dos últimos 6 meses (para gráfico de tendência)
    const last6Months = await Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const d = subMonths(now, 5 - i)
        const count = await prisma.appointment.count({
          where: {
            userId,
            appointmentDate: { gte: startOfMonth(d), lte: endOfMonth(d) },
          },
        })
        const appts = await prisma.appointment.findMany({
          where: {
            userId,
            appointmentDate: { gte: startOfMonth(d), lte: endOfMonth(d) },
            status: "COMPLETED", // receita do gráfico de tendência também só conta consultas concluídas
          },
          include: { service: true },
        })
        const revenue = appts.reduce((s, a) => s + (a.service?.price ?? 0), 0)
        return {
          month: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
          count,
          revenue,
        }
      })
    )

    // Serviços ativos
    const activeServices = await prisma.service.count({
      where: { userId, status: true },
    })

    // Próximos agendamentos (futuro) — só agendados, não faz sentido mostrar
    // aqui algo já concluído/cancelado
    const safePastDate = new Date();
    safePastDate.setDate(safePastDate.getDate() - 1); 
    safePastDate.setHours(0, 0, 0, 0);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        userId,
        appointmentDate: { 
          gte: safePastDate
        },
        status: "SCHEDULED",
      },
      include: { service: true },
      orderBy: { appointmentDate: "asc" },
      take: 5,
    });

    return {
      appointmentsThisMonth: appointmentsThisMonth.length,
      appointmentsLastMonth: appointmentsLastMonth.length,
      revenueThisMonth,
      revenueLastMonth,
      avgTicketThisMonth,
      topServices,
      byWeekday,
      last6Months,
      activeServices,
      upcomingAppointments: upcomingAppointments,
    }
  } catch (err) {
    console.error("Erro ao buscar dados de relatório:", err)
    return null
  }
}