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

    // Agendamentos do mês atual com serviço
    const appointmentsThisMonth = await prisma.appointment.findMany({
      where: {
        userId,
        appointmentDate: { gte: startThisMonth, lte: endThisMonth },
      },
      include: { service: true },
    })

    // Agendamentos do mês anterior com serviço
    const appointmentsLastMonth = await prisma.appointment.findMany({
      where: {
        userId,
        appointmentDate: { gte: startLastMonth, lte: endLastMonth },
      },
      include: { service: true },
    })

    // Faturamento
    const revenueThisMonth = appointmentsThisMonth.reduce(
      (sum, a) => sum + (a.service?.price ?? 0),
      0
    )
    const revenueLastMonth = appointmentsLastMonth.reduce(
      (sum, a) => sum + (a.service?.price ?? 0),
      0
    )

    // Ticket médio
    const avgTicketThisMonth =
      appointmentsThisMonth.length > 0
        ? revenueThisMonth / appointmentsThisMonth.length
        : 0

    // Serviços mais agendados (top 5)
    const serviceCount: Record<string, { name: string; count: number; revenue: number }> = {}
    for (const a of appointmentsThisMonth) {
      if (!a.service) continue
      if (!serviceCount[a.serviceId]) {
        serviceCount[a.serviceId] = { name: a.service.name, count: 0, revenue: 0 }
      }
      serviceCount[a.serviceId].count++
      serviceCount[a.serviceId].revenue += a.service.price
    }
    const topServices = Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Agendamentos por dia da semana (mês atual)
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

    // Próximos agendamentos (futuro)
    const safePastDate = new Date();
    safePastDate.setDate(safePastDate.getDate() - 1); 
    safePastDate.setHours(0, 0, 0, 0); // Garante o início do dia anterior

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        userId,
        appointmentDate: { 
          gte: safePastDate
        },
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
