import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { TRANSITION_FAST, fadeScaleVariants } from '../../utils/animations';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastProps {
    toast: Toast;
    onClose: (id: string) => void;
    reduceAnimations?: boolean;
}

function ToastItem({ toast, onClose, reduceAnimations }: ToastProps) {
    useEffect(() => {
        if (toast.duration !== 0) {
            const timer = setTimeout(() => {
                onClose(toast.id);
            }, toast.duration || 5000);

            return () => clearTimeout(timer);
        }
    }, [toast.id, toast.duration, onClose]);

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle,
    };

    const colors = {
        success: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/60 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200',
        info: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-200',
        warning: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200',
    };

    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500',
        warning: 'text-amber-500',
    };

    const Icon = icons[toast.type];
    const noMotion = reduceAnimations;

    return (
        <motion.div
            layout={!noMotion}
            initial={noMotion ? false : fadeScaleVariants.initial}
            animate={noMotion ? { opacity: 1, scale: 1 } : fadeScaleVariants.animate}
            exit={noMotion ? undefined : { ...fadeScaleVariants.exit, transition: TRANSITION_FAST }}
            transition={noMotion ? { duration: 0 } : { duration: TRANSITION_FAST.duration, ease: TRANSITION_FAST.ease }}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md ${colors[toast.type]}`}
            role="alert"
            aria-live="polite"
        >
            <motion.span
                initial={noMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={noMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25, delay: 0.05 }}
                className={`w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center ${iconColors[toast.type]}`}
            >
                <Icon className="w-5 h-5" />
            </motion.span>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <motion.button
                type="button"
                onClick={() => onClose(toast.id)}
                className="flex-shrink-0 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-ui rounded p-0.5"
                whileHover={noMotion ? undefined : { scale: 1.1 }}
                whileTap={noMotion ? undefined : { scale: 0.95 }}
                transition={{ duration: 0.15 }}
                aria-label="Close notification"
            >
                <X className="w-4 h-4" />
            </motion.button>
        </motion.div>
    );
}

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));
    const noMotion = reduceAnimations;
    return (
        <div
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 pointer-events-none safe-top"
            aria-live="assertive"
            aria-atomic="true"
        >
            <AnimatePresence mode={noMotion ? 'sync' : 'popLayout'}>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout={!noMotion}
                        initial={noMotion ? false : { opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={noMotion ? undefined : { opacity: 0, x: 24, transition: { duration: TRANSITION_FAST.duration } }}
                        transition={noMotion ? { duration: 0 } : { duration: TRANSITION_FAST.duration, ease: TRANSITION_FAST.ease }}
                        className="pointer-events-auto"
                    >
                        <ToastItem toast={toast} onClose={onClose} reduceAnimations={reduceAnimations} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
