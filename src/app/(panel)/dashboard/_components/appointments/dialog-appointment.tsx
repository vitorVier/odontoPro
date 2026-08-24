"use client"

import { useState } from "react"

import {
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

import { AppointmentWithService } from "./appointments-list"
import { formatCurrency } from "@/utils/formatCurrency"
import { updateAppointmentStatus } from "../../agenda/_actions/update-appointment-status"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { AppointmentStatus } from "@prisma/client"

interface DialogAppointmentProps {
  appointment: AppointmentWithService | null
  onChanged?: () => void
}

const STATUS_INFO = {
  SCHEDULED: { label: "Agendada", className: "bg-primary/10 text-primary", icon: null },
  COMPLETED: { label: "Concluída", className: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
  NO_SHOW: { label: "Não compareceu", className: "bg-amber-500/10 text-amber-600", icon: XCircle },
  CANCELED: { label: "Cancelada", className: "bg-muted text-muted-foreground", icon: Ban },
}

export function DialogAppointment({
  appointment,
  onChanged,
}: DialogAppointmentProps) {
  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus | null>(
    appointment?.status ?? null
  )
  const [isPending, setIsPending] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(null)

  if (!appointment) {
    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Carregando...</DialogTitle>
        </DialogHeader>
      </DialogContent>
    )
  }

  async function handleUpdateStatus(status: AppointmentStatus) {
    if (!appointment || status === currentStatus) return

    setIsPending(true)
    setPendingStatus(status)

    const response = await updateAppointmentStatus({
      appointmentId: appointment.id,
      status,
    })

    setIsPending(false)
    setPendingStatus(null)

    if (response.error) {
      toast.error(response.error)
      return
    }

    setCurrentStatus(status)

    toast.success(response.data)
    onChanged?.()
  }

  const duration = appointment.service?.duration && appointment.service.duration > 0
    ? appointment.service.duration
    : 30

  const [startHour, startMin] = appointment.time
    .split(":")
    .map(Number)

  const totalMinutes =
    startHour * 60 +
    startMin +
    duration

  const endHour = Math.floor(totalMinutes / 60)
  const endMin = totalMinutes % 60

  const endTime = `${String(endHour).padStart(2, "0")}:${String(
    endMin
  ).padStart(2, "0")}`

  const appointmentWeekday = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
  }).format(new Date(appointment.appointmentDate))

  const appointmentDateShort = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(appointment.appointmentDate))

  const durationLabel =
    duration < 60
      ? `${duration} min`
      : `${Math.floor(duration / 60)}h${
          duration % 60 > 0
            ? ` ${duration % 60}min`
            : ""
        }`

  const status = STATUS_INFO[currentStatus ?? "SCHEDULED"]
  const StatusIcon = status.icon

  return (
    <DialogContent className="max-w-xl overflow-hidden p-0">
      {/* HEADER */}
      <DialogHeader className="border-b bg-muted/30 px-6 py-5">
        <DialogTitle className="text-lg font-semibold">
          Detalhes do agendamento
        </DialogTitle>

        <DialogDescription className="mt-1">
          Informações da consulta e do paciente.
        </DialogDescription>

        <div
          className={cn(
            "mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            status.className
          )}
        >
          {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
          {status.label}
        </div>
      </DialogHeader>

      <div className="space-y-5 px-6 py-2 pb-6">
        {/* STATUS DO ATENDIMENTO */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status do atendimento
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isPending || currentStatus === "COMPLETED"}
              onClick={() => handleUpdateStatus("COMPLETED")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all disabled:cursor-not-allowed",
                currentStatus === "COMPLETED"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                  : "border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 text-muted-foreground"
              )}
            >
              {isPending && pendingStatus === "COMPLETED" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Concluída
            </button>

            <button
              type="button"
              disabled={isPending || currentStatus === "NO_SHOW"}
              onClick={() => handleUpdateStatus("NO_SHOW")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all disabled:cursor-not-allowed",
                currentStatus === "NO_SHOW"
                  ? "border-amber-500 bg-amber-500/10 text-amber-700"
                  : "border-border hover:border-amber-500/40 hover:bg-amber-500/5 text-muted-foreground"
              )}
            >
              {isPending && pendingStatus === "NO_SHOW" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Não compareceu
            </button>

            <button
              type="button"
              disabled={isPending || currentStatus === "CANCELED"}
              onClick={() => handleUpdateStatus("CANCELED")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all disabled:cursor-not-allowed",
                currentStatus === "CANCELED"
                  ? "border-rose-500 bg-rose-500/10 text-rose-700"
                  : "border-border hover:border-rose-500/40 hover:bg-rose-500/5 text-muted-foreground"
              )}
            >
              {isPending && pendingStatus === "CANCELED" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Cancelar
            </button>
          </div>

          {currentStatus !== "SCHEDULED" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleUpdateStatus("SCHEDULED")}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed"
            >
              {isPending && pendingStatus === "SCHEDULED" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Reverter para agendada
            </button>
          )}
        </section>

        {/* DATA E HORÁRIO */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Data</span>
            </div>

            <p className="text-sm font-semibold capitalize text-foreground">
              {appointmentWeekday}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {appointmentDateShort}
            </p>
          </div>

          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Horário</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {appointment.time} — {endTime}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {durationLabel}
            </p>
          </div>
        </div>

        {/* PACIENTE */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Paciente
          </h3>

          <div className="divide-y overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{appointment.name}</p>
                <p className="text-xs text-muted-foreground">Paciente</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{appointment.phone}</p>
                <p className="text-xs text-muted-foreground">Telefone</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{appointment.email}</p>
                <p className="text-xs text-muted-foreground">E-mail</p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVIÇO */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Serviço
          </h3>

          <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Stethoscope className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {appointment.service?.name ?? "Serviço removido"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Duração de {durationLabel}
                </p>
              </div>
            </div>

            {appointment.service && (
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-primary">
                  {formatCurrency(appointment.service.price / 100)}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DialogContent>
  )
}