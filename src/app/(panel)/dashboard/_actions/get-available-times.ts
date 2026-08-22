"use server"

import prisma from "@/lib/prisma"
import { generateBlockedTimes } from "@/utils/appointments/occupiedSlots"

interface GetTimesProps {
    userId: string
    date: Date | string
}

export async function getAvailableTimes({ userId, date }: GetTimesProps) {
    try {
        const clinic = await prisma.user.findUnique({
            where: { id: userId },
            select: { times: true }
        })

        if (!clinic || !clinic.times) return { error: "Clínica não encontrada ou sem horários" }

        // Normalização de data baseada no dia cheio
        const startOfTargetDay = new Date(date)
        startOfTargetDay.setHours(0, 0, 0, 0)

        const endOfTargetDay = new Date(date)
        endOfTargetDay.setHours(23, 59, 59, 999)

        // Busca agendamentos do dia no Prisma
        const appointments = await prisma.appointment.findMany({
            where: {
                userId,
                appointmentDate: {
                    gte: startOfTargetDay,
                    lte: endOfTargetDay
                },
            },
            include: { service: true }
        })

        // Descobre bloqueios do utilitário
        const blockedTimes = generateBlockedTimes(appointments)

        // Filtra grade final
        const availableTimes = clinic.times.filter((hour) => {
            const cleanHour = hour.split(":").slice(0, 2).join(":")
            return !blockedTimes.has(cleanHour)
        })

        // RETORNO DE AUDITORIA: Vai expor tudo direto para o seu componente na tela
        return {
            __TEST_AUDIT__: true,
            dataRecebidaDoCalendario: String(date),
            intervaloPrismaInicio: startOfTargetDay.toISOString(),
            intervaloPrismaFim: endOfTargetDay.toISOString(),
            totalAgendamentosLocalizados: appointments.length,
            listaDeAgendamentos: appointments.map(a => ({
                nome: a.name,
                horarioBanco: a.time,
                duracaoMinutos: a.service?.duration ?? "NÃO ENCONTRADA"
            })),
            chavesBloqueadasGeradas: Array.from(blockedTimes),
            gradeLivreFinalEnviarParaCliente: availableTimes
        } as any

    } catch (error: any) {
        return { error: error.message } as any
    }
}
