import { AppointmentWithService } from "../../_components/appointments/appointments-list"

export function AppointmentCard({
  appointment,
  top,
  height,
}: {
  appointment: AppointmentWithService
  top: number
  height: number
}) {
  return (
    <div
      className="absolute left-1 right-1 z-10 overflow-hidden rounded-lg border border-primary/20 bg-primary/8 px-2 py-1.5 transition-all hover:bg-primary/13 hover:shadow-sm"
      style={{
        top,
        height,
      }}
    >
      <p className="truncate text-[11px] font-semibold text-primary">
        {appointment.time}
      </p>

      <p className="truncate text-xs font-semibold text-foreground">
        {appointment.name}
      </p>

      <p className="truncate text-[10px] text-muted-foreground">
        {appointment.service.name}
      </p>
    </div>
  )
}