import { cn } from "@/lib/utils";
import { Appointment } from "@prisma/client";
import { addDays, endOfMonth, endOfWeek, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, format } from "date-fns";

export function MonthView({
  currentDate,
  appointments,
  summary,
  onSelectDate,
  onChangeToWeek,
}: {
  currentDate: Date
  appointments: Appointment[]
  summary: { date: string; count: number }[]
  onSelectDate: (date: Date) => void
  onChangeToWeek: () => void
}) {
  const monthStart = startOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, {
    weekStartsOn: 1,
  })

  const monthEnd = endOfMonth(currentDate)
  const calendarEnd = endOfWeek(monthEnd, {
    weekStartsOn: 1,
  })

  const days: Date[] = []

  let day = calendarStart

  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  function getCount(date: Date) {
    const key = format(date, "yyyy-MM-dd")

    return (
      summary.find((item) => item.date === key)?.count ?? 0
    )
  }

  function getAppointments(date: Date) {
    return appointments.filter((appointment) =>
      isSameDay(
        new Date(appointment.appointmentDate),
        date
      )
    )
  }

  return (
    <div>
      {/* DIAS DA SEMANA */}
      <div className="grid grid-cols-7 border-b">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
          (day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {day}
            </div>
          )
        )}
      </div>

      {/* DIAS */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const count = getCount(day)
          const dayAppointments = getAppointments(day)
          const isCurrentMonth = isSameMonth(
            day,
            currentDate
          )

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                onSelectDate(day)
                onChangeToWeek()
              }}
              className={cn(
                "group min-h-30 border-b border-r p-2 text-left transition-colors hover:bg-muted/40",
                !isCurrentMonth &&
                  "bg-muted/20 text-muted-foreground",
                isToday(day) &&
                  "bg-primary/2.5"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                    isToday(day) &&
                      "bg-primary font-bold text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>

                {count > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {count}{" "}
                    {count === 1
                      ? "consulta"
                      : "consultas"}
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                {dayAppointments
                  .slice(0, 3)
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="truncate rounded-md bg-primary/8 px-1.5 py-1 text-[10px] text-primary"
                    >
                      <span className="font-semibold">
                        {appointment.time}
                      </span>{" "}
                      {appointment.name}
                    </div>
                  ))}

                {dayAppointments.length > 3 && (
                  <p className="px-1 text-[10px] font-medium text-muted-foreground">
                    +{dayAppointments.length - 3} mais
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}