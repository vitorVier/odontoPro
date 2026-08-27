"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { completeOnboarding, skipOnboarding } from "../../_actions/complete-onboarding"
import { WelcomeStep } from "./steps/welcome-step" 
import { ClinicInfoStep } from "./steps/clinic-info-step" 
import { FirstServiceStep } from "./steps/first-service-step" 
import { ScheduleStep } from "./steps/schedule-step" 

interface OnboardingModalProps {
  userId: string
  userName: string | null
}

const STEPS = ["welcome", "clinic-info", "service", "schedule"] as const
type Step = typeof STEPS[number]

export function OnboardingModal({ userId, userName }: OnboardingModalProps) {
  const [open, setOpen] = useState(true)
  const [stepIndex, setStepIndex] = useState(0)

  const currentStep: Step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1

  function handleNext() {
    if (isLastStep) {
      handleComplete()
      return
    }
    setStepIndex((i) => i + 1)
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1))
  }

  async function handleComplete() {
    const response = await completeOnboarding()
    if (response.error) {
      toast.error(response.error)
      return
    }
    setOpen(false)
  }

  async function handleSkip() {
    const response = await skipOnboarding()
    if (response.error) {
      toast.error(response.error)
      return
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleSkip()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden [&>button]:hidden">
        {/* Header com progresso */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex gap-1.5">
            {STEPS.map((step, i) => (
              <div
                key={step}
                className={cn(
                  "h-1.5 w-8 rounded-full transition-colors",
                  i <= stepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-7 gap-1 text-xs text-muted-foreground"
          >
            Pular
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Conteúdo do passo atual */}
        <div className="px-6 py-6">
          {currentStep === "welcome" && <WelcomeStep userName={userName} />}
          {currentStep === "clinic-info" && <ClinicInfoStep userId={userId} onValid={handleNext} />}
          {currentStep === "service" && <FirstServiceStep userId={userId} onValid={handleNext} />}
          {currentStep === "schedule" && <ScheduleStep userId={userId} onValid={handleNext} />}
        </div>

        {/* Navegação — só aparece na etapa de boas-vindas, as outras controlam o próprio avanço via onValid */}
        {currentStep === "welcome" && (
          <div className="flex justify-between border-t px-6 py-4">
            <div />
            <Button onClick={handleNext} className="gap-1.5">
              Vamos começar
            </Button>
          </div>
        )}

        {currentStep !== "welcome" && stepIndex > 0 && (
          <div className="flex justify-start border-t px-6 py-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-xs text-muted-foreground">
              Voltar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}