import OpenAI from 'openai';
import { Mistral } from '@mistralai/mistralai';
import { AI_PROMPT_MAX_LENGTH as CONST_MAX, AI_PROMPT_MIN_LENGTH as CONST_MIN } from '../constants';

// Load environment variables from .env file (for local development)
// In production, these should be set via Firebase Secrets or Config
// Only load dotenv in local/emulator environment
if (process.env.FUNCTIONS_EMULATOR === 'true' || process.env.NODE_ENV === 'development') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('dotenv').config();
    } catch {
        // dotenv not available, that's okay
    }
}

// ---------------------------------------------------------------------------
// Timeouts & validation (real-time AI processing)
// ---------------------------------------------------------------------------
// Support new environment variables only (removed legacy functions.config)
function getConfigValue(path: string, defaultValue?: string): string | undefined {
    // Try environment variables (standard method)
    // Convert 'ai.request_timeout_ms' -> 'AI_REQUEST_TIMEOUT_MS' or exact match
    const envKey = path.toUpperCase().replace(/\./g, '_');
    if (process.env[envKey]) {
        return process.env[envKey];
    }
    // Also check for direct match if path is already uppercase-ish
    if (process.env[path]) {
        return process.env[path];
    }

    return defaultValue;
}

// ---------------------------------------------------------------------------
// Configuration (Lazy Loading)
// ---------------------------------------------------------------------------

function getTimeout(): number {
    return Math.max(
        5000,
        parseInt(getConfigValue('ai.request_timeout_ms') || process.env.AI_REQUEST_TIMEOUT_MS || '60000', 10) || 60000
    );
}

export { AI_PROMPT_MAX_LENGTH } from '../constants';
const AI_PROMPT_MIN_LENGTH = CONST_MIN;

function validatePrompt(prompt: string): void {
    const trimmed = typeof prompt === 'string' ? prompt.trim() : '';
    if (trimmed.length < AI_PROMPT_MIN_LENGTH) {
        throw new Error('Prompt cannot be empty');
    }
    if (trimmed.length > CONST_MAX) {
        throw new Error(`Prompt exceeds maximum length (${CONST_MAX} characters)`);
    }
}

function validateQuestion(question: string): void {
    const trimmed = typeof question === 'string' ? question.trim() : '';
    if (trimmed.length < AI_PROMPT_MIN_LENGTH) {
        throw new Error('Question cannot be empty');
    }
    if (trimmed.length > CONST_MAX) {
        throw new Error(`Question exceeds maximum length (${CONST_MAX} characters)`);
    }
}

// ---------------------------------------------------------------------------
// Model Clients (Lazy Initialization)
// ---------------------------------------------------------------------------

function getLlamaModel() {
    return getConfigValue('ai.llama_model') || process.env.LLAMA_MODEL || 'qwen/qwen-2.5-7b-instruct';
}

function getMistralClient(): Mistral | null {
    const apiKey = getConfigValue('mistral.api_key') || process.env.MISTRAL_API_KEY;
    return apiKey ? new Mistral({ apiKey }) : null;
}

function getMistralModel() {
    return getConfigValue('mistral.model') || process.env.MISTRAL_MODEL || 'mistral-small-latest';
}

function getOpenRouterClient(): OpenAI | null {
    const apiKey = getConfigValue('openrouter.api_key') || process.env.OPENROUTER_API_KEY;
    const baseUrl = (
        getConfigValue('openrouter.api_url') ||
        process.env.OPENROUTER_API_URL ||
        'https://openrouter.ai/api/v1'
    ).replace(/\/$/, '');

    return apiKey
        ? new OpenAI({
            apiKey,
            baseURL: baseUrl,
            defaultHeaders: {
                'HTTP-Referer': process.env.APP_ORIGIN || 'https://aira-learning-a3884.web.app',
                'X-Title': 'Project AIra',
            },
        })
        : null;
}

function getOpenRouterModel() {
    return getConfigValue('openrouter.model') || process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-7b-instruct';
}

function getFallbackOpenAI(): OpenAI | null {
    const provider = getConfigValue('ai.provider') || process.env.AI_PROVIDER || 'openrouter';
    const ollamaUrl = getConfigValue('ollama.base_url') || process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';

    const openRouter = getOpenRouterClient();

    if (openRouter && (provider === 'openrouter' || provider !== 'ollama')) {
        return openRouter;
    } else if (provider === 'ollama') {
        return new OpenAI({ apiKey: 'ollama', baseURL: ollamaUrl });
    } else {
        const openaiKey = getConfigValue('openai.api_key') || process.env.OPENAI_API_KEY;
        if (openaiKey) {
            return new OpenAI({ apiKey: openaiKey });
        }
    }
    return null;
}

function getDoubtResolutionModel(): 'llama' | 'mistral' {
    return (
        getConfigValue('ai.doubt_resolution_model') ||
        process.env.DOUBT_RESOLUTION_MODEL ||
        'llama'
    ).toLowerCase() as 'llama' | 'mistral';
}

export type ModelType = 'llama' | 'mistral';

// ============================================================================
// Retry Logic
// ============================================================================

async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2,
    baseDelayMs: number = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = baseDelayMs * Math.pow(2, attempt - 1);
                console.log(`[AI Functions] Retry attempt ${attempt} after ${delay}ms delay...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            return await operation();
        } catch (error) {
            lastError = error;
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[AI Functions] Attempt ${attempt + 1} failed:`, message);

            // Don't retry on validation/setup/auth errors
            if (message.includes('cannot be empty') ||
                message.includes('maximum length') ||
                message.includes('API key') ||
                message.includes('not configured')) {
                throw error;
            }

            // Don't retry on specific non-retriable errors if known
            if (attempt >= maxRetries) {
                throw error;
            }
        }
    }
    throw lastError;
}

export function getAvailableModels(): { llama: boolean; mistral: boolean } {
    return {
        llama: !!getFallbackOpenAI(),
        mistral: !!getMistralClient(),
    };
}

async function generateWithLlama(prompt: string, systemPrompt?: string): Promise<string> {
    return await withRetry(async () => {
        const client = getFallbackOpenAI();
        if (!client) {
            throw new Error('LLaMA is not configured. Set OPENROUTER_API_KEY (see deployment guide).');
        }

        const openRouterClient = getOpenRouterClient();
        const model = openRouterClient ? getOpenRouterModel() : getLlamaModel();

        const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        try {
            const timeout = getTimeout();
            const response = await Promise.race([
                client.chat.completions.create({
                    model,
                    messages,
                    max_tokens: 4096,
                    temperature: 0.3,
                }),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('LLaMA request timeout')), timeout)
                ),
            ]);

            const content = response.choices[0]?.message?.content;
            if (content == null) throw new Error('Empty LLaMA response');
            return content;
        } catch (error) {
            const timeout = getTimeout();
            if (error instanceof Error && error.message === 'LLaMA request timeout') {
                throw new Error(`Request timeout: LLaMA did not respond within ${timeout}ms`);
            }
            if (error instanceof Error && error.message.includes('API key')) {
                throw new Error('Invalid API key. Please check your OPENROUTER_API_KEY configuration.');
            }
            if (error instanceof Error && error.message.includes('rate limit')) {
                throw new Error('Rate limit exceeded. Please try again in a moment.');
            }
            throw error;
        }
    });
}

async function generateWithMistral(prompt: string, systemPrompt?: string): Promise<string> {
    return await withRetry(async () => {
        const mistralClient = getMistralClient();
        if (!mistralClient) {
            throw new Error('Mistral is not configured. Set MISTRAL_API_KEY.');
        }
        const messages: { role: 'user' | 'system'; content: string | { type: 'text'; text: string }[] }[] = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const timeout = getTimeout();
        const response = await mistralClient.chat.complete(
            {
                model: getMistralModel(),
                messages,
                maxTokens: 4096,
                temperature: 0.3,
            },
            { timeoutMs: timeout }
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

    async resolveDoubt(
        question: string,
        context: string,
        curriculumContext?: {
            curriculumType?: string;
            board?: string;
            grade?: string;
            exam?: string;
            subject?: string;
            topic?: string;
        },
        modelOverride?: ModelType
    ): Promise<{
        explanation: string;
        examples: string[];
        visualType?: string;
        visualPrompt?: string;
        quizQuestion: { question: string; options: string[]; correctAnswer: number; explanation: string } | null;
    }> {
        let curriculumStr = '';
        if (curriculumContext) {
            const { curriculumType, board, grade, exam, subject, topic } = curriculumContext;
            if (curriculumType === 'school') {
                curriculumStr = `Context: ${grade} student, ${board} Board, Subject: ${subject}, Topic: ${topic || 'General'}`;
            } else if (curriculumType === 'competitive') {
                curriculumStr = `Context: Preparing for ${exam}, Subject: ${subject}, Topic: ${topic || 'General'}`;
            }
        }

        const prompt = `You are an expert AI tutor. A student has a doubt about a specific topic.
${curriculumStr ? `\nCurriculum ${curriculumStr}` : ''}
Topic Context: ${context}
Student Question: ${question}

MANDATORY: EXPLAIN STRICTLY BASED ON SELECTED SUBJECT AND TOPIC.
- No cross-topic, cross-subject, or out-of-syllabus visuals or explanations.
- Do NOT introduce unrelated concepts, examples, or visuals outside the topic scope. All content must be directly, strictly, and exclusively related to the selected subject and topic only.

MANDATORY: VISUAL-ONLY TEACHING (PRELOADED MODE) — STATIC VISUALS + SYNCHRONIZED VOICE.
1. The student sees a standard static teaching visual for this topic (diagram, illustration, board-style visual). Static visuals must be available for every topic; no dynamic storytelling visuals or unrelated animations.
2. Your Explanation MUST reference this visual and be synchronized with it (e.g., "As you can see in the diagram...").
3. All visuals must be directly, strictly, and exclusively related to the selected topic only. No generic, decorative, or off-topic visuals.
4. Do not invent new visual descriptions; assume the standard visual is present. This behavior is consistent across Curriculum and Competitive modes.

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
        const modelToUse = modelOverride ?? (getDoubtResolutionModel() === 'mistral' && getMistralClient() ? 'mistral' : 'llama');
        const responseText = await this.generateResponse(prompt, modelToUse);
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(jsonStr || '{}');
            return {
                explanation: parsed.explanation ?? responseText,
                examples: Array.isArray(parsed.examples) ? parsed.examples : [],
                visualType: parsed.visualType,
                visualPrompt: parsed.visualPrompt,
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

    async generateTeachingContent(
        topic: string,
        curriculumContext?: {
            curriculumType?: string;
            board?: string;
            grade?: string;
            exam?: string;
            subject?: string;
        },
        modelOverride?: ModelType
    ): Promise<{
        title: string;
        sections: { title: string; content: string; visualType?: string; visualPrompt?: string }[];
        summary: string;
    }> {
        let curriculumStr = '';
        if (curriculumContext) {
            const { curriculumType, board, grade, exam, subject } = curriculumContext;
            if (curriculumType === 'school') {
                curriculumStr = `Context: ${grade} student, ${board} Board, Subject: ${subject}`;
            } else if (curriculumType === 'competitive') {
                curriculumStr = `Context: Preparing for ${exam}, Subject: ${subject}`;
            }
        }

        const prompt = `Generate a structured learning lesson for the topic: "${topic}".
${curriculumStr ? `\nCurriculum ${curriculumStr}` : ''}

MANDATORY: EXPLAIN STRICTLY BASED ON SELECTED SUBJECT AND TOPIC.
- No cross-topic, cross-subject, or out-of-syllabus visuals or explanations.
- Do NOT introduce unrelated concepts, examples, or visuals outside the topic scope. All content must be directly, strictly, and exclusively related to the selected subject and topic only.
- Consistent across Curriculum and Competitive modes (mode-specific teaching style only). Static visuals must be available and implemented for every topic and every subject; no dynamic storytelling visuals or unrelated animations.

MANDATORY: STATIC VISUALS + VOICE NARRATION SYNCHRONIZED WITH VISUALS.
1. Use only static visuals: diagrams, illustrations, board-style visuals. Assume the user sees the standard visual for "${topic}".
2. Your content must reference "the visual" or "the diagram" to guide the user. Voice narration must be synchronized with what is shown.
3. Every section must have voice narration synchronized with what is shown.
4. All visuals must be directly, strictly, and exclusively related to the selected topic only. No generic, off-topic, or dynamic storytelling visuals.
5. Do NOT attempt to generate new visual prompts; the system uses preloaded assets only.

Include a title, 3 sections with detailed content, and a final summary.

Respond with only valid JSON:
{
  "title": "...",
  "sections": [
    { 
      "title": "...", 
      "content": "...",
      // Note: visualType/visualPrompt are NOT needed here, the system handles it.
    },
    ...
  ],
  "summary": "..."
}`;

        const modelToUse = modelOverride ?? (getDoubtResolutionModel() === 'mistral' && getMistralClient() ? 'mistral' : 'llama');
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

    /**
     * Generate teaching content from a full client-built prompt (rich curriculum, 45+ min, etc.).
     * Use when the frontend sends a complete prompt; returns parsed JSON as-is so spokenContent/durationMinutes are preserved.
     */
    async generateTeachingContentFromPrompt(
        fullPrompt: string,
        modelOverride?: ModelType
    ): Promise<{
        title: string;
        sections: Array<{ title: string; content: string; spokenContent?: string; durationMinutes?: number; visualType?: string; visualPrompt?: string }>;
        summary: string;
    }> {
        validatePrompt(fullPrompt);
        const modelToUse = modelOverride ?? (getDoubtResolutionModel() === 'mistral' && getMistralClient() ? 'mistral' : 'llama');
        const responseText = await this.generateResponse(fullPrompt, modelToUse);

        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(jsonStr);
            return {
                title: parsed.title ?? 'Lesson',
                sections: Array.isArray(parsed.sections) ? parsed.sections : [],
                summary: typeof parsed.summary === 'string' ? parsed.summary : '',
            };
        } catch (e) {
            console.error('Failed to parse Teaching Content JSON:', e);
            throw new Error('Failed to generate structured teaching content');
        }
    },

    async generateQuiz(
        topic: string,
        context: string,
        curriculumContext?: {
            curriculumType?: string;
            board?: string;
            grade?: string;
            exam?: string;
            subject?: string;
        },
        modelOverride?: ModelType
    ): Promise<{
        questions: { question: string; options: string[]; correctAnswer: number; explanation: string }[];
    }> {
        let curriculumStr = '';
        if (curriculumContext) {
            const { curriculumType, board, grade, exam, subject } = curriculumContext;
            if (curriculumType === 'school') {
                curriculumStr = `Context: ${grade} student, ${board} Board, Subject: ${subject}`;
            } else if (curriculumType === 'competitive') {
                curriculumStr = `Context: Preparing for ${exam}, Subject: ${subject}`;
            }
        }

        const prompt = `Generate a 5-question multiple choice quiz about "${topic}" based on this context: "${context}".
${curriculumStr ? `\nCurriculum ${curriculumStr}` : ''}
Each question should have 4 options and a clear explanation for the correct answer. Match the difficulty to the student's level.

MANDATORY: EXPLAIN STRICTLY BASED ON SELECTED SUBJECT AND TOPIC.
- No cross-topic, cross-subject, or out-of-syllabus content. All questions must be strictly within the topic scope. Do NOT introduce unrelated concepts or examples beyond the selected scope. Consistent across Curriculum and Competitive modes.

MANDATORY: VISUAL-FIRST ASSESSMENT (PRELOADED) — STATIC VISUALS ONLY.
Assume the standard static topic visual (diagram, illustration, board-style) is visible for this topic. No dynamic storytelling or unrelated animations.
Questions should test understanding of the concept shown in standard diagrams/visuals for this topic only. All visuals must be directly and exclusively related to the selected subject and topic.

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

        const modelToUse = modelOverride ?? (getDoubtResolutionModel() === 'mistral' && getMistralClient() ? 'mistral' : 'llama');
        const responseText = await this.generateResponse(prompt, modelToUse, "You are an expert assessment creator.");

        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(jsonStr);
            return {
                questions: Array.isArray(parsed.questions) ? parsed.questions.map((q: any) => ({
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    visualType: q.visualType,
                    visualPrompt: q.visualPrompt,
                })) : [],
            };
        } catch (e) {
            console.error('Failed to parse Quiz JSON:', e);
            throw new Error('Failed to generate structured quiz');
        }
    },
};
