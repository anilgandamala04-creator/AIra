/**
 * Main OS Screen — Home State (Post-Login Fix)
 *
 * Central hub after student login. No teaching content is loaded here.
 * Student explicitly chooses learning path: Curriculum Mode or Competitive Mode.
 * Mode selection is mandatory before any teaching begins.
 *
 * Flow A: Curriculum Mode → Board/Grade → Subject → Topic → Main OS (Teaching State)
 * Flow B: Competitive Mode → Exam → Subject or PYQs → Topic → Main OS (Teaching State)
 */

import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, Trophy, ChevronRight, Target, Bookmark, BarChart3, Zap, User, Settings } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import { getProfileCompleteness } from '../utils/profileCompleteness';
import { useSettingsStore } from '../stores/settingsStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useStepBookmarks } from '../hooks/useBackend';
import { useProfilePanelStore } from '../stores/profilePanelStore';
import NotificationCenter from '../components/common/NotificationCenter';
import type { CurriculumType } from '../types';
import OnboardingTour from '../components/common/OnboardingTour';
import { getOnboardingTourDone, clearOnboardingTourDone } from '../components/common/onboardingTourStorage';
import { SubjectMasteryCard } from '../components/common/analytics/SubjectMasteryCard';
import { WeaknessAnalysisCard } from '../components/common/analytics/WeaknessAnalysisCard';
import { RecentAchievementsCard } from '../components/common/analytics/RecentAchievementsCard';
import { AchievementUnlockOverlay } from '../components/common/analytics/AchievementUnlockOverlay';
import { LevelUpCelebration } from '../components/common/analytics/LevelUpCelebration';
import { LeaderboardCard } from '../components/common/analytics/LeaderboardCard';
import { ActivityLogCard } from '../components/common/analytics/ActivityLogCard';
import { useAchievementUIStore } from '../stores/achievementUIStore';
import { useLevelUpUIStore } from '../stores/levelUpUIStore';
import { realTimeEvents, EVENTS } from '../utils/realTimeSync';
import type { Achievement } from '../types';

const MODES: { id: CurriculumType; title: string; icon: React.ReactNode; color: string }[] = [
  {
    id: 'school',
    title: 'Curriculum Mode',
    icon: <School className="w-8 h-8" />,
    color: 'blue',
  },
  {
    id: 'competitive',
    title: 'Competitive Mode',
    icon: <Trophy className="w-8 h-8" />,
    color: 'amber',
  },
];

const today = new Date().toISOString().split('T')[0];

export default function MainOSHomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTour, setShowTour] = useState(false);
  const setCurriculumType = useUserStore((s) => s.setCurriculumType);
  const profile = useUserStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const dailyGoalMinutes = useSettingsStore((s) => s.settings.notifications.dailyStudyGoalMinutes ?? 0);
  const { sessions, metrics } = useAnalyticsStore();
  const { bookmarks } = useStepBookmarks();

  const profileCompleteness = useMemo(
    () => getProfileCompleteness(profile, user?.avatar),
    [profile, user?.avatar]
  );

  useEffect(() => {
    if (searchParams.get('tour') === '1') {
      clearOnboardingTourDone();
      setSearchParams({}, { replace: true });
      setShowTour(true);
    } else if (!getOnboardingTourDone()) {
      setShowTour(true);
    }
  }, [searchParams, setSearchParams]);

  const todayMinutes = useMemo(() => {
    return sessions
      .filter((s) => s.date?.startsWith(today))
      .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  }, [sessions]);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  }, []);
  const daysSinceLastSession = useMemo(() => {
    const dates = sessions.map((s) => s.date?.split('T')[0]).filter(Boolean) as string[];
    if (dates.length === 0) return 999;
    const last = dates.sort((a, b) => b.localeCompare(a))[0];
    const lastDate = new Date(last);
    const now = new Date();
    const diffMs = now.getTime() - lastDate.getTime();
    return Math.floor(diffMs / (24 * 60 * 60 * 1000));
  }, [sessions]);

  const lastTopicId = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    return sorted[0]?.topicId ?? null;
  }, [sessions]);

  // Listener for Achievement Unlocks
  useEffect(() => {
    const showUnlock = useAchievementUIStore.getState().showUnlock;
    const unsubscribe = realTimeEvents.on(EVENTS.ACHIEVEMENT_UNLOCKED, (args: unknown) => {
      const achievement = args as Achievement;
      showUnlock(achievement);
    });
    return () => unsubscribe();
  }, []);

  // Listener for Level Up
  useEffect(() => {
    const showLevelUp = useLevelUpUIStore.getState().showLevelUp;
    const unsubscribe = realTimeEvents.on(EVENTS.LEVEL_UP, (args: unknown) => {
      showLevelUp(args as { level: number; oldLevel: number });
    });
    return () => unsubscribe();
  }, []);

  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem('aira_nudge_dismissed') === '1') setNudgeDismissed(true);
    } catch { /* ignore */ }
  }, []);
  const dismissNudge = () => {
    setNudgeDismissed(true);
    try { sessionStorage.setItem('aira_nudge_dismissed', '1'); } catch { /* ignore */ }
  };

  const thisWeekStats = useMemo(() => {
    const weekSessions = sessions.filter((s) => s.date && s.date >= weekStart);
    const totalMin = weekSessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
    const topicIds = new Set(weekSessions.map((s) => s.topicId).filter(Boolean));
    return {
      totalMinutes: totalMin,
      topicsStudied: topicIds.size,
      sessionsCount: weekSessions.length,
    };
  }, [sessions, weekStart]);

  const handleModeSelect = (type: CurriculumType) => {
    setCurriculumType(type);
    navigate('/curriculum');
  };

  return (
    <>
      {showTour && (
        <OnboardingTour onClose={() => setShowTour(false)} canDismissPermanently />
      )}
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-gradient-theme dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
        {/* Header */}
        <header className="shrink-0 safe-top z-20 flex items-center w-full bg-transparent px-4 sm:px-6 lg:px-8" style={{ height: 'var(--layout-header-height)' }}>
          <div className="flex-1 flex items-center justify-end min-w-0 gap-2 sm:gap-3 overflow-hidden flex-nowrap">
            <NotificationCenter />
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => useProfilePanelStore.getState().open()}
              className="p-1 px-2.5 rounded-full bg-purple-600/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center gap-2"
              aria-label="Open Profile"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">PROFILE</span>
            </button>
          </div>
        </header>
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full min-w-0 px-3 py-8 sm:px-4 sm:py-12 md:py-16 safe-bottom">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 sm:mb-20 md:mb-24"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">
              Orchestrator Mode
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-base sm:text-lg max-w-lg mx-auto px-1" data-reading-content>
              Choose your learning path. No teaching content is loaded until you select a mode and topic.
            </p>
          </motion.div>

          {daysSinceLastSession >= 3 && !nudgeDismissed && sessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 backdrop-blur border border-amber-200 dark:border-amber-800 shadow-sm max-w-lg mx-auto w-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2">
                  <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100" data-reading-content>
                      You haven&apos;t studied in {daysSinceLastSession} days.
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1" data-reading-content>Pick up where you left off?</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  {lastTopicId && (
                    <button
                      type="button"
                      onClick={() => { dismissNudge(); navigate(`/learn/${lastTopicId}`); }}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
                    >
                      Resume
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { dismissNudge(); navigate('/curriculum'); }}
                    className="px-3 py-1.5 bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 rounded-lg text-sm font-medium hover:bg-amber-300 dark:hover:bg-amber-800"
                  >
                    Browse topics
                  </button>
                  <button
                    type="button"
                    onClick={dismissNudge}
                    className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded"
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {profile && profileCompleteness.percent < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur border border-gray-100 dark:border-slate-800 shadow-sm max-w-lg mx-auto w-full"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2">
                <User className="w-4 h-4 text-purple-500" />
                Profile {profileCompleteness.percent}% complete
              </h3>
              <ul className="text-xs text-gray-600 dark:text-slate-400 space-y-1 mb-3">
                {profileCompleteness.items.map((item) => (
                  <li key={item.key} className="flex items-center gap-2">
                    <span aria-hidden>{item.done ? '✓' : '○'}</span>
                    <span className={item.done ? 'text-gray-500 dark:text-slate-500' : ''}>{item.label}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                Complete in Settings →
              </button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur border border-gray-100 dark:border-slate-800 shadow-sm max-w-lg mx-auto w-full"
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              This week
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{thisWeekStats.totalMinutes}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">min studied</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{thisWeekStats.topicsStudied}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">topics</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{thisWeekStats.sessionsCount}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics?.streakDays ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">day streak</p>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black tracking-tighter uppercase">
                    LVL {metrics?.level ?? 1}
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-200">
                    {metrics?.totalXp ?? 0} XP
                  </span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  {Math.round(Math.pow((metrics?.level ?? 1), 2) * 100) - (metrics?.totalXp ?? 0)} XP to Next Level
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, ((metrics?.totalXp ?? 0) - Math.pow(((metrics?.level ?? 1) - 1), 2) * 100) / (Math.pow((metrics?.level ?? 1), 2) * 100 - Math.pow(((metrics?.level ?? 1) - 1), 2) * 100) * 100)}%`
                  }}
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {sessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 w-full"
            >
              <div className="lg:col-span-2 space-y-6">
                <SubjectMasteryCard />
                <LeaderboardCard />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <WeaknessAnalysisCard />
                <RecentAchievementsCard />
                <ActivityLogCard />
              </div>
            </motion.div>
          )}

          <AchievementUnlockOverlay />
          <LevelUpCelebration />

          {dailyGoalMinutes > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur border border-gray-100 dark:border-slate-800 shadow-sm max-w-lg mx-auto w-full"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-200">
                  <Target className="w-4 h-4 text-purple-500" />
                  Daily study goal
                </span>
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  {todayMinutes} / {dailyGoalMinutes} min
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (todayMinutes / dailyGoalMinutes) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {todayMinutes >= dailyGoalMinutes && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">Goal reached today!</p>
              )}
            </motion.div>
          )}

          {bookmarks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur border border-gray-100 dark:border-slate-800 shadow-sm max-w-lg mx-auto w-full"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">
                <Bookmark className="w-4 h-4 text-purple-500" />
                Bookmarked steps
              </h3>
              <ul className="space-y-2">
                {bookmarks.slice(0, 5).map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/learn/${b.topicId}`, { state: { resumeStepIndex: b.stepIndex } })}
                      className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-slate-200 flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="truncate font-medium flex-1">{b.topicName}</span>
                      <span className="text-gray-500 dark:text-slate-400 shrink-0 truncate max-w-[100px] sm:max-w-none">
                        · Step {b.stepIndex + 1}: {b.stepTitle}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {bookmarks.length > 5 && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Showing latest 5. Open a topic to see all in curriculum.</p>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
            {MODES.map((mode) => (
              <motion.button
                key={mode.id}
                type="button"
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeSelect(mode.id)}
                className={`min-h-[44px] w-full p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all text-left group relative overflow-hidden touch-manipulation ${mode.color === 'blue'
                  ? 'hover:border-blue-300 dark:hover:border-blue-700'
                  : 'hover:border-amber-300 dark:hover:border-amber-700'
                  }`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 flex items-center justify-center shrink-0 ${mode.color === 'blue'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600'
                    }`}
                >
                  {mode.icon}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {mode.title}
                </h2>
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
