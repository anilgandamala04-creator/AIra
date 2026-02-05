/**
 * Teaching Hooks
 * 
 * React hooks for teaching functionality with:
 * - Real-time state reflection for all settings
 * - Immediate UI updates based on selected options
 * - Production-grade reliability
 */

import { useEffect, useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTeachingStore } from '../stores/teachingStore';
import { useSettingsStore } from '../stores/settingsStore';
import {
  speak,
  stop,
  pause,
  resume,
  getBestVoice,
  getVisualForTopic,
  type TeachingContent,
} from '../services/teachingEngine';

// ============================================================================
// Types
// ============================================================================

interface TeachingState {
  isSessionActive: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  progress: number;
  topicName: string;
  visualComponent: string | null;
}

interface TeachingActions {
  startSpeaking: (content: TeachingContent) => Promise<void>;
  stopSpeaking: () => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
}

// ============================================================================
// Main Teaching Hook
// ============================================================================

/**
 * Main hook for teaching functionality
 * Provides real-time state and actions with settings synchronization
 */
export function useTeaching(): TeachingState & TeachingActions {
  const {
    currentSession,
    currentStep,
    isPaused: sessionPaused,
    isSpeaking: sessionSpeaking,
    nextStep: storeNextStep,
    previousStep: storePreviousStep,
    goToStep: storeGoToStep,
    setSpeaking,
    pause: storePause,
    resume: storeResume,
  } = useTeachingStore();

  const settings = useSettingsStore(useShallow((s) => s.settings));

  // Derive visual component for current topic
  const [visualComponent, setVisualComponent] = useState<string | null>(null);

  // Update visual when topic changes
  useEffect(() => {
    if (currentSession?.topicId && currentSession?.topicName) {
      const visual = getVisualForTopic(currentSession.topicId, currentSession.topicName);
      setVisualComponent(visual);
    } else {
      setVisualComponent(null);
    }
  }, [currentSession?.topicId, currentSession?.topicName]);

  // Sync TTS settings in real-time
  useEffect(() => {
    if (!settings.accessibility.textToSpeech && sessionSpeaking) {
      stop();
    }
  }, [settings.accessibility.textToSpeech, sessionSpeaking]);

  // Start speaking with current settings
  const startSpeaking = useCallback(async (content: TeachingContent) => {
    if (!settings.accessibility.textToSpeech) {
      return;
    }

    await speak({
      text: content.spokenContent,
      rate: settings.accessibility.ttsSpeed,
      voiceName: settings.accessibility.ttsVoice || undefined,
      language: settings.language,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: (error) => {
        console.error('Speech error:', error);
        setSpeaking(false);
      },
    });
  }, [settings, setSpeaking]);

  const stopSpeaking = useCallback(() => {
    stop();
  }, []);

  const pauseSpeaking = useCallback(() => {
    pause();
    storePause();
  }, [storePause]);

  const resumeSpeaking = useCallback(() => {
    resume();
    storeResume();
  }, [storeResume]);

  // Calculate progress
  const totalSteps = currentSession?.teachingSteps?.length || 0;
  const progress = totalSteps > 0
    ? Math.round(((currentStep + 1) / totalSteps) * 100)
    : 0;

  return {
    // State
    isSessionActive: !!currentSession,
    isSpeaking: sessionSpeaking,
    isPaused: sessionPaused,
    currentStep,
    totalSteps,
    progress,
    topicName: currentSession?.topicName || '',
    visualComponent,

    // Actions
    startSpeaking,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    nextStep: storeNextStep,
    previousStep: storePreviousStep,
    goToStep: storeGoToStep,
  };
}

// ============================================================================
// Voice Settings Hook
// ============================================================================

interface VoiceOption {
  name: string;
  lang: string;
  isRecommended: boolean;
}

/**
 * Hook for managing voice settings
 */
export function useVoiceSettings() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [currentVoice, setCurrentVoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const settings = useSettingsStore(useShallow((s) => s.settings));
  const updateAccessibility = useSettingsStore((s) => s.updateAccessibility);

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      setIsLoading(true);
      try {
        const voice = await getBestVoice(settings.language);
        const allVoices = speechSynthesis.getVoices();
        
        // Score and sort voices
        const voiceOptions: VoiceOption[] = allVoices
          .filter((v) => v.lang.startsWith(settings.language.split('-')[0]))
          .map((v, index) => ({
            name: v.name,
            lang: v.lang,
            isRecommended: index < 3,
          }));

        setVoices(voiceOptions);
        setCurrentVoice(settings.accessibility.ttsVoice || voice?.name || '');
      } catch (error) {
        console.error('Failed to load voices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoices();

    // Reload on voiceschanged
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [settings.language, settings.accessibility.ttsVoice]);

  // Change voice setting (reflects immediately)
  const setVoice = useCallback((voiceName: string) => {
    setCurrentVoice(voiceName);
    updateAccessibility({ ttsVoice: voiceName });
  }, [updateAccessibility]);

  // Change speed setting (reflects immediately)
  const setSpeed = useCallback((speed: number) => {
    updateAccessibility({ ttsSpeed: speed });
  }, [updateAccessibility]);

  // Toggle TTS (reflects immediately)
  const toggleTTS = useCallback((enabled: boolean) => {
    updateAccessibility({ textToSpeech: enabled });
    if (!enabled) {
      stop();
    }
  }, [updateAccessibility]);

  return {
    voices,
    currentVoice,
    speed: settings.accessibility.ttsSpeed,
    isEnabled: settings.accessibility.textToSpeech,
    isLoading,
    setVoice,
    setSpeed,
    toggleTTS,
  };
}

// ============================================================================
// Teaching Step Hook
// ============================================================================

/**
 * Hook for managing the current teaching step
 */
export function useCurrentStep() {
  const currentSession = useTeachingStore((s) => s.currentSession);
  const currentStepIndex = useTeachingStore((s) => s.currentStep);
  const getCurrentStepData = useTeachingStore((s) => s.getCurrentStepData);
  const completeStep = useTeachingStore((s) => s.completeStep);

  const stepData = getCurrentStepData();

  const markComplete = useCallback(() => {
    if (stepData) {
      completeStep(stepData.id);
    }
  }, [stepData, completeStep]);

  return {
    stepData,
    stepIndex: currentStepIndex,
    totalSteps: currentSession?.teachingSteps?.length || 0,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === (currentSession?.teachingSteps?.length || 1) - 1,
    isCompleted: stepData?.completed || false,
    markComplete,
  };
}

// All hooks are exported inline with their declarations above
