"use client"

import { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Loader2, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { createNewAppointment } from '@/app/(public)/clinica/[id]/_actions/create-appointment'
import { isSlotInThePast, isToday, isSlotSequenceAvailable } from '@/app/(public)/clinica/[id]/_components/schedule-utils'
import { formatPhone } from '@/utils/formatPhone'
import { Service } from '@prisma/client'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  date: z.string().min(1, "A data é obrigatória"),
  serviceId: z.string().min(1, "Selecione um serviço"),
})

type FormData = z.infer<typeof formSchema>

interface DialogNewAppointmentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clinicId: string
  clinicTimes: string[]
  services: Service[]
  onSuccess?: () => void
  initialDate?: string
}

export function DialogNewAppointment({ open, onOpenChange, clinicId, clinicTimes, services, onSuccess, initialDate }: DialogNewAppointmentProps) {
  const queryClient = useQueryClient()
  const [selectedTime, setSelectedTime] = useState("")
  const [blockedTimes, setBlockedTimes] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", date: initialDate || format(new Date(), "yyyy-MM-dd"), serviceId: "" },
  })

  // Atualiza a data inicial caso o initialDate mude via props (e o modal for reaberto)
  useEffect(() => {
    if (initialDate && !open) {
      form.setValue("date", initialDate)
    }
  }, [initialDate, form, open])

  const selectedDate = form.watch("date")
  const selectedServiceId = form.watch("serviceId")

  const selectedService = services.find(s => s.id === selectedServiceId)
  const requiredSlots = selectedService ? Math.ceil(selectedService.duration / 30) : 1

  const fetchBlockedTimes = useCallback(async (dateStr: string): Promise<string[]> => {
    setLoadingSlots(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-appointments?userId=${clinicId}&date=${dateStr}`)
      const json = await response.json()
      return json as string[]
    } catch {
      return []
    } finally {
      setLoadingSlots(false)
    }
  }, [clinicId])

  useEffect(() => {
    if (selectedDate) {
      fetchBlockedTimes(selectedDate).then((blocked) => {
        setBlockedTimes(blocked)
        setSelectedTime("")
      })
    }
  }, [selectedDate, fetchBlockedTimes])

  function handleClose() {
    form.reset()
    setSelectedTime("")
    setBlockedTimes([])
    onOpenChange(false)
  }

  async function onSubmit(data: FormData) {
    if (!selectedTime) {
      toast.error("Selecione um horário para continuar.")
      return
    }
    setIsSubmitting(true)
    const response = await createNewAppointment({
      name: data.name,
      email: data.email,
      phone: data.phone,
      time: selectedTime,
      date: new Date(data.date + "T12:00:00"),
      serviceId: data.serviceId,
      clinicId,
    })
    setIsSubmitting(false)

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success("Agendamento criado com sucesso!")
    queryClient.invalidateQueries({ queryKey: ["get-appointments"] })
    onSuccess?.()
    handleClose()
  }

  const dateAsDate = selectedDate ? new Date(selectedDate + "T12:00:00") : null
  const dateIsToday = dateAsDate ? isToday(dateAsDate) : false

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do paciente e selecione um horário disponível.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
            {/* Dados do Paciente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maria Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(XX) XXXXX-XXXX"
                        {...field}
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="paciente@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={format(new Date(), "yyyy-MM-dd")}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setSelectedTime("")
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(v) => { field.onChange(v); setSelectedTime("") }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {(() => {
                                const duration = Number(s.duration);
                                const hours = Math.floor(duration / 60);
                                const minutes = duration % 60;

                                const formattedDuration =hours > 0
                                  ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`
                                  : `${minutes}min`;

                                return (
                                  <span>
                                    {s.name} - Duração: {formattedDuration}
                                  </span>
                                );
                              })()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seleção de Horários */}
            {selectedServiceId && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Horários disponíveis</span>
                  {selectedService && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {requiredSlots} slot{requiredSlots > 1 ? "s" : ""} necessário{requiredSlots > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="h-9 rounded-lg bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : clinicTimes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground bg-muted/50 rounded-xl border border-dashed">
                    <Clock className="w-6 h-6 mb-2 opacity-50" />
                    <p className="text-sm">Nenhum horário cadastrado na clínica.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-muted/30 rounded-xl border border-border">
                    {clinicTimes.map((time) => {
                      const isBlocked = blockedTimes.includes(time)
                      const sequenceOK = isSlotSequenceAvailable(time, requiredSlots, clinicTimes, blockedTimes)
                      const isPast = dateIsToday && isSlotInThePast(time)
                      const isEnabled = !isBlocked && sequenceOK && !isPast
                      const isSelected = selectedTime === time

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={!isEnabled}
                          onClick={() => isEnabled && setSelectedTime(time)}
                          className={cn(
                            "h-9 rounded-lg text-xs font-medium border transition-all",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                              : isEnabled
                                ? "bg-background border-border hover:border-primary hover:text-primary"
                                : "bg-muted/50 text-muted-foreground border-transparent cursor-not-allowed opacity-50"
                          )}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                )}

                {!selectedTime && selectedServiceId && (
                  <p className="text-xs text-muted-foreground pl-1">
                    Selecione um horário disponível para continuar.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedTime}
                className="min-w-32"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Agendamento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
