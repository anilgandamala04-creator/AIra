import { motion, AnimatePresence } from 'framer-motion';
import { getTopicVisual } from './topicVisualRegistry';
import TTSCaptionOverlay from './TTSCaptionOverlay';
import { findTopicById } from '../../data/curriculumData';
import { formatTopicName } from '../../utils/topicUtils';
import type { TeachingStep, TeachingSession } from '../../types';

interface TeachingBoardProps {
    currentStep: number;
    currentStepData: TeachingStep | null;
    currentSession: TeachingSession | null;
    topicId: string | undefined;
    isSpeaking: boolean;
    isPaused: boolean;
    selectedSubject: string | null;
}

export const TeachingBoard: React.FC<TeachingBoardProps> = ({
    currentStep,
    currentStepData,
    currentSession,
    topicId,
    isSpeaking,
    isPaused,
    selectedSubject,
}) => {
    if (!currentStepData) {
        return (
            <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                <div className="text-center shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-4"></div>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400">Loading lesson content...</p>
                </div>
            </div>
        );
    }

    const topicData = findTopicById(topicId || '');
    const visualType = currentStepData.visualType ?? topicData?.visualType;
    const visualPrompt = currentStepData.visualPrompt ?? topicData?.visualPrompt;
    const topicName = currentSession?.topicName || topicData?.name || (topicId ? formatTopicName(topicId) : '');

    const TopicVisual = getTopicVisual(topicId || '', {
        visualType,
        visualPrompt,
        subjectName: selectedSubject || undefined,
        strictTopicOnly: true,
    });

    const totalSteps = currentSession?.totalSteps || 0;

    return (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex-1 min-h-0 flex flex-col overflow-hidden"
                >
                    <div className="flex-1 min-h-0 flex flex-col rounded-xl shadow-2xl overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-950 p-1">
                        <div className="flex-1 min-h-0 rounded-lg bg-gradient-to-b from-emerald-800 to-emerald-900 p-2 sm:p-4 relative overflow-hidden flex flex-col">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0idHJhbnNwYXJlbnQiLz4KPGxpbmUgeDE9IjAiIHkxPSIyMCIgeDI9IjIwIiB5Mj0iMjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxsaW5lIHgxPSIyMCIgeTE9IjAiIHgyPSIyMCIgeTI9IjIwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50"></div>

                            {TopicVisual && (
                                <div className="relative z-10 flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden p-1">
                                    <TTSCaptionOverlay stepId={currentStepData.id || ''} />
                                    <div className="w-full h-full min-w-0 min-h-0 flex items-center justify-center">
                                        <TopicVisual
                                            isSpeaking={isSpeaking && !isPaused}
                                            isPaused={isPaused}
                                            stepId={currentStepData.id || ''}
                                            title={currentStepData.title}
                                            visualType={visualType}
                                            visualPrompt={visualPrompt}
                                            topicName={topicName}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {totalSteps > 0 && currentStep === totalSteps - 1 && currentSession?.teachingSteps && (() => {
                        const allKeyConcepts = currentSession.teachingSteps
                            .flatMap((s) => (s.keyConcepts ?? []))
                            .filter((k, i, arr) => arr.indexOf(k) === i);
                        const stepTitles = currentSession.teachingSteps
                            .map((s) => s.title)
                            .filter(Boolean);
                        const keyPoints = allKeyConcepts.length > 0 ? allKeyConcepts : stepTitles.slice(0, 6);
                        if (keyPoints.length === 0) return null;
                        return (
                            <div className="mt-4 p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50" data-reading-content>
                                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Key points</h4>
                                <ul className="text-sm text-amber-900 dark:text-amber-100 space-y-1 list-disc list-inside">
                                    {keyPoints.map((p, i) => (
                                        <li key={i}>{p}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
