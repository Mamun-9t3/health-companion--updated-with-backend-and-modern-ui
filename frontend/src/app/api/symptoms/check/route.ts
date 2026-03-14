import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getUserFromRequest } from '@/lib/auth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const userAuth = getUserFromRequest(request);
    if (!userAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { symptoms } = body;

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ message: 'Symptoms are required' }, { status: 400 });
    }

    const systemInstruction = `You are an AI symptom checker for the Health Companion app. Given a list or description of symptoms, you must:
1. NEVER diagnose a specific disease.
2. Suggest the appropriate medical specialist the user should consult (e.g., Cardiologist, Neurologist, Dermatologist, General Practitioner).
3. Provide general wellness advice for the symptoms.
4. Always conclude by urging them to see a real doctor.
5. Identify if the symptoms sound like an emergency and append [EMERGENCY] to your response if so.`;

    const prompt = `System Instruction:\n${systemInstruction}\n\nUser Symptoms:\n${symptoms}`;

    let aiReply = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      aiReply = response.text || 'Unable to analyze symptoms at the moment.';
    } catch(err) {
      console.error('Gemini API Error', err);
      aiReply = 'Service unavailable. Please consult a doctor.';
    }

    const isEmergency = aiReply.includes('[EMERGENCY]');

    return NextResponse.json({
      analysis: aiReply,
      isEmergency
    });

  } catch (error) {
    console.error('Symptom check error:', error);
    return NextResponse.json({ message: 'Server error processing symptoms' }, { status: 500 });
  }
}
