"use client"

import { useState } from "react"
import { Wallet, TrendingUp, TrendingDown, Scale } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialTransaction } from "@prisma/client"
import { formatCurrency } from "@/utils/formatCurrency"
import { KpiCard } from "../../reports/_components/kpi-card"
import { MonthNavigator } from "./month-navigator"
import { CreateTransactionDialog } from "./create-transaction-dialog"
import { TransactionsList } from "./transactions-list"
import { getFinancialTransactions } from "../_data-access/get-financial-transactions"

interface FinancialSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  pendingIncome: number
  pendingExpense: number
}

interface FinancialContentProps {
  initialMonth: Date // 1. Renomeado aqui de currentMonth para initialMonth
  initialTransactions: FinancialTransaction[]
  initialSummary: FinancialSummary
}

// 2. Recebe initialMonth nas props
export function FinancialContent({ initialMonth, initialTransactions, initialSummary }: FinancialContentProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [summary, setSummary] = useState(initialSummary)
  
  // 3. Usa o initialMonth para iniciar o estado interno corretamente
  const [currentMonth, setCurrentMonth] = useState(initialMonth)

  async function refresh() {
    const result = await getFinancialTransactions({ month: currentMonth })
    setTransactions(result.data)
    if (result.summary) setSummary(result.summary)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <MonthNavigator currentMonth={currentMonth} onChange={setCurrentMonth} />
        <CreateTransactionDialog onCreated={refresh} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="A receber"
          value={formatCurrency(summary.pendingIncome / 100)}
          icon={TrendingUp}
          subtitle="Pendente no mês"
          className="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          title="A pagar"
          value={formatCurrency(summary.pendingExpense / 100)}
          icon={TrendingDown}
          subtitle="Pendente no mês"
        />
        <KpiCard
          title="Recebido"
          value={formatCurrency(summary.totalIncome / 100)}
          icon={Wallet}
          subtitle="Total no mês"
        />
        <KpiCard
          title="Saldo do mês"
          value={formatCurrency(summary.balance / 100)}
          icon={Scale}
          subtitle="Receitas - despesas"
        />
      </div>

      <Card className="border-border/50 shadow-xs">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold">Lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionsList transactions={transactions} onChanged={refresh} />
        </CardContent>
      </Card>
    </div>
  )
}
