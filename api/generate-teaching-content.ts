import type { VercelRequest, VercelResponse } from '@vercel/node';
import { aiService } from './lib/aiService';
import { setCors } from './lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res, req.headers.origin as string);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, prompt: fullPrompt, model } = req.body || {};
  const modelType = model === 'mistral' ? 'mistral' : 'llama';

  if (fullPrompt && typeof fullPrompt === 'string' && fullPrompt.trim().length > 0) {
    try {
      const content = await aiService.generateTeachingContentFromPrompt(fullPrompt.trim(), modelType);
      res.status(200).json(content);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to generate teaching content';
      console.error('[Generate Teaching Content] Error:', error);
      res.status(500).json({ error: 'Failed to generate teaching content', message: process.env.NODE_ENV === 'development' ? msg : undefined });
    }
    return;
  }

  if (!topic) return res.status(400).json({ error: 'Topic or prompt is required' });

  try {
    const content = await aiService.generateTeachingContent(topic, modelType);
    res.status(200).json(content);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate teaching content';
    console.error('[Generate Teaching Content] Error:', error);
    res.status(500).json({ error: 'Failed to generate teaching content', message: process.env.NODE_ENV === 'development' ? msg : undefined });
  }
}
