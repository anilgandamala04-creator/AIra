import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Flashcard } from '../../types';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X, Clock, Brain, Shuffle, Download } from 'lucide-react';

interface FlashcardViewerProps {
    flashcards: Flashcard[];
    onPerformanceUpdate?: (id: string, performance: 'again' | 'hard' | 'good' | 'easy') => void;
    /** When true, do not advance to next card after rating; parent will update the list (e.g. review flow). */
    skipNextAfterPerformance?: boolean;
    /** Optional deck title for export filename */
    deckTitle?: string;
}

function shuffleArray<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

export default function FlashcardViewer({ flashcards, onPerformanceUpdate, skipNextAfterPerformance, deckTitle = 'deck' }: FlashcardViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [shuffleOn, setShuffleOn] = useState(false);
    const [shuffledOrder, setShuffledOrder] = useState<Flashcard[] | null>(null);

    const displayCards = shuffleOn && shuffledOrder && shuffledOrder.length === flashcards.length
        ? shuffledOrder
        : flashcards;

    useEffect(() => {
        setShuffledOrder(null);
    }, [flashcards?.length]); // reset when deck changes (e.g. new session)

    const handleShuffle = () => {
        setShuffleOn((prev) => {
            const next = !prev;
            if (next) setShuffledOrder(shuffleArray(flashcards));
            else setShuffledOrder(null);
            setCurrentIndex(0);
            setIsFlipped(false);
            setShowHint(false);
            return next;
        });
    };

    // Safety check: ensure flashcards array exists and has items
    if (!flashcards || flashcards.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-slate-400 py-8">
                No flashcards available
            </div>
        );
    }

    const currentCard = displayCards[currentIndex];

    const handleNext = () => {
        if (currentIndex < displayCards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            setShowHint(false);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
            setShowHint(false);
        }
    };

    const handlePerformance = (performance: 'again' | 'hard' | 'good' | 'easy') => {
        if (onPerformanceUpdate && currentCard) {
            onPerformanceUpdate(currentCard.id, performance);
        }
        if (!skipNextAfterPerformance) handleNext();
    };

    if (!currentCard) {
        return (
            <div className="text-center text-gray-500 dark:text-slate-400 py-8">
                No flashcards available
            </div>
        );
    }

    const difficultyColors = {
        easy: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        hard: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    };

    return (
        <div className="flex flex-col items-center min-w-0 max-w-full w-full">
            {/* Progress + Shuffle + Export */}
            <div className="w-full flex items-center justify-between gap-2 mb-4 min-w-0">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                    Card {currentIndex + 1} of {displayCards.length}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            const headers = 'question,answer,tags,explanation';
                            const rows = flashcards.map((c) => {
                                const q = `"${(c.question || '').replace(/"/g, '""')}"`;
                                const a = `"${(c.answer || '').replace(/"/g, '""')}"`;
                                const tags = `"${(c.tags || []).join(', ')}"`;
                                const exp = `"${(c.explanation || '').replace(/"/g, '""')}"`;
                                return [q, a, tags, exp].join(',');
                            });
                            const csv = [headers, ...rows].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `flashcards-${deckTitle.replace(/\s+/g, '-')}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Export as CSV"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                    <button
                        type="button"
                        onClick={handleShuffle}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${shuffleOn ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                        title={shuffleOn ? 'Random order on' : 'Shuffle order'}
                    >
                        <Shuffle className="w-3.5 h-3.5" />
                        {shuffleOn ? 'Shuffled' : 'Shuffle'}
                    </button>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[currentCard.difficulty]}`}>
                        {currentCard.difficulty}
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mb-4">
                <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${((currentIndex + 1) / displayCards.length) * 100}%` }}
                />
            </div>

            {/* Card */}
            <div className="relative w-full h-80 sm:h-64 perspective-1000">
                <motion.div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 flex flex-col items-center justify-center text-white shadow-lg ${isFlipped ? 'backface-hidden' : ''}`}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <Brain className="w-8 h-8 mb-4 opacity-50" />
                        <p className="text-center text-lg font-medium" data-reading-content>{currentCard.question}</p>
                        <p className="text-sm text-purple-200 mt-4">Tap to reveal answer</p>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg border-2 border-purple-200 dark:border-slate-700"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <Check className="w-8 h-8 mb-4 text-green-500" />
                        <p className="text-center text-lg font-bold text-gray-800 dark:text-slate-100 mb-2" data-reading-content>{currentCard.answer}</p>
                        {currentCard.explanation && (
                            <p className="text-sm text-gray-500 dark:text-slate-400 text-center mt-2" data-reading-content>{currentCard.explanation}</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Hint */}
            <AnimatePresence>
                {showHint && currentCard.hint && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-sm text-amber-700 dark:text-amber-300"
                    >
                        💡 <strong>Hint:</strong> {currentCard.hint}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-4">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-slate-300" />
                </button>

                {currentCard.hint && !isFlipped && (
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                    >
                        {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                )}

                <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <RotateCcw className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === displayCards.length - 1}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30"
                >
                    <ChevronRight className="w-6 h-6 text-gray-600 dark:text-slate-300" />
                </button>
            </div>

            {/* Performance buttons (shown when flipped) */}
            <AnimatePresence>
                {isFlipped && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex flex-wrap gap-2 mt-4 justify-center"
                    >
                        <button
                            onClick={() => handlePerformance('again')}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Again
                        </button>
                        <button
                            onClick={() => handlePerformance('hard')}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                        >
                            <Clock className="w-4 h-4" />
                            Hard
                        </button>
                        <button
                            onClick={() => handlePerformance('good')}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Good
                        </button>
                        <button
                            onClick={() => handlePerformance('easy')}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            🎯 Easy
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
