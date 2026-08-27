"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getPermissionUserToDentalRecord } from "@/utils/permissions/get-permission-dental-record"

const formSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  appointmentId: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export async function createClinicalRecord(formData: FormSchema) {
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
    return { error: schema.error.issues[0].message }
  }

  try {
    const patient = await prisma.patient.findFirst({
      where: { id: formData.patientId, userId: session.user.id },
    })

    if (!patient) {
      return { error: "Paciente não encontrado" }
    }

    await prisma.clinicalRecord.create({
      data: {
        patientId: formData.patientId,
        title: formData.title,
        description: formData.description,
        appointmentId: formData.appointmentId || null,
        userId: session.user.id,
      },
    })

    revalidatePath(`/dashboard/patients/${formData.patientId}`)
    return { data: "Registro adicionado ao prontuário!" }

  } catch (err) {
    return { error: "Falha ao criar registro clínico" }
  }
}