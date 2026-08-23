import prisma from "@/lib/prisma"
import { NextResponse, NextRequest } from 'next/server'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { sendEmail } from "@/lib/notifications/email"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const tomorrow = addDays(new Date(), 1)
  const start = startOfDay(tomorrow)
  const end = endOfDay(tomorrow)

  const appointments = await prisma.appointment.findMany({
    where: {
      appointmentDate: { gte: start, lte: end },
      reminderSentAt: null,
    },
    include: {
      service: true,
      user: { select: { name: true, phone: true } },
    },
  })

  let sent = 0

  for (const appointment of appointments) {
    const formattedDate = format(appointment.appointmentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
    const clinicName = appointment.user.name ?? "sua clínica"

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #d97706;">Lembrete de consulta 🔔</h2>
        <p>Olá, ${appointment.name}!</p>
        <p>Você tem uma consulta amanhã com <strong>${clinicName}</strong>.</p>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Procedimento:</strong> ${appointment.service?.name ?? "Consulta"}</p>
          <p style="margin: 4px 0;"><strong>Data:</strong> ${formattedDate}</p>
          <p style="margin: 4px 0;"><strong>Horário:</strong> ${appointment.time}</p>
        </div>
      </div>
    `

    const whatsappMessage =
      `🔔 *Lembrete de consulta*\n\n` +
      `Olá, ${appointment.name}!\n` +
      `Você tem consulta amanhã com *${clinicName}*.\n\n` +
      `📋 ${appointment.service?.name ?? "Consulta"}\n` +
      `📅 ${formattedDate}\n` +
      `🕐 ${appointment.time}`

    await Promise.allSettled([
      sendEmail({ to: appointment.email, subject: `Lembrete: consulta amanhã — ${clinicName}`, html: emailHtml })
    ])

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { reminderSentAt: new Date() },
    })

    sent++
  }

  return NextResponse.json({ success: true, remindersSent: sent })
}