import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CalendarClock,
  CalendarX,
  User,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Prisma } from "@prisma/client"

type AppointmentWithService = Prisma.AppointmentGetPayload<{
  include: {
    service: true
  }
}>

interface UpcomingAppointmentsProps {
  appointments: AppointmentWithService[]
}

export function UpcomingAppointments({
  appointments,
}: UpcomingAppointmentsProps) {

  return (
    <Card className="border-border/50 bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Próximos Agendamentos
          </CardTitle>

          <p className="text-[11px] text-muted-foreground">
            Consultas agendadas para os próximos dias
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
          <CalendarClock className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>

      <CardContent className="pt-1">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
              <CalendarX className="h-5 w-5 text-muted-foreground/50" />
            </div>

            <p className="text-sm font-medium text-foreground">
              Nenhum agendamento
            </p>

            <p className="mt-1 max-w-55 text-xs text-muted-foreground">
              Não há consultas futuras para os próximos dias.
            </p>
          </div>
        ) : (

          <div className="divide-y divide-border/40">
            {appointments.map((apt) => {
              const dateObj = new Date(apt.appointmentDate)
              const day = format(dateObj, "dd")
              const month = format(dateObj, "MMM", {
                locale: ptBR,
              }).replace(".", "")

              return (
                <div
                  key={apt.id}
                  className="group flex items-center gap-3 py-3 first:pt-2 last:pb-2"
                >
                  {/* Data */}
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/50">
                    <span className="text-xs font-semibold text-foreground">
                      {day}
                    </span>

                    <span className="text-[9px] font-medium uppercase text-muted-foreground">
                      {month}
                    </span>
                  </div>

                  {/* Informações */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                      <p className="truncate text-sm font-medium text-foreground">
                        {apt.name}
                      </p>
                    </div>

                    <p className="mt-0.5 truncate pl-5 text-xs text-muted-foreground">
                      {apt.service.name}
                    </p>
                  </div>

                  {/* Horário */}
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {apt.time}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}