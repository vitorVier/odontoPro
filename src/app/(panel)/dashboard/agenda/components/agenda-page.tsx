"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
  isToday
} from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AgendaSkeleton } from "./loading"
import { WeekView } from "./week-view"
import { MonthView } from "./month-view"
import { AppointmentWithService } from "../../_components/appointments/appointments-list"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ViewMode = "week" | "month"

interface AgendaPageProps {
  userId: string
  times: string[]
}

export default function AgendaPage({ userId, times }: AgendaPageProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<ViewMode>("week")
    const [appointments, setAppointments] = useState<AppointmentWithService[]>([])
    const [summary, setSummary] = useState<{ date: string; count: number }[]>([])
    const [loading, setLoading] = useState(false)
    const [datePickerOpen, setDatePickerOpen] = useState(false)

    function handleSelectDate(selected: Date | undefined) {
        if (!selected) return
        setCurrentDate(selected)
        setDatePickerOpen(false)
    }

    const fetchAgenda = useCallback(async () => {
        setLoading(true)

        try {
        let start: Date
        let end: Date

        if (view === "week") {
            start = startOfWeek(currentDate, { weekStartsOn: 1 })
            end = endOfWeek(currentDate, { weekStartsOn: 1 })
        } else {
            start = startOfMonth(currentDate)
            end = endOfMonth(currentDate)
        }

        const startDate = format(start, "yyyy-MM-dd")
        const endDate = format(end, "yyyy-MM-dd")

        const [appointmentsResponse, summaryResponse] =
            await Promise.all([
            fetch(
                `/api/clinic/appointments?startDate=${startDate}&endDate=${endDate}`
            ),
            fetch(
                `/api/clinic/appointments/summary?startDate=${startDate}&endDate=${endDate}`
            ),
            ])

        if (!appointmentsResponse.ok || !summaryResponse.ok) {
            throw new Error("Erro ao carregar agenda")
        }

        const appointmentsData = await appointmentsResponse.json()
        const summaryData = await summaryResponse.json()

        setAppointments(appointmentsData)
        setSummary(summaryData)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [currentDate, view])

    useEffect(() => {
        fetchAgenda()
    }, [fetchAgenda])

    function handlePrevious() {
        setCurrentDate((date) =>
        view === "week"
            ? subWeeks(date, 1)
            : subMonths(date, 1)
        )
    }

    function handleNext() {
        setCurrentDate((date) =>
        view === "week"
            ? addWeeks(date, 1)
            : addMonths(date, 1)
        )
    }

    function handleToday() {
        setCurrentDate(new Date())
    }

    const navigationLabel = useMemo(() => {
        if (view === "week") {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 })
            const end = endOfWeek(currentDate, { weekStartsOn: 1 })

            if (start.getMonth() === end.getMonth()) {
            return (
                <>
                <span className="capitalize">
                    {format(start, "d", { locale: ptBR })}
                </span>
                <span className="text-muted-foreground/60 mx-1">–</span>
                <span>
                    {format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                </>
            )
            }

            return (
            <>
                <span>
                {format(start, "d MMM", { locale: ptBR })}
                </span>
                <span className="text-muted-foreground/60 mx-1">–</span>
                <span>
                {format(end, "d MMM yyyy", { locale: ptBR })}
                </span>
            </>
            )
        }

        return (
            <span className="capitalize">
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
        )
    }, [currentDate, view])

    return (
        <main className="mx-auto w-full max-w-[1600px] space-y-6">
            {/* HEADER */}
            <Card className="border-border/50 shadow-xs">
                <CardHeader className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <CalendarDays className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight">
                                Agenda
                            </CardTitle>

                            <p className="text-sm text-muted-foreground capitalize">
                                {navigationLabel}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* NAVEGAÇÃO */}
                        <div className="flex items-center rounded-xl border bg-background shadow-xs overflow-hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none border-r text-muted-foreground hover:text-foreground"
                                onClick={handlePrevious}
                                aria-label={view === "week" ? "Semana anterior" : "Mês anterior"}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {/* DATA / PERÍODO ATUAL */}
                            <div className="min-w-42.5 px-4 text-center text-sm font-semibold text-foreground whitespace-nowrap">
                                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                    <PopoverTrigger
                                    className={cn(
                                        "inline-flex items-center justify-center gap-2",
                                        "text-sm font-semibold text-foreground",
                                        "hover:text-primary transition-colors"
                                    )}
                                    >
                                    <CalendarIcon className="h-4 w-4 text-emerald-600" />
                                    {navigationLabel}
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto p-0" align="center">
                                    <Calendar
                                        mode="single"
                                        selected={currentDate}
                                        onSelect={handleSelectDate}
                                        locale={ptBR}
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none border-l text-muted-foreground hover:text-foreground"
                                onClick={handleNext}
                                aria-label={view === "week" ? "Próxima semana" : "Próximo mês"}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                        </div>

                        {/* HOJE */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToday}
                            className={cn(
                            "h-9 gap-2 rounded-xl font-semibold transition-all duration-200",
                            isToday(currentDate)
                                ? "bg-primary text-white border-primary hover:bg-primary/90 hover:text-white shadow-sm"
                                : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30"
                            )}
                        >
                            <CalendarDays className="h-3.5 w-3.5" />

                            <span>
                                {isToday(currentDate) ? "Hoje" : "Ir para hoje"}
                            </span>

                            {!isToday(currentDate) && (
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                                </span>
                            )}
                        </Button>

                        {/* VISUALIZAÇÃO */}
                        <div className="flex rounded-xl border bg-muted/30 p-1">
                            <Button
                                variant={view === "week" ? "secondary" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-8 rounded-lg px-3",
                                    view === "week" && "shadow-xs"
                                )}
                                onClick={() => setView("week")}
                            >
                                Semana
                            </Button>

                            <Button
                                variant={view === "month" ? "secondary" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-8 rounded-lg px-3",
                                    view === "month" && "shadow-xs"
                                )}
                                onClick={() => setView("month")}
                            >
                                Mês
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

        {/* CALENDÁRIO */}
        <Card className="overflow-hidden border-border/50 shadow-xs">
            <CardContent className="p-0">
            {loading ? (
                <AgendaSkeleton />
            ) : view === "week" ? (
                <WeekView
                    currentDate={currentDate}
                    appointments={appointments}
                    times={times}
                />
            ) : (
                <MonthView
                    currentDate={currentDate}
                    appointments={appointments}
                    summary={summary}
                    onSelectDate={setCurrentDate}
                    onChangeToWeek={() => setView("week")}
                />
            )}
            </CardContent>
        </Card>
        </main>
    )
}