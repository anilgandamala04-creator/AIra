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

    // Curriculum Selection (New)
    curriculumType?: 'school' | 'competitive' | null;
    board?: SchoolBoard | null;
    grade?: string | null;
    exam?: ExamType | null;
    subject?: string | null;
    currentTopic?: string | null;
    /** Competitive mode: include Previous Year Question Papers (last 10 years) in practice */
    includePYQ?: boolean;

    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    verificationStatus: 'none' | 'pending' | 'verified';

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

    /** Topic IDs the user bookmarked for quick access. */
    favoriteTopicIds?: string[];
}

// ============================================
// CURRICULUM & CONTENT TYPES
// ============================================

export type CurriculumType = 'school' | 'competitive';
export type SchoolBoard = 'Telangana State Board' | 'Andhra Pradesh State Board' | 'CBSE' | 'ICSE';
export type ExamType = 'JEE Main' | 'NEET' | 'EAMCET' | 'GATE' | 'IIT';

export interface Subject {
    id: string;
    name: string;
    icon: string;
    topics: Topic[];
    board?: SchoolBoard;
    grade?: string;
    exam?: ExamType;
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
    visualType?: 'diagram' | 'animation' | '3d-model' | 'video-aid' | 'interactive' | 'technical';
    visualPrompt?: string;
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
    visualType: 'diagram' | 'text' | 'animation' | 'quiz' | 'interactive' | '3d-model' | 'technical';
    visualPrompt?: string;
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

    // Curriculum context
    curriculumType?: CurriculumType;
    board?: SchoolBoard;
    grade?: string;
    exam?: ExamType;
    subjectId?: string;
    subjectName?: string;
    visualType?: string;
    visualPrompt?: string;
}

export interface StepBookmark {
    id: string;
    topicId: string;
    topicName: string;
    stepIndex: number;
    stepTitle: string;
    createdAt: string;
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
    visualType?: string;
    visualPrompt?: string;
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
    /** User feedback on AI response for quality tracking. */
    feedback?: 'helpful' | 'not_helpful' | null;
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
    /** Pinned notes appear first in the list. */
    pinned?: boolean;
    /** Archived notes are hidden from the main list; show in "Archived" filter. */
    archived?: boolean;
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
    /** Optional deck for grouping; filter Review by deck. */
    deckId?: string;
    deckName?: string;

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
    visualType?: string;
    visualPrompt?: string;
}

// ============================================
// SETTINGS TYPES
// ============================================

export type AccentColor = 'purple' | 'blue' | 'green' | 'amber' | 'rose';

export interface AppSettings {
    // Account
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
    /** Optional: auto dark after hour (0-23). E.g. 20 = dark after 8pm. Only used when theme is 'system' or when theme is 'auto-time'. */
    themeDarkAfterHour?: number;
    /** User-picked accent for buttons/links. Default purple. */
    accentColor?: AccentColor;

    // Notifications
    notifications: {
        studyReminders: boolean;
        reminderTime: string;
        /** Per-day reminder times, e.g. { mon: '19:00', tue: '19:00' }. Overrides reminderTime when set. */
        reminderSchedule?: Record<string, string>;
        goalAchievements: boolean;
        reviewReminders: boolean;
        emailDigest: 'none' | 'daily' | 'weekly';
        /** Daily study goal in minutes (e.g. 20 or 30). 0 = off. */
        dailyStudyGoalMinutes: number;
    };

    // Accessibility
    accessibility: {
        fontSize: 'small' | 'medium' | 'large' | 'xlarge';
        /** Font family: system, serif, or dyslexia-friendly (OpenDyslexic-style). */
        fontFamily?: 'system' | 'serif' | 'dyslexia';
        /** Line spacing / reading density for notes, steps, chat. */
        lineSpacing?: 'compact' | 'default' | 'comfortable';
        highContrast: boolean;
        reduceAnimations: boolean;
        textToSpeech: boolean;
        ttsSpeed: number;
        ttsVoice: string;
        /** Show captions/subtitles synchronized with TTS. */
        showCaptions?: boolean;
    };

    // Privacy
    privacy: {
        analyticsEnabled: boolean;
        /** If true, send minimal error reports (no PII) for debugging and stability. */
        errorReportingEnabled?: boolean;
        shareProgress: boolean;
        dataRetentionMonths: number;
    };

    // AI Tutor
    aiTutor: {
        personality: 'encouraging' | 'direct' | 'humorous' | 'formal';
        responseStyle: 'concise' | 'detailed' | 'interactive' | 'adaptive';
        analogiesEnabled: boolean;
        /** Preferred AI model for chat, doubts, and studio (notes/mind map/flashcards). Default: llama. */
        preferredAiModel?: 'llama' | 'mistral';
    };

    /** Quiz behavior: when to show correct answer and explanation */
    quiz?: {
        showCorrectAnswer: 'after_each' | 'at_end';
    };

    /** Topic IDs the user asked to be notified when content is ready (coming-soon topics). */
    notifyWhenTopicReady?: string[];
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
    totalXp: number;
    level: number;
}

// ============================================
// DASHBOARD / ROSTER TYPES (Admin & Teacher)
// ============================================

export interface Section {
    id: string;
    grade: string;
    sectionLabel: string;
    name?: string;
}

export interface RosterEntry {
    sectionId: string;
    studentId: string;
    studentName?: string;
}

export interface TeacherSubjectAssignment {
    teacherId: string;
    teacherName: string;
    subject: string;
    sectionId: string;
    sectionLabel?: string;
    avgScore?: number;
}

export interface AdminTeacherSubjectRow {
    teacherId: string;
    teacherName: string;
    subject: string;
    section: string;
    avgScore: number;
}

export interface AdminStudentTrendRow {
    period: string;
    avgScore: number;
}

export interface AdminCrossClassRow {
    section: string;
    subject: string;
    avgScore: number;
    trend: 'up' | 'down' | 'stable';
}

export interface AdminSystemicTopicRow {
    topic: string;
    sectionsWeak: number;
    totalSections: number;
    note: string;
}

export interface TeacherTopicWeaknessRow {
    topicId: string;
    name: string;
    weakCount: number;
    total: number;
    pctWeak: number;
}

export interface TeacherStudentRow {
    id: string;
    name: string;
    weakSubjects: string[];
    weakTopics: string[];
    errorPattern: 'conceptual' | 'careless';
    level?: number;
    totalXp?: number;
}

export interface TeacherHeatmapRow {
    studentName: string;
    scores: number[];
}

// ============================================
// EXTENDED ANALYTICS TYPES
// ============================================

export interface TeacherAnalyticsSummary {
    avgScore: number;
    engagementScore: number; // 0-100
    participationRate: number; // 0-100
    assignmentCompletion: number; // 0-100
    trend: 'improving' | 'declining' | 'stable';
}

export interface TeacherNudge {
    id: string;
    type: 'warning' | 'celebration' | 'suggestion';
    message: string;
    priority: 'low' | 'medium' | 'high';
    actionLabel?: string;
}
export interface StudentAnalyticsDetail extends TeacherStudentRow {
    attendance: number;
    lastActive: string;
    scoreTrend: number[];
    topicMastery: { topicId: string; name: string; score: number }[];
    engagementTrend: number[];
    level?: number;
    totalXp?: number;
}

export interface AdminSubjectSummary {
    subject: string;
    avgScore: number;
    studentsCount: number;
    teachersCount: number;
    completionPercent: number;
    curriculumCoverage: number; // 0-100
    teacherEfficiency: number; // 0-100
    systemicConcerns: number; // Count of identified systemic issues
    systemicIssue?: string;
    avgLevel?: number;
    totalXp?: number;
}

export interface TeacherEffectiveness {
    teacherId: string;
    teacherName: string;
    avgScore: number;
    improvementTrend: number; // percentage points change
    classEngagement: number;
    participationRate: number;
    workloadIndex: number; // 0-100
}
