import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    Play,
    CheckCircle2,
    Clock,
    BookOpen
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurriculumStore } from '../../stores/curriculumStore';
import type { Chapter, Topic } from '../../types';

interface ChapterListProps {
    onTopicSelect?: (topicId: string) => void;
}

const TopicItem = ({
    topic,
    gradeId,
    subjectId,
    isCompleted,
    onSelect
}: {
    topic: Topic;
    gradeId: string;
    subjectId: string;
    isCompleted: boolean;
    onSelect: () => void;
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/learn/${topic.id}?grade=${gradeId}&subject=${subjectId}`);
        onSelect();
    };

    const difficultyColors = {
        beginner: '#22c55e',
        intermediate: '#f59e0b',
        advanced: '#ef4444'
    };

    const difficultyColor = difficultyColors[topic.difficulty || 'beginner'];

    return (
        <motion.button
            onClick={handleClick}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200
                       group text-left"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.99 }}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                           ${isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                    <Play className="w-5 h-5 text-blue-500" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {topic.name}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {topic.duration || '30 min'}
                    </span>
                    <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                            backgroundColor: `${difficultyColor}15`,
                            color: difficultyColor
                        }}
                    >
                        {topic.difficulty || 'Beginner'}
                    </span>
                </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
        </motion.button>
    );
};

const ChapterAccordion = ({
    chapter,
    gradeId,
    subjectId,
    completedTopics,
    defaultOpen = false,
    onTopicSelect
}: {
    chapter: Chapter;
    gradeId: string;
    subjectId: string;
    completedTopics: string[];
    defaultOpen?: boolean;
    onTopicSelect: (topicId: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const completedCount = chapter.topics.filter(t => completedTopics.includes(t.id)).length;
    const progress = Math.round((completedCount / chapter.topics.length) * 100);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-4 p-5 bg-white dark:bg-gray-800 
                           hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.div>

                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                                       text-xs font-medium rounded-lg">
                            Chapter {chapter.chapterNumber}
                        </span>
                        {progress === 100 && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mt-1">
                        {chapter.name}
                    </h3>
                </div>

                <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {completedCount}/{chapter.topics.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Topics
                    </div>
                </div>
            </button>

            <div className="h-1 bg-gray-100 dark:bg-gray-700">
                <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 space-y-2 bg-gray-50/50 dark:bg-gray-900/50">
                            {chapter.topics.map((topic, idx) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <TopicItem
                                        topic={topic}
                                        gradeId={gradeId}
                                        subjectId={subjectId}
                                        isCompleted={completedTopics.includes(topic.id)}
                                        onSelect={() => onTopicSelect(topic.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function ChapterList({ onTopicSelect }: ChapterListProps) {
    const { selectedGrade, selectedSubject, getProgress } = useCurriculumStore();

    if (!selectedGrade || !selectedSubject) {
        return null;
    }

    const progress = getProgress(selectedGrade.id, selectedSubject.id);
    const completedTopics = progress?.completedTopics || [];
    const totalTopics = selectedSubject.chapters.reduce((sum, ch) => sum + ch.topics.length, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <motion.h2
                        className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                backgroundColor: `${selectedSubject.color}15`,
                                color: selectedSubject.color
                            }}
                        >
                            <BookOpen className="w-5 h-5" />
                        </div>
                        {selectedSubject.name}
                    </motion.h2>
                    <motion.p
                        className="text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {selectedSubject.chapters.length} Chapters • {totalTopics} Topics
                    </motion.p>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: selectedSubject.color }}>
                        {progress?.progressPercent || 0}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Complete
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {selectedSubject.chapters.map((chapter, idx) => (
                    <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <ChapterAccordion
                            chapter={chapter}
                            gradeId={selectedGrade.id}
                            subjectId={selectedSubject.id}
                            completedTopics={completedTopics}
                            defaultOpen={idx === 0}
                            onTopicSelect={(topicId) => onTopicSelect?.(topicId)}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
