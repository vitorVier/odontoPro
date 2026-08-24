import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageContainer, PageHeader } from '@/components/ui/page-layout'
import { getPermissionUserToFinancial } from '@/utils/permissions/get-permission-financial'
import { FinancialPageClient } from './components/financial-page-client' 
// import { FinancialPaywall } extraí o paywall pra um componente próprio

export default async function FinancialPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const hasPermission = await getPermissionUserToFinancial({ userId: session.user.id })

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Controle Financeiro"
        description="Gerencie contas a pagar e a receber da sua clínica."
      />

      {hasPermission && <FinancialPageClient /> }
      {/* {hasPermission ? <FinancialPageClient /> : <FinancialPaywall />} */}
    </PageContainer>
  )
}