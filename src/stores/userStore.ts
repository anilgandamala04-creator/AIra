import { create } from 'zustand';
import type { UserProfile, LearningStyle, LearningPreferences, Profession } from '../types';
import { useAuthStore } from './authStore';
import { updateUserProfile as syncProfileToBackend } from '../services/backendService';
import { realTimeEvents, EVENTS } from '../utils/realTimeSync';
import { professions } from '../data/professions';

interface UserStore {
    profile: UserProfile | null;
    onboardingStep: number;
    selectedProfession: Profession | null;
    selectedSubProfession: string | null;
    /** True after first Firestore user-data snapshot (avoids wrong redirect to onboarding on refresh). */
    userDataLoaded: boolean;

    // Actions
    setProfile: (profile: UserProfile) => void;
    setUserDataLoaded: (loaded: boolean) => void;
    /** Set a minimal profile and complete onboarding for guest/demo mode. No backend sync. */
    setGuestDemoProfile: (userId: string, displayName: string) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    setOnboardingStep: (step: number) => void;
    selectProfession: (profession: Profession | null) => void;
    selectSubProfession: (subProfession: string | null) => void;
    updateLearningStyle: (style: Partial<LearningStyle>) => void;
    updateLearningPreferences: (prefs: Partial<LearningPreferences>) => void;
    completeOnboarding: (overrides?: { subject?: string; currentTopic?: string }) => void;
    resetOnboarding: () => void;
    /** Clear profile (e.g. on logout) to avoid showing stale user data. */
    clearProfile: () => void;
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
    selectedProfession: null,
    selectedSubProfession: null,
    userDataLoaded: false,

    setUserDataLoaded: (loaded) => set({ userDataLoaded: loaded }),

    setProfile: (profile) => {
        // Initialize selectedProfession and selectedSubProfession from profile if not already set
        set((state) => {
            const updates: Partial<UserStore> = { profile };
            if (profile && !state.selectedProfession && profile.profession) {
                updates.selectedProfession = profile.profession;
            }
            if (profile && state.selectedSubProfession === null && profile.subProfession) {
                updates.selectedSubProfession = profile.subProfession;
            }
            syncProfileIfLoggedIn(profile);
            return updates;
        });
    },

    updateProfile: (updates) => set((state) => {
        const next = state.profile ? { ...state.profile, ...updates } : null;
        syncProfileIfLoggedIn(next);
        // Sync selectedProfession and selectedSubProfession in real time when profile changes
        const result: Partial<UserStore> = { profile: next };
        if (updates.profession !== undefined) {
            result.selectedProfession = updates.profession;
            // Clear selectedSubProfession if profession changes to a different one
            if (updates.profession === null || updates.profession?.id !== state.profile?.profession?.id) {
                result.selectedSubProfession = null;
            }
            // Emit real-time event immediately for instant UI updates
            realTimeEvents.emit(EVENTS.PROFESSION_CHANGE, updates.profession);
        }
        if (updates.subProfession !== undefined) {
            result.selectedSubProfession = updates.subProfession;
            // Emit real-time event immediately for instant UI updates
            realTimeEvents.emit(EVENTS.SUB_PROFESSION_CHANGE, updates.subProfession);
        }
        // Emit profile update event
        if (next) {
            realTimeEvents.emit(EVENTS.PROFILE_UPDATE, next);
        }
        return result;
    }),

    setOnboardingStep: (step) => set({ onboardingStep: step }),

    selectProfession: (profession) => set((state) => {
        // Also update profile.profession for full sync
        const profileUpdate = state.profile
            ? { ...state.profile, profession, subProfession: null }
            : null;
        if (profileUpdate) syncProfileIfLoggedIn(profileUpdate);
        // Emit real-time event immediately for instant UI updates
        realTimeEvents.emit(EVENTS.PROFESSION_CHANGE, profession);
        if (profileUpdate) {
            realTimeEvents.emit(EVENTS.PROFILE_UPDATE, profileUpdate);
        }
        return {
            selectedProfession: profession,
            selectedSubProfession: null,
            profile: profileUpdate,
        };
    }),

    selectSubProfession: (subProfession) => set((state) => {
        // Also update profile.subProfession for full sync
        const profileUpdate = state.profile
            ? { ...state.profile, subProfession }
            : null;
        if (profileUpdate) syncProfileIfLoggedIn(profileUpdate);
        // Emit real-time event immediately for instant UI updates
        realTimeEvents.emit(EVENTS.SUB_PROFESSION_CHANGE, subProfession);
        if (profileUpdate) {
            realTimeEvents.emit(EVENTS.PROFILE_UPDATE, profileUpdate);
        }
        return {
            selectedSubProfession: subProfession,
            profile: profileUpdate,
        };
    }),

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
        // Use overrides when profile is null (first-time users) since updateProfile is a no-op then.
        const profileData = {
            profession: state.selectedProfession,
            subProfession: state.selectedSubProfession,
            subject: overrides?.subject ?? state.profile?.subject,
            currentTopic: overrides?.currentTopic ?? state.profile?.currentTopic,
            onboardingCompleted: true,
        };

        if (!state.profile) {
            // Create new profile for first-time user
            const newProfile: UserProfile = {
                userId: authUserId ?? 'user_' + Date.now(),
                name: authUser?.name ?? 'User',
                email: authUser?.email ?? '',
                displayName: authUser?.displayName ?? 'User',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                profession: profileData.profession,
                subProfession: profileData.subProfession,
                subject: profileData.subject,
                currentTopic: profileData.currentTopic,
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
        selectedProfession: null,
        selectedSubProfession: null,
    }),

    clearProfile: () => set({
        profile: null,
        selectedProfession: null,
        selectedSubProfession: null,
        userDataLoaded: false,
    }),

    setGuestDemoProfile: (userId, displayName) => {
        const profession = professions[0] ?? null;
        const subProfession = profession?.subProfessions?.[0];
        const subject = subProfession?.subjects?.[0];
        const topic = subject?.topics?.[0];
        const guestProfile: UserProfile = {
            userId,
            name: displayName,
            email: 'guest@demo',
            displayName,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            role: 'student',
            plan: 'simple',
            onboardingCompleted: true,
            profession,
            subProfession: subProfession?.id ?? null,
            subject: subject?.id,
            currentTopic: topic?.id,
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
            selectedProfession: profession,
            selectedSubProfession: subProfession?.id ?? null,
        });
    },
}));
