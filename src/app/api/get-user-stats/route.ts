import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Wymagane jest ID użytkownika' }, { status: 400 })
  }

  try {
    const userStats = await prisma.userStats.findUnique({
      where: { userId: userId },
    })

    if (!userStats) {
      return NextResponse.json({ completedTests: 0, averageScore: 0 })
    }

    return NextResponse.json({
      completedTests: userStats.completedTests,
      averageScore: userStats.averageScore,
    })
  } catch (error) {
    console.error('Błąd podczas pobierania statystyk użytkownika:', error)
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera' }, { status: 500 })
  }
}