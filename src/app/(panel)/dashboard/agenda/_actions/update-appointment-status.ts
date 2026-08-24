"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const formSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.enum(["SCHEDULED", "COMPLETED", "NO_SHOW", "CANCELED"]),
})

type FormSchema = z.infer<typeof formSchema>

export async function updateAppointmentStatus(formData: FormSchema) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return { error: "Dados inválidos" }
  }

  try {
    // Confere posse antes de alterar — mesmo padrão de segurança já usado em pacientes e bloqueios
    const appointment = await prisma.appointment.findFirst({
      where: { id: formData.appointmentId, userId: session.user.id },
    })

    if (!appointment) {
      return { error: "Agendamento não encontrado" }
    }

    await prisma.appointment.update({
      where: { id: formData.appointmentId },
      data: { status: formData.status },
    })

    revalidatePath("/dashboard/agenda")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/financial")

    const labels = {
      COMPLETED: "Consulta marcada como concluída!",
      NO_SHOW: "Marcado como falta.",
      CANCELED: "Consulta cancelada.",
      SCHEDULED: "Consulta voltou para agendada.",
    }

    return { data: labels[formData.status] }

  } catch (err) {
    return { error: "Falha ao atualizar status do agendamento" }
  }
}