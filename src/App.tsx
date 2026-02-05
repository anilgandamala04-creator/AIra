import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore, initAuthListener } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { useUserStore } from './stores/userStore';
import { useAnalyticsStore } from './stores/analyticsStore';
import { setUser, getUser, subscribeToUserData } from './services/backendService';
import { useTeachingStore } from './stores/teachingStore';
import { changeLanguage } from './i18n';
import { initRealTimeSync } from './utils/realTimeSync';
import { startHealthMonitoring, stopHealthMonitoring } from './services/aiHealthCheck';
import { initializeAI } from './services/aiIntegration';
import ErrorBoundary from './components/common/ErrorBoundary';
import FullPageLoader from './components/common/FullPageLoader';
import PageTransition from './components/common/PageTransition';
import ToastContainer from './components/common/Toast';
import ProfileSettingsPanel from './components/common/ProfileSettingsPanel';
import RouteWithErrorBoundary from './components/common/RouteWithErrorBoundary';
import { useToastStore, toast } from './stores/toastStore';

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
const OnboardingPage = createLazyPage(() => import('./pages/OnboardingPage'), 'OnboardingPage');
const TeachingPage = createLazyPage(() => import('./pages/TeachingPage'), 'TeachingPage');
const SettingsPage = createLazyPage(() => import('./pages/SettingsPage'), 'SettingsPage');
// Dashboard is embedded in Profile panel - no separate page needed
const CurriculumPage = createLazyPage(() => import('./pages/CurriculumPage'), 'CurriculumPage');

// Protected route wrapper
// ENFORCES STRICT LINEAR FLOW: Login → Professional Mode → Sub-Professional Mode → Subject → Topic → Main OS Screen
// No shortcuts, bypasses, or alternate entry points allowed
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isGuest = useAuthStore((state) => state.isGuest);
  const userDataLoaded = useUserStore((state) => state.userDataLoaded);
  const profile = useUserStore((state) => state.profile);
  const onboardingStep = useUserStore((state) => state.onboardingStep);
  const location = useLocation();

  // Show loading while auth is initializing
  if (isLoading) {
    return <FullPageLoader message="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Wait for Firestore user data before deciding onboarding (avoids wrong redirect on refresh)
  if (!isGuest && !userDataLoaded) {
    return <FullPageLoader message="Loading your data..." />;
  }

  // STRICT ONBOARDING ENFORCEMENT: Check if onboarding is needed
  // onboardingStep >= 0 means onboarding is in progress or not started
  // !profile?.profession means user hasn't selected profession (critical step)
  // !profile?.subProfession means user hasn't selected sub-profession (critical step)
  // !profile?.subject means user hasn't selected subject (critical step)
  // !profile?.currentTopic means user hasn't selected topic (critical step)
  const needsOnboarding =
    onboardingStep >= 0 ||
    !profile?.profession ||
    !profile?.subProfession ||
    !profile?.subject ||
    !profile?.currentTopic;

  // If onboarding is needed, redirect to onboarding (unless already on onboarding page)
  // This prevents access to ANY protected route until onboarding is complete
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is complete but user is on onboarding page, redirect to Main OS Screen
  // This ensures users complete the flow and go directly to Main OS Screen
  if (!needsOnboarding && location.pathname === '/onboarding') {
    // User has completed onboarding - redirect to Main OS Screen for their selected topic
    const topicId = profile?.currentTopic;
    if (topicId) {
      return <Navigate to={`/learn/${topicId}`} replace />;
    }
    // Fallback: if no topic selected (shouldn't happen), redirect to onboarding
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Applies all user settings to the document and i18n in real time. Subscribes to the
// full settings object so any change (theme, language, accessibility, voice, etc.)
// triggers a re-render and effects run immediately—UI and behavior stay in sync app-wide.
function SettingsEffect() {
  const settings = useSettingsStore(useShallow((state) => state.settings));
  const setTeachingSpeaking = useTeachingStore((state) => state.setSpeaking);

  // Theme: applied instantly to document (light / dark / system)
  useEffect(() => {
    const html = document.documentElement;
    const theme = settings.theme;

    if (theme === 'dark') {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
      } else {
        html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          html.classList.add('dark');
          html.setAttribute('data-theme', 'dark');
        } else {
          html.classList.remove('dark');
          html.setAttribute('data-theme', 'light');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  // Font size, high contrast, reduce animations, language, and TTS: applied instantly
  // so all pages and components pick up the new values on next render.
  useEffect(() => {
    const html = document.documentElement;
    const a = settings.accessibility;

    html.setAttribute('data-font-size', a.fontSize);
    html.setAttribute('data-high-contrast', a.highContrast ? 'true' : 'false');
    html.setAttribute('data-reduce-animations', a.reduceAnimations ? 'true' : 'false');
    document.documentElement.lang = settings.language;
    changeLanguage(settings.language);

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

  return null;
}

// Default redirect component - ENFORCES STRICT LINEAR FLOW
// Redirects to onboarding if not complete, otherwise to Main OS Screen
function DefaultRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isGuest = useAuthStore((state) => state.isGuest);
  const userDataLoaded = useUserStore((state) => state.userDataLoaded);
  const profile = useUserStore((state) => state.profile);
  const onboardingStep = useUserStore((state) => state.onboardingStep);

  // Show loading while auth is initializing
  if (isLoading) {
    return <FullPageLoader message="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for Firestore user data before deciding redirect (avoids wrong redirect on refresh)
  if (!isGuest && !userDataLoaded) {
    return <FullPageLoader message="Loading your data..." />;
  }

  // STRICT ONBOARDING ENFORCEMENT: Check if onboarding is needed
  // All required steps must be completed: profession, subProfession, subject, currentTopic
  const needsOnboarding =
    onboardingStep >= 0 ||
    !profile?.profession ||
    !profile?.subProfession ||
    !profile?.subject ||
    !profile?.currentTopic;

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Onboarding complete - redirect to Main OS Screen for selected topic
  // This enforces the exact flow: Login → Onboarding → Main OS Screen
  const topicId = profile?.currentTopic;
  if (topicId) {
    return <Navigate to={`/learn/${topicId}`} replace />;
  }

  // Fallback: if no topic (shouldn't happen), redirect to onboarding
  return <Navigate to="/onboarding" replace />;
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
          <Route
            path="/onboarding"
            element={
              <RouteWithErrorBoundary>
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            }
          />

          {/* Main OS Screen (Teaching Page) */}
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
            path="/settings"
            element={
              <RouteWithErrorBoundary>
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            }
          />

          <Route path="/profile" element={<Navigate to="/curriculum" replace />} />

          {/* Default redirect - redirect authenticated users to active session or curriculum, unauthenticated to login */}
          {/* Dashboard is only accessible via Profile panel, not automatic redirects */}
          <Route path="/" element={<DefaultRedirect />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  const { toasts, removeToast } = useToastStore();
  const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));

  // Initialize auth listener (await redirect result first), real-time sync, and AI health monitoring on mount
  useEffect(() => {
    const unsubscribeAuth = initAuthListener();
    const unsubscribeSync = initRealTimeSync();

    startHealthMonitoring(60000);
    initializeAI().then((status) => {
      if (!status.isOnline) {
        console.warn('[App] AI backend not available - chat and AI features need the backend. Start it with: npm run dev:backend');
        toast.info('AI backend is not running. Start it with: npm run dev:backend (from project root) to enable chat.', 8000);
      }
    }).catch((err) => {
      console.error('[App] AI initialization error:', err);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSync();
      stopHealthMonitoring();
    };
  }, []);

  // Subscribe to user data from Firestore when a user is logged in.
  // Real-time sync: profile, settings, and analytics stay in sync across tabs/devices.
  // Subscribe first so we get a quick first snapshot (or null); init user doc in background to avoid hanging.
  const authUser = useAuthStore((s) => (s.isGuest ? null : s.user));
  const authUid = authUser?.id;
  const isGuest = useAuthStore((s) => s.isGuest);
  useEffect(() => {
    if (!authUid) {
      useUserStore.getState().setUserDataLoaded(false);
      return;
    }
    // Guest users don't subscribe to Firestore; mark loaded so ProtectedRoute doesn't block
    if (isGuest) {
      useUserStore.getState().setUserDataLoaded(true);
      return;
    }

    let isMounted = true;
    const USER_DATA_LOAD_TIMEOUT_MS = 12000; // Unblock UI if Firestore is slow/unresponsive

    // Initialize user document in Firestore if it doesn't exist (for new users). Run in background so we don't block subscription.
    const initializeUserIfNeeded = async () => {
      try {
        const existingUser = await getUser(authUid);
        if (!existingUser) {
          await setUser(authUid, {
            role: 'student',
            plan: 'simple',
            onboardingCompleted: false,
          });
        }
      } catch (error) {
        console.error('[App] Failed to sync user to Firestore:', error);
      }
    };

    let unsubscribe: (() => void) | null = null;

    // Timeout fallback: if Firestore doesn't respond in time, unblock the UI so the user can proceed
    const timeoutId = setTimeout(() => {
      if (!isMounted) return;
      if (!useUserStore.getState().userDataLoaded) {
        useUserStore.getState().setUserDataLoaded(true);
        toast.info('Data is taking longer than usual to load. You can continue; it will sync when ready.');
      }
    }, USER_DATA_LOAD_TIMEOUT_MS);

    // Subscribe immediately so we get a first snapshot quickly (or null if doc doesn't exist yet)
    unsubscribe = subscribeToUserData(
        authUid,
        (data) => {
          if (!isMounted) return;
          useUserStore.getState().setUserDataLoaded(true);
          // If no data exists, still mark loaded so we don't block forever
          if (!data) return;

          try {
            // Update auth store with role and plan from Database
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

            // Update profile from server, but never overwrite locally completed onboarding with stale data.
            if (data.profile != null) {
              const store = useUserStore.getState();
              const localStep = store.onboardingStep;
              const localProfile = store.profile;
              const localOnboardingComplete = localStep === -1 && localProfile?.currentTopic && localProfile?.profession;
              const serverIncomplete =
                !data.profile.currentTopic ||
                !data.profile.profession ||
                data.profile.onboardingCompleted === false;

              if (!(localOnboardingComplete && serverIncomplete)) {
                useUserStore.getState().setProfile(data.profile);
                if (data.profile.onboardingCompleted || data.profile.profession) {
                  useUserStore.getState().setOnboardingStep(-1);
                }
              }
            }

            // Update analytics with null safety
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
            }

            // Update settings - omit undefined so we don't overwrite with undefined
            if (data.settings != null) {
              const sanitized = Object.fromEntries(
                Object.entries(data.settings).filter(([, v]) => v !== undefined)
              ) as Partial<typeof data.settings>;
              useSettingsStore.setState((s) => ({
                settings: { ...s.settings, ...sanitized },
              }));
              if (sanitized.language) {
                changeLanguage(sanitized.language);
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

    // Create user doc in background if missing; subscription will fire again when doc exists
    initializeUserIfNeeded();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe?.();
    };
  }, [authUid, isGuest]);

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion={reduceAnimations ? 'always' : 'never'}>
        <BrowserRouter>
          <SettingsEffect />
          <Suspense fallback={<FullPageLoader message="Loading..." />}>
            <AnimatedRoutes />
          </Suspense>
          <ProfileSettingsPanel />
          <ToastContainer toasts={toasts} onClose={removeToast} />
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
