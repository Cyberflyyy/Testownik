import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const { userId, score } = await request.json()

  if (!userId || typeof score !== 'number') {
    return NextResponse.json({ error: 'Nieprawidłowe dane wejściowe' }, { status: 400 })
  }

  try {
    // Najpierw pobieramy aktualne statystyki użytkownika
    const currentStats = await prisma.userStats.findUnique({
      where: { userId: userId },
    })

    let newCompletedTests: number
    let newTotalScore: number
    let newAverageScore: number

    if (currentStats) {
      newCompletedTests = currentStats.completedTests + 1
      newTotalScore = currentStats.totalScore + score
      newAverageScore = newTotalScore / newCompletedTests
    } else {
      newCompletedTests = 1
      newTotalScore = score
      newAverageScore = score
    }

    // Teraz aktualizujemy lub tworzymy statystyki użytkownika
    const userStats = await prisma.userStats.upsert({
      where: { userId: userId },
      update: {
        completedTests: newCompletedTests,
        totalScore: newTotalScore,
        averageScore: newAverageScore,
      },
      create: {
        userId: userId,
        completedTests: newCompletedTests,
        totalScore: newTotalScore,
        averageScore: newAverageScore,
      },
    })

    return NextResponse.json({
      message: 'Statystyki użytkownika zaktualizowane pomyślnie',
      userStats,
    })
  } catch (error) {
    console.error('Błąd podczas aktualizacji statystyk użytkownika:', error)
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera' }, { status: 500 })
  }
}