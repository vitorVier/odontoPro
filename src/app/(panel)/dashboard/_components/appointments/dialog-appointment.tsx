import {
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentWithService } from "./appointments-list";
import { formatCurrency } from '@/utils/formatCurrency'
import { Calendar, Clock, User, Phone, Mail, Stethoscope } from 'lucide-react'

interface DialogAppointmentProps {
  appointment: AppointmentWithService | null;
}

export function DialogAppointment({ appointment }: DialogAppointmentProps) {
  if (!appointment) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carregando...</DialogTitle>
        </DialogHeader>
      </DialogContent>
    )
  }

  const [startHour, startMin] = appointment.time.split(':').map(Number);
  const totalMinutes = startHour * 60 + startMin + appointment.service.duration;
  const endHour = Math.floor(totalMinutes / 60);
  const endMin = totalMinutes % 60;
  const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

  return (
    <DialogContent className="max-w-md p-0 overflow-hidden border-border/50">
      <DialogHeader className="p-6 pb-5 border-b border-border/40 bg-muted/30">
        <DialogTitle className="text-lg">
          Detalhes do Agendamento
        </DialogTitle>
        <DialogDescription>
          Informações completas sobre a consulta marcada.
        </DialogDescription>
      </DialogHeader>

      <div className="p-6 pt-4 space-y-6">

        {/* Sessão Data/Hora */}
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center gap-1.5">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary capitalize">
              {new Intl.DateTimeFormat('pt-BR', {
                timeZone: "UTC",
                year: "numeric",
                month: "short",
                day: "2-digit",
              }).format(new Date(appointment.appointmentDate)).replace('. de', '')}
            </span>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center gap-1.5">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {appointment.time} — {endTime}
            </span>
          </div>
        </div>

        {/* Informações do Paciente */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Paciente</h4>
          <div className="flex flex-col gap-0.5 rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 p-3 border-b border-border/40">
              <div className="p-2 bg-muted/50 rounded-lg">
                <User className="w-4 h-4 text-foreground/70" />
              </div>
              <p className="text-sm font-medium text-foreground">{appointment.name}</p>
            </div>

            <div className="flex items-center gap-3 p-3 border-b border-border/40">
              <div className="p-2 bg-muted/50 rounded-lg">
                <Phone className="w-4 h-4 text-foreground/70" />
              </div>
              <p className="text-sm text-foreground">{appointment.phone}</p>
            </div>

            <div className="flex items-center gap-3 p-3">
              <div className="p-2 bg-muted/50 rounded-lg">
                <Mail className="w-4 h-4 text-foreground/70" />
              </div>
              <p className="text-sm text-foreground">{appointment.email}</p>
            </div>
          </div>
        </div>

        {/* Serviço */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Serviço</h4>
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{appointment.service.name}</p>
                <p className="text-xs text-muted-foreground">
                  Duração: {appointment.service.duration < 60 ?
                    `${appointment.service.duration}min` :
                    `${Math.floor(appointment.service.duration / 60)}h ${appointment.service.duration % 60 > 0 ? `${appointment.service.duration % 60}min` : ''}`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-emerald-600">
                {formatCurrency((appointment.service.price / 100))}
              </p>
            </div>
          </div>
        </div>

      </div>
    </DialogContent>
  )
}