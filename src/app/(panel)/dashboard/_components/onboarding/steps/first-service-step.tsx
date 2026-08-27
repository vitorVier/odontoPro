"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createNewService } from "../../../services/_actions/create-service"

interface FirstServiceStepProps {
  userId: string
  onValid: () => void
}

const SUGGESTED_SERVICES = [
  { name: "Consulta / Avaliação", price: 15000, duration: 30 },
  { name: "Limpeza (Profilaxia)", price: 18000, duration: 45 },
  { name: "Restauração", price: 25000, duration: 60 },
  { name: "Extração simples", price: 20000, duration: 30 },
  { name: "Clareamento dental", price: 60000, duration: 90 },
  { name: "Canal (endodontia)", price: 80000, duration: 90 },
]

export function FirstServiceStep({ onValid }: FirstServiceStepProps) {
  const [name, setName] = useState("")
  const [priceInput, setPriceInput] = useState("")
  const [duration, setDuration] = useState(30)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)

  function handleSelectSuggestion(suggestion: typeof SUGGESTED_SERVICES[number]) {
    setSelectedSuggestion(suggestion.name)
    setName(suggestion.name)
    setPriceInput((suggestion.price / 100).toFixed(2).replace(".", ","))
    setDuration(suggestion.duration)
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Informe o nome do serviço")
      return
    }

    const normalizedPrice = priceInput.replace(",", ".")
    const priceInReais = Number(normalizedPrice)

    if (!priceInReais || priceInReais <= 0) {
      toast.error("Informe um valor válido")
      return
    }

    setIsSubmitting(true)

    const response = await createNewService({
      name,
      price: Math.round(priceInReais * 100), // reais -> centavos, mesmo padrão do resto do sistema
      duration,
    })

    setIsSubmitting(false)

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success("Serviço cadastrado!")
    onValid()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold">Cadastre seu primeiro serviço</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha um dos mais comuns ou crie o seu. Você pode adicionar quantos quiser depois.
        </p>
      </div>

      {/* Sugestões rápidas */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_SERVICES.map((suggestion) => (
          <button
            key={suggestion.name}
            type="button"
            onClick={() => handleSelectSuggestion(suggestion)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              selectedSuggestion === suggestion.name
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {selectedSuggestion === suggestion.name && <Sparkles className="h-3 w-3" />}
            {suggestion.name}
          </button>
        ))}
      </div>

      {/* Formulário — preenchido pela sugestão, mas editável */}
      <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Nome do serviço</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSelectedSuggestion(null)
            }}
            placeholder="Ex: Limpeza dental"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Valor (R$)</Label>
            <Input
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="150,00"
              inputMode="decimal"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Duração (min)</Label>
            <Input
              type="number"
              step={30}
              min={30}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar e continuar"}
      </Button>
    </div>
  )
}