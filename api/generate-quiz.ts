import type { VercelRequest, VercelResponse } from '@vercel/node';
import { aiService } from './lib/aiService';
import { setCors } from './lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res, req.headers.origin as string);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, context, model } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  try {
    const quiz = await aiService.generateQuiz(topic, context || 'General Education', model === 'mistral' ? 'mistral' : 'llama');
    res.status(200).json(quiz);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate quiz';
    console.error('[Generate Quiz] Error:', error);
    res.status(500).json({ error: 'Failed to generate quiz', message: process.env.NODE_ENV === 'development' ? msg : undefined });
  }
}
