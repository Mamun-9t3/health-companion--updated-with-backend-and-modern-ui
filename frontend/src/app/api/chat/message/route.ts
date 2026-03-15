import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const EMERGENCY_KEYWORDS = [
  'chest pain',
  'stroke',
  'difficulty breathing',
  'severe bleeding',
  'heart attack',
  'cant breath',
  'can not breath'
];

export async function POST(request: Request) {
  try {
    const userAuth = getUserFromRequest(request);
    if (!userAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = userAuth.userId;

    const body = await request.json();
    const { sessionId, message } = body;

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = await prisma.chatSession.create({
        data: {
          userId,
          title: message.substring(0, 50) + '...',
        }
      });
      currentSessionId = newSession.id;
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: currentSessionId,
        role: 'user',
        content: message,
      }
    });

    // Check emergency
    const lowerMessage = message.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some(kw => lowerMessage.includes(kw));

    if (isEmergency) {
      await prisma.chatMessage.create({
        data: {
          sessionId: currentSessionId,
          role: 'ai',
          content: '[EMERGENCY] SEEK IMMEDIATE MEDICAL ATTENTION. Call your local emergency number or proceed to the nearest hospital immediately.',
          isEmergency: true
        }
      });
      return NextResponse.json({
        sessionId: currentSessionId,
        reply: '[EMERGENCY] SEEK IMMEDIATE MEDICAL ATTENTION. Call your local emergency number or proceed to the nearest hospital immediately.',
        isEmergency: true
      });
    }

    // Get chat history
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: currentSessionId },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    const systemInstruction = 'You are an AI health assistant for Health Companion app. You CANNOT and MUST NOT diagnose diseases. Provide general health guidance only. Encourage consulting a medical professional. If the user mentions extreme pain or severe symptoms, warn them to seek emergency care.';

    // Format history for Gemini (roles: 'user' or 'model')
    const formattedHistory = history.map((m: any) => ({
      role: m.role === 'ai' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Add current user message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    let aiReply = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: formattedHistory,
        config: {
          systemInstruction: systemInstruction
        }
      });

      aiReply = response.text || 'I am sorry, I am unable to process that at the moment.';
    } catch (err) {
      console.error('Gemini API Error', err);
      aiReply = 'I am currently experiencing technical difficulties. Please consult a healthcare professional for advice.';
    }

    // Check if AI determined an emergency
    const aiEmergency = aiReply.includes('[EMERGENCY]');

    await prisma.chatMessage.create({
      data: {
        sessionId: currentSessionId,
        role: 'ai',
        content: aiReply,
        isEmergency: aiEmergency
      }
    });

    return NextResponse.json({
      sessionId: currentSessionId,
      reply: aiReply,
      isEmergency: aiEmergency
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ message: 'Server error processing chat' }, { status: 500 });
  }
}
