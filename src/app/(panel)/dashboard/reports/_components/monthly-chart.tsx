import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, BarChart, Percent } from "lucide-react"
import { formatCurrency } from "@/utils/formatCurrency"
import { cn } from "@/lib/utils"

interface MonthlyChartProps {
  data: { month: string; count: number; revenue: number }[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  // Encontra o teto de agendamentos para definir a escala proporcional do gráfico
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className="border border-border/50 bg-card shadow-xs transition-all hover:shadow-md duration-300">
      {/* Cabeçalho Padronizado */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-bold tracking-tight text-foreground">
            Tendência de Consultas
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Volume de agendamentos nos últimos 6 meses
          </p>
        </div>
        <div className="p-2 bg-muted/40 rounded-lg text-muted-foreground shrink-0">
          <BarChart3 className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 h-44">
            <BarChart className="w-6 h-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground max-w-50">
              Sem histórico disponível.
            </p>
          </div>
        ) : (
          /* Container Principal do Gráfico */
          <div className="flex items-end justify-between gap-3 h-44 pt-4 px-1">
            {data.map(({ month, count, revenue }, idx) => {
              const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0
              const isLast = idx === data.length - 1

              return (
                <div 
                  key={month} 
                  className="flex flex-col items-center gap-2 flex-1 group relative h-full justify-end"
                >
                  {/* Tooltip Avançado com Grid Separador */}
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 flex flex-col items-center z-30 pointer-events-none transition-all duration-200 origin-bottom">
                    <div className="bg-popover border border-border/80 backdrop-blur-md rounded-xl p-2 shadow-lg text-[10px] whitespace-nowrap text-foreground font-medium space-y-0.5 min-w-27.5">
                      <p className="text-muted-foreground border-b border-border/40 pb-0.5 text-center font-bold capitalize">
                        {month}
                      </p>
                      <div className="flex justify-between gap-4 pt-0.5 px-0.5">
                        <span>Consultas:</span>
                        <span className="font-bold text-primary">{count}</span>
                      </div>
                      <div className="flex justify-between gap-4 px-0.5">
                        <span>Faturamento:</span>
                        <span className="font-bold text-emerald-500">{formatCurrency(revenue / 100)}</span>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-popover border-b border-r border-border/80 rotate-45 -mt-1" />
                  </div>

                  {/* Coluna Gráfica */}
                  <div className="w-full relative flex items-end h-27.5">
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer relative",
                        isLast 
                          ? "bg-linear-to-t from-primary to-primary/80 shadow-[0_-2px_8px_rgba(var(--primary),0.2)]" 
                          : "bg-primary/20 group-hover:bg-primary/35"
                      )}
                      style={{ height: `${Math.max(heightPct, count > 0 ? 8 : 4)}%` }}
                    >
                      {/* Indicador Numérico Flutuante Discreto no Hover */}
                      {count > 0 && (
                        <span className="absolute -top-5 left-0 right-0 text-center text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {count}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rótulo Inferior (Mês) */}
                  <span className={cn(
                    "text-[10px] font-semibold text-muted-foreground capitalize tracking-tight transition-colors",
                    isLast && "text-primary font-bold"
                  )}>
                    {month.substring(0, 3)} {/* Exibe apenas a abreviação limpa */}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
