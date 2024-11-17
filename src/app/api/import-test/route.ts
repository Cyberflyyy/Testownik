import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { userId, test } = await request.json()

    if (!userId || !test || !test.name || !Array.isArray(test.questions)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const newTest = await prisma.test.create({
      data: {
        name: test.name,
        userId: userId,
        questions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: test.questions.map((q: any) => ({
            question: q.question,
            answers: q.answers,
            correctAnswers: q.correctAnswers,
            userId: userId, // Dodajemy userId do każdego pytania
          })),
        },
      },
      include: { questions: true },
    })

    return NextResponse.json({ success: true, test: newTest })
  } catch (error) {
    console.error('Error importing test:', error)
    return NextResponse.json({ error: 'Failed to import test', details: (error as Error).message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}