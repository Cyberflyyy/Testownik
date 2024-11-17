import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient,Question } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const testId = request.nextUrl.searchParams.get('testId')

  if (!testId) {
    return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
  }

  try {
    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId, 10) },
      include: { questions: true },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const exportedTest = {
      name: test.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions: test.questions.map((q: Question) => ({
        question: q.question,
        answers: q.answers,
        correctAnswers: q.correctAnswers,
      })),
    }

    return NextResponse.json(exportedTest)
  } catch (error) {
    console.error('Error exporting test:', error)
    return NextResponse.json({ error: 'Failed to export test' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}