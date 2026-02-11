import React from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronRight } from 'lucide-react';
import { useAnalyticsStore } from '../../../stores/analyticsStore';
import { AchievementCard } from './AchievementCard';

export const RecentAchievementsCard: React.FC = () => {
    const achievements = useAnalyticsStore((s) => s.achievements);
    const unlocked = achievements.filter(a => !!a.unlockedAt).sort((a, b) =>
        (b.unlockedAt || '').localeCompare(a.unlockedAt || '')
    );
    const latest = unlocked.slice(0, 3);
    const lockedCount = achievements.length - unlocked.length;

    if (unlocked.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur-md dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800"
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Recent Achievements</h3>
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                    {unlocked.length} earned · {lockedCount} left
                </span>
            </div>

            <div className="space-y-3 flex-1">
                {latest.map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                ))}
            </div>

            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-50 py-2.5 text-sm font-bold text-purple-600 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30">
                View All
                <ChevronRight className="h-4 w-4" />
            </button>
        </motion.div>
    );
};
