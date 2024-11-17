import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const testId = parseInt(url.searchParams.get('id') || '')
    const userId = url.searchParams.get('userId')

    if (isNaN(testId) || !userId) {
      return NextResponse.json(
        { success: false, message: 'Nieprawidłowe ID testu lub brak ID użytkownika' },
        { status: 400 }
      )
    }

    const test = await prisma.test.findUnique({
      where: { 
        id: testId,
        userId: userId
      },
      include: { questions: true }
    })

    if (!test) {
      return NextResponse.json(
        { success: false, message: 'Test nie został znaleziony' },
        { status: 404 }
      )
    }

    // Usuń wszystkie pytania powiązane z testem
    await prisma.question.deleteMany({
      where: { 
        testId,
        userId
      }
    })

    // Usuń test
    await prisma.test.delete({
      where: { 
        id: testId,
        userId
      }
    })

    return NextResponse.json({ success: true, message: 'Test został pomyślnie usunięty' })
  } catch (error) {
    console.error('Błąd podczas usuwania testu:', error)
    return NextResponse.json(
      { success: false, message: 'Wystąpił błąd podczas usuwania testu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}