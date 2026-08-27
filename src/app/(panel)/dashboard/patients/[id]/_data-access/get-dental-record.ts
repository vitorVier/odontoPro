"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getDentalRecord(patientId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  try {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, userId: session.user.id },
    })

    if (!patient) {
      return { error: "Paciente não encontrado" }
    }

    const [toothRecords, clinicalRecords] = await Promise.all([
      prisma.toothRecord.findMany({
        where: { patientId },
      }),
      prisma.clinicalRecord.findMany({
        where: { patientId },
        include: { appointment: { include: { service: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return { data: { toothRecords, clinicalRecords } }

  } catch (err) {
    return { error: "Falha ao buscar prontuário" }
  }
}