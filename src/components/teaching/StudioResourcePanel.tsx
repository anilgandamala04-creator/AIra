import React from 'react';
import {
    FileText,
    CreditCard,
    Map,
    HelpCircle,
    Sparkles,
    Download,
    Loader2,
    Trash2
} from 'lucide-react';
import NotesViewer from '../studio/NotesViewer';
import MindMapViewer from '../studio/MindMapViewer';
import FlashcardViewer from '../studio/FlashcardViewer';
import QuizViewer from '../studio/QuizViewer';
import type { TeachingSession, MindMap, Flashcard, GeneratedNote } from '../../types';

interface StudioResourcePanelProps {
    t: (key: string) => string;
    activeStudioTab: string;
    setActiveStudioTab: (tab: string) => void;
    studioSavedAt: { tab: string; at: number } | null;
    currentSession: TeachingSession | null;
    sessionNotes: GeneratedNote[];
    sessionMindMaps: MindMap[];
    sessionFlashcards: Flashcard[];
    isGeneratingNotes: boolean;
    isGeneratingMindMap: boolean;
    isGeneratingFlashcards: boolean;
    onGenerateNotes: () => void;
    onGenerateMindMap: () => void;
    onGenerateFlashcards: () => void;
    onUpdateNote: (id: string, updates: Partial<GeneratedNote>) => void;
    onDeleteResource: (type: 'note' | 'flashcard' | 'mindmap', id: string, title: string) => void;
    onDownloadTranscript: () => void;
    onNavigateToTopic: (id: string) => void;
    getSimilarTopics: (id: string) => Array<{ id: string; name: string }>;
    topicId: string | undefined;
    setMobilePanel: (panel: 'home' | 'teach' | 'studio') => void;
}

export const StudioResourcePanel: React.FC<StudioResourcePanelProps> = ({
    t,
    activeStudioTab,
    setActiveStudioTab,
    studioSavedAt,
    currentSession,
    sessionNotes,
    sessionMindMaps,
    sessionFlashcards,
    isGeneratingNotes,
    isGeneratingMindMap,
    isGeneratingFlashcards,
    onGenerateNotes,
    onGenerateMindMap,
    onGenerateFlashcards,
    onUpdateNote,
    onDeleteResource,
    onDownloadTranscript,
    onNavigateToTopic,
    getSimilarTopics,
    topicId,
    setMobilePanel,
}) => {
    const tools = [
        { id: 'notes', icon: FileText, label: t('notes') },
        { id: 'flashcards', icon: CreditCard, label: t('flashcards') },
        { id: 'mindmap', icon: Map, label: t('mindMap') },
        { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
        { id: 'summary', icon: Sparkles, label: 'Summary' },
    ];

    return (
        <>
            <div className="panel-header border-0 flex items-center justify-between">
                <div className="flex-1 min-w-0 flex justify-end items-center" aria-hidden />
                <h2 className="panel-title truncate shrink-0 px-2 text-center">{t('studio')} Panel</h2>
                <div className="flex-1 min-w-0 flex justify-end items-center gap-2">
                    {studioSavedAt && activeStudioTab === studioSavedAt.tab && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved</span>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" style={{ padding: 'var(--panel-padding)', paddingTop: 0 }}>
                <div className="flex flex-col w-full" style={{ gap: 'var(--stack-gap)' }}>
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveStudioTab(tool.id)}
                            className={`w-full flex items-center gap-2 transition-ui shrink-0 active:scale-[0.99] ${activeStudioTab === tool.id
                                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50'
                                : 'bg-[#F5F6F7] dark:bg-slate-800 hover:bg-[#E8E9EB] dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700'
                                }`}
                            style={{
                                minHeight: 'var(--studio-block-min-height)',
                                padding: 'var(--panel-padding)',
                                borderRadius: 'var(--studio-card-radius)',
                                border: '1px solid'
                            }}
                        >
                            <tool.icon className={`w-5 h-5 shrink-0 ${activeStudioTab === tool.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-slate-400'}`} aria-hidden />
                            <span className="font-medium text-sm">{tool.label}</span>
                        </button>
                    ))}
                </div>

                <div className="w-full" style={{ marginTop: 'var(--stack-gap)' }}>
                    {activeStudioTab === 'summary' && (
                        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm">
                            <div className="panel-header border-0 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 uppercase tracking-wider truncate min-w-0">Lesson Summary</h3>
                                {currentSession?.teachingSteps && currentSession.teachingSteps.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={onDownloadTranscript}
                                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                        title="Download transcript"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mb-4">
                                        <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium italic">
                                            "Everything you've learned, distilled into its most essential parts."
                                        </p>
                                    </div>
                                    <div className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {currentSession?.teachingSteps.find(s => s.title.toLowerCase().includes('summary'))?.content || "Completing the lesson will unlock the final summary."}
                                    </div>
                                    {currentSession?.teachingSteps && currentSession.teachingSteps.length > 0 && (
                                        <details className="mt-4 group">
                                            <summary className="cursor-pointer text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
                                                View full transcript
                                            </summary>
                                            <pre className="mt-2 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs text-gray-700 dark:text-slate-300 overflow-x-auto max-h-60 overflow-y-auto">
                                                {currentSession.teachingSteps.map((s, i) => `${i + 1}. ${s.title}\n\n${s.content || s.spokenContent || ''}`).join('\n\n')}
                                            </pre>
                                        </details>
                                    )}
                                    {topicId && getSimilarTopics(topicId).length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                                            <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">You might also like</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {getSimilarTopics(topicId).map((t) => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => onNavigateToTopic(t.id)}
                                                        className="px-3 py-2 text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition-colors"
                                                    >
                                                        {t.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStudioTab === 'notes' && (
                        <div className="space-y-3">
                            <button
                                onClick={onGenerateNotes}
                                disabled={isGeneratingNotes}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGeneratingNotes ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><FileText className="w-4 h-4" /> Generate Notes</>}
                            </button>
                            {sessionNotes.length > 0 ? (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => onDeleteResource('note', sessionNotes[sessionNotes.length - 1].id, sessionNotes[sessionNotes.length - 1].title)}
                                        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <NotesViewer
                                        note={sessionNotes[sessionNotes.length - 1]}
                                        onPin={(pinned) => onUpdateNote(sessionNotes[sessionNotes.length - 1].id, { pinned })}
                                        onArchive={(archived) => onUpdateNote(sessionNotes[sessionNotes.length - 1].id, { archived })}
                                        onUpdateNote={(updates) => onUpdateNote(sessionNotes[sessionNotes.length - 1].id, updates)}
                                    />
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-slate-600">
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">No notes yet. Generate notes from a lesson to see them here.</p>
                                    <button type="button" onClick={() => setMobilePanel('teach')} className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline">Go to Teaching →</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeStudioTab === 'mindmap' && (
                        <div className="space-y-3">
                            <button
                                onClick={onGenerateMindMap}
                                disabled={isGeneratingMindMap}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGeneratingMindMap ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Map className="w-4 h-4" /> Generate Mind Map</>}
                            </button>
                            {sessionMindMaps.length > 0 ? (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => onDeleteResource('mindmap', sessionMindMaps[sessionMindMaps.length - 1].id, sessionMindMaps[sessionMindMaps.length - 1].centralTopic || 'Mind map')}
                                        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <MindMapViewer mindMap={sessionMindMaps[sessionMindMaps.length - 1]} />
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-slate-600 min-h-[200px] flex flex-col items-center justify-center gap-2">
                                    <p className="text-xs text-gray-400 dark:text-slate-500">No mind map yet.</p>
                                    <button type="button" onClick={() => setMobilePanel('teach')} className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline">Go to Teaching →</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeStudioTab === 'flashcards' && (
                        <div className="space-y-3">
                            <button
                                onClick={onGenerateFlashcards}
                                disabled={isGeneratingFlashcards}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGeneratingFlashcards ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><CreditCard className="w-4 h-4" /> Generate Flashcards</>}
                            </button>
                            {sessionFlashcards.length > 0 ? (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => onDeleteResource('flashcard', sessionFlashcards[sessionFlashcards.length - 1].id, 'Flashcards')}
                                        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <FlashcardViewer flashcards={sessionFlashcards} />
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-slate-600 min-h-[200px] flex flex-col items-center justify-center gap-2">
                                    <p className="text-xs text-gray-400 dark:text-slate-500">No flashcards yet.</p>
                                    <button type="button" onClick={() => setMobilePanel('teach')} className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline">Go to Teaching →</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeStudioTab === 'quiz' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm min-h-[400px]">
                            <QuizViewer topicId={topicId} topic={topicId || 'General'} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
