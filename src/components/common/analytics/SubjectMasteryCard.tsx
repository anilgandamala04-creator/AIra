import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart } from './RadarChart';
import { useAnalyticsStore } from '../../../stores/analyticsStore';
import { getSubjectMastery } from '../../../stores/analyticsStore';
import { ALL_SUBJECTS } from '../../../data/curriculumData';
import { ArrowRight, Sparkles } from 'lucide-react';

export function SubjectMasteryCard() {
    const navigate = useNavigate();
    const sessions = useAnalyticsStore(state => state.sessions);

    // Compute mastery for top subjects
    // We select 5-6 core subjects to show on the radar
    const radarData = ALL_SUBJECTS.slice(0, 6).map(subject => ({
        label: subject.name,
        value: getSubjectMastery(sessions, subject.name),
        fullMark: 100
    }));

    const averageMastery = Math.round(radarData.reduce((acc, curr) => acc + curr.value, 0) / radarData.length);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-8 items-center"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Subject Mastery</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                    Your calculated mastery based on quiz scores, topic coverage, and study consistency.
                </p>

                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl">
                        <span className="block text-xs text-purple-600 dark:text-purple-300 font-semibold uppercase tracking-wider">Avg Mastery</span>
                        <span className="block text-2xl font-black text-purple-700 dark:text-purple-400">{averageMastery}%</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/analytics')}
                    className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:gap-2 transition-all"
                >
                    View detailed report <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto flex justify-center">
                <RadarChart
                    data={radarData}
                    width={280}
                    height={280}
                    color="#8b5cf6"
                />
            </div>
        </motion.div>
    );
}
