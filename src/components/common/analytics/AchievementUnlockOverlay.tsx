import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useAchievementUIStore } from '../../../stores/achievementUIStore';

export const AchievementUnlockOverlay: React.FC = () => {
    const { activeAchievement, showOverlay, hideUnlock } = useAchievementUIStore();
    const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

    useEffect(() => {
        if (showOverlay) {
            // Generate simple confetti dots
            const colors = ['#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];
            const newConfetti = Array.from({ length: 40 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100 - 50, // -50 to 50
                y: Math.random() * 100 - 50,
                color: colors[Math.floor(Math.random() * colors.length)],
            }));
            setConfetti(newConfetti);

            // Auto-hide after 4 seconds
            const timer = setTimeout(() => {
                hideUnlock();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showOverlay, hideUnlock]);

    return (
        <AnimatePresence>
            {showOverlay && activeAchievement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    {/* Backdrop Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
                        onClick={hideUnlock}
                    />

                    {/* Card Container */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: -20 }}
                        transition={{
                            type: 'spring',
                            damping: 15,
                            stiffness: 100,
                            delay: 0.2
                        }}
                        className="relative z-10 w-full max-w-sm px-4 pointer-events-auto"
                    >
                        <div className="overflow-hidden rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900 border-2 border-purple-500/20">
                            {/* Decorative Sparkles */}
                            <div className="absolute top-0 left-0 w-full h-full">
                                {confetti.map((dot) => (
                                    <motion.div
                                        key={dot.id}
                                        initial={{ x: 0, y: 0, scale: 0 }}
                                        animate={{
                                            x: dot.x * 5,
                                            y: dot.y * 5,
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            ease: "easeOut",
                                            repeat: Infinity,
                                            repeatDelay: Math.random() * 2
                                        }}
                                        style={{
                                            backgroundColor: dot.color,
                                            left: '50%',
                                            top: '50%'
                                        }}
                                        className="absolute h-2 w-2 rounded-full"
                                    />
                                ))}
                            </div>

                            <div className="relative flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ rotate: -10, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1.2 }}
                                    transition={{ delay: 0.4, type: 'spring' }}
                                    className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-6xl shadow-lg ring-8 ring-purple-500/10"
                                >
                                    {activeAchievement.icon}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        <span className="text-sm font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                                            Achievement Unlocked!
                                        </span>
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                                        {activeAchievement.name}
                                    </h2>
                                    <p className="text-gray-500 dark:text-slate-400">
                                        {activeAchievement.description}
                                    </p>
                                </motion.div>

                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    onClick={hideUnlock}
                                    className="mt-8 rounded-xl bg-gray-100 px-6 py-2 text-sm font-bold text-gray-900 hover:bg-gray-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-colors"
                                >
                                    Awesome!
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
