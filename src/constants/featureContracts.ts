/**
 * Feature contracts used by the app (e.g. AI API limits).
 */

/** Max prompt length sent to AI (chars). Enforced in aiApi. */
export const AI_PROMPT_MAX_LENGTH = 32_000;
/** Min prompt length (non-empty). */
export const AI_PROMPT_MIN_LENGTH = 1;
