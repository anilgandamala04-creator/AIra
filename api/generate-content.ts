import type { VercelRequest, VercelResponse } from '@vercel/node';
import { aiService, AI_PROMPT_MAX_LENGTH } from './lib/aiService';
import { setCors } from './lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res, req.headers.origin as string);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, model } = req.body || {};
  if (prompt === undefined || prompt === null) return res.status(400).json({ error: 'Prompt is required' });
  if (typeof prompt === 'string' && prompt.length > AI_PROMPT_MAX_LENGTH) return res.status(400).json({ error: `Prompt exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)` });

  try {
    const result = await aiService.generateContent(prompt, model === 'mistral' ? 'mistral' : 'llama');
    res.status(200).json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate content';
    if (msg.includes('cannot be empty') || msg.includes('maximum length')) return res.status(400).json({ error: msg });
    console.error('[Generate Content] Error:', error);
    res.status(500).json({ error: 'Failed to generate content', message: process.env.NODE_ENV === 'development' ? msg : undefined });
  }
}
