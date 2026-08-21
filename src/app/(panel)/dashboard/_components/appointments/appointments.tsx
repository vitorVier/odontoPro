import { getTimesClinic } from '../../_data-access/get-times-clinic'
import { AppointmentsList } from './appointments-list'
import { getInfoSchedule } from '@/app/(public)/clinica/[id]/_data-access/get-info-schedule'

export { ButtonNewAppointment } from './button-new-appointment'

export async function Appointments({ userId }: { userId: string }) {
  const { times } = await getTimesClinic({ userId: userId })
  const clinicData = await getInfoSchedule({ userId })

  return (
    <AppointmentsList
      times={times}
      clinicId={userId}
      clinicTimes={times}
      services={clinicData?.services ?? []}
    />
  )
}