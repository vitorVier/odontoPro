import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTimesClinic } from "../_data-access/get-times-clinic"
import AgendaPage from "./components/agenda-page"
import { getScheduleBlocks } from "@/utils/schedule/get-schedule-blocks"
import { addMonths, subMonths } from "date-fns"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const scheduleBlocks = await getScheduleBlocks({
    userId: session.user.id,
    startDate: subMonths(new Date(), 2),
    endDate: addMonths(new Date(), 2),
  })

  const { times } = await getTimesClinic({ userId: session.user.id })

  return <AgendaPage userId={session.user.id} times={times} scheduleBlocks={scheduleBlocks} />
}