import { create } from 'zustand';
import type { AppSettings, SettingsTemplate } from '../types';
import { useAuthStore } from './authStore';
import { updateUserSettingsWithOfflineQueue as syncSettingsToBackend } from '../services/backendWithOffline';
import { realTimeEvents, EVENTS } from '../utils/realTimeSync';
import { logAppEvent, ANALYTICS_EVENTS } from '../lib/analytics';

// Hydration flag to prevent toast notifications during initial load
let isHydrating = true;
setTimeout(() => { isHydrating = false; }, 1000);

interface SettingsStore {
    settings: AppSettings;
    templates: SettingsTemplate[];

    // Update settings
    updateSettings: (updates: Partial<AppSettings>) => void;
    updateNotifications: (updates: Partial<AppSettings['notifications']>) => void;
    updateAccessibility: (updates: Partial<AppSettings['accessibility']>) => void;
    updatePrivacy: (updates: Partial<AppSettings['privacy']>) => void;
    updateAiTutor: (updates: Partial<AppSettings['aiTutor']>) => void;

    // Templates
    applyTemplate: (templateId: string) => void;
    saveAsTemplate: (name: string, description: string) => void;
    deleteTemplate: (templateId: string) => void;

    // Export/Import
    exportSettings: () => string;
    importSettings: (json: string) => boolean;
    resetToDefaults: () => void;

    // Explicit sync
    forceSyncToBackend: () => void;
}

const defaultSettings: AppSettings = {
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    theme: 'light',
    accentColor: 'purple',

    notifications: {
        studyReminders: true,
        reminderTime: '19:00',
        goalAchievements: true,
        reviewReminders: true,
        emailDigest: 'daily',
        dailyStudyGoalMinutes: 20,
    },

    accessibility: {
        fontSize: 'medium',
        fontFamily: 'system',
        lineSpacing: 'default',
        highContrast: false,
        reduceAnimations: false,
        textToSpeech: true,
        ttsSpeed: 1.0,
        ttsVoice: '',
    },

    privacy: {
        analyticsEnabled: true,
        errorReportingEnabled: false,
        shareProgress: false,
        dataRetentionMonths: 24,
    },

    aiTutor: {
        personality: 'encouraging',
        responseStyle: 'detailed',
        analogiesEnabled: true,
        preferredAiModel: 'llama',
    },

    quiz: {
        showCorrectAnswer: 'after_each' as const,
    },
};

const builtInTemplates: SettingsTemplate[] = [
    {
        id: 'beginner',
        name: 'Beginner Friendly',
        description: 'Slower pace with more detailed explanations',
        isBuiltIn: true,
        settings: {
            aiTutor: {
                personality: 'encouraging',
                responseStyle: 'detailed',
                analogiesEnabled: true,
            },
        },
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Focused and efficient learning',
        isBuiltIn: true,
        settings: {
            aiTutor: {
                personality: 'direct',
                responseStyle: 'concise',
                analogiesEnabled: false,
            },
        },
    },
    {
        id: 'accessible',
        name: 'High Accessibility',
        description: 'Enhanced accessibility features',
        isBuiltIn: true,
        settings: {
            accessibility: {
                fontSize: 'large',
                fontFamily: 'system',
                lineSpacing: 'comfortable',
                highContrast: true,
                reduceAnimations: true,
                textToSpeech: true,
                ttsSpeed: 0.9,
                ttsVoice: 'default',
            },
        },
    },
];

function syncSettingsIfLoggedIn(showToast = false) {
    const { user, isGuest } = useAuthStore.getState();
    if (user?.id && !isGuest) {
        syncSettingsToBackend(user.id, useSettingsStore.getState().settings)
            .then(() => {
                if (showToast && !isHydrating) {
                    // Import toast dynamically to avoid circular dependency
                    import('./toastStore').then(({ toast }) => {
                        toast.success('Settings saved');
                    });
                }
            })
            .catch((e: Error) => console.error('Backend sync settings:', e));
    }
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
    settings: defaultSettings,
    templates: builtInTemplates,

    updateSettings: (updates) => {
        set((state) => {
            const newSettings = { ...state.settings, ...updates };
            // Emit real-time events immediately for instant UI updates
            if (updates.theme && updates.theme !== state.settings.theme) {
                realTimeEvents.emit(EVENTS.THEME_CHANGE, updates.theme);
            }
            if (updates.language && updates.language !== state.settings.language) {
                realTimeEvents.emit(EVENTS.LANGUAGE_CHANGE, updates.language);
            }
            if (updates.accessibility && updates.accessibility !== state.settings.accessibility) {
                realTimeEvents.emit(EVENTS.ACCESSIBILITY_CHANGE, updates.accessibility);
            }
            realTimeEvents.emit(EVENTS.SETTINGS_UPDATE, newSettings);
            return { settings: newSettings };
        });
        logAppEvent(ANALYTICS_EVENTS.SETTINGS_CHANGED);
        syncSettingsIfLoggedIn();
    },

    updateNotifications: (updates) => {
        set((state) => {
            const newSettings = {
                ...state.settings,
                notifications: { ...state.settings.notifications, ...updates },
            };
            realTimeEvents.emit(EVENTS.SETTINGS_UPDATE, newSettings);
            return { settings: newSettings };
        });
        syncSettingsIfLoggedIn();
    },

    updateAccessibility: (updates) => {
        set((state) => {
            const newSettings = {
                ...state.settings,
                accessibility: { ...state.settings.accessibility, ...updates },
            };
            realTimeEvents.emit(EVENTS.ACCESSIBILITY_CHANGE, newSettings.accessibility);
            realTimeEvents.emit(EVENTS.SETTINGS_UPDATE, newSettings);
            return { settings: newSettings };
        });
        syncSettingsIfLoggedIn();
    },

    updatePrivacy: (updates) => {
        set((state) => {
            const newSettings = {
                ...state.settings,
                privacy: { ...state.settings.privacy, ...updates },
            };
            realTimeEvents.emit(EVENTS.SETTINGS_UPDATE, newSettings);
            return { settings: newSettings };
        });
        syncSettingsIfLoggedIn();
    },

    updateAiTutor: (updates) => {
        set((state) => {
            const newSettings = {
                ...state.settings,
                aiTutor: { ...state.settings.aiTutor, ...updates },
            };
            realTimeEvents.emit(EVENTS.SETTINGS_UPDATE, newSettings);
            return { settings: newSettings };
        });
        syncSettingsIfLoggedIn();
    },

    applyTemplate: (templateId) => {
        const template = get().templates.find(t => t.id === templateId);
        if (template) {
            const ts = template.settings ?? {};
            set((state) => {
                const newSettings = {
                    ...state.settings,
                    ...ts,
                    notifications: { ...state.settings.notifications, ...(ts.notifications ?? {}) },
                    accessibility: { ...state.settings.accessibility, ...(ts.accessibility ?? {}) },
                    privacy: { ...state.settings.privacy, ...(ts.privacy ?? {}) },
                    aiTutor: { ...state.settings.aiTutor, ...(ts.aiTutor ?? {}) as Partial<AppSettings['aiTutor']> },
                };
                if (newSettings.theme !== state.settings.theme) realTimeEvents.emit(EVENTS.THEME_CHANGE, newSettings.theme);
                if (newSettings.language !== state.settings.language) realTimeEvents.emit(EVENTS.LANGUAGE_CHANGE, newSettings.language);
                if (newSettings.accessibility !== state.settings.accessibility) realTimeEvents.emit(EVENTS.ACCESSIBILITY_CHANGE, newSettings.accessibility);
                realTimeEvents.emit(EVENTS.SETTINGS_UPDATE, newSettings);
                return { settings: newSettings };
            });
            syncSettingsIfLoggedIn();
        }
    },

    saveAsTemplate: (name, description) => set((state) => ({
        templates: [
            ...state.templates,
            {
                id: 'custom_' + Date.now(),
                name,
                description,
                isBuiltIn: false,
                settings: state.settings,
            },
        ],
    })),

    deleteTemplate: (templateId) => set((state) => ({
        templates: state.templates.filter(t => t.id !== templateId || t.isBuiltIn),
    })),

    exportSettings: () => JSON.stringify(get().settings, null, 2),

    importSettings: (json) => {
        try {
            const imported = JSON.parse(json) as AppSettings;
            const newSettings = { ...defaultSettings, ...imported };
            set({ settings: newSettings });
            realTimeEvents.emit(EVENTS.THEME_CHANGE, newSettings.theme);
            realTimeEvents.emit(EVENTS.LANGUAGE_CHANGE, newSettings.language);
            realTimeEvents.emit(EVENTS.ACCESSIBILITY_CHANGE, newSettings.accessibility);
            realTimeEvents.emit(EVENTS.SETTINGS_UPDATE, newSettings);
            syncSettingsIfLoggedIn();
            return true;
        } catch {
            return false;
        }
    },

    resetToDefaults: () => {
        set({ settings: defaultSettings });
        realTimeEvents.emit(EVENTS.THEME_CHANGE, defaultSettings.theme);
        realTimeEvents.emit(EVENTS.LANGUAGE_CHANGE, defaultSettings.language);
        realTimeEvents.emit(EVENTS.ACCESSIBILITY_CHANGE, defaultSettings.accessibility);
        realTimeEvents.emit(EVENTS.SETTINGS_UPDATE, defaultSettings);
        syncSettingsIfLoggedIn();
    },

    forceSyncToBackend: () => {
        syncSettingsIfLoggedIn(true);
    },
})
);
