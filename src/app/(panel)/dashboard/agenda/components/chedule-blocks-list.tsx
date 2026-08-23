"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2, CalendarOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ScheduleBlock } from "@prisma/client"
import { deleteScheduleBlock } from "../_actions/delete-schedule-block"

interface ScheduleBlocksListProps {
  blocks: ScheduleBlock[]
  onDeleted: () => void
}

export function ScheduleBlocksList({ blocks, onDeleted }: ScheduleBlocksListProps) {
  async function handleDelete(id: string) {
    const response = await deleteScheduleBlock(id)

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success(response.data)
    onDeleted()
  }

  if (blocks.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Nenhum bloqueio configurado.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="flex items-center justify-between rounded-lg border p-3 text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CalendarOff className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {block.reason || (block.recurring ? "Bloqueio recorrente" : "Bloqueio")}
              </p>
              <p className="text-xs text-muted-foreground">
                {block.recurring
                  ? `Todos os dias, ${block.startTime}–${block.endTime}`
                  : block.startTime
                    ? `${format(block.startDate, "dd/MM", { locale: ptBR })}, ${block.startTime}–${block.endTime}`
                    : `${format(block.startDate, "dd/MM")} até ${format(block.endDate, "dd/MM")}`}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(block.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}