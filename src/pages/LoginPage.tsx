import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { GraduationCap, ClipboardCheck, Shield, Mail } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../types';
import AuthModal from '../components/common/AuthModal';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { TRANSITION_DEFAULT } from '../utils/animations';
import { needsOnboarding } from '../utils/onboarding';
import { MAIN_CONTENT_ID } from '../constants/layout';

/**
 * Login Page — Three Login Patterns (Strict Separation)
 *
 * Role      | Primary Goal           | UI Pattern
 * ----------|------------------------|--------------------------------------
 * Student   | Learn / Practice       | Content-first, immersive
 * Teacher   | Diagnose & Improve     | Analytics-first
 * Admin     | Monitor & Govern       | Oversight dashboards
 */

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
    const navigate = useNavigate();
    const reduceAnimations = Boolean(useSettingsStore(useShallow((state) => state.settings?.accessibility?.reduceAnimations)));
    const { setPendingLoginRole, continueAsGuest, isAuthenticated, isLoading } = useAuthStore();
    const [authModalRole, setAuthModalRole] = useState<UserRole | null>(null);



    // Redirect already-authenticated users by role: Teacher → /teacher, Admin → /admin, Student → onboarding or Main OS
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            const timer = setTimeout(() => {
                const user = useAuthStore.getState().user;
                const state = useUserStore.getState();
                const role = user?.role ?? 'student';

                if (role === 'teacher') {
                    navigate('/teacher', { replace: true });
                    return;
                }
                if (role === 'admin') {
                    navigate('/admin', { replace: true });
                    return;
                }

                // Student flow: Main OS Home first; no teaching before mode selection (same check as App)
                const needs = needsOnboarding({
                    onboardingStep: state.onboardingStep,
                    curriculumType: state.curriculumType,
                    selectedBoard: state.selectedBoard,
                    selectedGrade: state.selectedGrade,
                    selectedExam: state.selectedExam,
                    selectedSubject: state.selectedSubject,
                    profile: state.profile,
                });

                if (needs) {
                    navigate('/', { replace: true });
                } else {
                    const topicId = state.profile?.currentTopic;
                    if (topicId) {
                        navigate(`/learn/${topicId}`, { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isLoading, isAuthenticated, navigate]);

    /** Role-based guest login: enter as guest with selected role. */
    const handleRoleLogin = (role: UserRole) => {
        setPendingLoginRole(role);
        continueAsGuest(role);
        if (role === 'student') {
            navigate('/', { replace: true });
        } else if (role === 'teacher') {
            navigate('/teacher', { replace: true });
        } else {
            navigate('/admin', { replace: true });
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] h-screen h-[100dvh] relative overflow-hidden flex flex-col items-center justify-center px-4 sm:px-5 py-8 safe-top safe-bottom">
            {/* Theme: Lavender → Pink → Sky Blue (soft pastel, dreamy, kid-friendly) */}
            <div className="fixed inset-0 bg-gradient-theme dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" aria-hidden />

            {/* Decorative clouds — bottom corners, soft fade (non-interactive) */}
            <Cloud className="w-64 h-20 -left-10 bottom-20 opacity-80" delay={0} reduceAnimations={reduceAnimations} />
            <Cloud className="w-48 h-16 right-0 bottom-32 opacity-70" delay={1} reduceAnimations={reduceAnimations} />
            <Cloud className="w-80 h-24 -left-20 bottom-10 opacity-80" delay={2} reduceAnimations={reduceAnimations} />
            <Cloud className="w-56 h-18 right-10 bottom-16 opacity-70" delay={0.5} reduceAnimations={reduceAnimations} />
            <Cloud className="w-40 h-14 left-1/4 bottom-24 opacity-60" delay={1.5} reduceAnimations={reduceAnimations} />
            <Cloud className="w-52 h-16 right-1/4 bottom-12 opacity-60" delay={3} reduceAnimations={reduceAnimations} />
            <Cloud className="w-44 h-14 -left-8 bottom-40 opacity-50" delay={2.5} reduceAnimations={reduceAnimations} />
            <Cloud className="w-60 h-18 right-1/3 bottom-8 opacity-60" delay={1.2} reduceAnimations={reduceAnimations} />

            {/* Sparkles */}
            <Sparkle className="top-24 right-1/4" delay={0} reduceAnimations={reduceAnimations} />
            <Sparkle className="top-32 left-1/3" delay={0.5} reduceAnimations={reduceAnimations} />
            <Sparkle className="bottom-40 right-1/3" delay={1} reduceAnimations={reduceAnimations} />
            <Sparkle className="top-1/3 right-20" delay={1.5} reduceAnimations={reduceAnimations} />
            <Sparkle className="bottom-1/3 left-20" delay={2} reduceAnimations={reduceAnimations} />

            {/* Single-screen role gateway: vertically stacked, center-aligned, no side panels (auth deferred to next step) */}
            <motion.main
                id={MAIN_CONTENT_ID}
                tabIndex={-1}
                className="relative z-10 flex flex-col items-center justify-center max-w-md w-full text-center"
                initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceAnimations ? { duration: 0 } : { duration: TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
            >
                {/* Header: two-line block, strict center; title larger/bolder, subtitle thinner */}
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 dark:text-slate-100 mb-2 sm:mb-3"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}
                    initial={reduceAnimations ? undefined : { opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceAnimations ? { duration: 0 } : { delay: 0.2, duration: TRANSITION_DEFAULT.duration }}
                >
                    AI Tutor
                </motion.h1>
                <motion.p
                    className="text-gray-600 dark:text-slate-400 text-base sm:text-lg mb-8 sm:mb-10 font-normal"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    initial={reduceAnimations ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduceAnimations ? { duration: 0 } : { delay: 0.3, duration: TRANSITION_DEFAULT.duration }}
                >
                    Your Intelligent Learning Companion
                </motion.p>

                {/* Mascot: central visual anchor, large, between title and actions; glow from LoginAvatar */}
                <LoginAvatar reduceAnimations={reduceAnimations} />

                {/* Tagline: supporting only, smaller than subtitle, light gray, conversational */}
                <motion.p
                    className="text-gray-500 dark:text-slate-500 text-sm sm:text-base italic mb-10 sm:mb-12 font-light"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    initial={reduceAnimations ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduceAnimations ? { duration: 0 } : { delay: 0.5, duration: TRANSITION_DEFAULT.duration }}
                >
                    Ask me anything…
                </motion.p>

                {/* Primary action: role-based login only — no Google/Apple/Email */}
                <motion.div
                    className="w-full"
                    initial={reduceAnimations ? undefined : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceAnimations ? { duration: 0 } : { delay: 0.6, duration: TRANSITION_DEFAULT.duration }}
                >
                    <div className="space-y-4">
                        <motion.button
                            type="button"
                            onClick={() => handleRoleLogin('student')}
                            className="w-full flex items-center justify-center gap-4 min-h-[52px] py-4 px-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-600 shadow-sm hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                            whileHover={reduceAnimations ? undefined : { y: -1 }}
                            whileTap={reduceAnimations ? undefined : { scale: 0.99 }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-slate-100 text-base">Student Login</span>
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => handleRoleLogin('teacher')}
                            className="w-full flex items-center justify-center gap-4 min-h-[52px] py-4 px-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-600 shadow-sm hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                            whileHover={reduceAnimations ? undefined : { y: -1 }}
                            whileTap={reduceAnimations ? undefined : { scale: 0.99 }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0 ring-2 ring-amber-800/30 dark:ring-amber-700/40">
                                <ClipboardCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-slate-100 text-base">Teacher Login</span>
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => handleRoleLogin('admin')}
                            className="w-full flex items-center justify-center gap-4 min-h-[52px] py-4 px-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-600 shadow-sm hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                            whileHover={reduceAnimations ? undefined : { y: -1 }}
                            whileTap={reduceAnimations ? undefined : { scale: 0.99 }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-slate-100 text-base">Admin/Principal Login</span>
                        </motion.button>
                        <p className="text-center text-sm text-gray-500 dark:text-slate-400 pt-1">
                            Or{' '}
                            <button
                                type="button"
                                onClick={() => setAuthModalRole('student')}
                                className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium hover:underline"
                            >
                                <Mail className="w-4 h-4" />
                                Sign in with Email
                            </button>
                        </p>
                    </div>
                </motion.div>

                {authModalRole !== null && (
                    <AuthModal
                        defaultRole={authModalRole}
                        onClose={() => setAuthModalRole(null)}
                    />
                )}

                {/* Footer: Terms & Privacy for compliance */}
                <footer className="mt-auto pt-8 pb-4 safe-bottom text-center text-sm text-gray-500 dark:text-slate-500">
                    <a href="/terms" className="hover:text-purple-600 dark:hover:text-purple-400 underline">Terms of Service</a>
                    <span className="mx-2">·</span>
                    <a href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400 underline">Privacy Policy</a>
                </footer>
            </motion.main>
        </div>
    );
}
