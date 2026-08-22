// Script para criar pacientes a partir dos agendamentos já existentes
// Rode: npx tsx scripts/backfill-patients.ts

import prisma from "../src/lib/prisma"

async function main() {
  console.log("Iniciando backfill de pacientes...")

  const appointments = await prisma.appointment.findMany({
    where: { patientId: null },
    orderBy: { createdAt: "asc" }, // mantém o registro mais antigo como "nome oficial" do paciente
  })

  console.log(`${appointments.length} agendamentos sem paciente vinculado.`)

  let created = 0
  let linked = 0

  for (const appointment of appointments) {
    const patient = await prisma.patient.upsert({
      where: {
        userId_email: {
          userId: appointment.userId,
          email: appointment.email,
        },
      },
      update: {}, // se já existe, não sobrescreve nome/telefone
      create: {
        userId: appointment.userId,
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
      },
    })

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { patientId: patient.id },
    })

    created++
    linked++
  }

  console.log(`Concluído. ${linked} agendamentos vinculados.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())