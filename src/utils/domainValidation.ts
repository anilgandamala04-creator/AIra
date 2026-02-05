/**
 * Domain Validation Utility
 * 
 * Ensures strict professional domain isolation:
 * - Validates topics belong to the selected profession
 * - Rejects cross-domain content requests
 * - Provides domain-aware context for AI responses
 */

import { professions } from '../data/professions';
import type { Profession, SubProfession, Subject, Topic } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface DomainContext {
  professionId: string;
  professionName: string;
  subProfessionId?: string;
  subProfessionName?: string;
  subjectId?: string;
  subjectName?: string;
  topicId?: string;
  topicName?: string;
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
// Domain Keyword Maps
// ============================================================================

/**
 * Core keywords for each professional domain
 * Used for validating AI queries and responses stay within domain
 */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  medicine: [
    'medical', 'clinical', 'patient', 'diagnosis', 'treatment', 'symptoms',
    'disease', 'condition', 'therapy', 'healthcare', 'anatomy', 'physiology',
    'pathology', 'pharmacology', 'surgery', 'medicine', 'hospital', 'doctor',
    'nurse', 'cardiac', 'neurology', 'oncology', 'pediatric', 'heart', 'brain',
    'blood', 'organ', 'tissue', 'cell', 'ecg', 'mri', 'ct scan', 'x-ray',
    'prescription', 'medication', 'dosage', 'side effects', 'prognosis'
  ],
  engineering: [
    'engineering', 'technical', 'system', 'design', 'architecture', 'code',
    'software', 'hardware', 'algorithm', 'database', 'network', 'mechanical',
    'electrical', 'civil', 'structural', 'circuit', 'programming', 'develop',
    'build', 'implement', 'optimize', 'debug', 'api', 'framework', 'library',
    'function', 'class', 'object', 'variable', 'loop', 'condition', 'data structure',
    'component', 'module', 'interface', 'protocol', 'server', 'client'
  ],
  law: [
    'legal', 'law', 'court', 'judge', 'attorney', 'lawyer', 'contract', 'statute',
    'regulation', 'compliance', 'litigation', 'rights', 'liability', 'tort',
    'criminal', 'civil', 'constitutional', 'corporate', 'intellectual property',
    'patent', 'trademark', 'copyright', 'verdict', 'settlement', 'plaintiff',
    'defendant', 'prosecution', 'defense', 'appeal', 'jurisdiction', 'precedent'
  ],
  business: [
    'business', 'management', 'marketing', 'finance', 'accounting', 'investment',
    'revenue', 'profit', 'loss', 'budget', 'strategy', 'operations', 'hr',
    'leadership', 'team', 'project', 'stakeholder', 'customer', 'market',
    'competition', 'brand', 'sales', 'roi', 'kpi', 'analytics', 'growth',
    'startup', 'enterprise', 'portfolio', 'asset', 'stock', 'bond', 'equity'
  ],
  science: [
    'science', 'scientific', 'research', 'experiment', 'hypothesis', 'theory',
    'physics', 'chemistry', 'biology', 'mathematics', 'formula', 'equation',
    'laboratory', 'observation', 'data', 'analysis', 'molecule', 'atom',
    'element', 'compound', 'reaction', 'force', 'energy', 'mass', 'velocity',
    'acceleration', 'wave', 'particle', 'quantum', 'evolution', 'genetics'
  ],
  arts: [
    'art', 'artistic', 'creative', 'design', 'aesthetic', 'visual', 'painting',
    'sculpture', 'photography', 'music', 'literature', 'theater', 'film',
    'dance', 'composition', 'color', 'form', 'texture', 'perspective', 'style',
    'movement', 'period', 'culture', 'expression', 'narrative', 'symbolism',
    'critique', 'gallery', 'museum', 'exhibition', 'portfolio'
  ],
  technology: [
    'technology', 'tech', 'digital', 'computer', 'software', 'ai', 'artificial intelligence',
    'machine learning', 'data science', 'cybersecurity', 'cloud', 'blockchain',
    'iot', 'automation', 'robotics', 'neural network', 'deep learning', 'nlp',
    'computer vision', 'encryption', 'security', 'hack', 'vulnerability',
    'firewall', 'vpn', 'server', 'infrastructure', 'devops', 'aws', 'azure'
  ],
  education: [
    'education', 'teaching', 'learning', 'pedagogy', 'curriculum', 'assessment',
    'student', 'teacher', 'classroom', 'instruction', 'lesson', 'course',
    'training', 'development', 'skill', 'knowledge', 'comprehension', 'evaluation',
    'grade', 'exam', 'test', 'homework', 'assignment', 'syllabus', 'objective',
    'outcome', 'differentiation', 'inclusion', 'special education', 'iep'
  ],
  psychology: [
    'psychology', 'psychological', 'mental', 'cognitive', 'behavioral', 'emotional',
    'therapy', 'counseling', 'disorder', 'anxiety', 'depression', 'trauma',
    'stress', 'coping', 'mindfulness', 'personality', 'development', 'perception',
    'memory', 'learning', 'motivation', 'emotion', 'social', 'clinical',
    'assessment', 'diagnosis', 'treatment', 'intervention', 'cbt', 'psychodynamic'
  ]
};

/**
 * Cross-domain terms that should trigger domain validation
 */
const CROSS_DOMAIN_INDICATORS = [
  'how to cook', 'recipe', 'weather', 'sports score', 'movie', 'celebrity',
  'politics', 'news', 'entertainment', 'gaming', 'travel', 'fashion',
  'relationship advice', 'dating', 'horoscope', 'lottery'
];

// ============================================================================
// Domain Validation Functions
// ============================================================================

/**
 * Get the domain context for a given profession
 */
export function getDomainContext(
  professionId: string,
  subProfessionId?: string,
  subjectId?: string,
  topicId?: string
): DomainContext | null {
  const profession = professions.find(p => p.id === professionId);
  if (!profession) return null;

  const domainKeywords = DOMAIN_KEYWORDS[professionId] || [];
  const relatedTerms: string[] = [];

  let subProfession: SubProfession | undefined;
  let subject: Subject | undefined;
  let topic: Topic | undefined;

  if (subProfessionId) {
    subProfession = profession.subProfessions.find(sp => sp.id === subProfessionId);
    if (subProfession) {
      // Add sub-profession specific terms
      relatedTerms.push(subProfession.name.toLowerCase());
      relatedTerms.push(...subProfession.description.toLowerCase().split(/\s+/));
    }
  }

  if (subjectId && subProfession) {
    subject = subProfession.subjects.find(s => s.id === subjectId);
    if (subject) {
      relatedTerms.push(subject.name.toLowerCase());
    }
  }

  if (topicId && subject) {
    topic = subject.topics.find(t => t.id === topicId);
    if (topic) {
      relatedTerms.push(topic.name.toLowerCase());
      if (topic.description) {
        relatedTerms.push(...topic.description.toLowerCase().split(/\s+/));
      }
    }
  }

  return {
    professionId: profession.id,
    professionName: profession.name,
    subProfessionId: subProfession?.id,
    subProfessionName: subProfession?.name,
    subjectId: subject?.id,
    subjectName: subject?.name,
    topicId: topic?.id,
    topicName: topic?.name,
    domainKeywords: [...new Set(domainKeywords)],
    relatedTerms: [...new Set(relatedTerms.filter(t => t.length > 2))]
  };
}

/**
 * Validate if a topic belongs to a profession
 */
export function validateTopicBelongsToProfession(
  topicId: string,
  professionId: string
): DomainValidationResult {
  const profession = professions.find(p => p.id === professionId);
  if (!profession) {
    return {
      isValid: false,
      belongsToDomain: false,
      message: 'Invalid profession specified.'
    };
  }

  // Search for the topic in this profession
  for (const subProf of profession.subProfessions) {
    for (const subject of subProf.subjects) {
      const topic = subject.topics.find(t => t.id === topicId);
      if (topic) {
        return {
          isValid: true,
          belongsToDomain: true,
          message: `Topic "${topic.name}" is part of ${profession.name} > ${subProf.name} > ${subject.name}.`
        };
      }
    }
  }

  // Topic not found in this profession - find which profession it belongs to
  for (const prof of professions) {
    if (prof.id === professionId) continue;
    for (const subProf of prof.subProfessions) {
      for (const subject of subProf.subjects) {
        const topic = subject.topics.find(t => t.id === topicId);
        if (topic) {
          return {
            isValid: false,
            belongsToDomain: false,
            message: `This topic belongs to ${prof.name}, not ${profession.name}. Please select a topic from your chosen professional domain.`,
            suggestedRedirect: `/curriculum`
          };
        }
      }
    }
  }

  // Topic not found anywhere - allow it (could be custom or AI-generated)
  return {
    isValid: true,
    belongsToDomain: true,
    message: 'Topic accepted for current domain.'
  };
}

/**
 * Check if a query is related to the current domain
 */
export function isQueryWithinDomain(
  query: string,
  domainContext: DomainContext
): { isWithinDomain: boolean; confidence: number; reason: string } {
  const lowerQuery = query.toLowerCase();
  
  // Check for explicit cross-domain indicators (e.g., "how to cook pasta")
  for (const indicator of CROSS_DOMAIN_INDICATORS) {
    if (lowerQuery.includes(indicator)) {
      return {
        isWithinDomain: false,
        confidence: 0.95,
        reason: `Query appears unrelated to ${domainContext.professionName}. This looks like a general question outside your current learning domain.`
      };
    }
  }

  // Check if query contains domain keywords
  const domainMatches = domainContext.domainKeywords.filter(kw => 
    lowerQuery.includes(kw.toLowerCase())
  ).length;

  const relatedMatches = domainContext.relatedTerms.filter(term => 
    lowerQuery.includes(term.toLowerCase())
  ).length;

  // Check if query mentions current topic or subject
  const mentionsCurrentContext = 
    (domainContext.topicName && lowerQuery.includes(domainContext.topicName.toLowerCase())) ||
    (domainContext.subjectName && lowerQuery.includes(domainContext.subjectName.toLowerCase())) ||
    (domainContext.subProfessionName && lowerQuery.includes(domainContext.subProfessionName.toLowerCase()));

  // Calculate relevance score
  const totalKeywords = domainContext.domainKeywords.length + domainContext.relatedTerms.length;
  const totalMatches = domainMatches + relatedMatches;
  const relevanceScore = totalKeywords > 0 ? totalMatches / Math.sqrt(totalKeywords) : 0;

  // Contextual questions (this, that, explain more) are always in-domain during lessons
  const contextualPatterns = [
    /^(what|why|how|when|where|can you|could you|explain|tell me|show me)/i,
    /(this|that|the|it)\s+(concept|topic|section|part|idea)/i,
    /more (about|on|detail)/i,
    /don't understand/i,
    /confused about/i
  ];
  
  const isContextualQuestion = contextualPatterns.some(p => p.test(query));

  // Decision logic
  if (mentionsCurrentContext || relevanceScore > 0.3) {
    return {
      isWithinDomain: true,
      confidence: Math.min(0.95, 0.7 + relevanceScore),
      reason: 'Query is relevant to current learning context.'
    };
  }

  if (isContextualQuestion && domainContext.topicName) {
    return {
      isWithinDomain: true,
      confidence: 0.85,
      reason: 'Contextual question during active lesson.'
    };
  }

  if (domainMatches > 0) {
    return {
      isWithinDomain: true,
      confidence: 0.7 + (domainMatches * 0.05),
      reason: `Query contains ${domainContext.professionName}-related terms.`
    };
  }

  // Unknown - could be either. Allow but with lower confidence
  return {
    isWithinDomain: true,
    confidence: 0.5,
    reason: 'Query relevance uncertain, processing within current domain context.'
  };
}

/**
 * Get domain-specific system prompt for AI
 */
export function getDomainSystemPrompt(domainContext: DomainContext): string {
  const { professionName, subProfessionName, subjectName, topicName } = domainContext;
  
  let contextPath = professionName;
  if (subProfessionName) contextPath += ` > ${subProfessionName}`;
  if (subjectName) contextPath += ` > ${subjectName}`;
  if (topicName) contextPath += ` > ${topicName}`;

  return `You are an expert AI tutor specializing in ${professionName}.

CRITICAL DOMAIN CONSTRAINTS:
1. You MUST stay strictly within the ${professionName} domain for all explanations and examples.
2. Current learning context: ${contextPath}
3. All responses must be relevant to ${subProfessionName || professionName}.
4. Use only examples, analogies, and terminology appropriate for ${professionName} professionals.
5. If asked about topics outside ${professionName}, politely redirect the user back to their current learning path.

DOMAIN-SPECIFIC GUIDELINES for ${professionName}:
${getDomainSpecificGuidelines(domainContext.professionId)}

When the user asks about something unrelated to ${professionName}:
- Acknowledge the question briefly
- Explain that you're focused on ${professionName} content
- Offer to help with a ${professionName}-related question instead
- Suggest how the user might find answers elsewhere for off-topic questions`;
}

/**
 * Get domain-specific teaching guidelines
 */
function getDomainSpecificGuidelines(professionId: string): string {
  const guidelines: Record<string, string> = {
    medicine: `- Use clinical terminology appropriately
- Reference evidence-based practices
- Include relevant anatomical or physiological context
- Mention common clinical scenarios when helpful
- Prioritize patient safety in all advice`,

    engineering: `- Emphasize practical implementation details
- Include code examples when relevant
- Explain trade-offs in design decisions
- Reference industry best practices
- Focus on problem-solving approaches`,

    law: `- Reference relevant legal principles and precedents
- Explain both theory and practical application
- Note jurisdictional differences when relevant
- Emphasize ethical considerations
- Use appropriate legal terminology`,

    business: `- Connect concepts to real-world business scenarios
- Include financial implications when relevant
- Reference market dynamics and competition
- Focus on actionable insights
- Emphasize strategic thinking`,

    science: `- Explain underlying principles and theories
- Include mathematical formulations when appropriate
- Reference experimental evidence
- Connect to real-world phenomena
- Maintain scientific accuracy`,

    arts: `- Discuss historical and cultural context
- Reference specific works and artists
- Explain techniques and methods
- Connect to broader artistic movements
- Encourage creative interpretation`,

    technology: `- Include technical implementation details
- Reference current best practices and tools
- Explain security implications when relevant
- Connect to industry trends
- Focus on practical applications`,

    education: `- Apply pedagogical principles
- Include assessment strategies
- Reference learning theories
- Adapt to different learning styles
- Focus on practical classroom application`,

    psychology: `- Use appropriate psychological terminology
- Reference research and theories
- Include practical therapeutic applications
- Maintain ethical sensitivity
- Connect to real-world mental health scenarios`
  };

  return guidelines[professionId] || '- Provide accurate, domain-relevant information\n- Use appropriate professional terminology\n- Include practical examples';
}

/**
 * Find which profession a topic belongs to
 */
export function findTopicProfession(topicId: string): {
  profession: Profession;
  subProfession: SubProfession;
  subject: Subject;
  topic: Topic;
} | null {
  for (const profession of professions) {
    for (const subProfession of profession.subProfessions) {
      for (const subject of subProfession.subjects) {
        const topic = subject.topics.find(t => t.id === topicId);
        if (topic) {
          return { profession, subProfession, subject, topic };
        }
      }
    }
  }
  return null;
}

/**
 * Get all topics for a profession
 */
export function getTopicsForProfession(professionId: string): Topic[] {
  const profession = professions.find(p => p.id === professionId);
  if (!profession) return [];

  const topics: Topic[] = [];
  for (const subProfession of profession.subProfessions) {
    for (const subject of subProfession.subjects) {
      topics.push(...subject.topics);
    }
  }
  return topics;
}
