/**
 * AI Hooks
 * 
 * React hooks for AI functionality across the application:
 * - AI health status monitoring
 * - Model selection and availability
 * - Feature-specific AI operations
 * - Error handling and retry logic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../stores/settingsStore';
import {
  checkAIHealth,
  quickHealthCheck,
  subscribeToHealthUpdates,
  startHealthMonitoring,
  stopHealthMonitoring,
  withRetry,
  getFallbackModel,
  type AIHealthStatus,
} from '../services/aiHealthCheck';
import {
  generateContent,
  resolveDoubt,
  generateTeachingContent,
  generateQuiz,
  type AiModelType,
} from '../services/aiApi';

// ============================================================================
// Types
// ============================================================================

interface AIState {
  isAvailable: boolean;
  isLoading: boolean;
  currentModel: AiModelType;
  modelsAvailable: {
    llama: boolean;
    mistral: boolean;
  };
  error: string | null;
}

interface UseAIOptions {
  autoRetry?: boolean;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

// ============================================================================
// AI Health Hook
// ============================================================================

/**
 * Hook to monitor AI health status
 */
export function useAIHealth() {
  const [health, setHealth] = useState<AIHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Start monitoring on mount
  useEffect(() => {
    startHealthMonitoring(60000); // Check every minute

    const unsubscribe = subscribeToHealthUpdates((status) => {
      setHealth(status);
    });

    return () => {
      unsubscribe();
      stopHealthMonitoring(); // Clean up health monitoring interval
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setIsChecking(true);
    try {
      const status = await checkAIHealth();
      setHealth(status);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    health,
    isHealthy: health?.isHealthy ?? false,
    isChecking,
    backendConnected: health?.backendConnected ?? false,
    modelsAvailable: health?.modelsAvailable ?? { llama: false, mistral: false },
    latency: health?.latencyMs ?? 0,
    errors: health?.errors ?? [],
    refresh,
  };
}

// ============================================================================
// AI Availability Hook
// ============================================================================

/**
 * Hook to check if AI is available (quick check)
 */
export function useAIAvailability() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      setIsChecking(true);
      const available = await quickHealthCheck();
      if (mounted) {
        setIsAvailable(available);
        setIsChecking(false);
      }
    };

    check();

    // Re-check periodically
    const interval = setInterval(check, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    isAvailable: isAvailable ?? false,
    isChecking,
    isUnknown: isAvailable === null,
  };
}

// ============================================================================
// AI Model Selection Hook
// ============================================================================

/**
 * Hook for AI model selection with fallback
 */
export function useAIModel() {
  const settings = useSettingsStore(useShallow((s) => s.settings));
  const updateAiTutor = useSettingsStore((s) => s.updateAiTutor);

  const preferredModel = settings.aiTutor?.preferredAiModel ?? 'llama';

  const setModel = useCallback((model: AiModelType) => {
    updateAiTutor({ preferredAiModel: model });
  }, [updateAiTutor]);

  return {
    currentModel: preferredModel,
    setModel,
  };
}

// ============================================================================
// AI Operations Hook
// ============================================================================

/**
 * Generic hook for AI operations with retry and error handling
 */
export function useAIOperation<T>(
  operation: (model: AiModelType) => Promise<T>,
  options: UseAIOptions = {}
) {
  const { autoRetry = true, maxRetries = 3, onError } = options;
  
  const [result, setResult] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { currentModel } = useAIModel();
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (overrideModel?: AiModelType): Promise<T | null> => {
    // Cancel any pending operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const model = overrideModel ?? currentModel;

    try {
      let response: T;

      if (autoRetry) {
        response = await withRetry(
          () => operation(model),
          maxRetries
        );
      } else {
        response = await operation(model);
      }

      setResult(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('AI operation failed');
      setError(error);
      onError?.(error);

      // Try fallback model if primary fails
      if (autoRetry) {
        const fallback = getFallbackModel(model);
        try {
          const fallbackResponse = await operation(fallback);
          setResult(fallbackResponse);
          return fallbackResponse;
        } catch {
          // Fallback also failed, return original error
        }
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [operation, currentModel, autoRetry, maxRetries, onError]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    result,
    isLoading,
    error,
    execute,
    reset,
  };
}

// ============================================================================
// Specific AI Feature Hooks
// ============================================================================

/**
 * Hook for doubt resolution
 */
export function useDoubtResolution() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resolve = useCallback(async (question: string, context: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const model: AiModelType = useSettingsStore.getState().settings.aiTutor?.preferredAiModel ?? 'llama';
      return await resolveDoubt(question, context, model);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to resolve doubt');
      setError(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    resolve,
    reset,
  };
}

/**
 * Hook for content generation
 */
export function useContentGeneration() {
  const [result, setResult] = useState<{ content: string; model: AiModelType } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateText = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    const model: AiModelType = useSettingsStore.getState().settings.aiTutor?.preferredAiModel ?? 'llama';
    
    try {
      const response = await withRetry(() => generateContent(prompt, model));
      setResult(response);
      return response;
    } catch {
      // Try fallback
      try {
        const fallback = getFallbackModel(model);
        const response = await generateContent(prompt, fallback);
        setResult(response);
        return response;
      } catch (fallbackErr) {
        const e = fallbackErr instanceof Error ? fallbackErr : new Error('Failed to generate content');
        setError(e);
        throw e;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    generate: generateText,
    reset,
  };
}

/**
 * Hook for teaching content generation
 */
export function useTeachingContentGeneration() {
  const [content, setContent] = useState<{
    title: string;
    sections: { title: string; content: string }[];
    summary: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);

    const model: AiModelType = useSettingsStore.getState().settings.aiTutor?.preferredAiModel ?? 'llama';

    try {
      const result = await withRetry(() => generateTeachingContent(topic, model));
      setContent(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate teaching content');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    content,
    isLoading,
    error,
    generate,
    reset: () => {
      setContent(null);
      setError(null);
    },
  };
}

/**
 * Hook for quiz generation
 */
export function useQuizGeneration() {
  const [quiz, setQuiz] = useState<{
    questions: { question: string; options: string[]; correctAnswer: number; explanation: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (topic: string, context: string = '') => {
    setIsLoading(true);
    setError(null);

    const model: AiModelType = useSettingsStore.getState().settings.aiTutor?.preferredAiModel ?? 'llama';

    try {
      const result = await withRetry(() => generateQuiz(topic, context, model));
      setQuiz(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate quiz');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    quiz,
    isLoading,
    error,
    generate,
    reset: () => {
      setQuiz(null);
      setError(null);
    },
  };
}

// ============================================================================
// Combined AI Status Hook
// ============================================================================

/**
 * Combined hook for overall AI state
 */
export function useAI(): AIState & {
  refresh: () => Promise<void>;
  setModel: (model: AiModelType) => void;
} {
  const { health, isChecking, refresh } = useAIHealth();
  const { currentModel, setModel } = useAIModel();

  return {
    isAvailable: health?.isHealthy ?? false,
    isLoading: isChecking,
    currentModel,
    modelsAvailable: health?.modelsAvailable ?? { llama: false, mistral: false },
    error: health?.errors?.[0] ?? null,
    refresh,
    setModel,
  };
}

// All hooks are exported inline with their declarations above
