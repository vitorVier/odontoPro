import { Suspense } from 'react'
import getSesion from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { ServicesContent } from './_components/service-content'
import { PageContainer, PageHeader } from "@/components/ui/page-layout"

export default async function Services() {
  const session = await getSesion()

  if (!session) {
    redirect("/")
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Serviços" 
        description="Gerencie os procedimentos e serviços oferecidos pela clínica." 
      />
      <Suspense fallback={<div>Carregando...</div>}>
        <ServicesContent userId={session.user?.id!} />
      </Suspense>
    </PageContainer>
  )
}