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
    staleTime: 0,
    refetchInterval: 60000,
    refetchOnWindowFocus: true
  })

  // Mapeia ocupação dos slots
  const occupantMap: Record<string, AppointmentWithService> = {}
  if (data && data.length > 0) {
    for (const appointment of data) {
      // CORREÇÃO: Se a duração for 0, nula ou undefined, assume 30 minutos (1 slot)
      const duration = appointment.service?.duration && appointment.service.duration > 0
        ? appointment.service.duration
        : 30;

      const requiredSlots = Math.ceil(duration / 30)

      const cleanedTime = appointment.time.split(":").slice(0, 2).join(":")
      const normalizedAppointmentTime = cleanedTime.padStart(5, '0')
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
        <Card className="border border-border/50 bg-card shadow-xs transition-all hover:shadow-md duration-300">
          {/* Cabeçalho Padronizado com os outros componentes */}
          <CardHeader className='flex flex-row items-center justify-between border-b border-border/30 pb-4 mb-4 space-y-0'>
            <div className="space-y-0.5">
              <CardTitle className='text-sm font-bold tracking-tight text-foreground'>
                Agenda do Dia
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Grade cronológica de atendimentos de cadeira
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ButtonPickerAppointment />
              <Button
                size="sm"
                type="button"
                className="gap-1.5 font-semibold text-xs uppercase tracking-wider h-8"
                onClick={() => setIsNewOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Novo</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <ScrollArea className='h-[calc(100vh-25rem)] lg:h-[calc(100vh-22rem)] pr-4'>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-16 w-full rounded-xl bg-muted/60 animate-pulse" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                  <p className="text-xs">Falha ao carregar agendamentos.</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {times.map((slot) => {
                    const occupant = occupantMap[slot];
                    const occupantTime = occupant?.time ? occupant.time.split(":").slice(0, 2).join(":") : "";

                    const isContinuation = !!(occupant && occupantTime !== slot);
                    const isStartOfAppointment = !!(occupant && occupantTime === slot);

                    if (isContinuation && occupant) {
                      return (
                        <div key={slot} className='flex items-center py-1.5 px-3 relative group select-none'>
                          <div className='w-16 text-xs font-bold text-muted-foreground/40'>
                            {slot}
                          </div>
                          <div className='flex-1 ml-4 border-l-2 border-primary/30 h-7 flex items-center pl-3 text-xs text-muted-foreground/50 italic font-medium bg-muted/5 rounded-r-md'>
                            Procedimento em andamento... ({occupant.name})
                          </div>
                        </div>
                      );
                    }

                    // 2. Renderização de slot Ocupado (Início do procedimento)
                    if (isStartOfAppointment && occupant) {
                      return (
                        <div
                          key={slot}
                          className='group flex items-center p-3 rounded-xl bg-card border border-border/50 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.01)] transition-all hover:border-primary/40 hover:shadow-xs relative overflow-hidden before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-primary before:rounded-r-md'
                        >
                          <div className='w-16 text-sm font-extrabold text-foreground ml-1'>
                            {slot}
                          </div>

                          <div className='flex-1 flex flex-col justify-center min-w-0 px-2 space-y-0.5'>
                            <div className='font-bold text-foreground truncate text-sm group-hover:text-primary transition-colors'>
                              {occupant.name}
                            </div>
                            <div className='flex items-center gap-1.5 text-xs text-muted-foreground truncate pl-0.5'>
                              <span className="font-medium">{occupant.phone}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="truncate bg-muted px-1.5 py-0.5 rounded text-[11px] font-semibold text-muted-foreground">{occupant.service?.name}</span>
                            </div>
                          </div>

                          {/* Ações do Registro (type="button" impede submits fantasmas) */}
                          <div className='flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150 shrink-0 bg-background/80 backdrop-blur-xs rounded-lg p-0.5 border border-border/30 shadow-xs'>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-muted"
                                onClick={() => setDetailAppointment(occupant)}
                                title="Visualizar Detalhes"
                              >
                                <Eye className='w-3.5 h-3.5' />
                              </Button>
                            </DialogTrigger>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                              onClick={() => handleCancelAppointment(occupant.id)}
                              title="Cancelar Agendamento"
                            >
                              <X className='w-3.5 h-3.5' />
                            </Button>
                          </div>
                        </div>
                      )
                    }

                    // 3. Renderização de slot Disponível (Vago)
                    return (
                      <div
                        key={slot}
                        className='flex items-center py-2.5 px-3 rounded-xl border border-transparent hover:border-dashed hover:border-border/60 hover:bg-muted/30 transition-all group'
                      >
                        <div className='w-16 text-xs font-bold text-muted-foreground/50 group-hover:text-primary transition-colors ml-1'>
                          {slot}
                        </div>
                        <div className='flex-1 flex items-center gap-2 text-xs font-medium text-muted-foreground/50 group-hover:text-muted-foreground transition-colors'>
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/70 transition-colors" />
                          <span>Horário livre</span>
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