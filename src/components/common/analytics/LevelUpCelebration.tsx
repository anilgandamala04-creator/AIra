import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUpCircle } from 'lucide-react';
import { useLevelUpUIStore } from '../../../stores/levelUpUIStore';

export const LevelUpCelebration: React.FC = () => {
    const { showOverlay, newLevel, hideLevelUp } = useLevelUpUIStore();
    const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

    useEffect(() => {
        if (showOverlay) {
            // Generate festive confetti
            const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#F43F5E'];
            const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                color: colors[Math.floor(Math.random() * colors.length)],
            }));
            setConfetti(newConfetti);

            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                hideLevelUp();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showOverlay, hideLevelUp]);

    return (
        <AnimatePresence>
            {showOverlay && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md pointer-events-auto"
                        onClick={hideLevelUp}
                    />

                    {/* Celebration Content */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                        className="relative z-10 w-full max-w-lg px-4 pointer-events-auto"
                    >
                        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-white to-slate-50 p-12 shadow-2xl dark:from-slate-900 dark:to-slate-950 border-4 border-purple-500/30 text-center">

                            {/* Animated Confetti Background */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {confetti.map((dot) => (
                                    <motion.div
                                        key={dot.id}
                                        initial={{ x: 0, y: 0, scale: 0 }}
                                        animate={{
                                            x: dot.x * 10,
                                            y: dot.y * 10,
                                            scale: [0, 1.5, 0],
                                            opacity: [0, 1, 0]
                                        }}
                                        transition={{
                                            duration: 3,
                                            ease: "easeOut",
                                            repeat: Infinity,
                                            repeatDelay: Math.random() * 2
                                        }}
                                        style={{
                                            backgroundColor: dot.color,
                                            left: '50%',
                                            top: '50%'
                                        }}
                                        className="absolute h-3 w-3 rounded-full blur-[1px]"
                                    />
                                ))}
                            </div>

                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="relative"
                            >
                                <div className="flex justify-center mb-6">
                                    <motion.div
                                        animate={{
                                            rotate: [0, -10, 10, -10, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{ duration: 0.5, repeat: 3 }}
                                        className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl relative"
                                    >
                                        <ArrowUpCircle className="w-16 h-16" />
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full border-4 border-purple-400"
                                        />
                                    </motion.div>
                                </div>

                                <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    New Milestone Reached
                                    <Sparkles className="w-5 h-5" />
                                </h3>

                                <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4">
                                    Level {newLevel}!
                                </h2>

                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                                    Your hard work is paying off. You're becoming a master of your subjects!
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={hideLevelUp}
                                    className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-purple-500/25"
                                >
                                    Keep Learning!
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
