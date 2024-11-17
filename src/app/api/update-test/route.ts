import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: Request) {
  try {
    const { userId, test } = await request.json()

    if (!userId || !test) {
      return NextResponse.json({ success: false, message: 'Brak wymaganych danych' }, { status: 400 })
    }

    // Sprawdź, czy test istnieje i należy do użytkownika
    const existingTest = await prisma.test.findFirst({
      where: { id: test.id, userId: userId },
    })

    if (!existingTest) {
      return NextResponse.json({ success: false, message: 'Test nie został znaleziony lub nie należy do tego użytkownika' }, { status: 404 })
    }

    // Aktualizuj test
    const updatedTest = await prisma.test.update({
      where: { id: test.id },
      data: {
        name: test.name,
        questions: {
          deleteMany: {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: test.questions.map((q: any) => ({
            userId: userId,
            question: q.question,
            answers: q.answers,
            correctAnswers: q.correctAnswers,
          })),
        },
      },
      include: { questions: true },
    })

    return NextResponse.json({ success: true, test: updatedTest })
  } catch (error) {
    console.error('Błąd podczas aktualizacji testu:', error)
    return NextResponse.json(
      { success: false, message: 'Wystąpił błąd podczas aktualizacji testu: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}