import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageContainer, PageHeader } from '@/components/ui/page-layout'
import { getPendingReconciliation } from '../_data-access/get-pending-reconciliation'
import { ReconciliationList } from '../components/reconciliation-list' 

export default async function FechamentoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const pending = await getPendingReconciliation()

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Fechamento do dia"
        description="Consultas que já aconteceram e ainda não tiveram baixa dada."
      />
      <ReconciliationList initialAppointments={pending} />
    </PageContainer>
  )
}