import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { useTeachingStore } from './stores/teachingStore';
import { changeLanguage } from './i18n';
import ErrorBoundary from './components/common/ErrorBoundary';
import FullPageLoader from './components/common/FullPageLoader';
import ToastContainer from './components/common/Toast';
import { useToastStore } from './stores/toastStore';

// Lazy load pages for better performance (code-splitting)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const TeachingPage = lazy(() => import('./pages/TeachingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CurriculumPage = lazy(() => import('./pages/CurriculumPage'));

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Settings effect hook to apply settings globally
function SettingsEffect() {
  const settings = useSettingsStore((state) => state.settings);
  const setTeachingSpeaking = useTeachingStore((state) => state.setSpeaking);

  useEffect(() => {
    const html = document.documentElement;

    // Apply theme
    if (settings.theme === 'dark') {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else if (settings.theme === 'light') {
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

      // Listen for system theme changes
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

  useEffect(() => {
    // Apply font size
    const html = document.documentElement;
    html.setAttribute('data-font-size', settings.accessibility.fontSize);
  }, [settings.accessibility.fontSize]);

  useEffect(() => {
    // Apply high contrast
    const html = document.documentElement;
    html.setAttribute('data-high-contrast', settings.accessibility.highContrast ? 'true' : 'false');
  }, [settings.accessibility.highContrast]);

  useEffect(() => {
    // Apply reduce animations
    const html = document.documentElement;
    html.setAttribute('data-reduce-animations', settings.accessibility.reduceAnimations ? 'true' : 'false');
  }, [settings.accessibility.reduceAnimations]);

  useEffect(() => {
    // Apply language
    document.documentElement.lang = settings.language;
    changeLanguage(settings.language);
  }, [settings.language]);

  useEffect(() => {
    // Instantly apply TTS enable/disable across the app
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (!settings.accessibility.textToSpeech) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      // Ensure app state reflects that speech is off
      setTeachingSpeaking(false);
    }
  }, [settings.accessibility.textToSpeech, setTeachingSpeaking]);

  return null;
}



// Animated Routes Component
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Main OS Screen (Teaching Page) */}
        <Route
          path="/learn/:topicId?"
          element={
            <ProtectedRoute>
              <TeachingPage />
            </ProtectedRoute>
          }
        />

        {/* Analytics (Redirect to Profile) */}
        {/* Analytics / Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Curriculum Browser */}
        <Route
          path="/curriculum"
          element={
            <ProtectedRoute>
              <CurriculumPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { toasts, removeToast } = useToastStore();
  const reduceAnimations = useSettingsStore((state) => state.settings.accessibility.reduceAnimations);

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion={reduceAnimations ? 'always' : 'never'}>
        <BrowserRouter>
          <SettingsEffect />
          <Suspense fallback={<FullPageLoader message="Loading..." />}>
            <AnimatedRoutes />
          </Suspense>
          <ToastContainer toasts={toasts} onClose={removeToast} />
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
