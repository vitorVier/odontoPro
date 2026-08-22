import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import {
  CalendarRange,
  BarChart2,
} from "lucide-react"

import { cn } from "@/lib/utils"

const WEEKDAY_LABELS = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
]

interface WeekdayChartProps {
  data: {
    day: number
    count: number
  }[]
}

export function WeekdayChart({
  data,
}: WeekdayChartProps) {
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
              Distribuição semanal
            </CardTitle>

            <CardDescription className="mt-1 text-xs">
              Consultas por dia da semana
            </CardDescription>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
            <CalendarRange className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex h-36 flex-col items-center justify-center text-center">
            <BarChart2 className="h-6 w-6 text-gray-300" />

            <p className="mt-3 text-sm text-gray-500">
              Ainda não há dados disponíveis.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              As informações aparecerão conforme os agendamentos forem registrados.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* LINHAS DE REFERÊNCIA */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28">
              <div className="absolute inset-x-0 top-0 border-t border-gray-100" />
              <div className="absolute inset-x-0 top-1/2 border-t border-gray-100" />
              <div className="absolute inset-x-0 bottom-0 border-t border-gray-100" />
            </div>

            {/* GRÁFICO */}
            <div className="relative flex h-45 items-end gap-2 pt-5">
              {data.map(({ day, count }) => {
                const heightPct =
                  count > 0
                    ? (count / maxCount) * 100
                    : 0

                const isPeakDay =
                  count === maxCount && count > 0

                return (
                  <div
                    key={day}
                    className="
                      group
                      relative
                      flex
                      h-full
                      flex-1
                      flex-col
                      items-center
                      justify-end
                    "
                  >
                    {/* TOOLTIP */}
                    {count > 0 && (
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
                          px-2.5
                          py-1.5
                          text-xs
                          font-medium
                          text-gray-700
                          shadow-sm
                          opacity-0
                          transition-all
                          duration-150
                          group-hover:translate-y-0
                          group-hover:opacity-100
                        "
                      >
                        {count}{" "}
                        {count === 1
                          ? "consulta"
                          : "consultas"}
                      </div>
                    )}

                    {/* BARRA */}
                    <div className="flex h-28 w-full items-end">
                      <div
                        className={cn(
                          "w-full rounded-t-md transition-colors duration-200",
                          count === 0
                            ? "bg-gray-100"

                            : isPeakDay
                              ? "bg-emerald-500"

                              : "bg-emerald-100 group-hover:bg-emerald-200"
                        )}
                        style={{
                          height:
                            count > 0
                              ? `${Math.max(
                                  heightPct,
                                  8
                                )}%`
                              : "4%",
                        }}
                      />
                    </div>

                    {/* DIA */}
                    <span
                      className={cn(
                        "mt-3 text-[11px] text-gray-400",
                        isPeakDay &&
                          "font-medium text-emerald-600",
                        count === 0 &&
                          "text-gray-300"
                      )}
                    >
                      {WEEKDAY_LABELS[day]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}