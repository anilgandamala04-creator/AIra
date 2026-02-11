import { useRef, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfilePanelStore } from '../../stores/profilePanelStore';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import {
    X, User, LogOut, LayoutDashboard, BookOpen
} from 'lucide-react';
import { overlayVariants, overlayTransition } from '../../utils/animations';
import DashboardView from './DashboardView';
import { findTopicInfo, formatTopicName } from '../../utils/topicUtils';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export default function ProfileSettingsPanel() {
    const navigate = useNavigate();
    const isOpen = useProfilePanelStore((s) => s.isOpen);
    const close = useProfilePanelStore((s) => s.close);
    const panelRef = useRef<HTMLElement>(null);

    useFocusTrap(panelRef, { initialFocus: true, active: isOpen });

    // Escape to close
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        },
        [close]
    );
    const { user, logout } = useAuthStore();
    const {
        profile,
        curriculumType,
        selectedBoard,
        selectedGrade,
        selectedExam,
        selectedSubject
    } = useUserStore();
    const settings = useSettingsStore(useShallow((state) => state.settings));
    const reduceAnimations = settings.accessibility.reduceAnimations;

    const handleLogout = async () => {
        close();
        await logout();
        navigate('/login');
    };


    // Dashboard view state - embedded within Profile panel
    // Dashboard is only accessible within Profile, not as a separate page
    const [showDashboard, setShowDashboard] = useState(false);

    const displayName = user?.displayName || user?.name || 'Learner';

    const curriculumDisplay = useMemo(() => {
        if (curriculumType === 'school') {
            return `${selectedGrade} (${selectedBoard})`;
        }
        if (curriculumType === 'competitive') {
            return selectedExam;
        }
        return null;
    }, [curriculumType, selectedBoard, selectedGrade, selectedExam]);

    const topicDisplayName = useMemo(() => {
        const topicId = profile?.currentTopic;
        if (!topicId) return null;
        const { topic } = findTopicInfo(topicId);
        return topic?.name ?? formatTopicName(topicId);
    }, [profile?.currentTopic]);


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 dark:bg-black/55 z-[100] safe-top safe-bottom"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={reduceAnimations ? { duration: 0 } : overlayTransition}
                        onClick={close}
                        aria-hidden
                    />
                    {/* Centered overlay panel: full width on small screens, max-w-md on larger */}
                    <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-0 sm:p-4 safe-top safe-bottom pointer-events-none">
                        <motion.aside
                            ref={panelRef}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Profile"
                            className="w-full max-w-md min-w-0 max-h-[85dvh] sm:max-h-[90dvh] bg-white dark:bg-slate-900 shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col pointer-events-auto overflow-hidden"
                            variants={reduceAnimations ? undefined : overlayVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={reduceAnimations ? { duration: 0 } : overlayTransition}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={handleKeyDown}
                        >
                            {/* Header */}
                            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100" id="profile-panel-title">
                                    {showDashboard ? 'Dashboard' : 'Profile'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={close}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-ui active:scale-[0.97] min-h-[44px] min-w-[44px]"
                                    aria-label="Close panel"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4">
                                {showDashboard ? (
                                    /* Dashboard View - Embedded within Profile panel */
                                    <DashboardView onBack={() => setShowDashboard(false)} />
                                ) : (
                                    /* Profile View */
                                    <div className="space-y-6">
                                        {/* Profile summary */}
                                        <section className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-800 dark:text-slate-100 truncate">
                                                        {displayName}
                                                    </p>
                                                    {curriculumDisplay && (
                                                        <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                                                            {curriculumDisplay}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => setShowDashboard(true)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-ui text-sm font-medium active:scale-[0.98] shadow-sm hover:shadow-md"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    View Dashboard
                                                </button>
                                            </div>
                                        </section>
                                        {/* Learning context */}
                                        <section className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-purple-500" />
                                                Learning Context
                                            </h3>
                                            <div className="text-sm text-gray-600 dark:text-slate-300">
                                                <span className="font-medium text-gray-800 dark:text-slate-100">Subject:</span>{' '}
                                                {selectedSubject ?? 'General'}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-slate-300">
                                                <span className="font-medium text-gray-800 dark:text-slate-100">Current topic:</span>{' '}
                                                {topicDisplayName ?? 'Not set'}
                                            </div>
                                            {curriculumType && (
                                                <div className="text-sm text-gray-600 dark:text-slate-300">
                                                    <span className="font-medium text-gray-800 dark:text-slate-100">Path:</span>{' '}
                                                    <span className="capitalize">{curriculumType}</span>
                                                </div>
                                            )}
                                        </section>

                                        {/* Logout */}
                                        <section className="border-t border-gray-200 dark:border-slate-700 pt-4">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-ui text-sm font-medium active:scale-[0.98]"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Log out
                                            </button>
                                        </section>
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
