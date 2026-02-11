import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useTeachingSessions } from '../../hooks/useBackend';
import { getDueFlashcards } from '../../services/backendService';
import { ALL_SUBJECTS } from '../../data/curriculumData';
import type { Topic } from '../../types';
import type { TeachingSession as TeachingSessionType } from '../../types';
import {
    TrendingUp, Award, Target, BarChart3, Zap, ArrowLeft,
    School, Building2, Microscope, Calculator, Brain, Code, Globe, Scale, Palette, Shield,
    Layers, ChevronRight, Clock, BookOpen, Play, CreditCard, PlayCircle, Star, AlertCircle
} from 'lucide-react';
import { BOARD_EXAM_ICONS } from '../../data/curriculumData';
import { pageVariants, staggerContainer, staggerItem, TRANSITION_DEFAULT, tapScale, hoverLift, springTransition } from '../../utils/animations';
import { Skeleton, SkeletonStatCard } from './Skeleton';
import ActivityCalendar from './ActivityCalendar';
import ProgressChart from './ProgressChart';
import { formatNumber } from '../../utils/localeFormat';

interface DashboardViewProps {
    onBack: () => void;
}

export default function DashboardView({ onBack }: DashboardViewProps) {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const profile = useUserStore(useShallow((state) => state.profile));
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));
    const language = useSettingsStore((state) => state.settings.language);

    // Real-time analytics and performance data - tied to user's profile and learning context
    const analytics = useAnalyticsStore(useShallow((state) => ({
        sessions: state.sessions,
        achievements: state.achievements,
        metrics: state.metrics,
    })));

    // Get user's teaching sessions for progress tracking - from backend
    const { sessions: teachingSessions, loading: sessionsLoading } = useTeachingSessions();

    // Due flashcards count for "Review today"
    const [dueCount, setDueCount] = useState(0);
    useEffect(() => {
        if (!user?.id) return;
        getDueFlashcards(user.id).then((cards) => setDueCount(cards.length)).catch(() => setDueCount(0));
    }, [user?.id]);

    // Last in-progress session for "Continue where you left off"
    const lastInProgressSession = useMemo(() => {
        const incomplete = teachingSessions
            .filter((s: TeachingSessionType) => (s.progress ?? 0) < 100)
            .sort((a: TeachingSessionType, b: TeachingSessionType) => {
                const aAt = (a as TeachingSessionType & { updatedAt?: string }).updatedAt ?? a.startTime ?? '';
                const bAt = (b as TeachingSessionType & { updatedAt?: string }).updatedAt ?? b.startTime ?? '';
                return bAt.localeCompare(aAt);
            });
        return incomplete[0] ?? null;
    }, [teachingSessions]);

    // Get user's actual progress for each topic from their sessions
    const getTopicProgress = useCallback((topicId: string): number => {
        const topicSessions = teachingSessions.filter((s: TeachingSessionType) => s.topicId === topicId);
        if (topicSessions.length === 0) return 0;

        const totalProgress = topicSessions.reduce((sum: number, session: TeachingSessionType) => {
            return sum + (session.progress || 0);
        }, 0);

        return Math.round(totalProgress / topicSessions.length);
    }, [teachingSessions]);

    // Recommended topics with real-time progress from user's actual learning data
    const recommendedTopics = useMemo(() => {
        const userSubject = profile?.subject;
        const currentSubjectData = userSubject
            ? ALL_SUBJECTS.find(s => s.name === userSubject || s.id === userSubject.toLowerCase())
            : null;

        if (currentSubjectData) {
            return currentSubjectData.topics.slice(0, 6).map(topic => ({
                id: topic.id,
                name: topic.name,
                duration: topic.duration || `${topic.durationMinutes || 30} min`,
                difficulty: topic.difficulty || 'beginner',
                progress: getTopicProgress(topic.id),
                subjectName: currentSubjectData.name,
            }));
        }

        // Fallback or general recommendations
        interface RecommendedTopic { id: string; name: string; duration: string; difficulty: string; progress: number; subjectName: string; }
        const fallbackTopics: RecommendedTopic[] = [];
        ALL_SUBJECTS.slice(0, 3).forEach(subject => {
            subject.topics.slice(0, 2).forEach(topic => {
                fallbackTopics.push({
                    id: topic.id,
                    name: topic.name,
                    duration: topic.duration || `${topic.durationMinutes || 30} min`,
                    difficulty: topic.difficulty || 'beginner',
                    progress: getTopicProgress(topic.id),
                    subjectName: subject.name,
                });
            });
        });

        return fallbackTopics.slice(0, 6);
    }, [profile?.subject, getTopicProgress]);

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

    // Weak topics: low quiz score or incomplete sessions — "Topics to revisit"
    const weakTopics = useMemo(() => {
        const { sessions: analyticsSessions } = analytics;
        const topicScores = new Map<string, { totalScore: number; count: number; completed: number; total: number }>();
        analyticsSessions.forEach((s) => {
            const t = topicScores.get(s.topicId) ?? { totalScore: 0, count: 0, completed: 0, total: 0 };
            t.total += 1;
            if (s.completionPercentage >= 100) t.completed += 1;
            if (s.quizScore != null) {
                t.totalScore += s.quizScore;
                t.count += 1;
            }
            topicScores.set(s.topicId, t);
        });
        const weak: { topicId: string; name: string; subjectName: string; reason: string }[] = [];
        topicScores.forEach((v, topicId) => {
            const avgScore = v.count > 0 ? v.totalScore / v.count : 100;
            const incomplete = v.completed < v.total;
            if (avgScore >= 60 && !incomplete) return;
            let name = topicId;
            let subjectName = '';
            for (const sub of ALL_SUBJECTS) {
                const topic = (sub.topics as Topic[]).find((t) => t.id === topicId);
                if (topic) {
                    name = topic.name;
                    subjectName = sub.name;
                    break;
                }
            }
            const reason = avgScore < 60 && incomplete ? 'Low score & incomplete' : avgScore < 60 ? 'Low quiz score' : 'Incomplete';
            weak.push({ topicId, name, subjectName, reason });
        });
        weak.sort((a, b) => {
            const aVal = topicScores.get(a.topicId);
            const bVal = topicScores.get(b.topicId);
            const aScore = aVal && aVal.count > 0 ? aVal.totalScore / aVal.count : 100;
            const bScore = bVal && bVal.count > 0 ? bVal.totalScore / bVal.count : 100;
            return aScore - bScore;
        });
        return weak.slice(0, 6);
    }, [analytics]);

    // Activity calendar data: sessions with date + durationMinutes
    const activitySessions = useMemo(() => {
        return analytics.sessions.map((s) => ({
            date: s.date,
            durationMinutes: s.durationMinutes ?? 0,
        }));
    }, [analytics.sessions]);

    // Resolve favorite topic IDs to { id, name, subjectName }
    const favoriteTopics = useMemo(() => {
        const ids = profile?.favoriteTopicIds ?? [];
        const out: { id: string; name: string; subjectName: string }[] = [];
        for (const subject of ALL_SUBJECTS) {
            for (const topic of subject.topics as Topic[]) {
                if (ids.includes(topic.id)) out.push({ id: topic.id, name: topic.name, subjectName: subject.name });
            }
        }
        return out;
    }, [profile?.favoriteTopicIds]);

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

            {/* Welcome Section - variant types from animations are compatible with motion props */}
            <motion.div
                initial={pageVariants.initial as React.ComponentProps<typeof motion.div>['initial']}
                animate={pageVariants.animate as React.ComponentProps<typeof motion.div>['animate']}
                transition={TRANSITION_DEFAULT as React.ComponentProps<typeof motion.div>['transition']}
            >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-2">
                    Welcome back, {user?.displayName || user?.name || 'Learner'}! 👋
                </h3>
                {profile?.curriculumType ? (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium flex items-center gap-1.5">
                            {(() => {
                                const iconName = profile.curriculumType === 'school' ? 'school' : 'zap';
                                const Icon = { 'school': School, 'zap': Zap }[iconName] || Layers;
                                return <Icon className="w-4 h-4" />;
                            })()}
                            {profile.curriculumType === 'school' ? 'Academic' : 'Competitive'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium flex items-center gap-1.5">
                            {(() => {
                                const key = profile.curriculumType === 'school' ? profile.board : profile.exam;
                                const iconName = key ? (BOARD_EXAM_ICONS[key] || 'school') : 'school';
                                const Icon = {
                                    'school': School,
                                    'building-2': Building2,
                                    'microscope': Microscope,
                                    'calculator': Calculator,
                                    'zap': Zap,
                                    'brain': Brain,
                                    'code': Code,
                                    'bar-chart': Brain,
                                    'globe': Globe,
                                    'scale': Scale,
                                    'palette': Palette,
                                    'shield': Shield
                                }[iconName] || School;
                                return <Icon className="w-4 h-4" />;
                            })()}
                            {profile.curriculumType === 'school'
                                ? `${profile.board} - ${profile.grade}`
                                : profile.exam}
                        </span>
                    </div>
                ) : null}
            </motion.div>

            {/* Performance Insights */}
            <motion.div
                initial={pageVariants.initial as React.ComponentProps<typeof motion.div>['initial']}
                animate={pageVariants.animate as React.ComponentProps<typeof motion.div>['animate']}
                transition={{ ...TRANSITION_DEFAULT, delay: 0.04 } as React.ComponentProps<typeof motion.div>['transition']}
            >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Your Performance
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {sessionsLoading ? (
                        <>
                            {[1, 2, 3, 4].map((i) => (
                                <SkeletonStatCard key={i} className="bg-white/80 dark:bg-slate-900/60" />
                            ))}
                        </>
                    ) : (
                        <>
                            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm min-w-0">
                                <div className="flex items-center gap-2 mb-1 min-w-0">
                                    <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate">Total Hours</span>
                                </div>
                                <p className="text-xl font-bold text-gray-800 dark:text-slate-100 truncate">
                                    {formatNumber(performanceInsights.totalHours, { minimumFractionDigits: 1, maximumFractionDigits: 1 }, language)}
                                </p>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm min-w-0">
                                <div className="flex items-center gap-2 mb-1 min-w-0">
                                    <Target className="w-4 h-4 text-green-500 shrink-0" />
                                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate">Topics Completed</span>
                                </div>
                                <p className="text-xl font-bold text-gray-800 dark:text-slate-100 truncate">
                                    {formatNumber(performanceInsights.topicsCompleted, undefined, language)}
                                </p>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm min-w-0">
                                <div className="flex items-center gap-2 mb-1 min-w-0">
                                    <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate">Avg Score</span>
                                </div>
                                <p className="text-xl font-bold text-gray-800 dark:text-slate-100 truncate">
                                    {formatNumber(performanceInsights.averageQuizScore, undefined, language)}%
                                </p>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm min-w-0">
                                <div className="flex items-center gap-2 mb-1 min-w-0">
                                    <Award className="w-4 h-4 text-yellow-500 shrink-0" />
                                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate">Achievements</span>
                                </div>
                                <p className="text-xl font-bold text-gray-800 dark:text-slate-100 truncate">
                                    {performanceInsights.achievementsUnlocked}/{performanceInsights.totalAchievements}
                                </p>
                            </div>
                        </>
                    )}

                    {!sessionsLoading && performanceInsights.streakDays > 0 && (
                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm min-w-0">
                            <div className="flex items-center gap-2 mb-1 min-w-0">
                                <Zap className="w-4 h-4 text-orange-500 shrink-0" />
                                <span className="text-xs text-gray-500 dark:text-slate-400 truncate">Streak</span>
                            </div>
                            <p className="text-xl font-bold text-gray-800 dark:text-slate-100 truncate">
                                {performanceInsights.streakDays} days
                            </p>
                        </div>
                    )}

                    {!sessionsLoading && performanceInsights.recentSessionsCount > 0 && (
                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm min-w-0">
                            <div className="flex items-center gap-2 mb-1 min-w-0">
                                <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span className="text-xs text-gray-500 dark:text-slate-400 truncate">Completion</span>
                            </div>
                            <p className="text-xl font-bold text-gray-800 dark:text-slate-100 truncate">
                                {performanceInsights.completionRate}%
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Continue where you left off */}
            {lastInProgressSession && (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.button
                        type="button"
                        onClick={() => handleStartTopic(lastInProgressSession.topicId)}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-between group text-left"
                        variants={staggerItem}
                        whileHover={reduceAnimations ? undefined : { y: -2 }}
                        whileTap={reduceAnimations ? undefined : tapScale}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <PlayCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Continue where you left off</h3>
                                <p className="text-sm text-indigo-100 truncate max-w-[200px] sm:max-w-none">{lastInProgressSession.topicName}</p>
                                <p className="text-xs text-white/80 mt-0.5">{Math.round(lastInProgressSession.progress ?? 0)}% complete</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-90 group-hover:translate-x-1 transition-transform shrink-0" />
                    </motion.button>
                </motion.div>
            )}

            {/* Topics to revisit (weak topics) */}
            {weakTopics.length > 0 && (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Topics to revisit
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Based on low quiz scores or incomplete sessions.</p>
                    <div className="space-y-2">
                        {weakTopics.map((t) => (
                            <motion.button
                                key={t.topicId}
                                type="button"
                                onClick={() => handleStartTopic(t.topicId)}
                                className="w-full flex items-center justify-between gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/50 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all text-left"
                                variants={staggerItem}
                                whileHover={reduceAnimations ? undefined : { x: 2 }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                            >
                                <div className="min-w-0 flex-1">
                                    <span className="font-medium text-gray-800 dark:text-slate-100 truncate block">{t.name}</span>
                                    <span className="text-xs text-amber-600 dark:text-amber-400">{t.reason}</span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">{t.subjectName}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Activity calendar + Progress chart */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3">Study activity</h3>
                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 shadow-sm space-y-4">
                    <ActivityCalendar sessions={activitySessions} weeks={12} />
                    {analytics.sessions.length > 0 && (
                        <ProgressChart
                            sessions={analytics.sessions}
                            type="studyTime"
                            weeks={8}
                            className="pt-4 border-t border-gray-200 dark:border-slate-700"
                        />
                    )}
                </div>
            </motion.div>

            {/* Favorites */}
            {favoriteTopics.length > 0 && (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        Favorites
                    </h3>
                    <div className="space-y-2">
                        {favoriteTopics.map((t) => (
                            <motion.button
                                key={t.id}
                                type="button"
                                onClick={() => handleStartTopic(t.id)}
                                className="w-full flex items-center justify-between gap-2 p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
                                variants={staggerItem}
                                whileHover={reduceAnimations ? undefined : { x: 2 }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                            >
                                <span className="font-medium text-gray-800 dark:text-slate-100 truncate">{t.name}</span>
                                <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">{t.subjectName}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Review today */}
            {dueCount > 0 && (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.button
                        type="button"
                        onClick={() => navigate('/review')}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-between group text-left"
                        variants={staggerItem}
                        whileHover={reduceAnimations ? undefined : { y: -2 }}
                        whileTap={reduceAnimations ? undefined : tapScale}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Review today</h3>
                                <p className="text-sm text-purple-100">{dueCount} card{dueCount !== 1 ? 's' : ''} due</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-90 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>
            )}

            {/* Recommended Topics */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-500" />
                        {profile?.subject ? `${profile.subject} Topics` : 'Recommended Topics'}
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
                    {sessionsLoading ? (
                        <>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-xl" />
                            ))}
                        </>
                    ) : (
                        recommendedTopics.map((topic) => (
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
                        )))}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={pageVariants.initial as React.ComponentProps<typeof motion.div>['initial']}
                animate={pageVariants.animate as React.ComponentProps<typeof motion.div>['animate']}
                transition={{ ...TRANSITION_DEFAULT, delay: 0.08 } as React.ComponentProps<typeof motion.div>['transition']}
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
                        <p className="text-sm text-gray-500 dark:text-slate-400">Explore all subjects and topics organized by curriculum and grade level.</p>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
