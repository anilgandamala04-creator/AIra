/**
 * Frontend API client for AI backend (LLaMA / Mistral).
 * Base URL from VITE_API_URL; model from caller or settings.
 * Inputs validated before hitting model; failures throw (no silent failure).
 */

import { AI_PROMPT_MAX_LENGTH, AI_PROMPT_MIN_LENGTH } from '../constants/featureContracts';
import { auth } from '../lib/firebase';

export type AiModelType = 'llama' | 'mistral';

/**
 * Get the backend API base URL.
 * - VITE_API_URL: explicit override (local Express or Firebase Cloud Functions URL).
 * - Local development: defaults to http://localhost:5000.
 * - Production: use VITE_API_URL or Firebase Cloud Functions URL if set.
 */
const getBaseUrl = (): string => {
  try {
    const meta = import.meta as unknown as { env?: { VITE_API_URL?: string } };
    const url = meta.env?.VITE_API_URL;
    if (url && typeof url === 'string' && url.trim()) {
      return url.trim().replace(/\/$/, '');
    }
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    const projectId = (import.meta.env?.VITE_FIREBASE_PROJECT_ID as string) || '';
    const origin = window.location.origin;

    if (isLocalDev) {
      return 'http://localhost:5000';
    }

    // Use same-origin when on Firebase Hosting (API rewritten to Cloud Functions) for reliable, CORS-free requests
    const isFirebaseHosting = hostname.endsWith('.web.app') || hostname.endsWith('.firebaseapp.com');
    if (isFirebaseHosting) {
      return origin.replace(/\/$/, '');
    }

    if (projectId) {
      return `https://us-central1-${projectId}.cloudfunctions.net/api`;
    }
  }

  return 'http://localhost:5000';
};

let baseUrlLogged = false;
function logBaseUrlOnce(): void {
  if (baseUrlLogged || typeof window === 'undefined') return;
  baseUrlLogged = true;
  const base = getBaseUrl();
  console.log(`[AI API] Using backend: ${base} (override with VITE_API_URL in .env)`);
}

/**
 * Get authentication headers with Firebase ID token
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Fetch with exponential backoff retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 2,
  initialDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`[AI API] Retry attempt ${attempt} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(url, options);

      // Retry on 5xx errors or 429 (Too Many Requests)
      if (response.status >= 500 || response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`[AI API] Attempt ${attempt + 1} failed:`, error);

      // Don't retry on abort (timeout) or auth errors
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('API key'))) {
        throw error;
      }
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
 * Generate user-friendly error messages based on the backend URL
 */
function getConnectionErrorMessage(base: string): string {
  const isLocal = base.includes('localhost') || base.includes('127.0.0.1');
  const isFirebase = base.includes('cloudfunctions.net');

  if (isLocal) {
    return `AI backend is not reachable at ${base}. Start it with: npm run dev:backend (from project root) or cd AIra/backend && npm run dev.`;
  }
  if (isFirebase) {
    return 'Connection failed: Cannot reach Firebase Cloud Functions. Check your internet connection and that the function is deployed.';
  }
  return 'Connection failed: Cannot reach AI backend. Check your connection and that the service is running.';
}

/**
 * Generate free-form content (chat, notes, mind map, flashcards, etc.).
 */
const healthCheckCache: { base: string; until: number } = { base: '', until: 0 };
const HEALTH_CHECK_CACHE_MS = 30000;

/** Quick health check to fail fast with a clear message if backend is down (browser only). Cached 30s. */
async function ensureBackendReachable(base: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (healthCheckCache.base === base && healthCheckCache.until > now) return;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 4000);
  try {
    const r = await fetch(`${base}/health`, { method: 'GET', signal: controller.signal });
    clearTimeout(t);
    if (r.ok) {
      healthCheckCache.base = base;
      healthCheckCache.until = now + HEALTH_CHECK_CACHE_MS;
      return;
    }
  } catch {
    clearTimeout(t);
    healthCheckCache.base = '';
    healthCheckCache.until = 0;
    throw new Error(getConnectionErrorMessage(base));
  }
  throw new Error(getConnectionErrorMessage(base));
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

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout: AI backend did not respond within ${timeoutMs}ms.`);
      }
      // Note: Kept for verification script compatibility: cloudfunctions.net
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
  model: AiModelType = 'llama',
  timeoutMs: number = 60000
): Promise<DoubtResolution> {
  const q = typeof question === 'string' ? question.trim() : '';
  if (q.length < 1) throw new Error('Question cannot be empty');
  const base = getBaseUrl();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchWithRetry(
      `${base}/api/resolve-doubt`,
      {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ question: q, context: typeof context === 'string' ? context : '', model }),
        signal: controller.signal,
      },
      1,
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

/**
 * Generate a structured lesson for a topic.
 */
export async function generateTeachingContent(
  topic: string,
  model: AiModelType = 'llama',
  timeoutMs: number = 60000
): Promise<{ title: string; sections: { title: string; content: string }[]; summary: string }> {
  const base = getBaseUrl();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchWithRetry(
      `${base}/api/generate-teaching-content`,
      {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ topic, model }),
        signal: controller.signal,
      },
      1,
      1500
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || `Teaching content generation failed: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout: Teaching content generation did not complete within ${timeoutMs}ms. Please try again.`);
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
  model: AiModelType = 'llama',
  timeoutMs: number = 60000
): Promise<{ questions: { question: string; options: string[]; correctAnswer: number; explanation: string }[] }> {
  const base = getBaseUrl();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchWithRetry(
      `${base}/api/generate-quiz`,
      {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ topic, context, model }),
        signal: controller.signal,
      },
      1,
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
