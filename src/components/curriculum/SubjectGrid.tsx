import { motion } from 'framer-motion';
import {
    BookOpen,
    Calculator,
    FlaskConical,
    Globe,
    Languages,
    Palette,
    Monitor,
    Code,
    Atom,
    Dna,
    Leaf,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';
import { useCurriculumStore } from '../../stores/curriculumStore';
import type { SchoolSubject } from '../../types';

interface SubjectGridProps {
    onSubjectSelect?: (subjectId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
    'book-open': <BookOpen className="w-6 h-6" />,
    'calculator': <Calculator className="w-6 h-6" />,
    'flask': <FlaskConical className="w-6 h-6" />,
    'globe': <Globe className="w-6 h-6" />,
    'languages': <Languages className="w-6 h-6" />,
    'palette': <Palette className="w-6 h-6" />,
    'monitor': <Monitor className="w-6 h-6" />,
    'code': <Code className="w-6 h-6" />,
    'atom': <Atom className="w-6 h-6" />,
    'dna': <Dna className="w-6 h-6" />,
    'leaf': <Leaf className="w-6 h-6" />,
};

const SubjectCard = ({
    subject,
    onClick,
    progress
}: {
    subject: SchoolSubject;
    onClick: () => void;
    progress: number;
}) => {
    const icon = iconMap[subject.icon] || <BookOpen className="w-6 h-6" />;
    const totalTopics = subject.chapters.reduce((sum, ch) => sum + ch.topics.length, 0);
    const isComplete = progress >= 100;

    return (
        <motion.button
            onClick={onClick}
            className="relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                       bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                       hover:shadow-xl dark:hover:shadow-2xl group cursor-pointer"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Background accent */}
            <div
                className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-8 -translate-y-8"
                style={{
                    background: `radial-gradient(circle, ${subject.color} 0%, transparent 70%)`
                }}
            />

            {/* Completion badge */}
            {isComplete && (
                <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
            )}

            {/* Icon */}
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{
                    backgroundColor: `${subject.color}15`,
                    color: subject.color
                }}
            >
                {icon}
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                {subject.name}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {subject.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">
                    {subject.chapters.length} Chapters • {totalTopics} Topics
                </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-medium" style={{ color: subject.color }}>
                        {progress}%
                    </span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: subject.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    />
                </div>
            </div>
        </motion.button>
    );
};

export default function SubjectGrid({ onSubjectSelect }: SubjectGridProps) {
    const { selectedGrade, setSelectedSubject, getProgress } = useCurriculumStore();

    if (!selectedGrade) {
        return null;
    }

    const handleSubjectClick = (subjectId: string) => {
        setSelectedSubject(subjectId);
        onSubjectSelect?.(subjectId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <motion.h2
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {selectedGrade.name} Subjects
                </motion.h2>
                <motion.p
                    className="text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {selectedGrade.description} • {selectedGrade.ageGroup}
                </motion.p>
            </div>

            {/* Subject grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedGrade.subjects.map((subject, idx) => {
                    const progress = getProgress(selectedGrade.id, subject.id);
                    return (
                        <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <SubjectCard
                                subject={subject}
                                onClick={() => handleSubjectClick(subject.id)}
                                progress={progress?.progressPercent || 0}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
