"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface UseProfileFormProps {
  name: string | null;
  address: string | null;
  phone: string | null;
  status: boolean;
  timeZone: string | null;
  weekDays: number[];
}

const profileSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  address: z.string().optional(),
  phone: z.string().optional(),
  status: z.string(),
  timeZone: z.string().min(1, { message: "O time zone é obrigatório" }),
  weekDays: z.array(z.number()).min(1, { message: "Selecione ao menos um dia de atendimento" }),
})

export type ProfileFormData = z.infer<typeof profileSchema>;

export function useProfileForm({ name, address, phone, status, timeZone, weekDays }: UseProfileFormProps) {
  return useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: name || "",
      address: address || "",
      phone: phone || "",
      status: status ? "active" : "inactive",
      timeZone: timeZone || "",
      weekDays: weekDays?.length ? weekDays : [1, 2, 3, 4, 5],
    }
  })
}