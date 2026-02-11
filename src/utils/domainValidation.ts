/**
 * Domain Validation Utility
 * 
 * Ensures strict curriculum domain isolation:
 * - Validates topics belong to the selected curriculum (School/Competitive)
 * - Rejects cross-domain content requests
 * - Provides domain-aware context for AI responses
 */

import type { CurriculumType, SchoolBoard, ExamType } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface DomainContext {
  curriculumType: CurriculumType;
  board?: SchoolBoard;
  grade?: string;
  exam?: ExamType;
  subject?: string;
  topic?: string;
  domainKeywords: string[];
  relatedTerms: string[];
}

export interface DomainValidationResult {
  isValid: boolean;
  belongsToDomain: boolean;
  message: string;
  suggestedRedirect?: string;
}

// ============================================================================
// Domain Keyword Maps (Simplified for Schools/Exams)
// ============================================================================

const GENERAL_ACADEMIC_KEYWORDS = [
  'exam', 'test', 'syllabus', 'curriculum', 'grade', 'class', 'board', 'subject',
  'chapter', 'unit', 'lesson', 'study', 'education', 'learning', 'practice',
  'question', 'answer', 'explanation', 'concept', 'theory', 'problem', 'solution'
];

// Domain keywords for curriculum subjects
export const SUBJECT_KEYWORDS: Record<string, string[]> = {
  Mathematics: ['algebra', 'calculus', 'geometry', 'trigonometry', 'arithmetic', 'equations', 'functions', 'logic', 'proofs', 'numbers', 'statistics', 'probability'],
  Science: ['physics', 'chemistry', 'biology', 'experiment', 'hypothesis', 'observation', 'molecule', 'atom', 'force', 'energy', 'matter', 'environment'],
  Physics: ['mechanics', 'thermodynamics', 'optics', 'electricity', 'magnetism', 'quantum', 'relativity', 'kinematics', 'dynamics', 'force', 'energy', 'motion'],
  Chemistry: ['organic', 'inorganic', 'physical', 'reactions', 'elements', 'periodic table', 'bonding', 'moles', 'acid', 'base', 'stoichiometry'],
  Biology: ['cells', 'genetics', 'evolution', 'anatomy', 'physiology', 'ecology', 'plants', 'animals', 'human body', 'metabolism', 'DNA'],
  English: ['literature', 'grammar', 'composition', 'poetry', 'prose', 'vocabulary', 'writing', 'analysis', 'comprehension', 'drama'],
  'Social Science': ['history', 'geography', 'civics', 'economics', 'society', 'culture', 'government', 'politics', 'maps', 'timeline'],
  'Computer Science': ['programming', 'coding', 'algorithms', 'data structures', 'python', 'java', 'javascript', 'html', 'css', 'database', 'network', 'software', 'hardware', 'internet', 'cybersecurity']
};

const CROSS_DOMAIN_INDICATORS = [
  'how to cook', 'recipe', 'celebrity news', 'gaming tips', 'fashion trends',
  'movie reviews', 'sports scores', 'horoscope', 'vacation planning'
];

// ============================================================================
// Domain Validation Functions
// ============================================================================

/**
 * Get the domain context for the current school/exam setup
 */
export function getDomainContext(
  curriculumType: CurriculumType,
  board?: SchoolBoard,
  grade?: string,
  exam?: ExamType,
  subject?: string,
  topic?: string
): DomainContext {
  const domainKeywords = [...GENERAL_ACADEMIC_KEYWORDS];
  if (subject && SUBJECT_KEYWORDS[subject]) {
    domainKeywords.push(...SUBJECT_KEYWORDS[subject]);
  }

  const relatedTerms: string[] = [];
  if (board) relatedTerms.push(board);
  if (grade) relatedTerms.push(grade);
  if (exam) relatedTerms.push(exam);
  if (subject) relatedTerms.push(subject);
  if (topic) relatedTerms.push(topic);

  return {
    curriculumType,
    board,
    grade,
    exam,
    subject,
    topic,
    domainKeywords: [...new Set(domainKeywords)],
    relatedTerms: [...new Set(relatedTerms.filter(t => t.length > 2))]
  };
}

/**
 * Check if a query is related to the current curriculum domain
 */
export function isQueryWithinDomain(
  query: string,
  domainContext: DomainContext
): { isWithinDomain: boolean; confidence: number; reason: string } {
  const lowerQuery = query.toLowerCase();

  // Check for explicit cross-domain indicators
  for (const indicator of CROSS_DOMAIN_INDICATORS) {
    if (lowerQuery.includes(indicator)) {
      return {
        isWithinDomain: false,
        confidence: 0.95,
        reason: `Query appears unrelated to ${domainContext.subject || 'educational'} content. Staying focused on your curriculum.`
      };
    }
  }

  // Simplified relevance check
  const hasSubjectKeyword = domainContext.subject &&
    SUBJECT_KEYWORDS[domainContext.subject]?.some(kw => lowerQuery.includes(kw));

  const mentionsContext =
    (domainContext.subject && lowerQuery.includes(domainContext.subject.toLowerCase())) ||
    (domainContext.topic && lowerQuery.includes(domainContext.topic.toLowerCase()));

  if (mentionsContext || hasSubjectKeyword) {
    return {
      isWithinDomain: true,
      confidence: 0.9,
      reason: 'Query is relevant to current subject/topic.'
    };
  }

  // Allow contextual follow-ups
  const contextualPatterns = [/explain/i, /how/i, /why/i, /example/i, /what is/i, /help/i];
  if (contextualPatterns.some(p => p.test(query))) {
    return {
      isWithinDomain: true,
      confidence: 0.8,
      reason: 'Standard pedagogical inquiry.'
    };
  }

  return {
    isWithinDomain: true,
    confidence: 0.6,
    reason: 'Processing within academic context.'
  };
}

/**
 * Get curriculum-specific system prompt for AI
 */
export function getDomainSystemPrompt(domainContext: DomainContext): string {
  const { curriculumType, board, grade, exam, subject, topic } = domainContext;

  let contextStr = '';
  if (curriculumType === 'school') {
    contextStr = `School (Board: ${board}, Grade: ${grade})`;
  } else {
    contextStr = `Competitive Exam (${exam})`;
  }

  const teachingStyleRule = curriculumType === 'competitive'
    ? `TEACHING STYLE: Always use a step-by-step approach. Clearly explain each step and the reasoning behind it. Structure answers as Step 1, Step 2, etc., with "We do this because..." so the student builds exam-ready method.`
    : `TEACHING STYLE: Explain in a clear, detailed, and seamless manner. Do NOT break explanations into step-by-step instructions. Use flowing prose and transitions (e.g. "Furthermore,", "Building on this,").`;

  return `You are an expert AI tutor for the following curriculum context: ${contextStr}.

CRITICAL CONSTRAINTS:
1. Current Subject: ${subject || 'General'}
2. Current Topic: ${topic || 'General'}
3. You MUST align your teaching style and complexity to a ${curriculumType === 'school' ? grade : exam} student.
4. Use terminology, examples, and problem-solving techniques consistent with the ${board || exam} standards.
5. If the user asks about unrelated topics (e.g., cooking, entertainment), politely redirect them to ${subject || 'their studies'}.
6. Keep explanations clear, academic, and supportive.
7. ${teachingStyleRule}
8. For ${curriculumType === 'competitive' ? exam : 'School'} students, ${curriculumType === 'competitive' ? 'focus on step-by-step reasoning and competitive problem-solving shortcuts.' : 'focus on conceptual clarity and strong fundamentals according to the NCERT/Board syllabus.'}

STRICT TOPIC SCOPE (NON-NEGOTIABLE):
- Explain content STRICTLY based on the selected subject and topic only. Do NOT introduce unrelated concepts, examples, or topics beyond the selected scope.
- AI explanations MUST always include: (1) Static visual content (diagrams, illustrations, board-style visuals) and (2) Voice narration synchronized with the visuals.
- All visuals MUST be directly, strictly, and exclusively related to the selected subject and topic only. No generic, decorative, cross-topic, or out-of-syllabus visuals.
- Static visuals must be available and used for every topic; ensure complete visual coverage. No dynamic storytelling visuals or unrelated animations are allowed.
- This behavior is consistent across Curriculum and Competitive modes (only teaching style differs).`;
}
