import { cn } from "@/lib/utils"
import { ptBR } from "date-fns/locale"
import {
  addDays,
  isToday,
  startOfWeek,
  format,
} from "date-fns"

import { DayColumn } from "./day-column"
import { AppointmentWithService } from "../../_components/appointments/appointments-list"
import { generateTimeSlots } from "@/utils/calendar"
import { ScheduleBlock } from "@prisma/client"

const SLOT_HEIGHT = 40

export function WeekView({
  currentDate,
  appointments,
  times,
  scheduleBlocks,
  onChanged,
}: {
  currentDate: Date
  appointments: AppointmentWithService[]
  times: string[]
  scheduleBlocks: ScheduleBlock[]
  onChanged: () => void
}) {
  const days = Array.from({ length: 7 }, (_, index) =>
    addDays(
      startOfWeek(currentDate, { weekStartsOn: 1 }),
      index
    )
  )

  const gridTimes = generateTimeSlots(times)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-225">

        {/* CABEÇALHO */}
        <div className="grid grid-cols-[70px_repeat(7,minmax(110px,1fr))] border-b bg-card sticky top-0 z-20">

          <div />

          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "border-l px-2 py-3 text-center",
                isToday(day) && "bg-primary/3"
              )}
            >
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                {format(day, "EEE", { locale: ptBR })}
              </p>

              <div
                className={cn(
                  "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                  isToday(day)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* GRADE */}
        <div className="grid grid-cols-[70px_repeat(7,minmax(110px,1fr))]">

          {/* HORÁRIOS */}
          <div className="relative">
            {gridTimes.map((time) => (
              <div
                key={time}
                className="relative h-10 border-b border-border/40 pr-2 text-right"
              >
                <span className="relative -top-2 text-[10px] text-muted-foreground">
                  {time}
                </span>
              </div>
            ))}
          </div>

          {/* DIAS */}
          {days.map((day) => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              appointments={appointments}
              times={gridTimes}
              scheduleBlocks={scheduleBlocks}
              onChanged={onChanged}
            />
          ))}
        </div>
      </div>
    </div>
  )
}