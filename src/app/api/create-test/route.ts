import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, questions, userId } = await request.json()

    const test = await prisma.test.create({
      data: {
        name,
        userId,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            answers: q.answers,
            correctAnswers: q.correctAnswers,
            userId,
          })),
        },
      },
    })

    return NextResponse.json({ success: true, test })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json({ success: false, error: 'Failed to create test' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}