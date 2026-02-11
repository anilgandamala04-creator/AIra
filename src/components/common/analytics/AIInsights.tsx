import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, Lightbulb, PartyPopper, ArrowRight } from 'lucide-react';
import { TeacherNudge } from '../../../types';

interface AIInsightsProps {
    nudges: TeacherNudge[];
}

const iconMap = {
    warning: AlertCircle,
    suggestion: Lightbulb,
    celebration: PartyPopper,
};

const colorMap = {
    warning: 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-300',
    suggestion: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300',
    celebration: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300',
};

const badgeMap = {
    warning: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    suggestion: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    celebration: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
};

export function AIInsights({ nudges }: AIInsightsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Assistant Insights</h3>
            </div>

            <div className="grid gap-3">
                <AnimatePresence mode="popLayout">
                    {nudges.map((nudge, i) => {
                        const Icon = iconMap[nudge.type];
                        return (
                            <motion.div
                                key={nudge.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 ${colorMap[nudge.type]}`}
                            >
                                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${badgeMap[nudge.type]}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm font-medium leading-relaxed" data-reading-content>
                                            {nudge.message}
                                        </p>
                                        {nudge.priority === 'high' && (
                                            <span
                                                className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 uppercase tracking-tighter"
                                                role="status"
                                            >
                                                High Priority
                                            </span>
                                        )}
                                    </div>

                                    {nudge.actionLabel && (
                                        <button
                                            className="flex items-center gap-1.5 text-xs font-bold opacity-80 hover:opacity-100 transition-opacity text-current"
                                            aria-label={`${nudge.actionLabel} for this insight`}
                                        >
                                            {nudge.actionLabel}
                                            <ArrowRight className="w-3 h-3" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 border border-purple-200/50 dark:border-purple-800/50">
                <p className="text-xs text-gray-500 dark:text-slate-400 italic" data-reading-content>
                    "The class seems to struggle most with conceptual understanding of 'Triangles'. Suggest a visual proof session." - AIra
                </p>
            </div>
        </div>
    );
}
