"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarDays,
  Edit3,
  Mail,
  Phone,
  Save,
  UserRound,
} from "lucide-react"

import { updatePatient } from "../_data-acess/update-patient"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Calendar } from "@/components/ui/calendar"

import { cn } from "@/lib/utils"

interface PatientDetailsProps {
  patient: {
    id: string
    name: string
    email: string | null
    phone: string
    birthDate: Date | null
    notes: string | null
  }
}

export function PatientDetails({
  patient,
}: PatientDetailsProps) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(patient.name)
  const [phone, setPhone] = useState(patient.phone)
  const [birthDate, setBirthDate] = useState<Date | null>(
    patient.birthDate
      ? new Date(patient.birthDate)
      : null
  )
  const [notes, setNotes] = useState(patient.notes ?? "")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setError("")
    setSuccess("")

    const result = await updatePatient({
      patientId: patient.id,
      name,
      phone,
      birthDate,
      notes,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(result.data ?? "Paciente atualizado com sucesso!")
    setEditing(false)
    setLoading(false)
  }

  function handleCancel() {
    setName(patient.name)
    setPhone(patient.phone)

    setBirthDate(
      patient.birthDate
        ? new Date(patient.birthDate)
        : null
    )

    setNotes(patient.notes ?? "")

    setError("")
    setSuccess("")
    setEditing(false)
  }

  return (
    <Card className="h-fit border-border/50 shadow-xs">

      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserRound className="h-4 w-4 text-primary" />
          Dados do paciente
        </CardTitle>

        {!editing && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
            onClick={() => {
              setError("")
              setSuccess("")
              setEditing(true)
            }}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Editar
          </Button>
        )}
      </CardHeader>

      <CardContent>

        {!editing ? (
          <div className="space-y-5">

            <InfoRow
              icon={UserRound}
              label="Nome completo"
              value={patient.name}
            />

            <InfoRow
              icon={Phone}
              label="Telefone"
              value={patient.phone || "Não informado"}
            />

            <InfoRow
              icon={Mail}
              label="E-mail"
              value={patient.email || "Não informado"}
            />

            <InfoRow
              icon={CalendarDays}
              label="Data de nascimento"
              value={
                patient.birthDate
                  ? format(
                      new Date(patient.birthDate),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    )
                  : "Não informado"
              }
            />

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Observações
              </p>

              <div className="rounded-xl bg-muted/30 p-3 text-sm leading-relaxed">
                {patient.notes?.trim()
                  ? patient.notes
                  : "Nenhuma observação registrada."}
              </div>
            </div>

            {success && (
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* NOME */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome completo
              </Label>

              <Input
                id="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Nome do paciente"
                className="rounded-xl"
                required
              />
            </div>

            {/* TELEFONE */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone
              </Label>

              <Input
                id="phone"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="(00) 00000-0000"
                className="rounded-xl"
                required
              />
            </div>

            {/* E-MAIL */}
            <div className="space-y-2">
              <Label>
                E-mail
              </Label>

              <Input
                value={patient.email ?? ""}
                disabled
                className="rounded-xl bg-muted/40"
              />

              <p className="text-[11px] text-muted-foreground">
                O e-mail não pode ser alterado por esta tela.
              </p>
            </div>

            {/* DATA DE NASCIMENTO */}
            <div className="space-y-2">
              <Label>
                Data de nascimento
              </Label>

              <Popover>
                <PopoverTrigger
                    type="button"
                    className={cn(
                    "inline-flex h-9 w-full items-center justify-start gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm font-normal shadow-xs transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    !birthDate && "text-muted-foreground"
                    )}
                >
                    <CalendarDays className="h-4 w-4" />

                    {birthDate
                    ? format(birthDate, "dd/MM/yyyy", {
                        locale: ptBR,
                        })
                    : "Selecione uma data"}
                </PopoverTrigger>

                <PopoverContent
                    className="w-auto p-0"
                    align="start"
                >
                    <Calendar
                    mode="single"
                    selected={birthDate ?? undefined}
                    onSelect={(date) => setBirthDate(date ?? null)}
                    locale={ptBR}
                    />
                </PopoverContent>
                </Popover>
            </div>

            {/* OBSERVAÇÕES */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Observações
              </Label>

              <Textarea
                id="notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Observações sobre o paciente..."
                className="min-h-28 resize-none rounded-xl"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">

              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="flex-1 gap-2 rounded-xl"
                disabled={loading}
              >
                <Save className="h-4 w-4" />

                {loading
                  ? "Salvando..."
                  : "Salvar alterações"}
              </Button>

            </div>

          </form>
        )}

      </CardContent>
    </Card>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string
  }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>

        <p className="mt-0.5 wrap-break-words text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  )
}