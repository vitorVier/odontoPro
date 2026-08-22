import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarDays,
  ChevronRight,
  Mail,
  Phone,
  Users,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { getPatients } from "./_data-acess/get-patients"
import { PatientsSearchInput } from "./components/patients-search-input"

interface PatientsPageProps {
  searchParams: Promise<{
    search?: string
  }>
}

function formatDate(date: Date | null) {
  if (!date) return "Nenhuma visita"

  return format(new Date(date), "dd/MM/yyyy", {
    locale: ptBR,
  })
}

export default async function PatientsPage({
  searchParams,
}: PatientsPageProps) {
  const params = await searchParams
  const search = params.search?.trim() || ""

  const result = await getPatients({
    search: search || undefined,
  })

  const patients = result.data ?? []

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">

      {/* HEADER */}
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-lg font-bold tracking-tight sm:text-xl">
                Pacientes
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Gerencie os pacientes da sua clínica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-fit rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              {patients.length}{" "}
              {patients.length === 1 ? "paciente" : "pacientes"}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* CONTEÚDO */}
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <CardTitle className="text-base font-semibold">
                Lista de pacientes
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Consulte informações e histórico de atendimento.
              </p>
            </div>

            {/* BUSCA */}
            <PatientsSearchInput defaultValue={search} />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {patients.length === 0 ? (
            <div className="flex min-h-90 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>

              <h3 className="text-base font-semibold">
                {search
                  ? "Nenhum paciente encontrado"
                  : "Nenhum paciente cadastrado"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {search
                  ? `Não encontramos pacientes para "${search}".`
                  : "Os pacientes cadastrados pela clínica aparecerão aqui."}
              </p>

              {search && (
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 rounded-xl"
                >
                  <Link href="/dashboard/patients">
                    Limpar busca
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/50">

              {patients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/dashboard/patients/${patient.id}`}
                  className="group block transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">

                    {/* IDENTIFICAÇÃO */}
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {patient.name
                          .split(" ")
                          .slice(0, 2)
                          .map((name) => name[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
                          {patient.name}
                        </h3>

                        <div className="mt-1 flex flex-col gap-y-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4">

                          {patient.phone && (
                            <span className="flex min-w-0 items-center gap-1">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{patient.phone}</span>
                            </span>
                          )}

                          {patient.email && (
                            <span className="flex min-w-0 items-center gap-1">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{patient.email}</span>
                            </span>
                          )}

                        </div>
                      </div>
                    </div>

                    {/* INFORMAÇÕES */}
                    <div className="ml-15 grid grid-cols-2 gap-4 sm:ml-15 sm:gap-6 md:ml-0 md:flex md:items-center md:gap-10">

                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Consultas
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {patient.totalAppointments}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Última visita
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          {formatDate(patient.lastVisit)}
                        </p>
                      </div>

                      <ChevronRight className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary md:block" />
                    </div>
                  </div>
                </Link>
              ))}

            </div>
          )}

        </CardContent>
      </Card>
    </main>
  )
}