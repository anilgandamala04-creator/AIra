/**
 * Contextual AI Service
 * 
 * Provides intelligent, context-aware AI responses across all application panels:
 * - Chat Panel: General and topic-specific questions
 * - Teaching Panel: Lesson explanations and doubt resolution
 * - Studio Panel: Notes, mind maps, flashcards, quizzes generation
 * 
 * Features:
 * - STRICT DOMAIN ISOLATION: AI responses constrained to selected academic domain
 * - Automatic context detection (topic-specific vs general)
 * - Cross-domain query rejection with polite redirection
 * - Conversation history management
 * - Panel-specific response formatting
 * - Adaptive tone based on user preferences
 */

import { generateAIContent, resolveAIDoubt } from './aiExecution';
import { getBaseUrl, clearHealthCheckCache, type AiModelType } from './aiApi';
import { useSettingsStore } from '../stores/settingsStore';
import { useTeachingStore } from '../stores/teachingStore';
import { useUserStore } from '../stores/userStore';
import {
  getDomainContext,
  isQueryWithinDomain,
  getDomainSystemPrompt,
  type DomainContext
} from '../utils/domainValidation';
import { getPersonalizationInstructions } from './promptControlLayer';
import type { CurriculumType, SchoolBoard, ExamType } from '../types';

// ============================================================================
// Types
// ============================================================================

export type AIPanel = 'chat' | 'teaching' | 'studio' | 'doubt';

export interface AIContext {
  panel: AIPanel;
  topicId?: string;
  topicName?: string;
  subjectName?: string;
  currentStepTitle?: string;
  currentStepContent?: string;
  sessionContent?: string[];
  conversationHistory?: ConversationMessage[];

  // Curriculum Context
  curriculumType?: string;
  board?: string;
  grade?: string;
  exam?: string;
  subject?: string;
  topic?: string;
  visualType?: string;
  visualPrompt?: string;
  /** Competitive mode: include PYQ (last 10 years) */
  includePYQ?: boolean;

  /** Domain context for strict academic isolation */
  domainContext?: DomainContext;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIResponse {
  content: string;
  model: AiModelType;
  contextUsed: boolean;
  responseType: 'general' | 'topic-specific' | 'lesson' | 'resource';
}

export interface ResourceGenerationOptions {
  type: 'notes' | 'mindmap' | 'flashcards' | 'quiz' | 'summary';
  topicName: string;
  content: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
}

// ============================================================================
// Context Detection
// ============================================================================

/**
 * Analyzes user input to determine if it's topic-specific or general
 * Enhanced with better pattern matching and context awareness
 */
function detectQueryType(
  query: string,
  context: AIContext
): 'topic-specific' | 'general' | 'meta' {
  const lowerQuery = query.toLowerCase().trim();

  // Meta questions about the app or AI itself
  const metaPatterns = [
    /who are you/,
    /what can you do/,
    /how do you work/,
    /what is this app/,
    /help me understand how to use/,
    /how to use this/,
    /what are your capabilities/,
    /introduce yourself/,
    /tell me about yourself/,
  ];

  if (metaPatterns.some(pattern => pattern.test(lowerQuery))) {
    return 'meta';
  }

  // Clear general knowledge questions (not related to current topic)
  const generalPatterns = [
    /^what is the weather/,
    /^what time is it/,
    /^tell me a joke/,
    /^who is the president/,
    /^what is the capital of/,
    /^translate .+ to/,
    /^how do I cook/,
    /^what's the news/,
  ];

  if (generalPatterns.some(pattern => pattern.test(lowerQuery))) {
    return 'general';
  }

  // Check if query references the current topic
  if (context.topicName) {
    const topicWords = context.topicName.toLowerCase().split(/\s+/);

    // Direct topic mention
    if (topicWords.some(word => word.length > 3 && lowerQuery.includes(word))) {
      return 'topic-specific';
    }

    // Strong contextual references (high confidence topic-specific)
    const strongIndicators = [
      'explain this', 'explain that', 'what does this mean',
      'why is this', 'how does this work', 'what about this',
      'can you clarify', "i don't understand", 'confused about',
      'tell me more about', 'give me an example', 'more detail',
      'what happens when', 'why did', 'how did', 'what if',
      'in this case', 'in this context', 'regarding this',
      'about this topic', 'related to this', 'back to',
    ];

    if (strongIndicators.some(indicator => lowerQuery.includes(indicator))) {
      return 'topic-specific';
    }

    // Weak contextual references (needs topic context to be meaningful)
    const weakIndicators = [
      'explain', 'why', 'how', 'what', 'when', 'where',
      'example', 'define', 'meaning', 'purpose', 'difference',
    ];

    // If weak indicator AND we have active lesson content, assume topic-specific
    if (context.currentStepContent && weakIndicators.some(indicator => lowerQuery.startsWith(indicator))) {
      return 'topic-specific';
    }
  }

  // Check for subject-specific keywords if in a teaching context
  if (context.subjectName) {
    const subjectWords = context.subjectName.toLowerCase().split(/\s+/);
    if (subjectWords.some(word => word.length > 3 && lowerQuery.includes(word))) {
      return 'topic-specific';
    }
  }

  // Check step title for keywords
  if (context.currentStepTitle) {
    const stepWords = context.currentStepTitle.toLowerCase().split(/\s+/);
    if (stepWords.some(word => word.length > 4 && lowerQuery.includes(word))) {
      return 'topic-specific';
    }
  }

  // Default to general if no topic context or no clear reference
  if (!context.topicName && !context.currentStepContent) {
    return 'general';
  }

  // When in an active teaching session with content, lean toward topic-specific
  // This ensures the AI stays contextually relevant during lessons
  if (context.panel === 'teaching' || context.panel === 'doubt') {
    return 'topic-specific';
  }

  // Ambiguous - could be either, lean toward topic-specific if we have context
  return context.topicName ? 'topic-specific' : 'general';
}

/**
 * Detects whether the user is asking for a PROBLEM SOLUTION (step-by-step)
 * or a CONCEPT EXPLANATION (seamless prose)
 */
function detectExplanationType(query: string): 'problem' | 'concept' {
  const lowerQuery = query.toLowerCase().trim();

  // Problem-solving patterns - these should trigger step-by-step explanations
  const problemPatterns = [
    /solve\s+(this|the|a|an)?/i,
    /calculate\s/i,
    /find\s+(the|a|an)?\s*(value|area|volume|length|sum|product|difference|quotient|remainder|answer)/i,
    /how\s+(do\s+)?(i|we|you)\s+(solve|calculate|find|compute|derive|prove|simplify|factor|evaluate)/i,
    /what\s+is\s+the\s+(value|answer|result|solution)/i,
    /work\s+(out|through)/i,
    /step\s*by\s*step/i,
    /show\s+(me\s+)?(the\s+)?(steps|working|solution|process)/i,
    /can\s+you\s+solve/i,
    /help\s+me\s+(solve|calculate|find)/i,
    /derive\s/i,
    /prove\s+(that|this)/i,
    /simplify\s/i,
    /factorize|factorise/i,
    /evaluate\s/i,
    /if\s+.+\s*(find|calculate|determine)/i,
    /given\s+.+\s*(find|calculate|determine)/i,
    /\d+\s*[+\-*/^]\s*\d+/,  // Mathematical expressions like "2 + 3" or "5 * 4"
    /=\s*\?/,  // Equations with unknowns
    /x\s*=|y\s*=|z\s*=/i,  // Algebraic equations
  ];

  // Check if the query matches any problem-solving pattern
  if (problemPatterns.some(pattern => pattern.test(lowerQuery))) {
    return 'problem';
  }

  // Default to concept explanation
  return 'concept';
}

// ============================================================================
// Prompt Building
// ============================================================================

/**
 * Builds a context-rich prompt for the AI based on the panel and query type
 * Now includes strict domain isolation for academic learning paths
 */
function buildPrompt(
  query: string,
  context: AIContext,
  queryType: 'topic-specific' | 'general' | 'meta'
): string {
  const settings = useSettingsStore.getState().settings;
  const profile = useUserStore.getState().profile;
  const personalizationInstructions = profile ? getPersonalizationInstructions(profile) : '';

  // Get AI personality preferences
  const aiTutor = settings.aiTutor;
  const toneDescription = getToneDescription(aiTutor?.personality || 'balanced');

  // Build user profile context with curriculum
  let curriculumPath = '';
  if (context.curriculumType === 'school') {
    curriculumPath = `a ${context.grade} student studying in ${context.board} Board`;
  } else if (context.curriculumType === 'competitive') {
    curriculumPath = `preparing for the ${context.exam} exam`;
  }

  const userContext = profile ? `
The student is ${profile.name || 'a learner'}${curriculumPath ? ` ${curriculumPath}` : ''}.
` : '';

  // Get domain system prompt if we have domain context
  const domainSystemPrompt = context.domainContext
    ? getDomainSystemPrompt(context.domainContext)
    : '';

  // Handle meta questions
  if (queryType === 'meta') {
    const academicPath = context.domainContext?.curriculumType === 'school'
      ? `${context.domainContext.grade} ${context.board || 'school'}`
      : context.domainContext?.exam || context.exam;

    const academicContext = academicPath
      ? ` I'm currently focused on helping you with ${academicPath} related topics.`
      : '';

    return `You are AIra, a friendly and intelligent AI tutor. ${toneDescription}
${personalizationInstructions}

${userContext}

The user asked: "${query}"

Respond helpfully about yourself or the app.${academicContext} Be conversational and encouraging.`;
  }

  // Handle general questions - but redirect if we have domain context
  if (queryType === 'general') {
    if (context.domainContext) {
      const academicPath = context.domainContext.curriculumType === 'school'
        ? `${context.domainContext.grade} ${context.domainContext.board}`
        : context.domainContext.exam;

      // We have an academic context - gently redirect to domain
      return `${domainSystemPrompt}

${toneDescription}

${userContext}

The user asked: "${query}"

This appears to be a general question outside your current ${academicPath} learning path.

Respond by:
1. Briefly acknowledging their question
2. Politely explaining that you're focused on ${academicPath} content
3. Offering to help with a ${context.domainContext.subject || 'relevant'} question instead
4. If the question has any connection to ${context.domainContext.subject || 'their studies'}, answer it from that angle

Keep your response friendly and redirect them back to their learning path.`;
    }

    // No domain context - answer generally
    return `You are AIra, a helpful AI tutor. ${toneDescription}
${personalizationInstructions}

${userContext}

The user asked: "${query}"

Provide a helpful, clear response. If the question is educational, explain thoroughly with examples. If it's a casual question, respond naturally and helpfully.`;
  }

  // Topic-specific response with rich context AND domain isolation
  let topicContext = '';

  if (context.topicName) {
    topicContext += `\nCurrent Topic: ${context.topicName}`;
  }

  if (context.subjectName) {
    topicContext += `\nSubject: ${context.subjectName}`;
  }

  if (context.currentStepTitle) {
    topicContext += `\nCurrent Lesson Section: ${context.currentStepTitle}`;
  }

  if (context.currentStepContent) {
    // Truncate content if too long
    const maxContentLength = 1500;
    const content = context.currentStepContent.length > maxContentLength
      ? context.currentStepContent.slice(0, maxContentLength) + '...'
      : context.currentStepContent;
    topicContext += `\nLesson Content: ${content}`;
  }

  if (context.visualType && context.visualPrompt) {
    topicContext += `\nVISUAL AID AVAILABLE: static visual (diagram/illustration/board-style) representing "${context.visualPrompt}".
    CRITICAL INSTRUCTION: You MUST explain the topic strictly based on the selected subject and topic only, by referencing this visual.
    Instructional style: "In this diagram/illustration showing ${context.visualPrompt}, you can see..."
    All your explanations must be grounded in what is visible in this specific visual. Voice narration must be synchronized with the visual. Do NOT suggest other visuals or introduce unrelated concepts; use only this topic-specific visual. No dynamic storytelling or unrelated animations.`;
  }

  // Include relevant conversation history
  let historyContext = '';
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    const recentHistory = context.conversationHistory.slice(-4); // Last 4 messages
    historyContext = '\n\nRecent conversation:\n' +
      recentHistory.map(msg => `${msg.role === 'user' ? 'Student' : 'AIra'}: ${msg.content.slice(0, 200)}`).join('\n');
  }

  // Use domain system prompt if available for strict isolation
  const systemPromptBase = domainSystemPrompt
    ? `${domainSystemPrompt}\n${personalizationInstructions}`
    : `You are AIra, an engaging AI tutor. ${toneDescription}\n${personalizationInstructions}`;
  const academicDomain = context.domainContext?.curriculumType === 'school'
    ? `${context.domainContext.grade} (${context.domainContext.board})`
    : context.domainContext?.exam || 'current';

  // Curriculum-based teaching style: Competitive = step-by-step with reasoning; Board = seamless, no step-by-step
  const curriculumType = context.domainContext?.curriculumType ?? context.curriculumType;
  const includePYQ = context.includePYQ ?? false;

  const useStepByStepStyle = curriculumType === 'competitive'
    ? true
    : curriculumType === 'school'
      ? false
      : detectExplanationType(query) === 'problem';

  // Build PYQ instructions if enabled
  const pyqInstructions = (curriculumType === 'competitive' && includePYQ)
    ? `\n### PYQ INTEGRATION ENABLED
1. **REFERENCE PRIOR EXAMS**: Include specific mentions of how this concept appeared in the last 10 years of ${context.exam || 'competitive'} exams.
2. **PATTERN RECOGNITION**: Highlight common question patterns or "traps" found in Previous Year Questions (PYQs).
3. **PRACTICE FOCUS**: Provide or reference a typical PYQ style problem for this concept.`
    : '';

  // Build explanation style instructions from curriculum (and fallback to query type when no curriculum)
  const explanationStyleInstructions = useStepByStepStyle
    ? `### STEP-BY-STEP TEACHING MODE (COMPETITIVE EXAM STYLE)
The student is preparing for competitive exams. Follow these rules STRICTLY:
1. **USE NUMBERED STEPS**: Structure your explanation as Step 1, Step 2, Step 3, etc.
2. **EXPLAIN REASONING**: For EVERY step, clearly explain WHY you are doing it. Example: "Step 1: We do X. We do this because..."
3. **SHOW LOGIC FLOW**: Do not skip steps; build understanding step by step with reasoning behind each.
4. **FINAL TAKEAWAY**: Clearly state the conclusion or answer at the end.
5. **VERIFY IF RELEVANT**: For problems, briefly verify or check the answer.`
    : `### SEAMLESS EXPLANATION MODE (BOARD / SCHOOL STYLE)
The student is following a school board curriculum. Follow these rules STRICTLY:
1. **NO STEP NUMBERING**: Do NOT use "Step 1", "Step 2", or numbered lists for concepts.
2. **SEAMLESS NARRATIVE**: Write in a clear, detailed, and seamless flowing prose style.
3. **USE TRANSITIONS**: Connect ideas with transition words like "Furthermore," "In addition to this," "As a consequence," "Building on this understanding," etc.
4. **DETAILED & CLEAR**: Provide thorough explanations with examples woven naturally into the narrative.
5. **AVOID BULLETS**: Do not break the explanation into bullet points or step-by-step instructions.`;

  return `${systemPromptBase}

${userContext}
${topicContext}
${historyContext}

The student asked: "${query}"

${explanationStyleInstructions}${pyqInstructions}

### COMPREHENSIVE TEACHING DEPTH REQUIREMENTS:
Your response must provide SUBSTANTIAL educational depth:
1. **CONCEPT INTRODUCTION**: Start with a clear introduction and context for why this matters.
2. **DETAILED EXPLANATIONS**: Provide thorough, in-depth explanations - not summaries or brief overviews.
3. **EXAMPLES & ANALOGIES**: Include multiple concrete examples and relatable analogies.
4. **COMMON MISCONCEPTIONS**: Address what students typically get wrong about this topic.
5. **REINFORCEMENT**: End with a brief reinforcement or follow-up thought to solidify understanding.
6. **MAINTAIN CONTEXT**: Reference earlier parts of this session if relevant. Avoid needless repetition.
7. **DYNAMIC PACING**: Adjust depth based on topic complexity - simple topics explained thoroughly, complex topics broken down clearly.

### STRICT TOPIC SCOPE (NON-NEGOTIABLE):
- Explain content STRICTLY based on the selected subject and topic only. Do NOT introduce unrelated concepts, examples, or topics beyond the selected scope.
- AI explanations MUST always include: (1) Static visual content (diagrams, illustrations, board-style visuals) and (2) Voice narration synchronized with the visuals.
- All visuals must be directly, strictly, and exclusively related to the selected subject and topic only. No generic, decorative, cross-topic, or dynamic storytelling visuals. No unrelated animations.

### ADDITIONAL GUIDELINES:
- **NATURAL VOICE**: Write as if speaking directly to the student. Use contractions (it's, you'll, we're), vary sentence lengths, and sound warm and human - NEVER robotic or like a textbook.
- **DOMAIN FOCUS**: Stay STRICTLY within the ${academicDomain} curriculum. Use only ${academicDomain}-appropriate examples and terminology.
- **VISUAL GROUNDING**: Reference only static visuals (diagram, illustration, board-style) for this topic. Keep voice narration synchronized with what is shown: "As you can see in this diagram/illustration..."
- **RESPONSE LENGTH**: Provide a substantive response (minimum 200-400 words for most questions). Brief answers are only acceptable for simple clarifications.
- **EXTEND NATURALLY**: If the topic warrants more depth, extend the explanation naturally without artificial padding.

Provide a comprehensive, educationally rich response that deepens understanding.`;
}

/**
 * Gets a description of the teaching tone based on settings
 */
function getToneDescription(style: string): string {
  const tones: Record<string, string> = {
    'friendly': 'Be warm, encouraging, and conversational. Use relatable language and positive reinforcement.',
    'professional': 'Be clear, precise, and formal. Focus on academic accuracy and structured explanations.',
    'balanced': 'Be friendly yet informative. Balance warmth with educational clarity.',
    'socratic': 'Guide learning through questions. Help the student discover answers themselves.',
    'mentor': 'Be guiding and supportive. Ask thought-provoking questions and provide wisdom-based insights.',
    'strict': 'Be direct, concise, and results-oriented. Focus on high-level precision and efficiency.',
    'encouraging': 'Be highly supportive and motivating. Celebrate progress and build confidence.',
  };

  return tones[style] || tones['balanced'];
}

// ============================================================================
// Response Generation
// ============================================================================

/**
 * Generate a contextually appropriate AI response with strict domain isolation
 */
export async function generateContextualResponse(
  query: string,
  context: AIContext
): Promise<AIResponse> {
  // Validate query is not empty
  const trimmedQuery = typeof query === 'string' ? query.trim() : '';
  if (!trimmedQuery || trimmedQuery.length === 0) {
    throw new Error('Query cannot be empty');
  }

  const settings = useSettingsStore.getState().settings;
  const model: AiModelType = settings.aiTutor?.preferredAiModel ?? 'llama';

  // Build or use existing domain context for strict isolation
  let domainContext = context.domainContext;
  if (!domainContext && context.curriculumType) {
    domainContext = getDomainContext(
      context.curriculumType as CurriculumType,
      context.board as SchoolBoard | undefined,
      context.grade || undefined,
      context.exam as ExamType | undefined,
      context.subject || undefined,
      context.topicId
    ) || undefined;
  }

  // Update context with domain information
  const enrichedContext: AIContext = {
    ...context,
    domainContext,
  };

  // Check if query is within domain (if we have domain context)
  let queryType = detectQueryType(trimmedQuery, enrichedContext);

  if (domainContext && queryType !== 'meta') {
    const domainCheck = isQueryWithinDomain(trimmedQuery, domainContext);

    if (!domainCheck.isWithinDomain) {
      // Query is outside domain - force 'general' type to trigger redirection prompt
      queryType = 'general';
    }
  }

  // Build appropriate prompt with domain isolation
  const prompt = buildPrompt(trimmedQuery, enrichedContext, queryType);

  // Validate prompt is not empty
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Failed to build prompt: prompt is empty');
  }

  try {
    const opResult = await generateAIContent(prompt, { model, retries: 3 });
    const content = opResult.success && opResult.data ? opResult.data.content : (opResult.data?.content ?? '');
    const usedModel = opResult.model ?? model;

    // Validate response content
    if (!content || content.trim().length === 0) {
      throw new Error(opResult.error || 'AI backend returned empty response');
    }

    return {
      content,
      model: usedModel,
      contextUsed: queryType !== 'general' || !!domainContext,
      responseType: queryType === 'meta' ? 'general' :
        queryType === 'general' ? 'general' : 'topic-specific',
    };
  } catch (error) {
    console.error('Failed to generate contextual response:', {
      error,
      query: trimmedQuery.substring(0, 100),
      queryType,
      hasDomainContext: !!domainContext,
      model,
      panel: context.panel,
    });

    // Check if this is a network/backend unavailable error (show friendly fallback)
    const msg = error instanceof Error ? error.message : '';
    const isNetworkError = error instanceof TypeError || msg.includes('Failed to fetch') || msg.includes('network');
    const isBackendUnavailable = msg.includes('Connection failed') ||
      msg.includes('Unable to connect') ||
      msg.includes('backend') ||
      msg.includes('Network error') ||
      msg.includes('not reachable');

    // Provide a helpful fallback response instead of throwing
    if (isNetworkError || isBackendUnavailable) {
      clearHealthCheckCache(); // so next request re-checks backend
      const backendUrl = getBaseUrl();
      const steps = 'Open a new terminal, go to your project folder (e.g. "Project AIra"), and run: npm run dev:backend';
      let fallbackResponse = "I can't connect to the AI service right now. ";

      if (context.panel === 'chat') {
        if (context.topicName) {
          fallbackResponse += `To enable chat: ${steps}. The app expects the backend at ${backendUrl}. Until then, you can keep reviewing "${context.topicName}" in the lesson.`;
        } else {
          fallbackResponse += `To enable chat: ${steps}. Backend URL: ${backendUrl}.`;
        }
      } else {
        fallbackResponse += `To use this feature: ${steps}.`;
      }

      return {
        content: fallbackResponse,
        model,
        contextUsed: false,
        responseType: 'general' as const,
      };
    }

    // For other errors, still throw to maintain error handling in calling code
    throw error;
  }
}

/**
 * Generate a response for the Chat panel with strict domain isolation
 */
export async function generateChatResponse(
  query: string,
  conversationHistory?: ConversationMessage[],
  providedContext?: AIContext
): Promise<AIResponse> {
  // Get current teaching context if available
  const teachingState = useTeachingStore.getState();
  const userState = useUserStore.getState();
  const currentSession = teachingState.currentSession;
  const currentStep = currentSession?.teachingSteps?.[teachingState.currentStep];

  // Build domain context for strict academic isolation
  const domainContext = userState.curriculumType
    ? getDomainContext(
      userState.curriculumType,
      userState.selectedBoard || undefined,
      userState.selectedGrade || undefined,
      userState.selectedExam || undefined,
      userState.selectedSubject || undefined,
      currentSession?.topicId
    ) || undefined
    : undefined;

  const context: AIContext = providedContext || {
    panel: 'chat',
    topicId: currentSession?.topicId,
    topicName: currentSession?.topicName,
    currentStepTitle: currentStep?.title,
    currentStepContent: currentStep?.content,
    conversationHistory,
    curriculumType: userState.curriculumType || undefined,
    board: userState.selectedBoard || undefined,
    grade: userState.selectedGrade || undefined,
    exam: userState.selectedExam || undefined,
    subject: userState.selectedSubject || undefined,
    visualType: currentStep?.visualType,
    visualPrompt: currentStep?.visualPrompt,
    domainContext,
  };

  return generateContextualResponse(query, context);
}

/**
 * Generate a response for Teaching panel doubts with strict domain isolation
 */
export async function generateTeachingResponse(
  query: string,
  topicName: string,
  stepTitle: string,
  stepContent: string,
  topicId?: string
): Promise<AIResponse> {
  const settings = useSettingsStore.getState().settings;
  const userState = useUserStore.getState();
  const model: AiModelType = settings.aiTutor?.preferredAiModel ?? 'llama';

  // Get user's academic domain for strict isolation
  const curriculumType = userState.curriculumType;
  const board = userState.selectedBoard;
  const grade = userState.selectedGrade;
  const exam = userState.selectedExam;
  const subject = userState.selectedSubject;

  // Build domain context for strict academic isolation
  const domainContext = curriculumType
    ? getDomainContext(
      curriculumType,
      board || undefined,
      grade || undefined,
      exam || undefined,
      subject || undefined,
      topicId
    ) || undefined
    : undefined;

  // Build domain-specific context string
  let contextString = `Topic: ${topicName}. Section: ${stepTitle}. Content: ${stepContent}`;

  if (domainContext) {
    const academicPath = domainContext.curriculumType === 'school'
      ? `${domainContext.grade} ${domainContext.board}`
      : domainContext.exam;

    contextString = `[DOMAIN: ${academicPath}]\n${contextString}\n\nIMPORTANT: All explanations and examples MUST stay within the ${academicPath} level and syllabus. Use only age-appropriate terminology and examples.`;
  }

  try {
    const curriculumContext = {
      curriculumType: curriculumType || undefined,
      board: board || undefined,
      grade: grade || undefined,
      exam: exam || undefined,
      subject: subject || undefined,
      topic: topicName,
    };
    const result = await resolveAIDoubt(query, contextString, {
      model,
      retries: 3,
      curriculumContext,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to generate teaching response.');
    }

    const resolution = result.data;
    let content = resolution.explanation;

    if (resolution.examples && resolution.examples.length > 0) {
      content += '\n\n**Examples:**\n' + resolution.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n');
    }

    return {
      content,
      model: result.model ?? model,
      contextUsed: true,
      responseType: 'topic-specific',
    };
  } catch (error) {
    console.error('Failed to generate teaching response:', error);
    throw error;
  }
}

// ============================================================================
// Studio Resource Generation
// ============================================================================

export interface ResourceGenerationOptionsWithDomain extends ResourceGenerationOptions {
  topicId?: string;
}

/**
 * Generate study resources for the Studio panel with strict domain isolation
 */
export async function generateStudyResource(
  options: ResourceGenerationOptionsWithDomain
): Promise<string> {
  const settings = useSettingsStore.getState().settings;
  const userState = useUserStore.getState();
  const model: AiModelType = settings.aiTutor?.preferredAiModel ?? 'llama';

  // Get domain context for strict isolation
  const curriculumType = userState.curriculumType;
  const board = userState.selectedBoard;
  const grade = userState.selectedGrade;
  const exam = userState.selectedExam;
  const subject = userState.selectedSubject;

  // Build domain context
  const domainContext = curriculumType
    ? getDomainContext(
      curriculumType,
      board || undefined,
      grade || undefined,
      exam || undefined,
      subject || undefined,
      options.topicId
    ) || undefined
    : undefined;

  const contentText = options.content.join('\n\n').slice(0, 3000); // Limit context size

  // Build domain constraint header
  let domainHeader = '';
  let academicPath = '';
  if (domainContext) {
    academicPath = domainContext.curriculumType === 'school'
      ? `${domainContext.grade} ${domainContext.board}`
      : domainContext.exam || '';

    domainHeader = `IMPORTANT ACADEMIC CONSTRAINT:
You are generating educational content for a student studying ${academicPath}.
ALL content, examples, terminology, and explanations MUST be relevant to the ${academicPath} level and syllabus.
Do NOT include examples or references from outside this academic level.

`;
  }

  let prompt = '';

  switch (options.type) {
    case 'notes':
      prompt = `${domainHeader}Create comprehensive study notes for the topic "${options.topicName}"${academicPath ? ` in the context of ${academicPath}` : ''}.

Content to summarize:
${contentText}

Generate well-organized notes with:
- Clear headings and subheadings
- Key concepts highlighted with ${academicPath || 'domain'}-specific terminology
- Important definitions relevant to ${academicPath || 'the field'}
- Practical examples from ${academicPath || 'the field'}
- Summary points

Format the notes for easy studying. Ensure all content stays within the ${academicPath || 'specified'} academic level.`;
      break;

    case 'mindmap':
      prompt = `${domainHeader}Create a mind map structure for the topic "${options.topicName}"${academicPath ? ` in ${academicPath}` : ''}.

Content:
${contentText}

Generate a mind map in JSON format with:
- Central topic (${options.topicName})
- Main branches (key ${academicPath || 'academic'} concepts)
- Sub-branches (${academicPath || 'academic'}-specific details)
- Connections between related ${academicPath || 'academic'} concepts

Format as valid JSON: {"central": "topic", "branches": [{"name": "concept", "children": [...]}]}
All concepts must be relevant to ${academicPath || 'the specified academic level'}.`;
      break;

    case 'flashcards': {
      const cardCount = options.count || 10;
      prompt = `${domainHeader}Create ${cardCount} flashcards for studying "${options.topicName}"${academicPath ? ` in ${academicPath}` : ''}.

Content:
${contentText}

Generate flashcards in JSON format:
[
  {"front": "Question or term", "back": "Answer or definition", "hint": "Optional hint"},
  ...
]

Requirements:
- All questions and answers must be relevant to ${academicPath || 'the syllabus'}
- Use ${academicPath || 'academic'}-appropriate terminology
- Make questions that test understanding, not just memorization
- Difficulty level: ${options.difficulty || 'medium'}`;
      break;
    }

    case 'quiz': {
      const quizCount = options.count || 5;
      prompt = `${domainHeader}Create a ${quizCount}-question quiz for "${options.topicName}"${academicPath ? ` in ${academicPath}` : ''}.

Content:
${contentText}

Generate quiz in JSON format:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct"
  },
  ...
]

Requirements:
- All questions must test ${academicPath || 'academic'}-specific knowledge
- Use terminology appropriate for ${academicPath || 'the level'}
- Difficulty: ${options.difficulty || 'medium'}
- Include a mix of question types testing different aspects of ${academicPath || 'academic'} understanding`;
      break;
    }

    case 'summary':
      prompt = `${domainHeader}Create a concise summary of "${options.topicName}"${academicPath ? ` for ${academicPath} students` : ''}.

Content:
${contentText}

Generate a summary that:
- Captures all key ${academicPath || 'academic'}-relevant points
- Is easy to understand for ${academicPath || 'academic'} students
- Highlights the most important ${academicPath || 'academic'} concepts
- Is suitable for quick review before ${academicPath || 'academic'} exams

Keep it under 300 words. Ensure all content is relevant to ${academicPath || 'the specified academic level'}.`;
      break;
  }

  try {
    const opResult = await generateAIContent(prompt, { model, retries: 3 });
    const content = opResult.success && opResult.data ? opResult.data.content : (opResult.data?.content ?? '');
    if (!content) throw new Error(opResult.error || `Failed to generate ${options.type}`);
    return content;
  } catch (error) {
    console.error(`Failed to generate ${options.type}:`, error);
    throw error;
  }
}

// ============================================================================
// Conversation Management
// ============================================================================

const MAX_HISTORY_LENGTH = 20;
const conversationHistories: Map<string, ConversationMessage[]> = new Map();

/**
 * Get or create conversation history for a session
 */
export function getConversationHistory(sessionId: string): ConversationMessage[] {
  return conversationHistories.get(sessionId) || [];
}

/**
 * Add a message to conversation history
 */
export function addToConversationHistory(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): void {
  const history = conversationHistories.get(sessionId) || [];

  history.push({
    role,
    content,
    timestamp: new Date().toISOString(),
  });

  // Trim history if too long
  if (history.length > MAX_HISTORY_LENGTH) {
    history.splice(0, history.length - MAX_HISTORY_LENGTH);
  }

  conversationHistories.set(sessionId, history);
}

/**
 * Clear conversation history for a session
 */
export function clearConversationHistory(sessionId: string): void {
  conversationHistories.delete(sessionId);
}

// ============================================================================
// Helper: Get Current Context
// ============================================================================

/**
 * Get the current AI context from application state with domain isolation
 */
export function getCurrentAIContext(): AIContext {
  const teachingState = useTeachingStore.getState();
  const userState = useUserStore.getState();
  const session = teachingState.currentSession;
  const currentStep = session?.teachingSteps?.[teachingState.currentStep];

  // Build domain context for strict academic isolation
  const domainContext = userState.curriculumType
    ? getDomainContext(
      userState.curriculumType,
      userState.selectedBoard || undefined,
      userState.selectedGrade || undefined,
      userState.selectedExam || undefined,
      userState.selectedSubject || undefined,
      session?.topicId
    ) || undefined
    : undefined;

  return {
    panel: 'chat',
    topicId: session?.topicId,
    topicName: session?.topicName,
    currentStepTitle: currentStep?.title,
    currentStepContent: currentStep?.content,
    curriculumType: userState.curriculumType || undefined,
    board: userState.selectedBoard || undefined,
    grade: userState.selectedGrade || undefined,
    exam: userState.selectedExam || undefined,
    subject: userState.selectedSubject || undefined,
    conversationHistory: session ? getConversationHistory(session.id) : [],
    domainContext,
  };
}
