/**
 * AI Integration Service
 * 
 * Unified AI integration layer that ensures all AI-related functionalities
 * work correctly across the entire application. Provides:
 * 
 * - Single point of access for all AI operations
 * - Automatic fallbacks when primary model fails
 * - Graceful degradation to mock data when backend is unavailable
 * - Consistent error handling across all AI features
 * - Real-time health monitoring
 */

import { 
  generateContent, 
  resolveDoubt, 
  generateTeachingContent, 
  generateQuiz,
  getAvailableModels,
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
import { 
  generateChatResponse, 
  generateTeachingResponse,
  generateStudyResource,
  type AIResponse,
  type ResourceGenerationOptions,
} from './contextualAI';
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

// ============================================================================
// Offline Fallback Data
// ============================================================================

const FALLBACK_RESPONSES = {
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
// Core AI Operations with Fallback
// ============================================================================

/**
 * Get the current preferred AI model from settings
 */
function getPreferredModel(): AiModelType {
  return useSettingsStore.getState().settings.aiTutor?.preferredAiModel ?? 'llama';
}

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
  options?: { model?: AiModelType; retries?: number }
): Promise<AIOperationResult<DoubtResolution>> {
  const startTime = Date.now();
  const model = options?.model ?? getPreferredModel();
  const maxRetries = options?.retries ?? 3;
  
  try {
    const result = await withRetry(
      () => resolveDoubt(question, context, model),
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
    // Try fallback model
    const fallbackModel = getFallbackModel(model);
    try {
      const result = await resolveDoubt(question, context, fallbackModel);
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
 * Generate teaching content with automatic retry and fallback
 */
export async function generateAITeachingContent(
  topic: string,
  options?: { model?: AiModelType; retries?: number }
): Promise<AIOperationResult<{ title: string; sections: { title: string; content: string }[]; summary: string }>> {
  const startTime = Date.now();
  const model = options?.model ?? getPreferredModel();
  const maxRetries = options?.retries ?? 3;
  
  try {
    const result = await withRetry(
      () => generateTeachingContent(topic, model),
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
    // Try fallback model
    const fallbackModel = getFallbackModel(model);
    try {
      const result = await generateTeachingContent(topic, fallbackModel);
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
        data: { ...FALLBACK_RESPONSES.teaching, title: topic },
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
      () => generateQuiz(topic, context, model),
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
    // Try fallback model
    const fallbackModel = getFallbackModel(model);
    try {
      const result = await generateQuiz(topic, context, fallbackModel);
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
// Contextual AI Operations
// ============================================================================

/**
 * Generate a contextual chat response
 */
export async function generateContextualChatResponse(
  message: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>
): Promise<AIOperationResult<AIResponse>> {
  const startTime = Date.now();
  const model = getPreferredModel();
  
  try {
    const result = await generateChatResponse(message, conversationHistory);
    
    return {
      success: true,
      data: result,
      usedFallback: false,
      model: result.model,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chat response failed',
      data: {
        content: FALLBACK_RESPONSES.chat,
        model,
        contextUsed: false,
        responseType: 'general',
      },
      usedFallback: true,
      model,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Generate a teaching panel response for doubts
 */
export async function generateTeachingPanelResponse(
  question: string,
  topicName: string,
  stepTitle: string,
  stepContent: string
): Promise<AIOperationResult<AIResponse>> {
  const startTime = Date.now();
  const model = getPreferredModel();
  
  try {
    const result = await generateTeachingResponse(question, topicName, stepTitle, stepContent);
    
    return {
      success: true,
      data: result,
      usedFallback: false,
      model: result.model,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Teaching response failed',
      data: {
        content: FALLBACK_RESPONSES.doubt.explanation,
        model,
        contextUsed: true,
        responseType: 'topic-specific',
      },
      usedFallback: true,
      model,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Generate study resources (notes, mind maps, flashcards, etc.)
 */
export async function generateStudyResources(
  options: ResourceGenerationOptions
): Promise<AIOperationResult<string>> {
  const startTime = Date.now();
  const model = getPreferredModel();
  
  try {
    const result = await generateStudyResource(options);
    
    return {
      success: true,
      data: result,
      usedFallback: false,
      model,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Resource generation failed',
      data: `Unable to generate ${options.type} at this time. Please try again.`,
      usedFallback: true,
      model,
      latencyMs: Date.now() - startTime,
    };
  }
}

// ============================================================================
// Status and Health
// ============================================================================

/**
 * Get current AI status
 */
export async function getAIStatus(): Promise<AIStatus> {
  const preferredModel = getPreferredModel();
  
  try {
    const health = await checkAIHealth();
    const models = await getAvailableModels();
    
    return {
      isOnline: health.isHealthy,
      preferredModel,
      availableModels: models,
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
    if (!status.isOnline && process.env.NODE_ENV === 'development') {
      console.warn('[AI Integration] Backend not available, using fallback mode');
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

// ============================================================================
// Export all as unified interface
// ============================================================================

export const aiIntegration = {
  // Content generation
  generateContent: generateAIContent,
  resolveDoubt: resolveAIDoubt,
  generateTeachingContent: generateAITeachingContent,
  generateQuiz: generateAIQuiz,
  
  // Contextual operations
  generateChatResponse: generateContextualChatResponse,
  generateTeachingResponse: generateTeachingPanelResponse,
  generateStudyResources,
  
  // Status and health
  getStatus: getAIStatus,
  isAvailable: isAIAvailable,
  verifyConnectivity: verifyAIConnectivity,
  
  // Initialization
  initialize: initializeAI,
  isInitialized: isAIInitialized,
};

export default aiIntegration;
