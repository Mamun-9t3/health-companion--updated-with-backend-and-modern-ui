import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import prisma from '../config/db';

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

export const aiDoctorChat = async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;
    const userId = (req as any).user.userId; // from auth middleware

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
       return res.json({
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
        model: 'gemini-2.5-flash',
        contents: formattedHistory,
        config: {
          systemInstruction: systemInstruction
        }
      });

      aiReply = response.text || 'I am sorry, I am unable to process that at the moment.';
    } catch(err) {
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

    res.json({
      sessionId: currentSessionId,
      reply: aiReply,
      isEmergency: aiEmergency
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error processing chat' });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
     const userId = (req as any).user.userId;
     const sessions = await prisma.chatSession.findMany({
       where: { userId },
       orderBy: { createdAt: 'desc' },
       include: {
         _count: {
           select: { messages: true }
         }
       }
     });
     res.json(sessions);
  } catch(error) {
     res.status(500).json({ message: 'Server error fetching sessions' });
  }
}

export const getSessionMessages = async (req: Request, res: Response) => {
  try {
     const userId = (req as any).user.userId;
     const { id } = req.params;

     const session = await prisma.chatSession.findUnique({
       where: { id: id as string }
     });

     if(!session || session.userId !== userId) {
       return res.status(404).json({ message: 'Session not found' });
     }

     const messages = await prisma.chatMessage.findMany({
       where: { sessionId: id as string },
       orderBy: { createdAt: 'asc' }
     });

     res.json({ session, messages });
  } catch(error) {
     res.status(500).json({ message: 'Server error fetching messages' });
  }
}
