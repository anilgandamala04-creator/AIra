/**
 * Review page — Due today flashcards with spaced repetition.
 * Loads due cards via getDueFlashcards(uid), shows FlashcardViewer, and persists
 * performance updates so nextReviewDate is updated (backend + optional resourceStore).
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Loader2, Filter } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { getDueFlashcards, updateFlashcard } from '../services/backendService';
import { computeNextReviewUpdates } from '../utils/flashcardSpacedRepetition';
import type { Flashcard } from '../types';
import FlashcardViewer from '../components/studio/FlashcardViewer';
import { toast } from '../stores/toastStore';
import SkipToMainInHeader from '../components/common/SkipToMainInHeader';
import NotificationCenter from '../components/common/NotificationCenter';
import { useProfilePanelStore } from '../stores/profilePanelStore';
import { Settings, User } from 'lucide-react';

export default function ReviewPage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isGuest = useAuthStore((s) => s.isGuest);
    const uid = user?.id ?? '';

    const [dueCards, setDueCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [filterTag, setFilterTag] = useState<string>('');

    const filteredCards = dueCards.filter((c) => {
        if (filterDifficulty !== 'all' && c.difficulty !== filterDifficulty) return false;
        if (filterTag && !(c.tags ?? []).includes(filterTag)) return false;
        return true;
    });
    const allTags = Array.from(new Set(dueCards.flatMap((c) => c.tags ?? []))).sort();

    useEffect(() => {
        if (!uid || isGuest) {
            setDueCards([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        getDueFlashcards(uid)
            .then(setDueCards)
            .catch((e: Error) => {
                setError(e instanceof Error ? e.message : 'Failed to load due cards');
                setDueCards([]);
            })
            .finally(() => setLoading(false));
    }, [uid, isGuest]);

    const handlePerformanceUpdate = useCallback(
        async (cardId: string, performance: 'again' | 'hard' | 'good' | 'easy') => {
            const card = dueCards.find((c) => c.id === cardId);
            if (!card || !uid) return;
            const updates = computeNextReviewUpdates(card, performance);
            try {
                await updateFlashcard(uid, cardId, updates);
                setDueCards((prev) => prev.filter((c) => c.id !== cardId));
            } catch (e: unknown) {
                console.error('Failed to update flashcard:', e);
                toast.error('Failed to save review. Please try again.');
            }
        },
        [dueCards, uid]
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-theme dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-slate-400">Loading due cards...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-theme dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-soft safe-top flex items-center rounded-b-2xl border-0 min-w-0" style={{ minHeight: 'var(--layout-header-height)' }}>
                <SkipToMainInHeader />
                <div className="max-w-4xl mx-auto w-full min-w-0 px-3 sm:px-4 flex-1 flex items-center justify-between" style={{ minHeight: 'var(--layout-header-height)' }}>
                    <motion.button
                        onClick={() => navigate(-1)}
                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Back"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    </motion.button>
                    <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate min-w-0">
                        <Brain className="w-5 h-5 text-purple-500 shrink-0" />
                        <span className="truncate">Review today</span>
                    </h1>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <NotificationCenter />
                        <motion.button
                            onClick={() => navigate('/settings')}
                            className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Settings"
                        >
                            <Settings className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                        </motion.button>
                        <motion.button
                            onClick={() => useProfilePanelStore.getState().open()}
                            className="p-1 px-2.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-full bg-purple-600/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center gap-2"
                            aria-label="Open Profile"
                        >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">PROFILE</span>
                        </motion.button>
                    </div>
                </div>
            </header>

            <main id="main-content" className="max-w-4xl mx-auto w-full min-w-0 px-3 sm:px-4 py-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {!loading && dueCards.length === 0 && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <Brain className="w-16 h-16 mx-auto text-purple-300 dark:text-purple-600 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">All caught up!</h2>
                        <p className="text-gray-500 dark:text-slate-400 mb-6" data-reading-content>No flashcards due today. Come back tomorrow or learn a new topic to create more cards.</p>
                        <button
                            onClick={() => navigate('/curriculum')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Browse topics
                        </button>
                    </motion.div>
                )}

                {dueCards.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-slate-800"
                    >
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''} due
                                {filterDifficulty !== 'all' || filterTag ? ` (filtered from ${dueCards.length})` : ''}.
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1">
                                    <Filter className="w-3.5 h-3.5" /> Filter:
                                </span>
                                <select
                                    value={filterDifficulty}
                                    onChange={(e) => setFilterDifficulty(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                                    className="text-sm px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200"
                                >
                                    <option value="all">All difficulties</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                                {allTags.length > 0 && (
                                    <select
                                        value={filterTag}
                                        onChange={(e) => setFilterTag(e.target.value)}
                                        className="text-sm px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200"
                                    >
                                        <option value="">All tags</option>
                                        {allTags.map((tag) => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        <FlashcardViewer
                            flashcards={filteredCards}
                            onPerformanceUpdate={handlePerformanceUpdate}
                            skipNextAfterPerformance
                        />
                    </motion.div>
                )}
            </main>
        </div>
    );
}
