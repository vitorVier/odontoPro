"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getPermissionUserToDentalRecord } from "@/utils/permissions/get-permission-dental-record"

const formSchema = z.object({
  patientId: z.string().min(1),
  toothNumber: z.number().int().min(11).max(48),
  condition: z.enum(["HEALTHY", "CAVITY", "RESTORED", "ROOT_CANAL", "CROWN", "EXTRACTED", "MISSING", "IMPLANT"]),
  notes: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export async function updateToothRecord(formData: FormSchema) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  const hasPermission = await getPermissionUserToDentalRecord({ userId: session.user.id })
  if (!hasPermission) {
    return { error: "Recurso disponível a partir do plano Professional." }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return { error: "Dados inválidos" }
  }

  try {
    const patient = await prisma.patient.findFirst({
      where: { id: formData.patientId, userId: session.user.id },
    })

    if (!patient) {
      return { error: "Paciente não encontrado" }
    }

    await prisma.toothRecord.upsert({
      where: {
        patientId_toothNumber: {
          patientId: formData.patientId,
          toothNumber: formData.toothNumber,
        },
      },
      update: {
        condition: formData.condition,
        notes: formData.notes,
      },
      create: {
        patientId: formData.patientId,
        toothNumber: formData.toothNumber,
        condition: formData.condition,
        notes: formData.notes,
      },
    })

    revalidatePath(`/dashboard/patients/${formData.patientId}`)
    return { data: "Dente atualizado com sucesso!" }

  } catch (err) {
    return { error: "Falha ao atualizar dente" }
  }
}