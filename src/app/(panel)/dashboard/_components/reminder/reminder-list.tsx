"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { Reminder } from "@prisma/client"
import { Plus, Trash2 } from "lucide-react"
import { ScrollArea } from '@/components/ui/scroll-area'
import { deleteReminder } from '../../_actions/delete-reminder'
import { toast } from 'sonner'
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { ReminderContent } from './reminder-content'


interface ReminderListProps {
  reminder: Reminder[]
}

export function ReminderList({ reminder }: ReminderListProps) {
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleDeleteReminder(id: string) {
    const response = await deleteReminder({ reminderId: id })

    if (response.error) {
      toast.error(response.error)
      return;
    }

    toast.success(response.data);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl md:text-2xl font-bold">
            Lembretes
          </CardTitle>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>Novo Lembrete</DialogTitle>
                <DialogDescription>Criar um novo lembrete para sua lista.</DialogDescription>
              </DialogHeader>

              <ReminderContent
                closeDialog={() => setIsDialogOpen(false)}
              />
            </DialogContent>

          </Dialog>

        </CardHeader>

        <CardContent>
          {reminder.length === 0 && (
            <p className="text-sm text-gray-500">
              Nenhum lembrete registrado...
            </p>
          )}

          <ScrollArea
            className="h-80 lg:max-h-[calc(100vh-15rem)] pr-0 w-full flex-1"
          >
            {reminder.map((item) => (
              <article
                key={item.id}
                className="group h-12 flex flex-wrap flex-row items-center justify-between bg-white mb-2 px-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all border-l-4 border-l-amber-400"
              >
                <p className="text-sm lg:text-sm text-gray-700 font-medium">{item.description}</p>

                <Button
                  variant="ghost"
                  className="text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-md w-8 h-8 p-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                  size="icon"
                  onClick={() => handleDeleteReminder(item.id)}
                  title="Excluir Lembrete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </article>
            ))}
          </ScrollArea>

        </CardContent>
      </Card>
    </div>
  )
}