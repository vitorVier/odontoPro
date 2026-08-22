"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function ButtonPickerAppointment() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const dateParam = searchParams.get("date")

  const initialDate = dateParam
    ? parseISO(dateParam)
    : new Date()

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

    const formattedDate = format(selected, "yyyy-MM-dd")

    const params = new URLSearchParams(searchParams.toString())
    params.set("date", formattedDate)

    router.push(`?${params.toString()}`)
  }

  function formatAppointmentDate(date: Date) {
    const formatted = format(
      date,
      "EEEE, dd 'de' MMMM 'de' yyyy",
      { locale: ptBR }
    )

    return formatted
      .replace(/^./, (char) => char.toUpperCase())
      .replace(
        /de ([a-záàâãéêíóôõúç])/,
        (_, char) => `de ${char.toUpperCase()}`
      )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center justify-start gap-2",
          "rounded-md border border-gray-200 bg-white",
          "px-3 py-1.5 text-sm font-normal shadow-sm",
          "transition-colors hover:bg-gray-50",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="h-4 w-4 text-emerald-600" />

        {date ? (
          <span className="font-medium text-gray-900">
            {formatAppointmentDate(date)}
          </span>
        ) : (
          <span>Selecione uma data</span>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="end"
      >
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