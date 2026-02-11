import { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../../stores/settingsStore';

// Avatar animation spec: float 3s+3s ease-in-out, glow 40–65% over 6–8s, blink 4–9s 120ms, ambient/calm.
const AVATAR_FLOAT_DURATION = 6;  // 3s up + 3s down
const AVATAR_GLOW_DURATION = 7;    // 6–8s, slower than float
const AVATAR_GLOW_OPACITY: [number, number, number] = [0.4, 0.65, 0.4]; // never zero
const AVATAR_GLOW_COLORS = 'radial-gradient(circle, #FFF7E6 0%, #FFE9A8 40%, transparent 70%)';

interface AIAvatarProps {
    isSpeaking: boolean;
    className?: string;
}

/**
 * AI Avatar Component
 * Features: gentle floating (breathing), soft glow pulse, natural blink, one-time micro bounce per session, sparkles synced to glow.
 */
export const AIAvatar = memo(function AIAvatar({ isSpeaking, className }: AIAvatarProps) {
    const reduceAnimations = useSettingsStore(useShallow((s) => s.settings.accessibility.reduceAnimations));
    const [eyesClosed, setEyesClosed] = useState(false);
    const [microBounce, setMicroBounce] = useState<'idle' | 'settle' | 'done'>('idle');
    const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nextBlinkRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Micro bounce: once per app session only (no re-trigger on navigation/refresh)
    useEffect(() => {
        if (reduceAnimations) return;
        try {
            if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('avatarBounceDone') === '1') {
                setMicroBounce('done');
                return;
            }
            setMicroBounce('settle');
            const t = setTimeout(() => {
                setMicroBounce('done');
                try { sessionStorage.setItem('avatarBounceDone', '1'); } catch { /* ignore */ }
            }, 320);
            return () => clearTimeout(t);
        } catch {
            setMicroBounce('done');
        }
    }, [reduceAnimations]);

    // Natural blink: random 4–9s, duration ~120ms
    useEffect(() => {
        if (reduceAnimations) return;
        const scheduleNext = () => {
            const delay = 4000 + Math.random() * 5000;
            nextBlinkRef.current = setTimeout(() => {
                setEyesClosed(true);
                blinkTimeoutRef.current = setTimeout(() => {
                    setEyesClosed(false);
                    blinkTimeoutRef.current = null;
                    scheduleNext();
                }, 120);
            }, delay);
        };
        scheduleNext();
        return () => {
            if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
            if (nextBlinkRef.current) clearTimeout(nextBlinkRef.current);
        };
    }, [reduceAnimations]);

    const glowTransition = { duration: AVATAR_GLOW_DURATION, repeat: Infinity, ease: [0.45, 0, 0.55, 1] as const };

    return (
        <motion.div
            className={className ?? 'relative w-12 h-12 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem] lg:w-20 lg:h-20 shrink-0'}
            animate={{
                y: microBounce === 'idle' ? 0 : microBounce === 'settle' ? [0, 2, 0] : isSpeaking ? [0, -5, 0] : [0, -4, 0],
                scale: isSpeaking ? [1, 1.05, 1] : 1
            }}
            transition={
                microBounce === 'settle'
                    ? { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                    : microBounce === 'idle'
                        ? { duration: 0 }
                        : {
                            duration: isSpeaking ? 0.5 : AVATAR_FLOAT_DURATION,
                            repeat: isSpeaking ? Infinity : Infinity,
                            ease: isSpeaking ? 'easeInOut' : 'easeInOut'
                        }
            }
        >
            {/* Soft glow pulse: 40–65% over 6–8s, #FFF7E6 → #FFE9A8, never zero; slower than float */}
            <motion.div
                className="absolute inset-0 rounded-full scale-110 blur-xl pointer-events-none"
                style={{ background: AVATAR_GLOW_COLORS }}
                animate={
                    isSpeaking
                        ? { opacity: [0.4, 0.65, 0.4], scale: [1, 1.12, 1] }
                        : reduceAnimations
                            ? { opacity: 0.5 }
                            : { opacity: AVATAR_GLOW_OPACITY }
                }
                transition={
                    isSpeaking
                        ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                        : reduceAnimations
                            ? { duration: 0 }
                            : glowTransition
                }
                aria-hidden
            />
            <div className="relative w-full h-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl ring-2 ring-amber-500/40 ring-offset-2 ring-offset-[#F5F6F7] dark:ring-offset-slate-800">
                <div className="relative">
                    {/* Eyes: random blink when idle; speaking squint when speaking */}
                    <div className="flex gap-2 mb-1">
                        <motion.div
                            className="w-2.5 h-2.5 bg-gray-900 rounded-full origin-center"
                            animate={
                                isSpeaking
                                    ? { scaleY: [1, 0.3, 1, 0.5, 1], scaleX: [1, 1.1, 1] }
                                    : { scaleY: eyesClosed ? 0.08 : 1, scaleX: 1 }
                            }
                            transition={
                                isSpeaking
                                    ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
                                    : { duration: eyesClosed ? 0.12 : 0.08 }
                            }
                        />
                        <motion.div
                            className="w-2.5 h-2.5 bg-gray-900 rounded-full origin-center"
                            animate={
                                isSpeaking
                                    ? { scaleY: [1, 0.3, 1, 0.5, 1], scaleX: [1, 1.1, 1] }
                                    : { scaleY: eyesClosed ? 0.08 : 1, scaleX: 1 }
                            }
                            transition={
                                isSpeaking
                                    ? { duration: 0.4, repeat: Infinity, delay: 0.1, ease: 'easeInOut' }
                                    : { duration: eyesClosed ? 0.04 : 0.06 }
                            }
                        />
                    </div>
                    {/* Mouth: speaking motion when active; static smile when idle */}
                    <motion.div
                        className="w-6 h-3 border-b-2 border-gray-900 rounded-b-full mx-auto"
                        animate={
                            isSpeaking
                                ? {
                                    scaleX: [1, 1.3, 0.9, 1.2, 1],
                                    scaleY: [1, 0.8, 1.1, 0.9, 1]
                                }
                                : { scaleX: 1, scaleY: 1 }
                        }
                        transition={{
                            duration: 0.35,
                            repeat: isSpeaking ? Infinity : 0,
                            ease: 'easeInOut'
                        }}
                    />
                </div>
            </div>
            {/* Sparkles: +10–15% at glow peak, same cycle as glow, independent delays (no sync) */}
            {!reduceAnimations && (
                <>
                    <motion.span
                        className="absolute -top-1 -right-1 text-lg text-white/90"
                        animate={{ opacity: isSpeaking ? [0.6, 0.95, 0.6] : [0.48, 0.58, 0.48] }}
                        transition={{
                            duration: isSpeaking ? 0.8 : AVATAR_GLOW_DURATION,
                            repeat: Infinity,
                            ease: [0.45, 0, 0.55, 1]
                        }}
                        aria-hidden
                    >
                        ✦
                    </motion.span>
                    <motion.span
                        className="absolute top-0 -left-3 text-base text-white/90"
                        animate={{ opacity: isSpeaking ? [0.6, 0.95, 0.6] : [0.48, 0.58, 0.48] }}
                        transition={{
                            duration: isSpeaking ? 0.8 : AVATAR_GLOW_DURATION,
                            delay: 2.1,
                            repeat: Infinity,
                            ease: [0.45, 0, 0.55, 1]
                        }}
                        aria-hidden
                    >
                        ✦
                    </motion.span>
                </>
            )}
        </motion.div>
    );
});
