/**
 * Real-Time State Hooks
 * 
 * Provides easy access to application state with automatic real-time updates.
 * All state changes are reflected immediately across the application.
 */

import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTeachingStore } from '../stores/teachingStore';
import { useAuthStore } from '../stores/authStore';
import { useDoubtStore } from '../stores/doubtStore';
import { useResourceStore } from '../stores/resourceStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { professions } from '../data/professions';
import { realTimeEvents } from '../utils/realTimeSync';
import type { SubProfession, Subject } from '../types';

// ============================================================================
// Profile & Profession Hooks
// ============================================================================

/**
 * Get the current user profile with real-time updates
 */
export function useProfile() {
  const profile = useUserStore(useShallow((s) => s.profile));
  const updateProfile = useUserStore((s) => s.updateProfile);
  
  return {
    profile,
    updateProfile,
    isConfigured: !!profile?.profession,
  };
}

/**
 * Get profession and sub-profession with resolved names (not just IDs)
 * Updates in real-time when selections change
 */
export function useProfessionState() {
  const profile = useUserStore(useShallow((s) => s.profile));
  const selectedProfession = useUserStore((s) => s.selectedProfession);
  const selectedSubProfession = useUserStore((s) => s.selectedSubProfession);
  const selectProfession = useUserStore((s) => s.selectProfession);
  const selectSubProfession = useUserStore((s) => s.selectSubProfession);

  // Resolve profession name
  const professionData = selectedProfession || profile?.profession;
  const professionName = professionData?.name || null;

  // Resolve sub-profession name
  const subProfessionId = selectedSubProfession || profile?.subProfession;
  let subProfessionName: string | null = null;
  let subProfessionData: SubProfession | null = null;

  if (professionData && subProfessionId) {
    const fullProfession = professions.find((p) => p.id === professionData.id);
    if (fullProfession) {
      subProfessionData = fullProfession.subProfessions.find((sp) => sp.id === subProfessionId) || null;
      subProfessionName = subProfessionData?.name || null;
    }
  }

  // Get available subjects for selected sub-profession
  const availableSubjects: Subject[] = subProfessionData?.subjects || [];

  return {
    // Raw data
    profession: professionData,
    subProfessionId,
    
    // Resolved names (for display)
    professionName,
    subProfessionName,
    
    // Full data
    subProfessionData,
    availableSubjects,
    
    // Actions
    selectProfession,
    selectSubProfession,
    
    // Status
    hasProfession: !!professionData,
    hasSubProfession: !!subProfessionId,
    isFullyConfigured: !!professionData && !!subProfessionId,
  };
}

/**
 * Get the current subject with resolved name
 */
export function useSubjectState() {
  const profile = useUserStore(useShallow((s) => s.profile));
  const selectedProfession = useUserStore((s) => s.selectedProfession);
  const selectedSubProfession = useUserStore((s) => s.selectedSubProfession);

  // Get subject ID from profile
  const subjectId = profile?.subject || null;

  // Resolve subject name
  let subjectName: string | null = null;
  let subjectData: Subject | null = null;

  const professionData = selectedProfession || profile?.profession;
  const subProfessionId = selectedSubProfession || profile?.subProfession;

  if (professionData && subProfessionId && subjectId) {
    const fullProfession = professions.find((p) => p.id === professionData.id);
    if (fullProfession) {
      const subProf = fullProfession.subProfessions.find((sp) => sp.id === subProfessionId);
      if (subProf) {
        subjectData = subProf.subjects.find((s) => s.id === subjectId) || null;
        subjectName = subjectData?.name || null;
      }
    }
  }

  return {
    subjectId,
    subjectName,
    subjectData,
    hasSubject: !!subjectId,
  };
}

// ============================================================================
// Settings Hooks
// ============================================================================

/**
 * Get all settings with real-time updates
 */
export function useSettings() {
  const settings = useSettingsStore(useShallow((s) => s.settings));
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const updateAccessibility = useSettingsStore((s) => s.updateAccessibility);
  const updateAiTutor = useSettingsStore((s) => s.updateAiTutor);

  return {
    settings,
    updateSettings,
    updateAccessibility,
    updateAiTutor,
    
    // Commonly accessed settings
    theme: settings.theme,
    language: settings.language,
    fontSize: settings.accessibility.fontSize,
    reduceAnimations: settings.accessibility.reduceAnimations,
    textToSpeech: settings.accessibility.textToSpeech,
    ttsSpeed: settings.accessibility.ttsSpeed,
    aiModel: settings.aiTutor.preferredAiModel,
  };
}

/**
 * Get accessibility settings with real-time updates
 */
export function useAccessibilitySettings() {
  const accessibility = useSettingsStore(useShallow((s) => s.settings.accessibility));
  const updateAccessibility = useSettingsStore((s) => s.updateAccessibility);

  return {
    ...accessibility,
    updateAccessibility,
  };
}

// ============================================================================
// Teaching Session Hooks
// ============================================================================

/**
 * Get current teaching session state with real-time updates
 */
export function useTeachingSession() {
  const currentSession = useTeachingStore(useShallow((s) => s.currentSession));
  const currentStep = useTeachingStore((s) => s.currentStep);
  const isPaused = useTeachingStore((s) => s.isPaused);
  const isSpeaking = useTeachingStore((s) => s.isSpeaking);
  const isInDoubtMode = useTeachingStore((s) => s.isInDoubtMode);

  const startSession = useTeachingStore((s) => s.startSession);
  const endSession = useTeachingStore((s) => s.endSession);
  const nextStep = useTeachingStore((s) => s.nextStep);
  const previousStep = useTeachingStore((s) => s.previousStep);
  const goToStep = useTeachingStore((s) => s.goToStep);
  const pause = useTeachingStore((s) => s.pause);
  const resume = useTeachingStore((s) => s.resume);
  const completeStep = useTeachingStore((s) => s.completeStep);
  const getProgress = useTeachingStore((s) => s.getProgress);
  const getCurrentStepData = useTeachingStore((s) => s.getCurrentStepData);

  const stepData = getCurrentStepData();
  const progress = getProgress();
  const totalSteps = currentSession?.teachingSteps?.length || 0;

  return {
    // Session data
    session: currentSession,
    currentStep,
    stepData,
    progress,
    totalSteps,
    
    // State
    isActive: !!currentSession,
    isPaused,
    isSpeaking,
    isInDoubtMode,
    isLastStep: currentStep >= totalSteps - 1,
    isFirstStep: currentStep === 0,
    
    // Actions
    startSession,
    endSession,
    nextStep,
    previousStep,
    goToStep,
    pause,
    resume,
    completeStep,
  };
}

// ============================================================================
// Auth Hooks
// ============================================================================

/**
 * Get authentication state with real-time updates
 */
export function useAuth() {
  const user = useAuthStore(useShallow((s) => s.user));
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isLoading = useAuthStore((s) => s.isLoading);

  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const logout = useAuthStore((s) => s.logout);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);

  return {
    user,
    isAuthenticated,
    isGuest,
    isLoading,
    isLoggedInUser: isAuthenticated && !isGuest,
    
    loginWithGoogle,
    loginWithEmail,
    logout,
    continueAsGuest,
  };
}

// ============================================================================
// Resource Hooks
// ============================================================================

/**
 * Get generated resources with real-time updates
 */
export function useResources(sessionId?: string) {
  const notes = useResourceStore(useShallow((s) => s.notes));
  const mindMaps = useResourceStore(useShallow((s) => s.mindMaps));
  const flashcards = useResourceStore(useShallow((s) => s.flashcards));
  
  const isGeneratingNotes = useResourceStore((s) => s.isGeneratingNotes);
  const isGeneratingMindMap = useResourceStore((s) => s.isGeneratingMindMap);
  const isGeneratingFlashcards = useResourceStore((s) => s.isGeneratingFlashcards);

  const generateNotes = useResourceStore((s) => s.generateNotes);
  const generateMindMap = useResourceStore((s) => s.generateMindMap);
  const generateFlashcards = useResourceStore((s) => s.generateFlashcards);

  // Filter by session if provided
  const sessionNotes = sessionId ? notes.filter((n) => n.sessionId === sessionId) : notes;
  const sessionMindMaps = sessionId ? mindMaps.filter((m) => m.sessionId === sessionId) : mindMaps;
  const sessionFlashcards = sessionId ? flashcards.filter((f) => f.sessionId === sessionId) : flashcards;

  return {
    // All resources
    notes,
    mindMaps,
    flashcards,
    
    // Session-specific
    sessionNotes,
    sessionMindMaps,
    sessionFlashcards,
    
    // Loading states
    isGeneratingNotes,
    isGeneratingMindMap,
    isGeneratingFlashcards,
    isGenerating: isGeneratingNotes || isGeneratingMindMap || isGeneratingFlashcards,
    
    // Actions
    generateNotes,
    generateMindMap,
    generateFlashcards,
  };
}

// ============================================================================
// Doubt Hooks
// ============================================================================

/**
 * Get doubts with real-time updates
 */
export function useDoubts(sessionId?: string) {
  const doubts = useDoubtStore(useShallow((s) => s.doubts));
  const activeDoubt = useDoubtStore((s) => s.activeDoubt);
  const isResolvingDoubt = useDoubtStore((s) => s.isResolvingDoubt);

  const raiseDoubt = useDoubtStore((s) => s.raiseDoubt);
  const getSessionDoubts = useDoubtStore((s) => s.getSessionDoubts);

  const sessionDoubts = sessionId ? getSessionDoubts(sessionId) : doubts;
  const pendingDoubts = sessionDoubts.filter((d) => d.status === 'pending');
  const resolvedDoubts = sessionDoubts.filter((d) => d.status === 'resolved');

  return {
    doubts: sessionDoubts,
    allDoubts: doubts,
    activeDoubt,
    pendingDoubts,
    resolvedDoubts,
    isResolvingDoubt,
    hasPendingDoubts: pendingDoubts.length > 0,
    
    raiseDoubt,
  };
}

// ============================================================================
// Analytics Hooks
// ============================================================================

/**
 * Get analytics with real-time updates
 */
export function useAnalytics() {
  const sessions = useAnalyticsStore(useShallow((s) => s.sessions));
  const achievements = useAnalyticsStore(useShallow((s) => s.achievements));
  const metrics = useAnalyticsStore(useShallow((s) => s.metrics));

  const addSession = useAnalyticsStore((s) => s.addSession);
  const unlockAchievement = useAnalyticsStore((s) => s.unlockAchievement);

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const lockedAchievements = achievements.filter((a) => !a.unlockedAt);

  return {
    sessions,
    achievements,
    metrics,
    unlockedAchievements,
    lockedAchievements,
    
    addSession,
    unlockAchievement,
  };
}

// Curriculum hooks removed - no longer needed

// ============================================================================
// Event Subscription Hooks
// ============================================================================

/**
 * Subscribe to a specific real-time event
 */
export function useOnEvent<T = unknown>(
  event: string,
  callback: (data: T) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unsubscribe = realTimeEvents.on(event, callback as (...args: unknown[]) => void);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}

/**
 * Get the last emitted value for an event
 */
export function useLastEvent<T = unknown>(event: string): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => {
    const lastEvent = realTimeEvents.getLastEvent(event);
    return lastEvent?.[0] as T | undefined;
  });

  useEffect(() => {
    const unsubscribe = realTimeEvents.on(event, (data) => {
      setValue(data as T);
    });
    return unsubscribe;
  }, [event]);

  return value;
}

// ============================================================================
// Combined State Hook
// ============================================================================

/**
 * Get combined application state for components that need multiple states
 */
export function useAppState() {
  const { profile, isConfigured } = useProfile();
  const { professionName, subProfessionName, isFullyConfigured } = useProfessionState();
  const { subjectName } = useSubjectState();
  const { settings, theme, language } = useSettings();
  const { session, isActive, progress } = useTeachingSession();
  const { isAuthenticated, isGuest, user } = useAuth();

  return {
    // User
    profile,
    user,
    isAuthenticated,
    isGuest,
    isConfigured,
    isFullyConfigured,
    
    // Profession
    professionName,
    subProfessionName,
    subjectName,
    
    // Settings
    settings,
    theme,
    language,
    
    // Teaching
    session,
    isTeaching: isActive,
    teachingProgress: progress,
  };
}
