import { create } from 'zustand';
import type {
    UserProfile,
    LearningStyle,
    LearningPreferences,
    CurriculumType,
    SchoolBoard,
    ExamType
} from '../types';
import { useAuthStore } from './authStore';
import { updateUserProfileWithOfflineQueue as syncProfileToBackend } from '../services/backendWithOffline';
import { realTimeEvents, EVENTS } from '../utils/realTimeSync';

interface UserStore {
    profile: UserProfile | null;
    onboardingStep: number;

    // New Curriculum State
    curriculumType: CurriculumType | null;
    selectedBoard: SchoolBoard | null;
    selectedGrade: string | null;
    selectedExam: ExamType | null;
    selectedSubject: string | null;
    /** Competitive mode: include PYQ (last 10 years). */
    includePYQ: boolean;

    /** True after first user-data load from backend (avoids wrong redirect to onboarding on refresh). */
    userDataLoaded: boolean;

    // Actions
    setProfile: (profile: UserProfile) => void;
    setUserDataLoaded: (loaded: boolean) => void;
    setGuestDemoProfile: (userId: string, displayName: string) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    setOnboardingStep: (step: number) => void;

    // New Curriculum Actions
    setCurriculumType: (type: CurriculumType | null) => void;
    setSelectedBoard: (board: SchoolBoard | null) => void;
    setSelectedGrade: (grade: string | null) => void;
    setSelectedExam: (exam: ExamType | null) => void;
    setSelectedSubject: (subject: string | null) => void;
    setIncludePYQ: (value: boolean) => void;

    updateLearningStyle: (style: Partial<LearningStyle>) => void;
    updateLearningPreferences: (prefs: Partial<LearningPreferences>) => void;
    completeOnboarding: (overrides?: Partial<UserProfile>) => void;
    resetOnboarding: () => void;
    clearProfile: () => void;
    toggleFavoriteTopic: (topicId: string) => void;
}

const defaultLearningStyle: LearningStyle = {
    visual: 70,
    auditory: 20,
    kinesthetic: 10,
    preferredPace: 'normal',
    interactivityLevel: 'medium',
};

const defaultLearningPreferences: LearningPreferences = {
    teachingStyle: 'friendly',
    explanationDepth: 'comprehensive',
    sessionLength: 'medium',
    quizFrequency: 'after_topic',
    reviewStrategy: 'spaced_repetition',
};

function syncProfileIfLoggedIn(profile: UserProfile | null) {
    const { user, isGuest } = useAuthStore.getState();
    if (user?.id && !isGuest && profile) {
        syncProfileToBackend(user.id, profile).catch((e) => console.error('Backend sync profile:', e));
    }
}

export const useUserStore = create<UserStore>()((set) => ({
    profile: null,
    onboardingStep: 0,

    // New Curriculum State
    curriculumType: null,
    selectedBoard: null,
    selectedGrade: null,
    selectedExam: null,
    selectedSubject: null,
    includePYQ: false,

    userDataLoaded: false,

    setUserDataLoaded: (loaded) => set({ userDataLoaded: loaded }),

    setProfile: (profile) => {
        set(() => {
            const updates: Partial<UserStore> = { profile };

            // Sync new curriculum fields
            if (profile) {
                updates.curriculumType = profile.curriculumType || null;
                updates.selectedBoard = profile.board || null;
                updates.selectedGrade = profile.grade || null;
                updates.selectedExam = profile.exam || null;
                updates.selectedSubject = profile.subject || null;
                updates.includePYQ = profile.includePYQ ?? false;
            }

            syncProfileIfLoggedIn(profile);
            return updates;
        });
    },

    updateProfile: (updates) => set((state) => {
        const next = state.profile ? { ...state.profile, ...updates } : null;
        syncProfileIfLoggedIn(next);

        const result: Partial<UserStore> = { profile: next };
        // Keep top-level curriculum state in sync so all screens reflect immediately
        if (updates.curriculumType !== undefined) result.curriculumType = updates.curriculumType ?? null;
        if (updates.board !== undefined) result.selectedBoard = updates.board ?? null;
        if (updates.grade !== undefined) result.selectedGrade = updates.grade ?? null;
        if (updates.exam !== undefined) result.selectedExam = updates.exam ?? null;
        if (updates.subject !== undefined) result.selectedSubject = updates.subject ?? null;
        if (updates.includePYQ !== undefined) result.includePYQ = updates.includePYQ ?? false;

        if (next) realTimeEvents.emit(EVENTS.PROFILE_UPDATE, next);
        return result;
    }),

    setOnboardingStep: (step) => set({ onboardingStep: step }),

    // Curriculum actions: update both top-level state and profile so the entire app reflects changes immediately (no refresh)
    setCurriculumType: (type) => set((state) => {
        // Reset mode-specific fields when type changes to prevent cross-mode leak
        const isChanging = state.curriculumType !== type;
        const updates: Partial<UserStore> = {
            curriculumType: type,
            profile: state.profile ? {
                ...state.profile,
                curriculumType: type ?? undefined,
                // Reset mode-specific profile fields if type changed
                ...(isChanging ? { board: undefined, grade: undefined, exam: undefined, subject: undefined, includePYQ: false } : {})
            } : null,
        };

        if (isChanging) {
            updates.selectedBoard = null;
            updates.selectedGrade = null;
            updates.selectedExam = null;
            updates.selectedSubject = null;
            updates.includePYQ = false;
        }

        return updates;
    }),
    setSelectedBoard: (board) => set((state) => ({
        selectedBoard: board,
        profile: state.profile ? { ...state.profile, board: board ?? undefined } : null,
    })),
    setSelectedGrade: (grade) => set((state) => ({
        selectedGrade: grade,
        profile: state.profile ? { ...state.profile, grade: grade ?? undefined } : null,
    })),
    setSelectedExam: (exam) => set((state) => ({
        selectedExam: exam,
        profile: state.profile ? { ...state.profile, exam: exam ?? undefined } : null,
    })),
    setSelectedSubject: (subject) => set((state) => ({
        selectedSubject: subject,
        profile: state.profile ? { ...state.profile, subject: subject ?? undefined } : null,
    })),
    setIncludePYQ: (value) => set((state) => ({
        includePYQ: value,
        profile: state.profile ? { ...state.profile, includePYQ: value } : null,
    })),

    updateLearningStyle: (style) => set((state) => {
        const next = state.profile ? {
            ...state.profile,
            learningStyle: { ...state.profile.learningStyle, ...style },
        } : null;
        syncProfileIfLoggedIn(next);
        return { profile: next };
    }),

    updateLearningPreferences: (prefs) => set((state) => {
        const next = state.profile ? {
            ...state.profile,
            learningPreferences: { ...state.profile.learningPreferences, ...prefs },
        } : null;
        syncProfileIfLoggedIn(next);
        return { profile: next };
    }),

    completeOnboarding: (overrides) => set((state) => {
        const authUserId = useAuthStore.getState().user?.id;
        const authUser = useAuthStore.getState().user;

        // Build the complete profile with all onboarding data.
        const profileData = {
            curriculumType: state.curriculumType,
            board: state.selectedBoard,
            grade: state.selectedGrade,
            exam: state.selectedExam,
            subject: state.selectedSubject,
            currentTopic: state.profile?.currentTopic,
            includePYQ: state.includePYQ,
            onboardingCompleted: true,
            ...overrides,
        };

        if (!state.profile) {
            // Create new profile for first-time user (include all curriculum fields from onboarding)
            const newProfile: UserProfile = {
                userId: authUserId ?? 'user_' + Date.now(),
                name: authUser?.name ?? 'User',
                email: authUser?.email ?? '',
                displayName: authUser?.displayName ?? 'User',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                curriculumType: profileData.curriculumType ?? undefined,
                board: profileData.board ?? undefined,
                grade: profileData.grade ?? undefined,
                exam: profileData.exam ?? undefined,
                subject: profileData.subject ?? undefined,
                currentTopic: profileData.currentTopic ?? undefined,
                includePYQ: profileData.includePYQ ?? false,
                experienceLevel: 'beginner',
                verificationStatus: 'none',
                role: authUser?.role ?? 'student',
                plan: authUser?.plan ?? 'simple',
                onboardingCompleted: true,
                learningStyle: defaultLearningStyle,
                learningPreferences: defaultLearningPreferences,
                learningGoals: [],
                weeklyCommitmentHours: 5,
                totalLearningHours: 0,
                topicsCompleted: 0,
                currentStreak: 0,
                longestStreak: 0,
            };
            syncProfileIfLoggedIn(newProfile);
            return { profile: newProfile, onboardingStep: -1 };
        }

        // Update existing profile with onboarding completion data
        const updated = {
            ...state.profile,
            ...profileData,
        };
        syncProfileIfLoggedIn(updated);
        return { profile: updated, onboardingStep: -1 };
    }),

    resetOnboarding: () => set({
        onboardingStep: 0,
        curriculumType: null,
        selectedBoard: null,
        selectedGrade: null,
        selectedExam: null,
        selectedSubject: null,
        includePYQ: false,
    }),

    clearProfile: () => set({
        profile: null,
        curriculumType: null,
        selectedBoard: null,
        selectedGrade: null,
        selectedExam: null,
        selectedSubject: null,
        includePYQ: false,
        userDataLoaded: false,
    }),

    setGuestDemoProfile: (userId, displayName) => {
        const guestProfile: UserProfile = {
            userId,
            name: displayName,
            email: 'guest@demo',
            displayName,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            role: 'student',
            plan: 'simple',
            onboardingCompleted: true,
            curriculumType: 'school',
            board: 'Telangana State Board',
            grade: 'Inter 1st Year',
            subject: 'History',
            currentTopic: 'ancient-india-intro',
            experienceLevel: 'beginner',
            verificationStatus: 'none',
            learningStyle: defaultLearningStyle,
            learningPreferences: defaultLearningPreferences,
            learningGoals: [],
            weeklyCommitmentHours: 5,
            totalLearningHours: 0,
            topicsCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
        };
        set({
            profile: guestProfile,
            onboardingStep: -1,
            curriculumType: 'school',
            selectedBoard: 'Telangana State Board',
            selectedGrade: 'Inter 1st Year',
            selectedSubject: 'History',
        });
    },

    toggleFavoriteTopic: (topicId) => {
        set((state) => {
            const profile = state.profile;
            if (!profile) return {};
            const fav = profile.favoriteTopicIds ?? [];
            const next = fav.includes(topicId) ? fav.filter((id) => id !== topicId) : [...fav, topicId];
            const updated = { ...profile, favoriteTopicIds: next };
            syncProfileIfLoggedIn(updated);
            return { profile: updated };
        });
    },
}));
