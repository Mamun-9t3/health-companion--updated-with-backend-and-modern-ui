import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userAuth = getUserFromRequest(request);
    if (!userAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = userAuth.userId;
    const { id } = await params;

    const session = await prisma.chatSession.findUnique({
      where: { id }
    });

    if(!session || session.userId !== userId) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ session, messages });
  } catch(error) {
    return NextResponse.json({ message: 'Server error fetching messages' }, { status: 500 });
  }
}
