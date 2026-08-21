"use client"

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useDialogServiceForm, DialogServiceFormData } from "./dialog-service-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { convertRealToCents } from '@/utils/convertCurrency'
import { createNewService } from '../_actions/create-service'
import { updateService } from '../_actions/update-service'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { Loader2, Tag, Banknote, Clock } from "lucide-react"

interface DialogServiceProps {
  closeModal: () => void;
  serviceId?: string;
  initialValues?: {
    name: string;
    price: string;
    hours: string;
    minutes: string;
  }
}

export function DialogService({ closeModal, initialValues, serviceId }: DialogServiceProps) {
  const form = useDialogServiceForm({ initialValues })
  const router = useRouter();
  
  const isEditing = !!serviceId;
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: DialogServiceFormData) {
    try {
      const priceInCents = convertRealToCents(values.price)
      const hours = parseInt(values.hours) || 0;
      const minutes = parseInt(values.minutes) || 0;
      const duration = (hours * 60) + minutes;

      if (isEditing) {
        const response = await updateService({
          serviceId: serviceId,
          name: values.name,
          price: priceInCents,
          duration: duration
        });

        if (response.error) throw new Error(response.error);
        toast.success("Serviço atualizado com sucesso!");
      } else {
        const response = await createNewService({
          name: values.name,
          price: priceInCents,
          duration: duration
        });

        if (response.error) throw new Error(response.error);
        toast.success("Serviço cadastrado com sucesso!");
      }

      handleCloseModal();
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao salvar o serviço.");
    }
  }

  function handleCloseModal() {
    form.reset();
    closeModal();
  }

  // Função isolada e pura apenas para formatar a string, compatível com o onChange do RHF
  function handleCurrencyChange(
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) {
    let value = event.target.value.replace(/\D/g, '');

    if (value) {
      value = (parseInt(value, 10) / 100).toFixed(2);
      value = value.replace('.', ',');
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    onChange(value);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">
          {isEditing ? "Editar Serviço" : "Novo Serviço"}
        </DialogTitle>
        <DialogDescription>
          {isEditing 
            ? "Atualize as informações do serviço selecionado." 
            : "Preencha os dados abaixo para adicionar um novo serviço ao seu catálogo."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 font-semibold text-gray-700">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    Nome do serviço
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Corte de Cabelo Masculino" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 font-semibold text-gray-700">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Valor do serviço
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm font-medium text-gray-500">R$</span>
                      <Input
                        {...field}
                        className="pl-9"
                        placeholder="0,00"
                        onChange={(e) => handleCurrencyChange(e, field.onChange)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-lg space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-gray-700 text-sm">
              <Clock className="w-4 h-4 text-emerald-600" />
              Tempo de duração do serviço
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600">Horas</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0" min="0" type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600">Minutos</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="30" min="0" max="59" type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              className="w-full sm:flex-1 font-semibold text-black"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Atualizar serviço"
              ) : (
                "Cadastrar serviço"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}