import getSesion from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { getUserData } from './_data-access/get-info-user'
import { ProfileContent } from './_components/profile'
import { PageContainer, PageHeader } from "@/components/ui/page-layout"

export default async function Profile() {
  const session = await getSesion()

  if (!session) {
    redirect("/")
  }

  const user = await getUserData({ userId: session.user?.id! })

  if (!user) {
    redirect("/")
  }

  return (
    <PageContainer>
      <PageHeader
        title="Perfil"
        description="Gerencie suas informações pessoais e configurações da clínica."
      />
      <ProfileContent user={user} />
    </PageContainer>
  )
}