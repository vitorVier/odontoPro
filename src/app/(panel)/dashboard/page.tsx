import getSesion from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { ButtonCopyLink } from './_components/button-copy-link'
import { Reminders } from './_components/reminder/reminders'
import { Appointments } from './_components/appointments/appointments'
import { checkSubscription } from '@/utils/permissions/checkSubscription'
import { LabelSubscription } from '@/components/ui/label-subscription'
import { PageContainer, PageHeader } from "@/components/ui/page-layout"
import { getNewAppointments } from './_data-access/get-new-appointments'
import { NewAppointmentsNotifier } from './_components/new-appointments-notifier'

export default async function Dashboard() {
  const session = await getSesion()

  if (!session) {
    redirect("/")
  }

  const subscription = await checkSubscription(session?.user?.id!)
  const newAppointments = await getNewAppointments(session?.user?.id!)

  return (
    <PageContainer className="space-y-6">
      <NewAppointmentsNotifier appointments={newAppointments} userId={session.user?.id!} />
      <PageHeader 
        title="Visão Geral" 
        description="Acompanhe sua agenda e lembretes para hoje."
      >
        <ButtonCopyLink userId={session.user?.id!} />
      </PageHeader>

      {subscription?.subscriptionStatus === "EXPIRED" && (
        <LabelSubscription variant="expired" />
      )}

      {subscription?.subscriptionStatus === "TRIAL" && (
        <LabelSubscription variant="trial" message={subscription.message} />
      )}

      {subscription?.subscriptionStatus !== "EXPIRED" && (
        <section className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          <div className="xl:col-span-2">
            <Appointments userId={session.user?.id!} />
          </div>
          <div className="xl:col-span-1">
            <Reminders userId={session.user?.id!} />
          </div>
        </section>
      )}

    </PageContainer>
  )
}