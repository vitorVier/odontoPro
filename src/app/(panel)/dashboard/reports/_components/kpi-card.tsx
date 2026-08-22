import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  delta?: number // percentual de variação em relação ao mês anterior
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0 || isNaN(delta)) {
    return (
      <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
        <Minus className="w-3 h-3" />
        <span>Estável</span>
      </div>
    )
  }

  const isPositive = delta > 0
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors",
        isPositive 
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      )}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3 shrink-0" />
      ) : (
        <TrendingDown className="w-3 h-3 shrink-0" />
      )}
      <span>
        {isPositive ? "+" : ""}
        {delta.toFixed(0)}%
      </span>
    </div>
  )
}

export function KpiCard({ title, value, subtitle, icon: Icon, delta }: KpiCardProps) {
  return (
    <Card className="border border-border/50 bg-card shadow-xs transition-all hover:shadow-md duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-muted/50 text-primary rounded-lg shrink-0 group-hover:bg-primary/10 transition-colors">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        
        <div className="flex items-center gap-1.5">
          {delta !== undefined ? (
            <>
              <DeltaBadge delta={delta} />
              <span className="text-[11px] text-muted-foreground font-medium">
                vs. mês anterior
              </span>
            </>
          ) : (
            subtitle && (
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                {subtitle}
              </p>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
