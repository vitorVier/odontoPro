// src/app/(panel)/dashboard/profile/_actions/update-schedule.ts
"use server"

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const formSchema = z.object({
  weekDays: z.array(z.number()).min(1),
  times: z.array(z.string()).min(1),
})

type FormSchema = z.infer<typeof formSchema>

export async function updateSchedule(formData: FormSchema) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return { error: schema.error.issues[0].message }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        weekDays: formData.weekDays,
        times: formData.times,
      },
    })

    revalidatePath("/dashboard/profile")
    return { data: "Horários atualizados!" }

  } catch (err) {
    return { error: "Falha ao atualizar horários" }
  }
}