import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const currentDate = new Date()
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)

    const weeklyTestTime = await prisma.weeklyTestTime.findFirst({
      where: {
        userId: userId,
        weekStart: {
          gte: startOfWeek,
          lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
      },
    })

    return NextResponse.json({ weeklyTestTime: weeklyTestTime?.totalTime || 0 })
  } catch (error) {
    console.error('Error fetching weekly test time:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}