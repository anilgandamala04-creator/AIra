import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';
import { validateEmail, validateRequired } from '../utils/validation';

// Floating cloud component
function Cloud({ className, delay = 0 }: { className?: string; delay?: number }) {
    return (
        <motion.div
            className={`absolute rounded-full bg-white/40 blur-sm ${className}`}
            animate={{
                x: [0, 30, 0],
                y: [0, -10, 0],
            }}
            transition={{
                duration: 8,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

// Sparkle component
function Sparkle({ className, delay = 0 }: { className?: string; delay?: number }) {
    return (
        <motion.div
            className={`absolute text-white text-xl ${className}`}
            animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
            }}
            transition={{
                duration: 2,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            ✦
        </motion.div>
    );
}

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        loginWithGoogle,
        loginWithApple,
        loginWithEmail,
        skipToDemo,
        continueAsGuest,
        isLoading
    } = useAuthStore();

    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        try {
            setError(null);
            await loginWithGoogle();
            toast.success('Successfully signed in with Google');
            navigate('/onboarding');
        } catch (err) {
            const errorMessage = 'Failed to sign in with Google. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Google login error:', err);
        }
    };

    const handleAppleLogin = async () => {
        try {
            setError(null);
            await loginWithApple();
            toast.success('Successfully signed in with Apple');
            navigate('/onboarding');
        } catch (err) {
            const errorMessage = 'Failed to sign in with Apple. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Apple login error:', err);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate inputs
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

        try {
            setError(null);
            await loginWithEmail(email, password);
            toast.success('Successfully signed in');
            navigate('/onboarding');
        } catch (err) {
            const errorMessage = 'Failed to sign in. Please check your credentials.';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Email login error:', err);
        }
    };

    const handleSkipDemo = () => {
        skipToDemo();
        navigate('/onboarding');
    };

    const handleGuestLogin = () => {
        continueAsGuest();
        navigate('/onboarding');
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4">
            {/* Animated gradient background */}
            <div className="fixed inset-0 bg-gradient-to-b from-indigo-200 via-purple-200 via-pink-200 to-sky-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />

            {/* Floating clouds */}
            <Cloud className="w-64 h-20 -left-10 top-20" delay={0} />
            <Cloud className="w-48 h-16 right-0 top-40" delay={1} />
            <Cloud className="w-80 h-24 -left-20 bottom-32" delay={2} />
            <Cloud className="w-56 h-18 right-10 bottom-20" delay={0.5} />
            <Cloud className="w-40 h-14 left-1/4 top-16" delay={1.5} />
            <Cloud className="w-52 h-16 right-1/4 bottom-40" delay={3} />

            {/* Sparkles */}
            <Sparkle className="top-24 right-1/4" delay={0} />
            <Sparkle className="top-32 left-1/3" delay={0.5} />
            <Sparkle className="bottom-40 right-1/3" delay={1} />
            <Sparkle className="top-1/3 right-20" delay={1.5} />
            <Sparkle className="bottom-1/3 left-20" delay={2} />

            {/* Content - Responsive */}
            <motion.div
                className="relative z-10 flex flex-col items-center max-w-md w-full px-4 sm:px-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Title - Responsive */}
                <motion.h1
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-slate-100 mb-2 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {t('appName')}
                </motion.h1>

                <motion.p
                    className="text-gray-600 dark:text-slate-300 text-base sm:text-lg mb-6 sm:mb-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {t('tagline')}
                </motion.p>

                {/* AI Avatar/Mascot - Responsive */}
                <motion.div
                    className="relative mb-4 sm:mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-xl scale-110" />

                    {/* Main avatar - Responsive */}
                    <motion.div
                        className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Face */}
                        <div className="relative">
                            {/* Eyes */}
                            <div className="flex gap-4 mb-2">
                                <motion.div
                                    className="w-4 h-4 bg-gray-800 rounded-full"
                                    animate={{ scaleY: [1, 0.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                />
                                <motion.div
                                    className="w-4 h-4 bg-gray-800 rounded-full"
                                    animate={{ scaleY: [1, 0.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                />
                            </div>
                            {/* Eyebrows */}
                            <div className="absolute -top-3 left-0 right-0 flex justify-between px-1">
                                <div className="w-5 h-1 bg-amber-600 rounded-full transform -rotate-6" />
                                <div className="w-5 h-1 bg-amber-600 rounded-full transform rotate-6" />
                            </div>
                            {/* Cheeks */}
                            <div className="absolute top-2 -left-2 w-3 h-2 bg-orange-400/60 rounded-full" />
                            <div className="absolute top-2 -right-2 w-3 h-2 bg-orange-400/60 rounded-full" />
                            {/* Smile */}
                            <motion.div
                                className="w-10 h-5 border-b-4 border-gray-800 rounded-b-full mx-auto"
                                animate={{ scaleX: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>

                    {/* Sparkles around avatar */}
                    <motion.span
                        className="absolute -top-2 -right-2 text-2xl"
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        ✨
                    </motion.span>
                    <motion.span
                        className="absolute top-0 -left-4 text-xl"
                        animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    >
                        ✨
                    </motion.span>
                </motion.div>

                {/* Ask me anything text - Responsive */}
                <motion.p
                    className="text-gray-500 italic mb-6 sm:mb-8 text-base sm:text-lg text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    {t('askMeAnything')}
                </motion.p>

                {/* Error message - Responsive */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs sm:text-sm text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Auth buttons - Touch-friendly */}
                <motion.div
                    className="w-full space-y-2 sm:space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    {!showEmailForm ? (
                        <>
                            {/* Google Button - Responsive */}
                            <motion.button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white disabled:opacity-50 min-h-[48px] sm:min-h-[52px]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-gray-700 font-medium text-sm sm:text-base">{t('continueWithGoogle')}</span>
                            </motion.button>

                            {/* Apple Button - Responsive */}
                            <motion.button
                                onClick={handleAppleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-gray-900 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 min-h-[48px] sm:min-h-[52px]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg className="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <span className="text-white font-medium text-sm sm:text-base">{t('continueWithApple')}</span>
                            </motion.button>

                            {/* Email Button - Responsive */}
                            <motion.button
                                onClick={() => setShowEmailForm(true)}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white border border-purple-200 disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-purple-600 font-medium">{t('signInWithEmail')}</span>
                            </motion.button>
                        </>
                    ) : (
                        /* Email Form */
                        <motion.form
                            onSubmit={handleEmailLogin}
                            className="space-y-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('email')}
                                className="w-full px-5 py-3.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                                required
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('password')}
                                className="w-full px-5 py-3.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {isLoading ? t('loading') : t('signIn')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEmailForm(false)}
                                className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {t('back')}
                            </button>
                        </motion.form>
                    )}
                </motion.div>

                {/* Skip login link */}
                {!showEmailForm && (
                    <motion.div
                        className="mt-6 flex flex-col items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        <button
                            onClick={handleGuestLogin}
                            className="text-gray-500 hover:text-purple-600 transition-colors text-sm"
                        >
                            {t('continueAsGuest')}
                        </button>
                        <button
                            onClick={handleSkipDemo}
                            className="text-purple-400 hover:text-purple-600 transition-colors underline underline-offset-2"
                        >
                            {t('skipForDemo')}
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
