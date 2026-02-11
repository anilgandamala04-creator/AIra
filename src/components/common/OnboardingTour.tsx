/**
 * First-time onboarding tour: short walkthrough of the home screen.
 * Can be restarted from Settings ("Show tour again").
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { setOnboardingTourDone } from './onboardingTourStorage';

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Welcome to AIra',
    body: 'Your AI tutor for curriculum and competitive exam prep. Choose a mode below to get started.',
  },
  {
    title: 'Choose your path',
    body: 'Curriculum Mode follows your board and grade. Competitive Mode focuses on exams like JEE, NEET, or other entrance tests.',
  },
  {
    title: 'You\'re all set',
    body: 'After picking board/grade or exam, you\'ll choose a subject and topic. You can revisit this tour anytime from Settings.',
  },
];

interface OnboardingTourProps {
  onClose: () => void;
  /** When true, show "Don't show again" and persist when closing */
  canDismissPermanently?: boolean;
}

export default function OnboardingTour({ onClose, canDismissPermanently = true }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const isLast = step === STEPS.length - 1;

  const handleClose = () => {
    if (canDismissPermanently && dontShowAgain) setOnboardingTourDone();
    onClose();
  };

  const handleNext = () => {
    if (isLast) handleClose();
    else setStep((s) => s + 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 max-w-md w-full overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex justify-end -mt-1 -mr-1 mb-2">
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                aria-label="Close tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 id="tour-title" className="text-xl font-bold text-gray-900 dark:text-white">
                {STEPS[step].title}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              {STEPS[step].body}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
              {canDismissPermanently && (
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                  />
                  Don't show again
                </label>
              )}
              <div className="flex gap-2 sm:ml-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                >
                  {isLast ? 'Done' : 'Next'}
                  {!isLast && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 justify-center pb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full w-6 transition-colors ${i === step ? 'bg-purple-600' : 'bg-gray-200 dark:bg-slate-600'}`}
                aria-hidden
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
