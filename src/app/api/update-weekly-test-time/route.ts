import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const { userId, timeSpent } = await request.json()

  if (!userId || typeof timeSpent !== 'number') {
    return NextResponse.json({ error: 'Nieprawidłowe dane wejściowe' }, { status: 400 })
  }

  try {
    const currentDate = new Date()
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)

    const weeklyTestTime = await prisma.weeklyTestTime.upsert({
      where: {
        userId_weekStart: {
          userId,
          weekStart: startOfWeek,
        },
      },
      update: {
        totalTime: {
          increment: timeSpent,
        },
      },
      create: {
        userId,
        weekStart: startOfWeek,
        totalTime: timeSpent,
      },
    })

    return NextResponse.json({ message: 'Tygodniowy czas testów zaktualizowany pomyślnie', weeklyTestTime })
  } catch (error) {
    console.error('Błąd podczas aktualizacji tygodniowego czasu testów:', error)
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera' }, { status: 500 })
  }
}