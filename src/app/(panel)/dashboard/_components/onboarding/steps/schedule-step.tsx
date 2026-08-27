"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { WeekDaysSelector } from "../../../profile/_components/week-days-selector"
import { updateSchedule } from "../../../profile/_actions/update-schedule"

interface ScheduleStepProps {
  userId: string
  onValid: () => void
}

function generateTimeSlots(): string[] {
  const hours: string[] = []
  for (let i = 8; i <= 19; i++) {
    for (let j = 0; j < 2; j++) {
      const hour = i.toString().padStart(2, "0")
      const minute = (j * 30).toString().padStart(2, "0")
      hours.push(`${hour}:${minute}`)
    }
  }
  return hours
}

const TIME_SLOTS = generateTimeSlots()

export function ScheduleStep({ onValid }: ScheduleStepProps) {
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [selectedHours, setSelectedHours] = useState<string[]>([
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function toggleHour(hour: string) {
    setSelectedHours((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour].sort()
    )
  }

  async function handleSubmit() {
    if (weekDays.length === 0) {
      toast.error("Selecione ao menos um dia de atendimento")
      return
    }

    if (selectedHours.length === 0) {
      toast.error("Selecione ao menos um horário")
      return
    }

    setIsSubmitting(true)

    const response = await updateSchedule({
        weekDays,
        times: selectedHours,
    })

    setIsSubmitting(false)

    if (response.error) {
      toast.error(response.error)
      return
    }

    onValid()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
          <PartyPopper className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="text-base font-bold">Últi­mo passo!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina os dias e horários em que sua clínica atende.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Dias de atendimento</Label>
        <WeekDaysSelector value={weekDays} onChange={setWeekDays} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Horários disponíveis</Label>
          <span className="text-[11px] text-muted-foreground">
            {selectedHours.length} selecionados
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto rounded-xl border bg-muted/20 p-3">
          {TIME_SLOTS.map((hour) => {
            const selected = selectedHours.includes(hour)
            return (
              <button
                key={hour}
                type="button"
                onClick={() => toggleHour(hour)}
                className={cn(
                  "rounded-md py-1.5 text-[11px] font-medium transition-all",
                  selected
                    ? "bg-emerald-500 text-white"
                    : "bg-background border border-border text-muted-foreground hover:border-emerald-500/40"
                )}
              >
                {hour}
              </button>
            )
          })}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Concluir configuração"}
      </Button>
    </div>
  )
}