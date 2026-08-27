"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateProfile } from "../../../profile/_actions/update-profile"
import { formatPhone } from "@/utils/formatPhone"

interface ClinicInfoStepProps {
  userId: string
  onValid: () => void
}

export function ClinicInfoStep({ onValid }: ClinicInfoStepProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Informe o nome da clínica")
      return
    }

    setIsSubmitting(true)

    const response = await updateProfile({
      name,
      address,
      phone,
      status: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      times: [],
      weekDays: [1, 2, 3, 4, 5],
    })

    setIsSubmitting(false)

    if (response.error) {
      toast.error(response.error)
      return
    }

    onValid()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold">Dados da clínica</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Essas informações aparecem na sua página pública de agendamento.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Nome da clínica</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Odonto Sorriso" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Endereço</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Telefone</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(55) 99999-9999"
          />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
      </Button>
    </div>
  )
}