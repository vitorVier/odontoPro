"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { AppointmentWithService } from "../../../_components/appointments/appointments-list"
import { DialogAppointment } from "../../../_components/appointments/dialog-appointment"

const STATUS_LABEL = {
  SCHEDULED: "Agendada",
  COMPLETED: "Realizada",
  NO_SHOW: "Faltou",
  CANCELED: "Cancelada",
}

const STATUS_COLOR = {
  SCHEDULED: "text-muted-foreground",
  COMPLETED: "text-emerald-600",
  NO_SHOW: "text-amber-600",
  CANCELED: "text-rose-600",
}

interface PatientAppointmentListProps {
  appointments: AppointmentWithService[]
  emptyText: string
}

export function PatientAppointmentList({ appointments, emptyText }: PatientAppointmentListProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<AppointmentWithService | null>(null)
  const [open, setOpen] = useState(false)

  function handleOpen(appointment: AppointmentWithService) {
    setSelected(appointment)
    setOpen(true)
  }

  function handleChanged() {
    // Recarrega os dados do servidor (get-patient-by-id) para refletir
    // a mudança de status nas listas de próximas/histórico e nos KPIs do topo.
    router.refresh()
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
        <CalendarDays className="mb-3 h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-3">
        {appointments.map((appointment) => {
          const date = new Date(appointment.appointmentDate)

          return (
            <DialogTrigger asChild key={appointment.id}>
              <button
                type="button"
                onClick={() => handleOpen(appointment)}
                className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3 text-left transition-colors hover:bg-muted/20"
              >
                {/* DATA + SERVIÇO */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-[10px] font-medium uppercase">
                      {date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                    </span>
                    <span className="text-sm font-bold">{date.getDate()}</span>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {appointment.service?.name ?? "Consulta"}
                    </p>
                    <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">
                      {date.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* HORÁRIO + STATUS */}
                <div className="ml-4 shrink-0 text-right">
                  <p className="text-sm font-semibold">
                    {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className={`text-[11px] font-medium ${STATUS_COLOR[appointment.status]}`}>
                    {STATUS_LABEL[appointment.status]}
                  </p>
                </div>
              </button>
            </DialogTrigger>
          )
        })}
      </div>

      <DialogAppointment
        key={selected?.id ?? "none"}
        appointment={selected}
        onChanged={handleChanged}
      />
    </Dialog>
  )
}