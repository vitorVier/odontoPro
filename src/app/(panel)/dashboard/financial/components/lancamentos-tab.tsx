"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTransactionDialog } from "./create-transaction-dialog"
import { TransactionsList } from "./transactions-list"
import { TransactionsFilters, TransactionFilters } from "./transactions-filters"

interface LancamentosTabProps {
  data: any
  loading: boolean
  onRefresh: () => void
}

export function LancamentosTab({ data, loading, onRefresh }: LancamentosTabProps) {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "ALL",
    status: "ALL",
    category: "ALL",
  })

  const transactions = data?.data ?? []

  const availableCategories = useMemo(() => {
    const categories = new Set<string>()
    transactions.forEach((t: any) => {
      if (t.category) categories.add(t.category)
    })
    return Array.from(categories).sort()
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: any) => {
      if (filters.type !== "ALL" && t.type !== filters.type) return false
      if (filters.status !== "ALL" && t.status !== filters.status) return false
      if (filters.category !== "ALL" && (t.category ?? "") !== filters.category) return false
      return true
    })
  }, [transactions, filters])

  return (
    <Card className="border-border/50 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-base font-semibold">Lançamentos</CardTitle>
        <CreateTransactionDialog onCreated={onRefresh} />
      </CardHeader>

      {!loading && data && (
        <TransactionsFilters
          filters={filters}
          onChange={setFilters}
          availableCategories={availableCategories}
        />
      )}

      <CardContent className="p-0">
        {loading || !data ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {transactions.length === 0
                ? "Nenhum lançamento neste mês."
                : "Nenhum lançamento corresponde aos filtros selecionados."}
            </p>
          </div>
        ) : (
          <TransactionsList transactions={filteredTransactions} onChanged={onRefresh} />
        )}
      </CardContent>
    </Card>
  )
}