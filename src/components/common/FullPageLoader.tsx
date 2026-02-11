import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../../stores/settingsStore';
import { pageVariants, TRANSITION_DEFAULT } from '../../utils/animations';

interface FullPageLoaderProps {
    message?: string;
}

export default function FullPageLoader({ message = 'Loading...' }: FullPageLoaderProps) {
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));

    return (
        <div
            className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 safe-top safe-bottom"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label={message}
        >
            <motion.div
                className="text-center"
                initial={reduceAnimations ? undefined : (pageVariants.initial as React.ComponentProps<typeof motion.div>['initial'])}
                animate={reduceAnimations ? undefined : (pageVariants.animate as React.ComponentProps<typeof motion.div>['animate'])}
                transition={reduceAnimations ? undefined : (TRANSITION_DEFAULT as React.ComponentProps<typeof motion.div>['transition'])}
            >
                <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    animate={
                        reduceAnimations
                            ? { opacity: [0.7, 1, 0.7] }
                            : { rotate: 360 }
                    }
                    transition={
                        reduceAnimations
                            ? { opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }
                            : { duration: 2, repeat: Infinity, ease: 'linear' }
                    }
                    aria-hidden
                >
                    <Loader2 className="w-8 h-8 text-white shrink-0" aria-hidden />
                </motion.div>
                <p className="text-gray-600 dark:text-slate-300 font-medium">{message}</p>
            </motion.div>
        </div>
    );
}
