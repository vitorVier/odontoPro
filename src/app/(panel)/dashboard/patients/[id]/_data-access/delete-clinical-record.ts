"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteClinicalRecord(recordId: string, patientId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" }
  }

  try {
    const record = await prisma.clinicalRecord.findFirst({
      where: { id: recordId, userId: session.user.id },
    })

    if (!record) {
      return { error: "Registro não encontrado" }
    }

    await prisma.clinicalRecord.delete({ where: { id: recordId } })

    revalidatePath(`/dashboard/patients/${patientId}`)
    return { data: "Registro removido." }

  } catch (err) {
    return { error: "Falha ao remover registro" }
  }
}