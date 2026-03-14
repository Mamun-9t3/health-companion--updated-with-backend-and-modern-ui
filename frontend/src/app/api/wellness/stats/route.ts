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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await prisma.activityTracking.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: today }
      },
      _sum: {
        amount: true
      }
    });

    const activities = await prisma.activityTracking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const currentScore = await prisma.wellnessScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' }
    });

    return NextResponse.json({
      stats,
      activities,
      score: currentScore?.score || 100
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ message: 'Server error fetching stats' }, { status: 500 });
  }
}
