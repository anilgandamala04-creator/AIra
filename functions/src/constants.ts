/**
 * Shared constants for Cloud Functions. Kept in a separate module to avoid
 * circular dependencies (e.g. validation must not import aiService at load time).
 */
export const AI_PROMPT_MAX_LENGTH = 32_000;
export const AI_PROMPT_MIN_LENGTH = 1;
