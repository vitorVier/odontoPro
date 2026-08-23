import prisma from "@/lib/prisma"
import { sendEmail } from "./email"
import { sendWhatsAppTemplate } from "./whatsapp"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AppointmentWithService } from "@/app/(panel)/dashboard/_components/appointments/appointments-list"

interface SendConfirmationParams {
  appointment: AppointmentWithService
  clinicName: string
  clinicPhone: string | null
}

export async function sendAppointmentConfirmation({
  appointment,
  clinicName,
  clinicPhone,
}: SendConfirmationParams) {
  const formattedDate = format(appointment.appointmentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #059669;">Consulta confirmada! ✅</h2>
      <p>Olá, ${appointment.name}!</p>
      <p>Sua consulta com <strong>${clinicName}</strong> foi agendada com sucesso.</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Procedimento:</strong> ${appointment.service?.name ?? "Consulta"}</p>
        <p style="margin: 4px 0;"><strong>Data:</strong> ${formattedDate}</p>
        <p style="margin: 4px 0;"><strong>Horário:</strong> ${appointment.time}</p>
      </div>
      ${clinicPhone ? `<p style="color: #6b7280; font-size: 13px;">Precisa cancelar ou remarcar? Entre em contato pelo telefone ${clinicPhone}.</p>` : ""}
    </div>
  `

  const [emailResult, whatsappResult] = await Promise.allSettled([
    sendEmail({
      to: appointment.email,
      subject: `Consulta confirmada — ${clinicName}`,
      html: emailHtml,
    }),
    appointment.phone
      ? sendWhatsAppTemplate({
          phone: appointment.phone,
          templateName: "appointment_confirmation",
          params: [appointment.name, clinicName, formattedDate, appointment.time],
        })
      : Promise.resolve({ success: false }),
  ])

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { confirmationSentAt: new Date() },
  })

  return { emailResult, whatsappResult }
}