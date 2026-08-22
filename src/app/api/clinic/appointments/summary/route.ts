import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from 'next/server'
import { differenceInDays, format } from 'date-fns'

const MAX_RANGE_DAYS = 62

export const GET = auth(async function GET(request) {
  if (!request.auth) {
    return NextResponse.json({ error: "Acesso não autorizado!" }, { status: 401 })
  }

  const clinicId = request.auth?.user?.id
  if (!clinicId) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 400 })
  }

  const searchParams = request.nextUrl.searchParams
  const startDateString = searchParams.get("startDate")
  const endDateString = searchParams.get("endDate")

  if (!startDateString || !endDateString) {
    return NextResponse.json({ error: "Informe 'startDate' e 'endDate'." }, { status: 400 })
  }

  try {
    const [sy, sm, sd] = startDateString.split("-").map(Number)
    const [ey, em, ed] = endDateString.split("-").map(Number)

    const startDate = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0, 0))
    const endDate = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59, 999))

    if (differenceInDays(endDate, startDate) > MAX_RANGE_DAYS) {
      return NextResponse.json({ error: "Intervalo de datas muito longo." }, { status: 400 })
    }

    // appointmentDate já é gravado como meia-noite UTC do dia (ver create-appointment.ts),
    // então agrupar direto pelo campo já equivale a agrupar por dia.
    const grouped = await prisma.appointment.groupBy({
      by: ["appointmentDate"],
      where: {
        userId: clinicId,
        appointmentDate: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
    })

    const summary = grouped.map((g) => ({
      date: format(g.appointmentDate, "yyyy-MM-dd"),
      count: g._count.id,
    }))

    return NextResponse.json(summary)

  } catch (err) {
    return NextResponse.json({ error: "Falha ao buscar resumo de agendamentos" }, { status: 400 })
  }
}) as any;