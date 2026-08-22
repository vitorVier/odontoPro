import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  delta?: number
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0 || isNaN(delta)) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        <Minus className="h-3 w-3" />
        Estável
      </span>
    )
  }

  const isPositive = delta > 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        isPositive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}

      {isPositive ? "+" : ""}
      {delta.toFixed(0)}%
    </span>
  )
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delta,
}: KpiCardProps) {
  return (
    <Card className="border-border/50 bg-card shadow-xs">

      <CardHeader className="flex flex-row items-center justify-between pb-2">

        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
          <Icon className="h-4 w-4 text-primary" />
        </div>

      </CardHeader>

      <CardContent className="pt-0">

        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>

        <div className="mt-1.5 flex items-center gap-2 min-h-4">

          {delta !== undefined ? (
            <>
              <DeltaBadge delta={delta} />

              <span className="text-[11px] text-muted-foreground">
                vs. mês anterior
              </span>
            </>
          ) : (
            subtitle && (
              <p className="truncate text-[11px] text-muted-foreground">
                {subtitle}
              </p>
            )
          )}

        </div>

      </CardContent>
    </Card>
  )
}