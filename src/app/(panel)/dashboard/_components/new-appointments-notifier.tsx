"use client"

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { updateLastDashboardVisit } from '../_actions/update-last-visit'
import { CalendarCheck } from 'lucide-react'

type NewAppointment = {
  id: string
  name: string
  time: string
  appointmentDate: Date
  createdAt: Date
}

interface NewAppointmentsNotifierProps {
  appointments: NewAppointment[]
  userId: string
}

export function NewAppointmentsNotifier({ appointments, userId }: NewAppointmentsNotifierProps) {
  const notifiedIdsRef = useRef<string>("")

  useEffect(() => {
    if (appointments.length === 0) return

    const currentIdsSignature = appointments.map(a => a.id).sort().join(",")

    if (notifiedIdsRef.current === currentIdsSignature) return
    notifiedIdsRef.current = currentIdsSignature

    // Notifica o servidor imediatamente para atualizar a última visita
    updateLastDashboardVisit(userId)

    const count = appointments.length

    toast.info(
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
          <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {count === 1
              ? '1 novo agendamento pelo site!'
              : `${count} novos agendamentos pelo site!`}
          </span>
        </div>
        <ul className="text-xs text-gray-600 space-y-1 pl-5 list-disc">
          {appointments.map((apt) => {
            const cleanedTime = apt.time.split(":").slice(0, 2).join(":")
            return (
              <li key={apt.id} className="marker:text-emerald-500">
                <span className="font-semibold text-gray-800">{apt.name}</span>
                {' — '}
                {format(new Date(apt.appointmentDate), "dd/MM", { locale: ptBR })}
                {' às '}
                <span className="font-semibold text-gray-800">{cleanedTime}</span>
              </li>
            )
          })}
        </ul>
      </div>,
      {
        duration: 8000,
        id: `new-appt-${currentIdsSignature}`, // Altera o ID se houver novas consultas, forçando um novo balão
        classNames: {
          toast: 'border-emerald-200 bg-emerald-50/90 backdrop-blur-md rounded-xl p-4 shadow-md',
        }
      }
    )
  }, [appointments, userId]) // MONITORAMENTO: Roda o efeito sempre que novos agendamentos chegarem

  return null
}
