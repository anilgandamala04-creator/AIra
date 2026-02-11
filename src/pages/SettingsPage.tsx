import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../stores/settingsStore';
import { useUserStore } from '../stores/userStore';
import { useResourceStore } from '../stores/resourceStore';
import { useAuthStore } from '../stores/authStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { BOARDS, GRADES, COMPETITIVE_EXAMS, SUBJECTS_BY_GRADE, COMPETITIVE_CURRICULUM } from '../data/curriculumData';
import type { CurriculumType, SchoolBoard, ExamType, LearningPreferences, LearningStyle } from '../types';
import { toast } from '../stores/toastStore';
import {
    ArrowLeft, User, BookOpen, Bot, Shield, Download, Upload,
    Moon, Sun, Globe, Save, RotateCcw, Volume2, Sparkles, GraduationCap, Copy,
    FileText,
    AlertTriangle, Trash2, Database, MessageSquare, HelpCircle, Info, Compass,
    Eye, Link2, Brain, Zap, Star, School, Code
} from 'lucide-react';
import PasswordField from '../components/common/PasswordField';
import { clearOnboardingTourDone } from '../components/common/onboardingTourStorage';
import { useInstallPromptStore } from '../stores/installPromptStore';
import { APP_VERSION, APP_BUILD, TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } from '../constants/app';
import { deleteAllUserData, exportAllUserData, uploadFile, updateUserProfile } from '../services/backendService';
import { auth } from '../lib/firebase';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { getHumanVoiceScore } from '../utils/voice';
import { narrateText } from '../services/narration';
import NotificationCenter from '../components/common/NotificationCenter';
import {
    TRANSITION_DEFAULT,
    tapScale,
    springTransition,
    cardHoverTap,
    staggerContainer,
    staggerItem,
} from '../utils/animations';
import AnimatedButton from '../components/common/AnimatedButton';
import SkipToMainInHeader from '../components/common/SkipToMainInHeader';

type SettingsTab = 'account' | 'learning' | 'accessibility' | 'ai' | 'privacy' | 'about';

function InstallAppBlock() {
    const installPrompt = useInstallPromptStore((s) => s.installPrompt);
    const setDismissed = useInstallPromptStore((s) => s.setDismissedOrInstalled);
    if (!installPrompt) return null;
    return (
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mb-2">Install app</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Add AI Tutor to your home screen to open it like an app.</p>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={async () => {
                        try {
                            await installPrompt.prompt();
                            const { outcome } = await installPrompt.userChoice;
                            if (outcome === 'accepted') setDismissed(true);
                        } catch { /* ignore */ }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Download className="w-4 h-4" /> Add to home screen
                </button>
                <button type="button" onClick={() => setDismissed(true)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:underline">Not now</button>
            </div>
        </div>
    );
}

function ShareProgressBlock() {
    const settings = useSettingsStore((s) => s.settings);
    const { sessions, achievements, metrics } = useAnalyticsStore();
    const shareEnabled = settings?.privacy?.shareProgress ?? false;

    const getSummaryText = () => {
        const lines = [
            'Learning Progress Summary',
            '---',
            `Total study time: ${metrics.totalHours} hours`,
            `Topics completed: ${metrics.topicsCompleted}`,
            `Average quiz score: ${metrics.averageQuizScore}%`,
            `Current streak: ${metrics.streakDays} days`,
            `Sessions: ${sessions.length}`,
            '',
            'Achievements:',
            ...achievements.map((a) => `  ${a.unlockedAt ? '✓' : '○'} ${a.name}: ${a.description}`),
        ];
        return lines.join('\n');
    };

    const getExportJson = () => ({
        exportedAt: new Date().toISOString(),
        metrics,
        sessionsCount: sessions.length,
        sessions: sessions.slice(-50),
        achievements,
    });

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getSummaryText());
            toast.success('Progress summary copied to clipboard.');
        } catch {
            toast.error('Could not copy to clipboard.');
        }
    };

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(getExportJson(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Progress exported as JSON.');
    };

    const handleDownloadPDF = () => {
        if (!shareEnabled) return;
        const lines = [
            'AIra Progress Report',
            'Generated: ' + new Date().toLocaleString(),
            '---',
            'Summary',
            `Total study time: ${metrics.totalHours} hours`,
            `Topics completed: ${metrics.topicsCompleted}`,
            `Average quiz score: ${metrics.averageQuizScore}%`,
            `Current streak: ${metrics.streakDays} days`,
            '',
            'Achievements:',
            ...achievements.map((a) => `  ${a.unlockedAt ? '✓' : '○'} ${a.name}: ${a.description}`),
        ];
        const html = `<!DOCTYPE html><html><head><title>AIra Progress Report</title></head><body style="font-family:sans-serif;max-width:600px;margin:2rem auto;padding:1rem"><pre>${lines.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre><p style="margin-top:2rem;font-size:0.9em;color:#666">Use browser Print (Ctrl+P) → Save as PDF</p></body></html>`;
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            setTimeout(() => { w.print(); }, 500);
        }
        toast.success('Opening report. Use Print → Save as PDF.');
    };

    return (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm font-medium text-gray-800 dark:text-slate-100">Share / Export progress</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
                {shareEnabled ? 'Copy a summary or download your progress data (JSON).' : 'Enable "Share Progress" above to export or share your progress.'}
            </p>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!shareEnabled}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Copy className="w-4 h-4" />
                    Copy summary
                </button>
                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!shareEnabled}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4" />
                    Download JSON
                </button>
                <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={!shareEnabled}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileText className="w-4 h-4" />
                    Progress report (PDF)
                </button>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const settings = useSettingsStore(useShallow((state) => state.settings));
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));
    const {
        updateSettings,
        updateNotifications,
        updateAccessibility,
        updateAiTutor,
        updatePrivacy,
        exportSettings,
        importSettings,
        resetToDefaults,
        templates,
        applyTemplate,
        forceSyncToBackend,
    } = useSettingsStore();
    const {
        curriculumType,
        selectedBoard,
        selectedGrade,
        selectedExam,
        selectedSubject,
        includePYQ,
        profile,
        setCurriculumType,
        setSelectedBoard,
        setSelectedGrade,
        setSelectedExam,
        setSelectedSubject,
        updateProfile,
    } = useUserStore();
    const { logout, user, changePassword, reauthenticateForSensitiveAction, sendEmailVerification, reloadUser, linkWithGoogle, linkWithEmail } = useAuthStore();
    const notes = useResourceStore((s) => s.notes);

    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    const [saved, setSaved] = useState(false);
    const [signOutLoading, setSignOutLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
    const [deleteReauthPassword, setDeleteReauthPassword] = useState('');
    const [deleteReauthCompleted, setDeleteReauthCompleted] = useState(false);
    const [deleteReauthLoading, setDeleteReauthLoading] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [changePwCurrent, setChangePwCurrent] = useState('');
    const [changePwNew, setChangePwNew] = useState('');
    const [changePwConfirm, setChangePwConfirm] = useState('');
    const [changePwLoading, setChangePwLoading] = useState(false);
    const [verifyEmailLoading, setVerifyEmailLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [linkGoogleLoading, setLinkGoogleLoading] = useState(false);
    const [linkEmailLoading, setLinkEmailLoading] = useState(false);
    const [linkEmailEmail, setLinkEmailEmail] = useState('');
    const [linkEmailPassword, setLinkEmailPassword] = useState('');
    const [showLinkEmailForm, setShowLinkEmailForm] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [displayNameEdit, setDisplayNameEdit] = useState(user?.displayName ?? profile?.displayName ?? '');
    const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setDisplayNameEdit(user?.displayName ?? profile?.displayName ?? '');
    }, [user?.displayName, profile?.displayName]);

    const handleDisplayNameBlur = async () => {
        const name = displayNameEdit.trim();
        if (!user?.id || user.authMethod === 'guest') return;
        if (!auth?.currentUser) return;
        const current = user.displayName ?? profile?.displayName ?? '';
        if (name === current) return;
        try {
            await firebaseUpdateProfile(auth.currentUser, { displayName: name });
            useAuthStore.setState((s) => s.user ? { user: { ...s.user, displayName: name, name } } : {});
            const prof = useUserStore.getState().profile;
            if (prof) {
                await updateUserProfile(user.id, { ...prof, displayName: name, name });
                useUserStore.getState().updateProfile({ displayName: name, name });
            }
            toast.success('Display name updated');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update display name');
        }
    };

    // Load available voices
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                // Show voices in a sensible order, prioritizing the most natural voices for the current app language
                const lang = settings.language || 'en';
                const sorted = [...voices].sort((a, b) => {
                    const scoreA = getHumanVoiceScore(a, lang);
                    const scoreB = getHumanVoiceScore(b, lang);
                    return scoreB - scoreA || a.name.localeCompare(b.name);
                });
                setAvailableVoices(sorted);
            };

            loadVoices();
            // Voices may load asynchronously
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
            }
            return () => {
                if (window.speechSynthesis.onvoiceschanged !== undefined) {
                    window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
                }
            };
        }
    }, [settings.language]);

    const handleSave = () => {
        setSaved(true);
        // Explicitly sync current settings to backend with toast confirmation
        forceSyncToBackend();
        // Clear any existing timeout
        if (savedTimeoutRef.current) {
            clearTimeout(savedTimeoutRef.current);
        }
        savedTimeoutRef.current = setTimeout(() => {
            setSaved(false);
            savedTimeoutRef.current = null;
        }, 2000);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (savedTimeoutRef.current) {
                clearTimeout(savedTimeoutRef.current);
            }
        };
    }, []);

    const handleExport = () => {
        const data = exportSettings();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-tutor-settings.json';
        a.click();
        // Revoke the blob URL to free memory
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.json')) {
            toast.error('Please select a valid JSON file.');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result as string;
                if (!result) {
                    toast.error('File is empty. Please select a valid settings file.');
                    e.target.value = '';
                    return;
                }

                const success = importSettings(result);
                if (success) {
                    toast.success('Settings imported successfully');
                    handleSave();
                } else {
                    toast.error('Failed to import settings. Please check the file format.');
                }
            } catch (error) {
                console.error('Import error:', error);
                toast.error('Failed to import settings. Please check the file format.');
            } finally {
                e.target.value = '';
            }
        };
        reader.onerror = () => {
            toast.error('Failed to read file. Please try again.');
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    const tabs = [
        { id: 'account', icon: User, label: t('account') },
        { id: 'learning', icon: BookOpen, label: t('learning') },
        { id: 'accessibility', icon: Eye, label: t('accessibility') },
        { id: 'ai', icon: Bot, label: t('aiTutor') },
        { id: 'privacy', icon: Shield, label: t('privacy') },
        { id: 'about', icon: Info, label: 'About' },
    ] as const;

    return (
        <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden min-w-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* Header - same minHeight as other pages for consistent icon alignment */}
            <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-sm sticky top-0 z-50 safe-top flex items-center" style={{ minHeight: 'var(--layout-header-height)' }}>
                <SkipToMainInHeader />
                <div className="max-w-5xl mx-auto px-3 sm:px-4 flex items-center gap-2 sm:gap-4 flex-1 min-w-0" style={{ minHeight: 'var(--layout-header-height)' }}>
                    <motion.button
                        onClick={() => navigate(-1)}
                        className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-ui touch-manipulation"
                        whileHover={reduceAnimations ? undefined : { scale: 1.05 }}
                        whileTap={reduceAnimations ? undefined : tapScale}
                        transition={springTransition}
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-300 shrink-0" aria-hidden />
                    </motion.button>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-slate-100 truncate min-w-0 flex-1">{t('settings')}</h1>

                    <div className="flex-1 min-w-2" aria-hidden />

                    <div className="flex items-center gap-2">
                        <NotificationCenter />
                        <motion.button
                            key={saved ? 'saved' : 'idle'}
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 min-h-[44px] sm:min-h-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity touch-manipulation shrink-0"
                            initial={false}
                            animate={
                                saved && !reduceAnimations
                                    ? { scale: [1, 1.08, 1], transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
                                    : { scale: 1 }
                            }
                            whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                            whileTap={reduceAnimations ? undefined : tapScale}
                            transition={springTransition}
                        >
                            <Save className="w-4 h-4 shrink-0" aria-hidden />
                            {saved ? 'Saved!' : t('save')}
                        </motion.button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Mobile Tab Bar - Enhanced */}
                <div className="md:hidden flex gap-2 overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 scrollbar-hide">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all min-h-[44px] ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white/80 dark:bg-slate-900/60 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                            aria-label={tab.label}
                            whileTap={reduceAnimations ? undefined : tapScale}
                            transition={springTransition}
                        >
                            <tab.icon className="w-4 h-4 shrink-0" />
                            <span>{tab.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-48 lg:w-56 shrink-0">
                    <motion.nav
                        className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl shadow-sm p-2 sticky top-20 safe-top"
                        variants={reduceAnimations ? undefined : staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-ui ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                    }`}
                                variants={reduceAnimations ? undefined : staggerItem}
                                whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                                transition={springTransition}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </motion.button>
                        ))}
                    </motion.nav>

                    {/* Quick Actions */}
                    <div className="mt-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl shadow-sm p-4 space-y-2">
                        <motion.button
                            onClick={handleExport}
                            className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm"
                            whileHover={reduceAnimations ? undefined : { x: 2 }}
                            whileTap={reduceAnimations ? undefined : tapScale}
                            transition={springTransition}
                        >
                            <Download className="w-4 h-4" />
                            Export Settings
                        </motion.button>
                        <motion.label
                            className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm cursor-pointer"
                            whileHover={reduceAnimations ? undefined : { x: 2 }}
                            whileTap={reduceAnimations ? undefined : tapScale}
                            transition={springTransition}
                        >
                            <Upload className="w-4 h-4" />
                            Import Settings
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </motion.label>
                        <motion.button
                            onClick={resetToDefaults}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-sm"
                            whileHover={reduceAnimations ? undefined : { x: 2 }}
                            whileTap={reduceAnimations ? undefined : tapScale}
                            transition={springTransition}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset to Defaults
                        </motion.button>
                    </div>
                </div>

                {/* Content */}
                <main id="main-content" tabIndex={-1} className="flex-1 min-w-0">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={TRANSITION_DEFAULT}
                        className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl shadow-sm p-6 text-gray-800 dark:text-slate-100 dark:[&_label]:text-slate-200 dark:[&_p]:text-slate-300 dark:[&_span]:text-slate-200 dark:[&_h2]:text-slate-100 dark:[&_h3]:text-slate-100"
                    >
                        {/* Account Settings */}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Account Settings</h2>

                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Display name</label>
                                        <input
                                            type="text"
                                            value={displayNameEdit}
                                            onChange={(e) => setDisplayNameEdit(e.target.value)}
                                            onBlur={handleDisplayNameBlur}
                                            placeholder="Your display name"
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Shown in the app and on your profile.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Language</label>
                                        <select
                                            value={settings.language}
                                            onChange={(e) => updateSettings({ language: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Theme</label>
                                        <div className="flex gap-2">
                                            {[
                                                { value: 'light', icon: Sun, label: 'Light' },
                                                { value: 'dark', icon: Moon, label: 'Dark' },
                                                { value: 'system', icon: Globe, label: 'System' },
                                            ].map((theme) => (
                                                <button
                                                    key={theme.value}
                                                    onClick={() => updateSettings({ theme: theme.value as 'light' | 'dark' | 'system' })}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${settings.theme === theme.value
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-300'
                                                        : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-300'
                                                        }`}
                                                >
                                                    <theme.icon className="w-4 h-4" />
                                                    {theme.label}
                                                </button>
                                            ))}
                                        </div>
                                        {settings.theme === 'system' && (
                                            <div className="mt-2">
                                                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Auto dark after (hour, 0-23)</label>
                                                <select
                                                    value={settings.themeDarkAfterHour ?? ''}
                                                    onChange={(e) => updateSettings({ themeDarkAfterHour: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })}
                                                    className="w-32 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm"
                                                >
                                                    <option value="">Off (use system)</option>
                                                    {[18, 19, 20, 21, 22].map((h) => (
                                                        <option key={h} value={h}>{h}:00 ({h > 12 ? h - 12 : h}pm)</option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Use dark theme after this hour (e.g. 20 = 8pm)</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Accent color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { value: 'purple' as const, label: 'Purple', className: 'bg-purple-500' },
                                                { value: 'blue' as const, label: 'Blue', className: 'bg-blue-500' },
                                                { value: 'green' as const, label: 'Green', className: 'bg-green-500' },
                                                { value: 'amber' as const, label: 'Amber', className: 'bg-amber-500' },
                                                { value: 'rose' as const, label: 'Rose', className: 'bg-rose-500' },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => updateSettings({ accentColor: opt.value })}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${(settings.accentColor ?? 'purple') === opt.value
                                                        ? 'border-gray-800 dark:border-slate-300 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-purple-500'
                                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                                        }`}
                                                >
                                                    <span className={`w-4 h-4 rounded-full ${opt.className}`} aria-hidden />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Profile photo</h3>
                                        <div className="flex items-center gap-4">
                                            {user?.avatar && (
                                                <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600" />
                                            )}
                                            <label className="cursor-pointer">
                                                <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 inline-block disabled:opacity-50" aria-hidden={avatarLoading}>
                                                    {avatarLoading ? 'Uploading...' : 'Change photo'}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={avatarLoading}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file || !user?.id) return;
                                                        setAvatarLoading(true);
                                                        try {
                                                            const url = await uploadFile(user.id, 'avatar', file);
                                                            if (auth?.currentUser) await firebaseUpdateProfile(auth.currentUser, { photoURL: url });
                                                            const prof = useUserStore.getState().profile;
                                                            if (prof) {
                                                                await updateUserProfile(user.id, { ...prof, avatar: url });
                                                                useUserStore.getState().updateProfile({ avatar: url });
                                                            }
                                                            const u = useAuthStore.getState().user;
                                                            if (u) useAuthStore.setState({ user: { ...u, avatar: url } });
                                                            toast.success('Photo updated');
                                                        } catch (err) {
                                                            toast.error(err instanceof Error ? err.message : 'Upload failed');
                                                        } finally {
                                                            setAvatarLoading(false);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {user?.authMethod === 'email' && !user?.isVerified && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl space-y-3 border border-amber-200 dark:border-amber-800">
                                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Verify your email</h3>
                                            <p className="text-xs text-amber-700 dark:text-amber-300">We sent a verification link to your email. Click it to verify, or request a new link below. After verifying, click &quot;I&apos;ve verified&quot; to refresh.</p>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    disabled={verifyEmailLoading}
                                                    onClick={async () => {
                                                        setVerifyEmailLoading(true);
                                                        const { error } = await sendEmailVerification();
                                                        setVerifyEmailLoading(false);
                                                        if (error) toast.error(error.message || 'Failed to send');
                                                        else toast.success('Verification email sent. Check your inbox.');
                                                    }}
                                                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                                >
                                                    {verifyEmailLoading ? 'Sending…' : 'Send verification email'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        await reloadUser();
                                                        if (useAuthStore.getState().user?.isVerified) toast.success('Email verified!');
                                                        else toast.info('If you just verified, we’ve refreshed. If not, check your inbox for the link.');
                                                    }}
                                                    className="px-3 py-2 bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 rounded-lg text-sm font-medium hover:bg-amber-300 dark:hover:bg-amber-800"
                                                >
                                                    I&apos;ve verified
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-2">
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Two-factor authentication (2FA)</h3>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">Optional 2FA for email (and optionally Google) accounts is planned for a future release. You can strengthen your account by using a strong password and changing it periodically below.</p>
                                    </div>

                                    {user && !user.authMethod?.includes('guest') && auth?.currentUser && (() => {
                                        const providerIds = (auth.currentUser.providerData || []).map((p) => p.providerId);
                                        const hasGoogle = providerIds.includes('google.com');
                                        const hasEmail = providerIds.includes('password');
                                        return (
                                            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-3 border border-gray-200 dark:border-slate-700">
                                                <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                                    <Link2 className="w-4 h-4" />
                                                    Linked accounts
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                                    Link another sign-in method to this account. You can then sign in with either method. Only link accounts you own.
                                                </p>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {hasGoogle && <span className="px-2 py-1 bg-gray-200 dark:bg-slate-600 rounded text-xs font-medium">Google</span>}
                                                    {hasEmail && <span className="px-2 py-1 bg-gray-200 dark:bg-slate-600 rounded text-xs font-medium">Email</span>}
                                                </div>
                                                {!hasGoogle && (
                                                    <div>
                                                        <button
                                                            type="button"
                                                            disabled={linkGoogleLoading}
                                                            onClick={async () => {
                                                                setLinkGoogleLoading(true);
                                                                const { error } = await linkWithGoogle();
                                                                setLinkGoogleLoading(false);
                                                                if (error) {
                                                                    const msg = error.message || 'Linking failed';
                                                                    if (msg.includes('already in use')) toast.error('That Google account is already linked to another user.');
                                                                    else toast.error(msg);
                                                                } else {
                                                                    toast.success('Google account linked. You can now sign in with Google too.');
                                                                }
                                                            }}
                                                            className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50"
                                                        >
                                                            {linkGoogleLoading ? 'Linking…' : 'Link Google account'}
                                                        </button>
                                                    </div>
                                                )}
                                                {!hasEmail && (
                                                    <div className="space-y-2">
                                                        {!showLinkEmailForm ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowLinkEmailForm(true)}
                                                                className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-600"
                                                            >
                                                                Link email &amp; password
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <p className="text-xs text-amber-700 dark:text-amber-300">Use an email not already registered. You will be able to sign in with this email and password.</p>
                                                                <input
                                                                    type="email"
                                                                    value={linkEmailEmail}
                                                                    onChange={(e) => setLinkEmailEmail(e.target.value)}
                                                                    placeholder="Email"
                                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:text-slate-100"
                                                                />
                                                                <PasswordField
                                                                    value={linkEmailPassword}
                                                                    onChange={setLinkEmailPassword}
                                                                    placeholder="Password"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        disabled={linkEmailLoading || !linkEmailEmail.trim() || !linkEmailPassword}
                                                                        onClick={async () => {
                                                                            setLinkEmailLoading(true);
                                                                            const { error } = await linkWithEmail(linkEmailEmail.trim(), linkEmailPassword);
                                                                            setLinkEmailLoading(false);
                                                                            if (error) {
                                                                                const msg = error.message || 'Linking failed';
                                                                                if (msg.includes('already in use') || msg.includes('already exists')) toast.error('That email is already used by another account.');
                                                                                else toast.error(msg);
                                                                            } else {
                                                                                toast.success('Email linked. You can now sign in with email and password too.');
                                                                                setShowLinkEmailForm(false);
                                                                                setLinkEmailEmail('');
                                                                                setLinkEmailPassword('');
                                                                            }
                                                                        }}
                                                                        className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                                                                    >
                                                                        {linkEmailLoading ? 'Linking…' : 'Link'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { setShowLinkEmailForm(false); setLinkEmailEmail(''); setLinkEmailPassword(''); }}
                                                                        className="px-3 py-2 bg-gray-200 dark:bg-slate-600 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-500"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {user?.authMethod === 'email' && (
                                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-3">
                                            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Change password</h3>
                                            <PasswordField
                                                value={changePwCurrent}
                                                onChange={setChangePwCurrent}
                                                placeholder="Current password"
                                            />
                                            <PasswordField
                                                value={changePwNew}
                                                onChange={setChangePwNew}
                                                placeholder="New password"
                                            />
                                            <PasswordField
                                                value={changePwConfirm}
                                                onChange={setChangePwConfirm}
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                disabled={changePwLoading || !changePwCurrent || !changePwNew || changePwNew !== changePwConfirm}
                                                onClick={async () => {
                                                    if (changePwNew !== changePwConfirm) {
                                                        toast.error('New passwords do not match');
                                                        return;
                                                    }
                                                    setChangePwLoading(true);
                                                    const { error } = await changePassword(changePwCurrent, changePwNew);
                                                    setChangePwLoading(false);
                                                    if (error) {
                                                        toast.error(error.message || 'Failed to change password');
                                                        return;
                                                    }
                                                    toast.success('Password updated');
                                                    setChangePwCurrent('');
                                                    setChangePwNew('');
                                                    setChangePwConfirm('');
                                                }}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {changePwLoading ? 'Updating...' : 'Change password'}
                                            </button>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-3">Notifications</label>
                                        <div className="space-y-3">
                                            {[
                                                { key: 'studyReminders', label: 'Study Reminders' },
                                                { key: 'goalAchievements', label: 'Goal Achievements' },
                                                { key: 'reviewReminders', label: 'Review Reminders' },
                                            ].map((item) => (
                                                <label key={item.key} className="flex items-center justify-between">
                                                    <span className="text-gray-600 dark:text-slate-300">{item.label}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                                                        onChange={(e) => updateNotifications({ [item.key]: e.target.checked })}
                                                        className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-3 grid gap-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Default reminder time</label>
                                            <input
                                                type="time"
                                                value={settings.notifications.reminderTime}
                                                onChange={(e) => updateNotifications({ reminderTime: e.target.value })}
                                                className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg dark:text-slate-100"
                                            />
                                            <div className="pt-2">
                                                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Per-day schedule (optional)</label>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">e.g. weekdays at 7pm — leave empty to use default above</p>
                                                <div className="grid grid-cols-7 gap-1 text-[10px]">
                                                    {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => (
                                                        <div key={day} className="flex flex-col gap-0.5">
                                                            <span className="text-gray-500 dark:text-slate-400 capitalize">{day.slice(0, 2)}</span>
                                                            <input
                                                                type="time"
                                                                value={settings.notifications.reminderSchedule?.[day] ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const prev = settings.notifications.reminderSchedule ?? {};
                                                                    updateNotifications({
                                                                        reminderSchedule: val
                                                                            ? { ...prev, [day]: val }
                                                                            : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== day)),
                                                                    });
                                                                }}
                                                                className="px-1 py-1 text-[10px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mt-2">Daily study goal (minutes, 0 = off)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={120}
                                                value={settings.notifications.dailyStudyGoalMinutes ?? 0}
                                                onChange={(e) => updateNotifications({ dailyStudyGoalMinutes: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                                                className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg dark:text-slate-100 w-24"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-slate-700 space-y-4">
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Feedback &amp; help
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Send feedback, report a problem, or suggest an improvement. You can attach a screenshot by pasting or describing it in the message.</p>
                                    <textarea
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        placeholder="Describe your feedback or issue..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-400 dark:text-slate-100 resize-y"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const subject = encodeURIComponent('AIra App Feedback');
                                                const body = encodeURIComponent(`${feedbackText}\n\n---\nSent from AIra Settings`);
                                                window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
                                                setFeedbackSent(true);
                                                setFeedbackText('');
                                                setTimeout(() => setFeedbackSent(false), 3000);
                                                toast.success('Opening your email client. If nothing opened, send to support@example.com with your feedback.');
                                            }}
                                            disabled={!feedbackText.trim()}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                        >
                                            {feedbackSent ? 'Opened' : 'Send feedback'}
                                        </button>
                                        <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Help tour can be added here.'); }} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400">
                                            <HelpCircle className="w-4 h-4" />
                                            How to use
                                        </a>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                                    <AnimatedButton
                                        variant="danger"
                                        disabled={signOutLoading}
                                        onClick={async () => {
                                            if (signOutLoading) return;
                                            setSignOutLoading(true);
                                            try {
                                                await logout();
                                                navigate('/login');
                                            } finally {
                                                setSignOutLoading(false);
                                            }
                                        }}
                                        className="w-full py-3 flex items-center justify-center gap-2 !bg-red-50 !text-red-600 hover:!bg-red-100 dark:!bg-red-950/30 dark:!text-red-300 dark:hover:!bg-red-900/40"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center border-2 border-red-600 dark:border-red-400 rounded-full">
                                            <div className="w-2 h-0.5 bg-red-600 dark:bg-red-400"></div>
                                        </div>
                                        {signOutLoading ? 'Signing out...' : 'Sign Out'}
                                    </AnimatedButton>
                                </div>
                            </div>
                        )}

                        {/* Learning Settings */}
                        {activeTab === 'learning' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Learning Preferences</h2>

                                {/* No profile fallback removed as everyone now has a profile post-login */}
                                {profile ? (
                                    <div className="space-y-8">
                                        <div className="p-6 bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 rounded-2xl space-y-6">
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-50 dark:border-slate-800">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">Curriculum Path</h3>
                                                <p className="text-xs text-gray-500 dark:text-slate-400">Manage your academic focus and level</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">Learning Path</label>
                                                <div className="flex gap-2">
                                                    {[
                                                        { id: 'school', label: 'School' },
                                                        { id: 'competitive', label: 'Competitive' }
                                                    ].map((type) => (
                                                        <button
                                                            key={type.id}
                                                            onClick={() => setCurriculumType(type.id as CurriculumType)}
                                                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${curriculumType === type.id
                                                                ? 'bg-purple-600 text-white border-purple-600'
                                                                : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-purple-300'
                                                                }`}
                                                        >
                                                            {type.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {curriculumType === 'school' ? (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">School Board</label>
                                                        <select
                                                            value={selectedBoard || ''}
                                                            onChange={(e) => setSelectedBoard(e.target.value as SchoolBoard)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                                        >
                                                            <option value="" disabled>Select Board</option>
                                                            {BOARDS.map(board => (
                                                                <option key={board} value={board}>{board}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">Grade Level</label>
                                                        <select
                                                            value={selectedGrade || ''}
                                                            onChange={(e) => setSelectedGrade(e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                                        >
                                                            <option value="" disabled>Select Grade</option>
                                                            {GRADES.map(grade => (
                                                                <option key={grade} value={grade}>{grade}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">Competitive Exam</label>
                                                    <select
                                                        value={selectedExam || ''}
                                                        onChange={(e) => setSelectedExam(e.target.value as ExamType)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                                    >
                                                        <option value="" disabled>Select Exam</option>
                                                        {COMPETITIVE_EXAMS.map(exam => (
                                                            <option key={exam} value={exam}>{exam}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">Active Subject</label>
                                                <select
                                                    value={selectedSubject || ''}
                                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                                >
                                                    <option value="" disabled>Select Subject</option>
                                                    {curriculumType === 'school' && selectedGrade ? (
                                                        (SUBJECTS_BY_GRADE[selectedGrade] || []).map(subject => (
                                                            <option key={subject} value={subject}>{subject}</option>
                                                        ))
                                                    ) : curriculumType === 'competitive' && selectedExam ? (
                                                        (COMPETITIVE_CURRICULUM[selectedExam] || []).map(subject => (
                                                            <option key={subject.name} value={subject.name}>{subject.name}</option>
                                                        ))
                                                    ) : (
                                                        <option disabled>Complete selection above</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={() => {
                                                    updateProfile({
                                                        curriculumType: curriculumType ?? undefined,
                                                        board: selectedBoard ?? undefined,
                                                        grade: selectedGrade ?? undefined,
                                                        exam: selectedExam ?? undefined,
                                                        subject: selectedSubject ?? undefined,
                                                        includePYQ: includePYQ ?? undefined,
                                                    });
                                                    toast.success('Curriculum preferences saved');
                                                    handleSave();
                                                }}
                                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Update Curriculum Preferences
                                            </button>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 rounded-xl p-5 space-y-6 mt-6">
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-50 dark:border-slate-800">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                                    <Brain className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">Adaptive Learning</h3>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">Personalize how AIra explains concepts</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Learning Mode</label>
                                                    <div className="flex bg-gray-50 dark:bg-slate-800 p-1 rounded-xl">
                                                        <button
                                                            type="button"
                                                            onClick={() => useUserStore.getState().updateLearningStyle({ visual: 80, auditory: 20 })}
                                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${(profile.learningStyle?.visual ?? 0) > (profile.learningStyle?.auditory ?? 0)
                                                                ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm'
                                                                : 'text-gray-500'
                                                                }`}
                                                        >
                                                            Visual First
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => useUserStore.getState().updateLearningStyle({ visual: 20, auditory: 80 })}
                                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${(profile.learningStyle?.auditory ?? 0) > (profile.learningStyle?.visual ?? 0)
                                                                ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm'
                                                                : 'text-gray-500'
                                                                }`}
                                                        >
                                                            Auditory First
                                                        </button>
                                                    </div>
                                                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mt-4">Teaching Persona</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { id: 'friendly', label: 'Friendly', icon: '😊' },
                                                            { id: 'professional', label: 'Pro', icon: '👔' },
                                                            { id: 'mentor', label: 'Mentor', icon: '🧘' },
                                                            { id: 'strict', label: 'Strict', icon: '🎯' },
                                                        ].map((mode) => (
                                                            <button
                                                                key={mode.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    useUserStore.getState().updateLearningPreferences({ teachingStyle: mode.id as LearningPreferences['teachingStyle'] });
                                                                    updateAiTutor({ personality: mode.id as "encouraging" | "direct" | "humorous" | "formal" });
                                                                }}
                                                                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${profile.learningPreferences?.teachingStyle === mode.id
                                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                                    : 'border-gray-50 dark:border-slate-800 hover:border-purple-200'
                                                                    }`}
                                                            >
                                                                <span className="text-xl">{mode.icon}</span>
                                                                <span className="text-xs font-bold dark:text-white">{mode.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Preferred Pace</label>
                                                    <select
                                                        value={profile.learningStyle?.preferredPace || 'normal'}
                                                        onChange={(e) => useUserStore.getState().updateLearningStyle({ preferredPace: e.target.value as LearningStyle['preferredPace'] })}
                                                        className="w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        <option value="slow">Steady & Thorough</option>
                                                        <option value="normal">Balanced Precision</option>
                                                        <option value="fast">Rapid & Intensive</option>
                                                    </select>

                                                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mt-4">Explanation Depth</label>
                                                    <div className="flex bg-gray-50 dark:bg-slate-800 p-1 rounded-xl">
                                                        {(['basic', 'comprehensive', 'detailed', 'expert'] as const).map((depth) => (
                                                            <button
                                                                key={depth}
                                                                type="button"
                                                                onClick={() => useUserStore.getState().updateLearningPreferences({ explanationDepth: depth })}
                                                                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all capitalize ${profile.learningPreferences?.explanationDepth === depth
                                                                    ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm'
                                                                    : 'text-gray-500'
                                                                    }`}
                                                            >
                                                                {depth === 'expert' ? 'Advanced' : depth}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-amber-500" />
                                                    Topic Interests (for contextual analogies)
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { id: 'space', label: 'Space', icon: <Globe className="w-3 h-3" /> },
                                                        { id: 'tech', label: 'Tech', icon: <Code className="w-3 h-3" /> },
                                                        { id: 'history', label: 'History', icon: <School className="w-3 h-3" /> },
                                                        { id: 'nature', label: 'Nature', icon: <Zap className="w-3 h-3" /> },
                                                        { id: 'stories', label: 'Stories', icon: <BookOpen className="w-3 h-3" /> },
                                                        { id: 'logic', label: 'Logic', icon: <Brain className="w-3 h-3" /> },
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const current = profile.learningGoals || [];
                                                                const next = current.includes(opt.id)
                                                                    ? current.filter(i => i !== opt.id)
                                                                    : [...current, opt.id];
                                                                updateUserProfile(auth.currentUser?.uid || '', { ...profile, learningGoals: next });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 ${profile.learningGoals?.includes(opt.id)
                                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                                : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 dark:text-white hover:border-indigo-300'
                                                                }`}
                                                        >
                                                            {opt.icon}
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Quick Templates</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {templates.map((template) => (
                                                        <motion.button
                                                            key={template.id}
                                                            onClick={() => applyTemplate(template.id)}
                                                            className="p-3 text-left border border-gray-200 dark:border-slate-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
                                                            variants={reduceAnimations ? undefined : cardHoverTap}
                                                            initial="rest"
                                                            whileHover={reduceAnimations ? undefined : 'hover'}
                                                            whileTap={reduceAnimations ? undefined : 'tap'}
                                                            transition={springTransition}
                                                        >
                                                            <p className="font-medium text-gray-800 dark:text-slate-100 text-sm">{template.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{template.description}</p>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-5 bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 rounded-xl space-y-4">
                                                <h3 className="font-bold text-gray-900 dark:text-white">Quiz Feedback</h3>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Show correct answer</label>
                                                    <select
                                                        value={settings.quiz?.showCorrectAnswer ?? 'after_each'}
                                                        onChange={(e) => updateSettings({ quiz: { showCorrectAnswer: e.target.value as 'after_each' | 'at_end' } })}
                                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                                    >
                                                        <option value="after_each">After each question</option>
                                                        <option value="at_end">At the end of quiz</option>
                                                    </select>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">When to reveal the correct answer and explanation.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                                        <p className="text-sm text-gray-500 dark:text-slate-400">Loading your learning profile...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Accessibility Settings */}
                        {activeTab === 'accessibility' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Accessibility</h2>

                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Font Size</label>
                                        <select
                                            value={settings.accessibility.fontSize}
                                            onChange={(e) => updateAccessibility({ fontSize: e.target.value as 'small' | 'medium' | 'large' | 'xlarge' })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                        >
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="xlarge">Extra Large</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Font Family</label>
                                        <select
                                            value={settings.accessibility.fontFamily ?? 'system'}
                                            onChange={(e) => updateAccessibility({ fontFamily: e.target.value as 'system' | 'serif' | 'dyslexia' })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                        >
                                            <option value="system">System (Nunito / Inter)</option>
                                            <option value="serif">Serif</option>
                                            <option value="dyslexia">Dyslexia-friendly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Line Spacing (Reading)</label>
                                        <select
                                            value={settings.accessibility.lineSpacing ?? 'default'}
                                            onChange={(e) => updateAccessibility({ lineSpacing: e.target.value as 'compact' | 'default' | 'comfortable' })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                        >
                                            <option value="compact">Compact</option>
                                            <option value="default">Default</option>
                                            <option value="comfortable">Comfortable</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { key: 'highContrast', label: 'High Contrast' },
                                            { key: 'reduceAnimations', label: 'Reduce Animations' },
                                            { key: 'textToSpeech', label: 'Text to Speech' },
                                            { key: 'showCaptions', label: 'Show captions during TTS' },
                                        ].map((item) => (
                                            <label key={item.key} className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-slate-300">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={!!(settings.accessibility[item.key as keyof typeof settings.accessibility] as boolean)}
                                                    onChange={(e) => updateAccessibility({ [item.key]: e.target.checked })}
                                                    className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    {settings.accessibility.textToSpeech && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                                                    Speech Speed: {settings.accessibility.ttsSpeed.toFixed(1)}x
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="2"
                                                    step="0.1"
                                                    value={settings.accessibility.ttsSpeed}
                                                    onChange={(e) => updateAccessibility({ ttsSpeed: parseFloat(e.target.value) })}
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Voice</label>
                                                <select
                                                    value={settings.accessibility.ttsVoice}
                                                    onChange={(e) => updateAccessibility({ ttsVoice: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                                >
                                                    <option value="">Auto-select Best Natural Voice</option>
                                                    {availableVoices.length > 0 ? (
                                                        availableVoices.map((voice) => {
                                                            const isPremium = voice.name.toLowerCase().includes('neural') ||
                                                                voice.name.toLowerCase().includes('premium') ||
                                                                voice.name.toLowerCase().includes('enhanced');
                                                            return (
                                                                <option key={voice.name} value={voice.name}>
                                                                    {isPremium ? '⭐ ' : ''}{voice.name} {voice.lang ? `(${voice.lang})` : ''}
                                                                </option>
                                                            );
                                                        })
                                                    ) : (
                                                        <option value="">Loading voices...</option>
                                                    )}
                                                </select>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                                    {availableVoices.length > 0
                                                        ? `${availableVoices.length} voice(s) available. Premium voices (⭐) sound more natural.`
                                                        : 'Available voices depend on your browser and OS. Reload if voices don\'t appear.'}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (typeof window === 'undefined' || !window.speechSynthesis) {
                                                        alert('Speech synthesis is not available in your browser.');
                                                        return;
                                                    }
                                                    const testText = "Hello! This is how I sound. I'm designed to explain concepts in a natural, human-like way that makes learning easier and more engaging.";
                                                    narrateText(testText, {
                                                        enabled: settings.accessibility.textToSpeech,
                                                        rate: Math.max(0.8, Math.min(1.2, settings.accessibility.ttsSpeed || 1.0)),
                                                        pitch: 0.95,
                                                        volume: 1.0,
                                                    });
                                                }}
                                                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors flex items-center gap-2"
                                            >
                                                <Volume2 className="w-4 h-4" />
                                                Test Voice
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-3">Keyboard shortcuts</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">On the learning page:</p>
                                    <ul className="text-sm text-gray-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                                        <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">→</kbd> Next step</li>
                                        <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">←</kbd> Previous step</li>
                                        <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Space</kbd> Pause / Resume (when not typing)</li>
                                    </ul>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Shortcuts are disabled when typing in chat or inputs.</p>
                                </div>
                            </div>
                        )}

                        {/* AI Tutor Settings */}
                        {activeTab === 'ai' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">AI Tutor Configuration</h2>

                                <div className="grid gap-4">
                                    {/* Redundant personality select removed - managed in Learning tab */}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Response Style</label>
                                        <select
                                            value={settings.aiTutor.responseStyle}
                                            onChange={(e) => updateAiTutor({ responseStyle: e.target.value as 'concise' | 'detailed' | 'interactive' | 'adaptive' })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                        >
                                            <option value="concise">Concise</option>
                                            <option value="detailed">Detailed</option>
                                            <option value="interactive">Interactive</option>
                                            <option value="adaptive">Adaptive</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">AI Model</label>
                                        <select
                                            value={settings.aiTutor.preferredAiModel ?? 'llama'}
                                            onChange={(e) => updateAiTutor({ preferredAiModel: e.target.value as 'llama' | 'mistral' })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                        >
                                            <option value="llama">LLaMA (fast)</option>
                                            <option value="mistral">Mistral (detailed)</option>
                                        </select>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Used for chat, doubt resolution, notes, mind maps, and flashcards.</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { key: 'analogiesEnabled', label: 'Use Analogies' },
                                        ].map((item) => (
                                            <label key={item.key} className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-slate-300">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.aiTutor[item.key as keyof typeof settings.aiTutor] as boolean}
                                                    onChange={(e) => updateAiTutor({ [item.key]: e.target.checked })}
                                                    className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Privacy Settings */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Privacy & Data</h2>

                                <div className="space-y-3">
                                    {[
                                        { key: 'analyticsEnabled', label: 'Enable Analytics', desc: 'Help us improve by sharing usage data' },
                                        { key: 'errorReportingEnabled', label: 'Error Reports', desc: 'Send minimal error reports (no personal data) to help fix bugs and improve stability' },
                                        { key: 'shareProgress', label: 'Share Progress', desc: 'Allow exporting or sharing your learning progress summary' },
                                    ].map((item) => (
                                        <label key={item.key} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                            <div>
                                                <span className="font-medium text-gray-800 dark:text-slate-100">{item.label}</span>
                                                <p className="text-sm text-gray-500 dark:text-slate-400">{item.desc}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.privacy[item.key as keyof typeof settings.privacy] as boolean}
                                                onChange={(e) => updatePrivacy({ [item.key]: e.target.checked })}
                                                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400 mt-1"
                                            />
                                        </label>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm">
                                    <a href={TERMS_OF_SERVICE_URL} className="text-purple-600 dark:text-purple-400 hover:underline">Terms of Service</a>
                                    <a href={PRIVACY_POLICY_URL} className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</a>
                                </div>

                                <ShareProgressBlock />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Data Retention (months)</label>
                                    <select
                                        value={settings.privacy.dataRetentionMonths}
                                        onChange={(e) => updatePrivacy({ dataRetentionMonths: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                                    >
                                        <option value="6">6 months</option>
                                        <option value="12">12 months</option>
                                        <option value="24">24 months</option>
                                        <option value="36">36 months</option>
                                    </select>
                                </div>

                                {/* Clear cache / local data */}
                                <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">Clear cache & local data</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                        Clear app cache and local storage (e.g. draft text, offline data). Use this if the app feels stuck or after an update. Your account data is not removed.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                if ('caches' in window) {
                                                    const names = await caches.keys();
                                                    await Promise.all(names.map((n) => caches.delete(n)));
                                                }
                                                const keysToRemove: string[] = [];
                                                for (let i = 0; i < localStorage.length; i++) {
                                                    const k = localStorage.key(i);
                                                    if (k?.startsWith('aira-doubt-draft-')) keysToRemove.push(k);
                                                }
                                                keysToRemove.forEach((k) => localStorage.removeItem(k));
                                                toast.success('Cache and local drafts cleared. Reload the page if needed.');
                                            } catch {
                                                toast.error('Failed to clear cache.');
                                            }
                                        }}
                                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Clear cache
                                    </button>
                                </div>

                                {/* Bulk export all notes */}
                                <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">Export all notes</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                        Download all your study notes as a single JSON file. You can keep it as a backup or open it in another app.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const payload = { exportedAt: new Date().toISOString(), notes };
                                            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `aira-notes-export-${new Date().toISOString().slice(0, 10)}.json`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                            toast.success(notes.length ? `Exported ${notes.length} note(s).` : 'No notes to export.');
                                        }}
                                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Export all notes
                                    </button>
                                </div>

                                {/* Export & Delete (GDPR-style) */}
                                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-slate-700 space-y-4">
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        Data & account
                                    </h3>
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-3">
                                        <p className="text-sm text-gray-600 dark:text-slate-300">
                                            Export all your data (profile, sessions, notes, doubts, flashcards, mind maps) or permanently delete your account and all associated data.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                disabled={exportLoading || !user?.id}
                                                onClick={async () => {
                                                    if (!user?.id || exportLoading) return;
                                                    setExportLoading(true);
                                                    try {
                                                        const data = await exportAllUserData(user.id);
                                                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `aira-export-${new Date().toISOString().slice(0, 10)}.json`;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                        toast.success('Export downloaded.');
                                                    } catch (e) {
                                                        console.error(e);
                                                        toast.error('Export failed. Please try again.');
                                                    } finally {
                                                        setExportLoading(false);
                                                    }
                                                }}
                                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50"
                                            >
                                                <Database className="w-4 h-4" />
                                                {exportLoading ? 'Exporting...' : 'Export my data'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deleteAccountLoading || !user?.id}
                                                onClick={() => { setShowDeleteModal(true); setDeleteAccountConfirm(''); setDeleteReauthCompleted(false); setDeleteReauthPassword(''); }}
                                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete account
                                            </button>
                                        </div>
                                    </div>

                                    {showDeleteModal && (
                                        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl space-y-3">
                                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                                This will permanently delete all your data (sessions, notes, doubts, flashcards, mind maps, profile) and sign you out. This cannot be undone.
                                            </p>
                                            {!deleteReauthCompleted ? (
                                                <>
                                                    <p className="text-sm text-red-700 dark:text-red-300">
                                                        Re-enter your password to confirm it&apos;s you.
                                                    </p>
                                                    {user?.authMethod === 'email' ? (
                                                        <>
                                                            <PasswordField
                                                                value={deleteReauthPassword}
                                                                onChange={setDeleteReauthPassword}
                                                                placeholder="Your password"
                                                            />
                                                            <button
                                                                type="button"
                                                                disabled={deleteReauthLoading || !deleteReauthPassword}
                                                                onClick={async () => {
                                                                    setDeleteReauthLoading(true);
                                                                    const { error } = await reauthenticateForSensitiveAction(deleteReauthPassword);
                                                                    setDeleteReauthLoading(false);
                                                                    if (error) {
                                                                        toast.error(error.message || 'Re-authentication failed');
                                                                        return;
                                                                    }
                                                                    setDeleteReauthCompleted(true);
                                                                    setDeleteReauthPassword('');
                                                                }}
                                                                className="px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                            >
                                                                {deleteReauthLoading ? 'Verifying...' : 'Continue'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={deleteReauthLoading}
                                                            onClick={async () => {
                                                                setDeleteReauthLoading(true);
                                                                const { error } = await reauthenticateForSensitiveAction();
                                                                setDeleteReauthLoading(false);
                                                                if (error) {
                                                                    toast.error(error.message || 'Re-authentication failed');
                                                                    return;
                                                                }
                                                                setDeleteReauthCompleted(true);
                                                            }}
                                                            className="px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            {deleteReauthLoading ? 'Opening sign-in...' : 'Re-sign in to confirm'}
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-red-700 dark:text-red-300">
                                                        Type <strong>DELETE</strong> below to confirm.
                                                    </p>
                                                    <input
                                                        type="text"
                                                        value={deleteAccountConfirm}
                                                        onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                                                        placeholder="Type DELETE"
                                                        className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-slate-900 text-red-900 dark:text-red-100 placeholder-gray-400"
                                                    />
                                                </>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowDeleteModal(false); setDeleteAccountConfirm(''); setDeleteReauthCompleted(false); setDeleteReauthPassword(''); }}
                                                    className="px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                                                >
                                                    Cancel
                                                </button>
                                                {deleteReauthCompleted && (
                                                    <button
                                                        type="button"
                                                        disabled={deleteAccountLoading || deleteAccountConfirm !== 'DELETE'}
                                                        onClick={async () => {
                                                            if (deleteAccountConfirm !== 'DELETE' || !user?.id || deleteAccountLoading) return;
                                                            setDeleteAccountLoading(true);
                                                            try {
                                                                await deleteAllUserData(user.id);
                                                                await logout();
                                                                navigate('/login', { replace: true });
                                                                toast.success('Account and data deleted.');
                                                            } catch (e) {
                                                                console.error(e);
                                                                toast.error('Failed to delete account. Please try again.');
                                                            } finally {
                                                                setDeleteAccountLoading(false);
                                                                setShowDeleteModal(false);
                                                                setDeleteAccountConfirm('');
                                                                setDeleteReauthCompleted(false);
                                                            }
                                                        }}
                                                        className="px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {deleteAccountLoading ? 'Deleting...' : 'Delete my account'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* About: version & changelog */}
                        {activeTab === 'about' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-purple-500" />
                                    About AIra
                                </h2>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-3">
                                    <p className="text-sm text-gray-700 dark:text-slate-200">
                                        <strong>Version</strong> {APP_VERSION}
                                        {APP_BUILD && <span className="text-gray-500 dark:text-slate-400"> ({APP_BUILD})</span>}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                        Your intelligent learning companion. Curriculum-aligned lessons, AI chat, notes, flashcards, and mind maps.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-2">What&apos;s new</h3>
                                    <ul className="text-sm text-gray-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                                        <li>Regenerate AI response and thumbs up/down feedback in Chat</li>
                                        <li>Edit last message and Resend in Chat</li>
                                        <li>In-session TTS speed (0.75×, 1×, 1.25×) on Teaching page</li>
                                        <li>Fullscreen and step picker for lessons</li>
                                        <li>Curriculum filter by progress and sort options</li>
                                        <li>Confirm before deleting notes, flashcards, mind maps</li>
                                        <li>Shuffle option for flashcards</li>
                                        <li>About and legal links (Terms of Service, Privacy Policy)</li>
                                    </ul>
                                </div>
                                <InstallAppBlock />
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mb-2">Onboarding tour</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Show the welcome walkthrough again on the home screen.</p>
                                    <button
                                        type="button"
                                        onClick={() => { clearOnboardingTourDone(); navigate('/?tour=1'); }}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        <Compass className="w-4 h-4" /> Show tour again
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <a href={TERMS_OF_SERVICE_URL} className="text-purple-600 dark:text-purple-400 hover:underline">Terms of Service</a>
                                    <a href={PRIVACY_POLICY_URL} className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</a>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main >
            </div >
        </div >
    );
}
