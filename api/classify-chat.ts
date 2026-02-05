import type { VercelRequest, VercelResponse } from '@vercel/node';
import { aiService } from './lib/aiService';
import { setCors } from './lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res, req.headers.origin as string);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, topicName, subjectName, model } = req.body || {};
  const trimmed = typeof message === 'string' ? message.trim() : '';
  if (trimmed.length === 0) return res.status(200).json({ mode: 'general' });

  try {
    const result = await aiService.classifyChatMessage(trimmed, {
      topicName: typeof topicName === 'string' ? topicName : undefined,
      subjectName: typeof subjectName === 'string' ? subjectName : undefined,
    }, model === 'mistral' ? 'mistral' : 'llama');
    res.status(200).json(result);
  } catch (error) {
    console.error('[Classify Chat] Error:', error);
    res.status(200).json({ mode: 'general' });
  }
}
