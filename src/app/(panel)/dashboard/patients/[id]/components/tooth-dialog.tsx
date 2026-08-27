"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToothCondition } from "@prisma/client"
import { TOOTH_CONDITION_CONFIG } from "@/utils/dental/tooth-condition"
import { updateToothRecord } from "../_data-access/update-tooth-record"

interface ToothDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  toothNumber: number | null
  currentCondition: ToothCondition
  currentNotes: string
  onSaved: () => void
}

export function ToothDialog({
  open,
  onOpenChange,
  patientId,
  toothNumber,
  currentCondition,
  currentNotes,
  onSaved,
}: ToothDialogProps) {
  const [condition, setCondition] = useState<ToothCondition>(currentCondition)
  const [notes, setNotes] = useState(currentNotes)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSave() {
    if (!toothNumber) return

    setIsSubmitting(true)
    const response = await updateToothRecord({
      patientId,
      toothNumber,
      condition,
      notes,
    })
    setIsSubmitting(false)

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success(response.data)
    onSaved()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Dente {toothNumber}</DialogTitle>
          <DialogDescription>Registre a condição atual do dente.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Condição</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as ToothCondition)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TOOTH_CONDITION_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Observações (opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: face oclusal, dor ao toque..."
              rows={3}
              className="resize-none"
            />
          </div>

          <Button onClick={handleSave} disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}