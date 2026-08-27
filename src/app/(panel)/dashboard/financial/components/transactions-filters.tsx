"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TransactionType, TransactionStatus } from "@prisma/client"

export interface TransactionFilters {
  type: TransactionType | "ALL"
  status: TransactionStatus | "ALL"
  category: string | "ALL"
}

interface TransactionsFiltersProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
  availableCategories: string[]
}

export function TransactionsFilters({ filters, onChange, availableCategories }: TransactionsFiltersProps) {
  const hasActiveFilters = filters.type !== "ALL" || filters.status !== "ALL" || filters.category !== "ALL"

  function handleReset() {
    onChange({ type: "ALL", status: "ALL", category: "ALL" })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
      <Select
        value={filters.type}
        onValueChange={(value) => onChange({ ...filters, type: value as TransactionFilters["type"] })}
      >
        <SelectTrigger className="h-8 w-auto min-w-32 text-xs">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os tipos</SelectItem>
          <SelectItem value="INCOME">A receber</SelectItem>
          <SelectItem value="EXPENSE">A pagar</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => onChange({ ...filters, status: value as TransactionFilters["status"] })}
      >
        <SelectTrigger className="h-8 w-auto min-w-32 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          <SelectItem value="PENDING">Pendente</SelectItem>
          <SelectItem value="PAID">Pago</SelectItem>
        </SelectContent>
      </Select>

      {availableCategories.length > 0 && (
        <Select
          value={filters.category}
          onValueChange={(value) => onChange({ ...filters, category: value })}
        >
          <SelectTrigger className="h-8 w-auto min-w-36 text-xs">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as categorias</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 gap-1 text-xs text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}