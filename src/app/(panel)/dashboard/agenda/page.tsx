import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTimesClinic } from "../_data-access/get-times-clinic"
import AgendaPage from "./components/agenda-page"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const { times } = await getTimesClinic({ userId: session.user.id })

  return <AgendaPage userId={session.user.id} times={times} />
}