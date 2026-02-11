import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    HelpCircle,
    Play,
    Volume2,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { VoiceControls } from './VoiceControls';
import type { TeachingSession, TeachingStep } from '../../types';

interface SessionControlsProps {
    currentSession: TeachingSession | null;
    currentStep: number;
    currentStepData: TeachingStep | null;
    isSpeaking: boolean;
    isPaused: boolean;
    isMuted: boolean;
    isGeneratingAiLesson: boolean;
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
    onPrevious: () => void;
    onNext: () => void;
    onGenerateAi: () => void;
    onRaiseDoubt: () => void;
    onToggleMute: () => void;
    onPlayPause: () => void;
    onFinish: () => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
    currentSession,
    currentStep,
    currentStepData,
    isSpeaking,
    isPaused,
    isMuted,
    isGeneratingAiLesson,
    onPrevious,
    onNext,
    onGenerateAi,
    onRaiseDoubt,
    onToggleMute,
    onPlayPause,
    onFinish,
}) => {
    const totalSteps = currentSession?.totalSteps || 0;
    const isLastStep = totalSteps > 0 && currentStep >= totalSteps - 1;

    return (
        <div
            className="flex flex-row flex-nowrap items-center min-w-0 w-full max-w-full gap-[0.5em] overflow-visible"
            style={{ fontSize: 'clamp(0.5rem, 3.2vw, 1.25rem)' }}
        >
            <div className="flex flex-nowrap items-center flex-1 min-w-0 min-h-0 gap-[0.45em] overflow-visible">
                <button
                    onClick={onPrevious}
                    disabled={currentStep === 0 || !currentSession || !currentStepData}
                    className={`flex items-center justify-center gap-[0.25em] min-h-[2.5em] px-[0.5em] py-[0.4em] rounded-lg text-[1em] font-medium transition-all touch-manipulation shrink-0 whitespace-nowrap ${currentStep === 0 || !currentSession || !currentStepData
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 active:scale-95'
                        }`}
                    aria-label="Previous step"
                >
                    <ChevronLeft className="w-[1.1em] h-[1.1em] shrink-0" />
                    <span className="hidden md:inline">Previous</span>
                </button>

                <button
                    onClick={onGenerateAi}
                    disabled={isGeneratingAiLesson}
                    className="flex items-center justify-center gap-[0.25em] min-h-[2.5em] px-[0.5em] py-[0.4em] bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[1em] font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 touch-manipulation shrink-0 whitespace-nowrap"
                >
                    {isGeneratingAiLesson ? <Loader2 className="w-[1.1em] h-[1.1em] animate-spin shrink-0" /> : <Sparkles className="w-[1.1em] h-[1.1em] shrink-0" />}
                    <span className="md:hidden">AI</span>
                    <span className="hidden md:inline">Explain with AI</span>
                </button>

                <button
                    onClick={onRaiseDoubt}
                    className="flex items-center justify-center gap-[0.25em] min-h-[2.5em] px-[0.5em] py-[0.4em] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full text-[1em] font-medium transition-all active:scale-95 shadow-lg touch-manipulation shrink-0 whitespace-nowrap"
                    aria-label="Raise doubt"
                >
                    <HelpCircle className="w-[1.1em] h-[1.1em] shrink-0" />
                    <span className="hidden md:inline">Raise Doubt</span>
                </button>

                <VoiceControls
                    isMuted={isMuted}
                    onToggleMute={onToggleMute}
                    isSpeaking={isSpeaking}
                    isPaused={isPaused}
                />

                <button
                    type="button"
                    onClick={onPlayPause}
                    className={`flex items-center justify-center gap-[0.25em] min-h-[2.5em] px-[0.5em] py-[0.4em] rounded-full text-[1em] font-medium transition-all touch-manipulation border shadow-sm shrink-0 whitespace-nowrap ${!isSpeaking && !isPaused
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105 border-transparent'
                        : isPaused
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50'
                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                        }`}
                    aria-label={!isSpeaking && !isPaused ? 'Start lesson' : isPaused ? 'Resume' : 'Pause'}
                >
                    {!isSpeaking && !isPaused ? (
                        <>
                            <Play className="w-[1.1em] h-[1.1em] shrink-0" />
                            <span className="hidden md:inline">Start</span>
                        </>
                    ) : isPaused ? (
                        <>
                            <Play className="w-[1.1em] h-[1.1em] shrink-0" />
                            <span className="hidden md:inline">Resume</span>
                        </>
                    ) : (
                        <>
                            <Volume2 className="w-[1.1em] h-[1.1em] shrink-0" />
                            <span className="hidden md:inline">Pause</span>
                        </>
                    )}
                </button>

                {isLastStep ? (
                    <button
                        onClick={onFinish}
                        className="flex items-center justify-center gap-[0.25em] min-h-[2.5em] px-[1em] py-[0.4em] rounded-lg text-[1em] font-bold transition-all touch-manipulation shrink-0 whitespace-nowrap bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                        aria-label="Finish lesson"
                    >
                        <span className="hidden md:inline">Finish</span>
                        <CheckCircle2 className="w-[1.1em] h-[1.1em] shrink-0" />
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        disabled={!currentSession}
                        className={`flex items-center justify-center gap-[0.25em] min-h-[2.5em] px-[0.5em] py-[0.4em] rounded-lg text-[1em] font-medium transition-all touch-manipulation shrink-0 whitespace-nowrap ${!currentSession
                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                            : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 active:scale-95'
                            }`}
                        aria-label="Next step"
                    >
                        <span className="hidden md:inline">Next</span>
                        <ChevronRight className="w-[1.1em] h-[1.1em] shrink-0" />
                    </button>
                )}
            </div>
        </div>
    );
};
