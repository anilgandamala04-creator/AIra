import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTeachingStore } from '../stores/teachingStore';
import { useResourceStore } from '../stores/resourceStore';
import { useDoubtStore } from '../stores/doubtStore';
import { useUserStore } from '../stores/userStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import VerificationQuiz from '../components/teaching/VerificationQuiz';
import type { ChatMessage, SessionAnalytics } from '../types';
import {
    Settings, ChevronLeft, Layout, Sparkles, Layers
} from 'lucide-react';
import NotificationCenter from '../components/common/NotificationCenter';
import { AIStatusBadge } from '../components/common/AIStatusIndicator';
import { useProfilePanelStore } from '../stores/profilePanelStore';
import { formatTopicName } from '../utils/topicUtils';
import { toast } from '../stores/toastStore';
import { generateChatResponse, type ConversationMessage } from '../services/contextualAI';

import { ChatPanel } from '../components/teaching/ChatPanel';
import { useSessionManager } from '../hooks/useSessionManager';
import { TeachingBoard } from '../components/teaching/TeachingBoard';
import { SessionControls } from '../components/teaching/SessionControls';
import { StudioResourcePanel } from '../components/teaching/StudioResourcePanel';

export default function TeachingPage() {
    const { t } = useTranslation();
    const { topicId } = useParams();
    const navigate = useNavigate();

    const {
        curriculumType,
        selectedBoard,
        selectedGrade,
        selectedExam,
        selectedSubject,
        includePYQ,
        profile,
        completeOnboarding
    } = useUserStore();

    // Update current topic and complete onboarding if needed
    // Using primitive dependencies to avoid effect loops with profile object
    useEffect(() => {
        if (topicId && profile) {
            const currentTopicId = profile.currentTopic;
            const isOnboarded = profile.onboardingCompleted;

            if (currentTopicId !== topicId || !isOnboarded) {
                // Update profile via store action which handles state merging internally
                completeOnboarding({ currentTopic: topicId });
            }
        }
    }, [topicId, profile, completeOnboarding]);

    const {
        currentSession,
        currentStep,
        isPaused,
        isSpeaking,
        nextStep,
        previousStep,
        goToStep,
        pause,
        resume,
        setSpeaking,
        generateAiSession,
        endSession,
    } = useTeachingStore();

    const sessionId = currentSession?.id || '';
    const {
        notes,
        mindMaps,
        flashcards,
        isGeneratingNotes,
        isGeneratingMindMap,
        isGeneratingFlashcards,
        generateNotes,
        generateMindMap,
        generateFlashcards,
        updateNote,
        removeNoteWithUndo,
        removeMindMapWithUndo,
        removeFlashcardSetWithUndo,
    } = useResourceStore();

    const {
        showVerificationQuiz,
        currentQuiz,
        hideQuiz,
        confirmUnderstanding,
        activeDoubt,
    } = useDoubtStore();

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isWaitingForAI, setIsWaitingForAI] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'note' | 'flashcard' | 'mindmap'; id: string; title: string } | null>(null);

    const {
        showResumePrompt,
        setShowResumePrompt,
        isComingSoonTopic
    } = useSessionManager(topicId);

    const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 1279px)').matches : false;

    const [mobilePanel, setMobilePanel] = useState<'home' | 'teach' | 'studio'>('teach');
    const [activeStudioTab, setActiveStudioTab] = useState<string>('notes');
    const centerPanelVisible = true;
    const rightPanelVisible = true;

    const sessionStartTimeRef = useRef<number>(Date.now());
    const teachingPanelRef = useRef<HTMLDivElement>(null);

    const { addSession } = useAnalyticsStore();

    const handleFinishSession = useCallback(() => {
        if (!currentSession) return;
        const durationMinutes = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / (60 * 1000)));
        const sessionRecord: SessionAnalytics = {
            sessionId: currentSession.id,
            topicId: topicId || currentSession.topicId || '',
            date: new Date().toISOString(),
            durationMinutes,
            completionPercentage: 100,
            doubtsCount: currentSession.doubts?.length || 0,
        };
        addSession(sessionRecord);
        toast.success(`Lesson completed! Total time: ${durationMinutes} minutes.`);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setTimeout(() => {
            endSession();
            navigate('/');
        }, 1500);
    }, [currentSession, topicId, addSession, endSession, navigate]);

    const sessionNotes = useMemo(() => notes.filter(n => n.sessionId === sessionId && !n.archived), [notes, sessionId]);
    const sessionMindMaps = useMemo(() => mindMaps.filter(m => m.sessionId === sessionId), [mindMaps, sessionId]);
    const sessionFlashcards = useMemo(() => flashcards.filter(f => f.sessionId === sessionId), [flashcards, sessionId]);

    const handlePlayPause = useCallback(() => {
        if (isPaused) resume();
        else pause();
    }, [isPaused, resume, pause]);

    const currentStepData = currentSession?.teachingSteps?.[currentStep] ?? null;

    const [isGeneratingAiLesson, setIsGeneratingAiLesson] = useState(false);
    const handleGenerateAiLesson = useCallback(async () => {
        if (!topicId) return;
        setIsGeneratingAiLesson(true);
        try {
            await generateAiSession(topicId, {
                curriculumType: curriculumType || undefined,
                board: selectedBoard || undefined,
                grade: selectedGrade || undefined,
                exam: selectedExam || undefined,
                subjectName: selectedSubject || undefined,
                topic: currentSession?.topicName || formatTopicName(topicId),
                includePYQ
            });
            toast.success('AI Lesson generated!');
        } catch {
            toast.error('Failed to generate AI lesson.');
        } finally {
            setIsGeneratingAiLesson(false);
        }
    }, [topicId, generateAiSession, curriculumType, selectedBoard, selectedGrade, selectedExam, selectedSubject, currentSession?.topicName, includePYQ]);

    const handleSendMessage = useCallback(async (msg?: string) => {
        const textToUse = msg || inputMessage;
        if (!textToUse.trim()) return;
        const newUserMsg: ChatMessage = { id: Date.now().toString(), type: 'user', content: textToUse, timestamp: new Date().toISOString() };
        setChatMessages(prev => [...prev, newUserMsg]);
        setInputMessage('');
        setIsWaitingForAI(true);
        try {
            const chatHistory: ConversationMessage[] = chatMessages.map(m => ({
                role: m.type === 'user' ? 'user' : 'assistant',
                content: m.content,
                timestamp: m.timestamp
            }));
            const aiResponse = await generateChatResponse(textToUse, chatHistory, {
                panel: 'chat',
                topicId,
                currentStepTitle: currentStepData?.title,
                topicName: currentSession?.topicName
            });
            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), type: 'ai', content: aiResponse.content, timestamp: new Date().toISOString() };
            setChatMessages(prev => [...prev, aiMsg]);
        } catch {
            toast.error('Failed to get AI response');
        } finally {
            setIsWaitingForAI(false);
        }
    }, [inputMessage, topicId, currentStepData?.title, chatMessages, currentSession?.topicName]);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 font-sans transition-colors">
            <header className="shrink-0 h-[var(--header-height)] border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-50 px-4 md:px-6 flex items-center justify-between safe-top">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden min-w-0">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <AIStatusBadge />
                    <div className="min-w-0 flex flex-col">
                        <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 truncate">{selectedSubject || 'Teaching'}</h1>
                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">AIra Studio • Personal Tutor</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <NotificationCenter />
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500" onClick={() => navigate('/settings')}>
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 p-1.5 pl-3 border border-gray-200 dark:border-slate-800 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group" onClick={() => useProfilePanelStore.getState().toggle()}>
                        <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 group-hover:text-purple-600 truncate max-w-[80px] hidden sm:block">{profile?.displayName || 'Student'}</span>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900 shrink-0 shadow-sm">{profile?.displayName?.[0] || 'S'}</div>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex min-h-0 min-w-0 relative max-w-[2000px] mx-auto w-full p-2 lg:p-4 gap-2 lg:gap-4">
                {/* Mobile Tab Bar */}
                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-around p-2 z-[60] safe-bottom">
                        <button onClick={() => setMobilePanel('home')} className={`flex flex-col items-center p-2 rounded-xl ${mobilePanel === 'home' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-500'}`}>
                            <Layout className="w-5 h-5" />
                            <span className="text-[10px] mt-1">Chat</span>
                        </button>
                        <button onClick={() => setMobilePanel('teach')} className={`flex flex-col items-center p-2 rounded-xl ${mobilePanel === 'teach' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-500'}`}>
                            <Sparkles className="w-5 h-5" />
                            <span className="text-[10px] mt-1">Learn</span>
                        </button>
                        <button onClick={() => setMobilePanel('studio')} className={`flex flex-col items-center p-2 rounded-xl ${mobilePanel === 'studio' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-500'}`}>
                            <Layers className="w-5 h-5" />
                            <span className="text-[10px] mt-1">Studio</span>
                        </button>
                    </div>
                )}

                {/* Left Panel - Chat */}
                <AnimatePresence mode="wait">
                    {(mobilePanel === 'home' || !isMobile) && (
                        <motion.div
                            key="chat-panel"
                            initial={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            animate={isMobile ? { opacity: 1 } : { width: 'var(--panel-chat-width)', opacity: 1 }}
                            exit={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            className={`${isMobile ? 'absolute inset-0' : 'relative'} os-panel z-40 bg-white dark:bg-slate-900 overflow-hidden flex flex-col`}
                            style={isMobile ? { width: '100%', height: 'calc(100% - 60px)' } : {}}
                        >
                            <ChatPanel
                                isMobile={isMobile}
                                mobilePanel={mobilePanel}
                                reduceAnimations={false}
                                chatMessages={chatMessages}
                                isWaitingForAI={isWaitingForAI}
                                isResolvingDoubt={false}
                                editingMessageId={editingMessageId}
                                editDraft={editDraft}
                                inputMessage={inputMessage}
                                uploadedFiles={uploadedFiles}
                                t={t}
                                setChatMessages={setChatMessages}
                                setEditingMessageId={setEditingMessageId}
                                setEditDraft={setEditDraft}
                                setInputMessage={setInputMessage}
                                setUploadedFiles={setUploadedFiles}
                                onSendMessage={handleSendMessage}
                                onFileUpload={() => { }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Center Panel - Teaching Board */}
                <AnimatePresence mode="wait">
                    {centerPanelVisible && (mobilePanel === 'teach' || !isMobile) && (
                        <motion.div
                            key="teach-panel"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`${isMobile ? 'absolute inset-0' : 'relative'} flex-1 flex flex-col os-panel bg-white dark:bg-slate-900 overflow-hidden shadow-2xl ring-1 ring-black/5 z-20`}
                            ref={teachingPanelRef}
                            style={isMobile ? { width: '100%', height: 'calc(100% - 60px)' } : {}}
                        >
                            <div className="shrink-0 flex items-center justify-between p-3 border-b border-gray-100 dark:border-slate-800 overflow-hidden">
                                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                        {profile?.displayName && <span className="text-purple-600 dark:text-purple-400 font-bold">{profile.displayName.split(' ')[0][0]}</span>}
                                    </div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate">
                                        {currentStepData?.title || 'Lesson Details'}
                                    </h2>
                                </div>
                            </div>

                            {isComingSoonTopic && (
                                <div className="mx-3 mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2">
                                    <p className="text-xs text-amber-800 dark:text-amber-200">Placeholder content. Full lesson coming soon.</p>
                                    <button onClick={() => toast.success('We\'ll notify you!')} className="px-3 py-1 bg-amber-200 dark:bg-amber-800 rounded-lg text-xs font-medium">Notify Me</button>
                                </div>
                            )}

                            {showResumePrompt != null && (
                                <div className="mx-3 mt-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-2">
                                    <p className="text-xs text-blue-800 dark:text-blue-200">Resume from step {showResumePrompt + 1}?</p>
                                    <button onClick={() => { goToStep(showResumePrompt); setShowResumePrompt(null); }} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium">Resume</button>
                                </div>
                            )}

                            <TeachingBoard
                                currentStep={currentStep}
                                currentStepData={currentStepData}
                                currentSession={currentSession}
                                topicId={topicId}
                                isSpeaking={isSpeaking}
                                isPaused={isPaused}
                                selectedSubject={selectedSubject}
                            />

                            <div className="p-4 safe-bottom">
                                <SessionControls
                                    currentSession={currentSession}
                                    currentStep={currentStep}
                                    isSpeaking={isSpeaking}
                                    isPaused={isPaused}
                                    isMuted={isMuted}
                                    isGeneratingAiLesson={isGeneratingAiLesson}
                                    setIsMuted={setIsMuted}
                                    currentStepData={currentStepData}
                                    onPrevious={() => {
                                        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
                                        setSpeaking(false);
                                        previousStep();
                                    }}
                                    onNext={() => {
                                        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
                                        setSpeaking(false);
                                        nextStep();
                                    }}
                                    onGenerateAi={handleGenerateAiLesson}
                                    onRaiseDoubt={() => {
                                        pause();
                                        if (isMobile) setMobilePanel('home');
                                        toast.info('Raising a doubt...');
                                    }}
                                    onToggleMute={() => setIsMuted(!isMuted)}
                                    onPlayPause={handlePlayPause}
                                    onFinish={handleFinishSession}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right Panel - Studio */}
                <AnimatePresence mode="wait">
                    {rightPanelVisible && (mobilePanel === 'studio' || !isMobile) && (
                        <motion.div
                            key="studio-panel"
                            initial={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            animate={isMobile ? { opacity: 1 } : { width: 'var(--panel-studio-width)', opacity: 1 }}
                            exit={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            className={`${isMobile ? 'absolute inset-0' : 'relative'} os-panel bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col`}
                            style={isMobile ? { width: '100%', height: 'calc(100% - 60px)' } : {}}
                        >
                            <StudioResourcePanel
                                t={t}
                                activeStudioTab={activeStudioTab}
                                setActiveStudioTab={setActiveStudioTab}
                                studioSavedAt={null}
                                currentSession={currentSession}
                                sessionNotes={sessionNotes}
                                sessionMindMaps={sessionMindMaps}
                                sessionFlashcards={sessionFlashcards}
                                isGeneratingNotes={isGeneratingNotes}
                                isGeneratingMindMap={isGeneratingMindMap}
                                isGeneratingFlashcards={isGeneratingFlashcards}
                                onGenerateNotes={() => generateNotes(currentSession?.id || '', currentSession?.topicName || formatTopicName(topicId || ''), currentSession?.teachingSteps?.map(s => s.content) || [])}
                                onGenerateMindMap={() => generateMindMap(currentSession?.id || '', currentSession?.topicName || formatTopicName(topicId || ''), currentSession?.teachingSteps?.map(s => s.content) || [])}
                                onGenerateFlashcards={() => generateFlashcards(currentSession?.id || '')}
                                onUpdateNote={updateNote}
                                onDeleteResource={(type, id, title) => setConfirmDelete({ type, id, title })}
                                onDownloadTranscript={() => { }}
                                onNavigateToTopic={(id) => navigate(`/learn/${id}`)}
                                topicId={topicId || ''}
                                setMobilePanel={setMobilePanel}
                                getSimilarTopics={() => []}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Verification Quiz Modal */}
            <AnimatePresence>
                {showVerificationQuiz && currentQuiz && (
                    <VerificationQuiz
                        quiz={currentQuiz}
                        subject={selectedSubject || undefined}
                        onComplete={() => {
                            if (activeDoubt) confirmUnderstanding(activeDoubt.id);
                            resume();
                        }}
                        onSkip={() => {
                            hideQuiz();
                            resume();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                            <h3 className="text-lg font-bold mb-2">Delete Resource?</h3>
                            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete {confirmDelete.title}?</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
                                <button onClick={() => {
                                    if (confirmDelete.type === 'note') removeNoteWithUndo(notes.find(n => n.id === confirmDelete.id)!);
                                    else if (confirmDelete.type === 'mindmap') removeMindMapWithUndo(mindMaps.find(m => m.id === confirmDelete.id)!);
                                    else removeFlashcardSetWithUndo(sessionId, sessionFlashcards);
                                    setConfirmDelete(null);
                                }} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
