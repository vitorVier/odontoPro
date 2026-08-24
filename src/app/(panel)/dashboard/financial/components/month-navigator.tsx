"use client"

import { format, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface MonthNavigatorProps {
  currentMonth: Date
  onChange: (date: Date) => void
}

export function MonthNavigator({ currentMonth, onChange }: MonthNavigatorProps) {
  const router = useRouter()
  const pathname = usePathname()

  function navigate(date: Date) {
    router.push(`${pathname}?month=${format(date, "yyyy-MM")}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onChange(subMonths(currentMonth, 1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="min-w-32 text-center text-sm font-semibold capitalize">
        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
      </span>

      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onChange(addMonths(currentMonth, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}