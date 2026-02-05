import { create } from 'zustand';
import type { Doubt, DoubtResolution, QuizQuestion } from '../types';
import { resolveDoubt as resolveDoubtApi, type AiModelType } from '../services/aiApi';
import { useSettingsStore } from './settingsStore';
import { useAuthStore } from './authStore';
import { saveDoubt as saveDoubtToDb, updateDoubt as updateDoubtInDb } from '../services/backendService';
import { useTeachingStore } from './teachingStore';
import { realTimeEvents, EVENTS } from '../utils/realTimeSync';

// Helper to sync doubts to Firestore if user is logged in
async function syncDoubtToBackend(doubt: Doubt): Promise<void> {
    const { user, isGuest } = useAuthStore.getState();
    if (user?.id && !isGuest) {
        try {
            await saveDoubtToDb(user.id, doubt);
        } catch (e) {
            console.error('Failed to sync doubt to backend:', e);
        }
    }
}

async function syncDoubtUpdateToBackend(doubtId: string, updates: Partial<Doubt>): Promise<void> {
    const { user, isGuest } = useAuthStore.getState();
    if (user?.id && !isGuest) {
        try {
            await updateDoubtInDb(user.id, doubtId, updates);
        } catch (e) {
            console.error('Failed to update doubt in backend:', e);
        }
    }
}

interface DoubtStore {
    doubts: Doubt[];
    activeDoubt: Doubt | null;
    isResolvingDoubt: boolean;
    showVerificationQuiz: boolean;
    currentQuiz: QuizQuestion | null;
    quizTimeoutId: ReturnType<typeof setTimeout> | null; // Track timeout for cleanup
    _autoResolveTimeouts: Record<string, ReturnType<typeof setTimeout>>; // Track auto-resolve timeouts by doubt ID (plain object for Zustand compatibility)

    // Actions
    raiseDoubt: (question: string, sessionId: string, stepNumber: number, stepTitle: string) => Doubt;
    setActiveDoubt: (doubt: Doubt | null) => void;
    startResolvingDoubt: (doubtId: string) => void;
    resolveDoubt: (doubtId: string, resolution: DoubtResolution) => void;
    showQuiz: (quiz: QuizQuestion) => void;
    hideQuiz: () => void;
    confirmUnderstanding: (doubtId: string) => void;
    getSessionDoubts: (sessionId: string) => Doubt[];
    clearSessionDoubts: (sessionId: string) => void;
}


export const useDoubtStore = create<DoubtStore>((set, get) => ({
    doubts: [],
    activeDoubt: null,
    isResolvingDoubt: false,
    showVerificationQuiz: false,
    currentQuiz: null,
    quizTimeoutId: null,
    _autoResolveTimeouts: {} as Record<string, ReturnType<typeof setTimeout>>,

    raiseDoubt: (question, sessionId, stepNumber, stepTitle) => {
        const doubt: Doubt = {
            id: `doubt_${Date.now()}`,
            sessionId,
            question,
            timestamp: new Date().toISOString(),
            context: {
                stepNumber,
                stepTitle,
            },
            status: 'pending',
        };

        // Get previous active doubt BEFORE updating state (race condition prevention)
        const previousState = get();
        const previousActiveDoubtId = previousState.activeDoubt?.id;

        // Create timeout BEFORE state update to ensure it's available for tracking
        const timeoutId = setTimeout(() => {
            const currentState = get();
            // Remove timeout from object since it's executing
            if (currentState._autoResolveTimeouts[doubt.id]) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [doubt.id]: _, ...updatedTimeouts } = currentState._autoResolveTimeouts;
                set({ _autoResolveTimeouts: updatedTimeouts });
            }
            // Only resolve if this doubt is still the active one
            if (currentState.activeDoubt?.id === doubt.id) {
                currentState.startResolvingDoubt(doubt.id);
            }
        }, 500);

        // Single atomic state update: add doubt, set as active, clear previous timeout, track new timeout
        set((state) => {
            // Clear timeout for previous active doubt if it exists
            let newTimeouts = { ...state._autoResolveTimeouts };
            if (previousActiveDoubtId && newTimeouts[previousActiveDoubtId]) {
                const previousTimeout = newTimeouts[previousActiveDoubtId];
                clearTimeout(previousTimeout);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [previousActiveDoubtId]: _, ...rest } = newTimeouts;
                newTimeouts = rest;
            }
            // Track new timeout atomically
            newTimeouts = { ...newTimeouts, [doubt.id]: timeoutId };
            return {
                doubts: [...state.doubts, doubt],
                activeDoubt: doubt,
                _autoResolveTimeouts: newTimeouts,
            };
        });

        // Emit real-time event immediately for instant UI updates
        realTimeEvents.emit(EVENTS.DOUBT_RAISED, doubt);

        // Sync to backend in background
        syncDoubtToBackend(doubt);

        return doubt;
    },

    setActiveDoubt: (doubt) => {
        const state = get();
        // Clear auto-resolve timeout if setting active doubt to null or different doubt
        if (state.activeDoubt?.id && state.activeDoubt.id !== doubt?.id) {
            const timeout = state._autoResolveTimeouts[state.activeDoubt.id];
            if (timeout) {
                clearTimeout(timeout);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [state.activeDoubt.id]: _, ...newTimeouts } = state._autoResolveTimeouts;
                set({ activeDoubt: doubt, _autoResolveTimeouts: newTimeouts });
                return;
            }
        }
        set({ activeDoubt: doubt });
    },

    startResolvingDoubt: (doubtId) => {
        set((state) => ({
            isResolvingDoubt: true,
            doubts: state.doubts.map((d) =>
                d.id === doubtId ? { ...d, status: 'resolving' } : d
            ),
        }));

        // Call real AI backend (LLaMA or Mistral via aiApi)
        const doubt = get().doubts.find((d) => d.id === doubtId);
        if (!doubt) {
            set({ isResolvingDoubt: false });
            return;
        }

        // Get rich context from the current teaching session
        const teachingState = useTeachingStore.getState();
        const currentSession = teachingState.currentSession;
        const currentStep = currentSession?.teachingSteps?.[teachingState.currentStep];

        const model: AiModelType = useSettingsStore.getState().settings.aiTutor?.preferredAiModel ?? 'llama';

        // Build comprehensive context for better AI responses
        const contextParts = [
            currentSession?.topicName ? `Topic: ${currentSession.topicName}` : '',
            doubt.context.stepTitle ? `Section: ${doubt.context.stepTitle}` : '',
            currentStep?.content ? `Current lesson content: ${currentStep.content.slice(0, 500)}` : '',
        ].filter(Boolean);
        const context = contextParts.join('. ');

        resolveDoubtApi(doubt.question, context, model)
            .then((resolution) => {
                const quizQuestion = resolution.quizQuestion
                    ? {
                        id: `quiz_${doubtId}`,
                        question: resolution.quizQuestion.question,
                        type: 'multiple_choice' as const,
                        options: resolution.quizQuestion.options,
                        correctAnswer: resolution.quizQuestion.correctAnswer,
                        explanation: resolution.quizQuestion.explanation,
                    }
                    : undefined;
                get().resolveDoubt(doubtId, {
                    explanation: resolution.explanation,
                    examples: resolution.examples ?? [],
                    quizQuestion,
                    resolvedAt: new Date().toISOString(),
                    understandingConfirmed: false,
                });
            })
            .catch((error) => {
                console.error('Failed to resolve doubt:', error);
                set((state) => ({
                    isResolvingDoubt: false,
                    doubts: state.doubts.map((d) =>
                        d.id === doubtId ? { ...d, status: 'pending' as const } : d
                    ),
                }));
            });
    },

    resolveDoubt: (doubtId, resolution) => {
        const resolvedDoubt = get().doubts.find(d => d.id === doubtId);
        set((state) => ({
            isResolvingDoubt: false,
            doubts: state.doubts.map((d) =>
                d.id === doubtId ? { ...d, resolution, status: 'resolved' } : d
            ),
            activeDoubt: state.activeDoubt?.id === doubtId
                ? { ...state.activeDoubt, resolution, status: 'resolved' }
                : state.activeDoubt,
        }));

        // Emit real-time event immediately for instant UI updates
        if (resolvedDoubt) {
            realTimeEvents.emit(EVENTS.DOUBT_RESOLVED, { ...resolvedDoubt, resolution, status: 'resolved' });
        }

        // Sync resolution to Database
        syncDoubtUpdateToBackend(doubtId, { resolution, status: 'resolved' });

        // Show verification quiz if available
        if (resolution.quizQuestion) {
            // Clear any existing timeout
            const currentState = get();
            if (currentState.quizTimeoutId) {
                clearTimeout(currentState.quizTimeoutId);
            }

            const timeoutId = setTimeout(() => {
                const state = get();
                // Only show quiz if still in resolved state
                const currentDoubt = state.doubts.find((d) => d.id === doubtId);
                if (currentDoubt && currentDoubt.status === 'resolved' && currentDoubt.resolution?.quizQuestion) {
                    const quiz = currentDoubt.resolution.quizQuestion;
                    if (quiz) {
                        state.showQuiz(quiz);
                    }
                }
                // Clear timeout ID after execution
                set({ quizTimeoutId: null });
            }, 1000);

            set({ quizTimeoutId: timeoutId });
        }
    },

    showQuiz: (quiz) => set({ showVerificationQuiz: true, currentQuiz: quiz }),

    hideQuiz: () => {
        const state = get();
        // Clear any pending timeout
        if (state.quizTimeoutId) {
            clearTimeout(state.quizTimeoutId);
        }
        set({ showVerificationQuiz: false, currentQuiz: null, quizTimeoutId: null });
    },

    confirmUnderstanding: (doubtId) => {
        const state = get();
        if (state.quizTimeoutId) {
            clearTimeout(state.quizTimeoutId);
        }
        set({
            doubts: state.doubts.map((d) =>
                d.id === doubtId && d.resolution
                    ? { ...d, resolution: { ...d.resolution, understandingConfirmed: true } }
                    : d
            ),
            showVerificationQuiz: false,
            currentQuiz: null,
            quizTimeoutId: null,
        });
    },

    getSessionDoubts: (sessionId) => {
        return get().doubts.filter((d) => d.sessionId === sessionId);
    },

    clearSessionDoubts: (sessionId) => {
        set((state) => {
            // Clear timeouts for doubts being removed
            const doubtsToRemove = state.doubts.filter((d) => d.sessionId === sessionId);
            let newTimeouts = { ...state._autoResolveTimeouts };
            doubtsToRemove.forEach((doubt) => {
                const timeout = newTimeouts[doubt.id];
                if (timeout) {
                    clearTimeout(timeout);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [doubt.id]: _, ...rest } = newTimeouts;
                    newTimeouts = rest;
                }
            });
            return {
                doubts: state.doubts.filter((d) => d.sessionId !== sessionId),
                activeDoubt: state.activeDoubt?.sessionId === sessionId ? null : state.activeDoubt,
                _autoResolveTimeouts: newTimeouts,
            };
        });
    },
}));
