import { redirect } from 'next/navigation'
import { getPermissionUserToReports } from './_data-access/get-permission-reprots'
import { getReportsData } from './_data-access/get-reports-data'
import getSession from '@/lib/getSession'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainer, PageHeader } from '@/components/ui/page-layout'
import {
  Lock, Sparkles, ArrowRight, BarChart3,
  TrendingUp, CheckCircle2, CalendarCheck2,
  Banknote, Ticket, Folder, ShieldAlert
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'
import { KpiCard } from './_components/kpi-card'
import { WeekdayChart } from './_components/weekday-chart'
import { MonthlyChart } from './_components/monthly-chart'
import { TopServices } from './_components/top-services'
import { UpcomingAppointments } from './_components/upcoming-appointments'

function calcDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export default async function Reports() {
  const session = await getSession()

  if (!session) redirect("/")

  const userId = session?.user?.id!
  const hasPermission = await getPermissionUserToReports({ userId })

  // ───── CENÁRIO 1: SEM PERMISSÃO (PAYWALL EXTRA-OTIMIZADO) ─────
  if (!hasPermission) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader
          title="Relatórios e Métricas"
          description="Acompanhe o desempenho da sua clínica em tempo real."
        />

        {/* Banner de Upgrade Premium com Paleta de Alerta Sofisticada */}
        <div
          role="alert"
          className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 rounded-2xl border shadow-sm bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 text-foreground"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base leading-tight tracking-tight">
                Métricas e Relatórios Avançados Bloqueados
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Esta seção é exclusiva para assinantes do plano <strong className="text-foreground">PROFESSIONAL</strong>. Faça upgrade para desbloquear gráficos de faturamento, ticket médio por paciente e relatórios semanais completos.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="w-full md:w-auto shrink-0 font-bold text-xs uppercase tracking-wider h-10 shadow-md bg-amber-500 hover:bg-amber-600 text-white self-stretch md:self-center">
            <Link href="/dashboard/plans" className="flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conhecer Planos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Grade de Preview Fantasma / Blur Realista */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-40 pointer-events-none select-none relative">
          {[
            { label: "Agendamentos no mês", icon: BarChart3 },
            { label: "Faturamento estimado", icon: TrendingUp },
            { label: "Taxa de ocupação da cadeira", icon: CheckCircle2 },
          ].map(({ label, icon: Icon }) => (
            <Card key={label} className="border border-border/50 bg-card rounded-2xl shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
                <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-extrabold tracking-tight text-foreground">R$ —,——</div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-muted text-muted-foreground/60 px-2 py-0.5 rounded-md">
                  Disponível no Pro
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    )
  }

  // ───── CENÁRIO 2: COM PERMISSÃO (GRADE COMPLETA DO DASHBOARD) ─────
  const data = await getReportsData({ userId })

  const appointmentsDelta = calcDelta(
    data?.appointmentsThisMonth ?? 0,
    data?.appointmentsLastMonth ?? 0
  )
  const revenueDelta = calcDelta(
    data?.revenueThisMonth ?? 0,
    data?.revenueLastMonth ?? 0
  )

  return (
    <PageContainer className="space-y-6">
      {/* Cabeçalho da Página com o Badge Ajustado */}
      <PageHeader
        title="Relatórios e Métricas"
        description="Acompanhe o desempenho da sua clínica em tempo real."
      >
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider select-none shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Plano Ativo
        </div>
      </PageHeader>

      {/* ── Seção: KPIs Principais do Topo ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Agendamentos este mês"
          value={String(data?.appointmentsThisMonth ?? 0)}
          icon={CalendarCheck2}
          delta={appointmentsDelta}
        />
        <KpiCard
          title="Serviços ativos"
          value={String(data?.activeServices ?? 0)}
          icon={Folder}
          subtitle="Cadastrados no catálogo"
        />
        <KpiCard
          title="Ticket médio / Paciente"
          value={formatCurrency((data?.avgTicketThisMonth ?? 0) / 100)}
          icon={Ticket}
          subtitle="Por agendamento ativo"
        />
        <KpiCard
          title="Faturamento estimado"
          value={formatCurrency((data?.revenueThisMonth ?? 0) / 100)}
          icon={Banknote}
          delta={revenueDelta}
        />
      </div>

      {/* ── Seção: Gráficos de Fluxo e Tendência ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthlyChart data={data?.last6Months ?? []} />
        <WeekdayChart data={data?.byWeekday ?? []} />
      </div>

      {/* ── Seção: Tabelas de Rankings e Próximas Consultas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopServices data={data?.topServices ?? []} />
        <UpcomingAppointments appointments={data?.upcomingAppointments ?? []} />
      </div>
    </PageContainer>
  )
}
