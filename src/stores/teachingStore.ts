import { create } from 'zustand';
import type { TeachingState, TeachingSession, TeachingStep, Doubt, Collaborator } from '../types';
import { useAuthStore } from './authStore';
import { createTeachingSession, updateTeachingSession } from '../services/backendService';
import { realTimeEvents, EVENTS } from '../utils/realTimeSync';
import { generateTeachingContent } from '../services/aiApi';
import { toast } from './toastStore';

// Helper to sync teaching session to Firestore
async function syncSessionToBackend(session: TeachingSession): Promise<void> {
    const { user, isGuest } = useAuthStore.getState();
    if (user?.id && !isGuest) {
        try {
            await createTeachingSession(user.id, session);
        } catch (e) {
            console.error('Failed to sync teaching session to backend:', e);
        }
    }
}

async function syncSessionUpdateToBackend(sessionId: string, updates: Partial<TeachingSession>): Promise<void> {
    const { user, isGuest } = useAuthStore.getState();
    if (user?.id && !isGuest) {
        try {
            await updateTeachingSession(user.id, sessionId, updates);
        } catch (e) {
            console.error('Failed to update teaching session in backend:', e);
        }
    }
}

interface TeachingStore extends TeachingState {
    // Session management
    startSession: (session: TeachingSession) => void;
    endSession: () => void;

    // Step control
    goToStep: (step: number) => void;
    nextStep: () => void;
    previousStep: () => void;
    completeStep: (stepId: string) => void;

    // Teaching control
    pause: () => void;
    resume: () => void;
    setSpeaking: (speaking: boolean) => void;

    // Doubt handling
    enterDoubtMode: (doubt: Doubt) => void;
    exitDoubtMode: () => void;
    resolveDoubt: (doubtId: string) => void;
    generateAiSession: (topicId: string, topicName: string) => Promise<void>;

    // Collaboration
    addCollaborator: (collaborator: Collaborator) => void;
    removeCollaborator: (id: string) => void;
    toggleScreenShare: () => void;

    // Utilities
    getProgress: () => number;
    getCurrentStepData: () => TeachingStep | null;
}

export const useTeachingStore = create<TeachingStore>()((set, get) => ({
    currentSession: null,
    currentStep: 0,
    isPaused: false,
    isInDoubtMode: false,
    isSpeaking: false,
    collaborators: [],
    isScreenSharing: false,

    startSession: (session) => {
        set({
            currentSession: session,
            currentStep: session.currentStep,
            isPaused: false,
            isInDoubtMode: false,
        });
        // Emit real-time event immediately for instant UI updates
        realTimeEvents.emit(EVENTS.SESSION_START, session);
        // Sync session to backend/Firestore (non-blocking for immediate UI update)
        syncSessionToBackend(session).catch(e => {
            console.error('Failed to sync session to backend:', e);
        });
    },

    endSession: () => {
        const previousSession = get().currentSession;
        set({
            currentSession: null,
            currentStep: 0,
            isPaused: false,
            isInDoubtMode: false,
            isSpeaking: false,
        });
        // Emit real-time event immediately for instant UI updates
        if (previousSession) {
            realTimeEvents.emit(EVENTS.SESSION_END, previousSession);
        }
    },

    goToStep: (step) => set((state) => {
        if (!state.currentSession || !state.currentSession.teachingSteps || state.currentSession.teachingSteps.length === 0) return state;
        const maxStep = state.currentSession.teachingSteps.length - 1;
        const newStep = Math.max(0, Math.min(step, maxStep));
        const updated = {
            currentStep: newStep,
            currentSession: {
                ...state.currentSession,
                currentStep: newStep,
            }
        };
        // Emit real-time event immediately for instant UI updates
        realTimeEvents.emit(EVENTS.STEP_CHANGE, newStep, state.currentSession?.teachingSteps?.[newStep]);
        return updated;
    }),

    nextStep: () => {
        const state = get();
        if (state.currentSession && state.currentSession.teachingSteps && state.currentSession.teachingSteps.length > 0) {
            const nextStepIndex = state.currentStep + 1;
            if (nextStepIndex < state.currentSession.teachingSteps.length) {
                set((currentState) => {
                    if (!currentState.currentSession || !currentState.currentSession.teachingSteps || currentState.currentSession.teachingSteps.length === 0) return currentState;
                    const maxStep = currentState.currentSession.teachingSteps.length - 1;
                    const newStep = Math.max(0, Math.min(nextStepIndex, maxStep));
                    const updated = {
                        currentStep: newStep,
                        currentSession: {
                            ...currentState.currentSession,
                            currentStep: newStep,
                        }
                    };
                    // Emit real-time event immediately for instant UI updates
                    realTimeEvents.emit(EVENTS.STEP_CHANGE, newStep, currentState.currentSession.teachingSteps[newStep]);
                    // Sync to backend (non-blocking)
                    if (currentState.currentSession.id) {
                        syncSessionUpdateToBackend(currentState.currentSession.id, { currentStep: newStep }).catch(e => {
                            console.error('Failed to sync step change to backend:', e);
                        });
                    }
                    return updated;
                });
            }
        }
    },

    previousStep: () => {
        const state = get();
        if (state.currentStep > 0) {
            // Use goToStep which already handles real-time events and backend sync
            get().goToStep(state.currentStep - 1);
        }
    },

    completeStep: (stepId) => set((state) => {
        if (!state.currentSession || !state.currentSession.teachingSteps) return state;
        const updatedSteps = state.currentSession.teachingSteps.map(step =>
            step.id === stepId ? { ...step, completed: true } : step
        );
        const completedCount = updatedSteps.filter(s => s.completed).length;
        const progress = Math.round((completedCount / updatedSteps.length) * 100);

        const completedStep = updatedSteps.find(s => s.id === stepId);

        // Emit real-time event immediately for instant UI updates
        if (completedStep) {
            realTimeEvents.emit(EVENTS.STEP_COMPLETE, completedStep);
        }

        // Sync progress to backend (non-blocking)
        syncSessionUpdateToBackend(state.currentSession.id, {
            teachingSteps: updatedSteps,
            progress,
        }).catch(e => {
            console.error('Failed to sync step completion to backend:', e);
        });

        return {
            currentSession: {
                ...state.currentSession,
                teachingSteps: updatedSteps,
                progress,
            }
        };
    }),

    pause: () => set({ isPaused: true, isSpeaking: false }),

    resume: () => set({ isPaused: false }),

    setSpeaking: (speaking) => {
        set({ isSpeaking: speaking });
        // Emit real-time event immediately for instant UI updates
        realTimeEvents.emit(EVENTS.SPEAKING_CHANGE, speaking);
    },

    enterDoubtMode: (doubt) => set((state) => {
        if (!state.currentSession) return state;
        return {
            isInDoubtMode: true,
            isPaused: true,
            currentSession: {
                ...state.currentSession,
                doubts: [...(state.currentSession.doubts || []), doubt],
            }
        };
    }),

    exitDoubtMode: () => set({ isInDoubtMode: false }),

    resolveDoubt: (doubtId) => set((state) => {
        if (!state.currentSession || !state.currentSession.doubts) return state;
        const updatedDoubts = state.currentSession.doubts.map(d =>
            d.id === doubtId ? { ...d, status: 'resolved' as const } : d
        );
        return {
            currentSession: {
                ...state.currentSession,
                doubts: updatedDoubts,
            }
        };
    }),

    generateAiSession: async (topicId, topicName) => {
        try {
            const content = await generateTeachingContent(topicName);
            const sections = Array.isArray(content?.sections) ? content.sections : [];
            const summary = typeof content?.summary === 'string' ? content.summary : '';
            const teachingSteps: TeachingStep[] = sections.map((section, index) => ({
                id: `${topicId}-ai-${index + 1}`,
                stepNumber: index + 1,
                title: section?.title ?? 'Section',
                content: section?.content ?? '',
                spokenContent: section?.content ?? '',
                visualType: 'diagram',
                durationSeconds: 180,
                completed: false,
                complexity: 'basic',
                estimatedMinutes: 3,
                keyConcepts: [],
            }));

            // Add summary step
            teachingSteps.push({
                id: `${topicId}-ai-summary`,
                stepNumber: teachingSteps.length + 1,
                title: 'Summary',
                content: summary,
                spokenContent: summary,
                visualType: 'text',
                durationSeconds: 120,
                completed: false,
                complexity: 'basic',
                estimatedMinutes: 2,
            });

            const authUserId = useAuthStore.getState().user?.id ?? 'user_1';
            const session: TeachingSession = {
                id: 'ai_session_' + Date.now(),
                userId: authUserId,
                topicId,
                topicName: content?.title ?? topicName,
                startTime: new Date().toISOString(),
                status: 'active',
                currentStep: 0,
                totalSteps: teachingSteps.length,
                progress: 0,
                teachingSteps,
                doubts: [],
            };

            set({
                currentSession: session,
                currentStep: 0,
                isPaused: false,
                isInDoubtMode: false,
            });

            // Emit real-time event immediately for instant UI updates
            realTimeEvents.emit(EVENTS.SESSION_START, session);

            // Sync session to Database (non-blocking)
            syncSessionToBackend(session).catch(e => {
                console.error('Failed to sync AI session to backend:', e);
            });

            toast.success(`AI Lesson generated for ${topicName}`);
        } catch (error) {
            console.error('Failed to generate AI session:', error);
            toast.error('Failed to generate AI lesson.');
            throw error;
        }
    },

    addCollaborator: (collaborator) => set((state) => ({
        collaborators: [...state.collaborators, collaborator],
    })),

    removeCollaborator: (id) => set((state) => ({
        collaborators: state.collaborators.filter(c => c.id !== id),
    })),

    toggleScreenShare: () => set((state) => ({
        isScreenSharing: !state.isScreenSharing
    })),

    getProgress: () => {
        const state = get();
        if (!state.currentSession || !state.currentSession.teachingSteps || state.currentSession.teachingSteps.length === 0) return 0;
        const completedSteps = state.currentSession.teachingSteps.filter(s => s.completed).length;
        return (completedSteps / state.currentSession.teachingSteps.length) * 100;
    },

    getCurrentStepData: () => {
        const state = get();
        if (!state.currentSession || !state.currentSession.teachingSteps) return null;
        if (state.currentStep < 0 || state.currentStep >= state.currentSession.teachingSteps.length) return null;
        return state.currentSession.teachingSteps[state.currentStep] || null;
    },
}));
