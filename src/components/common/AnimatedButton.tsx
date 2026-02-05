import { type ComponentProps, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../../stores/settingsStore';
import { tapScale, springTransition } from '../../utils/animations';

type AnimatedButtonProps = Omit<ComponentProps<typeof motion.button>, 'children'> & {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    /** When true, adds hover lift + tap scale. Default: true. */
    interactive?: boolean;
};

export default function AnimatedButton({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    interactive = true,
    disabled,
    ...props
}: AnimatedButtonProps) {
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));

    const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
        primary: 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 shadow-md hover:shadow-lg',
        secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600',
        ghost: 'text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800',
        danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-3',
    };

    const motionProps = interactive && !reduceAnimations && !disabled
        ? {
            whileHover: { scale: 1.02 },
            whileTap: tapScale,
            transition: springTransition,
        }
        : {};

    return (
        <motion.button
            type="button"
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...motionProps}
            {...props}
        >
            {children}
        </motion.button>
    );
}
