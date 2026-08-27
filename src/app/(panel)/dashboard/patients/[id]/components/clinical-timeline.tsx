"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2, FileText, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClinicalRecord } from "../_data-access/create-clinical-record" 
import { deleteClinicalRecord } from "../_data-access/delete-clinical-record" 

interface ClinicalRecordItem {
  id: string
  title: string
  description: string
  createdAt: Date
}

interface ClinicalTimelineProps {
  patientId: string
  records: ClinicalRecordItem[]
  onChanged: () => void
}

export function ClinicalTimeline({ patientId, records, onChanged }: ClinicalTimelineProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreate() {
    setIsSubmitting(true)
    const response = await createClinicalRecord({ patientId, title, description })
    setIsSubmitting(false)

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success(response.data)
    setTitle("")
    setDescription("")
    setOpen(false)
    onChanged()
  }

  async function handleDelete(recordId: string) {
    const response = await deleteClinicalRecord(recordId, patientId)
    if (response.error) {
      toast.error(response.error)
      return
    }
    toast.success(response.data)
    onChanged()
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Novo registro
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo registro clínico</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Título</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Extração dente 26"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes do procedimento, observações clínicas..."
                rows={4}
                className="resize-none"
              />
            </div>

            <Button onClick={handleCreate} disabled={isSubmitting || !title || !description} className="w-full">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar ao prontuário"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
          <FileText className="mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum registro no prontuário ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="group rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{record.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{record.description}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {format(new Date(record.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-rose-600"
                  onClick={() => handleDelete(record.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}