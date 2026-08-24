import Link from "next/link"
import { notFound } from "next/navigation"

import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  UserX,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { getPatientById } from "../_data-acess/get-patient-by-id"
import { PatientDetails } from "../components/patient-details"
import { cn } from "@/lib/utils"
import { PatientAppointmentList } from "./components/patient-appointment-list"

interface PatientPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PatientPage({
  params,
}: PatientPageProps) {
  const { id } = await params

  const result = await getPatientById(id)

  if (!result.data) {
    notFound()
  }

  const patient = result.data

  const noShowCount =
    patient.appointments.filter(
      (appointment) => appointment.status === "NO_SHOW"
    ).length

  const totalAppointments = patient.appointments.length

  const noShowRate =
    totalAppointments > 0
      ? noShowCount / totalAppointments : 0

  const hasWarning =
    totalAppointments >= 5 && noShowRate >= 0.2

  const initials = patient.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase()

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6">

      {/* VOLTAR */}
      <div className="flex items-center">
        <Link
          href="/dashboard/patients"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para pacientes
        </Link>
      </div>

      {/* HEADER DO PACIENTE */}
      <Card className="overflow-hidden border-border/50 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            {/* IDENTIFICAÇÃO */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                {initials}
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {patient.name}
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Cadastro do paciente
                </p>
              </div>
            </div>

            {/* RESUMO */}
            <div className="grid grid-cols-2 gap-3 sm:flex">
              {/* CONSULTAS */}
              <div className="min-w-28 rounded-xl border border-border/50 bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Consultas
                  </p>

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                    <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>

                <p className="mt-2 text-xl font-bold tracking-tight">
                  {totalAppointments}
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  consultas realizadas
                </p>
              </div>

              {/* PRÓXIMAS */}
              <div className="min-w-28 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-primary/80">
                    Próximas
                  </p>

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarClock className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>

                <p className="mt-2 text-xl font-bold tracking-tight text-primary">
                  {patient.upcomingAppointments.length}
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  consultas agendadas
                </p>
              </div>

              {/* FALTAS */}
              <div
                className={cn(
                  "min-w-28 rounded-xl border px-4 py-3 transition-colors",
                  hasWarning
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-border/50 bg-card"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={cn(
                      "text-[11px] font-medium uppercase tracking-wide",
                      hasWarning
                        ? "text-amber-700"
                        : "text-muted-foreground"
                    )}
                  >
                    Faltas
                  </p>

                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      hasWarning
                        ? "bg-amber-500/10"
                        : "bg-muted"
                    )}
                  >
                    <UserX
                      className={cn(
                        "h-3.5 w-3.5",
                        hasWarning
                          ? "text-amber-600"
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                </div>

                <p
                  className={cn(
                    "mt-2 text-xl font-bold tracking-tight",
                    hasWarning
                      ? "text-amber-600"
                      : "text-foreground"
                  )}
                >
                  {noShowCount}
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {Math.round(noShowRate * 100)}% das consultas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONTEÚDO */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

        {/* CONSULTAS */}
        <div className="space-y-6">
          {/* PRÓXIMAS CONSULTAS */}
          <Card className="border-border/50 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-primary" />
                Próximas consultas
              </CardTitle>
            </CardHeader>

            <CardContent>
              <PatientAppointmentList
                appointments={patient.upcomingAppointments}
                emptyText="Nenhuma consulta futura agendada."
              />
            </CardContent>
          </Card>

          {/* HISTÓRICO */}
          <Card className="border-border/50 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4 text-primary" />
                Histórico de consultas
              </CardTitle>
            </CardHeader>

            <CardContent>
              <PatientAppointmentList
                appointments={patient.pastAppointments}
                emptyText="Nenhuma consulta anterior registrada."
              />
            </CardContent>
          </Card>
        </div>

        {/* DADOS DO PACIENTE */}
        <PatientDetails patient={patient} />

      </div>
    </main>
  )
}

function EmptyAppointments({
  text,
}: {
  text: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
      <CalendarDays className="mb-3 h-6 w-6 text-muted-foreground" />

      <p className="text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  )
}

function AppointmentList({
  appointments,
  past = false,
}: {
  appointments: Array<{
    id: string
    appointmentDate: Date | string
    service?: {
      name: string
    } | null
  }>
  past?: boolean
}) {
  return (
    <div className="space-y-3">
      {appointments.map((appointment) => {
        const date = new Date(appointment.appointmentDate)

        return (
          <div
            key={appointment.id}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3 transition-colors hover:bg-muted/20"
          >

            {/* DATA + SERVIÇO */}
            <div className="flex min-w-0 items-center gap-3">

              {/* DATA */}
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-[10px] font-medium uppercase">
                  {date
                    .toLocaleDateString("pt-BR", {
                      month: "short",
                    })
                    .replace(".", "")}
                </span>

                <span className="text-sm font-bold">
                  {date.getDate()}
                </span>
              </div>

              {/* SERVIÇO */}
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

            {/* HORÁRIO */}
            <div className="ml-4 shrink-0 text-right">
              <p className="text-sm font-semibold">
                {date.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <p className="text-[11px] text-muted-foreground">
                {past ? "Realizada" : "Agendada"}
              </p>
            </div>

          </div>
        )
      })}
    </div>
  )
}