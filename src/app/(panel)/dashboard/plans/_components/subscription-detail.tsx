"use client"

import { Subscription } from "@prisma/client";
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { subscriptionPlans } from '@/utils/plans/index'
import { Button } from "@/components/ui/button";
import { createPortalCustomer } from '../_actions/create-portal-customer'
import { Check, CheckCircle2, AlertCircle, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubscriptionDetailProps {
  subscription: Subscription;
}

export function SubscriptionDetail({ subscription }: SubscriptionDetailProps) {
  const [loading, setLoading] = useState(false)
  const subscriptionInfo = subscriptionPlans.find(plan => plan.id === subscription.plan)

  const isActive = subscription.status === "active";
  const endDate = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;

  // Garante que só considera cancelado em carência se a data de expiração for futura
  const hasRemainingAccess = endDate ? isAfter(endDate, new Date()) : false;
  const isCanceled = subscription.cancelAtPeriodEnd && hasRemainingAccess;

  const timeRemaining = endDate && hasRemainingAccess
    ? formatDistanceToNow(endDate, { locale: ptBR })
    : "";

  async function handleManageSubscription() {
    setLoading(true)
    const portal = await createPortalCustomer()

    if (portal.error || !portal.sessionId) {
      toast.error(portal.error || "Ocorreu um erro ao acessar o portal.")
      setLoading(false)
      return;
    }

    // Mantendo portal.sessionId para o redirecionamento
    window.location.href = portal.sessionId;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {isCanceled && (
        <div className="mb-6 flex items-start sm:items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-500">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm font-medium">
            Sua assinatura foi cancelada. Você ainda tem <span className="font-bold">{timeRemaining}</span> de acesso até que seu plano expire.
          </p>
        </div>
      )}

      <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
        <div className={cn("h-1.5 w-full", isActive && !isCanceled ? "bg-emerald-500" : isCanceled ? "bg-amber-500" : "bg-rose-500")} />

        <CardHeader className="pb-6 pt-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                Plano {subscription.plan === "BASIC" ? "Básico" : subscription.plan === "PREMIUM" ? "Premium" : "Profissional"}
              </CardTitle>
              <CardDescription className="mt-1.5 text-sm md:text-base">
                Gerencie seus pagamentos, histórico e informações do plano.
              </CardDescription>
            </div>

            <div className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
              isActive && !isCanceled
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : isCanceled
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-rose-100 text-rose-700 border border-rose-200"
            )}>
              {isActive && !isCanceled ? <CheckCircle2 className="w-3.5 h-3.5" /> : isCanceled ? <AlertTriangle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {isCanceled ? "Cancelado" : isActive ? "Ativo" : "Inativo"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-5 md:p-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Benefícios Incluídos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subscriptionInfo?.features.map(feature => (
                <div key={feature} className="flex items-center gap-2.5">
                  <div className={cn(
                    "p-1 rounded-full",
                    isCanceled ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    <Check className="w-3.5 h-3.5 stroke-3" />
                  </div>
                  <span className={cn("text-sm font-medium text-foreground",
                    isCanceled ? "text-amber-700" : "text-emerald-700"
                  )}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/10 border-t border-border/40 pt-6 px-6 pb-6">
          <Button
            onClick={handleManageSubscription}
            disabled={loading}
            className={cn(
              "w-full sm:w-auto ml-auto group h-11",
              isCanceled ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:text-amber-700 hover:border-amber-200" : "bg-emerald-100 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-200"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {!loading ? "Acessar Portal do Cliente" : "Redirecionando..."}
            {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}