import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAvailableModels, AI_PROMPT_MAX_LENGTH } from './lib/aiService';
import { setCors } from './lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res, req.headers.origin as string);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const models = getAvailableModels();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      provider: process.env.AI_PROVIDER || 'openrouter',
      models: { llama: models.llama, mistral: models.mistral },
      limits: { maxPromptLength: AI_PROMPT_MAX_LENGTH },
      version: '1.0.0',
      environment: 'vercel',
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', error: 'Health check failed' });
  }
}
