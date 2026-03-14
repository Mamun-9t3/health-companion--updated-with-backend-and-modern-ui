import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const userAuth = getUserFromRequest(request);
    if (!userAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = userAuth.userId;

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
    
    return NextResponse.json(sessions);
  } catch(error) {
    return NextResponse.json({ message: 'Server error fetching sessions' }, { status: 500 });
  }
}
