import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import {
    ArrowLeft, Mail, MapPin, Calendar, Award, Target,
    Clock, Flame, BookOpen, Star, Edit2, TrendingUp, Settings
} from 'lucide-react';
import PageTransition from '../components/common/PageTransition';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { profile } = useUserStore();
    const { metrics, achievements } = useAnalyticsStore();

    const stats = [
        { icon: Clock, label: 'Learning Hours', value: metrics.totalHours, color: 'text-blue-500', bg: 'bg-blue-50' },
        { icon: BookOpen, label: 'Topics Completed', value: metrics.topicsCompleted, color: 'text-green-500', bg: 'bg-green-50' },
        { icon: Flame, label: 'Current Streak', value: `${metrics.streakDays} days`, color: 'text-orange-500', bg: 'bg-orange-50' },
        { icon: TrendingUp, label: 'Avg. Quiz Score', value: `${metrics.averageQuizScore}%`, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* Header */}
            <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Profile</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                            <BookOpen className="w-4 h-4" />
                            Continue Learning
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Resume Button */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                    aria-label="Continue Learning"
                >
                    <BookOpen className="w-6 h-6" />
                </button>
            </div>

            <PageTransition className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                {/* Profile Card - Responsive */}
                <motion.div
                    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-start gap-4 sm:gap-6">
                        {/* Avatar - Responsive */}
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-lg">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <button
                                className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                                aria-label="Edit profile"
                            >
                                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Info - Responsive */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-100 truncate">{user?.name || 'User'}</h2>
                            <p className="text-purple-600 dark:text-purple-300 font-medium text-sm sm:text-base truncate">
                                {profile?.profession?.name || 'No profession selected'}
                                {profile?.subProfession && profile?.profession?.subProfessions &&
                                    ` • ${profile.profession.subProfessions.find(s => s.id === profile.subProfession)?.name || ''}`
                                }
                            </p>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {user?.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {profile?.timezone || 'Not set'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/settings')}
                            className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-slate-300 font-medium"
                        >
                            Edit Profile
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                        >
                            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">{stat.value}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Weekly Activity Chart */}
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        Weekly Activity
                    </h3>

                    <div className="flex items-end justify-between h-40 gap-2">
                        {(metrics.weeklyHours && Array.isArray(metrics.weeklyHours) ? metrics.weeklyHours : Array(7).fill(0)).map((hours, index) => {
                            const weeklyHoursArray = (metrics.weeklyHours && Array.isArray(metrics.weeklyHours)) ? metrics.weeklyHours : [];
                            const maxHours = weeklyHoursArray.length > 0 ? Math.max(...weeklyHoursArray, 2) : 2; // At least 2h scale
                            const heightPercentage = maxHours > 0 ? (hours / maxHours) * 100 : 0;
                            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative h-full flex items-end justify-center">
                                        <motion.div
                                            className="w-full max-w-[2rem] bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPercentage}%` }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {hours}h
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">{days[index]}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Learning Style */}
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        Learning Style
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        {[
                            { label: 'Visual', value: profile?.learningStyle?.visual || 70, color: 'bg-blue-500' },
                            { label: 'Auditory', value: profile?.learningStyle?.auditory || 20, color: 'bg-green-500' },
                            { label: 'Kinesthetic', value: profile?.learningStyle?.kinesthetic || 10, color: 'bg-orange-500' },
                        ].map((style) => (
                            <div key={style.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">{style.label}</span>
                                    <span className="font-medium text-gray-800">{style.value}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`${style.color} h-2 rounded-full transition-all`}
                                        style={{ width: `${style.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex gap-4 text-sm">
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full">
                            Pace: {profile?.learningStyle?.preferredPace || 'Normal'}
                        </span>
                        <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full">
                            Interactivity: {profile?.learningStyle?.interactivityLevel || 'Medium'}
                        </span>
                    </div>
                </motion.div>

                {/* Available Topics */}
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                            Continue Learning
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { id: 'ecg-basics', name: 'ECG Basics', duration: '30 min', difficulty: 'beginner', progress: 0 },
                            { id: 'heart-anatomy', name: 'Heart Anatomy', duration: '45 min', difficulty: 'beginner', progress: 0 },
                            { id: 'arrhythmias', name: 'Arrhythmias', duration: '60 min', difficulty: 'intermediate', progress: 0 },
                            { id: 'cardiac-drugs', name: 'Cardiac Pharmacology', duration: '50 min', difficulty: 'advanced', progress: 0 },
                        ].map((topic, index) => (
                            <motion.div
                                key={topic.id}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate(`/learn/${topic.id}`)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                                whileHover={{ y: -4 }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-purple-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                                {topic.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{topic.duration}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${topic.difficulty === 'beginner' ? 'bg-green-100 text-green-600' :
                                                    topic.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                    {topic.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
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

                {/* Achievements */}
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-500" />
                        Achievements
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${achievement.unlockedAt
                                    ? 'border-purple-200 bg-purple-50'
                                    : 'border-gray-200 bg-gray-50 opacity-60'
                                    }`}
                            >
                                <span className="text-2xl">{achievement.icon}</span>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{achievement.name}</p>
                                    <p className="text-xs text-gray-500">{achievement.description}</p>
                                    {!achievement.unlockedAt && (
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-purple-500 h-full rounded-full"
                                                style={{ width: `${(achievement.progress || 0) / (achievement.target || 1) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                {achievement.unlockedAt && (
                                    <Star className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </PageTransition>
        </div >
    );
}
