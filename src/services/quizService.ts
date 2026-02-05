/**
 * Quiz Generation Service
 * 
 * Generates quizzes dynamically aligned with current topics,
 * supports multiple question types, and tracks performance.
 */

import { generateContent, type AiModelType } from './aiApi';
import { useSettingsStore } from '../stores/settingsStore';

// ============================================================================
// Types
// ============================================================================

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  subject: string;
  questions: QuizQuestion[];
  totalPoints: number;
  timeLimit?: number; // in minutes
  createdAt: string;
}

export interface QuizAttempt {
  quizId: string;
  answers: Record<string, string | number>;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in seconds
  completedAt: string;
}

export interface QuizConfig {
  topic: string;
  subject?: string;
  content?: string[];
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  questionTypes?: QuizQuestion['type'][];
  timeLimit?: number;
}

// ============================================================================
// Quiz Generation
// ============================================================================

/**
 * Generate a quiz for a specific topic using AI
 */
export async function generateQuiz(config: QuizConfig): Promise<Quiz> {
  const {
    topic,
    subject = 'General',
    content = [],
    numberOfQuestions = 5,
    difficulty = 'mixed',
    // questionTypes is reserved for future use (currently only multiple_choice supported)
    questionTypes: _questionTypes = ['multiple_choice'], // eslint-disable-line @typescript-eslint/no-unused-vars
    timeLimit,
  } = config;

  const model: AiModelType = useSettingsStore.getState().settings.aiTutor?.preferredAiModel ?? 'llama';
  
  const contextText = content.length > 0 
    ? `\n\nContext material:\n${content.slice(0, 3).join('\n\n').slice(0, 2000)}`
    : '';

  const difficultyInstruction = difficulty === 'mixed'
    ? 'Include a mix of easy, medium, and hard questions.'
    : `All questions should be ${difficulty} difficulty.`;

  const prompt = `Generate a quiz for the topic "${topic}" in ${subject}.
  
Requirements:
- Generate exactly ${numberOfQuestions} multiple choice questions
- ${difficultyInstruction}
- Each question must have 4 options (A, B, C, D)
- Include clear explanations for correct answers
- Questions should test understanding, not just memorization
${contextText}

Respond with ONLY a valid JSON array in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why this is correct",
    "difficulty": "easy"
  }
]

Important: correctAnswer is a 0-based index (0 for A, 1 for B, etc.)`;

  try {
    const { content: aiResponse } = await generateContent(prompt, model);
    
    // Parse the JSON response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz response');
    }

    const parsedQuestions = JSON.parse(jsonMatch[0]);
    
    const questions: QuizQuestion[] = parsedQuestions.map((q: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
      difficulty: string;
    }, index: number) => ({
      id: `q_${Date.now()}_${index}`,
      type: 'multiple_choice' as const,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: (['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium') as 'easy' | 'medium' | 'hard',
      topic,
      points: q.difficulty === 'easy' ? 1 : q.difficulty === 'hard' ? 3 : 2,
    }));

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return {
      id: `quiz_${Date.now()}`,
      title: `${topic} Quiz`,
      topic,
      subject,
      questions,
      totalPoints,
      timeLimit,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to generate quiz:', error);
    // Return fallback quiz
    return generateFallbackQuiz(config);
  }
}

/**
 * Generate a fallback quiz when AI generation fails
 */
function generateFallbackQuiz(config: QuizConfig): Quiz {
  const { topic, subject = 'General', numberOfQuestions = 5 } = config;
  
  const questions: QuizQuestion[] = Array.from({ length: numberOfQuestions }, (_, i) => ({
    id: `q_fallback_${Date.now()}_${i}`,
    type: 'multiple_choice' as const,
    question: `Question ${i + 1} about ${topic}: What is an important concept related to ${topic}?`,
    options: [
      'Understanding fundamental principles',
      'Memorizing random facts',
      'Skipping important details',
      'Ignoring practical applications',
    ],
    correctAnswer: 0,
    explanation: `Understanding fundamental principles is key to mastering ${topic}.`,
    difficulty: (i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard') as 'easy' | 'medium' | 'hard',
    topic,
    points: i % 3 === 0 ? 1 : i % 3 === 2 ? 3 : 2,
  }));

  return {
    id: `quiz_fallback_${Date.now()}`,
    title: `${topic} Quiz`,
    topic,
    subject,
    questions,
    totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// Quiz Evaluation
// ============================================================================

/**
 * Evaluate quiz answers and calculate score
 */
export function evaluateQuiz(
  quiz: Quiz,
  answers: Record<string, string | number>
): QuizAttempt {
  let score = 0;

  for (const question of quiz.questions) {
    const userAnswer = answers[question.id];
    if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
      score += question.points;
    }
  }

  const percentage = Math.round((score / quiz.totalPoints) * 100);

  return {
    quizId: quiz.id,
    answers,
    score,
    totalPoints: quiz.totalPoints,
    percentage,
    timeSpent: 0, // To be set by the caller
    completedAt: new Date().toISOString(),
  };
}

/**
 * Get question by ID from a quiz
 */
export function getQuestionById(quiz: Quiz, questionId: string): QuizQuestion | undefined {
  return quiz.questions.find((q) => q.id === questionId);
}

/**
 * Check if an answer is correct
 */
export function isAnswerCorrect(
  question: QuizQuestion,
  answer: string | number
): boolean {
  return answer === question.correctAnswer;
}

// ============================================================================
// Quiz Templates by Subject
// ============================================================================

const SUBJECT_QUESTION_TEMPLATES: Record<string, {
  easy: string[];
  medium: string[];
  hard: string[];
}> = {
  mathematics: {
    easy: [
      'What is the basic formula for {concept}?',
      'Which of the following is a property of {concept}?',
      'How do you identify a {concept}?',
    ],
    medium: [
      'When solving problems involving {concept}, what is the first step?',
      'How does {concept} relate to {relatedConcept}?',
      'What is the significance of {concept} in real-world applications?',
    ],
    hard: [
      'Given a complex scenario involving {concept}, how would you approach the solution?',
      'What are the limitations of using {concept} in advanced problems?',
      'How can {concept} be extended to solve {advancedTopic}?',
    ],
  },
  science: {
    easy: [
      'What is the definition of {concept}?',
      'Which of the following is an example of {concept}?',
      'What causes {phenomenon}?',
    ],
    medium: [
      'How does {concept} affect {relatedConcept}?',
      'What is the process of {phenomenon}?',
      'Compare and contrast {concept} with {relatedConcept}.',
    ],
    hard: [
      'Analyze the implications of {concept} on {system}.',
      'How would a change in {variable} affect {outcome}?',
      'Evaluate the evidence for {theory}.',
    ],
  },
  language: {
    easy: [
      'What is the meaning of {word}?',
      'Identify the {grammarConcept} in the sentence.',
      'What is the correct form of {word}?',
    ],
    medium: [
      'What is the theme of {literaryWork}?',
      'How does the author use {literaryDevice}?',
      'What is the tone of this passage?',
    ],
    hard: [
      'Analyze the symbolism in {literaryWork}.',
      'How does {character} develop throughout the story?',
      'Compare the styles of {author1} and {author2}.',
    ],
  },
};

/**
 * Generate topic-specific quiz questions based on templates
 */
export function generateTemplatedQuestions(
  topic: string,
  subject: string,
  count: number = 5
): QuizQuestion[] {
  const templates = SUBJECT_QUESTION_TEMPLATES[subject.toLowerCase()] || SUBJECT_QUESTION_TEMPLATES.science;
  
  const questions: QuizQuestion[] = [];
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[i % 3];
    const templatePool = templates[difficulty];
    const template = templatePool[i % templatePool.length];
    
    const questionText = template
      .replace('{concept}', topic)
      .replace('{phenomenon}', topic)
      .replace('{relatedConcept}', 'related principles')
      .replace('{advancedTopic}', 'advanced problems');

    questions.push({
      id: `template_${Date.now()}_${i}`,
      type: 'multiple_choice',
      question: questionText,
      options: [
        'Understanding the core principles',
        'Memorizing without understanding',
        'Skipping fundamentals',
        'Ignoring practice',
      ],
      correctAnswer: 0,
      explanation: `Understanding the core principles is essential for mastering ${topic}.`,
      difficulty,
      topic,
      points: difficulty === 'easy' ? 1 : difficulty === 'hard' ? 3 : 2,
    });
  }

  return questions;
}

// ============================================================================
// Export
// ============================================================================

export const quizService = {
  generateQuiz,
  evaluateQuiz,
  getQuestionById,
  isAnswerCorrect,
  generateTemplatedQuestions,
};

export default quizService;
