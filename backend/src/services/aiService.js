"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AI_PROMPT_MAX_LENGTH = void 0;
exports.getAvailableModels = getAvailableModels;
const openai_1 = __importDefault(require("openai"));
const mistralai_1 = require("@mistralai/mistralai");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '..', '.env') });
// ---------------------------------------------------------------------------
// Timeouts & validation (real-time AI processing)
// Align with server timeout (REQUEST_TIMEOUT_MS) so long teaching content (2min) is not cut.
// ---------------------------------------------------------------------------
const _parsed = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || process.env.REQUEST_TIMEOUT_MS || '120000', 10);
const AI_REQUEST_TIMEOUT_MS = Math.max(5000, Number.isFinite(_parsed) ? _parsed : 120000);
exports.AI_PROMPT_MAX_LENGTH = 32_000;
const AI_PROMPT_MIN_LENGTH = 1;
function validatePrompt(prompt) {
    const trimmed = typeof prompt === 'string' ? prompt.trim() : '';
    if (trimmed.length < AI_PROMPT_MIN_LENGTH) {
        throw new Error('Prompt cannot be empty');
    }
    if (trimmed.length > exports.AI_PROMPT_MAX_LENGTH) {
        throw new Error(`Prompt exceeds maximum length (${exports.AI_PROMPT_MAX_LENGTH} characters)`);
    }
}
function validateQuestion(question) {
    const trimmed = typeof question === 'string' ? question.trim() : '';
    if (trimmed.length < AI_PROMPT_MIN_LENGTH) {
        throw new Error('Question cannot be empty');
    }
    if (trimmed.length > exports.AI_PROMPT_MAX_LENGTH) {
        throw new Error(`Question exceeds maximum length (${exports.AI_PROMPT_MAX_LENGTH} characters)`);
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
const mistralClient = mistralApiKey
    ? new mistralai_1.Mistral({ apiKey: mistralApiKey })
    : null;
// OpenRouter (https://openrouter.ai) – use when OPENROUTER_API_KEY is set
const openrouterApiKey = process.env.OPENROUTER_API_KEY;
const openrouterBaseUrl = (process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
const openrouterModel = process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-7b-instruct';
const openrouterClient = openrouterApiKey
    ? new openai_1.default({
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
let fallbackOpenAI = null;
if (openrouterClient && (provider === 'openrouter' || provider !== 'ollama')) {
    fallbackOpenAI = openrouterClient;
}
else if (provider === 'ollama') {
    fallbackOpenAI = new openai_1.default({ apiKey: 'ollama', baseURL: ollamaUrl });
}
else if (process.env.OPENAI_API_KEY) {
    fallbackOpenAI = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
}
/** Which model to use for doubt resolution: llama | mistral */
const doubtResolutionModel = (process.env.DOUBT_RESOLUTION_MODEL || 'llama').toLowerCase();
function getAvailableModels() {
    return {
        llama: !!fallbackOpenAI,
        mistral: !!mistralClient,
    };
}
/**
 * Retry helper for asynchronous operations
 */
async function withRetry(operation, maxRetries = 2, initialDelay = 1000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.log(`[AI Service] Retry attempt ${attempt} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            return await operation();
        }
        catch (error) {
            lastError = error;
            console.warn(`[AI Service] Attempt ${attempt + 1} failed:`, error.message || error);
            // Don't retry on auth errors, payment-required, or specific client errors
            if (error.status === 401 || error.status === 402 || error.status === 403 || (error.message && error.message.includes('API key')) || (error.message && error.message.includes('credits'))) {
                throw error;
            }
        }
    }
    throw lastError;
}
async function generateWithLlama(prompt, systemPrompt) {
    const client = fallbackOpenAI;
    if (!client) {
        throw new Error('LLaMA is not configured. Set OPENROUTER_API_KEY.');
    }
    const model = openrouterClient ? openrouterModel : llamaModel;
    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    return await withRetry(async () => {
        const response = await Promise.race([
            client.chat.completions.create({
                model,
                messages,
                max_tokens: 2048,
                temperature: 0.3,
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('LLaMA request timeout')), AI_REQUEST_TIMEOUT_MS)),
        ]);
        const content = response.choices[0]?.message?.content;
        if (content == null)
            throw new Error('Empty LLaMA response');
        return content;
    });
}
async function generateWithMistral(prompt, systemPrompt) {
    if (!mistralClient) {
        throw new Error('Mistral is not configured. Set MISTRAL_API_KEY.');
    }
    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    return await withRetry(async () => {
        const response = await mistralClient.chat.complete({
            model: mistralModel,
            messages,
            maxTokens: 2048,
            temperature: 0.3,
        }, { timeoutMs: AI_REQUEST_TIMEOUT_MS });
        const raw = response.choices?.[0]?.message?.content;
        if (raw == null)
            throw new Error('Empty Mistral response');
        let content;
        if (typeof raw === 'string') {
            content = raw;
        }
        else if (Array.isArray(raw)) {
            content = raw
                .map((chunk) => (chunk?.type === 'text' && typeof chunk.text === 'string' ? chunk.text : ''))
                .join('');
        }
        else {
            content = '';
        }
        if (!content)
            throw new Error('Empty Mistral response');
        return content;
    });
}
exports.aiService = {
    async generateResponse(prompt, modelType = 'llama', systemPrompt) {
        try {
            validatePrompt(prompt);
            if (modelType === 'mistral')
                return await generateWithMistral(prompt, systemPrompt);
            return await generateWithLlama(prompt, systemPrompt);
        }
        catch (error) {
            console.error('AI Generation Error:', error);
            // Preserve original error message if it's informative
            if (error instanceof Error && (error.message.includes('timeout') ||
                error.message.includes('API key') ||
                error.message.includes('rate limit') ||
                error.message.includes('not configured'))) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Failed to generate AI response');
        }
    },
    async resolveDoubt(question, context, curriculumContext, modelOverride) {
        let curriculumStr = '';
        if (curriculumContext) {
            const { curriculumType, board, grade, exam, subject, topic } = curriculumContext;
            if (curriculumType === 'school') {
                curriculumStr = `Context: ${grade} student, ${board} Board, Subject: ${subject}, Topic: ${topic || 'General'}`;
            }
            else if (curriculumType === 'competitive') {
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
        const modelToUse = modelOverride ?? (doubtResolutionModel === 'mistral' && mistralClient ? 'mistral' : 'llama');
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
        }
        catch (e) {
            console.error('Failed to parse AI JSON response:', e);
            return {
                explanation: responseText,
                examples: [],
                quizQuestion: null,
            };
        }
    },
    async generateTeachingContent(topic, curriculumContext, modelOverride) {
        let curriculumStr = '';
        if (curriculumContext) {
            const { curriculumType, board, grade, exam, subject } = curriculumContext;
            if (curriculumType === 'school') {
                curriculumStr = `Context: ${grade} student, ${board} Board, Subject: ${subject}`;
            }
            else if (curriculumType === 'competitive') {
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
        }
        catch (e) {
            console.error('Failed to parse Teaching Content JSON:', e);
            throw new Error('Failed to generate structured teaching content');
        }
    },
    /**
     * Generate teaching content from a full client-built prompt (rich curriculum, 45+ min, etc.).
     * Use when the frontend sends a complete prompt; returns parsed JSON as-is so spokenContent/durationMinutes are preserved.
     */
    async generateTeachingContentFromPrompt(fullPrompt, modelOverride) {
        validatePrompt(fullPrompt);
        const modelToUse = modelOverride ?? (doubtResolutionModel === 'mistral' && mistralClient ? 'mistral' : 'llama');
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
        }
        catch (e) {
            console.error('Failed to parse Teaching Content JSON:', e);
            throw new Error('Failed to generate structured teaching content');
        }
    },
    async generateQuiz(topic, context, curriculumContext, modelOverride) {
        let curriculumStr = '';
        if (curriculumContext) {
            const { curriculumType, board, grade, exam, subject } = curriculumContext;
            if (curriculumType === 'school') {
                curriculumStr = `Context: ${grade} student, ${board} Board, Subject: ${subject}`;
            }
            else if (curriculumType === 'competitive') {
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
        const modelToUse = modelOverride ?? (doubtResolutionModel === 'mistral' && mistralClient ? 'mistral' : 'llama');
        const responseText = await this.generateResponse(prompt, modelToUse, "You are an expert assessment creator.");
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(jsonStr);
            return {
                questions: Array.isArray(parsed.questions) ? parsed.questions.map((q) => ({
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    visualType: q.visualType,
                    visualPrompt: q.visualPrompt,
                })) : [],
            };
        }
        catch (e) {
            console.error('Failed to parse Quiz JSON:', e);
            throw new Error('Failed to generate structured quiz');
        }
    },
};
//# sourceMappingURL=aiService.js.map