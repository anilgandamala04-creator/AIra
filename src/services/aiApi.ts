/**
 * Frontend API client for AI backend (LLaMA / Mistral).
 * Base URL from VITE_API_URL; model from caller or settings.
 * Inputs validated before hitting model; failures throw (no silent failure).
 */

import { AI_PROMPT_MAX_LENGTH, AI_PROMPT_MIN_LENGTH } from '../constants/featureContracts';

export type AiModelType = 'llama' | 'mistral';

/**
 * Get the backend API base URL.
 * - VITE_API_URL: explicit override (e.g. local Express or production API URL).
 * - Local dev: use http://localhost:5000 so the app reliably reaches the Express backend (avoids proxy/CORS issues).
 * - Production (Firebase Hosting): same origin; Hosting rewrites /api/** and /health to Cloud Functions.
 */
const getBaseUrl = (): string => {
  try {
    const meta = import.meta as unknown as { env?: { VITE_API_URL?: string; DEV?: boolean } };
    const url = meta.env?.VITE_API_URL;
    if (url && typeof url === 'string' && url.trim()) {
      return url.trim().replace(/\/$/, '');
    }
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.');
      // Development: hit Express backend directly so AI works when backend runs on port 5000
      if (meta.env?.DEV && isLocal) {
        return `http://${hostname}:5000`;
      }
      // Production (e.g. Firebase Hosting): same origin; rewrites send /api and /health to Cloud Functions
      if (!isLocal) return '';
      return `http://${hostname}:5000`;
    }
  } catch {
    // ignore
  }
  return 'http://localhost:5000';
};

let baseUrlLogged = false;
function logBaseUrlOnce(): void {
  if (baseUrlLogged || typeof window === 'undefined') return;
  baseUrlLogged = true;
  if (import.meta.env.DEV) {
    getBaseUrl();
    // Debug log removed
  }
}

/** No external auth; backend may accept requests without token. */
async function getAuthHeaders(): Promise<Record<string, string>> {
  return { 'Content-Type': 'application/json' };
}

/**
 * Parse Retry-After header: delay in seconds (integer) or HTTP-date.
 * Returns seconds until retry, or 60 as default if unparseable.
 */
function parseRetryAfter(value: string | null): number {
  if (!value || !value.trim()) return 60;
  const n = parseInt(value.trim(), 10);
  if (!Number.isNaN(n) && n >= 0) return Math.min(n, 3600);
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const sec = Math.round((date.getTime() - Date.now()) / 1000);
      return Math.max(0, Math.min(sec, 3600));
    }
  } catch {
    // ignore
  }
  return 60;
}

/**
 * Fetch with exponential backoff retry logic for stable connectivity
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        if (import.meta.env.DEV) {
          console.log(`[AI API] Retry attempt ${attempt} after ${delay}ms delay...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(url, options);

      // 429: do not retry; throw with Retry-After so UI can show "try again in X minutes"
      if (response.status === 429) {
        const retryAfterSeconds = parseRetryAfter(response.headers.get('Retry-After'));
        const err = new Error('Too many requests') as Error & { status?: number; retryAfterSeconds?: number };
        err.status = 429;
        err.retryAfterSeconds = retryAfterSeconds;
        throw err;
      }

      // 503: service unavailable — user-friendly message, optional Retry-After
      if (response.status === 503) {
        const retryAfterSeconds = parseRetryAfter(response.headers.get('Retry-After'));
        const errorData = await response.json().catch(() => ({}));
        const err = new Error((errorData as { error?: string }).error || 'Service busy. Please try again in a moment.') as Error & { status?: number; retryAfterSeconds?: number };
        err.status = 503;
        err.retryAfterSeconds = retryAfterSeconds;
        throw err;
      }

      // 504: gateway timeout — do not retry; show Retry-After so UI can suggest when to try again
      if (response.status === 504) {
        const retryAfterSeconds = parseRetryAfter(response.headers.get('Retry-After'));
        const errorData = await response.json().catch(() => ({}));
        const err = new Error((errorData as { error?: string }).error || 'Request timed out. Please try again.') as Error & { status?: number; retryAfterSeconds?: number };
        err.status = 504;
        err.retryAfterSeconds = retryAfterSeconds;
        throw err;
      }

      // Other 5xx: retry with generic message
      if (response.status >= 500) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || `Server returned ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (import.meta.env.DEV) {
        console.warn(`[AI API] Attempt ${attempt + 1} failed:`, error);
      }

      // Don't retry on abort (timeout), auth errors, or rate limit (429)
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('API key'))) {
        throw error;
      }
      const err = error as Error & { status?: number };
      if (err.status === 429 || err.status === 503 || err.status === 504) throw error;
    }
  }

  throw lastError || new Error('Request failed after maximum retries');
}

function validatePrompt(prompt: string): void {
  const trimmed = typeof prompt === 'string' ? prompt.trim() : '';
  if (trimmed.length < AI_PROMPT_MIN_LENGTH) {
    throw new Error('Prompt cannot be empty');
  }
  if (trimmed.length > AI_PROMPT_MAX_LENGTH) {
    throw new Error(`Prompt exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)`);
  }
}

/**
 * Generate user-friendly error messages based on the backend URL and error type
 */
function getConnectionErrorMessage(base: string, isTimeout?: boolean): string {
  const isLocal = base.includes('localhost') || base.includes('127.0.0.1');
  const timeoutHint = isTimeout ? ' The backend did not respond in time.' : '';

  if (isLocal) {
    return `AI backend is not reachable at ${base}.${timeoutHint} Start it with: npm run dev:backend (from project root) or cd AIra/backend && npm run dev.`;
  }
  return `Connection failed: Cannot reach AI backend.${timeoutHint} Check your connection and that the service is running.`;
}

/**
 * Generate free-form content (chat, notes, mind map, flashcards, etc.).
 */
const healthCheckCache: { base: string; until: number } = { base: '', until: 0 };
const HEALTH_CHECK_CACHE_MS = 30000;
const HEALTH_CHECK_TIMEOUT_MS = 6000;

/** Clear the health-check cache so the next request will re-verify backend reachability. Call on connection errors. */
export function clearHealthCheckCache(): void {
  healthCheckCache.base = '';
  healthCheckCache.until = 0;
}

/** Quick health check to fail fast with a clear message if backend is down (browser only). Cached 30s. Retries once after 2s on failure. */
async function ensureBackendReachable(base: string, retry = true): Promise<void> {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (healthCheckCache.base === base && healthCheckCache.until > now) return;

  const attempt = async (): Promise<void> => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);
    try {
      const r = await fetch(`${base}/health`, { method: 'GET', signal: controller.signal, cache: 'no-cache' });
      clearTimeout(t);
      if (r.ok) {
        healthCheckCache.base = base;
        healthCheckCache.until = now + HEALTH_CHECK_CACHE_MS;
        return;
      }
    } catch (err) {
      clearTimeout(t);
      healthCheckCache.base = '';
      healthCheckCache.until = 0;
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      throw new Error(getConnectionErrorMessage(base, isTimeout));
    }
    healthCheckCache.base = '';
    healthCheckCache.until = 0;
    throw new Error(getConnectionErrorMessage(base));
  };

  try {
    await attempt();
  } catch (first) {
    const isRetryable =
      first instanceof TypeError ||
      (first instanceof Error &&
        (first.name === 'AbortError' ||
          first.message.includes('reachable') ||
          first.message.includes('Failed to fetch') ||
          first.message.includes('NetworkError') ||
          first.message.includes('Load failed')));
    if (retry && isRetryable) {
      await new Promise((r) => setTimeout(r, 2000));
      await attempt();
    } else {
      throw first;
    }
  }
}

export async function generateContent(
  prompt: string,
  model: AiModelType = 'llama',
  timeoutMs: number = 60000
): Promise<{ content: string; model: AiModelType }> {
  validatePrompt(prompt);
  logBaseUrlOnce();
  const base = getBaseUrl();

  await ensureBackendReachable(base);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchWithRetry(`${base}/api/generate-content`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ prompt: prompt.trim(), model }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errorMsg = (err as { error?: string }).error || `AI request failed: ${res.status}`;
      throw new Error(errorMsg);
    }

    const data = (await res.json()) as { content?: string; model?: AiModelType };
    const content = typeof data.content === 'string' ? data.content : '';

    if (!content || content.trim().length === 0) {
      throw new Error('AI backend returned empty response. Please try again.');
    }

    return { content, model: data.model ?? model };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('network'))) {
      clearHealthCheckCache();
    }
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout: AI backend did not respond within ${timeoutMs / 1000}s. ${getConnectionErrorMessage(base, true)}`);
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        throw new Error(getConnectionErrorMessage(base));
      }
    }
    throw error;
  }
}

export interface DoubtResolution {
  explanation: string;
  examples: string[];
  visualType?: string;
  visualPrompt?: string;
  quizQuestion: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  } | null;
}

/**
 * Resolve a student doubt (teaching panel). Uses LLaMA or Mistral.
 */
export async function resolveDoubt(
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
  model: AiModelType = 'llama',
  timeoutMs: number = 60000
): Promise<DoubtResolution> {
  const q = typeof question === 'string' ? question.trim() : '';
  if (q.length < 1) throw new Error('Question cannot be empty');
  logBaseUrlOnce();
  const base = getBaseUrl();

  await ensureBackendReachable(base);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchWithRetry(
      `${base}/api/resolve-doubt`,
      {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          question: q,
          context: typeof context === 'string' ? context : '',
          curriculumContext,
          model
        }),
        signal: controller.signal,
      },
      3,
      1500
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || `Doubt resolution failed: ${res.status}`);
    }
    const data = (await res.json()) as DoubtResolution;
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('network'))) {
      clearHealthCheckCache();
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout: Doubt resolution did not complete within ${timeoutMs}ms. Please try again.`);
    }
    if (error instanceof TypeError || (error instanceof Error && error.message.includes('Failed to fetch'))) {
      throw new Error(getConnectionErrorMessage(base));
    }
    throw error;
  }
}

/**
 * Health check: returns available models from backend.
 */
export async function getAvailableModels(timeoutMs: number = 5000): Promise<{ llama: boolean; mistral: boolean }> {
  const base = getBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${base}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return { llama: false, mistral: false };
      const data = (await res.json()) as { models?: { llama?: boolean; mistral?: boolean } };
      return {
        llama: data.models?.llama ?? false,
        mistral: data.models?.mistral ?? false,
      };
    } catch {
      clearTimeout(timeoutId);
      return { llama: false, mistral: false };
    }
  } catch {
    return { llama: false, mistral: false };
  }
}

/** When first argument length exceeds this, treat it as a full prompt and send as { prompt } for 45+ min curriculum-aware generation. */
const FULL_PROMPT_THRESHOLD = 500;

/**
 * Generate a structured lesson for a topic.
 * If the first argument is a long string (e.g. full curriculum prompt from teachingStore), it is sent as { prompt } so the backend uses it directly.
 */
export async function generateTeachingContent(
  topicOrPrompt: string,
  curriculumContext?: {
    curriculumType?: string;
    board?: string;
    grade?: string;
    exam?: string;
    subject?: string;
  },
  model: AiModelType = 'llama',
  timeoutMs: number = 120000
): Promise<{ title: string; sections: { title: string; content: string; spokenContent?: string; durationMinutes?: number; visualType?: string; visualPrompt?: string }[]; summary: string }> {
  const trimmed = typeof topicOrPrompt === 'string' ? topicOrPrompt.trim() : '';
  if (trimmed.length < 1) {
    throw new Error('Topic or prompt cannot be empty');
  }
  logBaseUrlOnce();
  const base = getBaseUrl();

  await ensureBackendReachable(base);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const isFullPrompt = trimmed.length > FULL_PROMPT_THRESHOLD;
  const body = isFullPrompt
    ? { prompt: trimmed, model }
    : { topic: trimmed, curriculumContext, model };

  try {
    const res = await fetchWithRetry(
      `${base}/api/generate-teaching-content`,
      {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      },
      3,
      2000
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || `Teaching content generation failed: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('network'))) {
      clearHealthCheckCache();
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout: Teaching content generation did not complete within ${timeoutMs / 1000}s. Please try again.`);
    }
    if (error instanceof TypeError || (error instanceof Error && error.message.includes('Failed to fetch'))) {
      throw new Error(getConnectionErrorMessage(base));
    }
    throw error;
  }
}

/**
 * Generate a quiz for a topic.
 */
export async function generateQuiz(
  topic: string,
  context: string,
  curriculumContext?: {
    curriculumType?: string;
    board?: string;
    grade?: string;
    exam?: string;
    subject?: string;
  },
  model: AiModelType = 'llama',
  timeoutMs: number = 60000
): Promise<{ questions: { question: string; options: string[]; correctAnswer: number; explanation: string }[] }> {
  const topicTrimmed = typeof topic === 'string' ? topic.trim() : '';
  if (topicTrimmed.length < 1) {
    throw new Error('Topic cannot be empty');
  }
  const contextStr = typeof context === 'string' ? context : '';
  logBaseUrlOnce();
  const base = getBaseUrl();

  await ensureBackendReachable(base);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchWithRetry(
      `${base}/api/generate-quiz`,
      {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ topic: topicTrimmed, context: contextStr, curriculumContext, model }),
        signal: controller.signal,
      },
      3,
      1500
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || `Quiz generation failed: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('network'))) {
      clearHealthCheckCache();
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout: Quiz generation did not complete within ${timeoutMs}ms. Please try again.`);
    }
    if (error instanceof TypeError || (error instanceof Error && error.message.includes('Failed to fetch'))) {
      throw new Error(getConnectionErrorMessage(base));
    }
    throw error;
  }
}

export { getBaseUrl };
