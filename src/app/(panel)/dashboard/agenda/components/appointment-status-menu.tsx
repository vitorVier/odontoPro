"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Ban, MoreVertical, RotateCcw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AppointmentStatus } from "@prisma/client"
import { updateAppointmentStatus } from "../_actions/update-appointment-status"

interface AppointmentStatusMenuProps {
  appointmentId: string
  currentStatus: AppointmentStatus
  onChanged: () => void
  triggerClassName?: string
}

export function AppointmentStatusMenu({
  appointmentId,
  currentStatus,
  onChanged,
  triggerClassName,
}: AppointmentStatusMenuProps) {
  const [isPending, setIsPending] = useState(false)

  async function handleUpdate(status: AppointmentStatus) {
    setIsPending(true)
    const response = await updateAppointmentStatus({ appointmentId, status })
    setIsPending(false)

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success(response.data)
    onChanged()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        onClick={(e) => e.stopPropagation()} // evita disparar clique do card por trás
        className={triggerClassName}
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {currentStatus !== "COMPLETED" && (
          <DropdownMenuItem onClick={() => handleUpdate("COMPLETED")} className="gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Concluída
          </DropdownMenuItem>
        )}

        {currentStatus !== "NO_SHOW" && (
          <DropdownMenuItem onClick={() => handleUpdate("NO_SHOW")} className="gap-2">
            <XCircle className="h-4 w-4 text-amber-600" />
            Não compareceu
          </DropdownMenuItem>
        )}

        {currentStatus !== "CANCELED" && (
          <DropdownMenuItem onClick={() => handleUpdate("CANCELED")} className="gap-2">
            <Ban className="h-4 w-4 text-rose-600" />
            Cancelar
          </DropdownMenuItem>
        )}

        {currentStatus !== "SCHEDULED" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleUpdate("SCHEDULED")} className="gap-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              Reverter para agendada
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}