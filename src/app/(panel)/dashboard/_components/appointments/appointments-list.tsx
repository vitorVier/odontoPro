"use client"

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Prisma } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { X, Eye, Clock, AlertCircle, Plus } from 'lucide-react'
import { cancelAppointment } from '../../_actions/cancel-appointment'
import { toast } from 'sonner'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { DialogAppointment } from './dialog-appointment'
import { ButtonPickerAppointment } from './button-date'
import { DialogNewAppointment } from './dialog-new-appointment'
import { Service } from '@prisma/client'

export type AppointmentWithService = Prisma.AppointmentGetPayload<{
  include: {
    service: true,
  }
}>

interface AppointmentsListProps {
  times: string[]
  clinicId: string
  clinicTimes: string[]
  services: Service[]
}

export function AppointmentsList({ times, clinicId, clinicTimes, services }: AppointmentsListProps) {
  const searchParams = useSearchParams();
  const date = searchParams.get("date")
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<AppointmentWithService | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["get-appointments", date],
    queryFn: async () => {
      let activeDate = date || format(new Date(), "yyyy-MM-dd");
      const url = `${process.env.NEXT_PUBLIC_URL}/api/clinic/appointments?date=${activeDate}`

      const response = await fetch(url)
      if (!response.ok) return []

      return (await response.json()) as AppointmentWithService[];
    },
    staleTime: 20000,
    refetchInterval: 60000,
  })

  // Mapeia ocupação dos slots
  const occupantMap: Record<string, AppointmentWithService> = {}

  if (data && data.length > 0) {
    for (const appointment of data) {
      const requiredSlots = Math.ceil(appointment.service.duration / 30)

      const normalizedAppointmentTime = appointment.time.padStart(5, '0')
      const normalizedTimes = times.map((t) => t.padStart(5, '0'))

      const startIndex = normalizedTimes.indexOf(normalizedAppointmentTime)

      if (startIndex !== -1) {
        for (let i = 0; i < requiredSlots; i++) {
          const slotIndex = startIndex + i

          if (slotIndex < times.length) {
            occupantMap[times[slotIndex]] = appointment
          }
        }
      }
    }
  }

  async function handleCancelAppointment(appointmentId: string) {
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) return;

    const response = await cancelAppointment({ appointmentId })

    if (response.error) {
      toast.error(response.error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["get-appointments"] })
    await refetch()
    toast.success(response.data);
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className='flex flex-row items-center justify-between border-b border-gray-50 pb-4 mb-4 space-y-0'>
            <CardTitle className='text-xl font-bold text-gray-900'>
              Agenda do Dia
            </CardTitle>
            <div className="flex items-center gap-2">
              <ButtonPickerAppointment />
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setIsNewOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className='h-[calc(100vh-20rem)] lg:h-[calc(100vh-16rem)] pr-4'>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                  <p>Falha ao carregar agendamentos.</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {times.map((slot) => {
                    const occupant = occupantMap[slot];
                    const isStartOfAppointment = occupant?.time === slot;
                    const isContinuation = occupant && occupant.time !== slot;

                    // Renderização visual de slots continuados (evita repetir o card do paciente)
                    if (isContinuation) {
                      return (
                        <div key={slot} className='flex items-start py-1 relative group'>
                          <div className='w-16 text-[13px] font-medium text-gray-300 pt-1'>
                            {slot}
                          </div>
                          <div className='flex-1 ml-4 border-l-2 border-emerald-200/40 h-8' />
                        </div>
                      )
                    }

                    // Renderização de slot Ocupado (Início)
                    if (isStartOfAppointment) {
                      return (
                        <div
                          key={slot}
                          className='group flex items-center p-3 rounded-xl bg-white border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] transition-all hover:border-emerald-200 hover:shadow-md relative overflow-hidden before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-emerald-400 before:rounded-r-md'
                        >
                          <div className='w-16 text-sm font-bold text-gray-900 ml-1'>
                            {slot}
                          </div>

                          <div className='flex-1 flex flex-col justify-center min-w-0 px-2'>
                            <div className='font-semibold text-gray-900 truncate text-sm'>
                              {occupant.name}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-gray-500 truncate mt-0.5'>
                              <span>{occupant.phone}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span className="truncate">{occupant.service.name}</span>
                            </div>
                          </div>

                          <div className='flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0'>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                                onClick={() => setDetailAppointment(occupant)}
                                title="Visualizar Detalhes"
                              >
                                <Eye className='w-4 h-4' />
                              </Button>
                            </DialogTrigger>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => handleCancelAppointment(occupant.id)}
                              title="Cancelar Agendamento"
                            >
                              <X className='w-4 h-4' />
                            </Button>
                          </div>
                        </div>
                      )
                    }

                    // Renderização de slot Disponível
                    return (
                      <div
                        key={slot}
                        className='flex items-center py-2.5 px-3 rounded-xl border border-transparent hover:border-dashed hover:border-gray-200 hover:bg-gray-50/50 transition-all group'
                      >
                        <div className='w-16 text-sm font-medium text-gray-400 group-hover:text-emerald-600 transition-colors ml-1'>
                          {slot}
                        </div>
                        <div className='flex-1 flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-500 transition-colors'>
                          <Clock className="w-3.5 h-3.5" />
                          Disponível
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <DialogAppointment appointment={detailAppointment} />
      </Dialog>

      <DialogNewAppointment
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        clinicId={clinicId}
        clinicTimes={clinicTimes}
        services={services}
        onSuccess={refetch}
        initialDate={date || format(new Date(), "yyyy-MM-dd")}
      />
    </>
  )
}