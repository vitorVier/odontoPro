import { ScheduleBlock } from "@prisma/client"
import { isSameDay } from "date-fns"

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

/**
 * Verifica se um horário específico, em um dia específico, está bloqueado
 * por algum ScheduleBlock (folga, feriado, almoço, férias etc.)
 */
export function isSlotBlocked(date: Date, time: string, blocks: ScheduleBlock[] = []): boolean {
  const slotMinutes = timeToMinutes(time)

  return blocks.some((block) => {
    if (block.recurring) {
      // Recorrente: só importa se já começou a valer, e se o horário cai na janela bloqueada
      if (date < block.startDate) return false
    } else {
      // Range específico: precisa estar dentro do intervalo de dias
      const withinRange =
        date >= new Date(block.startDate.toDateString()) &&
        date <= new Date(block.endDate.toDateString())

      if (!withinRange) return false
    }

    // Sem horário definido = bloqueia o dia inteiro
    if (!block.startTime || !block.endTime) return true

    const blockStart = timeToMinutes(block.startTime)
    const blockEnd = timeToMinutes(block.endTime)

    return slotMinutes >= blockStart && slotMinutes < blockEnd
  })
}

/**
 * Verifica se o dia inteiro está bloqueado (sem horário específico) —
 * usado pra desabilitar o dia inteiro no calendário, sem precisar checar horário por horário.
 */
export function isDayFullyBlocked(date: Date, blocks: ScheduleBlock[]): boolean {
  return blocks.some((block) => {
    if (block.startTime || block.endTime) return false // bloqueio parcial não conta como dia cheio

    if (block.recurring) {
      return date >= block.startDate
    }

    return (
      date >= new Date(block.startDate.toDateString()) &&
      date <= new Date(block.endDate.toDateString())
    )
  })
}