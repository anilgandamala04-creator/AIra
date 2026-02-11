import { useState, useMemo, type CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    BookOpen,
    Search,
    Settings,
    Clock,
    FileText,
    Brain,
    CreditCard,
    HelpCircle,
    User,
    RefreshCw,
    Shield, Scale, Palette, Building2, Microscope, Calculator, Globe, Code, School, Zap, Layers, TrendingUp, Activity,
    Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { useProfilePanelStore } from '../stores/profilePanelStore';
import { useTeachingSessions } from '../hooks/useBackend';
import NotificationCenter from '../components/common/NotificationCenter';
import type { TeachingSession as TeachingSessionType } from '../types';
import { getSubjectsForContext, BOARD_EXAM_ICONS, SUBJECT_ICONS } from '../data/curriculumData';
import type { Subject, Topic } from '../types';
import { staggerContainer, staggerItem } from '../utils/animations';
import SkipToMainInHeader from '../components/common/SkipToMainInHeader';
import GlobalSearch from '../components/common/GlobalSearch';
import { SkeletonListItem } from '../components/common/Skeleton';
import LearningPathGraph from '../components/common/LearningPathGraph';

export default function CurriculumPage() {
    const navigate = useNavigate();
    const { curriculumType, selectedBoard, selectedGrade, selectedExam, profile, toggleFavoriteTopic } = useUserStore();

    // Selection state: full subject object so we have .topics
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    // Search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
    const [progressFilter, setProgressFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'duration' | 'difficulty' | 'progress'>('name');

    const { sessions: teachingSessions, loading: sessionsLoading } = useTeachingSessions();
    const lastInProgressSession = useMemo(() => {
        const incomplete = teachingSessions
            .filter((s: TeachingSessionType) => (s.progress ?? 0) < 100)
            .sort((a: TeachingSessionType, b: TeachingSessionType) => {
                const aAt = (a as TeachingSessionType & { updatedAt?: string }).updatedAt ?? a.startTime ?? '';
                const bAt = (b as TeachingSessionType & { updatedAt?: string }).updatedAt ?? b.startTime ?? '';
                return bAt.localeCompare(aAt);
            });
        return incomplete[0] ?? null;
    }, [teachingSessions]);

    // Derived context info
    const curriculumDisplay = useMemo(() => {
        if (curriculumType === 'school') {
            return `${selectedBoard} • ${selectedGrade}`;
        }
        if (curriculumType === 'competitive') {
            return selectedExam;
        }
        return 'Not Configured';
    }, [curriculumType, selectedBoard, selectedGrade, selectedExam]);

    // Real curriculum: subjects with full topic lists for current context
    const availableSubjects = useMemo(() => {
        if (!curriculumType) return [];
        return getSubjectsForContext(curriculumType as 'school' | 'competitive', selectedGrade ?? undefined, selectedExam ?? undefined);
    }, [curriculumType, selectedGrade, selectedExam]);

    // Real topics for the selected subject (all curriculum topics covered)
    const topics = useMemo(() => {
        return selectedSubject?.topics ?? [];
    }, [selectedSubject]);

    // Topic progress from sessions: topicId -> progress (0–100), using latest session per topic
    const topicProgressMap = useMemo(() => {
        const map: Record<string, number> = {};
        teachingSessions.forEach((s: TeachingSessionType) => {
            const existing = map[s.topicId];
            const progress = s.progress ?? 0;
            if (existing === undefined || progress > existing) map[s.topicId] = progress;
        });
        return map;
    }, [teachingSessions]);

    // Last studied date per topic (for "Last studied: X days ago")
    type SessionWithUpdated = TeachingSessionType & { updatedAt?: string };
    const topicLastStudiedMap = useMemo(() => {
        const map: Record<string, string> = {};
        (teachingSessions as SessionWithUpdated[])
            .filter((s) => s.topicId && ((s as SessionWithUpdated).updatedAt || s.startTime))
            .sort((a, b) => {
                const aAt = (a as SessionWithUpdated).updatedAt ?? a.startTime ?? '';
                const bAt = (b as SessionWithUpdated).updatedAt ?? b.startTime ?? '';
                return bAt.localeCompare(aAt);
            })
            .forEach((s) => {
                if (s.topicId && !map[s.topicId]) {
                    map[s.topicId] = (s as SessionWithUpdated).updatedAt ?? s.startTime ?? '';
                }
            });
        return map;
    }, [teachingSessions]);

    const formatLastStudied = (isoDate: string) => {
        if (!isoDate) return 'Not started';
        const d = new Date(isoDate);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    };

    // Filter topics based on search, difficulty, and progress; then sort
    const filteredTopics = useMemo(() => {
        let list = topics.filter((topic: Topic) => {
            const matchesSearch = !searchQuery ||
                topic.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDifficulty = !difficultyFilter ||
                topic.difficulty === difficultyFilter;
            const progress = topicProgressMap[topic.id] ?? 0;
            const matchesProgress =
                progressFilter === 'all' ||
                (progressFilter === 'not_started' && progress === 0) ||
                (progressFilter === 'in_progress' && progress > 0 && progress < 100) ||
                (progressFilter === 'completed' && progress >= 100);
            return matchesSearch && matchesDifficulty && matchesProgress;
        });
        const getProgress = (t: Topic) => topicProgressMap[t.id] ?? 0;
        const getDuration = (t: Topic) => t.durationMinutes ?? 0;
        const diffOrder = (d?: string) => (d === 'beginner' ? 0 : d === 'intermediate' ? 1 : 2);
        list = [...list].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'duration') return getDuration(a) - getDuration(b);
            if (sortBy === 'difficulty') return diffOrder(a.difficulty) - diffOrder(b.difficulty);
            return getProgress(a) - getProgress(b);
        });
        return list;
    }, [topics, searchQuery, difficultyFilter, progressFilter, sortBy, topicProgressMap]);

    const handleBack = () => {
        if (selectedSubject) {
            setSelectedSubject(null);
        } else {
            navigate(-1);
        }
    };

    // Start Topic Explanation / Teaching for this topic (all topics are teachable).
    // Flow 1A: Curriculum → Subject → Topic → Main OS; pass subject so AI teaches only this topic with correct syllabus context.
    const handleStartTopic = (topicId: string) => {
        navigate(`/learn/${topicId}`, {
            state: selectedSubject ? { subjectName: selectedSubject.name } : undefined,
        });
    };

    // Open /learn/{topicId} with Studio panel and a specific tab (mindmap, flashcards, quiz).
    const handleTopicShortcut = (topicId: string, openStudioTab: 'mindmap' | 'flashcards' | 'quiz') => {
        navigate(`/learn/${topicId}`, {
            state: {
                ...(selectedSubject ? { subjectName: selectedSubject.name } : {}),
                openStudioTab,
            },
        });
    };

    const handleSwitchCurriculum = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-theme dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header - floating, soft shadow, no hard edges */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-soft safe-top flex items-center rounded-b-2xl border-0 min-w-0" style={{ minHeight: 'var(--layout-header-height)' }}>
                <SkipToMainInHeader />
                <div className="max-w-7xl mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 lg:px-8 flex-1">
                    <div className="flex items-center justify-between w-full min-w-0" style={{ minHeight: 'var(--layout-header-height)' }}>
                        {/* Left side */}
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                            <motion.button
                                onClick={handleBack}
                                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
                                aria-label="Back"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                            </motion.button>

                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1.5">
                                    {(() => {
                                        const iconName = curriculumType === 'school' ? 'school' : 'zap';
                                        const Icon = {
                                            'school': School,
                                            'zap': Zap,
                                            'layers': Layers
                                        }[iconName] || Layers;
                                        return <Icon className="w-3.5 h-3.5" />;
                                    })()}
                                    {curriculumType === 'school' ? 'School Board' : 'Competitive Exam'}
                                </span>
                                <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none flex items-center gap-2">
                                    {(() => {
                                        const key = curriculumType === 'school' ? selectedBoard : selectedExam;
                                        const iconName = key ? (BOARD_EXAM_ICONS[key] || 'school') : 'school';
                                        const Icon = {
                                            'school': School,
                                            'building-2': Building2,
                                            'microscope': Microscope,
                                            'calculator': Calculator,
                                            'zap': Zap,
                                            'brain': Brain,
                                            'code': Code,
                                            'bar-chart': Brain, // Fallback or use a generic one if BarChart3 not imported here (oh wait I added it)
                                            'globe': Globe,
                                            'scale': Scale,
                                            'palette': Palette,
                                            'shield': Shield
                                        }[iconName] || School;
                                        return <Icon className="w-4 h-4 text-purple-500" />;
                                    })()}
                                    {curriculumDisplay}
                                </h1>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            {curriculumType && (
                                <GlobalSearch
                                    curriculumType={curriculumType as 'school' | 'competitive'}
                                    selectedGrade={selectedGrade}
                                    selectedExam={selectedExam}
                                />
                            )}
                            <motion.button
                                onClick={handleSwitchCurriculum}
                                title="Switch Course"
                                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors touch-manipulation justify-center"
                            >
                                <RefreshCw className="w-4 h-4 shrink-0" aria-hidden />
                                <span className="text-xs font-bold hidden sm:inline">SWITCH</span>
                            </motion.button>
                            <NotificationCenter />
                            <motion.button
                                onClick={() => navigate('/settings')}
                                className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
                                aria-label="Settings"
                            >
                                <Settings className="w-5 h-5 text-gray-600 dark:text-slate-400 shrink-0" aria-hidden />
                            </motion.button>
                            <motion.button
                                onClick={() => useProfilePanelStore.getState().open()}
                                className="p-1 px-2.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-full bg-purple-600/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center gap-2 touch-manipulation"
                                aria-label="Open Profile"
                            >
                                <User className="w-4 h-4 shrink-0" aria-hidden />
                                <span className="hidden sm:inline">PROFILE</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </header>

            <main id="main-content" className="max-w-7xl mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
                {lastInProgressSession && (
                    <motion.button
                        type="button"
                        onClick={() => handleStartTopic(lastInProgressSession.topicId)}
                        className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-left flex items-center justify-between gap-4 shadow-lg hover:shadow-xl transition-all"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-indigo-100" data-reading-content>Continue where you left off</p>
                            <p className="font-semibold truncate" data-reading-content>{lastInProgressSession.topicName}</p>
                            <p className="text-xs text-white/80 mt-1">{Math.round(lastInProgressSession.progress ?? 0)}% complete</p>
                        </div>
                        <ChevronRight className="w-5 h-5 shrink-0 opacity-90" />
                    </motion.button>
                )}
                <AnimatePresence mode="wait">
                    {/* Subjects View */}
                    {!selectedSubject ? (
                        <motion.div
                            key="subjects"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="mb-10 text-center sm:text-left">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                                    Subject Selection
                                </h2>
                            </div>

                            {availableSubjects.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                                    <p className="text-gray-500 dark:text-slate-400 font-medium mb-2" data-reading-content>No subjects found for this selection.</p>
                                    <p className="text-sm text-gray-400 dark:text-slate-500" data-reading-content>Complete onboarding and choose a grade or exam to see subjects and topics.</p>
                                    <button onClick={() => navigate('/onboarding')} className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">Go to Onboarding</button>
                                </div>
                            ) : (
                                <motion.div
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    {availableSubjects.map((subject) => (
                                        <motion.button
                                            key={subject.id}
                                            variants={staggerItem}
                                            onClick={() => setSelectedSubject(subject)}
                                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all text-left group border border-gray-100 dark:border-slate-800 relative overflow-hidden"
                                            whileHover={{ y: -5 }}
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

                                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                                                {(() => {
                                                    const iconName = SUBJECT_ICONS[subject.name] || subject.icon || 'book';
                                                    const Icon = (({
                                                        'calculator': Calculator,
                                                        'flask': Microscope,
                                                        'book': BookOpen,
                                                        'zap': Zap,
                                                        'test-tube': Microscope,
                                                        'dna': Brain,
                                                        'globe': Globe,
                                                        'trending-up': TrendingUp,
                                                        'leaf': Activity,
                                                        'languages': Globe,
                                                        'briefcase': School,
                                                        'landmark': School,
                                                        'history': Clock
                                                    } as Record<string, React.ComponentType<{ className?: string }>>)[iconName]) || BookOpen;
                                                    return <Icon className="w-7 h-7" />;
                                                })()}
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">
                                                {subject.name}
                                            </h3>
                                            <div className="flex items-center justify-between text-sm text-gray-400 dark:text-slate-500 mt-4">
                                                <span>{subject.topics.length} Topic{subject.topics.length !== 1 ? 's' : ''} • All with AI explanation</span>
                                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        /* Topics View */
                        <motion.div
                            key="topics"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="mb-8">
                                <button
                                    onClick={() => setSelectedSubject(null)}
                                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm mb-4"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    BACK TO SUBJECTS
                                </button>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                                    {selectedSubject.name}
                                </h2>
                            </div>

                            {/* Learning path graph */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 mb-6">
                                <LearningPathGraph
                                    topics={topics}
                                    topicProgressMap={topicProgressMap}
                                    onTopicClick={handleStartTopic}
                                />
                            </div>

                            {/* Search and Filter */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-4 mb-8">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Find a topic..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {['beginner', 'intermediate', 'advanced'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setDifficultyFilter(difficultyFilter === level ? null : level)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${difficultyFilter === level
                                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Progress:</span>
                                    {(['all', 'not_started', 'in_progress', 'completed'] as const).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setProgressFilter(key)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${progressFilter === key
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {key === 'all' ? 'All' : key === 'not_started' ? 'Not started' : key === 'in_progress' ? 'In progress' : 'Completed'}
                                        </button>
                                    ))}
                                    <span className="text-xs font-medium text-gray-500 dark:text-slate-400 ml-2">Sort:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as 'name' | 'duration' | 'difficulty' | 'progress')}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-0 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="name">Name (A–Z)</option>
                                        <option value="duration">Duration</option>
                                        <option value="difficulty">Difficulty</option>
                                        <option value="progress">Progress</option>
                                    </select>
                                </div>
                            </div>

                            {/* Topics List (virtualized when many items) */}
                            <div className="space-y-4">
                                {sessionsLoading ? (
                                    <>
                                        {[1, 2, 3, 4].map((i) => (
                                            <SkeletonListItem key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800" />
                                        ))}
                                    </>
                                ) : filteredTopics.length > 20 ? (
                                    <div style={{ height: 560 }}>
                                        <List
                                            height={560}
                                            itemCount={filteredTopics.length}
                                            itemSize={196}
                                            width="100%"
                                            className="scrollbar-thin"
                                        >
                                            {({ index, style }: { index: number; style: CSSProperties }) => {
                                                const topic = filteredTopics[index];
                                                return (
                                                    <div style={{ ...style, paddingBottom: 16 }}>
                                                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6 group hover:border-purple-200 dark:hover:border-purple-800 transition-all h-[180px] box-border">
                                                            <div className="relative w-16 h-16 shrink-0">
                                                                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500">
                                                                    <FileText className="w-8 h-8" />
                                                                </div>
                                                                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                                                                    <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                                                                        <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-200 dark:text-slate-700" />
                                                                        <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={2 * Math.PI * 12} strokeDashoffset={2 * Math.PI * 12 * (1 - (topicProgressMap[topic.id] ?? 0) / 100)} className="text-purple-500 dark:text-purple-400 transition-all duration-500" strokeLinecap="round" />
                                                                    </svg>
                                                                    <span className="absolute text-[9px] font-bold text-gray-600 dark:text-slate-300">{Math.round(topicProgressMap[topic.id] ?? 0)}%</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 text-center sm:text-left min-w-0">
                                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{topic.name}</h3>
                                                                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm text-gray-500">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="w-4 h-4 shrink-0" />
                                                                        {topic.duration ?? (topic.durationMinutes ? `~${topic.durationMinutes} min` : '—')}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className={`w-2 h-2 rounded-full shrink-0 ${topic.difficulty === 'beginner' ? 'bg-green-500' : topic.difficulty === 'intermediate' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                                        <span className="capitalize">{topic.difficulty}</span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 dark:text-slate-500">
                                                                        Last studied: {formatLastStudied(topicLastStudiedMap[topic.id] ?? '')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto shrink-0">
                                                                <div className="flex items-center gap-3">
                                                                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleFavoriteTopic(topic.id); }} className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors" title={profile?.favoriteTopicIds?.includes(topic.id) ? 'Remove from favorites' : 'Add to favorites'} aria-label={profile?.favoriteTopicIds?.includes(topic.id) ? 'Remove from favorites' : 'Add to favorites'}>
                                                                        <Star className={`w-5 h-5 ${profile?.favoriteTopicIds?.includes(topic.id) ? 'fill-amber-500 text-amber-500' : 'text-gray-400 hover:text-amber-500'}`} />
                                                                    </button>
                                                                    <button type="button" onClick={() => handleTopicShortcut(topic.id, 'mindmap')} className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors" title="Open Mind Map for this topic"><Brain className="w-5 h-5 text-gray-400 hover:text-purple-500" /></button>
                                                                    <button type="button" onClick={() => handleTopicShortcut(topic.id, 'flashcards')} className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors" title="Open Flashcards for this topic"><CreditCard className="w-5 h-5 text-gray-400 hover:text-purple-500" /></button>
                                                                    <button type="button" onClick={() => handleTopicShortcut(topic.id, 'quiz')} className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors" title="Open Quiz for this topic"><HelpCircle className="w-5 h-5 text-gray-400 hover:text-purple-500" /></button>
                                                                </div>
                                                                <button onClick={() => handleStartTopic(topic.id)} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all uppercase tracking-widest">
                                                                    Topic Explanation
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        </List>
                                    </div>
                                ) : (
                                    filteredTopics.map((topic) => (
                                        <motion.div
                                            key={topic.id}
                                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6 group hover:border-purple-200 dark:hover:border-purple-800 transition-all"
                                        >
                                            <div className="relative w-16 h-16 shrink-0">
                                                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                                                    <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                                                        <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-200 dark:text-slate-700" />
                                                        <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={2 * Math.PI * 12} strokeDashoffset={2 * Math.PI * 12 * (1 - (topicProgressMap[topic.id] ?? 0) / 100)} className="text-purple-500 dark:text-purple-400 transition-all duration-500" strokeLinecap="round" />
                                                    </svg>
                                                    <span className="absolute text-[9px] font-bold text-gray-600 dark:text-slate-300">{Math.round(topicProgressMap[topic.id] ?? 0)}%</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 text-center sm:text-left">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2" data-reading-content>{topic.name}</h3>
                                                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {topic.duration ?? (topic.durationMinutes ? `~${topic.durationMinutes} min` : '—')}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-2 h-2 rounded-full ${topic.difficulty === 'beginner' ? 'bg-green-500' : topic.difficulty === 'intermediate' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                        <span className="capitalize">{topic.difficulty}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 dark:text-slate-500">
                                                        Last studied: {formatLastStudied(topicLastStudiedMap[topic.id] ?? '')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                                <div className="flex items-center gap-3">
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleFavoriteTopic(topic.id); }} className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors" title={profile?.favoriteTopicIds?.includes(topic.id) ? 'Remove from favorites' : 'Add to favorites'} aria-label={profile?.favoriteTopicIds?.includes(topic.id) ? 'Remove from favorites' : 'Add to favorites'}>
                                                        <Star className={`w-5 h-5 ${profile?.favoriteTopicIds?.includes(topic.id) ? 'fill-amber-500 text-amber-500' : 'text-gray-400 hover:text-amber-500'}`} />
                                                    </button>
                                                    <button type="button" onClick={() => handleTopicShortcut(topic.id, 'mindmap')} className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors" title="Open Mind Map for this topic"><Brain className="w-5 h-5 text-gray-400 hover:text-purple-500" /></button>
                                                    <button type="button" onClick={() => handleTopicShortcut(topic.id, 'flashcards')} className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors" title="Open Flashcards for this topic"><CreditCard className="w-5 h-5 text-gray-400 hover:text-purple-500" /></button>
                                                    <button type="button" onClick={() => handleTopicShortcut(topic.id, 'quiz')} className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors" title="Open Quiz for this topic"><HelpCircle className="w-5 h-5 text-gray-400 hover:text-purple-500" /></button>
                                                </div>
                                                <button onClick={() => handleStartTopic(topic.id)} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all uppercase tracking-widest">
                                                    Topic Explanation
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                                {!sessionsLoading && filteredTopics.length === 0 && (
                                    <div className="text-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                                        <p className="text-gray-500 font-medium">No topics found matching your filters.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
