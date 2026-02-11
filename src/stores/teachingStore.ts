import { create } from 'zustand';
import type { TeachingState, TeachingSession, TeachingStep, Doubt, Collaborator, ExamType, CurriculumType, SchoolBoard } from '../types';
import { useAuthStore } from './authStore';
import { useUserStore } from './userStore';
import {
    createTeachingSessionWithOfflineQueue as createTeachingSession,
    updateTeachingSessionWithOfflineQueue as updateTeachingSession
} from '../services/backendWithOffline';
import { realTimeEvents, EVENTS } from '../utils/realTimeSync';
import { logAppEvent, ANALYTICS_EVENTS } from '../lib/analytics';
import { generateAITeachingContent } from '../services/aiExecution';
import { getPromptControlParams, getModeConstraintLine, getPersonalizationInstructions } from '../services/promptControlLayer';
import { toast } from './toastStore';

// Helper to sync teaching session to backend
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
    completeAndNextStep: () => void;

    // Teaching control
    pause: () => void;
    resume: () => void;
    setSpeaking: (speaking: boolean) => void;

    // Doubt handling
    enterDoubtMode: (doubt: Doubt) => void;
    exitDoubtMode: () => void;
    resolveDoubt: (doubtId: string) => void;
    generateAiSession: (topicId: string, curriculumContext: {
        curriculumType?: string;
        board?: string;
        grade?: string;
        exam?: string;
        subjectName?: string;
        topic: string;
        visualType?: string;
        visualPrompt?: string;
        includePYQ?: boolean;
    }) => Promise<void>;

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
        logAppEvent(ANALYTICS_EVENTS.LESSON_START, {
            topic: session.topicName ?? '',
            session_id: session.id ?? '',
        });
        set({
            currentSession: session,
            currentStep: session.currentStep,
            isPaused: false,
            isInDoubtMode: false,
        });
        // Emit real-time event immediately for instant UI updates
        realTimeEvents.emit(EVENTS.SESSION_START, session);
        // Sync session to backend (non-blocking for immediate UI update)
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

    nextStep: () => set((state) => {
        if (!state.currentSession || !state.currentSession.teachingSteps || state.currentSession.teachingSteps.length === 0) return state;
        const nextStepIndex = state.currentStep + 1;
        if (nextStepIndex >= state.currentSession.teachingSteps.length) return state;

        const updated = {
            currentStep: nextStepIndex,
            currentSession: {
                ...state.currentSession,
                currentStep: nextStepIndex,
            }
        };
        // Emit real-time event immediately for instant UI updates
        realTimeEvents.emit(EVENTS.STEP_CHANGE, nextStepIndex, state.currentSession.teachingSteps[nextStepIndex]);
        // Sync to backend (non-blocking)
        if (state.currentSession.id) {
            syncSessionUpdateToBackend(state.currentSession.id, { currentStep: nextStepIndex }).catch(e => {
                console.error('Failed to sync step change to backend:', e);
            });
        }
        return updated;
    }),

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
        const progress = updatedSteps.length > 0 ? Math.round((completedCount / updatedSteps.length) * 100) : 0;

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

    completeAndNextStep: () => set((state) => {
        if (!state.currentSession || !state.currentSession.teachingSteps) return state;
        const currentIdx = state.currentStep;
        const currentStepId = state.currentSession.teachingSteps[currentIdx]?.id;
        if (!currentStepId) return state;

        const updatedSteps = state.currentSession.teachingSteps.map(step =>
            step.id === currentStepId ? { ...step, completed: true } : step
        );
        const completedCount = updatedSteps.filter(s => s.completed).length;
        const progress = updatedSteps.length > 0 ? Math.round((completedCount / updatedSteps.length) * 100) : 0;
        const nextStepIndex = Math.min(currentIdx + 1, updatedSteps.length - 1);

        const completedStep = updatedSteps.find(s => s.id === currentStepId);
        if (completedStep) {
            realTimeEvents.emit(EVENTS.STEP_COMPLETE, completedStep);
        }

        if (nextStepIndex !== currentIdx) {
            realTimeEvents.emit(EVENTS.STEP_CHANGE, nextStepIndex, updatedSteps[nextStepIndex]);
        }

        // Sync to backend (atomic update)
        syncSessionUpdateToBackend(state.currentSession.id, {
            teachingSteps: updatedSteps,
            progress,
            currentStep: nextStepIndex,
        }).catch(e => {
            console.error('Failed to sync step completion and advance to backend:', e);
        });

        return {
            currentStep: nextStepIndex,
            currentSession: {
                ...state.currentSession,
                teachingSteps: updatedSteps,
                progress,
                currentStep: nextStepIndex,
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

    generateAiSession: async (topicId, curriculumContext) => {
        try {
            const { topic: topicName, curriculumType, board, grade, exam, subjectName, visualType, visualPrompt, includePYQ } = curriculumContext;

            // Main OS behavior (see docs/USER_FLOW_1A_1B.md):
            // 1A Curriculum: AI teaches ONLY selected topic; content strictly mapped to official curriculum syllabus;
            //    teaching format = realistic visuals (diagrams, simulations, board-style), natural narrative voice.
            // 1B Competitive: Teaching exam-oriented; step-by-step problem solving; visuals = problem breakdowns (not storytelling);
            //    voice = analytical (not narrative); content scope = exam syllabus + selected topic only; optional PYQ (last 10 years).
            const domainInfo = curriculumType === 'school'
                ? `${board} Grade ${grade} - ${subjectName}`
                : `${exam} - ${subjectName}`;

            const visualAidInfo = visualType && visualPrompt
                ? `\n            CRITICAL VISUAL CONSTRAINT (STRICTLY RELEVANT TO THIS TOPIC ONLY — STATIC VISUALS):
                A topic-specific visual is available, representing ONLY: "${visualPrompt}".
                1. You MUST use ONLY this topic-specific visual. Every diagram, illustration, or board-style visual in your response MUST be strictly relevant to the topic "${topicName}" and to "${visualPrompt}". Use only static visuals (diagrams, illustrations, board-style); no dynamic storytelling or unrelated animations.
                2. Do NOT include or describe generic, decorative, or off-topic visuals. Every visual reference must directly and exclusively illustrate "${topicName}".
                3. Explicitly reference this visual in your teaching (e.g. "Direct your attention to this diagram showing ${visualPrompt}...").
                4. Ground your explanation in the details of "${visualPrompt}" so the visual and the text are aligned. Voice narration must be synchronized with what is shown.`
                : `\n            STRICTLY RELEVANT STATIC VISUALS:
                Every diagram, illustration, or board-style visual in your response MUST be strictly relevant to the topic "${topicName}" only. Do NOT include generic, off-topic, or dynamic storytelling visuals. Only describe or reference static visuals that directly and exclusively illustrate this topic.`;

            // Flow 1B Main OS: Teaching exam-oriented; step-by-step problem solving; visuals = problem breakdowns (not storytelling); voice = analytical (not narrative); content = exam syllabus + selected topic only.
            const curriculumTeachingStyle = curriculumType === 'competitive'
                ? `You are teaching for COMPETITIVE EXAMS (${exam}). EXAM-ORIENTED ONLY.
            - Teaching is exam-oriented: step-by-step problem solving, formula derivation, mistake patterns. Solve PYQs where relevant; explain formula derivation; show mistake patterns.
            - Visuals = problem breakdowns and exam-style diagrams only, NOT storytelling. Voice = analytical, NOT narrative. Content scope strictly aligned to exam syllabus and the selected topic only.
            - HARD RULE: No cartoons, no motivation speeches, no "fun facts". Competitive students don't care — they need exam-weighted concepts and PYQ-based explanations only. No unnecessary storytelling.
            - Structure the session as clear, numbered steps. For every step, state the reasoning (e.g. "We do this because...", "This step is important since...").
            ${includePYQ ? '- Include problem-solving aligned to Previous Year Question Papers (last 10 years). PYQ-based explanations only.' : ''}`
                : `You are teaching for CURRICULUM MODE (${board}, ${grade}). SYLLABUS-FIRST ONLY — non-negotiable.
            - AI teaches ONLY the selected topic. Content strictly mapped to the official curriculum syllabus. Teaching format: realistic visuals (diagrams, simulations, board-style explanations), natural voice narration. No cross-topic, no advanced shortcuts, no exam tricks here.
            - No JEE-level formulas. No NEET shortcuts. No unrelated or competitive-level depth. Use daily-life examples, NCERT/syllabus-aligned diagrams, step-by-step biological/physical process as appropriate — but never drift into JEE/NEET depth.
            - BRUTAL TRUTH: If your AI ever drifts into competitive-level depth here, you've failed curriculum trust. Stay strictly within board syllabus for this topic.
            - Use a SEAMLESS, FLOWING style: continuous prose, transitions like "Furthermore,", "Building on this,". Only for explicit worked numerical examples may you use brief numbered steps; for conceptual content, keep one flowing narrative.`;

            const promptControl = getPromptControlParams({
                curriculumType: curriculumType as 'school' | 'competitive',
                board: board ?? null,
                grade: grade ?? null,
                exam: (exam ?? null) as ExamType | null,
                subjectName: subjectName ?? null,
                topic: topicName,
                includePYQ,
            });
            const modeConstraint = getModeConstraintLine(promptControl);
            const profile = useUserStore.getState().profile;
            const personalizationInstructions = profile ? getPersonalizationInstructions(profile) : '';

            const prompt = `You are an expert AI tutor for ${domainInfo}. Generate a COMPREHENSIVE, HIGH-DEPTH teaching session for the topic "${topicName}".

            ### MODE CONSTRAINT (NON-NEGOTIABLE)
            ${modeConstraint}
            ${personalizationInstructions}

            ### NON-NEGOTIABLE: EXPLAIN STRICTLY BASED ON SELECTED SUBJECT AND TOPIC
            The AI MUST explain content strictly based on the selected subject and topic ("${topicName}") only.
            - No cross-topic, cross-subject, or out-of-syllabus visuals or explanations.
            - Do NOT introduce unrelated concepts, examples, or visuals outside the selected topic scope.
            - All content MUST stay within the syllabus and topic boundaries.

            ### EVERY TOPIC EXPLAINED WITH STATIC VISUALS AND SYNCHRONIZED VOICE (MANDATORY)
            Every section of this lesson MUST be taught with:
            1. **Static visual content only**: Use ONLY static visuals: diagrams, illustrations, board-style visuals. Provide visualType and detailed visualPrompt for EVERY section. All visuals must be directly, strictly, and exclusively related to the selected subject and topic only. No dynamic storytelling visuals or unrelated animations are allowed.
            2. **Voice narration synchronized with visuals**: A spokenContent script read aloud in sync with what is shown. The narration MUST explicitly reference what the learner is seeing (e.g. "As you look at this diagram...", "Notice in this illustration...") so that visual and voice are synchronized.
            3. **Topic-only visuals**: No generic, decorative, cross-topic, or out-of-syllabus visuals. Every diagram, illustration, or board-style visual must directly illustrate ONLY "${topicName}". Static visuals must be available and implemented for every topic and every subject; ensure complete visual coverage.

            ### MANDATORY: VISUALS STRICTLY AND EXCLUSIVELY FOR THIS TOPIC ONLY
            All visuals MUST be directly and strictly related to the selected subject and topic only. Do NOT use or describe generic, decorative, cross-topic, or off-syllabus visuals. Every visual must exclusively illustrate this topic and nothing else. Do NOT introduce unrelated visuals, concepts, examples, or topics beyond the selected scope.

            ### EASE OF UNDERSTANDING (MAKE CONTENT EASY FOR USERS)
            Make the content easy for users to understand:
            - Use clear, simple language; avoid unnecessary jargon. When technical terms are needed, define them when first used.
            - Build from simple to complex: start with the big picture, then add detail. Use concrete examples and real-world analogies.
            - Structure explanations so one idea leads naturally to the next. Use short paragraphs and clear transitions.
            - Tie every visual reference to the explanation so the visual and text together make the topic easy to grasp.

            ### CORE CURRICULUM CONSTRAINT:
            All content generated MUST align strictly with State Board syllabi. Do NOT include Central Board (CBSE/ICSE) specific variations or standards.

            ### MANDATORY STRUCTURAL FLOW:
            You MUST follow this exact sequence for the lesson:
            1. **Motivation**: ${curriculumType === 'competitive' ? 'One brief line on why this topic appears in the exam (no inspirational or storytelling motivation).' : 'Why this topic matters, real-world relevance.'}
            2. **Foundations**: Core definitions and basic concepts.
            3. **Step-by-Step Mechanisms**: Detailed breakdown of how it works.
            4. **In-Depth Examples**: Concrete applications and worked problems.
            5. **Misconception Clearing**: Address common errors.
            6. **Summary & Reflection**: Synthesize key takeaways.

            ### CURRICULUM-SPECIFIC TEACHING STYLE (MANDATORY — CONSISTENT ACROSS BOTH MODES):
            These rules apply to BOTH Curriculum and Competitive modes. Only the teaching style (seamless vs step-by-step) differs.
            ${curriculumTeachingStyle} 

            ### SESSION DEPTH & DURATION REQUIREMENTS:
            This session MUST provide at least 45 minutes of intensive instructional depth. A superficial or summary-based response is UNACCEPTABLE.
            - Generate 9-12 highly detailed learning sections.
            - Each section MUST represent 4-7 minutes of active teaching time.
            - Total estimated instructional weight MUST exceed 45 minutes.
            - Avoid repetition; ensure each section builds meaningfully on the last.
            - Do NOT artificially inflate content; provide genuine instructional value, examples, and deep analysis.

            ### CRITICAL VOICE & NARRATION REQUIREMENTS:
            Your content will be read aloud. ${curriculumType === 'competitive'
                    ? `Voice = ANALYTICAL, not narrative. Be clear and direct; no warm storytelling, no motivational check-ins. Use "we" and "let's" only for problem-solving steps. Never sound robotic or like a dry list.`
                    : `Write content that sounds NATURAL and HUMAN: conversational, pedagogical (warm but authoritative). Include natural pauses and varying sentence lengths. Use contractions and "we", "let's" for engagement. Never sound robotic. Periodically check in with the listener (e.g., "Now, you might be wondering why...").`}

            ### PEDAGOGICAL RULES:
            1. **TEACHING STYLE**: Follow the CURRICULUM-SPECIFIC STYLE (${curriculumType === 'competitive' ? 'Step-by-Step' : 'Seamless Narrative'}).
            2. **DEPTH**: Each section content window: 400-600 words minimum. Total word count should exceed 5000 words for the entire session.
            3. **VISUAL FOCUS**: ${visualAidInfo}
            4. **VISUAL + VOICE PER SECTION**: Every section MUST have BOTH a visual (visualType + visualPrompt) and a voice script (spokenContent). The spokenContent must reference the visual so that when read aloud, it is synchronized with what is shown (e.g. "In this diagram you can see...", "Watch as this animation demonstrates...").

            Return ONLY a JSON object with this structure. EVERY section MUST include visualType, visualPrompt, and spokenContent. Use only static visual types: diagram, illustration, or technical (board-style). No dynamic storytelling or unrelated animations. All visuals MUST be strictly and exclusively for the selected topic "${topicName}".
            {
              "title": "${topicName}",
              "sections": [
                { 
                  "title": "Section title", 
                  "content": "Extremely detailed written content (400-600 words)", 
                  "spokenContent": "Narration script read aloud in sync with the visual; MUST reference what the learner is seeing (e.g. 'As this diagram shows...', 'In this illustration...'). Same length as needed for the section duration.",
                  "durationMinutes": 6,
                  "visualType": "diagram | illustration | technical",
                  "visualPrompt": "Detailed description of the STATIC visual for THIS section ONLY. Must be strictly and exclusively about the topic "${topicName}". What exactly is shown on screen for this part of the lesson (diagram/illustration/board-style only)."
                }
              ],
              "summary": "Comprehensive, high-depth overall summary"
            }
            Ensure total durationMinutes is GREATER than 45. Every section must have synchronized static visual support and voice narration; all visuals exclusively for this topic. No dynamic storytelling visuals or unrelated animations.`;

            const result = await generateAITeachingContent(prompt, {
                curriculumContext: { curriculumType, board, grade, exam, subject: subjectName },
                retries: 3,
            });
            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to generate AI lesson.');
            }
            const content = result.data;
            const sections = Array.isArray(content?.sections) ? content.sections : [];
            const summary = typeof content?.summary === 'string' ? content.summary : '';
            type AISection = { title?: string; content?: string; durationMinutes?: number; visualType?: string; visualPrompt?: string; spokenContent?: string };
            const teachingSteps: TeachingStep[] = sections.map((section: AISection, index: number) => {
                // Use AI-provided duration or default to 5 minutes (300 seconds) per section for comprehensive coverage
                const durationMins = section?.durationMinutes ?? 5;
                const isSummaryStep = false; // summary step is added after
                // Every step must have both visual and voice: use AI-provided or topic-scoped fallbacks (strictly selected topic only)
                const stepVisualType = (section?.visualType as TeachingStep['visualType']) || (visualType as TeachingStep['visualType']) || 'diagram';
                const stepVisualPrompt = section?.visualPrompt || visualPrompt || (topicName ? `Visual for this section: ${topicName}` : 'Relevant to the current topic');
                const stepContent = section?.content ?? '';
                const stepSpoken = section?.spokenContent ?? section?.content ?? stepContent;
                return {
                    id: `${topicId}-ai-${index + 1}`,
                    stepNumber: index + 1,
                    title: section?.title ?? 'Section',
                    content: stepContent,
                    spokenContent: stepSpoken || stepContent, // ensure voice narration is never empty
                    visualType: isSummaryStep ? 'text' : stepVisualType,
                    visualPrompt: isSummaryStep ? undefined : (stepVisualPrompt || `Topic: ${topicName}`), // ensure every step has topic-only visual
                    durationSeconds: durationMins * 60,  // Convert minutes to seconds
                    completed: false,
                    complexity: index < 2 ? 'basic' : (index < 5 ? 'intermediate' : 'advanced'),
                    estimatedMinutes: durationMins,
                    keyConcepts: [],
                };
            });

            // Add summary step
            teachingSteps.push({
                id: `${topicId}-ai-summary`,
                stepNumber: teachingSteps.length + 1,
                title: 'Summary',
                content: summary,
                spokenContent: summary,
                visualType: 'diagram',
                visualPrompt: `Summary overview of ${topicName}`,
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
                curriculumType: curriculumType as CurriculumType,
                board: board as SchoolBoard | undefined,
                grade: grade,
                exam: exam as ExamType | undefined,
                subjectName: subjectName,
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
            const msg = error instanceof Error ? error.message : 'Failed to generate AI lesson.';
            const isBackendUnavailable = msg.includes('not reachable') || msg.includes('Start it with') || msg.includes('Failed to fetch');
            toast.error(isBackendUnavailable
                ? 'AI backend is unavailable. Start it with: npm run dev:backend (from project root).'
                : msg.length > 80 ? 'Failed to generate AI lesson. Try again.' : msg);
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
