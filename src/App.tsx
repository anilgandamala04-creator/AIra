import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import type { UserRole } from './types';
import { useAuthStore, initAuthListener, tryCompleteMagicLinkSignIn } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { useUserStore } from './stores/userStore';
import { useAnalyticsStore } from './stores/analyticsStore';
import { useTeachingStore } from './stores/teachingStore';
import ErrorBoundary from './components/common/ErrorBoundary';

import FullPageLoader from './components/common/FullPageLoader';
import PageTransition from './components/common/PageTransition';
import ToastContainer from './components/common/Toast';
import RouteWithErrorBoundary from './components/common/RouteWithErrorBoundary';
import IdleTimeoutModal from './components/common/IdleTimeoutModal';
import EmailVerificationBanner from './components/common/EmailVerificationBanner';
import OfflineIndicator from './components/common/OfflineIndicator';
import OfflinePendingIndicator from './components/common/OfflinePendingIndicator';
import InstallPromptBanner from './components/common/InstallPromptBanner';
import NewVersionBanner from './components/common/NewVersionBanner';
import ConsentBanner from './components/common/ConsentBanner';
import { useToastStore, toast } from './stores/toastStore';
import { useStudyReminder } from './hooks/useStudyReminder';
import { useConsentStore } from './stores/consentStore';
import { useOfflineQueueStore } from './stores/offlineQueueStore';
import { changeLanguageFn, i18nPreloaded, setI18nReady, whenI18nReady } from './i18nBridge';
import { needsOnboarding as needsOnboardingCheck } from './utils/onboarding';

const ProfileSettingsPanel = lazy(() => import('./components/common/ProfileSettingsPanel'));

// Lazy load pages for better performance (code-splitting)
// Wrap lazy imports with error handling and retry logic to catch module loading failures
const createLazyPage = (importFn: () => Promise<{ default: React.ComponentType<Record<string, never>> }>, pageName: string) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error: unknown) {
      console.error(`Failed to load ${pageName}:`, error);
      // Retry once after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        return await importFn();
      } catch (retryError: unknown) {
        console.error(`Failed to load ${pageName} after retry:`, retryError);
        throw new Error(`Failed to load ${pageName.toLowerCase()}. Please refresh the page.`);
      }
    }
  });
};

const LoginPage = createLazyPage(() => import('./pages/LoginPage'), 'LoginPage');
const TeachingPage = createLazyPage(() => import('./pages/TeachingPage'), 'TeachingPage');
const SettingsPage = createLazyPage(() => import('./pages/SettingsPage'), 'SettingsPage');
const CurriculumPage = createLazyPage(() => import('./pages/CurriculumPage'), 'CurriculumPage');
const ReviewPage = createLazyPage(() => import('./pages/ReviewPage'), 'ReviewPage');
const MainOSHomePage = createLazyPage(() => import('./pages/MainOSHomePage'), 'MainOSHomePage');
const TeacherDashboardPage = createLazyPage(() => import('./pages/TeacherDashboardPage'), 'TeacherDashboardPage');
const AdminDashboardPage = createLazyPage(() => import('./pages/AdminDashboardPage'), 'AdminDashboardPage');
const NotFoundPage = createLazyPage(() => import('./pages/NotFoundPage'), 'NotFoundPage');

// ---------------------------------------------------------------------------
// Three Login Patterns (Strict Separation)
// ---------------------------------------------------------------------------
// Student: Login → Main OS Screen (Home State) → Mode Selection → path selection → Teaching State.
// Teacher/Admin: Login → role-specific dashboard.
// ---------------------------------------------------------------------------
// Role-based home paths: Student lands on Main OS Home (mode selection); no teaching before mode chosen.
function getRoleHome(role: UserRole): string {
  if (role === 'teacher') return '/teacher';
  if (role === 'admin') return '/admin';
  return '/';
}

// Protected route wrapper with strict role separation.
// allowedRoles: only these roles can access. Omit = student-only flow (onboarding, curriculum, learn). Teachers/admins never see content routes.
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isGuest = useAuthStore((state) => state.isGuest);
  const user = useAuthStore((state) => state.user);
  const role: UserRole = user?.role ?? 'student';
  const {
    profile,
    curriculumType,
    selectedBoard,
    selectedGrade,
    selectedExam,
    selectedSubject,
    onboardingStep,
    userDataLoaded
  } = useUserStore(useShallow((state) => ({
    profile: state.profile,
    curriculumType: state.curriculumType,
    selectedBoard: state.selectedBoard,
    selectedGrade: state.selectedGrade,
    selectedExam: state.selectedExam,
    selectedSubject: state.selectedSubject,
    onboardingStep: state.onboardingStep,
    userDataLoaded: state.userDataLoaded,
  })));
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader message="Loading..." />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Role gate: if this route is for specific roles, redirect others to their home
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      return <Navigate to={getRoleHome(role)} replace />;
    }
    // Teacher/Admin: no onboarding check; data load optional for dashboard
    if (!isGuest && !userDataLoaded && (role === 'teacher' || role === 'admin')) {
      return <FullPageLoader message="Loading your data..." />;
    }
    return (
      <>
        <EmailVerificationBanner />
        {children}
      </>
    );
  }

  // Student-only routes: guests and students only; teachers/admins must not see content
  if (role === 'teacher' || role === 'admin') {
    return <Navigate to={getRoleHome(role)} replace />;
  }
  if (!isGuest && !userDataLoaded) {
    return <FullPageLoader message="Loading your data..." />;
  }

  if (profile?.onboardingCompleted && location.pathname === '/') {
    const topicId = profile?.currentTopic;
    if (topicId) return <Navigate to={`/learn/${topicId}`} replace />;
    return <Navigate to="/curriculum" replace />;
  }

  const needs = needsOnboardingCheck({
    onboardingStep,
    curriculumType,
    selectedBoard,
    selectedGrade,
    selectedExam,
    selectedSubject,
    profile,
  });

  if (needs && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <EmailVerificationBanner />
      {children}
    </>
  );
}

// Applies all user settings to the document and i18n in real time so the entire
// application reflects changes immediately across all screens—no refresh or restart.
// Subscribes to the full settings object; any change (theme, language, accessibility,
// voice, etc.) triggers a re-render and these effects run immediately.
function SettingsEffect() {
  const settings = useSettingsStore(useShallow((state) => state.settings));
  const setTeachingSpeaking = useTeachingStore((state) => state.setSpeaking);

  // Theme: applied instantly to <html> (light / dark / system) so all pages update
  // themeDarkAfterHour (0-23): when set with theme 'system', use dark after that hour (e.g. 20 = 8pm)
  useEffect(() => {
    const html = document.documentElement;
    const theme = settings.theme;
    const darkAfterHour = settings.themeDarkAfterHour;

    const applyDark = (dark: boolean) => {
      if (dark) {
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
      } else {
        html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
      }
    };

    if (theme === 'dark') {
      applyDark(true);
    } else if (theme === 'light') {
      applyDark(false);
    } else {
      // System theme - optionally time-based (dark after X pm)
      if (typeof darkAfterHour === 'number' && darkAfterHour >= 0 && darkAfterHour <= 23) {
        const check = () => {
          const hour = new Date().getHours();
          applyDark(hour >= darkAfterHour);
        };
        check();
        const interval = setInterval(check, 60 * 1000); // check every minute
        return () => clearInterval(interval);
      }
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyDark(prefersDark);
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => applyDark(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, settings.themeDarkAfterHour]);

  // Font size, font family, line spacing, high contrast, reduce animations, language, RTL, TTS
  useEffect(() => {
    const html = document.documentElement;
    const a = settings.accessibility;

    html.setAttribute('data-font-size', a.fontSize);
    html.setAttribute('data-font-family', a.fontFamily ?? 'system');
    html.setAttribute('data-line-spacing', a.lineSpacing ?? 'default');
    html.setAttribute('data-high-contrast', a.highContrast ? 'true' : 'false');
    html.setAttribute('data-reduce-animations', a.reduceAnimations ? 'true' : 'false');
    document.documentElement.lang = settings.language;
    const isRtl = /^(ar|he|fa|ur)$/.test(settings.language);
    html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    changeLanguageFn(settings.language);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (!a.textToSpeech) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
        setTeachingSpeaking(false);
      }
    }
  }, [
    settings.language,
    settings.accessibility,
    setTeachingSpeaking,
  ]);

  // Accent color: apply CSS variables for buttons/links (accentColors is stable, inlined for clarity)
  useEffect(() => {
    const accentColors: Record<string, { main: string; variant: string }> = {
      purple: { main: '#8b7dd6', variant: '#a78bfa' },
      blue: { main: '#3b82f6', variant: '#60a5fa' },
      green: { main: '#10b981', variant: '#34d399' },
      amber: { main: '#f59e0b', variant: '#fbbf24' },
      rose: { main: '#f43f5e', variant: '#fb7185' },
    };
    const accent = settings.accentColor ?? 'purple';
    const { main, variant } = accentColors[accent] ?? accentColors.purple;
    document.documentElement.style.setProperty('--color-accent', main);
    document.documentElement.style.setProperty('--color-accent-violet', variant);
  }, [settings.accentColor]);

  return null;
}

// Default redirect: by role (Teacher → /teacher, Admin → /admin, Student → onboarding or Main OS)
function DefaultRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const role: UserRole = user?.role ?? 'student';
  const {
    profile,
    curriculumType,
    selectedBoard,
    selectedGrade,
    selectedExam,
    selectedSubject,
    onboardingStep,
    userDataLoaded
  } = useUserStore(useShallow((state) => ({
    profile: state.profile,
    curriculumType: state.curriculumType,
    selectedBoard: state.selectedBoard,
    selectedGrade: state.selectedGrade,
    selectedExam: state.selectedExam,
    selectedSubject: state.selectedSubject,
    onboardingStep: state.onboardingStep,
    userDataLoaded: state.userDataLoaded,
  })));

  if (isLoading) return <FullPageLoader message="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === 'teacher') return <Navigate to="/teacher" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;

  if (!isGuest && !userDataLoaded) {
    return <FullPageLoader message="Loading your data..." />;
  }

  // Skip onboarding for returning users who have completed it
  if (profile?.onboardingCompleted) {
    const topicId = profile?.currentTopic;
    if (topicId) return <Navigate to={`/learn/${topicId}`} replace />;
    return <Navigate to="/curriculum" replace />;
  }

  const needs = needsOnboardingCheck({
    onboardingStep,
    curriculumType,
    selectedBoard,
    selectedGrade,
    selectedExam,
    selectedSubject,
    profile,
  });

  if (needs) return <MainOSHomePage />;
  const topicId = profile?.currentTopic;
  if (topicId) return <Navigate to={`/learn/${topicId}`} replace />;
  return <MainOSHomePage />;
}

// Animated Routes Component - key by language so route content remounts when language changes,
// guaranteeing all translated content updates instantly.
function AnimatedRoutes() {
  const location = useLocation();
  const language = useSettingsStore(useShallow((state) => state.settings.language));

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={`${location.pathname}-${language}`} className="w-full">
        <Routes location={location}>
          {/* Public routes */}
          <Route path="/login" element={<RouteWithErrorBoundary><LoginPage /></RouteWithErrorBoundary>} />

          {/* Protected routes */}

          {/* Main OS: 1A = curriculum (syllabus-mapped, realistic visuals, board-style). 1B = competitive (exam-oriented, step-by-step problem solving; visuals = problem breakdowns, not storytelling; voice = analytical, not narrative; content = exam syllabus + selected topic only). */}
          <Route
            path="/learn/:topicId?"
            element={
              <RouteWithErrorBoundary>
                <ProtectedRoute>
                  <TeachingPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            }
          />

          {/* Dashboard is only accessible within Profile panel - no separate route */}

          {/* Curriculum Browser - Professional Learning Paths */}
          <Route
            path="/curriculum"
            element={
              <RouteWithErrorBoundary>
                <ProtectedRoute>
                  <CurriculumPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            }
          />

          <Route
            path="/review"
            element={
              <RouteWithErrorBoundary>
                <ProtectedRoute>
                  <ReviewPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            }
          />

          <Route
            path="/settings"
            element={
              <RouteWithErrorBoundary>
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            }
          />

          {/* Teacher Login Flow (Diagnostic, Not Teaching): Login → Select Grade → Select Subject → Analytics Dashboard → Student-Level Drilldown. Sees: class-wide heatmap, topic-wise weakness, individual gaps. Can pick a student → weak subject, exact weak topics, error patterns (conceptual vs careless). No content browsing. */}
          <Route
            path="/teacher"
            element={
              <RouteWithErrorBoundary>
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboardPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            }
          />

          {/* Admin/Principal Login Flow (Governance, Not Micromanagement): Login → Select Grade → Select Subject → Analytics Dashboard. Sees: Teacher↔Subject mapping, student performance trends, cross-class comparison. Can track: which teacher handles which subject, which subject is underperforming, which topics are systemic problems. */}
          <Route
            path="/admin"
            element={
              <RouteWithErrorBoundary>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            }
          />

          <Route path="/profile" element={<Navigate to="/curriculum" replace />} />

          {/* Default redirect - redirect authenticated users to active session or curriculum, unauthenticated to login */}
          {/* Dashboard is only accessible via Profile panel, not automatic redirects */}
          <Route path="/" element={<DefaultRedirect />} />

          {/* 404: show "Page not found" for unknown routes; authenticated users see link to Home/Curriculum */}
          <Route path="*" element={<RouteWithErrorBoundary><NotFoundPage /></RouteWithErrorBoundary>} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

// PWA share target handler — must be a child of BrowserRouter to use useNavigate
function ShareTargetHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url') || params.get('text');
    if (!sharedUrl) return;
    try {
      const path = new URL(sharedUrl, window.location.origin).pathname;
      const match = path.match(/^\/learn\/([^/]+)/);
      if (match) {
        navigate(`/learn/${match[1]}`, { replace: true });
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
      }
    } catch {
      // ignore
    }
  }, [navigate]);
  return null;
}

function App() {
  const { toasts, removeToast } = useToastStore();

  const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));
  useStudyReminder();
  const stopHealthRef = useRef<(() => void) | null>(null);

  // Apply cookie consent to analytics settings on load (returning users who already consented)
  useEffect(() => {
    const consent = useConsentStore.getState();
    if (consent.hasConsented) {
      useSettingsStore.getState().updatePrivacy({ analyticsEnabled: consent.analytics });
    }
  }, []);

  // When back online, process offline queue and refresh pending count
  useEffect(() => {
    const handleOnline = () => {
      import('./utils/offlineQueueProcessor').then((m) => m.processQueue()).catch(() => { });
      useOfflineQueueStore.getState().refresh();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // PWA: listen for "Add to home screen" prompt
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;
    import('./stores/installPromptStore').then((m) => {
      if (cancelled) return;
      unsub = m.initInstallPromptListener();
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);
  const userDataTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [i18nReady, setI18nReadyState] = useState(i18nPreloaded);

  // Sync with i18n when it becomes ready (main may load it after App mounts)
  useEffect(() => {
    whenI18nReady(() => {
      changeLanguageFn(useSettingsStore.getState().settings.language);
      setI18nReadyState(true);
    });
    // Safety timeout: if i18n fails to load or hangs for any reason, unblock the UI after 1.5s
    // This ensures failsafe startup even if localization is broken
    const i18nTimeout = setTimeout(() => {
      setI18nReadyState((ready) => {
        if (!ready) {
          console.warn('[App] i18n initialization timed out - forcing ready state');
          return true;
        }
        return ready;
      });
    }, 1500);

    import('./i18n').then((m) => {
      setI18nReady(m.changeLanguage);
      changeLanguageFn(useSettingsStore.getState().settings.language);
      setI18nReadyState(true);
      clearTimeout(i18nTimeout);
    }).catch((e) => {
      console.error('[App] i18n load error:', e);
      setI18nReadyState(true);
      clearTimeout(i18nTimeout);
    });

    return () => clearTimeout(i18nTimeout);
  }, []);

  // Complete magic link sign-in if URL is an email link (before auth listener runs)
  useEffect(() => {
    tryCompleteMagicLinkSignIn().catch(() => { });
  }, []);

  // Initialize auth listener first (needed for first paint). Defer sync and AI to avoid startup delay.
  useEffect(() => {
    const unsubscribeAuth = initAuthListener();

    // Preload backend immediately so user-data subscription can resolve quickly when auth completes
    const preloadId = window.setTimeout(() => {
      import('./services/backendService').catch(() => { });
    }, 0);

    // Defer real-time sync: load module and init on next tick so main bundle stays smaller
    let unsubscribeSync: (() => void) | undefined;
    const syncId = window.setTimeout(() => {
      import('./utils/realTimeSync').then((m) => {
        unsubscribeSync = m.initRealTimeSync();
      }).catch(() => { });
    }, 0);

    // Defer AI health and init so shell and routes render first (reduces perceived loading delay)
    // Increased delays to allow main thread to settle before starting heavy background tasks
    const HEALTH_START_MS = 3000;
    const AI_INIT_MS = 5000;
    const healthStartId = window.setTimeout(() => {
      import('./services/aiHealthCheck').then((healthMod) => {
        healthMod.startHealthMonitoring(60000);
        stopHealthRef.current = healthMod.stopHealthMonitoring;
      }).catch((err) => console.error('[App] Failed to load AI health:', err));
    }, HEALTH_START_MS);

    const lastHealthyRef = { current: false };
    const deferredId = window.setTimeout(() => {
      Promise.all([
        import('./services/aiHealthCheck'),
        import('./services/aiIntegration'),
      ]).then(([healthMod, aiMod]) => {
        aiMod.initializeAI().then((status) => {
          lastHealthyRef.current = status.isOnline;
          if (!status.isOnline) {
            toast.info('AI backend is not running. Start it with: npm run dev:backend (from project root) to enable chat.', 8000);
          }
        }).catch((err) => {
          console.error('[App] AI initialization error:', err);
        });

        // Re-initialize AI when backend recovers (unhealthy → healthy) so all panels see consistent status
        healthMod.subscribeToHealthUpdates((status) => {
          if (status.isHealthy && !lastHealthyRef.current) {
            lastHealthyRef.current = true;
            aiMod.initializeAI().catch(() => { });
          } else if (!status.isHealthy) {
            lastHealthyRef.current = false;
          }
        });
      }).catch((err) => {
        console.error('[App] Failed to load AI modules:', err);
      });
    }, AI_INIT_MS);

    return () => {
      window.clearTimeout(preloadId);
      window.clearTimeout(syncId);
      window.clearTimeout(healthStartId);
      window.clearTimeout(deferredId);
      unsubscribeAuth();
      unsubscribeSync?.();
      stopHealthRef.current?.();
      // Defensive: ensure health monitoring is stopped even if ref was set late or not at all
      import('./services/aiHealthCheck').then((m) => m.stopHealthMonitoring()).catch(() => { });
    };
  }, []);

  // Subscribe to user data from backend when a user is logged in (non-guest).
  const authUser = useAuthStore((s) => (s.isGuest ? null : s.user));
  const authUid = authUser?.id;
  const isGuest = useAuthStore((s) => s.isGuest);
  useEffect(() => {
    if (!authUid) {
      useUserStore.getState().setUserDataLoaded(false);
      return;
    }
    // Guest users don't subscribe to backend; mark loaded so ProtectedRoute doesn't block
    if (isGuest) {
      useUserStore.getState().setUserDataLoaded(true);
      return;
    }

    let isMounted = true;
    const USER_DATA_LOAD_TIMEOUT_MS = 3000; // Unblock after 3s if backend never fires so UX isn't stuck
    const unsubscribeRef = { current: null as (() => void) | null };

    // Load backend only when user is logged in (not guest) to reduce initial bundle
    (async () => {
      const { setUser, getUser, subscribeToUserData } = await import('./services/backendService');

      // Create user doc in background for new users; do not block on it so first snapshot unblocks UI
      const initializeUserIfNeeded = () => {
        getUser(authUid)
          .then((existingUser) => {
            if (!existingUser) {
              const role = useAuthStore.getState().pendingLoginRole ?? 'student';
              return setUser(authUid, {
                role,
                plan: 'simple',
                onboardingCompleted: false,
              });
            }
          })
          .catch((error) => {
            console.error('[App] Failed to sync user to backend:', error);
          });
      };

      // Skip subscribing if effect already cleaned up (e.g. user logged out before import completed)
      if (!isMounted) return;
      // Subscribe first: first snapshot (often from cache) sets userDataLoaded and unblocks the app
      unsubscribeRef.current = subscribeToUserData(
        authUid,
        (data) => {
          if (!isMounted) return;
          useUserStore.getState().setUserDataLoaded(true);
          if (!data) return;

          try {
            const currentUser = useAuthStore.getState().user;
            if (currentUser && (data.role || data.plan !== undefined)) {
              useAuthStore.setState((state) => ({
                user: state.user ? {
                  ...state.user,
                  role: data.role || state.user.role || 'student',
                  plan: data.plan || state.user.plan || 'simple',
                } : null,
              }));
            }

            if (data.profile != null) {
              const store = useUserStore.getState();
              const localStep = store.onboardingStep;
              const isLocalComplete = (
                localStep === -1 &&
                store.curriculumType &&
                store.selectedSubject &&
                store.profile?.currentTopic
              );
              const isServerIncomplete = (
                !data.profile.curriculumType ||
                !data.profile.subject ||
                !data.profile.currentTopic
              );
              if (!(isLocalComplete && isServerIncomplete)) {
                useUserStore.getState().setProfile(data.profile);
                if (data.profile.onboardingCompleted || data.profile.curriculumType) {
                  useUserStore.getState().setOnboardingStep(-1);
                }
              }
            }

            if (data.analytics != null) {
              useAnalyticsStore.setState({
                sessions: data.analytics.sessions || [],
                achievements: data.analytics.achievements || [],
                metrics: data.analytics.metrics || {
                  totalHours: 0,
                  topicsCompleted: 0,
                  averageQuizScore: 0,
                  knowledgeRetention: 0,
                  weeklyHours: [0, 0, 0, 0, 0, 0, 0],
                  streakDays: 0,
                },
              });
              // Recompute streak and derived metrics from loaded sessions
              useAnalyticsStore.getState().updateMetrics();
              useAnalyticsStore.getState().checkAchievements();
            }

            if (data.settings != null) {
              const sanitized = Object.fromEntries(
                Object.entries(data.settings).filter(([, v]) => v !== undefined)
              ) as Partial<typeof data.settings>;
              useSettingsStore.setState((s) => ({
                settings: { ...s.settings, ...sanitized },
              }));
              if (sanitized.language) {
                changeLanguageFn(sanitized.language);
              }
            }
          } catch (error) {
            console.error('[App] Error processing user data:', error);
          }
        },
        (err) => {
          if (!isMounted) return;
          useUserStore.getState().setUserDataLoaded(true);
          console.error('User data subscription error:', err);
          toast.error('Could not sync your data. You can keep using the app; try again later.');
        }
      );

      // Create profile doc for new users in background; subscription will get a second snapshot when it exists
      initializeUserIfNeeded();
    })().catch((err) => {
      console.error('[App] Backend load error:', err);
      // Failsafe: if backend fails to load, unblock app anyway
      if (isMounted) {
        useUserStore.getState().setUserDataLoaded(true);
        toast.error('Connection issue: Running in offline mode.');
      }
    });

    // Failsafe timeout: Force app open if backend/data takes too long (e.g. slow network)
    // Run OUTSIDE the async import so it works even if import hangs
    userDataTimeoutRef.current = setTimeout(() => {
      if (!isMounted) return;
      if (!useUserStore.getState().userDataLoaded) {
        useUserStore.getState().setUserDataLoaded(true);
        console.warn('[App] User data load timed out - forcing open');
        toast.info('Your data is taking a while. Opening app now...');
      }
    }, USER_DATA_LOAD_TIMEOUT_MS + 2000); // Give it a bit more time (3.5s total) before giving up

    return () => {
      isMounted = false;
      if (userDataTimeoutRef.current != null) clearTimeout(userDataTimeoutRef.current);
      unsubscribeRef.current?.();
    };
  }, [authUid, isGuest]);

  if (!i18nReady) {
    return <FullPageLoader message="Loading..." />;
  }

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion={reduceAnimations ? 'always' : 'never'}>
        <BrowserRouter>
          <SettingsEffect />
          <ShareTargetHandler />
          <Suspense fallback={<FullPageLoader message="Loading..." />}>
            <AnimatedRoutes />
          </Suspense>
          <Suspense fallback={null}>
            <ProfileSettingsPanel />
          </Suspense>
          <ToastContainer toasts={toasts} onClose={removeToast} />
          <OfflineIndicator />
          <OfflinePendingIndicator />
          <InstallPromptBanner />
          <NewVersionBanner />
          <ConsentBanner />

          <IdleTimeoutModal />
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
