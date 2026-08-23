import prisma from "@/lib/prisma"
import { NextResponse, NextRequest } from 'next/server'
import { getScheduleBlocks } from '@/utils/schedule/get-schedule-blocks'
import { generateTimeSlots } from '@/utils/calendar'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")
  const dateString = searchParams.get("date")

  if (!userId || !dateString) {
    return NextResponse.json({ error: "Parâmetros obrigatórios ausentes" }, { status: 400 })
  }

  try {
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { times: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 })
    }

    const blocks = await getScheduleBlocks({ userId, startDate: date, endDate: date })
    const allSlots = generateTimeSlots(user.times)

    const { isSlotBlocked } = await import('@/utils/schedule/is-slot-blocked')

    const blockedSlots = allSlots.filter((time) => isSlotBlocked(date, time, blocks))

    return NextResponse.json(blockedSlots)

  } catch (err) {
    return NextResponse.json({ error: "Falha ao buscar bloqueios" }, { status: 400 })
  }
}