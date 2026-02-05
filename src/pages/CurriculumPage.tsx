/**
 * Learning Browser Page
 * 
 * Organizes all learning content under Professional Mode:
 * Profession → Sub-Profession → Subject → Topic
 * 
 * Features:
 * - Comprehensive coverage of all subjects and topics
 * - Dynamic navigation with breadcrumbs
 * - Progress tracking per topic
 * - Quick access to Studio panel resources
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    BookOpen,
    Search,
    Settings,
    Play,
    Clock,
    Briefcase,
    Layers,
    FileText,
    Brain,
    CreditCard,
    HelpCircle,
    User,
    GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../stores/settingsStore';
import { useUserStore } from '../stores/userStore';
import { useProfilePanelStore } from '../stores/profilePanelStore';
import { professions } from '../data/professions';
import { tapScale, springTransition, TRANSITION_DEFAULT, staggerContainer, staggerItem, hoverLift } from '../utils/animations';
import SkipToMainInHeader from '../components/common/SkipToMainInHeader';
import type { Profession, SubProfession, Subject } from '../types';

type ViewState = 'professions' | 'subProfessions' | 'subjects' | 'topics';

export default function CurriculumPage() {
    const navigate = useNavigate();
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));
    const profile = useUserStore(useShallow((state) => state.profile));
    
    // Selection state
    const [selectedProfession, setSelectedProfession] = useState<Profession | null>(
        profile?.profession ? professions.find(p => p.id === profile.profession?.id) || null : null
    );
    const [selectedSubProfession, setSelectedSubProfession] = useState<SubProfession | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    
    // Search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

    // Determine current view
    const getCurrentView = (): ViewState => {
        if (selectedSubject) return 'topics';
        if (selectedSubProfession) return 'subjects';
        if (selectedProfession) return 'subProfessions';
        return 'professions';
    };

    const currentView = getCurrentView();

    // Filter topics based on search
    const filteredTopics = useMemo(() => {
        if (!selectedSubject) return [];
        
        return selectedSubject.topics.filter(topic => {
            const matchesSearch = !searchQuery || 
                topic.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDifficulty = !difficultyFilter || 
                topic.difficulty === difficultyFilter;
            return matchesSearch && matchesDifficulty;
        });
    }, [selectedSubject, searchQuery, difficultyFilter]);

    const handleBack = () => {
        if (currentView === 'topics') {
            setSelectedSubject(null);
        } else if (currentView === 'subjects') {
            setSelectedSubProfession(null);
        } else if (currentView === 'subProfessions') {
            setSelectedProfession(null);
        } else {
            // Already at top level (professions view), no action needed
        }
    };

    const handleStartTopic = (topicId: string) => {
        navigate(`/learn/${topicId}`);
    };

    // Breadcrumb items
    const getBreadcrumbs = () => {
        const items: Array<{ label: string; onClick: () => void }> = [
            { label: 'Learning Paths', onClick: () => {
                setSelectedProfession(null);
                setSelectedSubProfession(null);
                setSelectedSubject(null);
            }}
        ];

        if (selectedProfession) {
            items.push({
                label: selectedProfession.name,
                onClick: () => {
                    setSelectedSubProfession(null);
                    setSelectedSubject(null);
                }
            });
        }

        if (selectedSubProfession) {
            items.push({
                label: selectedSubProfession.name,
                onClick: () => setSelectedSubject(null)
            });
        }

        if (selectedSubject) {
            items.push({
                label: selectedSubject.name,
                onClick: () => {}
            });
        }

        return items;
    };

    const breadcrumbs = getBreadcrumbs();

    // Get icon component based on string name
    const getIconComponent = (iconName: string) => {
        const icons: Record<string, React.ReactNode> = {
            'stethoscope': <Briefcase className="w-6 h-6" />,
            'cog': <Settings className="w-6 h-6" />,
            'scale': <Briefcase className="w-6 h-6" />,
            'briefcase': <Briefcase className="w-6 h-6" />,
            'flask': <Brain className="w-6 h-6" />,
            'palette': <Layers className="w-6 h-6" />,
            'monitor': <Settings className="w-6 h-6" />,
            'graduation': <BookOpen className="w-6 h-6" />,
            'graduation-cap': <GraduationCap className="w-6 h-6" />,
            'brain': <Brain className="w-6 h-6" />,
        };
        return icons[iconName] || <BookOpen className="w-6 h-6" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 safe-top flex items-center" style={{ minHeight: 'var(--layout-header-height)' }}>
                <SkipToMainInHeader />
                <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 flex-1">
                    <div className="flex items-center justify-between w-full" style={{ minHeight: 'var(--layout-header-height)' }}>
                        {/* Left side */}
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 overflow-hidden">
                            <motion.button
                                onClick={handleBack}
                                className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-ui touch-manipulation shrink-0"
                                whileHover={reduceAnimations ? undefined : { scale: 1.05 }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                                transition={springTransition}
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" aria-hidden />
                            </motion.button>

                            {/* Breadcrumbs */}
                            <nav className="flex items-center gap-1 text-sm min-w-0 overflow-hidden">
                                {breadcrumbs.map((item, index) => (
                                    <span key={index} className="flex items-center min-w-0">
                                        {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-1 shrink-0" />}
                                        <button
                                            onClick={item.onClick}
                                            className={`truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${
                                                index === breadcrumbs.length - 1
                                                    ? 'text-gray-900 dark:text-white font-medium'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    </span>
                                ))}
                            </nav>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2 shrink-0">
                            <motion.button
                                onClick={() => navigate('/settings')}
                                className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-ui touch-manipulation"
                                whileHover={reduceAnimations ? undefined : { scale: 1.05 }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                                transition={springTransition}
                            >
                                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </motion.button>
                            <motion.button
                                onClick={() => useProfilePanelStore.getState().open()}
                                className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-ui touch-manipulation"
                                whileHover={reduceAnimations ? undefined : { scale: 1.05 }}
                                whileTap={reduceAnimations ? undefined : tapScale}
                                transition={springTransition}
                            >
                                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </header>

            <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 min-w-0 overflow-x-hidden">
                <AnimatePresence mode="wait">
                    {/* Professions View */}
                    {currentView === 'professions' && (
                        <motion.div
                            key="professions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={TRANSITION_DEFAULT}
                        >
                            <div className="mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Choose Your Learning Path
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Select a professional field to explore subjects and topics
                                </p>
                            </div>

                            <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            >
                                {professions.map((profession) => (
                                    <motion.button
                                        key={profession.id}
                                        variants={staggerItem}
                                        onClick={() => setSelectedProfession(profession)}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all text-left group border border-gray-200 dark:border-gray-700"
                                        whileHover={reduceAnimations ? undefined : hoverLift}
                                        whileTap={reduceAnimations ? undefined : tapScale}
                                        style={{ borderLeftColor: profession.color, borderLeftWidth: '4px' }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div 
                                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: `${profession.color}20`, color: profession.color }}
                                            >
                                                {getIconComponent(profession.icon)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                    {profession.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {profession.description}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    {profession.subProfessions.length} specializations
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Sub-Professions View */}
                    {currentView === 'subProfessions' && selectedProfession && (
                        <motion.div
                            key="subProfessions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={TRANSITION_DEFAULT}
                        >
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div 
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: `${selectedProfession.color}20`, color: selectedProfession.color }}
                                    >
                                        {getIconComponent(selectedProfession.icon)}
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        {selectedProfession.name}
                                    </h1>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Choose a specialization to view subjects and topics
                                </p>
                            </div>

                            <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {selectedProfession.subProfessions.map((subProf) => (
                                    <motion.button
                                        key={subProf.id}
                                        variants={staggerItem}
                                        onClick={() => setSelectedSubProfession(subProf)}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all text-left group border border-gray-200 dark:border-gray-700"
                                        whileHover={reduceAnimations ? undefined : hoverLift}
                                        whileTap={reduceAnimations ? undefined : tapScale}
                                    >
                                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
                                            {subProf.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            {subProf.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                                            <span>{subProf.subjects.length} subjects</span>
                                            <span>{subProf.subjects.reduce((acc, s) => acc + s.topics.length, 0)} topics</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Subjects View */}
                    {currentView === 'subjects' && selectedSubProfession && (
                        <motion.div
                            key="subjects"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={TRANSITION_DEFAULT}
                        >
                            <div className="mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {selectedSubProfession.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {selectedSubProfession.description}
                                </p>
                            </div>

                            <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {selectedSubProfession.subjects.map((subject) => (
                                    <motion.button
                                        key={subject.id}
                                        variants={staggerItem}
                                        onClick={() => setSelectedSubject(subject)}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all text-left group border border-gray-200 dark:border-gray-700"
                                        whileHover={reduceAnimations ? undefined : hoverLift}
                                        whileTap={reduceAnimations ? undefined : tapScale}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {subject.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>{subject.topics.length} topics</span>
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Topics View */}
                    {currentView === 'topics' && selectedSubject && (
                        <motion.div
                            key="topics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={TRANSITION_DEFAULT}
                        >
                            <div className="mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {selectedSubject.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {selectedSubject.topics.length} topics available
                                </p>
                            </div>

                            {/* Search and Filter */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search topics..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setDifficultyFilter(difficultyFilter === level ? null : level)}
                                            className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 ${
                                                difficultyFilter === level
                                                    ? level === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : level === 'intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                            aria-pressed={difficultyFilter === level}
                                            aria-label={`Filter by ${level} difficulty`}
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Topics Grid */}
                            <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {filteredTopics.map((topic) => (
                                    <motion.div
                                        key={topic.id}
                                        variants={staggerItem}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all group border border-gray-200 dark:border-gray-700"
                                        whileHover={reduceAnimations ? undefined : hoverLift}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
                                                    {topic.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{topic.duration || `${topic.durationMinutes || 30} min`}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                        topic.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : topic.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {topic.difficulty || 'beginner'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-4">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                                                style={{ width: `${topic.progress}%` }}
                                            />
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2">
                                            <motion.button
                                                type="button"
                                                onClick={() => handleStartTopic(topic.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
                                                whileTap={reduceAnimations ? undefined : tapScale}
                                            >
                                                <Play className="w-4 h-4" />
                                                Start Learning
                                            </motion.button>
                                        </div>

                                        {/* Quick resource icons */}
                                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">Resources:</span>
                                            <div className="flex gap-2">
                                                <span title="Notes"><FileText className="w-4 h-4 text-gray-400 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300 cursor-pointer" /></span>
                                                <span title="Mind Map"><Brain className="w-4 h-4 text-gray-400 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300 cursor-pointer" /></span>
                                                <span title="Flashcards"><CreditCard className="w-4 h-4 text-gray-400 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300 cursor-pointer" /></span>
                                                <span title="Quiz"><HelpCircle className="w-4 h-4 text-gray-400 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300 cursor-pointer" /></span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {filteredTopics.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">No topics match your search criteria</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
