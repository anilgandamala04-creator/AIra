import { useEffect, useState } from 'react';
import { useSpeechSync } from '../../../hooks/useSpeechSync';

// Visual Props interface
export interface VisualProps {
    isSpeaking: boolean;
    isPaused: boolean;
    stepId: string;
    title?: string;
    visualType?: string;
    visualPrompt?: string;
    /** Selected topic name – ensures visual is strictly relevant to this topic */
    topicName?: string;
}

/**
 * Enhanced visual component wrapper that syncs with speech
 * This hook provides speech-synchronized animation values
 */
export function useVisualSync(stepId: string, isSpeaking: boolean) {
    const { speechProgress, currentSentence } = useSpeechSync(stepId);
    const [animationIntensity, setAnimationIntensity] = useState(0);

    useEffect(() => {
        if (isSpeaking) {
            // Increase animation intensity based on speech progress
            setAnimationIntensity(Math.min(1, speechProgress / 100));
        } else {
            setAnimationIntensity(0);
        }
    }, [isSpeaking, speechProgress]);

    return { speechProgress, currentSentence, animationIntensity };
}

/**
 * Simple speech sync hook for components that only need basic timing
 */
export function useSpeechSyncOnly(stepId: string) {
    return useSpeechSync(stepId);
}
