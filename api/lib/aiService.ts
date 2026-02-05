/**
 * AI Service for Vercel Serverless
 * Uses process.env only - no Firebase dependencies.
 */

import OpenAI from 'openai';
import { Mistral } from '@mistralai/mistralai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-7b-instruct';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';
const AI_REQUEST_TIMEOUT_MS = Math.max(5000, parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000', 10) || 60000);

export const AI_PROMPT_MAX_LENGTH = 32_000;
export const AI_PROMPT_MIN_LENGTH = 1;

const openrouterClient: OpenAI | null = OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: OPENROUTER_API_KEY,
      baseURL: (process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, ''),
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_ORIGIN || 'https://airaedtech.web.app',
        'X-Title': 'Project AIra',
      },
    })
  : null;

const mistralClient: Mistral | null = MISTRAL_API_KEY ? new Mistral({ apiKey: MISTRAL_API_KEY }) : null;

export type ModelType = 'llama' | 'mistral';

function validatePrompt(prompt: string): void {
  const trimmed = typeof prompt === 'string' ? prompt.trim() : '';
  if (trimmed.length < AI_PROMPT_MIN_LENGTH) throw new Error('Prompt cannot be empty');
  if (trimmed.length > AI_PROMPT_MAX_LENGTH) throw new Error(`Prompt exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)`);
}

function validateQuestion(question: string): void {
  const trimmed = typeof question === 'string' ? question.trim() : '';
  if (trimmed.length < AI_PROMPT_MIN_LENGTH) throw new Error('Question cannot be empty');
  if (trimmed.length > AI_PROMPT_MAX_LENGTH) throw new Error(`Question exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)`);
}

async function withRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      return await operation();
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('cannot be empty') || msg.includes('maximum length') || msg.includes('API key') || msg.includes('not configured')) throw error;
      if (attempt >= maxRetries) throw error;
    }
  }
  throw lastError;
}

async function generateWithLlama(prompt: string, systemPrompt?: string): Promise<string> {
  return withRetry(async () => {
    if (!openrouterClient) throw new Error('LLaMA is not configured. Set OPENROUTER_API_KEY in Vercel Environment Variables.');
    const messages: { role: 'system' | 'user'; content: string }[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await Promise.race([
      openrouterClient.chat.completions.create({ model: OPENROUTER_MODEL, messages, max_tokens: 4096, temperature: 0.3 }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('LLaMA request timeout')), AI_REQUEST_TIMEOUT_MS)),
    ]);
    const content = response.choices[0]?.message?.content;
    if (content == null) throw new Error('Empty LLaMA response');
    return content;
  });
}

async function generateWithMistral(prompt: string, systemPrompt?: string): Promise<string> {
  return withRetry(async () => {
    if (!mistralClient) throw new Error('Mistral is not configured. Set MISTRAL_API_KEY in Vercel Environment Variables.');
    const messages: { role: 'user' | 'system'; content: string }[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await mistralClient.chat.complete({ model: MISTRAL_MODEL, messages, maxTokens: 4096, temperature: 0.3 }, { timeoutMs: AI_REQUEST_TIMEOUT_MS });
    const raw = response.choices?.[0]?.message?.content;
    if (raw == null) throw new Error('Empty Mistral response');
    const content = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.map((c: { type?: string; text?: string }) => (c?.type === 'text' && typeof c.text === 'string' ? c.text : '')).join('') : '';
    if (!content) throw new Error('Empty Mistral response');
    return content;
  });
}

export function getAvailableModels(): { llama: boolean; mistral: boolean } {
  return { llama: !!openrouterClient, mistral: !!mistralClient };
}

async function generateResponse(prompt: string, modelType: ModelType = 'llama', systemPrompt?: string): Promise<string> {
  validatePrompt(prompt);
  if (modelType === 'mistral') return generateWithMistral(prompt, systemPrompt);
  return generateWithLlama(prompt, systemPrompt);
}

export const aiService = {
  async resolveDoubt(question: string, context: string, model?: ModelType) {
    validateQuestion(question);
    const modelType = (model === 'mistral' ? 'mistral' : 'llama') as ModelType;
    const prompt = `You are an expert AI tutor. A student has a doubt about a specific topic.

Topic Context: ${context}
Student Question: ${question}

Provide a clear, concise, and helpful explanation. Include 2-3 real-world examples if appropriate.
Also provide a single multiple-choice quiz question (4 options, correct answer index 0-3) to verify understanding.

Respond with only valid JSON, no markdown:
{
  "explanation": "...",
  "examples": ["...", "..."],
  "quizQuestion": {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "explanation": "..."
  }
}`;
    const responseText = await generateResponse(prompt, modelType);
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
      return { explanation: parsed.explanation ?? responseText, examples: Array.isArray(parsed.examples) ? parsed.examples : [], quizQuestion: parsed.quizQuestion ?? null };
    } catch {
      return { explanation: responseText, examples: [], quizQuestion: null };
    }
  },

  async generateContent(prompt: string, model?: ModelType) {
    const modelType = (model === 'mistral' ? 'mistral' : 'llama') as ModelType;
    const content = await generateResponse(prompt.trim(), modelType);
    return { content, model: modelType };
  },

  async classifyChatMessage(message: string, options: { topicName?: string; subjectName?: string } = {}, model?: ModelType) {
    const trimmed = typeof message === 'string' ? message.trim() : '';
    if (trimmed.length === 0) return { mode: 'general' as const };
    const context = [options.topicName, options.subjectName].filter(Boolean).join(', ') || 'General conversation';
    const prompt = `You are a classifier. Given a user message and optional learning context, determine if the message is specifically about the current lesson/subject (subject_specific) or is a general question/chat (general).

Context: ${context}
User message: "${trimmed}"

Respond with ONLY a single word: "subject_specific" or "general". No other text.`;
    const modelType = (model === 'mistral' ? 'mistral' : 'llama') as ModelType;
    const responseText = await generateResponse(prompt, modelType);
    const mode = (responseText || '').trim().toLowerCase().includes('subject_specific') ? 'subject_specific' : 'general';
    return { mode };
  },

  async generateTeachingContent(topic: string, model?: ModelType) {
    const modelType = (model === 'mistral' ? 'mistral' : 'llama') as ModelType;
    const prompt = `Generate a structured learning lesson for the topic: "${topic}". Include a title, 3 sections with detailed content, and a final summary. Respond with only valid JSON:
{
  "title": "...",
  "sections": [{"title": "...", "content": "..."}, {"title": "...", "content": "..."}, {"title": "...", "content": "..."}],
  "summary": "..."
}`;
    const responseText = await generateResponse(prompt, modelType, 'You are an expert curriculum designer.');
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
    return { title: parsed.title ?? topic, sections: Array.isArray(parsed.sections) ? parsed.sections : [], summary: parsed.summary ?? '' };
  },

  async generateQuiz(topic: string, context: string, model?: ModelType) {
    const modelType = (model === 'mistral' ? 'mistral' : 'llama') as ModelType;
    const prompt = `Generate a 5-question multiple choice quiz about "${topic}" based on: "${context}". Each question has 4 options. Respond with only valid JSON:
{
  "questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "..."}]
}`;
    const responseText = await generateResponse(prompt, modelType, 'You are an expert assessment creator.');
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
    return { questions: Array.isArray(parsed.questions) ? parsed.questions : [] };
  },
};
