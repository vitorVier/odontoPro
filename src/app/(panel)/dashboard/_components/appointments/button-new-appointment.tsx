"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { DialogNewAppointment } from './dialog-new-appointment'
import { Service } from '@prisma/client'

interface ButtonNewAppointmentProps {
  clinicId: string
  clinicTimes: string[]
  services: Service[]
}

export function ButtonNewAppointment({ clinicId, clinicTimes, services }: ButtonNewAppointmentProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
      >
        <Calendar className="w-4 h-4" />
        <span>Novo agendamento</span>
      </Button>

      <DialogNewAppointment
        open={open}
        onOpenChange={setOpen}
        clinicId={clinicId}
        clinicTimes={clinicTimes}
        services={services}
      />
    </>
  )
}
