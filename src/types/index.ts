// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole = 'student' | 'teacher' | 'admin';
export type SubscriptionPlan = 'simple' | 'pro' | 'enterprise';

export interface User {
    id: string;
    email: string;
    name: string;
    displayName?: string;
    avatar?: string;
    authMethod: 'google' | 'apple' | 'email' | 'guest';
    isVerified: boolean;
    role: UserRole;
    plan: SubscriptionPlan;
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isGuest: boolean;
}

// ============================================
// PROFILE TYPES
// ============================================

export interface LearningStyle {
    visual: number; // 0-100
    auditory: number;
    kinesthetic: number;
    preferredPace: 'slow' | 'normal' | 'fast';
    interactivityLevel: 'low' | 'medium' | 'high';
}

export interface LearningPreferences {
    teachingStyle: 'professional' | 'friendly' | 'mentor' | 'strict';
    explanationDepth: 'basic' | 'comprehensive' | 'detailed' | 'expert';
    sessionLength: 'short' | 'medium' | 'long';
    quizFrequency: 'after_concept' | 'after_topic' | 'end_of_session';
    reviewStrategy: 'spaced_repetition' | 'immediate' | 'weekly';
}

export interface UserProfile {
    userId: string;
    name: string;
    email: string;
    displayName: string;
    avatar?: string;
    title?: string;
    organization?: string;
    location?: string;
    timezone: string;

    // Role and subscription
    role: UserRole;
    plan: SubscriptionPlan;
    onboardingCompleted: boolean;

    // Professional info
    profession: Profession | null;
    subProfession: string | null;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    verificationStatus: 'none' | 'pending' | 'verified';
    subject?: string;
    currentTopic?: string;

    // Learning profile
    learningStyle: LearningStyle;
    learningPreferences: LearningPreferences;
    learningGoals: string[];
    weeklyCommitmentHours: number;

    // Stats
    totalLearningHours: number;
    topicsCompleted: number;
    currentStreak: number;
    longestStreak: number;
}

// ============================================
// PROFESSION & CONTENT TYPES
// ============================================

export interface Profession {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    subProfessions: SubProfession[];
}

export interface SubProfession {
    id: string;
    name: string;
    description: string;
    subjects: Subject[];
}

export interface Subject {
    id: string;
    name: string;
    icon: string;
    topics: Topic[];
}

export interface Topic {
    id: string;
    name: string;
    description?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    durationMinutes?: number;
    duration?: string;
    progress?: number;
    prerequisites?: string[];
    objectives?: string[];
}

// ============================================
// SCHOOL CURRICULUM TYPES
// ============================================

export type GradeLevel = 'primary' | 'middle' | 'secondary' | 'senior-secondary';

export interface SchoolGrade {
    id: string;
    name: string;
    gradeNumber: number;
    level: GradeLevel;
    ageGroup: string;
    description: string;
    color: string;
    subjects: SchoolSubject[];
}

export interface SchoolSubject {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    chapters: Chapter[];
}

export interface Chapter {
    id: string;
    name: string;
    chapterNumber: number;
    description?: string;
    topics: Topic[];
}

export interface CurriculumProgress {
    gradeId: string;
    subjectId: string;
    chapterId?: string;
    topicId?: string;
    completedTopics: string[];
    totalTopics: number;
    progressPercent: number;
    lastAccessedAt: string;
}

// ============================================
// TEACHING TYPES
// ============================================

export interface TeachingStep {
    id: string;
    stepNumber: number;
    title: string;
    content: string;
    spokenContent: string;
    visualType: 'diagram' | 'text' | 'animation' | 'quiz' | 'interactive' | '3d-model';
    visualData?: Record<string, unknown>;
    durationSeconds: number;
    completed: boolean;

    // Enhanced content fields
    complexity?: 'basic' | 'intermediate' | 'advanced';
    estimatedMinutes?: number;
    realWorldExamples?: string[];
    keyConcepts?: string[];
    subConcepts?: string[];
    practicalApplications?: string[];
}

export interface TeachingSession {
    id: string;
    userId: string;
    topicId: string;
    topicName: string;
    startTime: string;
    endTime?: string;
    status: 'active' | 'paused' | 'completed' | 'abandoned';
    currentStep: number;
    totalSteps: number;
    progress: number;
    teachingSteps: TeachingStep[];
    doubts: Doubt[];
    /** Professional domain context for strict domain isolation */
    professionId?: string;
    professionName?: string;
    subProfessionId?: string;
    subProfessionName?: string;
    subjectId?: string;
    subjectName?: string;
}

export interface TeachingState {
    currentSession: TeachingSession | null;
    currentStep: number;
    isPaused: boolean;
    isInDoubtMode: boolean;
    isSpeaking: boolean;
    collaborators: Collaborator[];
    isScreenSharing: boolean;
}

export interface Collaborator {
    id: string;
    name: string;
    avatar?: string;
    cursorPosition?: { x: number; y: number };
    isActive: boolean;
}

// ============================================
// DOUBT & CHAT TYPES
// ============================================

export interface Doubt {
    id: string;
    sessionId: string;
    question: string;
    timestamp: string;
    context: {
        stepNumber: number;
        stepTitle: string;
        visualState?: string;
    };
    resolution?: DoubtResolution;
    status: 'pending' | 'resolving' | 'resolved';
}

export interface DoubtResolution {
    explanation: string;
    visualAids?: string[];
    examples?: string[];
    quizQuestion?: QuizQuestion;
    resolvedAt: string;
    understandingConfirmed: boolean;
}

export interface ChatMessage {
    id: string;
    type: 'user' | 'ai' | 'system';
    content: string;
    timestamp: string;
    attachments?: Attachment[];
    /** True when AI failed or returned empty; show retry-friendly UI. */
    isError?: boolean;
}

export interface Attachment {
    id: string;
    type: 'image' | 'document' | 'link';
    name: string;
    url: string;
}

// ============================================
// RESOURCE TYPES
// ============================================

export interface GeneratedNote {
    id: string;
    sessionId: string;
    topicName: string;
    title: string;
    content: string;
    sections: NoteSection[];
    userDoubts: string[];
    createdAt: string;
    qualityScore?: number;
}

export interface NoteSection {
    heading: string;
    content: string;
    highlights: string[];
}

export interface MindMapNode {
    id: string;
    label: string;
    description?: string;
    type: 'central' | 'category' | 'concept' | 'detail';
    color: string;
    icon?: string;
    children: MindMapNode[];
    connections?: { targetId: string; label?: string }[];
}

export interface MindMap {
    id: string;
    sessionId: string;
    topicName: string;
    centralTopic: string;
    nodes: MindMapNode[];
    createdAt: string;
}

export interface Flashcard {
    id: string;
    sessionId: string;
    question: string;
    answer: string;
    explanation?: string;
    hint?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];

    // Spaced repetition
    nextReviewDate: string;
    intervalDays: number;
    easeFactor: number;
    repetitions: number;
    lastPerformance?: 'again' | 'hard' | 'good' | 'easy';
}

export interface QuizQuestion {
    id: string;
    question: string;
    type: 'multiple_choice' | 'true_false' | 'fill_blank';
    options?: string[];
    correctAnswer: string | number;
    explanation: string;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface AppSettings {
    // Account
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';

    // Notifications
    notifications: {
        studyReminders: boolean;
        reminderTime: string;
        goalAchievements: boolean;
        reviewReminders: boolean;
        emailDigest: 'none' | 'daily' | 'weekly';
    };

    // Accessibility
    accessibility: {
        fontSize: 'small' | 'medium' | 'large' | 'xlarge';
        highContrast: boolean;
        reduceAnimations: boolean;
        textToSpeech: boolean;
        ttsSpeed: number;
        ttsVoice: string;
    };

    // Privacy
    privacy: {
        analyticsEnabled: boolean;
        shareProgress: boolean;
        dataRetentionMonths: number;
    };

    // AI Tutor
    aiTutor: {
        personality: 'encouraging' | 'direct' | 'humorous' | 'formal';
        responseStyle: 'concise' | 'detailed' | 'interactive' | 'adaptive';
        analogiesEnabled: boolean;
        clinicalExamplesEnabled: boolean;
        /** Preferred AI model for chat, doubts, and studio (notes/mind map/flashcards). Default: llama. */
        preferredAiModel?: 'llama' | 'mistral';
    };
}

/** AI model type used by backend and frontend API. */
export type AiModelType = 'llama' | 'mistral';

export interface SettingsTemplate {
    id: string;
    name: string;
    description: string;
    settings: Partial<AppSettings>;
    isBuiltIn: boolean;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface SessionAnalytics {
    sessionId: string;
    date: string;
    durationMinutes: number;
    topicId: string;
    completionPercentage: number;
    doubtsCount: number;
    quizScore?: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    progress?: number;
    target?: number;
}

export interface ProgressMetrics {
    totalHours: number;
    topicsCompleted: number;
    averageQuizScore: number;
    knowledgeRetention: number;
    weeklyHours: number[];
    streakDays: number;
}
