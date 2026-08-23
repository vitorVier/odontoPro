"use client"

import { useMemo, useState } from "react"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
  CalendarDays,
  CalendarOff,
  Clock3,
  Loader2,
  Repeat,
} from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  ScheduleBlockFormData,
  useScheduleBlockForm,
} from "./schedule-block-form"

import { createScheduleBlock } from "../_actions/create-schedule-block"

import { generateTimeSlots } from "@/utils/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ScheduleBlockDialogProps {
  clinicTimes: string[]
  onCreated: () => void
}

export function ScheduleBlockDialog({
  clinicTimes,
  onCreated,
}: ScheduleBlockDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useScheduleBlockForm()

  const mode = form.watch("mode")
  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")
  const startTime = form.watch("startTime")
  const endTime = form.watch("endTime")
  const reason = form.watch("reason")

  const hours = useMemo(
    () => generateTimeSlots(clinicTimes),
    [clinicTimes]
  )

  /**
   * Data mínima permitida para seleção.
   *
   * Mantemos isso como Date, evitando passar Date | null
   * para propriedades que esperam Date.
   */
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  function handleModeChange(value: string) {
    const newMode = value as ScheduleBlockFormData["mode"]

    form.setValue("mode", newMode)

    // Mantém a lógica anterior:
    // ao trocar o modo, limpa os horários.
    form.setValue("startTime", "")
    form.setValue("endTime", "")

    // Ao entrar no modo específico/recorrente,
    // garantimos uma data inicial.
    if (!startDate) {
      form.setValue("startDate", today)
    }

    if (newMode === "specific" && !endDate) {
      form.setValue("endDate", startDate ?? today)
    }
  }

  async function onSubmit(values: ScheduleBlockFormData) {
    setIsSubmitting(true)

    try {
      const response = await createScheduleBlock({
        startDate: values.startDate,

        endDate:
          values.mode === "recurring"
            ? values.startDate
            : values.endDate,

        startTime:
          values.mode === "range"
            ? undefined
            : values.startTime,

        endTime:
          values.mode === "range"
            ? undefined
            : values.endTime,

        recurring: values.mode === "recurring",

        reason: values.reason,
      })

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success(response.data)

      onCreated()

      form.reset()

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Não foi possível criar o bloqueio.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)

    if (!value) {
      form.reset()
    }
  }

  const periodLabel = useMemo(() => {
    if (!startDate) {
      return "Selecione o período"
    }

    if (mode === "range") {
      if (!endDate) {
        return `${format(startDate, "dd/MM/yyyy")} — selecione a data final`
      }

      return `${format(startDate, "dd/MM/yyyy")} até ${format(
        endDate,
        "dd/MM/yyyy"
      )}`
    }

    if (mode === "specific") {
      return format(startDate, "dd/MM/yyyy")
    }

    return "A partir de hoje"
  }, [startDate, endDate, mode])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl"
        >
          <CalendarOff className="h-4 w-4" />
          Bloquear horário
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          max-h-[90vh]
          w-[calc(100%-24px)]
          max-w-2xl
          overflow-y-auto
          rounded-2xl
          p-0
        "
      >
        {/* HEADER */}
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <CalendarOff className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-lg font-bold tracking-tight">
                Bloquear agenda
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm leading-relaxed">
                Configure férias, feriados, folgas ou horários de
                indisponibilidade.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-5 py-2">
          {/* TIPO DE BLOQUEIO */}
          <Tabs
            value={mode}
            onValueChange={handleModeChange}
            className="w-full flex flex-col"
          >
            <TabsList className="h-auto w-full rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="range"
                className="flex h-12 flex-col gap-0.5 rounded-lg text-xs sm:flex-row sm:gap-2 sm:text-sm"
              >
                <CalendarDays className="h-4 w-4" />
                <span>Período</span>
              </TabsTrigger>

              <TabsTrigger
                value="specific"
                className="flex h-12 flex-col gap-0.5 rounded-lg text-xs sm:flex-row sm:gap-2 sm:text-sm"
              >
                <Clock3 className="h-4 w-4" />
                <span>Horário</span>
              </TabsTrigger>

              <TabsTrigger
                value="recurring"
                className="flex h-12 flex-col gap-0.5 rounded-lg text-xs sm:flex-row sm:gap-2 sm:text-sm"
              >
                <Repeat className="h-4 w-4" />
                <span>Recorrente</span>
              </TabsTrigger>
            </TabsList>

            {/* PERÍODO */}
            <TabsContent
              value="range"
              className="mt-1 space-y-4"
            >
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">
                    Bloqueio de dia inteiro
                  </p>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Ideal para férias, feriados e folgas. Selecione
                    a data inicial e, depois, a data final.
                  </p>
                </div>

                <div className="flex justify-center">
                  <Calendar
                    mode="range"
                    selected={
                      startDate
                        ? {
                            from: startDate,
                            to: endDate ?? undefined,
                          }
                        : undefined
                    }
                    onSelect={(range) => {
                      if (!range) {
                        return
                      }

                      if (range.from) {
                        form.setValue(
                          "startDate",
                          range.from
                        )
                      }

                      if (range.to) {
                        form.setValue(
                          "endDate",
                          range.to
                        )
                      }
                    }}
                    locale={ptBR}
                    disabled={(date) => date < today}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-primary/5 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Período selecionado
                </p>

                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {periodLabel}
                </p>
              </div>
            </TabsContent>

            {/* HORÁRIO ESPECÍFICO */}
            <TabsContent
              value="specific"
              className="mt-1 space-y-4"
            >
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">
                    Horário específico
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Use para consultas pessoais, compromissos ou
                    indisponibilidades pontuais.
                  </p>
                </div>

                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={startDate ?? undefined}
                    onSelect={(date) => {
                      if (!date) {
                        return
                      }

                      form.setValue(
                        "startDate",
                        date
                      )

                      form.setValue(
                        "endDate",
                        date
                      )
                    }}
                    locale={ptBR}
                    disabled={(date) => date < today}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* INÍCIO */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Horário inicial
                  </Label>

                  <Select
                    value={startTime}
                    onValueChange={(value) => form.setValue("startTime", value)}
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl">
                      <SelectValue placeholder="Selecione o início" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* FIM */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Horário final
                  </Label>

                  <Select
                    value={endTime}
                    onValueChange={(value) => form.setValue("endTime", value)}
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl">
                      <SelectValue placeholder="Selecione o fim" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {startDate && (
                <div className="rounded-xl bg-primary/5 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Bloqueio
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {format(startDate, "dd/MM/yyyy")}
                    {startTime && endTime
                      ? ` · ${startTime} às ${endTime}`
                      : ""}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* RECORRENTE */}
            <TabsContent
              value="recurring"
              className="mt-1 space-y-4"
            >
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Repeat className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Bloqueio recorrente
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      O horário será bloqueado todos os dias.
                      Ideal para almoço ou outro horário fixo de
                      indisponibilidade.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* INÍCIO */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Horário inicial
                  </Label>

                  <Select
                    value={startTime}
                    onValueChange={(value) => form.setValue("startTime", value)}
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl">
                      <SelectValue placeholder="Selecione o início" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* FIM */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Horário final
                  </Label>

                  <Select
                    value={endTime}
                    onValueChange={(value) => form.setValue("endTime", value)}
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl">
                      <SelectValue placeholder="Selecione o fim" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {startTime && endTime && (
                <div className="rounded-xl bg-primary/5 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Recorrência
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    Todos os dias · {startTime} às {endTime}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* MOTIVO */}
          <div className="space-y-2">
            <Label
              htmlFor="schedule-block-reason"
              className="text-xs font-medium"
            >
              Motivo
              <span className="ml-1 font-normal text-muted-foreground">
                (opcional)
              </span>
            </Label>

            <Textarea
              id="schedule-block-reason"
              placeholder="Ex.: Férias, feriado nacional, almoço, consulta médica..."
              value={reason}
              onChange={(event) =>
                form.setValue(
                  "reason",
                  event.target.value
                )
              }
              className="min-h-20 resize-none rounded-xl"
              rows={3}
            />
          </div>

          {/* ERROS */}
          <div className="space-y-1">
            {form.formState.errors.endDate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.endDate.message}
              </p>
            )}

            {form.formState.errors.startTime && (
              <p className="text-sm text-destructive">
                {form.formState.errors.startTime.message}
              </p>
            )}

            {form.formState.errors.endTime && (
              <p className="text-sm text-destructive">
                {form.formState.errors.endTime.message}
              </p>
            )}
          </div>

          {/* AÇÃO */}
          <div className="border-t pt-4">
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando bloqueio...
                </>
              ) : (
                <>
                  <CalendarOff className="h-4 w-4" />
                  Confirmar bloqueio
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}