/**
 * Contextual AI Service
 * 
 * Provides intelligent, context-aware AI responses across all application panels:
 * - Chat Panel: General and topic-specific questions
 * - Teaching Panel: Lesson explanations and doubt resolution
 * - Studio Panel: Notes, mind maps, flashcards, quizzes generation
 * 
 * Features:
 * - STRICT DOMAIN ISOLATION: AI responses constrained to selected professional domain
 * - Automatic context detection (topic-specific vs general)
 * - Cross-domain query rejection with polite redirection
 * - Conversation history management
 * - Panel-specific response formatting
 * - Adaptive tone based on user preferences
 */

import { generateContent, resolveDoubt, getBaseUrl, type AiModelType } from './aiApi';
import { useSettingsStore } from '../stores/settingsStore';
import { useTeachingStore } from '../stores/teachingStore';
import { useUserStore } from '../stores/userStore';
import { 
  getDomainContext, 
  isQueryWithinDomain, 
  getDomainSystemPrompt,
  type DomainContext 
} from '../utils/domainValidation';

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
  userProfession?: string;
  userProfessionId?: string;
  userSubProfession?: string;
  userSubProfessionId?: string;
  /** Domain context for strict professional isolation */
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

// ============================================================================
// Prompt Building
// ============================================================================

/**
 * Builds a context-rich prompt for the AI based on the panel and query type
 * Now includes strict domain isolation for professional learning paths
 */
function buildPrompt(
  query: string,
  context: AIContext,
  queryType: 'topic-specific' | 'general' | 'meta'
): string {
  const settings = useSettingsStore.getState().settings;
  const profile = useUserStore.getState().profile;
  
  // Get AI personality preferences
  const aiTutor = settings.aiTutor;
  const toneDescription = getToneDescription(aiTutor?.personality || 'balanced');
  
  // Build user profile context with profession
  const professionPath = context.userProfession 
    ? `${context.userProfession}${context.userSubProfession ? ` specializing in ${context.userSubProfession}` : ''}`
    : '';
  
  const userContext = profile ? `
The student is ${profile.name || 'a learner'}${professionPath ? ` studying ${professionPath}` : ''}.
` : '';

  // Get domain system prompt if we have domain context
  const domainSystemPrompt = context.domainContext 
    ? getDomainSystemPrompt(context.domainContext)
    : '';

  // Handle meta questions
  if (queryType === 'meta') {
    const professionContext = context.userProfession 
      ? ` I'm currently focused on helping you with ${context.userProfession} topics.`
      : '';
    
    return `You are AIra, a friendly and intelligent AI tutor. ${toneDescription}

${userContext}

The user asked: "${query}"

Respond helpfully about yourself or the app.${professionContext} Be conversational and encouraging.`;
  }

  // Handle general questions - but redirect if we have domain context
  if (queryType === 'general') {
    if (context.domainContext) {
      // We have a professional context - gently redirect to domain
      return `${domainSystemPrompt}

${toneDescription}

${userContext}

The user asked: "${query}"

This appears to be a general question outside your current ${context.domainContext.professionName} learning path.

Respond by:
1. Briefly acknowledging their question
2. Politely explaining that you're focused on ${context.domainContext.professionName} content
3. Offering to help with a ${context.domainContext.professionName}-related question instead
4. If the question has any connection to ${context.domainContext.professionName}, answer it from that angle

Keep your response friendly and redirect them back to their learning path.`;
    }
    
    // No domain context - answer generally
    return `You are AIra, a helpful AI tutor. ${toneDescription}

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

  // Include relevant conversation history
  let historyContext = '';
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    const recentHistory = context.conversationHistory.slice(-4); // Last 4 messages
    historyContext = '\n\nRecent conversation:\n' + 
      recentHistory.map(msg => `${msg.role === 'user' ? 'Student' : 'AIra'}: ${msg.content.slice(0, 200)}`).join('\n');
  }

  // Use domain system prompt if available for strict isolation
  const systemPromptBase = domainSystemPrompt || `You are AIra, an engaging AI tutor. ${toneDescription}`;

  return `${systemPromptBase}

${userContext}
${topicContext}
${historyContext}

The student asked: "${query}"

Provide a helpful, contextually relevant response that:
1. Directly addresses their question
2. Stays STRICTLY within the ${context.domainContext?.professionName || context.userProfession || 'current'} domain
3. Relates to the current topic being studied (${context.topicName || 'general education'})
4. Uses only ${context.domainContext?.professionName || context.userProfession || 'relevant'}-appropriate examples and terminology
5. Uses clear explanations with examples when helpful
6. Encourages further learning within this professional domain

Keep your response focused, educational, and domain-appropriate.`;
}

/**
 * Gets a description of the teaching tone based on settings
 */
function getToneDescription(style: string): string {
  const tones: Record<string, string> = {
    'friendly': 'Be warm, encouraging, and conversational. Use casual language and lots of positive reinforcement.',
    'professional': 'Be clear, precise, and formal. Focus on accuracy and structured explanations.',
    'balanced': 'Be friendly yet informative. Balance warmth with educational clarity.',
    'socratic': 'Guide learning through questions. Help the student discover answers themselves.',
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
  if (!domainContext && context.userProfessionId) {
    domainContext = getDomainContext(
      context.userProfessionId,
      context.userSubProfessionId || undefined,
      undefined,
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
    const result = await generateContent(prompt, model);
    
    // Validate response content
    if (!result.content || result.content.trim().length === 0) {
      throw new Error('AI backend returned empty response');
    }
    
    return {
      content: result.content,
      model: result.model,
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
      const backendUrl = getBaseUrl();
      let fallbackResponse = "I'm currently unable to connect to the AI service. ";
      
      if (context.panel === 'chat') {
        if (context.topicName) {
          fallbackResponse += `The backend server may not be running. Please ensure the AI backend is started at ${backendUrl} (e.g. run: npm run dev:backend from project root). In the meantime, you can continue reviewing "${context.topicName}" in the lesson content.`;
        } else {
          fallbackResponse += `The backend server may not be running. Please start it at ${backendUrl} (e.g. run: npm run dev:backend from project root), or try again later.`;
        }
      } else {
        fallbackResponse += `Please start the AI backend at ${backendUrl} (e.g. npm run dev:backend) and try again.`;
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
  conversationHistory?: ConversationMessage[]
): Promise<AIResponse> {
  // Get current teaching context if available
  const teachingState = useTeachingStore.getState();
  const userState = useUserStore.getState();
  const currentSession = teachingState.currentSession;
  const currentStep = currentSession?.teachingSteps?.[teachingState.currentStep];
  
  // Get user's professional domain for strict isolation
  const professionId = userState.selectedProfession?.id || userState.profile?.profession?.id;
  const professionName = userState.selectedProfession?.name || userState.profile?.profession?.name;
  const subProfessionId = userState.selectedSubProfession || userState.profile?.subProfession || undefined;
  
  // Build domain context for strict professional isolation
  const domainContext = professionId 
    ? getDomainContext(professionId, subProfessionId, undefined, currentSession?.topicId) || undefined
    : undefined;
  
  const context: AIContext = {
    panel: 'chat',
    topicId: currentSession?.topicId,
    topicName: currentSession?.topicName,
    currentStepTitle: currentStep?.title,
    currentStepContent: currentStep?.content,
    conversationHistory,
    userProfession: professionName,
    userProfessionId: professionId,
    userSubProfession: subProfessionId,
    userSubProfessionId: subProfessionId,
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
  
  // Get user's professional domain for strict isolation
  const professionId = userState.selectedProfession?.id || userState.profile?.profession?.id;
  const professionName = userState.selectedProfession?.name || userState.profile?.profession?.name;
  const subProfessionId = userState.selectedSubProfession || userState.profile?.subProfession || undefined;
  
  // Build domain context for strict professional isolation
  const domainContext = professionId 
    ? getDomainContext(professionId, subProfessionId, undefined, topicId) || undefined
    : undefined;
  
  // Build domain-specific context string
  let contextString = `Topic: ${topicName}. Section: ${stepTitle}. Content: ${stepContent}`;
  
  if (domainContext) {
    contextString = `[DOMAIN: ${domainContext.professionName}${domainContext.subProfessionName ? ` > ${domainContext.subProfessionName}` : ''}]\n${contextString}\n\nIMPORTANT: All explanations and examples MUST stay within the ${domainContext.professionName} domain. Use only ${domainContext.professionName}-appropriate terminology and examples.`;
  } else if (professionName) {
    contextString = `[DOMAIN: ${professionName}]\n${contextString}\n\nIMPORTANT: All explanations and examples MUST stay within the ${professionName} domain.`;
  }
  
  try {
    // Use the specialized doubt resolution API
    const result = await resolveDoubt(query, contextString, model);
    
    // Format the response
    let content = result.explanation;
    
    if (result.examples && result.examples.length > 0) {
      content += '\n\n**Examples:**\n' + result.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n');
    }
    
    return {
      content,
      model,
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

/**
 * Extended options for resource generation with domain context
 */
export interface ResourceGenerationOptionsWithDomain extends ResourceGenerationOptions {
  professionId?: string;
  professionName?: string;
  subProfessionName?: string;
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
  const professionId = options.professionId || userState.selectedProfession?.id || userState.profile?.profession?.id;
  const professionName = options.professionName || userState.selectedProfession?.name || userState.profile?.profession?.name;
  const subProfessionId = userState.selectedSubProfession || userState.profile?.subProfession || undefined;
  const subProfessionName = options.subProfessionName;
  
  // Build domain context
  const domainContext = professionId 
    ? getDomainContext(professionId, subProfessionId, undefined, options.topicId) || undefined
    : undefined;
  
  const contentText = options.content.join('\n\n').slice(0, 3000); // Limit context size
  
  // Build domain constraint header
  let domainHeader = '';
  if (domainContext || professionName) {
    const domainPath = domainContext 
      ? `${domainContext.professionName}${domainContext.subProfessionName ? ` > ${domainContext.subProfessionName}` : ''}`
      : professionName + (subProfessionName ? ` > ${subProfessionName}` : '');
    
    domainHeader = `IMPORTANT DOMAIN CONSTRAINT:
You are generating educational content for a student studying ${domainPath}.
ALL content, examples, terminology, and explanations MUST be relevant to ${professionName || domainContext?.professionName}.
Do NOT include examples or references from other professional domains.

`;
  }
  
  let prompt = '';
  
  switch (options.type) {
    case 'notes':
      prompt = `${domainHeader}Create comprehensive study notes for the topic "${options.topicName}"${professionName ? ` in the context of ${professionName}` : ''}.

Content to summarize:
${contentText}

Generate well-organized notes with:
- Clear headings and subheadings
- Key concepts highlighted with ${professionName || 'domain'}-specific terminology
- Important definitions relevant to ${professionName || 'the field'}
- Practical examples from ${professionName || 'the field'}
- Summary points

Format the notes for easy studying. Ensure all content stays within the ${professionName || 'specified'} domain.`;
      break;
      
    case 'mindmap':
      prompt = `${domainHeader}Create a mind map structure for the topic "${options.topicName}"${professionName ? ` in ${professionName}` : ''}.

Content:
${contentText}

Generate a mind map in JSON format with:
- Central topic (${options.topicName})
- Main branches (key ${professionName || 'domain'} concepts)
- Sub-branches (${professionName || 'domain'}-specific details)
- Connections between related ${professionName || 'professional'} concepts

Format as valid JSON: {"central": "topic", "branches": [{"name": "concept", "children": [...]}]}
All concepts must be relevant to ${professionName || 'the specified domain'}.`;
      break;
      
    case 'flashcards': {
      const cardCount = options.count || 10;
      prompt = `${domainHeader}Create ${cardCount} flashcards for studying "${options.topicName}"${professionName ? ` in ${professionName}` : ''}.

Content:
${contentText}

Generate flashcards in JSON format:
[
  {"front": "Question or term", "back": "Answer or definition", "hint": "Optional hint"},
  ...
]

Requirements:
- All questions and answers must be relevant to ${professionName || 'the domain'}
- Use ${professionName || 'domain'}-appropriate terminology
- Make questions that test understanding, not just memorization
- Difficulty level: ${options.difficulty || 'medium'}`;
      break;
    }
      
    case 'quiz': {
      const quizCount = options.count || 5;
      prompt = `${domainHeader}Create a ${quizCount}-question quiz for "${options.topicName}"${professionName ? ` in ${professionName}` : ''}.

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
- All questions must test ${professionName || 'domain'}-specific knowledge
- Use terminology appropriate for ${professionName || 'the field'}
- Difficulty: ${options.difficulty || 'medium'}
- Include a mix of question types testing different aspects of ${professionName || 'domain'} understanding`;
      break;
    }
      
    case 'summary':
      prompt = `${domainHeader}Create a concise summary of "${options.topicName}"${professionName ? ` for ${professionName} students` : ''}.

Content:
${contentText}

Generate a summary that:
- Captures all key ${professionName || 'domain'}-relevant points
- Is easy to understand for ${professionName || 'domain'} professionals/students
- Highlights the most important ${professionName || 'professional'} concepts
- Is suitable for quick review before ${professionName || 'professional'} practice/exams

Keep it under 300 words. Ensure all content is relevant to ${professionName || 'the specified domain'}.`;
      break;
  }
  
  try {
    const result = await generateContent(prompt, model);
    return result.content;
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
  
  // Get user's professional domain for strict isolation
  const professionId = userState.selectedProfession?.id || userState.profile?.profession?.id;
  const professionName = userState.selectedProfession?.name || userState.profile?.profession?.name;
  const subProfessionId = userState.selectedSubProfession || userState.profile?.subProfession || undefined;
  
  // Build domain context for strict professional isolation
  const domainContext = professionId 
    ? getDomainContext(professionId, subProfessionId, undefined, session?.topicId) || undefined
    : undefined;
  
  return {
    panel: 'chat',
    topicId: session?.topicId,
    topicName: session?.topicName,
    currentStepTitle: currentStep?.title,
    currentStepContent: currentStep?.content,
    userProfession: professionName,
    userProfessionId: professionId,
    userSubProfession: subProfessionId,
    userSubProfessionId: subProfessionId,
    conversationHistory: session ? getConversationHistory(session.id) : [],
    domainContext,
  };
}
