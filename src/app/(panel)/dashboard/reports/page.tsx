import { redirect } from 'next/navigation'
import { getPermissionUserToReports } from './_data-access/get-permission-reprots'
import getSession from '@/lib/getSession'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainer, PageHeader } from '@/components/ui/page-layout'
import { Lock, Sparkles, ArrowRight, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react'

export default async function Reports() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  const user = await getPermissionUserToReports({ userId: session?.user?.id! })

  // ESTADO: SEM PERMISSÃO (Paywall)
  if (!user) {
    return (
      <PageContainer>
        <PageHeader
          title="Relatórios e Métricas"
          description="Acompanhe o desempenho do seu negócio em tempo real."
        />

        <div
          role="alert"
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border shadow-xs bg-rose-50/80 border-rose-200 text-rose-950"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg shrink-0 mt-0.5 bg-rose-100 text-rose-600">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-semibold text-sm md:text-base leading-tight">
                Recurso exclusivo dos planos Profissional e Premium
              </h3>
              <p className="text-xs md:text-sm text-rose-700/90">
                Faça upgrade para desbloquear métricas, gráficos interativos e exportação de relatórios.
              </p>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="w-fit shrink-0 font-medium self-end md:self-center bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Link href="/dashboard/plans" className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ver planos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Preview dos recursos bloqueados */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-40 pointer-events-none select-none">
          {[
            { label: "Agendamentos no mês", icon: BarChart3 },
            { label: "Faturamento estimado", icon: TrendingUp },
            { label: "Taxa de ocupação", icon: CheckCircle2 },
          ].map(({ label, icon: Icon }) => (
            <Card key={label} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground mt-1">Disponível no upgrade</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    )
  }

  // ESTADO: COM PERMISSÃO
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Relatórios e Métricas"
        description="Acompanhe o desempenho do seu negócio em tempo real."
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Plano Ativo
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento do Mês</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">Sua conta está sincronizada</p>
          </CardContent>
        </Card>

        {/* Adicione aqui os demais componentes de relatório */}
      </div>
    </PageContainer>
  )
}