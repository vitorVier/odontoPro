import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Medal, Layers } from "lucide-react"
import { formatCurrency } from "@/utils/formatCurrency"
import { cn } from "@/lib/utils"

interface TopServicesProps {
  data: { name: string; count: number; revenue: number }[]
}

export function TopServices({ data }: TopServicesProps) {
  // Encontra o maior volume para guiar o preenchimento percentual das barras
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className="border border-border/50 bg-card shadow-xs transition-all hover:shadow-md duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-bold tracking-tight text-foreground">
            Desempenho de Serviços
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Procedimentos mais realizados no mês atual
          </p>
        </div>
        <div className="p-2 bg-muted/40 rounded-lg text-muted-foreground shrink-0">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <Layers className="w-6 h-6 text-muted-foreground/40 stroke-dasharray" />
            <p className="text-xs text-muted-foreground max-w-50">
              Nenhum procedimento registrado neste período.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((service, idx) => {
              const widthPct = (service.count / maxCount) * 100
              const isFirst = idx === 0

              return (
                <div key={service.name} className="space-y-1.5 group">
                  {/* Linha de Dados Superior */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-foreground truncate max-w-[65%]">
                      {/* Distintivo de classificação simplificado e moderno */}
                      <span
                        className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                          isFirst 
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isFirst ? <Medal className="w-3 h-3" /> : idx + 1}
                      </span>
                      <span className="truncate group-hover:text-primary transition-colors">
                        {service.name}
                      </span>
                    </div>

                    {/* Métrica Direita: Alinhamento de Faturamento e Quantidade */}
                    <div className="text-right shrink-0 font-medium space-x-2">
                      <span className={cn(
                        "text-[11px] px-1.5 py-0.5 rounded-md font-semibold",
                        isFirst ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {service.count}x
                      </span>
                      <span className="text-foreground font-semibold">
                        {formatCurrency(service.revenue / 100)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso Estilizada */}
                  <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out origin-left",
                        isFirst 
                          ? "bg-linear-to-r from-primary to-primary/80" 
                          : "bg-muted-foreground/30"
                      )}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}