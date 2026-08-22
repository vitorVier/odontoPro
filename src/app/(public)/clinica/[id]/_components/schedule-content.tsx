"use client"

import { useState, useEffect } from 'react'
import Image from "next/image"
import imgTest from '../../../../../../public/foto1.png'
import { MapPin, User, Phone, Mail, CalendarDays, Clock, Loader2, Calendar } from "lucide-react"
import { Prisma } from "@prisma/client"
import { useAppointmentForm, AppointmentFormData } from './schedule-form'
import { useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatPhone } from '@/utils/formatPhone'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScheduleTimeList } from './schedule-time-list'
import { createNewAppointment } from '../_actions/create-appointment'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type UserWithServiceAndSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true,
    services: true,
  }
}>

interface ScheduleContentProps {
  clinic: UserWithServiceAndSubscription
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export function ScheduleContent({ clinic }: ScheduleContentProps) {
  const form = useAppointmentForm();

  const [selectedDate, selectedServiceId, selectedTime, watchedName, watchedEmail, watchedPhone] = useWatch({
    control: form.control,
    name: ["date", "serviceId", "time", "name", "email", "phone"],
  });

  const isFormFilled = Boolean(selectedDate && selectedServiceId && selectedTime && watchedName && watchedEmail && watchedPhone);

  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState<string[]>([])

  // Formata a data usando offset local para evitar bug de dia anterior (UTC-3)
  const selectedDateString = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : null;

  useEffect(() => {
    if (!selectedDateString) return;

    let cancelled = false;
    setLoadingSlots(true);

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-appointments?userId=${clinic.id}&date=${selectedDateString}`)
      .then((r) => r.json())
      .then((blocked: string[]) => {
        if (cancelled) return;

        const safeBlocked = Array.isArray(blocked) ? blocked : [];
        setBlockedTimes(safeBlocked);

        const finalSlots = (clinic.times || []).map((time) => ({
          time,
          available: !safeBlocked.includes(time),
        }));
        setAvailableTimeSlots(finalSlots);

        form.setValue("time", "");
        form.clearErrors("time");
      })
      .catch(() => {
        if (!cancelled) {
          setBlockedTimes([]);
          setAvailableTimeSlots((clinic.times || []).map((time) => ({ time, available: true })));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => { cancelled = true; };
    // clinic.id and clinic.times are stable server props — safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateString])

  async function handleRegisterAppointmnent(formData: AppointmentFormData) {
    setIsSubmitting(true)
    const response = await createNewAppointment({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      time: formData.time,
      date: formData.date,
      serviceId: formData.serviceId,
      clinicId: clinic.id
    })

    if (response.error) {
      toast.error(response.error)
      setIsSubmitting(false)
      return;
    }

    toast.success("Consulta agendada com sucesso!")
    form.reset();
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 pb-12">
      <div className="h-48 md:h-56 bg-linear-to-br from-emerald-600 via-emerald-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <section className="container max-w-3xl mx-auto px-4 -mt-20 md:-mt-28 relative z-10">

        {/* Clinic Info Card */}
        <Card className="border-none shadow-lg overflow-visible mb-6 bg-white/95 backdrop-blur-sm">
          <CardContent className="pt-0 flex flex-col items-center">
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md -mt-14 mb-4 bg-white">
              <Image
                src={
                  typeof clinic.image === "string"
                    ? clinic.image
                      .replace(/=s\d+-c/, "=s600-c")
                      .replace("/upload/", "/upload/w_500,h_500,c_fill,q_100/")
                    : imgTest
                }
                alt="Foto da clinica"
                className="object-cover"
                fill
                priority
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1.5 text-center tracking-tight">
              {clinic.name}
            </h1>
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-100/80 px-3 py-1 rounded-full text-sm">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">
                {clinic.address ? clinic.address : "Endereço não informado"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="border-border/50 shadow-sm bg-white overflow-hidden">
          {clinic.status ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegisterAppointmnent)} className="p-6 md:p-8 space-y-8">

                {/* 1. Dados Pessoais */}
                <div>
                  <div className="flex items-center gap-2 mb-4 text-emerald-600">
                    <User className="w-5 h-5" />
                    <h2 className="text-lg font-bold text-gray-900">Seus dados</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-semibold text-gray-700">Nome completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Como devemos lhe chamar?"
                              className="h-11 bg-gray-50/50"
                              {...field}
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
                          <FormLabel className="text-sm font-semibold text-gray-700">Telefone (WhatsApp)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                {...field}
                                placeholder="(XX) XXXXX-XXXX"
                                className="h-11 pl-9 bg-gray-50/50"
                                onChange={(e) => {
                                  field.onChange(formatPhone(e.target.value))
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
                          <FormLabel className="text-sm font-semibold text-gray-700">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="seu@email.com"
                                className="h-11 pl-9 bg-gray-50/50"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* 2. Dados da Consulta */}
                <div>
                  <div className="flex items-center gap-2 mb-1 text-emerald-600">
                    <CalendarDays className="w-5 h-5" />
                    <h2 className="text-lg font-bold text-gray-900">A consulta</h2>
                  </div>

                  <div className="space-y-5">
                    <FormField
                      control={form.control}
                      name="serviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Selecione o serviço</FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => {
                              field.onChange(value)
                              form.setValue("time", "")
                              form.clearErrors("time")
                            }}>
                              <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200">
                                <SelectValue placeholder="Qual procedimento você deseja realizar?" />
                              </SelectTrigger>
                              <SelectContent>
                                {clinic.services.map((service) => (
                                  <SelectItem key={service.id} value={service.id} className="py-2.5 cursor-pointer">
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-medium text-gray-700">{service.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm font-semibold text-gray-700">Qual o melhor dia?</FormLabel>
                            <Popover>
                              <PopoverTrigger
                                className={cn(
                                  "flex w-full items-center justify-start rounded-md border border-gray-200 bg-gray-50/50 px-3 h-11 text-sm font-normal shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                    .replace(/^[a-z]/, (match) => match.toUpperCase())
                                    .replace(/de ([a-z])/, (_, letter) => `de ${letter.toUpperCase()}`)
                                ) : (
                                  <span>Escolha uma data</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50 text-emerald-600" />
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    if (date) {
                                      field.onChange(date)
                                      form.setValue("time", "")
                                      form.clearErrors("time")
                                    }
                                  }}
                                  disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  locale={ptBR}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm font-semibold text-gray-700">E o horário?</FormLabel>
                            {loadingSlots ? (
                              <div className="flex w-full items-center justify-start rounded-md border border-gray-200 bg-gray-50/50 px-3 h-11 text-sm text-emerald-600 gap-2 opacity-70">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="font-medium">Buscando...</span>
                              </div>
                            ) : availableTimeSlots.length === 0 ? (
                              <div className="flex w-full items-center justify-start rounded-md border border-gray-200 bg-gray-50/50 px-3 h-11 text-sm text-gray-400">
                                Selecione uma data...
                              </div>
                            ) : (
                              <ScheduleTimeList
                                onSelectTime={(time) => field.onChange(time)}
                                clinicTimes={clinic.times}
                                blockedTimes={blockedTimes}
                                availableTimeSlots={availableTimeSlots}
                                selectedTime={field.value}
                                selectedDate={selectedDate}
                                requiredSlots={
                                  clinic.services.find(s => s.id === selectedServiceId) ? Math.ceil(clinic.services.find(s => s.id === selectedServiceId)!.duration / 30) : 1
                                }
                              />
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Submit */}
                <div className="pt-1">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold tracking-wide shadow-sm hover:shadow transition-all bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                    disabled={isSubmitting || !isFormFilled}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Agendando...
                      </>
                    ) : (
                      "Confirmar Agendamento"
                    )}
                  </Button>
                </div>

              </form>
            </Form>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Clínica Fechada</h3>
              <p className="text-gray-500 max-w-sm">
                Infelizmente a clínica não está aceitando novos agendamentos online no momento. Por favor, tente novamente mais tarde.
              </p>
            </div>
          )}
        </Card>

      </section>
    </div>
  )
}