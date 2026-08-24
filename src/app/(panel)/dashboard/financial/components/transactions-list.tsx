"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2, CheckCircle2, Circle, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FinancialTransaction } from "@prisma/client"
import { formatCurrency } from "@/utils/formatCurrency"
import { toggleTransactionStatus } from "../_actions/toggle-transaction-status"
import { deleteTransaction } from "../_actions/delete-transaction"
import { cn } from "@/lib/utils"

interface TransactionsListProps {
  transactions: FinancialTransaction[]
  onChanged: () => void
}

export function TransactionsList({ transactions, onChanged }: TransactionsListProps) {
  async function handleToggleStatus(id: string) {
    const response = await toggleTransactionStatus(id)
    if (response.error) {
      toast.error(response.error)
      return
    }
    toast.success(response.data)
    onChanged()
  }

  async function handleDelete(id: string) {
    const response = await deleteTransaction(id)
    if (response.error) {
      toast.error(response.error)
      return
    }
    toast.success(response.data)
    onChanged()
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <p className="text-sm">Nenhum lançamento neste mês.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => handleToggleStatus(transaction.id)}
              className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
              title={transaction.status === "PAID" ? "Marcar como pendente" : "Marcar como pago"}
            >
              {transaction.status === "PAID" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>

            {transaction.type === "INCOME" ? (
              <ArrowUpCircle className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 shrink-0 text-rose-500" />
            )}

            <div className="min-w-0">
              <p className={cn(
                "truncate text-sm font-medium",
                transaction.status === "PAID" && "text-muted-foreground line-through"
              )}>
                {transaction.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Vence em {format(transaction.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                {transaction.category && ` · ${transaction.category}`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className={cn(
              "text-sm font-semibold",
              transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
            )}>
              {transaction.type === "INCOME" ? "+" : "-"} {formatCurrency(transaction.amount / 100)}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(transaction.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}