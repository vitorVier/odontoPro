"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getPatientById(patientId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { data: null, error: "Usuário não encontrado" }
  }

  try {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: session.user.id, // garante que a clínica só vê pacientes dela
      },
      include: {
        appointments: {
          include: { service: true },
          orderBy: { appointmentDate: "desc" },
        },
      },
    })

    if (!patient) {
      return { data: null, error: "Paciente não encontrado" }
    }

    const now = new Date()
    const upcomingAppointments = patient.appointments.filter(
      (a) => a.appointmentDate >= now
    )
    const pastAppointments = patient.appointments.filter(
      (a) => a.appointmentDate < now
    )

    return {
      data: {
        ...patient,
        upcomingAppointments,
        pastAppointments,
      },
    }

  } catch (err) {
    return { data: null, error: "Falha ao buscar paciente" }
  }
}