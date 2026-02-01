import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settingsStore';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import { professions } from '../data/professions';
import { toast } from '../stores/toastStore';
import {
    ArrowLeft, User, BookOpen, Eye, Bot, Shield, Download, Upload,
    Moon, Sun, Globe, Save, RotateCcw, Volume2
} from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import { getHumanVoiceScore, pickBestHumanVoice } from '../utils/voice';

type SettingsTab = 'account' | 'learning' | 'accessibility' | 'ai' | 'privacy';

export default function SettingsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        settings,
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
    } = useSettingsStore();
    const { profile, updateProfile } = useUserStore();
    const { logout } = useAuthStore();

    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    const [saved, setSaved] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                if (result) {
                    const success = importSettings(result);
                    if (success) {
                        toast.success('Settings imported successfully');
                        handleSave();
                    } else {
                        toast.error('Failed to import settings. Please check the file format.');
                    }
                }
            };
            reader.onerror = () => {
                toast.error('Failed to read file. Please try again.');
            };
            reader.readAsText(file);
            // Reset input to allow re-importing the same file
            e.target.value = '';
        }
    };

    const tabs = [
        { id: 'account', icon: User, label: t('account') },
        { id: 'learning', icon: BookOpen, label: t('learning') },
        { id: 'accessibility', icon: Eye, label: t('accessibility') },
        { id: 'ai', icon: Bot, label: t('aiTutor') },
        { id: 'privacy', icon: Shield, label: t('privacy') },
    ] as const;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* Header */}
            <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{t('settings')}</h1>

                    <div className="flex-1" />

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        <Save className="w-4 h-4" />
                        {saved ? 'Saved!' : t('save')}
                    </button>
                </div>
            </header>

            <PageTransition className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Mobile Tab Bar - Enhanced */}
                <div className="md:hidden flex gap-2 overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all min-h-[44px] ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white/80 dark:bg-slate-900/60 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                            aria-label={tab.label}
                        >
                            <tab.icon className="w-4 h-4 shrink-0" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-56 shrink-0">
                    <nav className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl shadow-sm p-2 sticky top-20">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Quick Actions */}
                    <div className="mt-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl shadow-sm p-4 space-y-2">
                        <button
                            onClick={handleExport}
                            className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export Settings
                        </button>
                        <label className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm cursor-pointer">
                            <Upload className="w-4 h-4" />
                            Import Settings
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                        <button
                            onClick={resetToDefaults}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset to Defaults
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl shadow-sm p-6 text-gray-800 dark:text-slate-100 dark:[&_label]:text-slate-200 dark:[&_p]:text-slate-300 dark:[&_span]:text-slate-200 dark:[&_h2]:text-slate-100 dark:[&_h3]:text-slate-100"
                    >
                        {/* Account Settings */}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Account Settings</h2>

                                <div className="grid gap-4">
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
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Notifications</label>
                                        <div className="space-y-3">
                                            {[
                                                { key: 'studyReminders', label: 'Study Reminders' },
                                                { key: 'goalAchievements', label: 'Goal Achievements' },
                                                { key: 'reviewReminders', label: 'Review Reminders' },
                                            ].map((item) => (
                                                <label key={item.key} className="flex items-center justify-between">
                                                    <span className="text-gray-600">{item.label}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                                                        onChange={(e) => updateNotifications({ [item.key]: e.target.checked })}
                                                        className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/login');
                                        }}
                                        className="w-full py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center border-2 border-red-600 rounded-full">
                                            <div className="w-2 h-0.5 bg-red-600"></div>
                                        </div>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Learning Settings */}
                        {activeTab === 'learning' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Learning Preferences</h2>

                                {/* Profession & Topic Settings */}
                                <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                                    <h3 className="font-medium text-purple-800">Profession & Topics</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                                        <select
                                            value={profile?.profession?.id || ''}
                                            onChange={(e) => {
                                                const prof = professions.find(p => p.id === e.target.value);
                                                if (prof) updateProfile({ profession: prof, subProfession: null });
                                            }}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        >
                                            {professions.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {profile?.profession && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Profession</label>
                                            <select
                                                value={profile?.subProfession || ''}
                                                onChange={(e) => updateProfile({ subProfession: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            >
                                                <option value="">Select Specialization</option>
                                                {profile.profession.subProfessions.map(sp => (
                                                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {profile?.subProfession && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                            <select
                                                value={profile?.subject || ''}
                                                onChange={(e) => updateProfile({ subject: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            >
                                                <option value="">Select Subject</option>
                                                {profile.profession?.subProfessions
                                                    .find(sp => sp.id === profile.subProfession)
                                                    ?.subjects.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

                                    {profile?.subject && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Topic</label>
                                            <select
                                                value={profile?.currentTopic || ''}
                                                onChange={(e) => updateProfile({ currentTopic: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            >
                                                <option value="">Select Topic</option>
                                                {profile.profession?.subProfessions
                                                    .find(sp => sp.id === profile.subProfession)
                                                    ?.subjects.find(s => s.id === profile.subject)
                                                    ?.topics.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

                                    <button className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                                        Update Preferences
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {templates.map((template) => (
                                            <button
                                                key={template.id}
                                                onClick={() => applyTemplate(template.id)}
                                                className="p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                                            >
                                                <p className="font-medium text-gray-800 text-sm">{template.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Accessibility Settings */}
                        {activeTab === 'accessibility' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Accessibility</h2>

                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                                        <select
                                            value={settings.accessibility.fontSize}
                                            onChange={(e) => updateAccessibility({ fontSize: e.target.value as 'small' | 'medium' | 'large' | 'xlarge' })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        >
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="xlarge">Extra Large</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { key: 'highContrast', label: 'High Contrast' },
                                            { key: 'reduceAnimations', label: 'Reduce Animations' },
                                            { key: 'textToSpeech', label: 'Text to Speech' },
                                        ].map((item) => (
                                            <label key={item.key} className="flex items-center justify-between">
                                                <span className="text-gray-600">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.accessibility[item.key as keyof typeof settings.accessibility] as boolean}
                                                    onChange={(e) => updateAccessibility({ [item.key]: e.target.checked })}
                                                    className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    {settings.accessibility.textToSpeech && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Voice</label>
                                                <select
                                                    value={settings.accessibility.ttsVoice}
                                                    onChange={(e) => updateAccessibility({ ttsVoice: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                                                <p className="text-xs text-gray-500 mt-1">
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
                                                    const utterance = new SpeechSynthesisUtterance(testText);

                                                    // Use same settings as teaching page
                                                    utterance.rate = Math.max(0.8, Math.min(1.2, settings.accessibility.ttsSpeed || 1.0));
                                                    utterance.pitch = 0.95; // Slightly lower for more natural sound
                                                    utterance.volume = 1.0;

                                                    if (settings.accessibility.ttsVoice) {
                                                        const voice = window.speechSynthesis.getVoices().find(v => v.name === settings.accessibility.ttsVoice);
                                                        if (voice) utterance.voice = voice;
                                                    } else {
                                                        // Auto-pick the most natural human voice available
                                                        const voices = window.speechSynthesis.getVoices();
                                                        const autoVoice = pickBestHumanVoice(voices, {
                                                            language: settings.language || 'en',
                                                        });
                                                        if (autoVoice) utterance.voice = autoVoice;
                                                    }

                                                    window.speechSynthesis.cancel();
                                                    window.speechSynthesis.speak(utterance);
                                                }}
                                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
                                            >
                                                <Volume2 className="w-4 h-4" />
                                                Test Voice
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* AI Tutor Settings */}
                        {activeTab === 'ai' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">AI Tutor Configuration</h2>

                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
                                        <select
                                            value={settings.aiTutor.personality}
                                            onChange={(e) => updateAiTutor({ personality: e.target.value as 'encouraging' | 'direct' | 'humorous' | 'formal' })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        >
                                            <option value="encouraging">Encouraging</option>
                                            <option value="direct">Direct</option>
                                            <option value="humorous">Humorous</option>
                                            <option value="formal">Formal</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Response Style</label>
                                        <select
                                            value={settings.aiTutor.responseStyle}
                                            onChange={(e) => updateAiTutor({ responseStyle: e.target.value as 'concise' | 'detailed' | 'interactive' | 'adaptive' })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        >
                                            <option value="concise">Concise</option>
                                            <option value="detailed">Detailed</option>
                                            <option value="interactive">Interactive</option>
                                            <option value="adaptive">Adaptive</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { key: 'analogiesEnabled', label: 'Use Analogies' },
                                            { key: 'clinicalExamplesEnabled', label: 'Include Clinical Examples' },
                                        ].map((item) => (
                                            <label key={item.key} className="flex items-center justify-between">
                                                <span className="text-gray-600">{item.label}</span>
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
                                        { key: 'shareProgress', label: 'Share Progress', desc: 'Allow sharing your learning progress' },
                                    ].map((item) => (
                                        <label key={item.key} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <span className="font-medium text-gray-800">{item.label}</span>
                                                <p className="text-sm text-gray-500">{item.desc}</p>
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Retention (months)</label>
                                    <select
                                        value={settings.privacy.dataRetentionMonths}
                                        onChange={(e) => updatePrivacy({ dataRetentionMonths: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    >
                                        <option value="6">6 months</option>
                                        <option value="12">12 months</option>
                                        <option value="24">24 months</option>
                                        <option value="36">36 months</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </PageTransition >
        </div >
    );
}
