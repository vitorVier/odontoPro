import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse, NextRequest } from 'next/server'
import { differenceInDays } from 'date-fns'

/*
  Rota para buscar agendamentos de uma clínica.

  Modo 1 (compatível com uso atual): ?date=YYYY-MM-DD -> um único dia
  Modo 2 (novo, para agenda semanal/mensal): ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
*/

const MAX_RANGE_DAYS = 62

function parseDateParam(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return { year, month, day }
}

export const GET = auth(async function GET(request) {
  if (!request.auth) {
    return NextResponse.json({ error: "Acesso não autorizado!" }, { status: 401 })
  }

  const clinicId = request.auth?.user?.id
  if (!clinicId) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 400 })
  }

  const searchParams = request.nextUrl.searchParams
  const dateString = searchParams.get("date")
  const startDateString = searchParams.get("startDate")
  const endDateString = searchParams.get("endDate")

  try {
    let startDate: Date
    let endDate: Date

    if (startDateString && endDateString) {
      const s = parseDateParam(startDateString)
      const e = parseDateParam(endDateString)

      startDate = new Date(Date.UTC(s.year, s.month - 1, s.day, 0, 0, 0, 0))
      endDate = new Date(Date.UTC(e.year, e.month - 1, e.day, 23, 59, 59, 999))

      if (differenceInDays(endDate, startDate) > MAX_RANGE_DAYS) {
        return NextResponse.json({ error: "Intervalo de datas muito longo." }, { status: 400 })
      }
    } else if (dateString) {
      const d = parseDateParam(dateString)
      startDate = new Date(Date.UTC(d.year, d.month - 1, d.day, 0, 0, 0, 0))
      endDate = new Date(Date.UTC(d.year, d.month - 1, d.day, 23, 59, 59, 999))
    } else {
      return NextResponse.json({ error: "Informe 'date' ou 'startDate'/'endDate'." }, { status: 400 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: clinicId,
        appointmentDate: { gte: startDate, lte: endDate },
      },
      include: { service: true },
      orderBy: [{ appointmentDate: "asc" }, { time: "asc" }],
    })

    return NextResponse.json(appointments)

  } catch (err) {
    return NextResponse.json({ error: "Falha ao buscar agendamentos" }, { status: 400 })
  }
}) as any;