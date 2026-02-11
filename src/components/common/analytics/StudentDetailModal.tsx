import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Target, TrendingUp, User } from 'lucide-react';
import { StudentAnalyticsDetail } from '../../../types';
import { DataChart } from './DataChart';

interface StudentDetailModalProps {
    student: StudentAnalyticsDetail | null;
    onClose: () => void;
}

export function StudentDetailModal({ student, onClose }: StudentDetailModalProps) {
    if (!student) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 pb-0 flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                        {student.name}
                                    </h2>
                                    {student.level && (
                                        <div className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black uppercase tracking-tighter">
                                            LVL {student.level}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">
                                    Grade {student.id.startsWith('s') ? '10' : student.id} • Section A
                                </p>
                                {student.totalXp !== undefined && (
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex-1 h-1.5 w-32 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (student.totalXp % 1000) / 10)}%` }} // Simple mock calculation
                                                className="h-full bg-purple-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                            {student.totalXp} XP
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Attendance</span>
                                </div>
                                <div className="text-xl font-black text-gray-900 dark:text-white">{student.attendance}%</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Last Active</span>
                                </div>
                                <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                    {new Date(student.lastActive).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                                    <Target className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Pattern</span>
                                </div>
                                <div className="text-xs font-bold text-purple-600 dark:text-purple-400 capitalize">
                                    {student.errorPattern}
                                </div>
                            </div>
                        </div>

                        {/* Score Trend */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Academic Performance Trend
                                </h3>
                                <span className="text-xs text-gray-400">+12% vs last month</span>
                            </div>
                            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                                <DataChart type="line" data={student.scoreTrend} color="#10b981" height={100} />
                            </div>
                        </div>

                        {/* Mastery Breakdown */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Topic Mastery</h3>
                            <div className="space-y-3">
                                {student.topicMastery.map((topic) => (
                                    <div key={topic.topicId} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-gray-700 dark:text-slate-300">{topic.name}</span>
                                            <span className={topic.score < 50 ? 'text-rose-500' : 'text-emerald-500'}>
                                                {topic.score}%
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${topic.score}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${topic.score < 50 ? 'bg-rose-500' : 'bg-emerald-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 pt-0 flex gap-3">
                        <button className="flex-1 py-4 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors">
                            Schedule Extra Class
                        </button>
                        <button className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                            View All Quizzes
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
