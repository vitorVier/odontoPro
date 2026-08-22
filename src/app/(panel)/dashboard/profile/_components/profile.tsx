"use client"
import { useState } from 'react'
import { ProfileFormData, useProfileForm } from './profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

import { Prisma } from '@prisma/client'
import { updateProfile } from '../_actions/update-profile'
import { toast } from 'sonner'
import { formatPhone } from '@/utils/formatPhone'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AvatarProfile } from './profile-avatar'
import { WeekDaysSelector } from './week-days-selector'

type UserWithSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true
  }
}>

interface ProfileContentProps {
  user: UserWithSubscription;
}

export function ProfileContent({ user }: ProfileContentProps) {

  const router = useRouter();
  const [selectedHours, setSelectedHours] = useState<string[]>(user.times ?? [])
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const { update } = useSession();

  const form = useProfileForm({
    name: user.name,
    address: user.address,
    phone: user.phone,
    status: user.status,
    timeZone: user.timeZone,
    weekDays: user.weekDays
  });


  function generateTimeSlots(): string[] {
    const hours: string[] = [];

    for (let i = 0; i <= 23; i++) {
      for (let j = 0; j < 2; j++) {
        const hour = i.toString().padStart(2, "0")
        const minute = (j * 30).toString().padStart(2, "0")
        hours.push(`${hour}:${minute}`)
      }
    }

    return hours;
  }
  
  const hours = generateTimeSlots();

  function toggleHour(hour: string) {
    setSelectedHours((prev) => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour].sort())
  }

  const timeZones = Intl.supportedValuesOf("timeZone").filter((zone) =>
    zone.startsWith("America/Sao_Paulo") ||
    zone.startsWith("America/Fortaleza") ||
    zone.startsWith("America/Recife") ||
    zone.startsWith("America/Bahia") ||
    zone.startsWith("America/Belem") ||
    zone.startsWith("America/Manaus") ||
    zone.startsWith("America/Cuiaba") ||
    zone.startsWith("America/Boa_Vista")
  );

  async function onSubmit(values: ProfileFormData) {
    const response = await updateProfile({
      name: values.name,
      address: values.address,
      status: values.status === 'active' ? true : false,
      phone: values.phone,
      timeZone: values.timeZone,
      times: selectedHours || [],
      weekDays: values.weekDays,
    })

    if (response.error) {
      toast.error(response.error)
      return;
    }

    toast.success(response.data)
  }

  async function handleLogout() {
    await signOut();
    await update();
    router.replace("/")
  }

  return (
  <div className="mx-auto w-full">
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg">
              Perfil da clínica
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Informações que serão apresentadas aos seus pacientes.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <AvatarProfile
                avatarUrl={user.image}
                userId={user.id}
              />

              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  Foto da clínica
                </p>

                <p className="text-xs text-muted-foreground">
                  Clique na imagem para alterar
                </p>
              </div>
            </div>

            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Nome da clínica
                  </FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex.: Odonto Sorriso"
                      className="h-11"
                    />
                  </FormControl>

                  <p className="text-xs text-muted-foreground">
                    Esse nome será exibido na página pública da clínica.
                  </p>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg">
              Informações de contato
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Mantenha seus dados atualizados para facilitar o contato
              com seus pacientes.
            </p>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            {/* Endereço */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Endereço completo
                  </FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Rua, número, bairro, cidade - UF"
                      className="h-11"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Telefone
                  </FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="(55) 99999-9999"
                      className="h-11"
                      onChange={(e) => {
                        const formattedValue = formatPhone(
                          e.target.value
                        )

                        field.onChange(formattedValue)
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg">
              Funcionamento
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Defina os dias e horários disponíveis para atendimento.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">

            {/* Dias */}
            <FormField
              control={form.control}
              name="weekDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Dias de atendimento
                  </FormLabel>

                  <FormControl>
                    <WeekDaysSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>

                  <p className="text-xs text-muted-foreground">
                    Selecione os dias em que a clínica realiza
                    atendimentos.
                  </p>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horários */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Horários disponíveis
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedHours.length > 0
                      ? `${selectedHours.length} horários selecionados`
                      : "Nenhum horário selecionado"}
                  </p>
                </div>

                <Dialog
                  open={dialogIsOpen}
                  onOpenChange={setDialogIsOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                    >
                      Configurar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Horários da clínica
                      </DialogTitle>

                      <DialogDescription>
                        Selecione os horários em que sua clínica
                        estará disponível para agendamento.
                      </DialogDescription>
                    </DialogHeader>

                    <section className="py-4">
                      <p className="mb-3 text-sm text-muted-foreground">
                        Clique nos horários para selecionar ou remover.
                      </p>

                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                        {hours.map((hour) => {
                          const selected =
                            selectedHours.includes(hour)

                          return (
                            <Button
                              key={hour}
                              type="button"
                              variant={
                                selected
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                selected
                                  ? "bg-emerald-500 hover:bg-emerald-600"
                                  : ""
                              }
                              onClick={() => toggleHour(hour)}
                            >
                              {hour}
                            </Button>
                          )
                        })}
                      </div>
                    </section>

                    <div className="flex justify-between gap-2 border-t pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedHours([])}
                      >
                        Limpar horários
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setDialogIsOpen(false)}
                      >
                        Concluir
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Preview dos horários */}
              {selectedHours.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    Horários selecionados
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedHours.map((hour) => (
                      <span
                        key={hour}
                        className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700"
                      >
                        {hour}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg">
              Preferências
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Configurações utilizadas pelo sistema de agendamento.
            </p>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            <FormField
              control={form.control}
              name="timeZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Fuso horário
                  </FormLabel>

                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione o fuso horário" />
                      </SelectTrigger>

                      <SelectContent>
                        {timeZones.map((zone) => (
                          <SelectItem
                            key={zone}
                            value={zone}
                          >
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <p className="text-xs text-muted-foreground">
                    Os horários dos agendamentos serão calculados
                    utilizando este fuso horário.
                  </p>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg">
              Status da clínica
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Controle se sua clínica está disponível para novos
              agendamentos.
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={
                        field.value
                          ? "active"
                          : "inactive"
                      }
                      onValueChange={(value) => {
                        field.onChange(
                          value === "active"
                        )
                      }}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="active">
                          ATIVA — disponível para agendamentos
                        </SelectItem>

                        <SelectItem value="inactive">
                          INATIVA — não receberá novos agendamentos
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-11 bg-emerald-500 px-8 hover:bg-emerald-600"
          >
            {form.formState.isSubmitting
              ? "Salvando alterações..."
              : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Form>

    <div className="border-t border-gray-200 pt-6">
      <Button
        type="button"
        variant="destructive"
        onClick={handleLogout}
      >
        Sair da conta
      </Button>
    </div>
  </div>
)
}