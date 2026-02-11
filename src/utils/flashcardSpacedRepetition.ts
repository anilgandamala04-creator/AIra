/**
 * Spaced repetition (SM-2–style) helper for flashcards.
 * Used by resourceStore and by review flow so backend gets correct nextReviewDate.
 */
import type { Flashcard } from '../types';

export type PerformanceRating = 'again' | 'hard' | 'good' | 'easy';

export function computeNextReviewUpdates(
    card: Flashcard,
    performance: PerformanceRating
): Pick<Flashcard, 'nextReviewDate' | 'intervalDays' | 'easeFactor' | 'repetitions' | 'lastPerformance'> {
    let newInterval = card.intervalDays;
    let newEaseFactor = card.easeFactor;

    switch (performance) {
        case 'again':
            newInterval = 1;
            newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
            break;
        case 'hard':
            newInterval = Math.ceil(card.intervalDays * 1.2);
            newEaseFactor = Math.max(1.3, card.easeFactor - 0.15);
            break;
        case 'good':
            newInterval = Math.ceil(card.intervalDays * card.easeFactor);
            break;
        case 'easy':
            newInterval = Math.ceil(card.intervalDays * card.easeFactor * 1.3);
            newEaseFactor = card.easeFactor + 0.15;
            break;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    return {
        nextReviewDate: nextDate.toISOString(),
        intervalDays: newInterval,
        easeFactor: newEaseFactor,
        repetitions: card.repetitions + 1,
        lastPerformance: performance,
    };
}
