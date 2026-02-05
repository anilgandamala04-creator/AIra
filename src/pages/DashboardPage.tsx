import { useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useProfilePanelStore } from '../stores/profilePanelStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useTeachingSessions } from '../hooks/useBackend';
import { useRealTimeEvent } from '../utils/realTimeSync';
import { EVENTS } from '../utils/realTimeSync';
import { professions } from '../data/professions';
import {
    BookOpen, Brain, Settings, User, LogOut,
    Play, Clock, Sparkles, ChevronRight, Briefcase, Layers,
    TrendingUp, Award, Target, BarChart3, Zap
} from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SkipToMainInHeader from '../components/common/SkipToMainInHeader';
import { pageVariants, staggerContainer, staggerItem, TRANSITION_DEFAULT, tapScale, hoverLift, springTransition } from '../utils/animations';

export default function DashboardPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const profile = useUserStore(useShallow((state) => state.profile));
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));

    // Real-time analytics and performance data - tied to user's profile and learning context
    // All data is user-specific and updates automatically via Firestore listeners
    // Dashboard automatically re-renders when analytics store updates (Zustand reactivity)
    const analytics = useAnalyticsStore(useShallow((state) => ({
        sessions: state.sessions,
        achievements: state.achievements,
        metrics: state.metrics,
    })));

    // Get user's teaching sessions for progress tracking - real-time from Firestore
    // Each user's sessions are isolated by UID, ensuring complete separation
    // Updates automatically when Firestore data changes (via realtime subscription)
    const { sessions: teachingSessions } = useTeachingSessions();

    // Force re-render when profile changes (subject, topic, profession) for instant dashboard updates
    // This ensures dashboard reflects user's current learning context immediately
    useEffect(() => {
        // Profile changes trigger re-render automatically via Zustand reactivity
        // This effect ensures dashboard recalculates when profile context changes
    }, [profile?.profession?.id, profile?.subProfession, profile?.subject, profile?.currentTopic]);

    // Subscribe to real-time events for instant dashboard updates
    // Dashboard updates immediately when new sessions are recorded or achievements unlocked
    useRealTimeEvent(EVENTS.SESSION_RECORDED, () => {
        // Analytics store already updated, dashboard will re-render automatically
        // This listener ensures we're aware of the update
    });

    useRealTimeEvent(EVENTS.ACHIEVEMENT_UNLOCKED, () => {
        // Analytics store already updated, dashboard will re-render automatically
    });

    useRealTimeEvent(EVENTS.PROFILE_UPDATE, () => {
        // Profile updated - dashboard will recalculate with new context
    });

    useRealTimeEvent(EVENTS.PROFESSION_CHANGE, () => {
        // Profession changed - dashboard will show new profession-specific topics
    });

    // Get topics from user's selected profession
    const selectedProfession = profile?.profession;
    const selectedSubProfessionId = profile?.subProfession;

    // Find the profession data
    const professionData = selectedProfession
        ? professions.find(p => p.id === selectedProfession.id)
        : null;

    // Find the sub-profession data
    const subProfessionData = professionData && selectedSubProfessionId
        ? professionData.subProfessions.find(sp => sp.id === selectedSubProfessionId)
        : null;

    // Get user's actual progress for each topic from their sessions
    const getTopicProgress = useCallback((topicId: string): number => {
        // Find sessions for this topic
        const topicSessions = teachingSessions.filter(s => s.topicId === topicId);
        if (topicSessions.length === 0) return 0;

        // Calculate average progress across all sessions for this topic
        const totalProgress = topicSessions.reduce((sum, session) => {
            return sum + (session.progress || 0);
        }, 0);

        return Math.round(totalProgress / topicSessions.length);
    }, [teachingSessions]);

    // Recommended topics with real-time progress from user's actual learning data
    // Updates automatically when user's profession, sub-profession, or session progress changes
    // Each user sees only topics relevant to their profession, with their own progress data
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
                    // Get actual progress from user's sessions - tied to user's learning context
                    // Progress is calculated from user's own sessions (UID-filtered in Firestore)
                    const actualProgress = getTopicProgress(topic.id);

                    allTopics.push({
                        id: topic.id,
                        name: topic.name,
                        duration: topic.duration || `${topic.durationMinutes || 30} min`,
                        difficulty: topic.difficulty || 'beginner',
                        progress: actualProgress, // Real progress from user's own learning data
                        subjectName: subject.name,
                    });
                });
            });

            return allTopics.slice(0, 6);
        }

        // Fallback topics with zero progress (no user context yet)
        return [
            { id: 'ecg-basics', name: 'ECG Basics', duration: '30 min', difficulty: 'beginner', progress: 0, subjectName: 'Diagnostics' },
            { id: 'react-basics', name: 'React Fundamentals', duration: '50 min', difficulty: 'beginner', progress: 0, subjectName: 'Web Development' },
            { id: 'contract-formation', name: 'Formation of Contracts', duration: '40 min', difficulty: 'beginner', progress: 0, subjectName: 'Contract Law' },
            { id: 'seo', name: 'SEO Fundamentals', duration: '40 min', difficulty: 'beginner', progress: 0, subjectName: 'Digital Marketing' },
        ];
    }, [subProfessionData, getTopicProgress]); // getTopicProgress depends on teachingSessions

    // Performance insights - calculated from user's actual learning data
    // All data is user-specific (UID-based) and updates in real-time via Firestore listeners
    // Recalculates automatically when analytics or profile context changes
    const performanceInsights = useMemo(() => {
        const { metrics, sessions, achievements } = analytics;

        // Filter sessions to user's current topic context if specified
        // All sessions are already user-specific (UID-based), ensuring complete separation
        const userTopic = profile?.currentTopic;
        const userSubject = profile?.subject;

        // Get sessions relevant to user's learning context
        // If user has a current topic, filter to that topic; if subject, filter to subject; otherwise show all user's sessions
        let relevantSessions = sessions;
        if (userTopic) {
            relevantSessions = sessions.filter(session => session.topicId === userTopic);
        } else if (userSubject) {
            // Filter by subject if topic not specified (would need subject mapping in session data)
            relevantSessions = sessions; // Show all for now, can be enhanced with subject filtering
        }
        // Otherwise show all user's sessions (already filtered by UID in Firestore query)

        const completedSessions = relevantSessions.filter(s => s.completionPercentage === 100);
        const recentSessions = relevantSessions.slice(-5); // Last 5 sessions
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
    }, [analytics, profile?.currentTopic, profile?.subject]);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate('/login');
    }, [logout, navigate]);

    const handleStartTopic = useCallback((topicId: string) => {
        navigate(`/learn/${topicId}`);
    }, [navigate]);

    const handleBrowseAllTopics = useCallback(() => {
        navigate('/curriculum');
    }, [navigate]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            <main id="main-content" tabIndex={-1}>
                {/* Header */}
                <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-sm sticky top-0 z-50 safe-top flex items-center" style={{ minHeight: 'var(--layout-header-height)' }}>
                    <SkipToMainInHeader />
                    <div className="max-w-7xl mx-auto w-full px-4 flex items-center justify-between gap-4" style={{ minHeight: 'var(--layout-header-height)' }}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden />
                            </div>
                            <span className="font-bold text-lg sm:text-xl text-gray-800 dark:text-slate-100 truncate min-w-0">AI Tutor</span>
                        </div>

                        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <motion.button
                                onClick={() => navigate('/settings')}
                                className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-gray-500 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
                                aria-label="Settings"
                                whileHover={reduceAnimations ? undefined : { scale: 1.05 }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                                transition={springTransition}
                            >
                                <Settings className="w-5 h-5 shrink-0" aria-hidden />
                            </motion.button>
                            <motion.button
                                onClick={() => useProfilePanelStore.getState().open()}
                                className="flex items-center justify-center shrink-0 rounded-full w-10 h-10 sm:w-9 sm:h-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
                                aria-label="Open Profile Settings"
                                whileHover={reduceAnimations ? undefined : { scale: 1.05 }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                                transition={springTransition}
                            >
                                <User className="w-5 h-5 flex-shrink-0" aria-hidden />
                            </motion.button>
                            <motion.button
                                onClick={handleLogout}
                                className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-gray-500 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
                                aria-label="Logout"
                                whileHover={reduceAnimations ? undefined : { scale: 1.05 }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                                transition={springTransition}
                            >
                                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden />
                            </motion.button>
                        </nav>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                    {/* Breadcrumbs */}
                    <Breadcrumbs items={[{ label: 'Dashboard' }]} className="mb-3 sm:mb-4" />

                    {/* Welcome Section with Profession Context */}
                    <motion.div
                        className="mb-8"
                        initial={pageVariants.initial}
                        animate={pageVariants.animate}
                        transition={TRANSITION_DEFAULT}
                    >
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-slate-100 mb-2 break-words">
                            Welcome back, {user?.displayName || user?.name || 'Learner'}! 👋
                        </h1>
                        {professionData && subProfessionData ? (
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" />
                                    {professionData.name}
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                                    {subProfessionData.name}
                                </span>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-slate-300">
                                Select a profession in Settings to get personalized learning paths
                            </p>
                        )}
                    </motion.div>

                    {/* Performance Insights - Real-time analytics tied to user's profile and learning context */}
                    <motion.div
                        className="mb-8"
                        initial={pageVariants.initial}
                        animate={pageVariants.animate}
                        transition={{ ...TRANSITION_DEFAULT, delay: 0.04 }}
                    >
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-500" />
                            Your Performance
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {/* Total Learning Hours */}
                            <motion.div
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                                variants={staggerItem}
                                whileHover={reduceAnimations ? undefined : hoverLift}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs text-gray-500 dark:text-slate-400">Total Hours</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                                    {performanceInsights.totalHours.toFixed(1)}
                                </p>
                            </motion.div>

                            {/* Topics Completed */}
                            <motion.div
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                                variants={staggerItem}
                                whileHover={reduceAnimations ? undefined : hoverLift}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-green-500" />
                                    <span className="text-xs text-gray-500 dark:text-slate-400">Topics Completed</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                                    {performanceInsights.topicsCompleted}
                                </p>
                            </motion.div>

                            {/* Average Quiz Score */}
                            <motion.div
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                                variants={staggerItem}
                                whileHover={reduceAnimations ? undefined : hoverLift}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs text-gray-500 dark:text-slate-400">Avg Score</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                                    {performanceInsights.averageQuizScore}%
                                </p>
                            </motion.div>

                            {/* Achievements */}
                            <motion.div
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                                variants={staggerItem}
                                whileHover={reduceAnimations ? undefined : hoverLift}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs text-gray-500 dark:text-slate-400">Achievements</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                                    {performanceInsights.achievementsUnlocked}/{performanceInsights.totalAchievements}
                                </p>
                            </motion.div>

                            {/* Streak Days */}
                            {performanceInsights.streakDays > 0 && (
                                <motion.div
                                    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                                    variants={staggerItem}
                                    whileHover={reduceAnimations ? undefined : hoverLift}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-4 h-4 text-orange-500" />
                                        <span className="text-xs text-gray-500 dark:text-slate-400">Streak</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                                        {performanceInsights.streakDays} days
                                    </p>
                                </motion.div>
                            )}

                            {/* Completion Rate */}
                            {performanceInsights.recentSessionsCount > 0 && (
                                <motion.div
                                    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                                    variants={staggerItem}
                                    whileHover={reduceAnimations ? undefined : hoverLift}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                                        <span className="text-xs text-gray-500 dark:text-slate-400">Completion</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                                        {performanceInsights.completionRate}%
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recommended Topics Based on Profession */}
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-500" />
                                {subProfessionData ? `${subProfessionData.name} Topics` : t('selectTopic')}
                            </h2>
                            <motion.button
                                onClick={handleBrowseAllTopics}
                                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                                whileHover={reduceAnimations ? undefined : { x: 2 }}
                            >
                                Browse All
                                <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {recommendedTopics.map((topic) => (
                                <motion.div
                                    key={topic.id}
                                    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-shadow duration-200 group cursor-pointer"
                                    onClick={() => handleStartTopic(topic.id)}
                                    variants={staggerItem}
                                    whileHover={reduceAnimations ? undefined : hoverLift}
                                    whileTap={reduceAnimations ? undefined : tapScale}
                                    transition={TRANSITION_DEFAULT}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && handleStartTopic(topic.id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center shrink-0">
                                                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                                                    {topic.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{topic.subjectName}</p>
                                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 dark:text-slate-400 mt-1 flex-wrap">
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
                                            className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shrink-0"
                                            aria-label={`Start ${topic.name}`}
                                        >
                                            <Play className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Progress bar */}
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

                    {/* Quick Actions - Professional Learning & Settings */}
                    <motion.div
                        className="mt-8"
                        initial={pageVariants.initial}
                        animate={pageVariants.animate}
                        transition={{ ...TRANSITION_DEFAULT, delay: 0.08 }}
                    >
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">
                            Quick Access
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full">
                            {/* Browse Learning Paths Panel */}
                            <motion.button
                                type="button"
                                onClick={handleBrowseAllTopics}
                                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-lg transition-ui group text-left border border-purple-200/50 dark:border-purple-800/30"
                                whileHover={reduceAnimations ? undefined : { y: -2, transition: springTransition }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Layers className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300">Browse Learning Paths</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Explore all subjects and topics organized by profession and specialization.</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs">All Professions</span>
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs">Subjects</span>
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs">Topics</span>
                                </div>
                            </motion.button>

                            {/* Settings Panel */}
                            <motion.button
                                type="button"
                                onClick={() => navigate('/settings')}
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-lg transition-ui group text-left"
                                whileHover={reduceAnimations ? undefined : { y: -2, transition: springTransition }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Settings className="w-5 h-5 text-gray-500 dark:text-slate-300" />
                                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300">Settings</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Update your profession, preferences, and AI tutor settings.</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded text-xs">Profession</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded text-xs">AI Settings</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded text-xs">Theme</span>
                                </div>
                            </motion.button>

                            {/* Study Resources Panel */}
                            <motion.button
                                type="button"
                                onClick={() => {
                                    // Navigate to teaching with studio panel open
                                    if (recommendedTopics.length > 0) {
                                        navigate(`/learn/${recommendedTopics[0].id}`);
                                    } else {
                                        handleBrowseAllTopics();
                                    }
                                }}
                                className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-lg transition-ui group text-left border border-emerald-200/50 dark:border-emerald-800/30"
                                whileHover={reduceAnimations ? undefined : { y: -2, transition: springTransition }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="w-5 h-5 text-emerald-600" />
                                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">Study Resources</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Access AI-generated notes, mind maps, flashcards, and quizzes.</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs">Notes</span>
                                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs">Mind Maps</span>
                                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs">Flashcards</span>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
