"use client"

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function ButtonPickerAppointment() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const dateParam = searchParams.get('date')
  const initialDate = dateParam ? parseISO(dateParam) : new Date()

  const [date, setDate] = useState<Date | undefined>(initialDate)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (dateParam) {
      setDate(parseISO(dateParam))
    }
  }, [dateParam])

  function handleSelectDate(selected: Date | undefined) {
    if (!selected) return

    setDate(selected)
    setOpen(false)

    const formattedDate = format(selected, 'yyyy-MM-dd')
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', formattedDate)

    router.push(`?${params.toString()}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center justify-start rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-normal gap-2 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="w-4 h-4 text-emerald-600" />
        {date ? (
          <span className="font-medium text-gray-900">
            {(() => {
              const formatted = format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
              // Deixa a primeira letra da frase (dia da semana) e do mês em maiúsculas, mantendo o "de" minúsculo
              return formatted
                .replace(/^[a-z]/, (match) => match.toUpperCase()) // Primeira letra (ex: Quinta-feira)
                .replace(/de ([a-z])/, (_, letter) => `de ${letter.toUpperCase()}`); // Primeira letra do Mês (ex: de Agosto)
            })()}
          </span>
        ) : (
          <span>Selecione uma data</span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 align-end" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelectDate}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}