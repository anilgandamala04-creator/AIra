import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: -20,
    },
};

const reducedVariants = {
    initial: {
        opacity: 1,
        y: 0,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 1,
        y: 0,
    },
};

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
    const reduceAnimations = useSettingsStore((state) => state.settings.accessibility.reduceAnimations);

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={reduceAnimations ? reducedVariants : pageVariants}
            transition={{ duration: reduceAnimations ? 0 : 0.3, ease: "easeInOut" }}
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
