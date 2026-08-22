import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { TrendingUp, Medal, Layers } from "lucide-react"
import { formatCurrency } from "@/utils/formatCurrency"
import { cn } from "@/lib/utils"

interface TopServicesProps {
  data: {
    name: string
    count: number
    revenue: number
  }[]
}

export function TopServices({ data }: TopServicesProps) {
  const maxCount = Math.max(
    ...data.map((service) => service.count),
    1
  )

  return (
    <Card className="border-border/50 bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Desempenho de Serviços
          </CardTitle>

          <p className="text-[11px] text-muted-foreground">
            Procedimentos mais realizados no mês
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
              <Layers className="h-4 w-4 text-muted-foreground/50" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              Nenhum procedimento registrado
            </p>

            <p className="mt-1 max-w-60 text-xs text-muted-foreground/70">
              Os serviços realizados aparecerão aqui conforme os atendimentos
              forem registrados.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {data.map((service, idx) => {
              const widthPct = (service.count / maxCount) * 100
              const isFirst = idx === 0

              return (
                <div
                  key={service.name}
                  className="group space-y-2"
                >
                  {/* Informações */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold",
                          isFirst
                            ? "bg-primary/10 text-primary"
                            : "bg-muted/60 text-muted-foreground"
                        )}
                      >
                        {isFirst ? (
                          <Medal className="h-3 w-3" />
                        ) : (
                          idx + 1
                        )}
                      </span>

                      <span
                        className={cn(
                          "truncate text-xs font-medium transition-colors",
                          isFirst
                            ? "text-foreground"
                            : "text-muted-foreground",
                          "group-hover:text-foreground"
                        )}
                      >
                        {service.name}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {service.count}{" "}
                        {service.count === 1 ? "consulta" : "consultas"}
                      </span>

                      <span className="text-xs font-semibold text-foreground">
                        {formatCurrency(service.revenue / 100)}
                      </span>
                    </div>
                  </div>

                  {/* Barra */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isFirst
                          ? "bg-primary"
                          : "bg-muted-foreground/25 group-hover:bg-muted-foreground/40"
                      )}
                      style={{
                        width: `${Math.max(widthPct, service.count > 0 ? 6 : 0)}%`,
                      }}
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