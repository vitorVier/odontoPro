"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getPermissionUserToFinancial } from "@/utils/permissions/get-permission-financial"

const formSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória"),
  amount: z.number().positive("O valor precisa ser maior que zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().optional(),
  dueDate: z.date(),
})

type FormSchema = z.infer<typeof formSchema>

export async function createTransaction(formData: FormSchema) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  // Trava de segurança no servidor — não depende só do front esconder a tela
  const hasPermission = await getPermissionUserToFinancial({ userId: session.user.id })
  if (!hasPermission) {
    return { error: "Recurso disponível apenas no plano Premium." }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return { error: schema.error.issues[0].message }
  }

  try {
    await prisma.financialTransaction.create({
      data: {
        userId: session.user.id,
        description: formData.description,
        amount: Math.round(formData.amount * 100), // reais -> centavos
        type: formData.type,
        category: formData.category || null,
        dueDate: formData.dueDate,
      },
    })

    revalidatePath("/dashboard/financial")
    return { data: "Lançamento criado com sucesso!" }

  } catch (err) {
    return { error: "Falha ao criar lançamento" }
  }
}