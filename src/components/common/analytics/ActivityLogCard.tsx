import React from 'react';
import { motion } from 'framer-motion';
import { History, Clock, Target, Zap, ChevronRight } from 'lucide-react';
import { useAnalyticsStore } from '../../../stores/analyticsStore';
import { ALL_SUBJECTS } from '../../../data/curriculumData';

export const ActivityLogCard: React.FC = () => {
    const { sessions } = useAnalyticsStore();

    // Sort sessions by date (newest first) and take the latest 5
    const recentSessions = [...sessions]
        .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
        .slice(0, 5);

    const calculateSessionXp = (durationMinutes: number, completionPercentage: number, quizScore?: number) => {
        let xp = durationMinutes * 60; // 1 XP per second
        if (completionPercentage === 100) xp += 100;
        if (quizScore && quizScore >= 90) xp += 150;
        return xp;
    };

    const getTopicName = (topicId: string) => {
        for (const subject of ALL_SUBJECTS) {
            const topic = subject.topics.find(t => t.id === topicId);
            if (topic) return topic.name;
        }
        return 'Unknown Topic';
    };

    if (recentSessions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
        >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-500" />
                    Learning History
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latest Sessions</span>
            </div>

            <div className="p-4">
                <div className="space-y-3">
                    {recentSessions.map((session, idx) => {
                        const xp = calculateSessionXp(session.durationMinutes, session.completionPercentage, session.quizScore);
                        return (
                            <div
                                key={`${session.sessionId}-${idx}`}
                                className="group flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                    <Clock className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {getTopicName(session.topicId || '')}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            {session.durationMinutes}m
                                        </span>
                                        {session.quizScore !== undefined && (
                                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                                <Zap className="w-3 h-3" />
                                                {session.quizScore}% Score
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                        +{xp}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">XP Earned</div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
