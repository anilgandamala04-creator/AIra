import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { toast } from '../stores/toastStore';
import { validateEmail, validateRequired } from '../utils/validation';
import { TRANSITION_DEFAULT, feedbackVariants } from '../utils/animations';
import { MAIN_CONTENT_ID } from '../constants/layout';

/**
 * AI Tutor Emoji Animation Specification (Login Screen)
 * 
 * Primary Idle Animation (Always On):
 * 1. Gentle Floating (Breathing Motion): Very small up/down movement (subtle, not noticeable at first glance)
 *    - Slow and continuous, smooth easing (no sharp turns)
 *    - Feels like calmly "breathing" or floating in the clouds
 * 2. Soft Glow Pulse: Circular glow/halo around emoji
 *    - Gently increases and decreases in opacity, never disappears completely
 *    - Warm white → soft pastel yellow
 *    - Pulse speed slower than floating motion
 *    - Creates warmth and sense of presence, not attention-grabbing
 * 
 * Secondary Micro-Animations (Occasional):
 * 3. Eye Blink: Natural & random
 *    - Randomized timing (every few seconds), never rhythmic or predictable
 *    - Very fast and natural duration
 *    - Makes emoji feel alive, not static
 * 4. Micro Smile Bounce: Optional, very rare
 *    - On app load only (once per session)
 *    - Tiny bounce or settle-in motion, no looping
 *    - Extremely subtle - friendly "hello" when screen appears
 * 
 * Sparkle Interaction (Background Sync):
 * - Light twinkle animation
 * - Slightly brighter when glow pulse peaks
 * - Sparkles do NOT move fast or flash
 * - Emoji feels connected to environment, not pasted on
 */
// 1. Gentle Floating (Breathing): small distance, slow & continuous, smooth easing
const FLOAT_DURATION = 6; // slow and continuous (3s up + 3s down)
const FLOAT_DISTANCE_PX = 6; // base px – subtle but visible on small screens
const FLOAT_DISTANCE_PX_LARGE = 10; // slightly more on large viewports (see component)
// 2. Soft Glow Pulse: slower than float; never disappears; warm white → soft pastel yellow
const GLOW_DURATION = 7.5; // slower than floating – creates warmth, not attention-grabbing
const GLOW_OPACITY: number[] = [0.4, 0.65, 0.4]; // never disappears completely (40–65%)
const GLOW_COLORS = 'radial-gradient(circle, #FFF7E6 0%, #FFE9A8 40%, transparent 70%)'; // warm white → soft pastel yellow
// 3. Eye Blink: randomized every few seconds, very fast and natural
const BLINK_DURATION = 120; // ms – very fast and natural
const BLINK_MIN_DELAY = 4000; // random 4–9s – never rhythmic or predictable
const BLINK_MAX_DELAY = 9000;
// 4. Micro Smile Bounce: on load only once, tiny settle-in, no looping
const MICRO_BOUNCE_DURATION = 0.3; // s – extremely subtle
const MICRO_BOUNCE_DISTANCE = 1.5; // px – tiny bounce, friendly "hello"

function LoginAvatar({ reduceAnimations }: { reduceAnimations: boolean }) {
    const [eyesClosed, setEyesClosed] = useState(false);
    const blinkTimeoutRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);
    const nextBlinkRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);
    const [microBounce, setMicroBounce] = useState<'idle' | 'settle' | 'done'>('idle');
    // Slightly larger float on big screens so animation remains visible
    const [floatDistance, setFloatDistance] = useState(FLOAT_DISTANCE_PX);
    useEffect(() => {
        if (reduceAnimations) return;
        const mq = window.matchMedia('(min-width: 768px)');
        setFloatDistance(mq.matches ? FLOAT_DISTANCE_PX_LARGE : FLOAT_DISTANCE_PX);
        const handler = () => setFloatDistance(mq.matches ? FLOAT_DISTANCE_PX_LARGE : FLOAT_DISTANCE_PX);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [reduceAnimations]);

    // Natural Eye Blink: Randomized timing (every few seconds), never rhythmic or predictable
    // Very fast and natural duration - makes emoji feel alive, not static
    useEffect(() => {
        if (reduceAnimations) return;
        const scheduleNext = () => {
            // Random delay between BLINK_MIN_DELAY and BLINK_MAX_DELAY (never predictable)
            const delay = BLINK_MIN_DELAY + Math.random() * (BLINK_MAX_DELAY - BLINK_MIN_DELAY);
            nextBlinkRef.current = setTimeout(() => {
                setEyesClosed(true);
                blinkTimeoutRef.current = setTimeout(() => {
                    setEyesClosed(false);
                    blinkTimeoutRef.current = null;
                    scheduleNext(); // Schedule next random blink
                }, BLINK_DURATION);
            }, delay);
        };
        scheduleNext();
        return () => {
            if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
            if (nextBlinkRef.current) clearTimeout(nextBlinkRef.current);
        };
    }, [reduceAnimations]);

    // Micro Smile Bounce: Optional, very rare - on app load only (once per session).
    // Use ref for timeout so React Strict Mode cleanup doesn't prevent 'done' from ever being set.
    const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (reduceAnimations) {
            setMicroBounce('done');
            return;
        }
        try {
            if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('avatarBounceDone') === '1') {
                setMicroBounce('done');
                return;
            }
            setMicroBounce('settle');
            bounceTimeoutRef.current = setTimeout(() => {
                bounceTimeoutRef.current = null;
                setMicroBounce('done');
                try {
                    sessionStorage.setItem('avatarBounceDone', '1');
                } catch {
                    /* ignore */
                }
            }, MICRO_BOUNCE_DURATION * 1000);
            return () => {
                if (bounceTimeoutRef.current) {
                    clearTimeout(bounceTimeoutRef.current);
                    bounceTimeoutRef.current = null;
                }
            };
        } catch {
            setMicroBounce('done');
        }
    }, [reduceAnimations]);

    // Gentle Floating: Slow and continuous, smooth easing (no sharp turns)
    // Feels like calmly "breathing" or floating in the clouds
    const floatTransition = { 
        duration: FLOAT_DURATION, 
        repeat: Infinity, 
        ease: [0.4, 0, 0.6, 1] as const // Smooth easing - no sharp turns
    };
    
    // Soft Glow Pulse: Pulse speed slower than floating motion
    // Creates warmth and sense of presence, not attention-grabbing
    const glowTransition = { 
        duration: GLOW_DURATION, 
        repeat: Infinity, 
        ease: [0.45, 0, 0.55, 1] as const // Smooth, gentle pulse
    };

    return (
        <motion.div
            className="relative mb-4 sm:mb-6"
            animate={
                reduceAnimations
                    ? undefined
                    : microBounce === 'settle'
                      ? { y: [0, MICRO_BOUNCE_DISTANCE, 0] } // Extremely subtle - tiny bounce
                      : undefined
            }
            transition={
                reduceAnimations
                    ? { duration: 0 }
                    : microBounce === 'settle'
                      ? { duration: MICRO_BOUNCE_DURATION, ease: [0.25, 0.1, 0.25, 1] } // Smooth settle-in
                      : { duration: 0 }
            }
        >
            {/* Soft Glow Pulse: Circular glow/halo around emoji
                - Gently increases and decreases in opacity, never disappears completely
                - Warm white → soft pastel yellow
                - Pulse speed slower than floating motion
                - Creates warmth and sense of presence, not attention-grabbing */}
            {!reduceAnimations && (
                <motion.div
                    className="absolute inset-0 rounded-full scale-110 blur-2xl pointer-events-none"
                    style={{ background: GLOW_COLORS }}
                    animate={{ opacity: GLOW_OPACITY }}
                    transition={glowTransition}
                    aria-hidden
                />
            )}

            {/* Main avatar – Large, prominent emoji with gentle floating
                - Large size to dominate attention (emotional focal point)
                - Bright yellow tone with expressive features
                - Soft glow/halo surrounds the emoji */}
            <motion.div
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl will-change-transform"
                animate={reduceAnimations ? undefined : { y: [0, -floatDistance, 0] }}
                transition={reduceAnimations ? undefined : floatTransition}
            >
                <div className="relative">
                    {/* Big expressive eyes – Natural Eye Blink
                        - Randomized timing (every few seconds), never rhythmic or predictable
                        - Very fast and natural duration
                        - Makes emoji feel alive, not static */}
                    <div className="flex gap-6 sm:gap-8 mb-3 sm:mb-4">
                        <motion.div
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-900 rounded-full origin-center"
                            animate={reduceAnimations ? undefined : { scaleY: eyesClosed ? 0.08 : 1 }}
                            transition={{ duration: eyesClosed ? BLINK_DURATION / 1000 : 0.08 }}
                        />
                        <motion.div
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-900 rounded-full origin-center"
                            animate={reduceAnimations ? undefined : { scaleY: eyesClosed ? 0.08 : 1 }}
                            transition={{ duration: eyesClosed ? BLINK_DURATION / 1000 : 0.08 }}
                        />
                    </div>
                    {/* Eyebrows */}
                    <div className="absolute -top-4 sm:-top-5 left-0 right-0 flex justify-between px-2 sm:px-3">
                        <div className="w-6 sm:w-8 h-1.5 bg-amber-600 rounded-full transform -rotate-6" />
                        <div className="w-6 sm:w-8 h-1.5 bg-amber-600 rounded-full transform rotate-6" />
                    </div>
                    {/* Blush on cheeks - more visible */}
                    <div className="absolute top-3 sm:top-4 -left-3 sm:-left-4 w-4 h-3 sm:w-5 sm:h-4 bg-pink-300/70 rounded-full" />
                    <div className="absolute top-3 sm:top-4 -right-3 sm:-right-4 w-4 h-3 sm:w-5 sm:h-4 bg-pink-300/70 rounded-full" />
                    {/* Wide, friendly smile */}
                    <div className="w-14 sm:w-16 h-7 sm:h-8 border-b-4 sm:border-b-[5px] border-gray-900 rounded-b-full mx-auto" />
                </div>
            </motion.div>

            {/* Sparkle Interaction (Background Sync): light twinkle; slightly brighter when glow peaks; no fast flash */}
            {!reduceAnimations && (
                <>
                    <motion.span
                        className="absolute -top-2 -right-2 text-2xl text-white/90"
                        animate={{ opacity: [0.45, 0.58, 0.45] }}
                        transition={{ duration: GLOW_DURATION, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                        aria-hidden
                    >
                        ✦
                    </motion.span>
                    <motion.span
                        className="absolute top-0 -left-4 text-xl text-white/90"
                        animate={{ opacity: [0.45, 0.58, 0.45] }}
                        transition={{ duration: GLOW_DURATION, delay: 2.3, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                        aria-hidden
                    >
                        ✦
                    </motion.span>
                    <motion.span
                        className="absolute -bottom-1 right-0 text-lg text-white/85"
                        animate={{ opacity: [0.40, 0.54, 0.40] }}
                        transition={{ duration: GLOW_DURATION, delay: 4.1, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                        aria-hidden
                    >
                        ✦
                    </motion.span>
                </>
            )}
        </motion.div>
    );
}

// Calm floating cloud (slow, subtle)
function Cloud({ className, delay = 0, reduceAnimations }: { className?: string; delay?: number; reduceAnimations?: boolean }) {
    if (reduceAnimations) {
        return <div className={`absolute rounded-full bg-white/40 blur-sm ${className ?? ''}`} aria-hidden />;
    }
    return (
        <motion.div
            className={`absolute rounded-full bg-white/40 blur-sm ${className}`}
            animate={{ x: [0, 12, 0], y: [0, -4, 0] }}
            transition={{ duration: 10, delay, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
            aria-hidden
        />
    );
}

// Light twinkle; slightly brighter when glow peaks; do NOT move fast or flash; emoji connected to environment – no fast flash; subtle “connected to environment”
function Sparkle({ className, delay = 0, reduceAnimations }: { className?: string; delay?: number; reduceAnimations?: boolean }) {
    if (reduceAnimations) {
        return <div className={`absolute text-white/80 text-xl ${className ?? ''}`} aria-hidden>✦</div>;
    }
    return (
        <motion.div
            className={`absolute text-white/80 text-xl ${className}`}
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: GLOW_DURATION, delay, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
            aria-hidden
        >
            ✦
        </motion.div>
    );
}

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const reduceAnimations = Boolean(useSettingsStore(useShallow((state) => state.settings?.accessibility?.reduceAnimations)));
    const {
        loginWithGoogle,
        loginWithApple,
        loginWithEmail,
        signUpWithEmail,
        isLoading,
        isAuthenticated,
    } = useAuthStore();

    // Preload OnboardingPage module when login page mounts
    // Dashboard is embedded in Profile panel, not a separate page
    useEffect(() => {
        const preloadModules = async () => {
            try {
                await import('../pages/OnboardingPage');
            } catch (error) {
                console.warn('Failed to preload pages:', error);
                // Non-blocking - navigation will still work with lazy loading
            }
        };
        preloadModules();
    }, []);

    // Helper function to determine if user is new and should go to onboarding
    const shouldRedirectToOnboarding = (user: ReturnType<typeof useAuthStore.getState>['user']): boolean => {
        if (!user) return false;
        
        // Check if user was created recently (within last 30 seconds for better reliability)
        if (user.createdAt) {
            const createdTime = new Date(user.createdAt).getTime();
            const now = new Date().getTime();
            const timeSinceCreation = now - createdTime;
            // Consider user new if created within last 30 seconds
            if (timeSinceCreation < 30000) {
                return true;
            }
        }
        
        // Also check if user has no profile data (indicates new user)
        // This will be checked by ProtectedRoute, but we can also check here
        return false;
    };

    // Redirect already-authenticated users (e.g. OAuth redirect, or visiting /login while logged in)
    // ENFORCES STRICT LINEAR FLOW: Must complete onboarding before accessing any page
    // Only redirect if not currently processing a login (to avoid race conditions)
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Small delay to ensure all state updates are complete
            const timer = setTimeout(async () => {
                const user = useAuthStore.getState().user;
                const profile = useUserStore.getState().profile;
                const onboardingStep = useUserStore.getState().onboardingStep;
                
                if (user) {
                    // STRICT ONBOARDING ENFORCEMENT: Check if onboarding is needed
                    // All required steps must be completed: profession, subProfession, subject, currentTopic
                    const needsOnboarding = 
                        onboardingStep >= 0 || 
                        !profile?.profession || 
                        !profile?.subProfession || 
                        !profile?.subject || 
                        !profile?.currentTopic;

                    if (needsOnboarding) {
                        // User must complete onboarding - redirect to onboarding
                        navigate('/onboarding', { replace: true });
                    } else {
                        // Onboarding complete - redirect to Main OS Screen for selected topic
                        // This enforces the exact flow: Login → Onboarding → Main OS Screen
                        const topicId = profile?.currentTopic;
                        if (topicId) {
                            navigate(`/learn/${topicId}`, { replace: true });
                        } else {
                            // Fallback: if no topic (shouldn't happen), redirect to onboarding
                            navigate('/onboarding', { replace: true });
                        }
                    }
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isLoading, isAuthenticated, navigate]);

    // Listen for OAuth redirect success events
    // ENFORCES STRICT LINEAR FLOW: Must complete onboarding before accessing any page
    useEffect(() => {
        const handleRedirectSuccess = async (event: CustomEvent) => {
            const user = event.detail?.user;
            if (user) {
                const profile = useUserStore.getState().profile;
                const onboardingStep = useUserStore.getState().onboardingStep;
                
                // STRICT ONBOARDING ENFORCEMENT: Check if onboarding is needed
                // All required steps must be completed: profession, subProfession, subject, currentTopic
                const needsOnboarding = 
                    onboardingStep >= 0 || 
                    !profile?.profession || 
                    !profile?.subProfession || 
                    !profile?.subject || 
                    !profile?.currentTopic;

                if (needsOnboarding) {
                    // User must complete onboarding - redirect to onboarding
                    navigate('/onboarding', { replace: true });
                } else {
                    // Onboarding complete - redirect to Main OS Screen for selected topic
                    // This enforces the exact flow: Login → Onboarding → Main OS Screen
                    const topicId = profile?.currentTopic;
                    if (topicId) {
                        navigate(`/learn/${topicId}`, { replace: true });
                    } else {
                        // Fallback: if no topic (shouldn't happen), redirect to onboarding
                        navigate('/onboarding', { replace: true });
                    }
                }
            }
        };

        // Listen for login success events (popup flows)
        const handleLoginSuccess = async (event: CustomEvent) => {
            const user = event.detail?.user;
            if (user) {
                const isNewUser = shouldRedirectToOnboarding(user);
                if (isNewUser) {
                    navigate('/onboarding', { replace: true });
                } else {
                    // For existing users, go to active session or curriculum, not dashboard
                    const { getDefaultRedirectPath } = await import('../utils/navigation');
                    const redirectPath = getDefaultRedirectPath();
                    navigate(redirectPath, { replace: true });
                }
            }
        };

        // Listen for signup success events (new users always go to onboarding)
        const handleSignupSuccess = async (event: CustomEvent) => {
            const { isNewUser } = event.detail || {};
            if (isNewUser) {
                navigate('/onboarding', { replace: true });
            } else {
                // For existing users, go to active session or curriculum, not dashboard
                const { getDefaultRedirectPath } = await import('../utils/navigation');
                const redirectPath = getDefaultRedirectPath();
                navigate(redirectPath, { replace: true });
            }
        };

        const redirectHandler = (event: Event) => {
            handleRedirectSuccess(event as CustomEvent);
        };
        const loginHandler = (event: Event) => {
            handleLoginSuccess(event as CustomEvent);
        };
        const signupHandler = (event: Event) => {
            handleSignupSuccess(event as CustomEvent);
        };

        window.addEventListener('auth:redirect-success', redirectHandler);
        window.addEventListener('auth:login-success', loginHandler);
        window.addEventListener('auth:signup-success', signupHandler);
        
        return () => {
            window.removeEventListener('auth:redirect-success', redirectHandler);
            window.removeEventListener('auth:login-success', loginHandler);
            window.removeEventListener('auth:signup-success', signupHandler);
        };
    }, [navigate]);

    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        try {
            setError(null);
            setAuthErrorCode(null);
            await loginWithGoogle();
            // Navigation is now handled by event listeners in useEffect
            // This ensures consistent navigation behavior across all auth methods
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google. Please try again.';
            const code = (err as { code?: string })?.code ?? null;
            setError(errorMessage);
            setAuthErrorCode(code);
            console.error('Google login error:', err);
            // Don't navigate on error - user should stay on login page to retry
        }
    };

    const handleAppleLogin = async () => {
        try {
            setError(null);
            setAuthErrorCode(null);
            await loginWithApple();
            // Navigation is now handled by event listeners in useEffect
            // This ensures consistent navigation behavior across all auth methods
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Apple. Please try again.';
            const code = (err as { code?: string })?.code ?? null;
            setError(errorMessage);
            setAuthErrorCode(code);
            console.error('Apple login error:', err);
            // Don't navigate on error - user should stay on login page to retry
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setAuthErrorCode(null);

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setError(emailValidation.error || 'Invalid email');
            toast.error(emailValidation.error || 'Invalid email');
            return;
        }

        const passwordValidation = validateRequired(password, 'Password');
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || 'Password is required');
            toast.error(passwordValidation.error || 'Password is required');
            return;
        }

        if (isSignUp) {
            const nameValidation = validateRequired(name.trim(), 'Name');
            if (!nameValidation.isValid) {
                setError(nameValidation.error || 'Please enter your name');
                toast.error(nameValidation.error || 'Please enter your name');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters.');
                toast.error('Password must be at least 6 characters.');
                return;
            }
        }

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password, name.trim());
                // Navigation is handled by event listeners - new signups will go to onboarding
            } else {
                await loginWithEmail(email, password);
                // Navigation is handled by event listeners
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : (isSignUp ? 'Failed to create account.' : 'Failed to sign in. Please check your credentials.');
            const code = (err as { code?: string })?.code ?? null;
            setError(errorMessage);
            setAuthErrorCode(code);
            console.error(isSignUp ? 'Sign up error:' : 'Email login error:', err);
            // Don't navigate on error - user should stay on login page to retry
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] relative overflow-x-hidden overflow-y-auto flex flex-col items-center justify-center px-3 sm:px-4 py-6 safe-top safe-bottom">
            {/* Pastel gradient background: lavender → pink → light blue */}
            <div className="fixed inset-0 bg-gradient-to-b from-purple-100 via-pink-100 to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />

            {/* Floating clouds - positioned at bottom and sides */}
            <Cloud className="w-64 h-20 -left-10 bottom-20" delay={0} reduceAnimations={reduceAnimations} />
            <Cloud className="w-48 h-16 right-0 bottom-32" delay={1} reduceAnimations={reduceAnimations} />
            <Cloud className="w-80 h-24 -left-20 bottom-10" delay={2} reduceAnimations={reduceAnimations} />
            <Cloud className="w-56 h-18 right-10 bottom-16" delay={0.5} reduceAnimations={reduceAnimations} />
            <Cloud className="w-40 h-14 left-1/4 bottom-24" delay={1.5} reduceAnimations={reduceAnimations} />
            <Cloud className="w-52 h-16 right-1/4 bottom-12" delay={3} reduceAnimations={reduceAnimations} />
            <Cloud className="w-44 h-14 -left-8 bottom-40" delay={2.5} reduceAnimations={reduceAnimations} />
            <Cloud className="w-60 h-18 right-1/3 bottom-8" delay={1.2} reduceAnimations={reduceAnimations} />

            {/* Sparkles */}
            <Sparkle className="top-24 right-1/4" delay={0} reduceAnimations={reduceAnimations} />
            <Sparkle className="top-32 left-1/3" delay={0.5} reduceAnimations={reduceAnimations} />
            <Sparkle className="bottom-40 right-1/3" delay={1} reduceAnimations={reduceAnimations} />
            <Sparkle className="top-1/3 right-20" delay={1.5} reduceAnimations={reduceAnimations} />
            <Sparkle className="bottom-1/3 left-20" delay={2} reduceAnimations={reduceAnimations} />

            {/* Content - Responsive */}
            <motion.main
                id={MAIN_CONTENT_ID}
                tabIndex={-1}
                className="relative z-10 flex flex-col items-center max-w-md w-full px-4 sm:px-6"
                initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceAnimations ? { duration: 0 } : { duration: TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
            >
                {/* Header Section - Large, bold title with subtitle */}
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-slate-100 mb-2 sm:mb-3 text-center"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}
                    initial={reduceAnimations ? undefined : { opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceAnimations ? { duration: 0 } : { delay: 0.2, duration: TRANSITION_DEFAULT.duration }}
                >
                    AI Tutor
                </motion.h1>

                <motion.p
                    className="text-gray-600 dark:text-slate-400 text-base sm:text-lg mb-8 sm:mb-10 text-center font-normal"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    initial={reduceAnimations ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduceAnimations ? { duration: 0 } : { delay: 0.3, duration: TRANSITION_DEFAULT.duration }}
                >
                    Your Intelligent Learning Companion
                </motion.p>

                {/* AI Avatar – calm “breathing” study buddy (no toy-like motion) */}
                <LoginAvatar reduceAnimations={reduceAnimations} />

                {/* Prompt text - "Ask me anything..." - Subtle, friendly, slightly italic */}
                <motion.p
                    className="text-gray-600 dark:text-slate-400 italic mb-8 sm:mb-10 text-lg sm:text-xl text-center font-light"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    initial={reduceAnimations ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduceAnimations ? { duration: 0 } : { delay: 0.6, duration: TRANSITION_DEFAULT.duration }}
                >
                    Ask me anything…
                </motion.p>

                {/* Error message - Responsive (shake feedback) */}
                {error && (
                    <motion.div
                        initial={reduceAnimations ? false : feedbackVariants.error.initial}
                        animate={reduceAnimations ? { opacity: 1 } : feedbackVariants.error.animate}
                        transition={reduceAnimations ? { duration: 0 } : feedbackVariants.error.transition}
                        className="w-full mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-300 text-xs sm:text-sm text-center"
                    >
                        {error}
                        {(authErrorCode === 'validation_failed' || authErrorCode === 'rate_limit_exceeded') && (
                            <p className="mt-2 text-[11px] opacity-90">
                                {authErrorCode === 'validation_failed'
                                    ? 'Administrators: enable Google in Firebase Console → Authentication → Sign-in method. See docs/AUTH_SETUP.md.'
                                    : 'Administrators: auth rate limits can be adjusted in Firebase (see docs/AUTH_SETUP.md).'}
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Authentication Actions - Three stacked, full-width buttons, evenly spaced */}
                <motion.div
                    className="w-full space-y-3 sm:space-y-4"
                    initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceAnimations ? { duration: 0 } : { delay: 0.7, duration: TRANSITION_DEFAULT.duration }}
                >
                    {!showEmailForm ? (
                        <>
                            {/* Continue with Google - White background, Google G logo, blue text */}
                            <motion.button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] active:scale-[0.98] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
                                whileHover={reduceAnimations ? undefined : { scale: 1.01 }}
                                whileTap={reduceAnimations ? undefined : { scale: 0.98 }}
                            >
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-blue-600 font-medium text-base">Continue with Google</span>
                            </motion.button>

                            {/* Continue with Apple - Dark (near-black) background, white Apple logo, white text */}
                            <motion.button
                                type="button"
                                onClick={handleAppleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] active:scale-[0.98] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                                whileHover={reduceAnimations ? undefined : { scale: 1.01 }}
                                whileTap={reduceAnimations ? undefined : { scale: 0.98 }}
                            >
                                <svg className="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <span className="text-white font-medium text-base">Continue with Apple</span>
                            </motion.button>

                            {/* Sign in with Email - White background, blue envelope icon, blue text */}
                            <motion.button
                                type="button"
                                onClick={() => setShowEmailForm(true)}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] active:scale-[0.98] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
                                whileHover={reduceAnimations ? undefined : { scale: 1.01 }}
                                whileTap={reduceAnimations ? undefined : { scale: 0.98 }}
                            >
                                <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-blue-600 font-medium text-base">Sign in with Email</span>
                            </motion.button>
                        </>
                    ) : (
                        /* Email Form (Sign In / Sign Up) */
                        <motion.form
                            onSubmit={handleEmailSubmit}
                            className="space-y-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            {isSignUp && (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('name')}
                                    className="w-full px-5 py-3.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
                                    autoComplete="name"
                                />
                            )}
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('email')}
                                className="w-full px-5 py-3.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
                                required
                                autoComplete="email"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('password')}
                                className="w-full px-5 py-3.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
                                required
                                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-ui disabled:opacity-50 active:scale-[0.98]"
                            >
                                {isLoading ? t('loading') : isSignUp ? t('createAccount') : t('signIn')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                                className="w-full py-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-ui active:scale-[0.98] text-sm"
                            >
                                {isSignUp ? t('alreadyHaveAccount') : t('noAccount')} {isSignUp ? t('signIn') : t('signUp')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowEmailForm(false); setError(null); setIsSignUp(false); }}
                                className="w-full py-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-ui active:scale-[0.98]"
                            >
                                {t('back')}
                            </button>
                        </motion.form>
                    )}
                </motion.div>
            </motion.main>
        </div>
    );
}
