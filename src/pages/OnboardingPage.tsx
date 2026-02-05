import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { updateUserProfile } from '../services/backendService';
import type { Profession, Subject, Topic } from '../types';
import {
    Stethoscope, Cog, Scale, Briefcase, FlaskConical, Palette,
    Monitor, GraduationCap, TrendingUp, Building2, Brain, MoreHorizontal,
    ChevronRight, ArrowLeft, BookOpen, FileText
} from 'lucide-react';
import { TRANSITION_DEFAULT } from '../utils/animations';

// Profession data
import { professions } from '../data/professions';


// Icons mapping for dynamic icon rendering

const iconMap: Record<string, React.ReactNode> = {
    stethoscope: <Stethoscope className="w-8 h-8" />,
    cog: <Cog className="w-8 h-8" />,
    scale: <Scale className="w-8 h-8" />,
    briefcase: <Briefcase className="w-8 h-8" />,
    flask: <FlaskConical className="w-8 h-8" />,
    palette: <Palette className="w-8 h-8" />,
    monitor: <Monitor className="w-8 h-8" />,
    graduation: <GraduationCap className="w-8 h-8" />,
    trending: <TrendingUp className="w-8 h-8" />,
    building: <Building2 className="w-8 h-8" />,
    brain: <Brain className="w-8 h-8" />,
    more: <MoreHorizontal className="w-8 h-8" />,
};

export default function OnboardingPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));
    const {
        selectedProfession,
        selectedSubProfession,
        selectProfession,
        selectSubProfession,
        completeOnboarding,
        updateProfile,
    } = useUserStore();



    const [step, setStep] = useState(0);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    const handleProfessionSelect = (profession: Profession) => {
        selectProfession(profession);
        setStep(1);
    };

    const handleSubProfessionSelect = (subProfession: string) => {
        selectSubProfession(subProfession);
        setStep(2);
    };

    const handleSubjectSelect = (subject: Subject) => {
        setSelectedSubject(subject);
        setStep(3);
    };

    const handleTopicSelect = async (topicId: string) => {
        // Ensure all required selections are made before proceeding
        if (!selectedProfession || !selectedSubProfession || !selectedSubject) return;

        // Use subject ID (not name) so Settings and Profile panel resolve dropdowns and display correctly
        updateProfile({
            subject: selectedSubject.id,
            currentTopic: topicId,
        });
        // Pass subject/topic explicitly: when profile is null (first-time user),
        // updateProfile is a no-op, so completeOnboarding needs them directly.
        completeOnboarding({ subject: selectedSubject.id, currentTopic: topicId });

        // Await sync so server has completed profile before we navigate.
        // Prevents subscription/reload from overwriting with stale data and sending user back to onboarding.
        const uid = useAuthStore.getState().user?.id;
        const profile = useUserStore.getState().profile;
        if (uid && profile) {
            try {
                await updateUserProfile(uid, profile);
            } catch (e) {
                console.error('Onboarding: sync profile failed', e);
            }
        }

        navigate(`/learn/${topicId}`, { replace: true, state: { fromOnboarding: true } });
    };

    const handleBack = () => {
        if (step > 0) {
            const newStep = step - 1;
            setStep(newStep);
            // Reset selections when going back to ensure clean state and enforce sequence
            if (newStep === 0) {
                selectProfession(null);
                selectSubProfession(null);
                setSelectedSubject(null);
            } else if (newStep === 1) {
                selectSubProfession(null);
                setSelectedSubject(null);
            } else if (newStep === 2) {
                setSelectedSubject(null);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* Progress indicator */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-sm safe-top">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between mb-2">
                        {step > 0 && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-1 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-slate-100 transition-ui active:scale-[0.97]"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">{t('back')}</span>
                            </button>
                        )}
                        <div className="flex-1" />
                        <span className="text-sm text-gray-500 dark:text-slate-300">Step {step + 1} of 4</span>
                    </div>
                    <div className="flex gap-2">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`flex-1 h-1.5 rounded-full transition-ui ${i <= step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200 dark:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 safe-top safe-bottom">
                <AnimatePresence mode="wait">
                    {/* Step 0: Profession Selection - Responsive */}
                    {step === 0 && (
                        <motion.div
                            key="profession"
                            initial={reduceAnimations ? undefined : { opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={reduceAnimations ? undefined : { opacity: 0, x: -20 }}
                            transition={reduceAnimations ? { duration: 0 } : { duration: TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
                            className="max-w-5xl mx-auto"
                        >
                            <div className="text-center mb-6 sm:mb-10">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-slate-100 mb-2 sm:mb-3">
                                    {t('selectProfession')}
                                </h1>
                                <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg px-2">
                                    {t('selectProfessionDesc')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                {professions.map((profession, index) => (
                                    <motion.button
                                        key={profession.id}
                                        onClick={() => handleProfessionSelect(profession)}
                                        className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-ui text-left group overflow-hidden min-h-[140px] sm:min-h-[180px] active:scale-[0.99] ${selectedProfession?.id === profession.id ? 'ring-2 ring-purple-500' : ''
                                            }`}
                                        initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={reduceAnimations ? { duration: 0 } : { delay: index * 0.05, duration: TRANSITION_DEFAULT.duration }}
                                        whileHover={reduceAnimations ? undefined : { scale: 1.03, y: -4 }}
                                        whileTap={reduceAnimations ? undefined : { scale: 0.98 }}
                                    >
                                        {/* Glow effect on hover */}
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl sm:rounded-2xl"
                                            style={{ backgroundColor: profession.color }}
                                        />

                                        <div
                                            className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110 shrink-0"
                                            style={{ backgroundColor: `${profession.color}20`, color: profession.color }}
                                        >
                                            {iconMap[profession.icon]}
                                        </div>

                                        <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-slate-100 mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                            {profession.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 line-clamp-2 sm:line-clamp-3">
                                            {profession.description}
                                        </p>

                                        <ChevronRight className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-300 dark:text-slate-500 group-hover:text-purple-500 group-hover:translate-x-1 transition-ui" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Sub-Profession Selection */}
                    {step === 1 && selectedProfession && (
                        <motion.div
                            key="subprofession"
                            initial={reduceAnimations ? undefined : { opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={reduceAnimations ? undefined : { opacity: 0, x: -20 }}
                            transition={reduceAnimations ? { duration: 0 } : { duration: TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="text-center mb-6 sm:mb-10">
                                <div
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
                                    style={{ backgroundColor: `${selectedProfession.color}20`, color: selectedProfession.color }}
                                >
                                    {iconMap[selectedProfession.icon]}
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-slate-100 mb-2 sm:mb-3">
                                    {t('selectSpecialization')}
                                </h1>
                                <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg px-2">
                                    Choose your area of focus in {selectedProfession.name}
                                </p>
                            </div>

                            <div className="grid gap-2 sm:gap-3">
                                {selectedProfession.subProfessions.map((sub, index) => (
                                    <motion.button
                                        key={sub.id}
                                        onClick={() => handleSubProfessionSelect(sub.id)}
                                        className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-ui text-left group min-h-[64px] sm:min-h-[80px] active:scale-[0.99] ${selectedSubProfession === sub.id ? 'ring-2 ring-purple-500' : ''
                                            }`}
                                        initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={reduceAnimations ? { duration: 0 } : { delay: index * 0.08, duration: TRANSITION_DEFAULT.duration }}
                                        whileHover={reduceAnimations ? undefined : { x: 8 }}
                                        whileTap={reduceAnimations ? undefined : { scale: 0.98 }}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${selectedProfession.color}15`, color: selectedProfession.color }}
                                        >
                                            <span className="text-xl font-bold">{sub.name?.[0]?.toUpperCase() || '?'}</span>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                                {sub.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{sub.description}</p>
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-gray-300 dark:text-slate-500 group-hover:text-purple-500 group-hover:translate-x-1 transition-ui" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Subject Selection */}
                    {step === 2 && selectedProfession && selectedSubProfession && (
                        <motion.div
                            key="subject"
                            initial={reduceAnimations ? undefined : { opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={reduceAnimations ? undefined : { opacity: 0, x: -20 }}
                            transition={reduceAnimations ? { duration: 0 } : { duration: TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="text-center mb-6 sm:mb-10">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-slate-100 mb-2 sm:mb-3">
                                    Select a Subject
                                </h1>
                                <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg px-2">
                                    What would you like to learn in {selectedProfession.subProfessions.find(s => s.id === selectedSubProfession)?.name || 'this specialization'}?
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {selectedProfession.subProfessions.find(s => s.id === selectedSubProfession)?.subjects?.map((subject, index) => {
                                    if (!subject) return null;
                                    return (
                                    <motion.button
                                        key={subject.id}
                                        onClick={() => handleSubjectSelect(subject)}
                                        className="p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-ui text-left group border border-transparent hover:border-purple-200 dark:hover:border-purple-500 active:scale-[0.99]"
                                        initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={reduceAnimations ? { duration: 0 } : { delay: index * 0.05, duration: TRANSITION_DEFAULT.duration }}
                                        whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                                        whileTap={reduceAnimations ? undefined : { scale: 0.98 }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-lg mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                                                    {subject.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                                    {subject.topics?.length || 0} Topics Available
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-slate-500 group-hover:text-purple-500 my-auto transition-ui" />
                                        </div>
                                    </motion.button>
                                    );
                                })}
                                {(!selectedProfession.subProfessions.find(s => s.id === selectedSubProfession)?.subjects?.length) && (
                                    <div className="col-span-2 text-center py-10">
                                        <p className="text-gray-500 dark:text-slate-400 mb-2">
                                            No subjects are currently available for this specialization.
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-slate-500 mb-4">
                                            Please select a different sub-profession or profession to continue.
                                        </p>
                                        <button
                                            onClick={handleBack}
                                            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-ui active:scale-[0.98]"
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Topic Selection */}
                    {step === 3 && selectedSubject && (
                        <motion.div
                            key="topic"
                            initial={reduceAnimations ? undefined : { opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={reduceAnimations ? undefined : { opacity: 0, x: -20 }}
                            transition={reduceAnimations ? { duration: 0 } : { duration: TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="text-center mb-6 sm:mb-10">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-slate-100 mb-2 sm:mb-3">
                                    Choose a Topic
                                </h1>
                                <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg px-2">
                                    Start your session with {selectedSubject.name}
                                </p>
                            </div>

                            <div className="grid gap-3">
                                {selectedSubject?.topics && selectedSubject.topics.length > 0 ? (
                                    selectedSubject.topics.map((topic: Topic, index: number) => {
                                        if (!topic) return null;
                                        return (
                                            <motion.button
                                                key={topic.id}
                                                onClick={() => handleTopicSelect(topic.id)}
                                                className="flex items-center gap-4 p-5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-ui text-left group border border-transparent hover:border-purple-200 dark:hover:border-purple-500 active:scale-[0.99]"
                                                initial={reduceAnimations ? undefined : { opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={reduceAnimations ? { duration: 0 } : { delay: index * 0.05, duration: TRANSITION_DEFAULT.duration }}
                                                whileHover={reduceAnimations ? undefined : { x: 4 }}
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-300 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-800 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                                                        {topic.name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                                                        <span>{topic.duration || '30 min'}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{topic.difficulty || 'Beginner'}</span>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Start
                                                </div>
                                            </motion.button>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500 dark:text-slate-400 mb-2">
                                            No topics are currently available for {selectedSubject.name}.
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-slate-500 mb-4">
                                            Please select a different subject to continue.
                                        </p>
                                        <button
                                            onClick={handleBack}
                                            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-ui active:scale-[0.98]"
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

