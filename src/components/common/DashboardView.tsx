import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useTeachingSessions } from '../../hooks/useBackend';
import { professions } from '../../data/professions';
import {
    BookOpen, Brain, Play, Clock, ChevronRight, Briefcase, Layers,
    TrendingUp, Award, Target, BarChart3, Zap, ArrowLeft
} from 'lucide-react';
import { pageVariants, staggerContainer, staggerItem, TRANSITION_DEFAULT, tapScale, hoverLift, springTransition } from '../../utils/animations';

interface DashboardViewProps {
    onBack: () => void;
}

export default function DashboardView({ onBack }: DashboardViewProps) {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const profile = useUserStore(useShallow((state) => state.profile));
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));

    // Real-time analytics and performance data - tied to user's profile and learning context
    const analytics = useAnalyticsStore(useShallow((state) => ({
        sessions: state.sessions,
        achievements: state.achievements,
        metrics: state.metrics,
    })));

    // Get user's teaching sessions for progress tracking - real-time from Firestore
    const { sessions: teachingSessions } = useTeachingSessions();

    // Get topics from user's selected profession
    const selectedProfession = profile?.profession;
    const selectedSubProfessionId = profile?.subProfession;

    const professionData = selectedProfession
        ? professions.find(p => p.id === selectedProfession.id)
        : null;

    const subProfessionData = professionData && selectedSubProfessionId
        ? professionData.subProfessions.find(sp => sp.id === selectedSubProfessionId)
        : null;

    // Get user's actual progress for each topic from their sessions
    const getTopicProgress = useCallback((topicId: string): number => {
        const topicSessions = teachingSessions.filter(s => s.topicId === topicId);
        if (topicSessions.length === 0) return 0;

        const totalProgress = topicSessions.reduce((sum, session) => {
            return sum + (session.progress || 0);
        }, 0);

        return Math.round(totalProgress / topicSessions.length);
    }, [teachingSessions]);

    // Recommended topics with real-time progress from user's actual learning data
    const recommendedTopics = useMemo(() => {
        if (subProfessionData) {
            const allTopics: Array<{
                id: string;
                name: string;
                duration: string;
                difficulty: string;
                progress: number;
                subjectName: string;
            }> = [];

            subProfessionData.subjects.forEach(subject => {
                subject.topics.slice(0, 2).forEach(topic => {
                    const actualProgress = getTopicProgress(topic.id);

                    allTopics.push({
                        id: topic.id,
                        name: topic.name,
                        duration: topic.duration || `${topic.durationMinutes || 30} min`,
                        difficulty: topic.difficulty || 'beginner',
                        progress: actualProgress,
                        subjectName: subject.name,
                    });
                });
            });

            return allTopics.slice(0, 6);
        }

        return [
            { id: 'ecg-basics', name: 'ECG Basics', duration: '30 min', difficulty: 'beginner', progress: 0, subjectName: 'Diagnostics' },
            { id: 'react-basics', name: 'React Fundamentals', duration: '50 min', difficulty: 'beginner', progress: 0, subjectName: 'Web Development' },
            { id: 'contract-formation', name: 'Formation of Contracts', duration: '40 min', difficulty: 'beginner', progress: 0, subjectName: 'Contract Law' },
            { id: 'seo', name: 'SEO Fundamentals', duration: '40 min', difficulty: 'beginner', progress: 0, subjectName: 'Digital Marketing' },
        ];
    }, [subProfessionData, getTopicProgress]);

    // Performance insights - calculated from user's actual learning data
    const performanceInsights = useMemo(() => {
        const { metrics, sessions, achievements } = analytics;
        const userTopic = profile?.currentTopic;

        const relevantSessions = userTopic
            ? sessions.filter(session => session.topicId === userTopic)
            : sessions;

        const completedSessions = relevantSessions.filter(s => s.completionPercentage === 100);
        const recentSessions = relevantSessions.slice(-5);
        const averageScore = recentSessions.length > 0
            ? Math.round(recentSessions.reduce((sum, s) => sum + (s.quizScore || 0), 0) / recentSessions.length)
            : 0;

        const unlockedAchievements = achievements.filter(a => a.unlockedAt);

        return {
            totalHours: metrics.totalHours,
            topicsCompleted: metrics.topicsCompleted,
            averageQuizScore: averageScore || metrics.averageQuizScore,
            streakDays: metrics.streakDays,
            achievementsUnlocked: unlockedAchievements.length,
            totalAchievements: achievements.length,
            recentSessionsCount: recentSessions.length,
            completionRate: relevantSessions.length > 0
                ? Math.round((completedSessions.length / relevantSessions.length) * 100)
                : 0,
        };
    }, [analytics, profile?.currentTopic]);

    const handleStartTopic = useCallback((topicId: string) => {
        navigate(`/learn/${topicId}`);
    }, [navigate]);

    const handleBrowseAllTopics = useCallback(() => {
        navigate('/curriculum');
    }, [navigate]);

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-3">
                <motion.button
                    onClick={onBack}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-ui active:scale-[0.97] min-h-[44px] min-w-[44px]"
                    aria-label="Back to Profile"
                    whileHover={reduceAnimations ? undefined : { scale: 1.05 }}
                    whileTap={reduceAnimations ? undefined : tapScale}
                    transition={springTransition}
                >
                    <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Dashboard</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Your learning performance and progress</p>
                </div>
            </div>

            {/* Welcome Section */}
            <motion.div
                initial={pageVariants.initial}
                animate={pageVariants.animate}
                transition={TRANSITION_DEFAULT}
            >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-2">
                    Welcome back, {user?.displayName || user?.name || 'Learner'}! 👋
                </h3>
                {professionData && subProfessionData ? (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4" />
                            {professionData.name}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                            {subProfessionData.name}
                        </span>
                    </div>
                ) : null}
            </motion.div>

            {/* Performance Insights */}
            <motion.div
                initial={pageVariants.initial}
                animate={pageVariants.animate}
                transition={{ ...TRANSITION_DEFAULT, delay: 0.04 }}
            >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Your Performance
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-gray-500 dark:text-slate-400">Total Hours</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800 dark:text-slate-100">
                            {performanceInsights.totalHours.toFixed(1)}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-gray-500 dark:text-slate-400">Topics Completed</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800 dark:text-slate-100">
                            {performanceInsights.topicsCompleted}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-500 dark:text-slate-400">Avg Score</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800 dark:text-slate-100">
                            {performanceInsights.averageQuizScore}%
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs text-gray-500 dark:text-slate-400">Achievements</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800 dark:text-slate-100">
                            {performanceInsights.achievementsUnlocked}/{performanceInsights.totalAchievements}
                        </p>
                    </div>

                    {performanceInsights.streakDays > 0 && (
                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-4 h-4 text-orange-500" />
                                <span className="text-xs text-gray-500 dark:text-slate-400">Streak</span>
                            </div>
                            <p className="text-xl font-bold text-gray-800 dark:text-slate-100">
                                {performanceInsights.streakDays} days
                            </p>
                        </div>
                    )}

                    {performanceInsights.recentSessionsCount > 0 && (
                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <BarChart3 className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs text-gray-500 dark:text-slate-400">Completion</span>
                            </div>
                            <p className="text-xl font-bold text-gray-800 dark:text-slate-100">
                                {performanceInsights.completionRate}%
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Recommended Topics */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-500" />
                        {subProfessionData ? `${subProfessionData.name} Topics` : 'Recommended Topics'}
                    </h3>
                    <motion.button
                        onClick={handleBrowseAllTopics}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                        whileHover={reduceAnimations ? undefined : { x: 2 }}
                    >
                        Browse All
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </div>

                <div className="space-y-2">
                    {recommendedTopics.map((topic) => (
                        <motion.div
                            key={topic.id}
                            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => handleStartTopic(topic.id)}
                            variants={staggerItem}
                            whileHover={reduceAnimations ? undefined : hoverLift}
                            whileTap={reduceAnimations ? undefined : tapScale}
                            transition={TRANSITION_DEFAULT}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleStartTopic(topic.id)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center shrink-0">
                                        <Brain className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-sm text-gray-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                                            {topic.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{topic.subjectName}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mt-1">
                                            <Clock className="w-3 h-3 shrink-0" />
                                            <span className="whitespace-nowrap">{topic.duration}</span>
                                            <span className={`px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap ${topic.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                    topic.difficulty === 'intermediate' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                                        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                }`}>
                                                {topic.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shrink-0"
                                    aria-label={`Start ${topic.name}`}
                                >
                                    <Play className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                                    style={{ width: `${topic.progress}%` }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={pageVariants.initial}
                animate={pageVariants.animate}
                transition={{ ...TRANSITION_DEFAULT, delay: 0.08 }}
            >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3">Quick Access</h3>
                <div className="space-y-2">
                    <motion.button
                        type="button"
                        onClick={handleBrowseAllTopics}
                        className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-ui group text-left border border-purple-200/50 dark:border-purple-800/30"
                        whileHover={reduceAnimations ? undefined : { y: -2, transition: springTransition }}
                        whileTap={reduceAnimations ? undefined : tapScale}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-gray-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300">Browse Learning Paths</h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Explore all subjects and topics organized by profession and specialization.</p>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
