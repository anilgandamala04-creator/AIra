import { useEffect, useRef, useState, useCallback } from 'react';
import { useTeachingStore } from '../stores/teachingStore';
import { getStaticCourse } from '../data/courses';

const SESSION_RESUME_KEY = 'aira_lesson_resume';
const SESSION_RESUME_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

export function useSessionManager(topicId: string | undefined) {
    const {
        currentSession,
        currentStep,
        nextStep,
        previousStep,
        pause,
        resume,
    } = useTeachingStore();

    const [showResumePrompt, setShowResumePrompt] = useState<number | null>(null);
    const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
    const resumeCheckDoneRef = useRef(false);

    // Persist current topic + step for session recovery
    useEffect(() => {
        if (!topicId || !currentSession || currentSession.topicId !== topicId) return;
        try {
            sessionStorage.setItem(SESSION_RESUME_KEY, JSON.stringify({
                topicId,
                topicName: currentSession.topicName,
                stepIndex: currentStep,
                ts: Date.now(),
            }));
        } catch {
            // ignore
        }
    }, [topicId, currentSession, currentStep]);

    // On load, offer resume from sessionStorage
    useEffect(() => {
        if (!topicId || !currentSession || currentSession.topicId !== topicId || resumeCheckDoneRef.current) return;
        resumeCheckDoneRef.current = true;
        try {
            const raw = sessionStorage.getItem(SESSION_RESUME_KEY);
            if (!raw) return;
            const data = JSON.parse(raw) as { topicId: string; stepIndex: number; ts: number };
            if (data.topicId !== topicId || Date.now() - (data.ts || 0) > SESSION_RESUME_MAX_AGE_MS) return;
            const step = Math.max(0, data.stepIndex ?? 0);
            if (step > 0 && currentSession.teachingSteps && step < currentSession.teachingSteps.length) {
                setShowResumePrompt(step);
            }
        } catch {
            // ignore
        }
    }, [topicId, currentSession]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? '') || target?.isContentEditable;
            if (isInput) return;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextStep();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                previousStep();
            } else if (e.key === ' ') {
                e.preventDefault();
                const { isPaused } = useTeachingStore.getState();
                if (isPaused) resume();
                else pause();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [nextStep, previousStep, pause, resume]);

    const clearSessionStorage = useCallback(() => {
        try {
            sessionStorage.removeItem(SESSION_RESUME_KEY);
        } catch {
            // ignore
        }
    }, []);

    const isComingSoonTopic = Boolean(topicId && currentSession?.topicId === topicId && !getStaticCourse(topicId));

    return {
        showResumePrompt,
        setShowResumePrompt,
        timeoutRefs,
        clearSessionStorage,
        isComingSoonTopic,
    };
}
