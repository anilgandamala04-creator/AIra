import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { fadeScaleVariants, reducedPageVariants, TRANSITION_DEFAULT, tapScale } from '../../utils/animations';

interface ErrorFallbackProps {
    error: Error | null;
    onRetry: () => void;
}

export default function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const reduceAnimations = useSettingsStore(useShallow((s) => s.settings.accessibility.reduceAnimations));

    const handleGoHome = () => {
        navigate('/', { replace: true });
    };

    const handleCopyError = useCallback(() => {
        if (!error?.message) return;
        navigator.clipboard.writeText(`${error.message}\n\n${error.stack ?? ''}`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => { /* clipboard may be denied or unavailable */ });
    }, [error]);

    return (
        <div
            className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 safe-top safe-bottom"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <motion.main
                id="main-content"
                tabIndex={-1}
                className="max-w-md w-full max-w-[calc(100vw-2rem)] bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 text-center"
                initial={(reduceAnimations ? reducedPageVariants.initial : fadeScaleVariants.initial) as React.ComponentProps<typeof motion.main>['initial']}
                animate={(reduceAnimations ? reducedPageVariants.animate : fadeScaleVariants.animate) as React.ComponentProps<typeof motion.main>['animate']}
                transition={reduceAnimations ? { duration: 0 } : (TRANSITION_DEFAULT as React.ComponentProps<typeof motion.main>['transition'])}
            >
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-2">
                    Something went wrong
                </h1>

                <p className="text-gray-600 dark:text-slate-300 mb-6">
                    We hit an unexpected error. Your progress is saved. Try again or go home.
                </p>

                {error && (
                    <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-3 mb-4 text-left">
                        <p className="text-sm text-gray-600 dark:text-slate-300 font-mono break-words" id="error-details">
                            {error.message}
                        </p>
                        <button
                            type="button"
                            onClick={handleCopyError}
                            className="mt-2 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                            aria-label={copied ? 'Copied' : 'Copy error for support'}
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied' : 'Copy for support'}
                        </button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <motion.button
                        onClick={onRetry}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity duration-200 min-h-[44px]"
                        whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                        whileTap={reduceAnimations ? undefined : tapScale}
                        transition={reduceAnimations ? { duration: 0 } : TRANSITION_DEFAULT}
                        aria-label="Try loading again"
                    >
                        <RefreshCw className="w-4 h-4" aria-hidden />
                        Try Again
                    </motion.button>
                    <motion.button
                        onClick={handleGoHome}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200 min-h-[44px]"
                        whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                        whileTap={reduceAnimations ? undefined : tapScale}
                        transition={reduceAnimations ? { duration: 0 } : TRANSITION_DEFAULT}
                        aria-label="Go home"
                    >
                        Go Home
                    </motion.button>
                </div>
            </motion.main>
        </div>
    );
}
