"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const blockFormSchema = z.object({
  mode: z.enum(["range", "specific", "recurring"]),
  startDate: z.date({ message: "Selecione uma data" }),
  endDate: z.date({ message: "Selecione uma data" }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: "O período final não pode ser antes do inicial", path: ["endDate"] }
).refine(
  (data) => {
    if (data.mode === "range") return true
    return !!data.startTime && !!data.endTime
  },
  { message: "Informe o horário de início e fim", path: ["startTime"] }
).refine(
  (data) => {
    if (!data.startTime || !data.endTime) return true
    return data.endTime > data.startTime
  },
  { message: "O horário final precisa ser depois do inicial", path: ["endTime"] }
)

export type ScheduleBlockFormData = z.infer<typeof blockFormSchema>

export function useScheduleBlockForm() {
  return useForm<ScheduleBlockFormData>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: {
      mode: "range",
      startDate: new Date(),
      endDate: new Date(),
      startTime: "",
      endTime: "",
      reason: "",
    },
  })
}