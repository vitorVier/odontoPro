"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plan } from "@prisma/client"
import { createSubscription } from '../_actions/create-subscription'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface SubscriptionButtonProps {
  type: Plan
  isPro?: boolean
}

export function SubscriptionButton({ type, isPro }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleCreateBilling() {
    setLoading(true)

    try {
      const response = await createSubscription({ type })

      if (response?.error) {
        toast.error(response.error)
        setLoading(false)
        return
      }

      // Se a Server Action retornar a URL da sessão, fazemos o redirecionamento
      if (response?.url) {
        window.location.href = response.url
      }
    } catch {
      toast.error("Ocorreu um erro ao processar o checkout.")
      setLoading(false)
    }
  }

  return (
    <Button
      variant={isPro ? "default" : "outline"}
      className={`w-full h-11 text-base font-semibold transition-all ${isPro ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0 hover:shadow-md" : "hover:bg-primary/5"}`}
      onClick={handleCreateBilling}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecionando...
        </>
      ) : (
        "Assinar Agora"
      )}
    </Button>
  )
}