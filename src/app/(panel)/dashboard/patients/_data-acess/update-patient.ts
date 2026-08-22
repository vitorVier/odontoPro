"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const formSchema = z.object({
  patientId: z.string().min(1),
  name: z.string().min(1, "O nome é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  birthDate: z.date().nullable().optional(),
  notes: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export async function updatePatient(formData: FormSchema) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return { error: "Preencha todos os campos corretamente" }
  }

  try {
    // Confere posse antes de atualizar — mesma lógica de segurança do get-patient-by-id
    const patient = await prisma.patient.findFirst({
      where: { id: formData.patientId, userId: session.user.id },
    })

    if (!patient) {
      return { error: "Paciente não encontrado" }
    }

    await prisma.patient.update({
      where: { id: formData.patientId },
      data: {
        name: formData.name,
        phone: formData.phone,
        birthDate: formData.birthDate ?? null,
        notes: formData.notes ?? "",
      },
    })

    revalidatePath(`/dashboard/patients/${formData.patientId}`)
    revalidatePath("/dashboard/patients")

    return { data: "Paciente atualizado com sucesso!" }

  } catch (err) {
    return { error: "Falha ao atualizar paciente" }
  }
}