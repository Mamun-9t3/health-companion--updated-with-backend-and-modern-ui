import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const userAuth = getUserFromRequest(request);
    if (!userAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = userAuth.userId;

    const body = await request.json();
    const { type, amount, duration } = body;

    const activity = await prisma.activityTracking.create({
      data: {
        userId,
        type,
        amount,
        duration,
      }
    });

    let pointsToAdd = 0;
    if (type === 'hydration') pointsToAdd = 1;
    if (type === 'breathing') pointsToAdd = 5;
    if (type === 'stretching') pointsToAdd = 10;

    let scoreRecord = await prisma.wellnessScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' }
    });

    let newScore = (scoreRecord?.score || 0) + pointsToAdd;

    await prisma.wellnessScore.create({
      data: {
        userId,
        score: newScore
      }
    });

    return NextResponse.json({ activity, newScore }, { status: 201 });
  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json({ message: 'Server error logging activity' }, { status: 500 });
  }
}
