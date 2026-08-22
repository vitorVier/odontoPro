import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarRange, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

interface WeekdayChartProps {
  data: { day: number; count: number }[]
}

export function WeekdayChart({ data }: WeekdayChartProps) {
  // Encontra o teto de consultas para calcular a proporção visual das colunas
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className="border border-border/50 bg-card shadow-xs transition-all hover:shadow-md duration-300">
      {/* Cabeçalho Padronizado com a Identidade do SaaS */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-bold tracking-tight text-foreground">
            Distribuição Semanal
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Volume de consultas por dia da semana atual
          </p>
        </div>
        <div className="p-2 bg-muted/40 rounded-lg text-muted-foreground shrink-0">
          <CalendarRange className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 h-36">
            <BarChart2 className="w-6 h-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground max-w-50">
              Nenhum dado registrado para esta semana.
            </p>
          </div>
        ) : (
          /* Container do Gráfico Minimalista */
          <div className="flex items-end justify-between gap-2.5 h-36 pt-4 px-1">
            {data.map(({ day, count }) => {
              const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0
              const isPeakDay = count === maxCount && count > 0 // Identifica o dia de maior pico

              return (
                <div
                  key={day}
                  className="flex flex-col items-center gap-2 flex-1 group relative h-full justify-end"
                >
                  {/* Tooltip Discreto no Hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 flex flex-col items-center z-30 pointer-events-none transition-all duration-150 origin-bottom">
                    <span className="bg-popover border border-border/80 rounded-md px-2 py-0.5 shadow-md text-[10px] font-bold text-foreground whitespace-nowrap">
                      {count} {count === 1 ? "consulta" : "consultas"}
                    </span>
                    <div className="w-1.5 h-1.5 bg-popover border-b border-r border-border/80 rotate-45 -mt-0.5" />
                  </div>

                  {/* Coluna Gráfica com Altura Mínima Elegante */}
                  <div className="w-full relative flex items-end h-21.25">
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all duration-500 ease-out cursor-pointer relative",
                        count === 0 
                          ? "bg-muted/30" // Dia sem movimento (ex: domingo) fica apagado
                          : isPeakDay
                          ? "bg-linear-to-t from-primary to-primary/80 shadow-[0_-2px_6px_rgba(var(--primary),0.15)]" // Dia de pico ganha destaque
                          : "bg-primary/20 group-hover:bg-primary/35" // Dias normais com consultas
                      )}
                      style={{ height: `${Math.max(heightPct, count > 0 ? 10 : 4)}%` }}
                    />
                  </div>

                  {/* Rótulo do Dia da Semana */}
                  <span
                    className={cn(
                      "text-[10px] font-semibold text-muted-foreground tracking-tight transition-colors",
                      isPeakDay && "text-primary font-bold",
                      count === 0 && "text-muted-foreground/40"
                    )}
                  >
                    {WEEKDAY_LABELS[day]}
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
