import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, CalendarX, User } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Prisma } from "@prisma/client"

type AppointmentWithService = Prisma.AppointmentGetPayload<{
  include: { service: true }
}>

interface UpcomingAppointmentsProps {
  appointments: AppointmentWithService[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <Card className="border border-border/50 bg-card shadow-xs transition-all hover:shadow-md duration-300">
      {/* Cabeçalho Alinhado com o TopServices */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-bold tracking-tight text-foreground">
            Próximos Agendamentos
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Consultas agendadas para os próximos dias
          </p>
        </div>
        <div className="p-2 bg-muted/40 rounded-lg text-muted-foreground shrink-0">
          <CalendarClock className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <CalendarX className="w-6 h-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground max-w-50">
              Nenhum agendamento futuro localizado.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {appointments.map((apt) => {
              // Separa o dia e o mês abreviado de forma elegante
              const dateObj = new Date(apt.appointmentDate);
              const dayStr = format(dateObj, "dd");
              const monthStr = format(dateObj, "MMM", { locale: ptBR }).replace(".", "");

              return (
                <div
                  key={apt.id}
                  className="group flex items-center gap-3 p-2.5 rounded-xl border border-border/40 bg-muted/5 hover:bg-muted/30 hover:border-border transition-all duration-200"
                >
                  {/* Bloco de Data Estilo Calendário Físico */}
                  <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/10 flex flex-col items-center justify-center shrink-0 text-center select-none group-hover:bg-primary/15 transition-colors">
                    <span className="text-xs font-bold text-primary leading-tight">
                      {dayStr}
                    </span>
                    <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wide leading-none">
                      {monthStr}
                    </span>
                  </div>

                  {/* Informações do Paciente e Procedimento */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                      <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {apt.name}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate pl-4">
                      {apt.service.name}
                    </p>
                  </div>

                  {/* Horário de Atendimento Destacado */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-1 rounded-md tracking-tight group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {apt.time}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
