import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import type { Achievement } from '../../../types';

interface AchievementCardProps {
    achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
    const isUnlocked = !!achievement.unlockedAt;
    const progressPercent = Math.min(100, ((achievement.progress || 0) / (achievement.target || 1)) * 100);

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${isUnlocked
                ? 'border-purple-200 bg-white shadow-soft dark:border-purple-800 dark:bg-slate-900'
                : 'border-gray-100 bg-gray-50/50 grayscale dark:border-slate-800 dark:bg-slate-900/40'
                }`}
        >
            {/* Background Glow for Unlocked */}
            {isUnlocked && (
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />
            )}

            <div className="flex gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${isUnlocked ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-200 dark:bg-slate-800'
                    }`}>
                    {achievement.icon}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                        <h4 className="truncate font-bold text-gray-900 dark:text-white">
                            {achievement.name}
                        </h4>
                        {isUnlocked ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                        ) : (
                            <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                        )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        {achievement.description}
                    </p>

                    {/* Progress Bar for Locked */}
                    {!isUnlocked && (achievement.target || 0) > 1 && (
                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress} / {achievement.target}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-slate-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    className="h-full rounded-full bg-purple-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
