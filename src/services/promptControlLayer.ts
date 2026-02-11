/**
 * Prompt Control Layer — AI Learning OS
 *
 * Single source of truth for mode-controlled AI behavior.
 * Ensures: no topic drift, no cross-contamination between Curriculum and Competitive.
 * Used by: teachingStore.generateAiSession, AI Teaching Core.
 *
 * @see docs/SYSTEM_ARCHITECTURE.md
 */

import type { CurriculumType, ExamType, UserProfile } from '../types';

/** Canonical prompt control params (non-negotiable for AI Teaching Core). */
export interface PromptControlParams {
  mode: 'CURRICULUM' | 'COMPETITIVE';
  topic_lock: boolean;
  allowed_sources: string[];
  visual_style: 'board_teaching' | 'problem_breakdown';
  voice: 'teacher' | 'analytical';
}

export interface PromptControlContext {
  curriculumType: CurriculumType;
  board?: string | null;
  grade?: string | null;
  exam?: ExamType | null;
  subjectName?: string | null;
  topic: string;
  includePYQ?: boolean;
}

const CURRICULUM_SOURCES = ['NCERT', 'BOARD_SYLLABUS'];
const COMPETITIVE_BASE_SOURCES = ['JEE_SYLLABUS', 'NEET_SYLLABUS'];
const PYQ_SOURCE = 'PYQ_DB';

/**
 * Returns the Prompt Control params for the given mode and context.
 * Use this when building prompts so AI behavior is strictly mode-locked.
 */
export function getPromptControlParams(
  context: PromptControlContext
): PromptControlParams {
  const isCompetitive = context.curriculumType === 'competitive';

  if (isCompetitive) {
    const sources = context.includePYQ
      ? [...COMPETITIVE_BASE_SOURCES, PYQ_SOURCE]
      : [...COMPETITIVE_BASE_SOURCES];
    return {
      mode: 'COMPETITIVE',
      topic_lock: true,
      allowed_sources: sources,
      visual_style: 'problem_breakdown',
      voice: 'analytical',
    };
  }

  return {
    mode: 'CURRICULUM',
    topic_lock: true,
    allowed_sources: CURRICULUM_SOURCES,
    visual_style: 'board_teaching',
    voice: 'teacher',
  };
}

/**
 * One-line mode constraint string for injection into prompts.
 * Keeps prompt text aligned with Prompt Control Layer.
 */
export function getModeConstraintLine(params: PromptControlParams): string {
  if (params.mode === 'COMPETITIVE') {
    return 'MODE = COMPETITIVE (exam-first). Hard rule: no cartoons, no motivation speeches, no fun facts. Analytical voice only; visuals = problem breakdowns.';
  }
  return 'MODE = CURRICULUM (syllabus-first). Brutal truth: if you drift into competitive-level depth, you have failed curriculum trust. Syllabus and selected topic only.';
}
/**
 * Generates specific prompt instructions based on user personalization settings.
 * Maps LearningStyle, LearningPreferences, and LearningGoals to AI instructions.
 */
export function getPersonalizationInstructions(profile: UserProfile): string {
  const { learningStyle, learningPreferences, learningGoals } = profile;

  // 1. Teaching Style Tone
  const styleInstructions: Record<string, string> = {
    friendly: "Tone: Warm, encouraging, and conversational. Use relatable language and positive reinforcement.",
    professional: "Tone: Clear, precise, and formal. Focus on academic accuracy and structured explanations.",
    mentor: "Tone: Guiding and supportive. Ask thought-provoking questions and provide wisdom-based insights.",
    strict: "Tone: Direct, concise, and results-oriented. Focus on high-level precision and efficiency."
  };

  // 2. Explanation Depth
  const depthInstructions: Record<string, string> = {
    basic: "Depth: Fundamental concepts only. High-level overview, simple language, no complex technicalities.",
    comprehensive: "Depth: Standard curriculum level. Full coverage of all core concepts with balanced detail.",
    detailed: "Depth: In-depth exploration. Deep dive into mechanisms, sub-concepts, and advanced nuances.",
    expert: "Depth: Mastery level. Advanced technical discussion, theoretical edge-cases, and high-complexity analysis."
  };

  // 3. Learning Style Priorities
  const totalStyleWeight = (learningStyle.visual || 0) + (learningStyle.auditory || 0) + (learningStyle.kinesthetic || 0) || 100;
  const visualPct = Math.round((learningStyle.visual / totalStyleWeight) * 100);
  const auditoryPct = Math.round((learningStyle.auditory / totalStyleWeight) * 100);

  let primaryStyle = "Analytical & Logical";
  if (visualPct > 60) primaryStyle = "Highly Visual & Diagrammatic";
  else if (auditoryPct > 60) primaryStyle = "Vivid Narrative & Explanatory";

  // 4. Analogies & Interests
  const interests = learningGoals && learningGoals.length > 0
    ? `\nInterests for Analogies: Use examples or analogies related to ${learningGoals.join(', ')} where appropriate.`
    : '';

  return `
### PERSONALIZATION CONSTRAINTS
- ${styleInstructions[learningPreferences.teachingStyle] || styleInstructions.friendly}
- ${depthInstructions[learningPreferences.explanationDepth] || depthInstructions.comprehensive}
- Priority: ${primaryStyle} (Preferred Pace: ${learningStyle.preferredPace}).${interests}
`;
}
