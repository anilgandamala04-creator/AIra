import OpenAI from 'openai';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

// ---------------------------------------------------------------------------
// Timeouts & validation (real-time AI processing)
// ---------------------------------------------------------------------------
const AI_REQUEST_TIMEOUT_MS = Math.max(5000, parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000', 10) || 60000);
export const AI_PROMPT_MAX_LENGTH = 32_000;
const AI_PROMPT_MIN_LENGTH = 1;

function validatePrompt(prompt: string): void {
    const trimmed = typeof prompt === 'string' ? prompt.trim() : '';
    if (trimmed.length < AI_PROMPT_MIN_LENGTH) {
        throw new Error('Prompt cannot be empty');
    }
    if (trimmed.length > AI_PROMPT_MAX_LENGTH) {
        throw new Error(`Prompt exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)`);
    }
}

function validateQuestion(question: string): void {
    const trimmed = typeof question === 'string' ? question.trim() : '';
    if (trimmed.length < AI_PROMPT_MIN_LENGTH) {
        throw new Error('Question cannot be empty');
    }
    if (trimmed.length > AI_PROMPT_MAX_LENGTH) {
        throw new Error(`Question exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)`);
    }
}

// ---------------------------------------------------------------------------
// LLaMA – using OpenRouter or Ollama
// Models: qwen/qwen-2.5-7b-instruct, mistralai/mistral-7b-instruct, etc.
// ---------------------------------------------------------------------------
const llamaModel = process.env.LLAMA_MODEL || 'qwen/qwen-2.5-7b-instruct';

// ---------------------------------------------------------------------------
// Mistral – native Mistral API for production-grade Mistral models
// ---------------------------------------------------------------------------
const mistralApiKey = process.env.MISTRAL_API_KEY;
const mistralModel = process.env.MISTRAL_MODEL || 'mistral-small-latest';

const mistralClient: Mistral | null = mistralApiKey
    ? new Mistral({ apiKey: mistralApiKey })
    : null;

// OpenRouter (https://openrouter.ai) – use when OPENROUTER_API_KEY is set
const openrouterApiKey = process.env.OPENROUTER_API_KEY;
const openrouterBaseUrl = (process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
const openrouterModel = process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-7b-instruct';

const openrouterClient: OpenAI | null = openrouterApiKey
    ? new OpenAI({
        apiKey: openrouterApiKey,
        baseURL: openrouterBaseUrl,
        defaultHeaders: {
            'HTTP-Referer': process.env.APP_ORIGIN || 'http://localhost:3000',
            'X-Title': 'Project AIra',
        },
    })
    : null;

// Optional: OpenAI-compatible fallback (OpenRouter / Ollama / OpenAI)
const provider = process.env.AI_PROVIDER || 'openrouter';
const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';

let fallbackOpenAI: OpenAI | null = null;
if (openrouterClient && (provider === 'openrouter' || provider !== 'ollama')) {
    fallbackOpenAI = openrouterClient;
} else if (provider === 'ollama') {
    fallbackOpenAI = new OpenAI({ apiKey: 'ollama', baseURL: ollamaUrl });
} else if (process.env.OPENAI_API_KEY) {
    fallbackOpenAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/** Which model to use for doubt resolution: llama | mistral */
const doubtResolutionModel = (process.env.DOUBT_RESOLUTION_MODEL || 'llama').toLowerCase() as 'llama' | 'mistral';

export type ModelType = 'llama' | 'mistral';

export function getAvailableModels(): { llama: boolean; mistral: boolean } {
    return {
        llama: !!fallbackOpenAI,
        mistral: !!mistralClient,
    };
}

/**
 * Retry helper for asynchronous operations
 */
async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.log(`[AI Service] Retry attempt ${attempt} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            return await operation();
        } catch (error: any) {
            lastError = error;
            console.warn(`[AI Service] Attempt ${attempt + 1} failed:`, error.message || error);

            // Don't retry on auth errors or specific client errors
            if (error.status === 401 || error.status === 403 || (error.message && error.message.includes('API key'))) {
                throw error;
            }
        }
    }
    throw lastError;
}

async function generateWithLlama(prompt: string, systemPrompt?: string): Promise<string> {
    const client = fallbackOpenAI;
    if (!client) {
        throw new Error('LLaMA is not configured. Set OPENROUTER_API_KEY.');
    }
    const model = openrouterClient ? openrouterModel : llamaModel;

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    return await withRetry(async () => {
        const response = await Promise.race([
            client.chat.completions.create({
                model,
                messages,
                max_tokens: 4096,
                temperature: 0.3,
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('LLaMA request timeout')), AI_REQUEST_TIMEOUT_MS)
            ),
        ]);

        const content = response.choices[0]?.message?.content;
        if (content == null) throw new Error('Empty LLaMA response');
        return content;
    });
}

async function generateWithMistral(prompt: string, systemPrompt?: string): Promise<string> {
    if (!mistralClient) {
        throw new Error('Mistral is not configured. Set MISTRAL_API_KEY.');
    }
    const messages: { role: 'user' | 'system'; content: string | { type: 'text'; text: string }[] }[] = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    return await withRetry(async () => {
        const response = await mistralClient.chat.complete(
            {
                model: mistralModel,
                messages,
                maxTokens: 4096,
                temperature: 0.3,
            },
            { timeoutMs: AI_REQUEST_TIMEOUT_MS }
        );
        const raw = response.choices?.[0]?.message?.content;
        if (raw == null) throw new Error('Empty Mistral response');
        let content: string;
        if (typeof raw === 'string') {
            content = raw;
        } else if (Array.isArray(raw)) {
            content = raw
                .map((chunk: { type?: string; text?: string }) => (chunk?.type === 'text' && typeof chunk.text === 'string' ? chunk.text : ''))
                .join('');
        } else {
            content = '';
        }
        if (!content) throw new Error('Empty Mistral response');
        return content;
    });
}

export const aiService = {
    async generateResponse(prompt: string, modelType: ModelType = 'llama', systemPrompt?: string): Promise<string> {
        try {
            validatePrompt(prompt);
            if (modelType === 'mistral') return await generateWithMistral(prompt, systemPrompt);
            return await generateWithLlama(prompt, systemPrompt);
        } catch (error) {
            console.error('AI Generation Error:', error);
            // Preserve original error message if it's informative
            if (error instanceof Error && (
                error.message.includes('timeout') ||
                error.message.includes('API key') ||
                error.message.includes('rate limit') ||
                error.message.includes('not configured')
            )) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Failed to generate AI response');
        }
    },

    async resolveDoubt(question: string, context: string, modelOverride?: ModelType): Promise<{
        explanation: string;
        examples: string[];
        quizQuestion: { question: string; options: string[]; correctAnswer: number; explanation: string } | null;
    }> {
        const prompt = `You are an expert AI tutor. A student has a doubt about a specific topic.

Topic Context: ${context}
Student Question: ${question}

Provide a clear, concise, and helpful explanation.
If appropriate, include 2-3 real-world examples.
Also, provide a single multiple-choice quiz question (with 4 options and the correct answer index 0-3) to verify their understanding.

Respond with only valid JSON, no markdown or extra text:
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

        validateQuestion(question);
        const modelToUse = modelOverride ?? (doubtResolutionModel === 'mistral' && mistralClient ? 'mistral' : 'llama');
        const responseText = await this.generateResponse(prompt, modelToUse);
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(jsonStr || '{}');
            return {
                explanation: parsed.explanation ?? responseText,
                examples: Array.isArray(parsed.examples) ? parsed.examples : [],
                quizQuestion: parsed.quizQuestion ?? null,
            };
        } catch (e) {
            console.error('Failed to parse AI JSON response:', e);
            return {
                explanation: responseText,
                examples: [],
                quizQuestion: null,
            };
        }
    },

    async generateTeachingContent(topic: string, modelOverride?: ModelType): Promise<{
        title: string;
        sections: { title: string; content: string }[];
        summary: string;
    }> {
        const prompt = `Generate a structured learning lesson for the topic: "${topic}".
Include a title, 3 sections with detailed content, and a final summary.

Respond with only valid JSON:
{
  "title": "...",
  "sections": [
    { "title": "...", "content": "..." },
    { "title": "...", "content": "..." },
    { "title": "...", "content": "..." }
  ],
  "summary": "..."
}`;

        const modelToUse = modelOverride ?? (doubtResolutionModel === 'mistral' && mistralClient ? 'mistral' : 'llama');
        const responseText = await this.generateResponse(prompt, modelToUse, "You are an expert curriculum designer.");

        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(jsonStr);
            return {
                title: parsed.title ?? topic,
                sections: Array.isArray(parsed.sections) ? parsed.sections : [],
                summary: parsed.summary ?? '',
            };
        } catch (e) {
            console.error('Failed to parse Teaching Content JSON:', e);
            throw new Error('Failed to generate structured teaching content');
        }
    },

    async generateQuiz(topic: string, context: string, modelOverride?: ModelType): Promise<{
        questions: { question: string; options: string[]; correctAnswer: number; explanation: string }[];
    }> {
        const prompt = `Generate a 5-question multiple choice quiz about "${topic}" based on this context: "${context}".
Each question should have 4 options and a clear explanation for the correct answer.

Respond with only valid JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}`;

        const modelToUse = modelOverride ?? (doubtResolutionModel === 'mistral' && mistralClient ? 'mistral' : 'llama');
        const responseText = await this.generateResponse(prompt, modelToUse, "You are an expert assessment creator.");

        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(jsonStr);
            return {
                questions: Array.isArray(parsed.questions) ? parsed.questions : [],
            };
        } catch (e) {
            console.error('Failed to parse Quiz JSON:', e);
            throw new Error('Failed to generate structured quiz');
        }
    },
};
