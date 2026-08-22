"use client"

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export const appointmentSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("O email é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  date: z.date({ message: "A data é obrigatória" }),
  serviceId: z.string().min(1, "O serviço é obrigatório"),
  time: z.string().min(1, "O horário é obrigatório"),
  turnstileToken: z.string().min(1, "Verificação de segurança obrigatória"),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export function useAppointmentForm() {
  return useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceId: "",
      time: "",
      date: new Date(),
      turnstileToken: "",
    }
  })
}