"use client"
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Plus, Trash2, Clock, Banknote, Stethoscope, AlertCircle, ArrowRight } from 'lucide-react'
import { DialogService } from './dialog-service'
import { Service } from '@prisma/client'
import { formatCurrency } from '@/utils/formatCurrency'
import { deleteService } from '../_actions/delete-service'
import { toast } from 'sonner'
import { ResultPermissionProp } from '@/utils/permissions/canPermission'
import Link from 'next/link'

interface ServicesListProps {
  services: Service[];
  permission: ResultPermissionProp;
}

export function ServicesList({ services, permission }: ServicesListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<null | Service>(null)

  const servicesList = permission.hasPermission ? services : services.slice(0, 3);

  async function handleDeleteService(serviceId: string) {
    if (!window.confirm("Tem certeza que deseja remover este serviço?")) return;

    const response = await deleteService({ serviceId: serviceId })

    if (response.error) {
      toast.error(response.error)
      return;
    }

    toast.success(response.data)
  }

  function handleEditService(service: Service) {
    setEditingService(service);
    setIsDialogOpen(true);
  }

  function formatDuration(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    return `${m}m`
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingService(null);
      }}
    >
      <div className="space-y-6">
        {/* Cabeçalho da Seção de Serviços */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Catálogo de Serviços</h2>
            <p className="text-sm text-muted-foreground">
              {services.length} {services.length === 1 ? "serviço cadastrado" : "serviços cadastrados"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {permission.hasPermission ? (
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className='w-4 h-4' />
                  <span>Novo Serviço</span>
                </Button>
              </DialogTrigger>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                  Limite atingido
                </span>
                <Button asChild variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                  <Link href="/dashboard/plans" className="gap-2">
                    Fazer Upgrade
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Formulário */}
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
            setIsDialogOpen(false);
            setEditingService(null)
          }}
        >
          <DialogService
            closeModal={() => {
              setIsDialogOpen(false);
              setEditingService(null);
            }}
            serviceId={editingService ? editingService.id : undefined}
            initialValues={editingService ? {
              name: editingService.name,
              price: (editingService.price / 100).toFixed(2).replace(".", ','),
              hours: Math.floor(editingService.duration / 60).toString(),
              minutes: (editingService.duration % 60).toString()
            } : undefined}
          />
        </DialogContent>

        {/* Lista de Serviços */}
        {servicesList.length === 0 ? (
          <Card className="border-dashed shadow-none bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-background rounded-full border mb-4">
                <Stethoscope className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhum serviço cadastrado</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Você ainda não adicionou nenhum serviço. Clique no botão acima para cadastrar seu primeiro procedimento.
              </p>
              {permission.hasPermission && (
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className='w-4 h-4' />
                  Adicionar Serviço
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicesList.map(service => (
              <Card key={service.id} className="group overflow-hidden border-border/60 hover:border-emerald-500/30 hover:shadow-md transition-all duration-200">
                <CardHeader className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                      {service.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2 bg-background/80 backdrop-blur-sm rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={() => handleEditService(service)}
                        title="Editar"
                      >
                        <Pencil className='w-4 h-4' />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteService(service.id)}
                        className="h-8 w-8 text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Remover"
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-emerald-500/70" />
                    <span>Duração: {formatDuration(service.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Banknote className="w-4 h-4 text-emerald-500/70" />
                    <span className="font-medium text-foreground">
                      {formatCurrency(service.price / 100)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Alerta de Paywall Inline caso o usuário não tenha permissão e tenha serviços extras (mas só exibe os 3) */}
        {!permission.hasPermission && services.length > 3 && (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-dashed border-border/60">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <AlertCircle className="w-5 h-5" />
              <p>Você tem mais <strong>{services.length - 3} serviços</strong> ocultos devido ao limite do seu plano atual.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/plans">Ver Planos</Link>
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  )
}