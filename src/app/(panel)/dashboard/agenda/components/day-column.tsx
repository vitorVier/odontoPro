import { cn } from "@/lib/utils"
import { isSameDay, isToday } from "date-fns"

import { AppointmentCard } from "./appointment-card"
import { AppointmentWithService } from "../../_components/appointments/appointments-list"
import { isSlotBlocked } from "@/utils/schedule/is-slot-blocked"
import { ScheduleBlock } from "@prisma/client"

const SLOT_HEIGHT = 40
const SLOT_MINUTES = 30

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)

  return hours * 60 + minutes
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

export function DayColumn({
  day,
  appointments,
  times,
  scheduleBlocks,
  onChanged,
}: {
  day: Date
  appointments: AppointmentWithService[]
  times: string[]
  scheduleBlocks: ScheduleBlock[]
  onChanged: () => void
}) {
  if (!times.length) {
    return (
      <div className="relative border-l min-h-40" />
    )
  }

  const dayAppointments = appointments.filter((appointment) =>
    isSameDay(
      new Date(appointment.appointmentDate),
      day
    )
  )

  const startMinutes = timeToMinutes(times[0])
  const endMinutes = timeToMinutes(times[times.length - 1]) + SLOT_MINUTES

  const totalSlots = (endMinutes - startMinutes) / SLOT_MINUTES
  const totalHeight = totalSlots * SLOT_HEIGHT

  return (
    <div
      className={cn(
        "relative border-l",
        isToday(day) && "bg-primary/1.5"
      )}
      style={{
        height: totalHeight,
      }}
    >

      {/* GRID */}
      {Array.from({ length: totalSlots }).map((_, index) => {
        const slotTime = minutesToTime(startMinutes + index * SLOT_MINUTES)
        const blocked = isSlotBlocked(day, slotTime, scheduleBlocks)

        return (
          <div
            key={index}
            className={cn(
              "absolute left-0 right-0 border-b border-border/40",
              index % 2 === 1 && "border-border/40",
              blocked &&
                "bg-muted/60 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,var(--muted-foreground)_6px,var(--muted-foreground)_7px)] bg-size[10px_10px] opacity-40"
            )}
            style={{
              top: index * SLOT_HEIGHT,
              height: SLOT_HEIGHT,
            }}
          />
        )
      })}

      {/* AGENDAMENTOS */}
      {dayAppointments.map((appointment) => {
        const appointmentMinutes = timeToMinutes(
          appointment.time
        )

        const top =
          ((appointmentMinutes - startMinutes) /
            SLOT_MINUTES) *
          SLOT_HEIGHT

        const duration =
          appointment.service?.duration &&
          appointment.service.duration > 0
            ? appointment.service.duration
            : 30

        const height =
          (duration / SLOT_MINUTES) *
          SLOT_HEIGHT

        return (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            top={top}
            height={height}
            onChanged={onChanged}
          />
        )
      })}
    </div>
  )
}