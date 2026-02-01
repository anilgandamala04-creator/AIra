import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import {
    BookOpen, Brain, Settings, User, LogOut,
    Play, Clock, Sparkles, GraduationCap
} from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { toast } from '../stores/toastStore';

// Sample topics for the selected profession
const sampleTopics = [
    { id: 'ecg-basics', name: 'ECG Basics', duration: '30 min', difficulty: 'beginner', progress: 0 },
    { id: 'heart-anatomy', name: 'Heart Anatomy', duration: '45 min', difficulty: 'beginner', progress: 0 },
    { id: 'arrhythmias', name: 'Arrhythmias', duration: '60 min', difficulty: 'intermediate', progress: 0 },
    { id: 'cardiac-drugs', name: 'Cardiac Pharmacology', duration: '50 min', difficulty: 'advanced', progress: 0 },
];

export default function DashboardPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { profile } = useUserStore();

    const handleLogout = () => {
        logout();
        toast.info('You have been logged out');
        navigate('/login');
    };

    const handleStartTopic = (topicId: string) => {
        navigate(`/learn/${topicId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            <main id="main-content" tabIndex={-1}>
                {/* Header - Responsive */}
                <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-sm sticky top-0 z-50 safe-top">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg sm:text-xl text-gray-800 dark:text-slate-100">AI Tutor</span>
                        </div>

                        <nav className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-gray-500 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                aria-label="Settings"
                            >
                                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="p-2 text-gray-500 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                aria-label="Profile"
                            >
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-500 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                aria-label="Logout"
                            >
                                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </nav>
                    </div>
                </header>

                <PageTransition className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                    {/* Breadcrumbs - Responsive */}
                    <Breadcrumbs items={[{ label: 'Dashboard' }]} className="mb-3 sm:mb-4" />

                    {/* Welcome Section */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">
                            Welcome back, {user?.displayName || user?.name || 'Learner'}! 👋
                        </h1>
                        <p className="text-gray-600 dark:text-slate-300">
                            {profile?.profession?.name && profile?.subProfession ? (
                                <>Continue your journey in <span className="text-purple-600 font-medium">{profile.profession.name}</span></>
                            ) : (
                                'Ready to learn something new today?'
                            )}
                        </p>
                    </motion.div>

                    {/* Available Topics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-500" />
                                {t('selectTopic')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                            {sampleTopics.map((topic, index) => (
                                <motion.div
                                    key={topic.id}
                                    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer min-h-[120px] sm:min-h-[140px]"
                                    onClick={() => handleStartTopic(topic.id)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.05 }}
                                    whileHover={{ y: -4 }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && handleStartTopic(topic.id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shrink-0">
                                                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                                                    {topic.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 flex-wrap">
                                                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                                    <span className="whitespace-nowrap">{topic.duration}</span>
                                                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${topic.difficulty === 'beginner' ? 'bg-green-100 text-green-600' :
                                                        topic.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-600' :
                                                            'bg-red-100 text-red-600'
                                                        }`}>
                                                        {topic.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shrink-0"
                                            aria-label={`Start ${topic.name}`}
                                        >
                                            <Play className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                                            style={{ width: `${topic.progress}%` }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Actions - 2 Panel Layout */}
                    <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">
                            Quick Access
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Curriculum Panel */}
                            <button
                                onClick={() => navigate('/curriculum')}
                                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-emerald-950/40 dark:to-green-950/40 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-lg transition-all group text-left border border-green-200/50 dark:border-green-800/30"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">School Curriculum</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Browse Classes 1-12 with subjects, chapters, and topics.</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs">NCERT</span>
                                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs">All Subjects</span>
                                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs">Progress</span>
                                </div>
                            </button>
                            {/* Settings Panel */}
                            <button
                                onClick={() => navigate('/settings')}
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-lg transition-all group text-left"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Settings className="w-5 h-5 text-purple-500" />
                                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300">Settings</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Update your preferences, profession, and learning topics.</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs">Profession</span>
                                    <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs">Topics</span>
                                    <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs">AI Settings</span>
                                </div>
                            </button>

                            {/* Profile Panel */}
                            <button
                                onClick={() => navigate('/profile')}
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-lg transition-all group text-left"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-5 h-5 text-purple-500" />
                                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300">Profile</h3>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {(user?.displayName || user?.name || 'U')?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-slate-100">{user?.displayName || user?.name || 'Learner'}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{profile?.profession?.name || 'Set your profession'}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-purple-600 dark:text-purple-300 group-hover:text-purple-700 dark:group-hover:text-purple-200">View progress →</p>
                            </button>
                        </div>
                    </motion.div>
                    {/* ... other sections ... */}
                </PageTransition>
            </main>
        </div >
    );
}
