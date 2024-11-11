import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  console.log('GET request received for /api/get-tests');
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('Received userId:', userId);

    if (!userId) {
      console.log('No userId provided');
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const tests = await prisma.test.findMany({
      where: { userId },
      include: {
        questions: {
          select: {
            id: true,
            question: true,
            answers: true,
            correctAnswers: true,
          },
        },
      },
    });

    console.log('Tests found:', tests.length);
    return NextResponse.json({ success: true, tests });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tests' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}