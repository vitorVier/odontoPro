"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const transactionSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória"),
  amount: z.number().positive("O valor precisa ser maior que zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().optional(),
  dueDate: z.date({ message: "Selecione uma data" }),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

export function useTransactionForm() {
  return useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "INCOME",
      category: "",
      dueDate: new Date(),
    },
  })
}