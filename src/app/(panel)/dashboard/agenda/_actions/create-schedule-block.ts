"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const formSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  recurring: z.boolean().default(false),
  reason: z.string().optional(),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: "A data final não pode ser antes da data inicial", path: ["endDate"] }
).refine(
  (data) => {
    if (!data.startTime || !data.endTime) return true
    return data.endTime > data.startTime
  },
  { message: "O horário final precisa ser depois do horário inicial", path: ["endTime"] }
)

type FormSchema = z.infer<typeof formSchema>

export async function createScheduleBlock(formData: FormSchema) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return { error: schema.error.issues[0].message }
  }

  try {
    await prisma.scheduleBlock.create({
      data: {
        userId: session.user.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        recurring: formData.recurring,
        reason: formData.reason || null,
      },
    })

    revalidatePath("/dashboard/agenda")

    return { data: "Bloqueio criado com sucesso!" }

  } catch (err) {
    return { error: "Falha ao criar bloqueio" }
  }
}