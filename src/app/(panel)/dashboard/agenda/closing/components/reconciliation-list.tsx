"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, XCircle, Ban, Loader2, PartyPopper } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AppointmentWithService } from "../../../_components/appointments/appointments-list"
import { updateAppointmentStatus } from "../../_actions/update-appointment-status"
import { AppointmentStatus } from "@prisma/client"

export function ReconciliationList({ initialAppointments }: { initialAppointments: AppointmentWithService[] }) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleUpdate(id: string, status: AppointmentStatus) {
    setPendingId(id)
    const response = await updateAppointmentStatus({ appointmentId: id, status })
    setPendingId(null)

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success(response.data)
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  if (appointments.length === 0) {
    return (
      <Card className="border-border/50 shadow-xs">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <PartyPopper className="h-10 w-10 text-emerald-500 mb-3" />
          <p className="text-sm font-medium">Tudo em dia!</p>
          <p className="text-xs text-muted-foreground mt-1">Nenhuma consulta pendente de confirmação.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="border-border/50 shadow-xs">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{appointment.name}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(appointment.appointmentDate), "dd/MM/yyyy", { locale: ptBR })} às {appointment.time}
                {" · "}{appointment.service?.name ?? "Serviço removido"}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pendingId === appointment.id}
                className="gap-1.5 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10"
                onClick={() => handleUpdate(appointment.id, "COMPLETED")}
              >
                {pendingId === appointment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Compareceu
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={pendingId === appointment.id}
                className="gap-1.5 border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
                onClick={() => handleUpdate(appointment.id, "NO_SHOW")}
              >
                <XCircle className="h-3.5 w-3.5" />
                Faltou
              </Button>

              <Button
                size="sm"
                variant="ghost"
                disabled={pendingId === appointment.id}
                className="gap-1.5 text-muted-foreground hover:text-rose-600"
                onClick={() => handleUpdate(appointment.id, "CANCELED")}
              >
                <Ban className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}