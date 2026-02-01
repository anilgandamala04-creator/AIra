import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Home,
    ChevronRight,
    GraduationCap,
    BookOpen,
    Search,
    Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurriculumStore } from '../stores/curriculumStore';
import { GradeSelector, SubjectGrid, ChapterList } from '../components/curriculum';
import PageTransition from '../components/common/PageTransition';

type ViewState = 'grades' | 'subjects' | 'chapters';

export default function CurriculumPage() {
    const navigate = useNavigate();
    const {
        selectedGrade,
        selectedSubject,
        setSelectedGrade,
        setSelectedSubject,
        clearSelection
    } = useCurriculumStore();

    // Determine current view based on selection state
    const getCurrentView = (): ViewState => {
        if (selectedSubject) return 'chapters';
        if (selectedGrade) return 'subjects';
        return 'grades';
    };

    const currentView = getCurrentView();

    const handleBack = () => {
        if (currentView === 'chapters') {
            setSelectedSubject(null);
        } else if (currentView === 'subjects') {
            setSelectedGrade(null);
        } else {
            navigate('/dashboard');
        }
    };

    // Breadcrumb items
    const getBreadcrumbs = () => {
        const items = [
            { label: 'Curriculum', onClick: () => clearSelection() }
        ];

        if (selectedGrade) {
            items.push({
                label: selectedGrade.name,
                onClick: () => setSelectedSubject(null)
            });
        }

        if (selectedSubject) {
            items.push({
                label: selectedSubject.name,
                onClick: () => { }
            });
        }

        return items;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 
                           dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl 
                                  border-b border-gray-200 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Left side */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleBack}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 
                                             transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>

                                {/* Breadcrumbs */}
                                <nav className="flex items-center gap-1 text-sm">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                                 dark:hover:text-gray-200 transition-colors"
                                    >
                                        <Home className="w-4 h-4" />
                                    </button>

                                    {breadcrumbs.map((item, idx) => (
                                        <div key={idx} className="flex items-center">
                                            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                                            <button
                                                onClick={item.onClick}
                                                className={`transition-colors ${idx === breadcrumbs.length - 1
                                                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            {/* Right side */}
                            <div className="flex items-center gap-3">
                                <button
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 
                                             transition-colors"
                                >
                                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                    onClick={() => navigate('/settings')}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 
                                             transition-colors"
                                >
                                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <AnimatePresence mode="wait">
                        {currentView === 'grades' && (
                            <motion.div
                                key="grades"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <GradeSelector />
                            </motion.div>
                        )}

                        {currentView === 'subjects' && (
                            <motion.div
                                key="subjects"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SubjectGrid />
                            </motion.div>
                        )}

                        {currentView === 'chapters' && (
                            <motion.div
                                key="chapters"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChapterList />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Quick access footer */}
                <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 
                                  backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 
                                  py-4 px-4 sm:hidden">
                    <div className="flex items-center justify-around">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400"
                        >
                            <Home className="w-5 h-5" />
                            <span className="text-xs">Home</span>
                        </button>
                        <button
                            onClick={() => clearSelection()}
                            className="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400"
                        >
                            <GraduationCap className="w-5 h-5" />
                            <span className="text-xs font-medium">Curriculum</span>
                        </button>
                        <button
                            onClick={() => navigate('/learn')}
                            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400"
                        >
                            <BookOpen className="w-5 h-5" />
                            <span className="text-xs">Learn</span>
                        </button>
                    </div>
                </footer>
            </div>
        </PageTransition>
    );
}
