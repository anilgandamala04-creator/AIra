import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useDoubtStore } from '../../stores/doubtStore';
import { useTeachingStore } from '../../stores/teachingStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { narrateText } from '../../services/narration';
import type { Doubt } from '../../types';
import {
    HelpCircle, Send, Loader2, CheckCircle,
    Lightbulb, BookOpen, ChevronDown, ChevronUp, Volume2, Eye, Search
} from 'lucide-react';
import { getTopicVisual } from './topicVisualRegistry';

const DRAFT_KEY_PREFIX = 'aira-doubt-draft-';
function getDraftKey(sessionId: string) {
    return `${DRAFT_KEY_PREFIX}${sessionId}`;
}

interface DoubtPanelProps {
    sessionId: string;
    onDoubtRaised?: () => void;
}

export default function DoubtPanel({ sessionId, onDoubtRaised }: DoubtPanelProps) {
    const [question, setQuestionState] = useState('');
    const [expanded, setExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const setQuestion = useCallback((value: string | ((prev: string) => string)) => {
        setQuestionState((prev) => {
            const next = typeof value === 'function' ? value(prev) : value;
            try {
                if (next.trim()) localStorage.setItem(getDraftKey(sessionId), next);
                else localStorage.removeItem(getDraftKey(sessionId));
            } catch {
                // ignore
            }
            return next;
        });
    }, [sessionId]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(getDraftKey(sessionId));
            if (saved != null) setQuestionState(saved);
        } catch {
            // ignore
        }
    }, [sessionId]);

    const { currentStep, currentSession } = useTeachingStore(
        useShallow((state) => ({
            currentStep: state.currentStep,
            currentSession: state.currentSession,
        }))
    );
    const {
        activeDoubt,
        isResolvingDoubt,
        raiseDoubt,
        getSessionDoubts,
    } = useDoubtStore();
    const ttsEnabled = useSettingsStore((state) => state.settings.accessibility.textToSpeech);

    const sessionDoubts = getSessionDoubts(sessionId);
    const filteredDoubts = searchQuery.trim()
        ? sessionDoubts.filter(
            (d) =>
                d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.context.stepTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.resolution?.explanation?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : sessionDoubts;

    const handleSubmitDoubt = () => {
        if (!question.trim() || !currentSession || !currentSession.teachingSteps || currentSession.teachingSteps.length === 0) {
            return;
        }

        // Safe bounds checking
        const safeStep = Math.max(0, Math.min(currentStep, currentSession.teachingSteps.length - 1));
        const stepData = currentSession.teachingSteps[safeStep] || null;

        try {
            raiseDoubt(
                question,
                sessionId,
                safeStep + 1,
                stepData?.title || 'Unknown Step'
            );
        } catch (error) {
            console.error('Failed to raise doubt:', error);
        }
        setQuestionState('');
        try {
            localStorage.removeItem(getDraftKey(sessionId));
        } catch {
            // ignore
        }
        onDoubtRaised?.();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header with toggle */}
            <div
                className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-gray-700 dark:text-slate-200">Ask a Doubt</span>
                    {sessionDoubts.length > 0 && (
                        <span className="w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                            {sessionDoubts.length}
                        </span>
                    )}
                </div>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                )}
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex-1 min-h-0 flex flex-col overflow-hidden"
                    >
                        {/* Search within doubts */}
                        {sessionDoubts.length > 0 && (
                            <div className="p-2 border-b border-gray-100 dark:border-slate-700">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search doubts..."
                                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-400"
                                    />
                                </div>
                            </div>
                        )}
                        {/* Previous doubts */}
                        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 space-y-3">
                            {filteredDoubts.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 dark:text-slate-500">
                                    <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">{searchQuery.trim() ? 'No matching doubts' : 'No doubts yet'}</p>
                                    <p className="text-xs mt-1">{searchQuery.trim() ? 'Try a different search' : 'Ask anything about the current topic!'}</p>
                                </div>
                            ) : (
                                filteredDoubts.map((doubt) => (
                                    <DoubtCard
                                        key={doubt.id}
                                        doubt={doubt}
                                        isActive={activeDoubt?.id === doubt.id}
                                        ttsEnabled={ttsEnabled}
                                        subjectName={currentSession?.subjectName}
                                    />
                                ))
                            )}

                            {/* Loading state */}
                            {isResolvingDoubt && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-slate-800 rounded-xl text-purple-600 dark:text-purple-300"
                                >
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">AI is analyzing your doubt...</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Input area */}
                        <div className="p-3 border-t border-gray-200 dark:border-slate-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitDoubt()}
                                    placeholder="What don't you understand?"
                                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-900/60 rounded-lg border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                    disabled={isResolvingDoubt}
                                />
                                <button
                                    onClick={handleSubmitDoubt}
                                    disabled={!question.trim() || isResolvingDoubt}
                                    className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                The lesson will pause while your doubt is resolved
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Individual doubt card component
function DoubtCard({ doubt, isActive, ttsEnabled, subjectName }: { doubt: Doubt; isActive: boolean; ttsEnabled: boolean; subjectName?: string }) {
    const [showDetails, setShowDetails] = useState(isActive);

    const statusColors = {
        pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        resolving: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        resolved: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border ${isActive ? 'border-purple-300 bg-purple-50 dark:bg-slate-800 dark:border-purple-700' : 'border-gray-200 bg-white dark:bg-slate-900/40 dark:border-slate-700'}`}
        >
            <div
                className="p-3 cursor-pointer"
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-100">{doubt.question}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            Step {doubt.context.stepNumber}: {doubt.context.stepTitle}
                        </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[doubt.status]}`}>
                        {doubt.status}
                    </span>
                </div>
            </div>

            <AnimatePresence>
                {showDetails && doubt.resolution && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 dark:border-slate-700"
                    >
                        <div className="p-3 space-y-3">
                            {/* Explanation */}
                            <div className="flex gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Explanation</p>
                                        <button
                                            type="button"
                                            onClick={() => narrateText(doubt.resolution?.explanation || '', { enabled: ttsEnabled })}
                                            className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                            disabled={!ttsEnabled}
                                            aria-label="Listen to explanation"
                                        >
                                            <Volume2 className="w-3 h-3" />
                                            Listen
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-slate-200 whitespace-pre-line">
                                        {doubt.resolution.explanation}
                                    </p>
                                </div>
                            </div>

                            {/* Visual Aid - Always shown (Visual-Only Mode) */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-purple-500 shrink-0" />
                                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Visual Aid</p>
                                </div>
                                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-100 dark:border-slate-800 flex items-center justify-center p-4">
                                    {(() => {
                                        const VisualComp = getTopicVisual('', {
                                            visualType: doubt.resolution.visualType,
                                            visualPrompt: doubt.resolution.visualPrompt,
                                            subjectName: subjectName
                                        });
                                        if (!VisualComp) return null;
                                        return (
                                            <VisualComp
                                                isSpeaking={false}
                                                isPaused={true}
                                                stepId={doubt.id}
                                                title="Visual Explanation"
                                                visualType={doubt.resolution.visualType}
                                                visualPrompt={doubt.resolution.visualPrompt}
                                                topicName={subjectName || "Topic"}
                                            />
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Examples */}
                            {doubt.resolution.examples && doubt.resolution.examples.length > 0 && (
                                <div className="flex gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Examples</p>
                                        <ul className="space-y-1">
                                            {doubt.resolution.examples.map((example, i) => (
                                                <li key={i} className="text-sm text-gray-600 dark:text-slate-300 flex items-start gap-1">
                                                    <span className="text-blue-400">•</span>
                                                    {example}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}



                            {/* Confirmation */}
                            {doubt.resolution.understandingConfirmed && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-600 dark:text-green-300">Understanding confirmed</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
