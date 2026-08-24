"use client"

import { useState } from "react"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  Banknote,
} from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { TransactionFormData, useTransactionForm } from "./transaction-form"
import { createTransaction } from "../_actions/create-transaction"

import { cn } from "@/lib/utils"
import { handleCurrencyChange } from "../../services/_components/dialog-service"

interface CreateTransactionDialogProps {
  onCreated: () => void
}

export function CreateTransactionDialog({
  onCreated,
}: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useTransactionForm()

  const type = form.watch("type")
  const dueDate = form.watch("dueDate")

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: TransactionFormData) {
    try {
      /**
       * O campo amount é string visualmente:
       * "1.234,56"
       *
       * Precisamos transformar para número antes de enviar.
       */
      const numericAmount = Number(
        String(values.amount)
          .replace(/\./g, "")
          .replace(",", ".")
      )

      const formattedValues = {
        ...values,
        amount: numericAmount,
      }

      const response = await createTransaction(formattedValues)

      if (response.error) {
        throw new Error(response.error)
      }

      toast.success(response.data)

      form.reset()

      setOpen(false)

      onCreated()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao salvar o lançamento."
      )
    }
  }

  function handleClose() {
        if (isSubmitting) return

        form.reset()

        setOpen(false)
    }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          handleClose()
          return
        }

        setOpen(value)
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo lançamento
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Novo lançamento
          </DialogTitle>

          <DialogDescription>
            Registre uma conta a pagar ou a receber.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-5"
          >
            {/* TIPO */}
            <div className="space-y-2">
              <Label className="text-xs">
                Tipo de lançamento
              </Label>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={
                    type === "INCOME"
                      ? "default"
                      : "outline"
                  }
                  className={cn(
                    type === "INCOME" &&
                      "bg-emerald-600 hover:bg-emerald-500"
                  )}
                  onClick={() =>
                    form.setValue("type", "INCOME", {
                      shouldValidate: true,
                    })
                  }
                >
                  A receber
                </Button>

                <Button
                  type="button"
                  variant={
                    type === "EXPENSE"
                      ? "default"
                      : "outline"
                  }
                  className={cn(
                    type === "EXPENSE" &&
                      "bg-rose-600 hover:bg-rose-500"
                  )}
                  onClick={() =>
                    form.setValue("type", "EXPENSE", {
                      shouldValidate: true,
                    })
                  }
                >
                  A pagar
                </Button>
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Descrição
                  </FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Aluguel, Material odontológico, Consulta particular..."
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* VALOR + CATEGORIA */}
            <div className="grid grid-cols-2 gap-3">
                <FormField
  control={form.control}
  name="amount"
  render={({ field }) => {
    const displayValue =
      field.value !== undefined &&
      field.value !== null &&
      field.value !== 0
        ? Number(field.value)
            .toFixed(2)
            .replace(".", ",")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        : ""

    return (
      <FormItem>
        <FormLabel className="flex items-center gap-1.5 font-semibold text-gray-700">
          <Banknote className="h-4 w-4 text-emerald-600" />
          Valor
        </FormLabel>

        <FormControl>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm font-medium text-gray-500">
              R$
            </span>

            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              className="pl-9"
              value={displayValue}
              onChange={(e) =>
                handleCurrencyChange(
                  e,
                  field.onChange,
                  { output: "number" }
                )
              }
            />
          </div>
        </FormControl>

        <FormMessage />
      </FormItem>
    )
  }}
/>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Categoria
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Material"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* DATA DE VENCIMENTO */}
            <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">
                        Vencimento
                    </FormLabel>

                    <Popover>
                        <PopoverTrigger
                        type="button"
                        className={cn(
                            "flex h-10 w-full items-center rounded-md border border-input",
                            "bg-background px-3 text-sm",
                            "cursor-pointer",
                            "hover:bg-muted/50",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />

                        <span>
                            {field.value
                            ? format(field.value, "dd/MM/yyyy", {
                                locale: ptBR,
                                })
                            : "Selecione a data"}
                        </span>
                        </PopoverTrigger>

                        <PopoverContent
                            align="start"
                            className="z-100 w-auto p-0 pointer-events-auto"
                        >
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                            if (!date) return

                            field.onChange(date)
                            }}
                            locale={ptBR}
                            autoFocus
                        />
                        </PopoverContent>
                    </Popover>

                    <FormMessage />
                    </FormItem>
                )}
                />

            {/* AÇÕES */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="w-full font-semibold sm:flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar lançamento"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}