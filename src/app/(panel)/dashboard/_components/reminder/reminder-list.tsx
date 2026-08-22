"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card"
import { Reminder } from "@prisma/client"
import {
  Plus,
  Trash2,
  Bell,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { deleteReminder } from "../../_actions/delete-reminder"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { ReminderContent } from "./reminder-content"

interface ReminderListProps {
  reminder: Reminder[]
}

export function ReminderList({
  reminder,
}: ReminderListProps) {
  const router = useRouter()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function handleDeleteReminder(id: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este lembrete?"
    )

    if (!confirmed) return

    const response = await deleteReminder({
      reminderId: id,
    })

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success(response.data)
    router.refresh()
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Lembretes
            </CardTitle>

            <CardDescription className="mt-1">
              Anotações importantes para sua clínica.
            </CardDescription>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                title="Novo lembrete"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>
                  Novo lembrete
                </DialogTitle>

                <DialogDescription>
                  Adicione uma anotação para consultar posteriormente.
                </DialogDescription>
              </DialogHeader>

              <ReminderContent
                closeDialog={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      {/* CONTEÚDO */}
      <CardContent className="pt-2">
        {reminder.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="mx-auto h-5 w-5 text-gray-300" />
            <h3 className="mt-3 text-sm font-medium text-gray-700">
              Nenhum lembrete
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-xs text-gray-400">
              Adicione uma anotação para não esquecer informações
              importantes.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Criar lembrete
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-80 w-full pr-2">
            <div className="divide-y">
              {reminder.map((item) => (
                <article
                  key={item.id}
                  className="
                    group
                    flex
                    min-h-12
                    items-center
                    justify-between
                    gap-3
                    py-2.5
                  "
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <p className="min-w-0 wrap-break-words text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="
                      h-7
                      w-7
                      shrink-0
                      text-gray-300
                      hover:bg-rose-50
                      hover:text-rose-500
                    "
                    onClick={() =>
                      handleDeleteReminder(item.id)
                    }
                    title="Excluir lembrete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </article>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}