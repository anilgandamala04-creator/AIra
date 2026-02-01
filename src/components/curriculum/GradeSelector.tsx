import { motion } from 'framer-motion';
import {
    GraduationCap,
    BookOpen,
    Star,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { useCurriculumStore } from '../../stores/curriculumStore';
import { schoolGrades } from '../../data/schoolCurriculum';
import type { SchoolGrade, GradeLevel } from '../../types';

interface GradeSelectorProps {
    onGradeSelect?: (gradeId: string) => void;
}

const levelConfig: Record<GradeLevel, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    'primary': {
        label: 'Primary',
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.1)',
        icon: <Sparkles className="w-4 h-4" />
    },
    'middle': {
        label: 'Middle School',
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        icon: <BookOpen className="w-4 h-4" />
    },
    'secondary': {
        label: 'Secondary',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.1)',
        icon: <Star className="w-4 h-4" />
    },
    'senior-secondary': {
        label: 'Senior Secondary',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: <GraduationCap className="w-4 h-4" />
    }
};

const GradeCard = ({ grade, onClick, progress }: { grade: SchoolGrade; onClick: () => void; progress: number }) => {
    const config = levelConfig[grade.level];

    return (
        <motion.button
            onClick={onClick}
            className="relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300
                       bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                       hover:border-transparent hover:shadow-xl dark:hover:shadow-2xl
                       group cursor-pointer"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                borderColor: 'transparent',
                boxShadow: `0 0 0 1px ${config.color}20`
            }}
        >
            {/* Background gradient */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `linear-gradient(135deg, ${config.bgColor} 0%, transparent 50%)`
                }}
            />

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700">
                <motion.div
                    className="h-full"
                    style={{ backgroundColor: config.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div
                        className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                            backgroundColor: config.bgColor,
                            color: config.color
                        }}
                    >
                        {config.icon}
                        {config.label}
                    </div>
                    <ChevronRight
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 
                                   transition-transform group-hover:translate-x-1"
                    />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {grade.name}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {grade.description}
                </p>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {grade.ageGroup}
                    </span>
                    <span className="text-xs font-medium" style={{ color: config.color }}>
                        {grade.subjects.length} Subjects
                    </span>
                </div>

                {progress > 0 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {progress}% Complete
                    </div>
                )}
            </div>
        </motion.button>
    );
};

export default function GradeSelector({ onGradeSelect }: GradeSelectorProps) {
    const { setSelectedGrade, getGradeProgress } = useCurriculumStore();

    const handleGradeClick = (gradeId: string) => {
        setSelectedGrade(gradeId);
        onGradeSelect?.(gradeId);
    };

    // Group grades by level
    const gradesByLevel = schoolGrades.reduce((acc, grade) => {
        if (!acc[grade.level]) acc[grade.level] = [];
        acc[grade.level].push(grade);
        return acc;
    }, {} as Record<GradeLevel, SchoolGrade[]>);

    const levelOrder: GradeLevel[] = ['primary', 'middle', 'secondary', 'senior-secondary'];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <motion.h1
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Select Your Class
                </motion.h1>
                <motion.p
                    className="text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    Choose your grade level to start learning
                </motion.p>
            </div>

            {/* Grades by level */}
            {levelOrder.map((level, levelIdx) => {
                const grades = gradesByLevel[level];
                if (!grades || grades.length === 0) return null;

                const config = levelConfig[level];

                return (
                    <motion.div
                        key={level}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: levelIdx * 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: config.bgColor }}
                            >
                                <span style={{ color: config.color }}>{config.icon}</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                {config.label}
                            </h2>
                            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {grades.map((grade, idx) => (
                                <motion.div
                                    key={grade.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: levelIdx * 0.1 + idx * 0.05 }}
                                >
                                    <GradeCard
                                        grade={grade}
                                        onClick={() => handleGradeClick(grade.id)}
                                        progress={getGradeProgress(grade.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
