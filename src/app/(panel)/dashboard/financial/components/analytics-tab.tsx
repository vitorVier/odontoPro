"use client"

import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { PieChart, Pie, Cell, Legend } from "recharts"
import { formatCurrency } from "@/utils/formatCurrency"
import { calcDelta } from "@/utils/calcDelta"

const CATEGORY_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"]

interface AnalyticsTabProps {
  data: any
  loading: boolean
  referenceMonth: Date
}

export function AnalyticsTab({ data, loading, referenceMonth }: AnalyticsTabProps) {
  if (loading || !data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { trend, categoryBreakdown, monthComparison, yoyComparison } = data

  const incomeDelta = calcDelta(monthComparison.currentIncome, monthComparison.previousIncome)
  const expenseDelta = calcDelta(monthComparison.currentExpense, monthComparison.previousExpense)

  return (
    <div className="space-y-6">
      {/* Comparativo mês a mês — sempre disponível */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-border/50 shadow-xs">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Receita vs mês anterior</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatCurrency(monthComparison.currentIncome)}</span>
              <span className={incomeDelta >= 0 ? "text-xs font-semibold text-emerald-600" : "text-xs font-semibold text-rose-600"}>
                {incomeDelta >= 0 ? "+" : ""}{incomeDelta.toFixed(1)}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Anterior: {formatCurrency(monthComparison.previousIncome)}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-xs">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Despesa vs mês anterior</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatCurrency(monthComparison.currentExpense)}</span>
              <span className={expenseDelta <= 0 ? "text-xs font-semibold text-emerald-600" : "text-xs font-semibold text-rose-600"}>
                {expenseDelta >= 0 ? "+" : ""}{expenseDelta.toFixed(1)}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Anterior: {formatCurrency(monthComparison.previousExpense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo ano a ano — só aparece se existir dado */}
      {yoyComparison && (
        <Card className="border-border/50 shadow-xs">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-semibold">
              Comparativo com {format(referenceMonth, "MMMM 'de' yyyy", { locale: ptBR })} do ano anterior
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-6">
            <div>
              <p className="text-xs text-muted-foreground">Receita</p>
              <p className="text-lg font-bold">{formatCurrency(yoyComparison.currentIncome)}</p>
              <p className="text-xs text-muted-foreground">Era {formatCurrency(yoyComparison.previousYearIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Despesa</p>
              <p className="text-lg font-bold">{formatCurrency(yoyComparison.currentExpense)}</p>
              <p className="text-xs text-muted-foreground">Era {formatCurrency(yoyComparison.previousYearExpense)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tendência 6 meses */}
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold">Receita vs Despesa — últimos 6 meses</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip 
                formatter={(value: any) => {
                    if (value === undefined || value === null) return '';
                    return `R$ ${value.toFixed(2)}`; // Exemplo de formatação
                }} 
              />
              <Bar dataKey="income" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Despesas por categoria */}
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold">Despesas por categoria (mês atual)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {categoryBreakdown.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma despesa categorizada neste mês.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {categoryBreakdown.map((_: any, index: number) => (
                    <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value: any) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}