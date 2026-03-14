import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const checkSymptoms = async (req: Request, res: Response) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: 'Symptoms are required' });
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

    res.json({
      analysis: aiReply,
      isEmergency
    });

  } catch (error) {
    console.error('Symptom check error:', error);
    res.status(500).json({ message: 'Server error processing symptoms' });
  }
};
