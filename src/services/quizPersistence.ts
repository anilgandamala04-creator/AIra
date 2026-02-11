/**
 * Persist and restore paused quiz state for "Resume later" feature.
 * Uses localStorage; cleared on quiz completion or after 7 days.
 */

import type { Quiz, QuizQuestion } from './quizService';

const STORAGE_PREFIX = 'aira_paused_quiz_';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface PausedQuizState {
  topicId: string;
  topicName: string;
  subject?: string;
  quiz: Quiz;
  currentQuestionIndex: number;
  score: number;
  wrongQuestionIndices: number[];
  answeredWrong: Array<{ question: QuizQuestion; selectedIndex: number }>;
  startTime: number;
  remainingSecondsAtPause: number;
  pausedAt: number;
  timeLimitMinutes: number;
}

function storageKey(topicId: string): string {
  return `${STORAGE_PREFIX}${topicId}`;
}

export function savePausedQuiz(state: PausedQuizState): void {
  try {
    const key = storageKey(state.topicId);
    const data = JSON.stringify({
      ...state,
      pausedAt: Date.now(),
    });
    localStorage.setItem(key, data);
  } catch {
    // ignore quota / privacy errors
  }
}

export function loadPausedQuiz(topicId: string): PausedQuizState | null {
  try {
    const key = storageKey(topicId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const data = JSON.parse(raw) as PausedQuizState & { pausedAt?: number };
    const pausedAt = data.pausedAt ?? 0;
    if (Date.now() - pausedAt > MAX_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearPausedQuiz(topicId: string): void {
  try {
    localStorage.removeItem(storageKey(topicId));
  } catch {
    // ignore
  }
}

export function getRemainingSecondsAfterPause(state: PausedQuizState): number {
  const elapsedSincePause = Math.floor((Date.now() - state.pausedAt) / 1000);
  return Math.max(0, state.remainingSecondsAtPause - elapsedSincePause);
}
