/**
 * AI Health Check Service
 * 
 * Ensures all AI-related functionalities are working correctly:
 * - Backend connectivity
 * - Model availability
 * - API response validation
 * - Error handling and recovery
 */

import { getAvailableModels, getBaseUrl } from './aiApi';

// ============================================================================
// Types
// ============================================================================

export interface AIHealthStatus {
  isHealthy: boolean;
  backendConnected: boolean;
  modelsAvailable: {
    llama: boolean;
    mistral: boolean;
  };
  latencyMs: number;
  lastChecked: string;
  errors: string[];
  limits: {
    maxPromptLength: number;
  };
}

export interface AIFeatureStatus {
  feature: string;
  enabled: boolean;
  working: boolean;
  lastError?: string;
}

export type AIFeature = 
  | 'doubt_resolution'
  | 'content_generation'
  | 'teaching_content'
  | 'quiz_generation'
  | 'notes_generation'
  | 'mind_map_generation'
  | 'flashcard_generation';

// ============================================================================
// Health Check Functions
// ============================================================================

/**
 * Perform a comprehensive health check of the AI backend
 */
export async function checkAIHealth(): Promise<AIHealthStatus> {
  const startTime = Date.now();
  const errors: string[] = [];
  let backendConnected = false;
  let modelsAvailable = { llama: false, mistral: false };
  let maxPromptLength = 32000;

  try {
    const baseUrl = getBaseUrl();
    console.log(`[AI Health Check] Checking backend at: ${baseUrl}/health`);
    
    // Check backend connectivity with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for health check
    
    try {
      const healthResponse = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        cache: 'no-cache', // Prevent caching
      });

      clearTimeout(timeoutId);

      if (healthResponse.ok) {
        backendConnected = true;
        const data = await healthResponse.json();
        console.log(`[AI Health Check] Backend connected. Models: LLaMA=${data.models?.llama}, Mistral=${data.models?.mistral}`);
        modelsAvailable = {
          llama: data.models?.llama ?? false,
          mistral: data.models?.mistral ?? false,
        };
        maxPromptLength = data.limits?.maxPromptLength ?? 32000;
      } else {
        const errorMsg = `Backend returned status ${healthResponse.status}`;
        console.error(`[AI Health Check] ${errorMsg}`);
        errors.push(errorMsg);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        const errorMsg = 'Health check timeout: Backend did not respond within 10 seconds';
        console.error(`[AI Health Check] ${errorMsg}`);
        errors.push(errorMsg);
      } else {
        console.error(`[AI Health Check] Fetch error:`, fetchError);
        throw fetchError;
      }
    }
  } catch (error) {
    const errorMsg = `Backend connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`[AI Health Check] ${errorMsg}`, error);
    errors.push(errorMsg);
  }

  // Also try client-side model check as backup
  if (!backendConnected) {
    try {
      const clientModels = await getAvailableModels();
      modelsAvailable = clientModels;
    } catch {
      // Ignore - already handled above
    }
  }

  const latencyMs = Date.now() - startTime;
  const isHealthy = backendConnected && (modelsAvailable.llama || modelsAvailable.mistral);

  return {
    isHealthy,
    backendConnected,
    modelsAvailable,
    latencyMs,
    lastChecked: new Date().toISOString(),
    errors,
    limits: {
      maxPromptLength,
    },
  };
}

/**
 * Quick connectivity check (fast, no model test)
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const baseUrl = getBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  } catch {
    return false;
  }
}

// ============================================================================
// Timeout signal (AbortSignal.timeout not in older browsers)
// ============================================================================

function createTimeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal && typeof (AbortSignal as { timeout?: (ms: number) => AbortSignal }).timeout === 'function') {
    return (AbortSignal as { timeout: (ms: number) => AbortSignal }).timeout(ms);
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  const signal = controller.signal;
  (signal as { _clear?: () => void })._clear = () => clearTimeout(t);
  return signal;
}

// ============================================================================
// Feature Status Checks
// ============================================================================

/**
 * Check if a specific AI feature is working
 */
export async function checkFeatureStatus(feature: AIFeature): Promise<AIFeatureStatus> {
  const baseUrl = getBaseUrl();
  let working = false;
  let lastError: string | undefined;
  const FEATURE_TIMEOUT_MS = 30000;

  try {
    switch (feature) {
      case 'doubt_resolution': {
        // Test with minimal request
        const doubtResponse = await fetch(`${baseUrl}/api/resolve-doubt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: 'What is 2+2?',
            context: 'Basic arithmetic',
            model: 'llama',
          }),
          signal: createTimeoutSignal(FEATURE_TIMEOUT_MS),
        });
        working = doubtResponse.ok;
        if (!working) {
          const error = await doubtResponse.json().catch(() => ({}));
          lastError = (error as { error?: string }).error || `Status ${doubtResponse.status}`;
        }
        break;
      }

      case 'content_generation': {
        const contentResponse = await fetch(`${baseUrl}/api/generate-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Say hello in one word.',
            model: 'llama',
          }),
          signal: createTimeoutSignal(FEATURE_TIMEOUT_MS),
        });
        working = contentResponse.ok;
        if (!working) {
          const error = await contentResponse.json().catch(() => ({}));
          lastError = (error as { error?: string }).error || `Status ${contentResponse.status}`;
        }
        break;
      }

      case 'teaching_content': {
        const teachingResponse = await fetch(`${baseUrl}/api/generate-teaching-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: 'Addition',
            model: 'llama',
          }),
          signal: createTimeoutSignal(FEATURE_TIMEOUT_MS),
        });
        working = teachingResponse.ok;
        if (!working) {
          const error = await teachingResponse.json().catch(() => ({}));
          lastError = (error as { error?: string }).error || `Status ${teachingResponse.status}`;
        }
        break;
      }

      case 'quiz_generation': {
        const quizResponse = await fetch(`${baseUrl}/api/generate-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: 'Numbers',
            context: 'Basic math',
            model: 'llama',
          }),
          signal: createTimeoutSignal(FEATURE_TIMEOUT_MS),
        });
        working = quizResponse.ok;
        if (!working) {
          const error = await quizResponse.json().catch(() => ({}));
          lastError = (error as { error?: string }).error || `Status ${quizResponse.status}`;
        }
        break;
      }

      // Frontend-only features (always enabled if backend is available)
      case 'notes_generation':
      case 'mind_map_generation':
      case 'flashcard_generation': {
        const backendOk = await quickHealthCheck();
        working = backendOk;
        if (!working) {
          lastError = 'Backend not available';
        }
        break;
      }
    }
  } catch (error) {
    lastError = error instanceof Error ? error.message : 'Unknown error';
  }

  return {
    feature,
    enabled: true, // All features are enabled by default
    working,
    lastError,
  };
}

/**
 * Check all AI features at once
 */
export async function checkAllFeatures(): Promise<AIFeatureStatus[]> {
  const features: AIFeature[] = [
    'doubt_resolution',
    'content_generation',
    'teaching_content',
    'quiz_generation',
    'notes_generation',
    'mind_map_generation',
    'flashcard_generation',
  ];

  // Run all checks in parallel
  const results = await Promise.all(
    features.map((feature) => checkFeatureStatus(feature))
  );

  return results;
}

// ============================================================================
// Retry and Recovery
// ============================================================================

/**
 * Retry an AI operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on validation errors
      if (lastError.message.includes('cannot be empty') ||
          lastError.message.includes('exceeds maximum length')) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Switch to fallback model if primary fails
 */
export function getFallbackModel(primaryModel: 'llama' | 'mistral'): 'llama' | 'mistral' {
  return primaryModel === 'llama' ? 'mistral' : 'llama';
}

// ============================================================================
// Connection Monitoring
// ============================================================================

let healthCheckInterval: ReturnType<typeof setInterval> | null = null;
let lastHealthStatus: AIHealthStatus | null = null;
const healthListeners: Set<(status: AIHealthStatus) => void> = new Set();

/**
 * Start periodic health checks
 */
export function startHealthMonitoring(intervalMs: number = 60000): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  // Initial check
  checkAIHealth().then((status) => {
    lastHealthStatus = status;
    notifyListeners(status);
  });

  // Periodic checks
  healthCheckInterval = setInterval(async () => {
    const status = await checkAIHealth();
    lastHealthStatus = status;
    notifyListeners(status);
  }, intervalMs);
}

/**
 * Stop health monitoring
 */
export function stopHealthMonitoring(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

/**
 * Subscribe to health status updates
 */
export function subscribeToHealthUpdates(
  listener: (status: AIHealthStatus) => void
): () => void {
  healthListeners.add(listener);
  
  // Send current status immediately if available
  if (lastHealthStatus) {
    listener(lastHealthStatus);
  }

  return () => {
    healthListeners.delete(listener);
  };
}

/**
 * Get last known health status
 */
export function getLastHealthStatus(): AIHealthStatus | null {
  return lastHealthStatus;
}

function notifyListeners(status: AIHealthStatus): void {
  healthListeners.forEach((listener) => {
    try {
      listener(status);
    } catch (error) {
      console.error('Health listener error:', error);
    }
  });
}

// ============================================================================
// Export
// ============================================================================

export const aiHealthCheck = {
  checkAIHealth,
  quickHealthCheck,
  checkFeatureStatus,
  checkAllFeatures,
  withRetry,
  getFallbackModel,
  startHealthMonitoring,
  stopHealthMonitoring,
  subscribeToHealthUpdates,
  getLastHealthStatus,
};

export default aiHealthCheck;
