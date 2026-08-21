import getSession from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { GridPlans } from './_components/grid-plans'
import { getSubscription } from '@/utils/get-subscription'
import { SubscriptionDetail } from './_components/subscription-detail'
import { PageContainer, PageHeader } from "@/components/ui/page-layout"

export default async function Plans() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  const subscritpion = await getSubscription({ userId: session?.user?.id! })

  return (
    <PageContainer>
      <PageHeader 
        title="Assinatura e Planos" 
        description="Gerencie sua assinatura e visualize as opções disponíveis." 
      />
      {subscritpion?.status !== "active" && (
        <GridPlans />
      )}

      {subscritpion?.status === "active" && (
        <SubscriptionDetail subscription={subscritpion!} />
      )}
    </PageContainer>
  )
}