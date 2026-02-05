import type { VercelRequest, VercelResponse } from '@vercel/node';
import { aiService, AI_PROMPT_MAX_LENGTH } from './lib/aiService';
import { setCors } from './lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res, req.headers.origin as string);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question, context, model } = req.body || {};
  if (question === undefined || question === null) return res.status(400).json({ error: 'Question is required' });
  if (typeof question === 'string' && question.length > AI_PROMPT_MAX_LENGTH) return res.status(400).json({ error: `Question exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)` });

  try {
    const resolution = await aiService.resolveDoubt(question, context || 'General Education', model === 'mistral' ? 'mistral' : 'llama');
    res.status(200).json(resolution);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to resolve doubt';
    if (msg.includes('cannot be empty') || msg.includes('maximum length')) return res.status(400).json({ error: msg });
    console.error('[Resolve Doubt] Error:', error);
    res.status(500).json({ error: 'Failed to resolve doubt', message: process.env.NODE_ENV === 'development' ? msg : undefined });
  }
}
