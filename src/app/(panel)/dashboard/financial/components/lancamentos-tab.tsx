"use client"

import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTransactionDialog } from "./create-transaction-dialog"
import { TransactionsList } from "./transactions-list"

interface LancamentosTabProps {
  data: any
  loading: boolean
  onRefresh: () => void
}

export function LancamentosTab({ data, loading, onRefresh }: LancamentosTabProps) {
  return (
    <Card className="border-border/50 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-base font-semibold">Lançamentos</CardTitle>
        <CreateTransactionDialog onCreated={onRefresh} />
      </CardHeader>
      <CardContent className="p-0">
        {loading || !data ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TransactionsList transactions={data.data} onChanged={onRefresh} />
        )}
      </CardContent>
    </Card>
  )
}