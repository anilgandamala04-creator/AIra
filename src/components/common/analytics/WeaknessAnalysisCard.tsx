import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalyticsStore } from '../../../stores/analyticsStore';
import { getWeakTopics } from '../../../stores/analyticsStore';
import { findTopicInfo, formatTopicName } from '../../../utils/topicUtils';
import { AlertCircle, BookOpen, Sparkles } from 'lucide-react';

export function WeaknessAnalysisCard() {
    const navigate = useNavigate();
    const sessions = useAnalyticsStore(state => state.sessions);

    // Get weak topics (score < 70%)
    // Sorted by lowest score first
    const weakTopics = getWeakTopics(sessions).slice(0, 3); // Show top 3 weaknesses

    if (weakTopics.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-800 shadow-sm flex flex-col justify-center items-center text-center h-full min-h-[200px]"
            >
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-green-800 dark:text-green-100 mb-1">All Systems Go!</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                    No weak areas detected. You're mastering your topics like a pro.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm h-full"
        >
            <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Focus Areas</h3>
            </div>

            <div className="space-y-3">
                {weakTopics.map((item) => {
                    const info = findTopicInfo(item.topicId);
                    const name = info?.topic?.name ?? formatTopicName(item.topicId);
                    const subject = info?.subjectArea ?? 'General';

                    return (
                        <div key={item.topicId} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 line-clamp-1">
                                        {name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">{subject}</p>
                                </div>
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                                    {item.score}%
                                </span>
                            </div>
                            <button
                                onClick={() => navigate(`/learn/${item.topicId}`)}
                                className="w-full mt-2 py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                            >
                                <BookOpen className="w-3 h-3" /> Review Topic
                            </button>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => navigate('/analytics')}
                className="w-full mt-4 text-center text-sm text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
                View all weak spots
            </button>
        </motion.div>
    );
}


