import { AppointmentWithService } from "../../_components/appointments/appointments-list"
import { cn } from "@/lib/utils"
import { AppointmentStatusMenu } from "./appointment-status-menu"

export function AppointmentCard({
  appointment,
  top,
  height,
  onChanged,
}: {
  appointment: AppointmentWithService
  top: number
  height: number
  onChanged: () => void
}) {

  const statusStyles = {
    SCHEDULED: "border-primary/20 bg-primary/8 hover:bg-primary/13",
    COMPLETED: "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15",
    NO_SHOW: "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15",
    CANCELED: "border-border bg-muted/40 opacity-60",
  }

  return (
    <div
      className={cn(
        "absolute left-1 right-1 z-10 overflow-hidden rounded-lg border px-2 py-1.5 transition-all",
        statusStyles[appointment.status]
      )}
      style={{ top, height }}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="truncate text-[11px] font-semibold text-primary">
          {appointment.time}
        </p>

        <AppointmentStatusMenu
          appointmentId={appointment.id}
          currentStatus={appointment.status}
          onChanged={onChanged}
          triggerClassName="shrink-0 text-muted-foreground hover:text-foreground"
        />
      </div>

      <p className={cn(
        "truncate text-xs font-semibold text-foreground",
        appointment.status === "CANCELED" && "line-through"
      )}>
        {appointment.name}
      </p>

      <p className="truncate text-[10px] text-muted-foreground">
        {appointment.service?.name ?? "Serviço removido"}
      </p>
    </div>
  )
}