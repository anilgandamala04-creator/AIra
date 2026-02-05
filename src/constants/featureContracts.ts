/**
 * Feature contracts and verification rules.
 * A feature is "working properly" only if it satisfies these contracts.
 * No release without checklist pass.
 */

import { BREAKPOINTS } from './layout';

// ---------------------------------------------------------------------------
// 1. Feature "works properly" definition
// ---------------------------------------------------------------------------

/** A feature works only if: correct on all supported devices, survives dynamic state, deterministic under same inputs. */
export const FEATURE_WORKS_CRITERIA = {
  allDevices: true,
  survivesStateChanges: true, // login, resize, data growth
  deterministic: true, // same inputs → same behavior
} as const;

// ---------------------------------------------------------------------------
// 2. Cross-device breakpoint ranges (validation targets)
// ---------------------------------------------------------------------------

/** Breakpoint ranges (px) for responsiveness validation. Every feature must be verified at these. */
export const VIEWPORT_RANGES = {
  /** Desktop: ≥1280px */
  desktop: { min: 1280, max: Infinity },
  /** Laptop: 1024–1279px */
  laptop: { min: 1024, max: 1279 },
  /** Tablet: 768–1023px */
  tablet: { min: 768, max: 1023 },
  /** Mobile: ≤767px */
  mobile: { min: 0, max: 767 },
} as const;

export const IS_DESKTOP_MIN = BREAKPOINTS.xl; // 1280
export const IS_LAPTOP_MIN = BREAKPOINTS.lg;  // 1024
export const IS_TABLET_MIN = BREAKPOINTS.md;  // 768
export const IS_MOBILE_MAX = 767;

// ---------------------------------------------------------------------------
// 3. Failure rules (what must happen when things go wrong)
// ---------------------------------------------------------------------------

/** When data is missing or AI fails, UI must do these—never silently freeze or break layout. */
export const FAILURE_RULES = {
  /** If AI returns empty or errors: show fallback message + retry, never leave panel frozen. */
  aiEmptyOrError: 'show_fallback_and_retry',
  /** If badge data fails to load: header spacing and height remain stable (no vertical shift). */
  badgeDataMissing: 'stable_header_layout',
  /** If lesson content fails to load: show retry state, not infinite loading. */
  lessonContentMissing: 'show_retry_state',
  /** Long AI/teaching content: scroll inside panel only, no overflow of screen or layout shift. */
  longContent: 'scroll_inside_panel',
  /** Step indicator updates must not move or shift other header/panel elements. */
  stepIndicatorUpdate: 'no_layout_shift',
} as const;

// ---------------------------------------------------------------------------
// 4. Validation layers (every feature must pass)
// ---------------------------------------------------------------------------

export const VALIDATION_LAYERS = {
  interaction: 'click_tap_keyboard',
  stateChange: 'login_logout_resize_toggle',
  regression: 'no_side_effects_elsewhere',
} as const;

// ---------------------------------------------------------------------------
// 5. AI correctness rules
// ---------------------------------------------------------------------------

/** AI is "working properly" only if: inputs validated, outputs context-aware and panel-scoped, failures handled (not silent). */
export const AI_CORRECTNESS_RULES = {
  validateInputs: true,   // before hitting model
  contextAwareOutput: true, // panel-scoped (e.g. chat → Chat only)
  gracefulFailure: true,   // fallback UI, not silent freeze
} as const;

/** Max prompt length sent to AI (chars). Enforced in aiApi. */
export const AI_PROMPT_MAX_LENGTH = 32_000;
/** Min prompt length (non-empty). */
export const AI_PROMPT_MIN_LENGTH = 1;
