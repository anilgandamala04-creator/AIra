/**
 * AI Integration Service
 * 
 * Unified AI integration layer that ensures all AI-related functionalities
 * work correctly across the entire application. Provides:
 * 
 * - Single point of access for all AI operations (Facade)
 * - Wrappers for Contextual AI operations
 * - Re-exports core Execution logic
 */

import {
  generateChatResponse,
  generateTeachingResponse,
  generateStudyResource,
  type AIResponse,
  type ResourceGenerationOptions,
} from './contextualAI';
import {
  generateAIContent,
  resolveAIDoubt,
  generateAITeachingContent,
  generateAIQuiz,
  getAIStatus,
  isAIAvailable,
  verifyAIConnectivity,
  initializeAI,
  isAIInitialized,
  getPreferredModel,
  FALLBACK_RESPONSES,
  type AIOperationResult,
  type AIStatus
} from './aiExecution';


// ============================================================================
// Types
// ============================================================================

export type { AIOperationResult, AIStatus };

// ============================================================================
// Contextual AI Operations (Wrappers)
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
      usedFallback: false, // contextualAI handles its own fallback internally via aiExecution now? 
      // Actually contextualAI calls aiExecution which has fallback. 
      // If aiExecution uses fallback, result.model will reflect it.
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
// Export all as unified interface
// ============================================================================

export const aiIntegration = {
  // Content generation (Delegated to Execution)
  generateContent: generateAIContent,
  resolveDoubt: resolveAIDoubt,
  generateTeachingContent: generateAITeachingContent,
  generateQuiz: generateAIQuiz,

  // Contextual operations (Wrappers)
  generateChatResponse: generateContextualChatResponse,
  generateTeachingResponse: generateTeachingPanelResponse,
  generateStudyResources,

  // Status and health (Delegated to Execution)
  getStatus: getAIStatus,
  isAvailable: isAIAvailable,
  verifyConnectivity: verifyAIConnectivity,

  // Initialization (Delegated to Execution)
  initialize: initializeAI,
  isInitialized: isAIInitialized,
};

export default aiIntegration;

// Accessors for Execution functions to maintain API compatibility if imported meaningfully
export {
  generateAIContent,
  resolveAIDoubt,
  generateAITeachingContent,
  generateAIQuiz,
  getAIStatus,
  isAIAvailable,
  verifyAIConnectivity,
  initializeAI,
  isAIInitialized
};
