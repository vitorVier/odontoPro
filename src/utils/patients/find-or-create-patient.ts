import prisma from "@/lib/prisma"

interface FindOrCreatePatientParams {
  userId: string // id da clínica
  name: string
  email: string
  phone: string
}

export async function findOrCreatePatient({ userId, name, email, phone }: FindOrCreatePatientParams) {
  const patient = await prisma.patient.upsert({
    where: {
      userId_email: { userId, email },
    },
    update: {
      // Atualiza nome/telefone se o paciente reagendar com dado diferente
      // (ex: trocou de telefone) — mantém o cadastro sempre com o dado mais recente.
      name,
      phone,
    },
    create: {
      userId,
      name,
      email,
      phone,
    },
  })

  return patient
}