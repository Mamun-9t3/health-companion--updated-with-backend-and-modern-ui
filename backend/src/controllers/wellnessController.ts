import { Request, Response } from 'express';
import prisma from '../config/db';

export const logActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { type, amount, duration } = req.body;

    // type can be 'hydration', 'breathing', 'stretching'

    const activity = await prisma.activityTracking.create({
      data: {
        userId,
        type,
        amount,
        duration,
      }
    });

    // Update Wellness Score simply logic
    // +1 for hydration glass
    // +5 for mindful breathing
    // +10 for stretching
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

    res.status(201).json({ activity, newScore });
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({ message: 'Server error logging activity' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

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

    res.json({
        stats,
        activities,
        score: currentScore?.score || 100
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};
