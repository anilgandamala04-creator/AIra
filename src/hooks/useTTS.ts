import { useEffect, useRef } from 'react';
import { toast } from '../stores/toastStore';
import { TeachingSession, TeachingStep, AppSettings } from '../types';
import { applyAiTutorStyleToSpokenText, pickBestHumanVoice } from '../utils/voice';

interface UseTTSProps {
    currentSession: TeachingSession | null;
    currentStep: number;
    currentStepData: TeachingStep | null;
    isPaused: boolean;
    isMuted: boolean;
    isSpeaking: boolean;
    settings: AppSettings;
    setSpeaking: (speaking: boolean) => void;
    nextStep: () => void;

    pause: () => void;
    setLastUserAction: (action: string | null) => void;
    selectedSubject: string | null;
}

export function useTTS({
    currentSession,
    currentStep,
    currentStepData,
    isPaused,
    isMuted,
    isSpeaking,
    settings,
    setSpeaking,
    nextStep,

    pause,
    setLastUserAction,
    selectedSubject
}: UseTTSProps) {
    const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        return () => {
            timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
            timeoutRefs.current = [];
        };
    }, []);

    useEffect(() => {
        // Check if speechSynthesis API is available
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            return;
        }

        if (!currentSession || !currentStepData?.spokenContent) return;

        // Check if TTS is enabled in settings
        if (!settings.accessibility?.textToSpeech) return;

        let utterance: SpeechSynthesisUtterance | null = null;
        let autoAdvanceTimeout: ReturnType<typeof setTimeout> | null = null;
        let voicesChangedHandler: (() => void) | null = null;
        let isMounted = true;

        const cleanup = () => {
            if (autoAdvanceTimeout) {
                clearTimeout(autoAdvanceTimeout);
                autoAdvanceTimeout = null;
            }
            if (voicesChangedHandler && window.speechSynthesis) {
                window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
                voicesChangedHandler = null;
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if (isMounted) {
                setSpeaking(false);
            }
        };

        // Auto-start speaking when step changes, if not paused and not muted
        if (!isPaused && !isMuted) {
            cleanup(); // Cancel previous

            // Ensure voices are loaded (Web Speech API quirk)
            const loadVoices = () => {
                if (!window.speechSynthesis || !isMounted) return;
                const voices = window.speechSynthesis.getVoices();
                if (voices.length === 0) {
                    // Voices not loaded yet, wait for voiceschanged event
                    voicesChangedHandler = () => {
                        if (window.speechSynthesis && isMounted) {
                            const loadedVoices = window.speechSynthesis.getVoices();
                            if (loadedVoices.length > 0) {
                                speakWithVoices(loadedVoices);
                            }
                        }
                    };
                    window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
                    return;
                }
                speakWithVoices(voices);
            };

            const speakWithVoices = (voices: SpeechSynthesisVoice[]) => {
                if (!currentStepData?.spokenContent || !window.speechSynthesis || !isMounted) return;

                // Enhanced text processing for more natural, engaging speech
                let processedText = applyAiTutorStyleToSpokenText(
                    currentStepData.spokenContent,
                    settings.aiTutor,
                    currentSession?.topicName,
                    selectedSubject
                )
                    // Add emphasis markers for key concepts (will be processed)
                    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove markdown bold but keep emphasis
                    .replace(/\*(.+?)\*/g, '$1') // Remove markdown italic
                    // Strategic pauses for better comprehension - more natural rhythm
                    .replace(/\.\s+/g, '. ... ') // Longer pause after sentences
                    .replace(/\?\s+/g, '? ... ... ') // Longer pause after questions
                    .replace(/!\s+/g, '! ... ') // Pause after exclamations
                    .replace(/,\s+/g, ', .. ') // Medium pause after commas
                    .replace(/;\s+/g, '; ... ') // Pause after semicolons
                    .replace(/:\s+/g, ': .. ') // Pause after colons
                    // Paragraph breaks - longer pauses for concept transitions
                    .replace(/\n\n+/g, ' ... ... ... ')
                    .replace(/\n/g, ' ... ')
                    // Add natural emphasis to important phrases
                    .replace(/\b(important|key|critical|essential|fundamental|crucial|vital)\b/gi, (match) => {
                        return `${match} ... `; // Extra pause for emphasis
                    })
                    // Add engaging transitions for better flow
                    .replace(/\b(notice|observe|see|look|watch)\b/gi, (match) => {
                        return `${match} ... `; // Pause to let visuals sync
                    })
                    // Clean up multiple spaces
                    .replace(/\s+/g, ' ')
                    .trim();

                // Add engaging teaching phrases at natural break points for more realistic teaching
                const teachingPhrases = [
                    'Let me explain this clearly',
                    'Notice how this works',
                    'Pay close attention here',
                    'This is really interesting',
                    'Here\'s what\'s happening',
                    'Let\'s break this down',
                    'This is the key point',
                    'Think about this for a moment'
                ];

                // Add natural opening if missing - more engaging and teacher-like
                const lowerText = processedText.toLowerCase();
                if (!lowerText.startsWith('hello') &&
                    !lowerText.startsWith('welcome') &&
                    !lowerText.startsWith('now') &&
                    !lowerText.startsWith('let') &&
                    !lowerText.startsWith('here') &&
                    !lowerText.startsWith('this')) {
                    // Randomly select an engaging opening phrase
                    const randomPhrase = teachingPhrases[Math.floor(Math.random() * teachingPhrases.length)];
                    processedText = `${randomPhrase}. ... ${processedText}`;
                }

                utterance = new SpeechSynthesisUtterance(processedText);

                // Enhanced speech parameters for engaging, realistic teaching
                const baseRate = settings.accessibility?.ttsSpeed || 0.90;
                utterance.rate = Math.max(0.75, Math.min(1.1, baseRate));

                // Varied pitch for more natural, engaging expression
                const hasQuestion = processedText.includes('?');
                const hasExclamation = processedText.includes('!');
                utterance.pitch = hasQuestion ? 1.08 : hasExclamation ? 1.10 : 1.05;

                // Full volume for clear teaching
                utterance.volume = 1.0;

                const preferredVoiceName = settings.accessibility?.ttsVoice;

                if (preferredVoiceName && preferredVoiceName !== 'default' && preferredVoiceName !== '') {
                    const voice = voices.find(v => v.name === preferredVoiceName);
                    if (voice) utterance.voice = voice;
                } else {
                    const autoVoice = pickBestHumanVoice(voices, {
                        language: settings.language || 'en',
                    });
                    if (autoVoice) utterance.voice = autoVoice;
                }

                utterance.onstart = () => {
                    if (isMounted && currentStepData?.id) {
                        setSpeaking(true);
                        // Emit event for visual synchronization
                        window.dispatchEvent(new CustomEvent('speech-start', {
                            detail: {
                                stepId: currentStepData.id,
                                title: currentStepData.title || '',
                                content: currentStepData.content || ''
                            }
                        }));
                        // Emit teaching-started event for UI feedback
                        window.dispatchEvent(new CustomEvent('teaching-started', {
                            detail: { stepId: currentStepData.id }
                        }));
                    }
                };

                // Emit speech-boundary for visual components and captions
                utterance.onboundary = (event) => {
                    if (isMounted && processedText.length > 0 && currentStepData?.id) {
                        const progress = Math.min(100, Math.max(0, (event.charIndex / processedText.length) * 100));
                        const charLen = event.charLength ?? 1;
                        const currentPhrase = processedText.substring(event.charIndex, Math.min(event.charIndex + charLen, processedText.length)).trim();
                        window.dispatchEvent(new CustomEvent('speech-boundary', {
                            detail: {
                                type: event.name || 'word',
                                charIndex: event.charIndex,
                                progress,
                                stepId: currentStepData.id,
                                currentPhrase: currentPhrase || undefined,
                            }
                        }));
                    }
                };
                utterance.onend = () => {
                    if (!isMounted) return;
                    setSpeaking(false);
                    // Emit event for visual components
                    if (currentStepData?.id) {
                        window.dispatchEvent(new CustomEvent('speech-end', {
                            detail: {
                                stepId: currentStepData.id,
                                completed: true
                            }
                        }));
                        // Emit teaching-completed event for UI feedback
                        window.dispatchEvent(new CustomEvent('teaching-completed', {
                            detail: { stepId: currentStepData.id }
                        }));
                    }
                    // Auto-advance logic
                    if (currentSession &&
                        currentSession.teachingSteps &&
                        currentSession.teachingSteps.length > 0 &&
                        currentStep >= 0 &&
                        currentStep < currentSession.totalSteps - 1) {
                        autoAdvanceTimeout = setTimeout(() => {
                            if (isMounted) {
                                // Visual feedback for auto-advance
                                setLastUserAction('auto-advance');
                                const autoAdvanceFeedbackTimeout = setTimeout(() => setLastUserAction(null), 1500);
                                timeoutRefs.current.push(autoAdvanceFeedbackTimeout);
                                nextStep();
                            }
                        }, 1500);
                        timeoutRefs.current.push(autoAdvanceTimeout);
                    }
                };
                utterance.onerror = (error) => {
                    console.error('Speech synthesis error:', error);
                    if (isMounted) {
                        setSpeaking(false);
                    }
                };

                try {
                    window.speechSynthesis.speak(utterance);
                } catch (error) {
                    console.error('Failed to speak:', error);
                    if (isMounted) {
                        setSpeaking(false);
                    }
                }
            };

            loadVoices();
        } else {
            // If paused or muted, stop speaking
            cleanup();
        }

        return () => {
            isMounted = false;
            cleanup();
        };
    }, [
        currentStep,
        isPaused,
        isMuted,
        currentSession,
        currentSession?.topicName,
        currentStepData?.spokenContent,
        currentStepData?.id,
        currentStepData?.title,
        currentStepData?.content,
        setSpeaking,
        nextStep,
        settings.accessibility?.textToSpeech,
        settings.accessibility?.ttsSpeed,
        settings.accessibility?.ttsVoice,
        settings.language,
        settings.aiTutor,
        selectedSubject,
        setLastUserAction,
    ]);

    // Pause TTS and lesson when tab is hidden (Page Visibility API)
    const pausedByVisibilityRef = useRef(false);
    useEffect(() => {
        const handleVisibility = () => {
            if (typeof document === 'undefined') return;
            if (document.hidden) {
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.pause();
                }
                if (isSpeaking && !isPaused) {
                    pausedByVisibilityRef.current = true;
                    pause();
                    setSpeaking(false);
                }
            } else {
                if (pausedByVisibilityRef.current && isPaused) {
                    pausedByVisibilityRef.current = false;
                    toast.info('Lesson was paused while the tab was in the background. Tap Resume to continue.');
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [isSpeaking, isPaused, pause, setSpeaking]);
}
