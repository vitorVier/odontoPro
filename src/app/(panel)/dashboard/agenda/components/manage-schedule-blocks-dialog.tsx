"use client"

import { useEffect, useState } from "react"
import { ListX, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScheduleBlock } from "@prisma/client"
import { ScheduleBlocksList } from "./chedule-blocks-list" 
import { getActiveScheduleBlocks } from "../_data-access/get-active-schedule-blocks"

interface ManageScheduleBlocksDialogProps {
  onChanged: () => void
}

export function ManageScheduleBlocksDialog({ onChanged }: ManageScheduleBlocksDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])

  async function fetchBlocks() {
    setLoading(true)
    const data = await getActiveScheduleBlocks()
    setBlocks(data)
    setLoading(false)
  }

  useEffect(() => {
    if (open) fetchBlocks()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ListX className="h-4 w-4" />
          Gerenciar bloqueios
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bloqueios da agenda</DialogTitle>
          <DialogDescription>
            Férias, feriados e horários recorrentes configurados.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
            <ScheduleBlocksList 
                blocks={blocks}
                onDeleted={() => {
                    fetchBlocks() // atualiza a lista interna do dialog
                    onChanged()    // avisa a AgendaPage pra atualizar a grade também
                }}
            />
        )}
      </DialogContent>
    </Dialog>
  )
}