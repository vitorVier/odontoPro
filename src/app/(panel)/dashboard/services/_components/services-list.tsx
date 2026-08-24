"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import {
  Pencil,
  Plus,
  Trash2,
  Clock,
  Banknote,
  Stethoscope,
  AlertCircle,
  ArrowRight,
} from "lucide-react"

import { DialogService } from "./dialog-service"
import { Service } from "@prisma/client"
import { formatCurrency } from "@/utils/formatCurrency"
import { deleteService } from "../_actions/delete-service"
import { toast } from "sonner"
import { ResultPermissionProp } from "@/utils/permissions/canPermission"
import Link from "next/link"

interface ServicesListProps {
  services: Service[]
  permission: ResultPermissionProp
}

export function ServicesList({
  services,
  permission,
}: ServicesListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] =
    useState<Service | null>(null)

  const servicesList = permission.hasPermission
    ? services
    : services.slice(0, 3)

  async function handleDeleteService(serviceId: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja remover este serviço?\n\nEssa ação não poderá ser desfeita."
    )

    if (!confirmed) return

    const response = await deleteService({ serviceId })

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success(response.data)
  }

  function handleEditService(service: Service) {
    setEditingService(service)
    setIsDialogOpen(true)
  }

  function handleNewService() {
    setEditingService(null)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingService(null)
  }

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}min`
    }

    if (hours > 0) {
      return `${hours}h`
    }

    return `${remainingMinutes}min`
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open)

        if (!open) {
          setEditingService(null)
        }
      }}
    >
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {permission.hasPermission ? (
            <div className="w-full flex justify-end">
              <DialogTrigger asChild>
                <Button
                  type="button"
                  onClick={handleNewService}
                  className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Novo serviço
                </Button>
              </DialogTrigger>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <span className="text-center text-xs font-medium text-rose-600 sm:text-left">
                Limite do plano atingido
              </span>

              <Button
                asChild
                variant="outline"
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 sm:w-auto"
              >
                <Link
                  href="/dashboard/plans"
                  className="gap-2"
                >
                  Fazer upgrade
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        <DialogContent
          className="sm:max-w-lg"
          onInteractOutside={(event) => {
            event.preventDefault()
          }}
        >
          <DialogService
            closeModal={handleCloseDialog}
            serviceId={
              editingService
                ? editingService.id
                : undefined
            }
            initialValues={
              editingService
                ? {
                    name: editingService.name,
                    price: (
                      editingService.price / 100
                    )
                      .toFixed(2)
                      .replace(".", ","),
                    hours: Math.floor(
                      editingService.duration / 60
                    ).toString(),
                    minutes: (
                      editingService.duration % 60
                    ).toString(),
                  }
                : undefined
            }
          />
        </DialogContent>

        {servicesList.length === 0 ? (
          <Card className="border-dashed border-gray-300 bg-gray-50/50 shadow-none">
            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border bg-white shadow-sm">
                <Stethoscope className="h-7 w-7 text-emerald-500" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                Seu catálogo está vazio
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Cadastre os procedimentos da sua clínica para que
                eles possam ser utilizados durante os agendamentos.
              </p>

              {permission.hasPermission && (
                <Button
                  type="button"
                  onClick={handleNewService}
                  className="mt-6 gap-2 bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar primeiro serviço
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl-grid-cols-5 gap-4">
              {servicesList.map((service) => (
                <Card
                  key={service.id}
                  className="group relative overflow-hidden border-gray-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <CardHeader className="p-5 pb-3">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0 flex-1">
                        <CardTitle className="line-clamp-2 text-base font-semibold leading-snug">
                          {service.name}
                        </CardTitle>

                        <CardDescription className="mt-1">
                          Procedimento odontológico
                        </CardDescription>
                      </div>

                      {/* AÇÕES */}
                      <div className="flex shrink-0 items-center gap-1 rounded-lg border bg-white p-0.5 shadow-sm">

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                          onClick={() =>
                            handleEditService(service)
                          }
                          title="Editar serviço"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() =>
                            handleDeleteService(
                              service.id
                            )
                          }
                          title="Remover serviço"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-5 pt-2">

                    {/* PREÇO */}
                    <div className="flex items-end justify-between">

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Valor
                        </p>

                        <div className="mt-1 flex items-center gap-1.5">
                          <Banknote className="h-4 w-4 text-emerald-500" />

                          <span className="text-xl font-bold tracking-tight text-gray-900">
                            {formatCurrency(
                              service.price / 100
                            )}
                          </span>
                        </div>
                      </div>

                      {/* STATUS */}
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          service.status
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {service.status
                          ? "Ativo"
                          : "Inativo"}
                      </span>
                    </div>

                    {/* DURAÇÃO */}
                    <div className="flex items-center gap-2 border-t pt-3 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-emerald-500/80" />

                      <span>
                        Duração:{" "}
                        <strong className="font-medium text-gray-700">
                          {formatDuration(
                            service.duration
                          )}
                        </strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!permission.hasPermission &&
              services.length > 3 && (
                <Card className="border-emerald-100 bg-emerald-50/40 shadow-none">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-3">

                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-emerald-100">
                        <AlertCircle className="h-4 w-4 text-emerald-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Seu plano possui um limite de serviços
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          Você possui{" "}
                          <strong>
                            {services.length - 3}
                          </strong>{" "}
                          {services.length - 3 === 1
                            ? "serviço oculto"
                            : "serviços ocultos"}{" "}
                          no seu catálogo atual.
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 sm:w-auto"
                    >
                      <Link
                        href="/dashboard/plans"
                        className="gap-2"
                      >
                        Ver planos
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
          </>
        )}
      </div>
    </Dialog>
  )
}