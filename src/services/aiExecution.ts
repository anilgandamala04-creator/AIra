/**
 * AI Execution Service
 * 
 * distinct implementation of core AI operations with:
 * - Automatic retry logic
 * - Model fallback (Llama -> Mistral)
 * - Error handling and Toast notifications
 * - Offline fallback responses
 * 
 * This service sits BELOW ContextualAI and AIIntegration to avoid circular dependencies.
 */

import {
    generateContent,
    resolveDoubt,
    generateTeachingContent,
    generateQuiz,
    type AiModelType,
    type DoubtResolution,
} from './aiApi';
import {
    checkAIHealth,
    quickHealthCheck,
    withRetry,
    getFallbackModel,
    type AIHealthStatus,
} from './aiHealthCheck';
import { useSettingsStore } from '../stores/settingsStore';

// ============================================================================
// Types
// ============================================================================

export interface AIOperationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    usedFallback: boolean;
    model: AiModelType;
    latencyMs: number;
}

export interface AIStatus {
    isOnline: boolean;
    preferredModel: AiModelType;
    availableModels: { llama: boolean; mistral: boolean };
    lastHealthCheck: AIHealthStatus | null;
}

export const FALLBACK_RESPONSES = {
    chat: "I'm currently unable to connect to the AI service. Please check your internet connection and try again. In the meantime, you can continue reviewing the lesson content.",

    doubt: {
        explanation: "I'm temporarily unable to process your question. Please try again in a moment, or review the lesson content for answers.",
        examples: [],
        quizQuestion: null,
    },

    teaching: {
        title: "Lesson Content",
        sections: [
            { title: "Overview", content: "Content is being loaded..." },
        ],
        summary: "Please wait while content is being generated.",
    },

    quiz: {
        questions: [
            {
                question: "Quiz temporarily unavailable. Please try again.",
                options: ["Try again later", "Refresh the page", "Check connection", "Contact support"],
                correctAnswer: 0,
                explanation: "The AI service is temporarily unavailable.",
            },
        ],
    },
};

// ============================================================================
// Helpers
// ============================================================================

function showRateLimitToast(error: unknown): void {
    const e = error as Error & { status?: number; retryAfterSeconds?: number };
    if (e?.status !== 429) return;
    const minutes = Math.ceil((e.retryAfterSeconds ?? 60) / 60);
    import('../stores/toastStore').then(({ toast }) => {
        toast.warning(
            `Too many requests. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
            10000
        );
    });
}

function showServiceUnavailableToast(error: unknown): void {
    const e = error as Error & { status?: number; retryAfterSeconds?: number };
    if (e?.status !== 503) return;
    const seconds = e.retryAfterSeconds ?? 60;
    const msg = seconds > 0
        ? `Service busy. Please try again in ${seconds} second${seconds !== 1 ? 's' : ''}.`
        : 'Service busy. Please try again in a moment.';
    import('../stores/toastStore').then(({ toast }) => {
        toast.warning(msg, 10000);
    });
}

/**
 * Get the current preferred AI model from settings
 */
export function getPreferredModel(): AiModelType {
    return useSettingsStore.getState().settings.aiTutor?.preferredAiModel ?? 'llama';
}

// ============================================================================
// Core AI Operations with Fallback
// ============================================================================

/**
 * Generate content with automatic retry and fallback
 */
export async function generateAIContent(
    prompt: string,
    options?: { model?: AiModelType; retries?: number }
): Promise<AIOperationResult<{ content: string }>> {
    const startTime = Date.now();
    const model = options?.model ?? getPreferredModel();
    const maxRetries = options?.retries ?? 3;

    try {
        // Try primary model with retry
        const result = await withRetry(
            () => generateContent(prompt, model),
            maxRetries
        );

        return {
            success: true,
            data: { content: result.content },
            usedFallback: false,
            model: result.model,
            latencyMs: Date.now() - startTime,
        };
    } catch (primaryError) {
        showRateLimitToast(primaryError);
        showServiceUnavailableToast(primaryError);
        // Try fallback model
        const fallbackModel = getFallbackModel(model);
        try {
            const result = await generateContent(prompt, fallbackModel);
            return {
                success: true,
                data: { content: result.content },
                usedFallback: true,
                model: result.model,
                latencyMs: Date.now() - startTime,
            };
        } catch {
            return {
                success: false,
                error: primaryError instanceof Error ? primaryError.message : 'AI request failed',
                data: { content: FALLBACK_RESPONSES.chat },
                usedFallback: true,
                model,
                latencyMs: Date.now() - startTime,
            };
        }
    }
}

/**
 * Resolve a doubt with automatic retry and fallback
 */
export async function resolveAIDoubt(
    question: string,
    context: string,
    options?: {
        model?: AiModelType;
        retries?: number;
        curriculumContext?: {
            curriculumType?: string;
            board?: string;
            grade?: string;
            exam?: string;
            subject?: string;
            topic?: string;
        };
    }
): Promise<AIOperationResult<DoubtResolution>> {
    const startTime = Date.now();
    const model = options?.model ?? getPreferredModel();
    const maxRetries = options?.retries ?? 3;
    const curriculumContext = options?.curriculumContext;

    try {
        const result = await withRetry(
            () => resolveDoubt(question, context, curriculumContext, model),
            maxRetries
        );

        return {
            success: true,
            data: result,
            usedFallback: false,
            model,
            latencyMs: Date.now() - startTime,
        };
    } catch (primaryError) {
        showRateLimitToast(primaryError);
        showServiceUnavailableToast(primaryError);
        // Try fallback model
        const fallbackModel = getFallbackModel(model);
        try {
            const result = await resolveDoubt(question, context, curriculumContext, fallbackModel);
            return {
                success: true,
                data: result,
                usedFallback: true,
                model: fallbackModel,
                latencyMs: Date.now() - startTime,
            };
        } catch {
            return {
                success: false,
                error: primaryError instanceof Error ? primaryError.message : 'Doubt resolution failed',
                data: FALLBACK_RESPONSES.doubt as DoubtResolution,
                usedFallback: true,
                model,
                latencyMs: Date.now() - startTime,
            };
        }
    }
}

/**
 * Generate teaching content with automatic retry and fallback.
 * Supports both simple topic (string) and full curriculum prompt (long string >500 chars).
 */
export async function generateAITeachingContent(
    topicOrPrompt: string,
    options?: {
        model?: AiModelType;
        retries?: number;
        curriculumContext?: {
            curriculumType?: string;
            board?: string;
            grade?: string;
            exam?: string;
            subject?: string;
        };
    }
): Promise<AIOperationResult<{ title: string; sections: { title: string; content: string }[]; summary: string }>> {
    const startTime = Date.now();
    const model = options?.model ?? getPreferredModel();
    const maxRetries = options?.retries ?? 3;
    const curriculumContext = options?.curriculumContext;
    const topicForFallback = topicOrPrompt.length > 80 ? topicOrPrompt.slice(0, 80) + '...' : topicOrPrompt;

    try {
        const result = await withRetry(
            () => generateTeachingContent(topicOrPrompt, curriculumContext, model),
            maxRetries
        );

        return {
            success: true,
            data: result,
            usedFallback: false,
            model,
            latencyMs: Date.now() - startTime,
        };
    } catch (primaryError) {
        showRateLimitToast(primaryError);
        showServiceUnavailableToast(primaryError);
        const fallbackModel = getFallbackModel(model);
        try {
            const result = await generateTeachingContent(topicOrPrompt, curriculumContext, fallbackModel);
            return {
                success: true,
                data: result,
                usedFallback: true,
                model: fallbackModel,
                latencyMs: Date.now() - startTime,
            };
        } catch {
            return {
                success: false,
                error: primaryError instanceof Error ? primaryError.message : 'Teaching content generation failed',
                data: { ...FALLBACK_RESPONSES.teaching, title: topicForFallback },
                usedFallback: true,
                model,
                latencyMs: Date.now() - startTime,
            };
        }
    }
}

/**
 * Generate quiz with automatic retry and fallback
 */
export async function generateAIQuiz(
    topic: string,
    context: string,
    options?: { model?: AiModelType; retries?: number }
): Promise<AIOperationResult<{ questions: { question: string; options: string[]; correctAnswer: number; explanation: string }[] }>> {
    const startTime = Date.now();
    const model = options?.model ?? getPreferredModel();
    const maxRetries = options?.retries ?? 3;

    try {
        const result = await withRetry(
            () => generateQuiz(topic, context, undefined, model),
            maxRetries
        );

        return {
            success: true,
            data: result,
            usedFallback: false,
            model,
            latencyMs: Date.now() - startTime,
        };
    } catch (primaryError) {
        showRateLimitToast(primaryError);
        showServiceUnavailableToast(primaryError);
        // Try fallback model
        const fallbackModel = getFallbackModel(model);
        try {
            const result = await generateQuiz(topic, context, undefined, fallbackModel);
            return {
                success: true,
                data: result,
                usedFallback: true,
                model: fallbackModel,
                latencyMs: Date.now() - startTime,
            };
        } catch {
            return {
                success: false,
                error: primaryError instanceof Error ? primaryError.message : 'Quiz generation failed',
                data: FALLBACK_RESPONSES.quiz,
                usedFallback: true,
                model,
                latencyMs: Date.now() - startTime,
            };
        }
    }
}

// ============================================================================
// Status and Health
// ============================================================================

/**
 * Get current AI status (single health check to avoid duplicate requests)
 */
export async function getAIStatus(): Promise<AIStatus> {
    const preferredModel = getPreferredModel();

    try {
        const health = await checkAIHealth();
        return {
            isOnline: health.isHealthy,
            preferredModel,
            availableModels: health.modelsAvailable,
            lastHealthCheck: health,
        };
    } catch {
        return {
            isOnline: false,
            preferredModel,
            availableModels: { llama: false, mistral: false },
            lastHealthCheck: null,
        };
    }
}

/**
 * Quick check if AI is available
 */
export async function isAIAvailable(): Promise<boolean> {
    return quickHealthCheck();
}

/**
 * Verify AI connectivity and return detailed status
 */
export async function verifyAIConnectivity(): Promise<{
    connected: boolean;
    models: { llama: boolean; mistral: boolean };
    latencyMs: number;
    error?: string;
}> {
    const startTime = Date.now();

    try {
        const health = await checkAIHealth();
        return {
            connected: health.backendConnected,
            models: health.modelsAvailable,
            latencyMs: health.latencyMs,
            error: health.errors.length > 0 ? health.errors[0] : undefined,
        };
    } catch (error) {
        return {
            connected: false,
            models: { llama: false, mistral: false },
            latencyMs: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Connection verification failed',
        };
    }
}

// ============================================================================
// Initialization
// ============================================================================

let isInitialized = false;
let initializationPromise: Promise<AIStatus> | null = null;

/**
 * Initialize AI integration (called once at app startup)
 */
export async function initializeAI(): Promise<AIStatus> {
    if (isInitialized) {
        return getAIStatus();
    }

    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        // Initialize AI integration
        const status = await getAIStatus();
        if (!status.isOnline && import.meta.env.DEV) {
            console.warn('[AI Execution] Backend not available, using fallback mode');
        }

        isInitialized = true;
        initializationPromise = null;

        return status;
    })();

    return initializationPromise;
}

/**
 * Check if AI integration is initialized
 */
export function isAIInitialized(): boolean {
    return isInitialized;
}
