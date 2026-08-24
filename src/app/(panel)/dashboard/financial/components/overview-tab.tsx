"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertTriangle, TrendingUp, TrendingDown, Wallet, Scale, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "../../reports/_components/kpi-card"
import { CreateTransactionDialog } from "./create-transaction-dialog"
import { formatCurrency } from "@/utils/formatCurrency"

interface OverviewTabProps {
  data: any
  loading: boolean
  onRefresh: () => void
}

export function OverviewTab({ data, loading, onRefresh }: OverviewTabProps) {
  if (loading || !data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { summary, overdue, upcoming } = data

  return (
    <div className="space-y-6">
      {overdue.count > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {overdue.count} conta{overdue.count > 1 ? "s" : ""} vencida{overdue.count > 1 ? "s" : ""} sem pagamento
            </p>
            <p className="text-xs text-muted-foreground">
              Total em atraso: {formatCurrency(overdue.amount / 100)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="A receber" value={formatCurrency(summary.pendingIncome / 100)} icon={TrendingUp} subtitle="Pendente no mês" />
        <KpiCard title="A pagar" value={formatCurrency(summary.pendingExpense / 100)} icon={TrendingDown} subtitle="Pendente no mês" className="text-red-500 dark:text-red-500/80" />
        <KpiCard title="Recebido" value={formatCurrency(summary.totalIncome / 100)} icon={Wallet} subtitle={`Consultas: ${formatCurrency(summary.breakdown.appointmentIncome / 100)} · Manual: ${formatCurrency(summary.breakdown.manualIncome / 100)}`} className="text-primary dark:text-primary" />
        <KpiCard title="Saldo do mês" value={formatCurrency(summary.balance / 100)} icon={Scale} subtitle={`Consultas: ${formatCurrency(summary.breakdown.appointmentPendingIncome / 100)} · Manual: ${formatCurrency(summary.breakdown.manualPendingIncome / 100)}`} className={ summary.balance === 0 ? "text-foreground" : summary.balance >= 0 ? "text-primary" : "text-red-500/80" }/>
      </div>

      <Card className="border-border/50 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-base font-semibold">Próximos vencimentos</CardTitle>
          <CreateTransactionDialog onCreated={onRefresh} />
        </CardHeader>
        <CardContent className="p-0">
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum vencimento próximo.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {upcoming.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence em {format(new Date(t.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <span className={t.type === "INCOME" ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-rose-600"}>
                    {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount / 100)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}