import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import {
  BarChart3,
  BarChart,
} from "lucide-react"

import { formatCurrency } from "@/utils/formatCurrency"

import { cn } from "@/lib/utils"

interface MonthlyChartProps {
  data: {
    month: string
    count: number
    revenue: number
  }[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const maxCount = Math.max(
    ...data.map((item) => item.count),
    1
  )

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      {/* HEADER */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              Tendência de consultas
            </CardTitle>

            <CardDescription className="mt-1 text-xs">
              Agendamentos dos últimos 6 meses
            </CardDescription>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex h-44 flex-col items-center justify-center text-center">
            <BarChart className="h-6 w-6 text-gray-300" />

            <p className="mt-3 text-sm text-gray-500">
              Ainda não há dados suficientes.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Os dados aparecerão conforme novos agendamentos forem realizados.
            </p>
          </div>
        ) : (

          <div className="relative">

            {/* LINHAS DE REFERÊNCIA */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32">
              <div className="absolute inset-x-0 top-0 border-t border-gray-100" />
              <div className="absolute inset-x-0 top-1/3 border-t border-gray-100" />
              <div className="absolute inset-x-0 top-2/3 border-t border-gray-100" />
              <div className="absolute inset-x-0 bottom-0 border-t border-gray-100" />
            </div>

            {/* GRÁFICO */}
            <div className="relative flex h-44 items-end gap-3 pt-5">
              {data.map(
                ({ month, count, revenue }, index) => {
                  const isLast =
                    index === data.length - 1

                  const heightPct =
                    count > 0
                      ? (count / maxCount) * 100
                      : 0

                  return (
                    <div
                      key={month}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end"
                    >
                      {/* TOOLTIP */}
                      <div
                        className="
                          pointer-events-none
                          absolute
                          bottom-[calc(100%-1rem)]
                          left-1/2
                          z-20
                          -translate-x-1/2
                          translate-y-1
                          whitespace-nowrap
                          rounded-md
                          border
                          border-gray-200
                          bg-white
                          px-3
                          py-2
                          text-xs
                          shadow-sm
                          opacity-0
                          transition-all
                          duration-150
                          group-hover:translate-y-0
                          group-hover:opacity-100
                        "
                      >
                        <p className="mb-1 font-medium text-gray-900">
                          {month}
                        </p>

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-gray-500">
                            Consultas
                          </span>

                          <span className="font-medium text-gray-900">
                            {count}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-gray-500">
                            Faturamento
                          </span>

                          <span className="font-medium text-emerald-600">
                            {formatCurrency(revenue / 100)}
                          </span>
                        </div>
                      </div>

                      {/* BARRA */}
                      <div className="flex h-32 w-full items-end">
                        {count > 0 && (
                          <div
                            className={cn(
                              "w-full rounded-t-md transition-all duration-300",
                              isLast
                                ? "bg-emerald-500"
                                : "bg-emerald-100 group-hover:bg-emerald-200"
                            )}
                            style={{
                              height: `${Math.max(
                                heightPct,
                                6
                              )}%`,
                            }}
                          />
                        )}
                      </div>

                      {/* MÊS */}
                      <span
                        className={cn(
                          "mt-3 text-[11px] capitalize text-gray-400",
                          isLast &&
                            "font-medium text-emerald-600"
                        )}
                      >
                        {formatMonth(month)}
                      </span>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatMonth(month: string) {
  const normalized = month
    .trim()
    .toLowerCase()

  const months: Record<string, string> = {
    janeiro: "jan",
    fevereiro: "fev",
    março: "mar",
    abril: "abr",
    maio: "mai",
    junho: "jun",
    julho: "jul",
    agosto: "ago",
    setembro: "set",
    outubro: "out",
    novembro: "nov",
    dezembro: "dez",
  }

  return months[normalized] ?? month.substring(0, 3)
}