"use client"

import { cn } from "@/lib/utils"

const WEEK_DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
]

interface WeekDaysSelectorProps {
  value: number[]
  onChange: (days: number[]) => void
}

export function WeekDaysSelector({ value, onChange }: WeekDaysSelectorProps) {
  function toggleDay(day: number) {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day))
    } else {
      onChange([...value, day].sort())
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {WEEK_DAYS.map(({ value: day, label }) => {
        const isSelected = value.includes(day)
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day)}
            className={cn(
              "h-10 w-14 rounded-lg text-xs font-semibold border transition-all",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}