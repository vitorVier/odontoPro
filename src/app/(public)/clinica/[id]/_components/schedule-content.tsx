"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

import {
  MapPin,
  User,
  Phone,
  Mail,
  CalendarDays,
  Clock,
  Loader2,
  Calendar,
} from "lucide-react"

import { Prisma } from "@prisma/client"
import { useWatch } from "react-hook-form"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Calendar as CalendarComponent } from "@/components/ui/calendar"

import { Turnstile } from "@marsidev/react-turnstile"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { formatPhone } from "@/utils/formatPhone"

import {
  useAppointmentForm,
  AppointmentFormData,
} from "./schedule-form"

import { ScheduleTimeList } from "./schedule-time-list"
import { createNewAppointment } from "../_actions/create-appointment"

import { toast } from "sonner"

import imgTest from "../../../../../../public/foto1.png"
import Link from "next/link"

type UserWithServiceAndSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true
    services: true
  }
}>

interface ScheduleContentProps {
  clinic: UserWithServiceAndSubscription
}

export interface TimeSlot {
  time: string
  available: boolean
}

export function ScheduleContent({ clinic }: ScheduleContentProps) {
  const form = useAppointmentForm()

  const [
    selectedDate,
    selectedServiceId,
    selectedTime,
    watchedName,
    watchedEmail,
    watchedPhone,
  ] = useWatch({
    control: form.control,
    name: [
      "date",
      "serviceId",
      "time",
      "name",
      "email",
      "phone",
    ],
  })

  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [blockedTimes, setBlockedTimes] = useState<string[]>([])

  const selectedDateString = selectedDate
    ? `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(
        selectedDate.getDate()
      ).padStart(2, "0")}`
    : null

  const selectedService = clinic.services.find(
    (service) => service.id === selectedServiceId
  )

  const isFormFilled = Boolean(
    selectedDate &&
      selectedServiceId &&
      selectedTime &&
      watchedName &&
      watchedEmail &&
      watchedPhone
  )

  useEffect(() => {
    if (!selectedDateString) {
      setAvailableTimeSlots([])
      return
    }

    let cancelled = false
    setLoadingSlots(true)

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-appointments?userId=${clinic.id}&date=${selectedDateString}`)
        .then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-blocked-slots?userId=${clinic.id}&date=${selectedDateString}`)
        .then((r) => r.json()),
    ])
      .then(([occupiedTimes, blockedByScheduleBlocks]) => {
        if (cancelled) return

        const safeOccupied = Array.isArray(occupiedTimes) ? occupiedTimes : []
        const safeBlocked = Array.isArray(blockedByScheduleBlocks) ? blockedByScheduleBlocks : []

        // Une os dois motivos de indisponibilidade num único array,
        // pro componente de seleção de horário não precisar saber a diferença.
        const allUnavailable = [...new Set([...safeOccupied, ...safeBlocked])]

        setBlockedTimes(allUnavailable)

        setAvailableTimeSlots(
          (clinic.times || []).map((time) => ({
            time,
            available: !allUnavailable.includes(time),
          }))
        )

        form.setValue("time", "")
        form.clearErrors("time")
      })
      .catch(() => {
        if (cancelled) return

        setBlockedTimes([])
        setAvailableTimeSlots(
          (clinic.times || []).map((time) => ({ time, available: true }))
        )
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedDateString, clinic.id, clinic.times, form])

  async function handleRegisterAppointment(
    formData: AppointmentFormData
  ) {
    setIsSubmitting(true)

    const response = await createNewAppointment({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      time: formData.time,
      date: formData.date,
      serviceId: formData.serviceId,
      clinicId: clinic.id,
      turnstileToken: formData.turnstileToken,
    })

    if (response.error) {
      toast.error(response.error)
      setIsSubmitting(false)
      return
    }

    toast.success("Consulta agendada com sucesso!")

    form.reset()
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-muted/30 pb-12">
      {/* Header / identificação da clínica */}
      <div className="h-28 md:h-36 bg-linear-to-r from-emerald-600 to-emerald-500" />

      <section className="relative mx-auto w-full max-w-3xl px-4 -mt-14 md:-mt-16">

        {/* Clínica */}
        <Card className="border-border/50 shadow-sm bg-card">
          <CardContent className="flex flex-col items-center px-5 py-5 md:py-6">

            <div className="relative w-24 h-24 md:w-28 md:h-28 -mt-14 md:-mt-16 mb-4 rounded-full overflow-hidden border-4 border-card bg-muted shadow-sm">
              <Image
                src={
                  typeof clinic.image === "string"
                    ? clinic.image
                        .replace(/=s\d+-c/, "=s600-c")
                        .replace(
                          "/upload/",
                          "/upload/w_500,h_500,c_fill,q_100/"
                        )
                    : imgTest
                }
                alt={`Foto da ${clinic.name}`}
                fill
                priority
                className="object-cover"
              />
            </div>

            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground text-center">
              {clinic.name}
            </h1>

            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground text-center">
              <MapPin className="w-4 h-4 shrink-0 text-emerald-500" />

              {clinic.address ? (
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 underline-offset-2 hover:underline hover:text-emerald-600 transition-colors"
                >
                  {clinic.address}
                </Link>
              ) : (
                <span className="line-clamp-2">Endereço não informado</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agendamento */}
        <Card className="mt-4 border-border/50 shadow-sm">
          {clinic.status ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  handleRegisterAppointment
                )}
                className="p-5 md:p-7"
              >

                {/* Dados pessoais */}
                <section className="space-y-4">

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                        <User className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div>
                        <h2 className="text-sm font-semibold text-foreground">
                          Seus dados
                        </h2>

                        <p className="text-xs text-muted-foreground">
                          Informe seus dados para confirmar a consulta.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Seu nome completo"
                              className="h-11"
                            />
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
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                              <Input
                                {...field}
                                placeholder="(00) 00000-0000"
                                className="h-11 pl-9"
                                onChange={(e) => {
                                  field.onChange(
                                    formatPhone(
                                      e.target.value
                                    )
                                  )
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>

                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                              <Input
                                {...field}
                                placeholder="seu@email.com"
                                className="h-11 pl-9"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator className="my-7" />

                {/* Consulta */}
                <section className="space-y-5">

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                        <CalendarDays className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div>
                        <h2 className="text-sm font-semibold text-foreground">
                          Agendamento
                        </h2>

                        <p className="text-xs text-muted-foreground">
                          Escolha o procedimento, dia e horário.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Serviço */}
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Procedimento</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value)
                              form.setValue("time", "")
                              form.clearErrors("time")
                            }}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Selecione o procedimento" />
                            </SelectTrigger>

                            <SelectContent>
                              {clinic.services.map((service) => (
                                <SelectItem
                                  key={service.id}
                                  value={service.id}
                                  className="py-3"
                                >
                                  <span>
                                    {service.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Data */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>

                        <Popover>
                          <PopoverTrigger
                            className={cn(
                              "flex w-full items-center rounded-md border bg-background px-3 h-11 text-sm transition-colors",
                              "hover:bg-muted/50",
                              !field.value &&
                                "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4 text-emerald-600" />

                            <span className="truncate">
                              {field.value
                                ? format(
                                    field.value,
                                    "EEEE, dd 'de' MMMM",
                                    {
                                      locale: ptBR,
                                    }
                                  )
                                : "Escolha uma data"}
                            </span>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (!date) return

                                field.onChange(date)
                                form.setValue("time", "")
                                form.clearErrors("time")
                              }}
                              disabled={(date) =>
                                date <
                                new Date(
                                  new Date().setHours(
                                    0,
                                    0,
                                    0,
                                    0
                                  )
                                )
                              }
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Horário */}
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Horário</FormLabel>

                          {selectedDate && !loadingSlots && (
                            <span className="text-xs text-muted-foreground">
                              {selectedDate &&
                                format(
                                  selectedDate,
                                  "dd/MM",
                                  { locale: ptBR }
                                )}
                            </span>
                          )}
                        </div>

                        {!selectedDate ? (
                          <div className="flex items-center gap-2 h-11 rounded-md border border-dashed px-3 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Selecione uma data primeiro.
                          </div>
                        ) : loadingSlots ? (
                          <div className="flex items-center gap-2 h-11 rounded-md border px-3 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                            Verificando horários disponíveis...
                          </div>
                        ) : availableTimeSlots.length === 0 ? (
                          <div className="flex items-center gap-2 h-11 rounded-md border border-dashed px-3 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Nenhum horário disponível.
                          </div>
                        ) : (
                          <ScheduleTimeList
                            onSelectTime={(time) =>
                              field.onChange(time)
                            }
                            clinicTimes={clinic.times}
                            blockedTimes={blockedTimes}
                            availableTimeSlots={
                              availableTimeSlots
                            }
                            selectedTime={field.value}
                            selectedDate={selectedDate}
                            requiredSlots={
                              selectedService
                                ? Math.ceil(
                                    selectedService.duration /
                                      30
                                  )
                                : 1
                            }
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Resumo */}
                  {selectedService &&
                    selectedDate &&
                    selectedTime && (
                      <div className="rounded-lg border bg-muted/30 p-3.5">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Resumo do agendamento
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-sm font-medium">
                            {selectedService.name}
                          </span>

                          <span className="text-sm text-muted-foreground">
                            {format(
                              selectedDate,
                              "dd/MM/yyyy"
                            )}{" "}
                            às {selectedTime}
                          </span>
                        </div>
                      </div>
                    )}
                </section>

                <Separator className="my-7" />

                {/* Confirmação */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Turnstile
                      siteKey={
                        process.env
                          .NEXT_PUBLIC_TURNSTILE_SITE_KEY!
                      }
                      onSuccess={(token) =>
                        form.setValue(
                          "turnstileToken",
                          token
                        )
                      }
                      onError={() =>
                        form.setValue(
                          "turnstileToken",
                          ""
                        )
                      }
                      onExpire={() =>
                        form.setValue(
                          "turnstileToken",
                          ""
                        )
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || !isFormFilled
                    }
                    className={cn(
                      "w-full h-11 font-semibold",
                      "bg-emerald-600 hover:bg-emerald-500",
                      "shadow-sm transition-all"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirmando agendamento...
                      </>
                    ) : (
                      "Confirmar agendamento"
                    )}
                  </Button>

                  <p className="text-center text-[11px] text-muted-foreground">
                    Ao confirmar, sua consulta será registrada
                    com a clínica.
                  </p>
                  <p className="text-center text-[11px] text-muted-foreground">
                    Para cancelar ou remarcar, entre em contato diretamente com a clínica
                    {clinic.phone && (
                      <>
                        {" "}pelo telefone{" "}
                        <span className="font-medium text-foreground">
                          {clinic.phone}
                        </span>
                      </>
                    )}
                    .
                  </p>
                </div>
              </form>
            </Form>
          ) : (
            /* Clínica fechada */
            <div className="flex flex-col items-center text-center px-6 py-14">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>

              <h2 className="text-base font-semibold text-foreground">
                Agendamentos indisponíveis
              </h2>

              <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Esta clínica não está aceitando agendamentos
                online no momento. Tente novamente mais tarde.
              </p>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Agendamento online
        </p>
      </section>
    </main>
  )
}