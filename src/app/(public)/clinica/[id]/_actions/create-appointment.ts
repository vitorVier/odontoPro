"use server"

import prisma from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { headers } from 'next/headers'
import { subMinutes } from 'date-fns'
import { auth } from '@/lib/auth'
import { findOrCreatePatient } from '@/utils/patients/find-or-create-patient'
import { sendAppointmentConfirmation } from '@/lib/notifications/send-appointment-confirmation'

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("O email é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  date: z.date(),
  serviceId: z.string().min(1, "O serviço é obrigatório"),
  time: z.string().min(1, "O horário é obrigatório"),
  clinicId: z.string().min(1, "O horário é obrigatório"),
  turnstileToken: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  })
  const data = await res.json()
  return data.success === true
}

async function isRateLimited(ip: string): Promise<boolean> {
  const count = await prisma.appointment.count({
    where: {
      ipAddress: ip,
      createdAt: { gte: subMinutes(new Date(), 10) },
    },
  })
  return count >= 3
}

export async function createNewAppointment(formData: FormSchema) {
  const schema = formSchema.safeParse(formData)

  if (!schema.success) {
    return { error: schema.error.issues[0].message }
  }

  // Contexto confiável: dentista logado agendando pra própria clínica dele.
  const session = await auth()
  const isTrustedDashboardContext = session?.user?.id === formData.clinicId

  let ip = "unknown"

  if (!isTrustedDashboardContext) {
    // Fluxo público: exige CAPTCHA + rate limit
    if (!formData.turnstileToken) {
      return { error: "Verificação de segurança obrigatória." }
    }

    const isHuman = await verifyTurnstile(formData.turnstileToken)
    if (!isHuman) {
      return { error: "Falha na verificação de segurança. Tente novamente." }
    }

    ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

    if (await isRateLimited(ip)) {
      return { error: "Muitas tentativas de agendamento detectadas. Aguarde alguns minutos e tente novamente." }
    }
  }

  try {
    const selectedDate = new Date(formData.date)
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const day = selectedDate.getDate()
    const appointmentDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))

    const service = await prisma.service.findUnique({ where: { id: formData.serviceId } })
    if (!service) {
      return { error: "Serviço não encontrado" }
    }

    const newStart = timeToMinutes(formData.time)
    const newEnd = newStart + (service.duration || 30)

    const dayAppointments = await prisma.appointment.findMany({
      where: { userId: formData.clinicId, appointmentDate },
      include: { service: true },
    })

    const hasConflict = dayAppointments.some((appt) => {
      const existingStart = timeToMinutes(appt.time)
      const existingEnd = existingStart + (appt.service?.duration || 30)
      return newStart < existingEnd && existingStart < newEnd
    })

    if (hasConflict) {
      return { error: "Este horário acabou de ser reservado. Escolha outro horário." }
    }

    const patient = await findOrCreatePatient({
      userId: formData.clinicId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });

    const newAppointment = await prisma.appointment.create({
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        time: formData.time,
        appointmentDate,
        serviceId: formData.serviceId,
        userId: formData.clinicId,
        patientId: patient.id,
        source: isTrustedDashboardContext ? "DENTIST" : "PATIENT",
        ipAddress: isTrustedDashboardContext ? null : ip,
      },
    })

    const appointmentWithService = await prisma.appointment.findUnique({
      where: { id: newAppointment.id },
      include: { service: true },
    })

    const clinic = await prisma.user.findUnique({
      where: { id: formData.clinicId },
      select: { name: true, phone: true },
    })

    if (appointmentWithService && clinic) {
      sendAppointmentConfirmation({
        appointment: appointmentWithService,
        clinicName: clinic.name ?? "sua clínica",
        clinicPhone: clinic.phone,
      }).catch((err) => console.error("Falha ao enviar confirmação:", err))
    }

    revalidatePath("/dashboard")
    return { data: newAppointment }

  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Este horário acabou de ser reservado. Escolha outro horário." }
    }
    return { error: "Erro ao cadastrar agendamento" }
  }
}