"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface GetPatientsParams {
  search?: string
}

export async function getPatients({ search }: GetPatientsParams = {}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { data: [], error: "Usuário não encontrado" }
  }

  try {
    const patients = await prisma.patient.findMany({
      where: {
        userId: session.user.id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        appointments: {
          orderBy: { appointmentDate: "desc" },
          take: 1,
          select: { appointmentDate: true },
        },
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { name: "asc" },
    })

    const data = patients.map((patient) => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      totalAppointments: patient._count.appointments,
      lastVisit: patient.appointments[0]?.appointmentDate ?? null,
    }))

    return { data }

  } catch (err) {
    return { data: [], error: "Falha ao buscar pacientes" }
  }
}