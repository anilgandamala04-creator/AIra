import { useState, useEffect, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../stores/authStore';
import { useTeachingStore } from '../stores/teachingStore';
import { useResourceStore } from '../stores/resourceStore';
import { useDoubtStore } from '../stores/doubtStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUserStore } from '../stores/userStore';
import NotesViewer from '../components/studio/NotesViewer';
import MindMapViewer from '../components/studio/MindMapViewer';
import FlashcardViewer from '../components/studio/FlashcardViewer';
import VerificationQuiz from '../components/teaching/VerificationQuiz';
import type { TeachingSession, ChatMessage } from '../types';
import {
    Send, FileText, Map, CreditCard, Sparkles, MessageCircle, Layers,
    Volume2, VolumeX, Minimize2, Maximize2, Settings, Loader2, HelpCircle, User, Play, ChevronLeft, ChevronRight, Paperclip, X, Plus, ArrowUp, Briefcase
} from 'lucide-react';
import QuizViewer from '../components/studio/QuizViewer';
import { useProfilePanelStore } from '../stores/profilePanelStore';
import { getCourseContent } from '../data/courseRegistry';
import { defaultSteps } from '../data/courses/defaultCourse';
import { getTopicVisual } from '../components/teaching/topicVisualRegistry';
import { findTopicInfo, formatTopicName } from '../utils/topicUtils';
import { pickBestHumanVoice } from '../utils/voice';
import { narrateText } from '../services/narration';
import { toast } from '../stores/toastStore';
import { TRANSITION_DEFAULT } from '../utils/animations';
import { professions } from '../data/professions';
import { 
    generateChatResponse, 
    addToConversationHistory, 
    getConversationHistory
} from '../services/contextualAI';
import { 
    validateTopicBelongsToProfession,
    findTopicProfession,
    getDomainContext
} from '../utils/domainValidation';
import { generateQuiz as generateQuizApi } from '../services/aiApi';

// Avatar animation spec: float 3s+3s ease-in-out, glow 40–65% over 6–8s, blink 4–9s 120ms, ambient/calm.
const AVATAR_FLOAT_DURATION = 6;  // 3s up + 3s down
const AVATAR_GLOW_DURATION = 7;    // 6–8s, slower than float
const AVATAR_GLOW_OPACITY: [number, number, number] = [0.4, 0.65, 0.4]; // never zero
const AVATAR_GLOW_COLORS = 'radial-gradient(circle, #FFF7E6 0%, #FFE9A8 40%, transparent 70%)';

// AI Avatar: gentle floating (breathing), soft glow pulse, natural blink, one-time micro bounce per session, sparkles synced to glow.
// Memoize AIAvatar to prevent unnecessary re-renders
const AIAvatar = memo(function AIAvatar({ isSpeaking }: { isSpeaking: boolean }) {
    const reduceAnimations = useSettingsStore(useShallow((s) => s.settings.accessibility.reduceAnimations));
    const [eyesClosed, setEyesClosed] = useState(false);
    const [microBounce, setMicroBounce] = useState<'idle' | 'settle' | 'done'>('idle');
    const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nextBlinkRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Micro bounce: once per app session only (no re-trigger on navigation/refresh)
    useEffect(() => {
        if (reduceAnimations) return;
        try {
            if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('avatarBounceDone') === '1') {
                setMicroBounce('done');
                return;
            }
            setMicroBounce('settle');
            const t = setTimeout(() => {
                setMicroBounce('done');
                try { sessionStorage.setItem('avatarBounceDone', '1'); } catch { /* ignore */ }
            }, 320);
            return () => clearTimeout(t);
        } catch {
            setMicroBounce('done');
        }
    }, [reduceAnimations]);

    // Natural blink: random 4–9s, duration ~120ms
    useEffect(() => {
        if (reduceAnimations) return;
        const scheduleNext = () => {
            const delay = 4000 + Math.random() * 5000;
            nextBlinkRef.current = setTimeout(() => {
                setEyesClosed(true);
                blinkTimeoutRef.current = setTimeout(() => {
                    setEyesClosed(false);
                    blinkTimeoutRef.current = null;
                    scheduleNext();
                }, 120);
            }, delay);
        };
        scheduleNext();
        return () => {
            if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
            if (nextBlinkRef.current) clearTimeout(nextBlinkRef.current);
        };
    }, [reduceAnimations]);

    const glowTransition = { duration: AVATAR_GLOW_DURATION, repeat: Infinity, ease: [0.45, 0, 0.55, 1] as const };

    return (
        <motion.div
            className="relative w-20 h-20"
            animate={{
                y: microBounce === 'idle' ? 0 : microBounce === 'settle' ? [0, 2, 0] : isSpeaking ? [0, -5, 0] : [0, -4, 0],
                scale: isSpeaking ? [1, 1.05, 1] : 1
            }}
            transition={
                microBounce === 'settle'
                    ? { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                    : microBounce === 'idle'
                        ? { duration: 0 }
                        : {
                            duration: isSpeaking ? 0.5 : AVATAR_FLOAT_DURATION,
                            repeat: isSpeaking ? Infinity : Infinity,
                            ease: isSpeaking ? 'easeInOut' : 'easeInOut'
                        }
            }
        >
            {/* Soft glow pulse: 40–65% over 6–8s, #FFF7E6 → #FFE9A8, never zero; slower than float */}
            <motion.div
                className="absolute inset-0 rounded-full scale-110 blur-xl pointer-events-none"
                style={{ background: AVATAR_GLOW_COLORS }}
                animate={
                    isSpeaking
                        ? { opacity: [0.4, 0.65, 0.4], scale: [1, 1.12, 1] }
                        : reduceAnimations
                            ? { opacity: 0.5 }
                            : { opacity: AVATAR_GLOW_OPACITY }
                }
                transition={
                    isSpeaking
                        ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                        : reduceAnimations
                            ? { duration: 0 }
                            : glowTransition
                }
                aria-hidden
            />
            <div className="relative w-full h-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <div className="relative">
                    {/* Eyes: random blink when idle; speaking squint when speaking */}
                    <div className="flex gap-2 mb-1">
                        <motion.div
                            className="w-2.5 h-2.5 bg-gray-800 rounded-full origin-center"
                            animate={
                                isSpeaking
                                    ? { scaleY: [1, 0.3, 1, 0.5, 1], scaleX: [1, 1.1, 1] }
                                    : { scaleY: eyesClosed ? 0.08 : 1, scaleX: 1 }
                            }
                            transition={
                                isSpeaking
                                    ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
                                    : { duration: eyesClosed ? 0.12 : 0.08 }
                            }
                        />
                        <motion.div
                            className="w-2.5 h-2.5 bg-gray-800 rounded-full origin-center"
                            animate={
                                isSpeaking
                                    ? { scaleY: [1, 0.3, 1, 0.5, 1], scaleX: [1, 1.1, 1] }
                                    : { scaleY: eyesClosed ? 0.08 : 1, scaleX: 1 }
                            }
                            transition={
                                isSpeaking
                                    ? { duration: 0.4, repeat: Infinity, delay: 0.1, ease: 'easeInOut' }
                                    : { duration: eyesClosed ? 0.04 : 0.06 }
                            }
                        />
                    </div>
                    {/* Mouth: speaking motion when active; static smile when idle */}
                    <motion.div
                        className="w-6 h-3 border-b-2 border-gray-800 rounded-b-full mx-auto"
                        animate={
                            isSpeaking
                                ? {
                                    scaleX: [1, 1.3, 0.9, 1.2, 1],
                                    scaleY: [1, 0.8, 1.1, 0.9, 1]
                                }
                                : { scaleX: 1, scaleY: 1 }
                        }
                        transition={{
                            duration: 0.35,
                            repeat: isSpeaking ? Infinity : 0,
                            ease: 'easeInOut'
                        }}
                    />
                </div>
            </div>
            {/* Sparkles: +10–15% at glow peak, same cycle as glow, independent delays (no sync) */}
            {!reduceAnimations && (
                <>
                    <motion.span
                        className="absolute -top-1 -right-1 text-lg text-white/90"
                        animate={{ opacity: isSpeaking ? [0.6, 0.95, 0.6] : [0.48, 0.58, 0.48] }}
                        transition={{
                            duration: isSpeaking ? 0.8 : AVATAR_GLOW_DURATION,
                            repeat: Infinity,
                            ease: [0.45, 0, 0.55, 1]
                        }}
                        aria-hidden
                    >
                        ✦
                    </motion.span>
                    <motion.span
                        className="absolute top-0 -left-3 text-base text-white/90"
                        animate={{ opacity: isSpeaking ? [0.6, 0.95, 0.6] : [0.48, 0.58, 0.48] }}
                        transition={{
                            duration: isSpeaking ? 0.8 : AVATAR_GLOW_DURATION,
                            delay: 2.1,
                            repeat: Infinity,
                            ease: [0.45, 0, 0.55, 1]
                        }}
                        aria-hidden
                    >
                        ✦
                    </motion.span>
                </>
            )}
        </motion.div>
    );
});

function trimToSentences(text: string, maxSentences: number): string {
    const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (parts.length <= maxSentences) return text;
    return parts.slice(0, maxSentences).join(' ').trim();
}

function applyAiTutorStyleToSpokenText(
    base: string,
    aiTutor: { personality: string; responseStyle: string; analogiesEnabled: boolean; clinicalExamplesEnabled: boolean },
    topicName?: string
): string {
    let text = base;

    // Response style affects length/structure
    if (aiTutor.responseStyle === 'concise') {
        text = trimToSentences(text, 2);
    } else if (aiTutor.responseStyle === 'interactive') {
        text = `${text} ... Now, quick check-in: can you explain that back in your own words?`;
    } else if (aiTutor.responseStyle === 'adaptive') {
        // Light heuristic: keep it shorter for long content, otherwise keep it detailed
        text = text.length > 450 ? trimToSentences(text, 3) : text;
    }

    // Personality affects tone (kept subtle so it doesn't feel spammy)
    if (aiTutor.personality === 'direct') {
        // Remove some fluff-y openers if present
        text = text.replace(/^(Now,|Let me explain this clearly\. \.\. |Notice how this works\. \.\. |Pay close attention here\. \.\. )/i, '').trim();
    } else if (aiTutor.personality === 'humorous') {
        text = `Quick fun note: learning sticks better when you smile. ... ${text}`;
    } else if (aiTutor.personality === 'formal') {
        text = `Let us proceed. ... ${text}`;
    } else {
        // encouraging (default) - keep as-is
    }

    // Optional analogy hook (generic, safe across domains)
    if (aiTutor.analogiesEnabled) {
        text = `${text} ... Think of it like building blocks—each idea supports the next.`;
    }

    // Optional clinical examples hook (only apply if the topic looks medical)
    if (aiTutor.clinicalExamplesEnabled && topicName && /cardiac|heart|ecg|neurology|stroke|diagnosis|treatment/i.test(topicName)) {
        text = `${text} ... Clinically, this shows up in day-to-day decision-making and real patient scenarios.`;
    }

    return text;
}

export default function TeachingPage() {
    const { t } = useTranslation();
    const { topicId } = useParams();
    const navigate = useNavigate();

    const {
        currentSession,
        currentStep,
        isPaused,
        isSpeaking,
        startSession,
        nextStep,
        previousStep,
        pause,
        resume,
        setSpeaking,
        generateAiSession,
    } = useTeachingStore();

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
        updateFlashcardPerformance,
    } = useResourceStore();

    const {
        showVerificationQuiz,
        currentQuiz,
        isResolvingDoubt,
        hideQuiz,
        confirmUnderstanding,

        activeDoubt,
    } = useDoubtStore();

    const settings = useSettingsStore(useShallow((state) => state.settings));
    const reduceAnimations = useSettingsStore(useShallow((state) => state.settings.accessibility.reduceAnimations));
    const authUserId = useAuthStore((s) => s.user?.id) ?? 'user_1';
    const profile = useUserStore(useShallow((state) => state.profile));
    const { selectedProfession, selectedSubProfession, selectProfession, selectSubProfession } = useUserStore();
    const selectedSubjectId = useUserStore(useShallow((state) => state.profile?.subject));

    // Sync badges from profile: initialize on mount and update when profile changes
    useEffect(() => {
        if (profile?.profession) {
            // Update if profile profession differs from selected (e.g., changed in Settings)
            if (!selectedProfession || selectedProfession.id !== profile.profession.id) {
                selectProfession(profile.profession);
            }
        } else if (!profile?.profession && selectedProfession) {
            // Clear if profile has no profession but selectedProfession exists
            selectProfession(null);
        }
    }, [profile?.profession, selectedProfession, selectProfession]);

    useEffect(() => {
        if (profile?.subProfession) {
            // Update if profile subProfession differs from selected (e.g., changed in Settings)
            if (selectedSubProfession !== profile.subProfession) {
                selectSubProfession(profile.subProfession);
            }
        } else if (!profile?.subProfession && selectedSubProfession) {
            // Clear if profile has no subProfession but selectedSubProfession exists
            selectSubProfession(null);
        }
    }, [profile?.subProfession, selectedSubProfession, selectSubProfession]);

    // Get badge display names (resolve IDs to names from canonical professions data)
    // Always use the original professions data source for reliable lookups
    const fullProfessionData = selectedProfession 
        ? professions.find(p => p.id === selectedProfession.id) 
        : null;
    
    const subProfessionName = fullProfessionData && selectedSubProfession
        ? fullProfessionData.subProfessions.find(sp => sp.id === selectedSubProfession)?.name || null
        : null;

    const subjectName = fullProfessionData && selectedSubProfession && selectedSubjectId
        ? fullProfessionData.subProfessions
            .find(sp => sp.id === selectedSubProfession)
            ?.subjects.find(s => s.id === selectedSubjectId)?.name || null
        : null;

    // Initialize chat with contextual greeting based on topic and professional domain
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    // Set initial chat message when topic loads - domain-specific greeting
    useEffect(() => {
        if (currentSession?.topicName) {
            // Build domain-specific greeting
            let greeting = `Hello! I'm here to help you learn ${currentSession.topicName}.`;
            
            if (profile?.profession?.name) {
                const subProf = profile.subProfession 
                    ? fullProfessionData?.subProfessions.find(sp => sp.id === profile.subProfession)?.name
                    : null;
                
                greeting += subProf 
                    ? ` As a ${profile.profession.name} professional specializing in ${subProf}, I'll keep all explanations and examples relevant to your field.`
                    : ` As someone in ${profile.profession.name}, I'll tailor all explanations to your professional domain.`;
                
                greeting += ` I'll stay focused on ${profile.profession.name}-related content throughout our session.`;
            }
            
            greeting += ' Feel free to ask any questions as we go through the lesson!';
            
            setChatMessages([{
                id: '1',
                type: 'ai',
                content: greeting,
                timestamp: new Date().toISOString()
            }]);
        } else {
            // Clear messages if no session
            setChatMessages([]);
        }
    }, [currentSession?.topicName, profile?.profession?.name, profile?.subProfession, fullProfessionData]);

    const [inputMessage, setInputMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [lastUserAction, setLastUserAction] = useState<string | null>(null); // Track last user action for feedback
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Track uploaded files for doubt submission
    const [isWaitingForAI, setIsWaitingForAI] = useState(false); // Show typing indicator while AI response is pending
    const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]); // Track all timeouts for cleanup
    const chatMessagesEndRef = useRef<HTMLDivElement>(null); // Scroll chat to bottom when new messages arrive
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia('(max-width: 1279px)').matches : false
    ); // Track mobile viewport; initial value from media query to avoid one-frame wrong state on narrow load

    // Auto-scroll chat to bottom when messages or typing state change
    // Use requestAnimationFrame for smooth scrolling performance
    useEffect(() => {
        if (chatMessagesEndRef.current) {
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }, [chatMessages, isWaitingForAI]);

    // Get current session resources
    const sessionId = currentSession?.id || '';

    // Mobile panel state (local) - Only one panel visible on mobile at a time
    // 'home' = Pre-teaching state (chat/questions), 'teach' = Teaching panel (default), 'studio' = Post-teaching resources
    const [mobilePanel, setMobilePanel] = useState<'home' | 'teach' | 'studio'>('teach');
    // Studio tab state (local)
    const [activeStudioTab, setActiveStudioTab] = useState<string>('notes');
    // Panel visibility (minimize = collapse to strip) and maximize (expand to take other panel's space)
    const [centerPanelVisible, setCenterPanelVisible] = useState(true);
    const [rightPanelVisible, setRightPanelVisible] = useState(true);
    const [centerMaximized, setCenterMaximized] = useState(false);
    const [rightMaximized, setRightMaximized] = useState(false);

    // Resources for session
    const sessionNotes = notes.filter(n => n.sessionId === sessionId);
    const sessionMindMaps = mindMaps.filter(m => m.sessionId === sessionId);
    const sessionFlashcards = flashcards.filter(f => f.sessionId === sessionId);

    // Current step data - safe access with bounds checking
    const currentStepData = currentSession?.teachingSteps?.[currentStep] ?? null;

    // Extract user context for stable dependencies
    const userProfessionName = profile?.profession?.name || '';
    const userSubProfessionId = profile?.subProfession || '';

    // Sync with "Current Topic" from Settings: when user changes lesson in Settings,
    // immediately update the ongoing lesson by navigating to the selected topic.
    useEffect(() => {
        const selectedTopic = profile?.currentTopic?.trim();
        if (!selectedTopic || selectedTopic === topicId) return;
        navigate(`/learn/${selectedTopic}`, { replace: true });
    }, [profile?.currentTopic, topicId, navigate]);

    // Initialize session
    // Init session on mount or topic change with DOMAIN VALIDATION
    // ENFORCES STRICT LINEAR FLOW: Must have completed onboarding with topic selection
    useEffect(() => {
        if (!topicId) {
            // If no topicId, check if onboarding is complete
            const profile = useUserStore.getState().profile;
            const onboardingStep = useUserStore.getState().onboardingStep;
            
            // STRICT ONBOARDING ENFORCEMENT: If onboarding not complete, redirect to onboarding
            const needsOnboarding = 
                onboardingStep >= 0 || 
                !profile?.profession || 
                !profile?.subProfession || 
                !profile?.subject || 
                !profile?.currentTopic;

            if (needsOnboarding) {
                toast.warning('Please complete onboarding first. Redirecting...');
                const redirectTimeoutId = setTimeout(() => {
                    navigate('/onboarding', { replace: true });
                }, 2000);
                timeoutRefs.current.push(redirectTimeoutId);
                return () => {
                    clearTimeout(redirectTimeoutId);
                };
            }
            
            // Onboarding complete but no topicId in URL - use profile's currentTopic
            const currentTopic = profile?.currentTopic;
            if (currentTopic) {
                navigate(`/learn/${currentTopic}`, { replace: true });
                return;
            }
            
            // Fallback: redirect to curriculum (only if onboarding is complete)
            toast.warning('No topic selected. Redirecting to curriculum...');
            const redirectTimeoutId = setTimeout(() => {
                navigate('/curriculum');
            }, 2000);
            timeoutRefs.current.push(redirectTimeoutId);
            return () => {
                clearTimeout(redirectTimeoutId);
            };
        }

        // If we are already in a session for this topic, do nothing (resume)
        if (currentSession?.topicId === topicId) {
            return;
        }

        // Find topic information from professions data
        const { topic: topicInfo, subjectArea } = findTopicInfo(topicId);
        if (!topicInfo) {
            toast.warning('Topic not found. Redirecting to curriculum...');
            const redirectTimeoutId = setTimeout(() => {
                navigate('/curriculum');
            }, 2000);
            timeoutRefs.current.push(redirectTimeoutId);
            return () => {
                clearTimeout(redirectTimeoutId);
            };
        }
        const topicName = topicInfo.name;
        const topicDescription = topicInfo.description;

        // Get user's profession and preferences for contextual teaching
        const userProfession = userProfessionName || undefined;
        const userSubProfession = userSubProfessionId || undefined;
        const userProfessionId = profile?.profession?.id;

        // DOMAIN VALIDATION: Check if topic belongs to user's selected profession
        // This ensures teaching is strictly constrained to the professional domain
        if (userProfessionId) {
            const validation = validateTopicBelongsToProfession(topicId, userProfessionId);
            
            if (!validation.belongsToDomain && !validation.isValid) {
                // Topic doesn't belong to user's profession - find where it belongs
                const topicProfession = findTopicProfession(topicId);
                
                if (topicProfession) {
                    // Topic belongs to a different profession - warn and offer to switch or go back
                    toast.warning(
                        `This topic belongs to ${topicProfession.profession.name}, not ${userProfession}. ` +
                        `Please select a topic from your chosen professional domain.`
                    );
                    
                    // Redirect to curriculum to select appropriate topic
                    const redirectTimeoutId = setTimeout(() => navigate('/curriculum'), 3000);
                    timeoutRefs.current.push(redirectTimeoutId);
                    return () => {
                        clearTimeout(redirectTimeoutId);
                    };
                }
            }
        }

        // Get course content - will generate comprehensive content if not pre-defined
        // Content generation will use user context for personalized teaching
        let teachingSteps: typeof defaultSteps;
        try {
            teachingSteps = getCourseContent(
                topicId,
                topicName,
                topicDescription,
                subjectArea || undefined
            ) || [];
        } catch {
            teachingSteps = defaultSteps;
        }

        // Get domain context for the topic (for domain-specific teaching)
        const topicProfession = findTopicProfession(topicId);
        const domainContext = topicProfession 
            ? getDomainContext(
                topicProfession.profession.id,
                topicProfession.subProfession.id,
                topicProfession.subject.id,
                topicId
            )
            : userProfessionId
                ? getDomainContext(userProfessionId, userSubProfessionId || undefined, undefined, topicId)
                : null;

        // Enhance steps with user context if available - domain-specific teaching
        if (userProfession && teachingSteps.length > 0) {
            // Add profession-specific context to welcome step
            const welcomeStep = teachingSteps[0];
            if (welcomeStep && welcomeStep.id.includes('intro')) {
                const professionContext = userSubProfession
                    ? `, specifically ${userSubProfession}`
                    : '';
                const domainNotice = domainContext 
                    ? ` All content in this lesson is tailored for ${domainContext.professionName} professionals.`
                    : '';
                const professionText = `As someone in ${userProfession}${professionContext}, you'll find this particularly relevant to your field.${domainNotice}`;
                teachingSteps[0] = {
                    ...welcomeStep,
                    content: `${welcomeStep.content}\n\n${professionText}`,
                    spokenContent: `${welcomeStep.spokenContent} ${professionText}`,
                };
            }
        }

        if (teachingSteps.length === 0) {
            console.warn(`No content found for ${topicId}, loading default.`);
            teachingSteps = defaultSteps;
            toast.warning(`Using default content for ${topicName}. Comprehensive content is being generated.`);
        } else {
            const domainInfo = domainContext ? ` (${domainContext.professionName})` : '';
            toast.info(`Starting ${topicName}${domainInfo} - ${teachingSteps.length} steps ready`);
        }

        // Build session with profession context for strict domain isolation
        const session: TeachingSession = {
            id: 'session_' + Date.now(),
            userId: authUserId,
            topicId: topicId,
            topicName: topicName,
            startTime: new Date().toISOString(),
            status: 'active',
            currentStep: 0,
            totalSteps: teachingSteps.length,
            progress: 0,
            teachingSteps: teachingSteps, // Load dynamic content (pre-defined or AI-generated)
            doubts: [],
            // Include profession context for domain isolation
            professionId: domainContext?.professionId || userProfessionId,
            professionName: domainContext?.professionName || userProfession,
            subProfessionId: domainContext?.subProfessionId || userSubProfessionId || undefined,
            subProfessionName: domainContext?.subProfessionName,
            subjectId: domainContext?.subjectId,
            subjectName: domainContext?.subjectName || subjectArea || undefined,
        };

        startSession(session);
    }, [topicId, startSession, currentSession?.topicId, navigate, userProfessionName, userSubProfessionId, profile?.profession?.id, authUserId]);

    const [isGeneratingAiLesson, setIsGeneratingAiLesson] = useState(false);
    const handleGenerateAiLesson = async () => {
        if (!topicId) return;
        setIsGeneratingAiLesson(true);
        try {
            const { topic: topicInfo } = findTopicInfo(topicId);
            const topicName = topicInfo?.name || formatTopicName(topicId);
            await generateAiSession(topicId, topicName);
        } catch (error) {
            console.error('AI Lesson Generation failed:', error);
            toast.error('Failed to generate AI lesson. Please try again.');
        } finally {
            setIsGeneratingAiLesson(false);
        }
    };

    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [aiQuiz, setAiQuiz] = useState<{
        questions: { question: string; options: string[]; correctAnswer: number; explanation: string }[];
    } | null>(null);
    const handleGenerateQuiz = async () => {
        if (!currentSession?.topicName) {
            toast.warning('No active session. Please start a lesson first.');
            return;
        }
        if (!currentSession.teachingSteps || currentSession.teachingSteps.length === 0) {
            toast.warning('No content available to generate quiz from.');
            return;
        }
        setIsGeneratingQuiz(true);
        try {
            const context = currentSession.teachingSteps.map(s => s.content).filter(Boolean).join(' ');
            if (!context) {
                toast.warning('No content available to generate quiz from.');
                setIsGeneratingQuiz(false);
                return;
            }
            const quiz = await generateQuizApi(currentSession.topicName, context);
            if (quiz && quiz.questions && quiz.questions.length > 0) {
                setAiQuiz(quiz);
                setActiveStudioTab('quiz');
                toast.success('Quiz generated successfully!');
            } else {
                toast.warning('Quiz generation returned no questions. Please try again.');
            }
        } catch (error) {
            console.error('AI Quiz Generation failed:', error);
            toast.error('Failed to generate quiz. Please try again.');
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    // Text-to-Speech using Web Speech API
    useEffect(() => {
        // Check if speechSynthesis API is available
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            return;
        }

        if (!currentSession || !currentStepData?.spokenContent) return;

        // Check if TTS is enabled in settings
        if (!settings.accessibility?.textToSpeech) return;

        let utterance: SpeechSynthesisUtterance | null = null;
        let autoAdvanceTimeout: ReturnType<typeof setTimeout> | null = null;
        let voicesChangedHandler: (() => void) | null = null;
        let isMounted = true;

        const cleanup = () => {
            if (autoAdvanceTimeout) {
                clearTimeout(autoAdvanceTimeout);
                autoAdvanceTimeout = null;
            }
            if (voicesChangedHandler && window.speechSynthesis) {
                window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
                voicesChangedHandler = null;
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if (isMounted) {
                setSpeaking(false);
            }
        };

        // Auto-start speaking when step changes, if not paused and not muted
        if (!isPaused && !isMuted) {
            cleanup(); // Cancel previous

            // Ensure voices are loaded (Web Speech API quirk)
            const loadVoices = () => {
                if (!window.speechSynthesis || !isMounted) return;
                const voices = window.speechSynthesis.getVoices();
                if (voices.length === 0) {
                    // Voices not loaded yet, wait for voiceschanged event
                    voicesChangedHandler = () => {
                        if (window.speechSynthesis && isMounted) {
                            const loadedVoices = window.speechSynthesis.getVoices();
                            if (loadedVoices.length > 0) {
                                speakWithVoices(loadedVoices);
                            }
                        }
                    };
                    window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
                    return;
                }
                speakWithVoices(voices);
            };

            const speakWithVoices = (voices: SpeechSynthesisVoice[]) => {
                if (!currentStepData?.spokenContent || !window.speechSynthesis || !isMounted) return;

                // Enhanced text processing for more natural, engaging speech
                // Add strategic pauses, emphasis markers, and natural flow
                let processedText = applyAiTutorStyleToSpokenText(
                    currentStepData.spokenContent,
                    settings.aiTutor,
                    currentSession?.topicName
                )
                    // Add emphasis markers for key concepts (will be processed)
                    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove markdown bold but keep emphasis
                    .replace(/\*(.+?)\*/g, '$1') // Remove markdown italic
                    // Strategic pauses for better comprehension - more natural rhythm
                    .replace(/\.\s+/g, '. ... ') // Longer pause after sentences (natural thinking pause)
                    .replace(/\?\s+/g, '? ... ... ') // Longer pause after questions (waiting for reflection)
                    .replace(/!\s+/g, '! ... ') // Pause after exclamations (emphasis)
                    .replace(/,\s+/g, ', .. ') // Medium pause after commas (natural breath)
                    .replace(/;\s+/g, '; ... ') // Pause after semicolons (concept separation)
                    .replace(/:\s+/g, ': .. ') // Pause after colons (introduction pause)
                    // Paragraph breaks - longer pauses for concept transitions
                    .replace(/\n\n+/g, ' ... ... ... ') // Extra pause for paragraphs (major concept shift)
                    .replace(/\n/g, ' ... ') // Pause for line breaks (minor transition)
                    // Add natural emphasis to important phrases
                    .replace(/\b(important|key|critical|essential|fundamental|crucial|vital)\b/gi, (match) => {
                        return `${match} ... `; // Extra pause for emphasis
                    })
                    // Add engaging transitions for better flow
                    .replace(/\b(notice|observe|see|look|watch)\b/gi, (match) => {
                        return `${match} ... `; // Pause to let visuals sync
                    })
                    // Clean up multiple spaces
                    .replace(/\s+/g, ' ')
                    .trim();

                // Add engaging teaching phrases at natural break points for more realistic teaching
                const teachingPhrases = [
                    'Let me explain this clearly',
                    'Notice how this works',
                    'Pay close attention here',
                    'This is really interesting',
                    'Here\'s what\'s happening',
                    'Let\'s break this down',
                    'This is the key point',
                    'Think about this for a moment'
                ];

                // Add natural opening if missing - more engaging and teacher-like
                const lowerText = processedText.toLowerCase();
                if (!lowerText.startsWith('hello') &&
                    !lowerText.startsWith('welcome') &&
                    !lowerText.startsWith('now') &&
                    !lowerText.startsWith('let') &&
                    !lowerText.startsWith('here') &&
                    !lowerText.startsWith('this')) {
                    // Randomly select an engaging opening phrase
                    const randomPhrase = teachingPhrases[Math.floor(Math.random() * teachingPhrases.length)];
                    processedText = `${randomPhrase}. ... ${processedText}`;
                }

                utterance = new SpeechSynthesisUtterance(processedText);

                // Enhanced speech parameters for engaging, realistic teaching
                // Teaching voice should be clear, engaging, and not rushed
                const baseRate = settings.accessibility?.ttsSpeed || 0.90; // Slightly slower for better comprehension
                utterance.rate = Math.max(0.75, Math.min(1.1, baseRate));

                // Varied pitch for more natural, engaging expression
                // Slight variation makes the voice more human-like and engaging
                // Pitch varies slightly based on content type for more natural delivery
                const hasQuestion = processedText.includes('?');
                const hasExclamation = processedText.includes('!');
                utterance.pitch = hasQuestion ? 1.08 : hasExclamation ? 1.10 : 1.05; // Higher for questions/exclamations

                // Full volume for clear teaching
                utterance.volume = 1.0;

                const preferredVoiceName = settings.accessibility?.ttsVoice;

                if (preferredVoiceName && preferredVoiceName !== 'default' && preferredVoiceName !== '') {
                    const voice = voices.find(v => v.name === preferredVoiceName);
                    if (voice) utterance.voice = voice;
                } else {
                    // Auto-pick the most natural "human" voice available on this device/browser
                    // Prefer matches for the app language, then fall back to English.
                    const autoVoice = pickBestHumanVoice(voices, {
                        language: settings.language || 'en',
                    });
                    if (autoVoice) utterance.voice = autoVoice;
                }

                utterance.onstart = () => {
                    if (isMounted && currentStepData?.id) {
                        setSpeaking(true);
                        // Emit event for visual synchronization - ensures visuals react immediately
                        window.dispatchEvent(new CustomEvent('speech-start', {
                            detail: {
                                stepId: currentStepData.id,
                                title: currentStepData.title || '',
                                content: currentStepData.content || ''
                            }
                        }));
                        // Emit teaching-started event for UI feedback
                        window.dispatchEvent(new CustomEvent('teaching-started', {
                            detail: { stepId: currentStepData.id }
                        }));
                    }
                };

                // Emit speech-boundary for visual components (e.g. topic visuals)
                utterance.onboundary = (event) => {
                    if (isMounted && event.name === 'sentence' && processedText.length > 0 && currentStepData?.id) {
                        const progress = Math.min(100, Math.max(0, (event.charIndex / processedText.length) * 100));
                        window.dispatchEvent(new CustomEvent('speech-boundary', {
                            detail: { type: 'sentence', charIndex: event.charIndex, progress, stepId: currentStepData.id }
                        }));
                    }
                };
                utterance.onend = () => {
                    if (!isMounted) return;
                    setSpeaking(false);
                    // Emit event for visual components - ensures visuals complete their animations
                    if (currentStepData?.id) {
                        window.dispatchEvent(new CustomEvent('speech-end', {
                            detail: {
                                stepId: currentStepData.id,
                                completed: true
                            }
                        }));
                        // Emit teaching-completed event for UI feedback
                        window.dispatchEvent(new CustomEvent('teaching-completed', {
                            detail: { stepId: currentStepData.id }
                        }));
                    }
                    // Auto-advance logic - only if not at last step and session is valid
                    // This ensures smooth progression through the lesson
                    if (currentSession &&
                        currentSession.teachingSteps &&
                        currentSession.teachingSteps.length > 0 &&
                        currentStep >= 0 &&
                        currentStep < currentSession.totalSteps - 1) {
                        autoAdvanceTimeout = setTimeout(() => {
                            if (isMounted) {
                                // Visual feedback for auto-advance
                                setLastUserAction('auto-advance');
                                const autoAdvanceFeedbackTimeout = setTimeout(() => setLastUserAction(null), 1500);
                                timeoutRefs.current.push(autoAdvanceFeedbackTimeout);
                                nextStep();
                            }
                        }, 1500);
                        timeoutRefs.current.push(autoAdvanceTimeout);
                    }
                };
                utterance.onerror = (error) => {
                    console.error('Speech synthesis error:', error);
                    if (isMounted) {
                        setSpeaking(false);
                    }
                };

                try {
                    window.speechSynthesis.speak(utterance);
                } catch (error) {
                    console.error('Failed to speak:', error);
                    if (isMounted) {
                        setSpeaking(false);
                    }
                }
            };

            loadVoices();
        } else {
            // If paused or muted, stop speaking
            cleanup();
        }

        return () => {
            isMounted = false;
            cleanup();
        };
    }, [
        currentStep,
        isPaused,
        isMuted,
        currentSession,
        currentSession?.topicName,
        currentStepData?.spokenContent,
        currentStepData?.id,
        currentStepData?.title,
        currentStepData?.content,
        setSpeaking,
        nextStep,
        settings.accessibility?.textToSpeech,
        settings.accessibility?.ttsSpeed,
        settings.accessibility?.ttsVoice,
        // Language affects auto-selected voice choice; re-apply immediately.
        settings.language,
        settings.aiTutor,
    ]);

    const handleSendMessage = () => {
        if (!inputMessage.trim() && uploadedFiles.length === 0) return;

        // Visual feedback for user action - track timeout for cleanup
        const actionTimeoutId = setTimeout(() => setLastUserAction(null), 2000);
        timeoutRefs.current.push(actionTimeoutId);
        setLastUserAction('message-sent');

        // Build message content with file information
        let messageContent = inputMessage.trim();
        if (uploadedFiles.length > 0) {
            const fileNames = uploadedFiles.map(f => f.name).join(', ');
            messageContent = messageContent
                ? `${messageContent}\n\n[Attached files: ${fileNames}]`
                : `[Attached files: ${fileNames}]`;
        }

        const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const userMessage: ChatMessage = {
            id: uniqueId,
            type: 'user',
            content: messageContent,
            timestamp: new Date().toISOString(),
        };

        setChatMessages(prev => [...prev, userMessage]);
        setIsWaitingForAI(true);
        const message = inputMessage.trim();
        setInputMessage('');
        // Clear uploaded files after sending
        setUploadedFiles([]);

        // Pause teaching while responding to chat (optional - can be removed if you want parallel)
        const wasPaused = isPaused;
        if (!wasPaused && isSpeaking) {
            pause();
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.pause();
            }
        }

        // Add user message to conversation history for context
        if (currentSession?.id) {
            addToConversationHistory(currentSession.id, 'user', message);
        }

        // Generate contextual AI response using the intelligent context service
        // This automatically detects if the question is topic-specific or general
        // and provides appropriate context from the current lesson
        const conversationHistory = currentSession?.id ? getConversationHistory(currentSession.id) : [];
        
        generateChatResponse(message, conversationHistory)
            .then((data) => {
                setIsWaitingForAI(false);
                const aiUniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                const content = typeof data.content === 'string' && data.content.trim() ? data.content.trim() : '';
                const isEmpty = content.length === 0;
                const isBackendUnavailable = content.includes('unable to connect') || content.includes('backend server');
                
                // Add AI response to conversation history (skip for backend unavailable messages)
                if (currentSession?.id && !isEmpty && !isBackendUnavailable) {
                    addToConversationHistory(currentSession.id, 'assistant', content);
                }
                
                const aiResponse: ChatMessage = {
                    id: aiUniqueId,
                    type: 'ai',
                    content: isEmpty
                        ? "I didn't get a response ready. Please try asking again."
                        : content,
                    timestamp: new Date().toISOString(),
                    isError: isEmpty || isBackendUnavailable,
                };
                setChatMessages(prev => [...prev, aiResponse]);
                
                if (isEmpty) {
                    toast.warning('AI returned no content. You can try again.');
                } else if (isBackendUnavailable) {
                    toast.warning('AI backend is unavailable. Please start the backend server on http://localhost:5000');
                } else {
                    // Only narrate if we got a real response
                    narrateText(content, {
                        enabled: settings.accessibility?.textToSpeech && !isMuted,
                        maxChars: 1800,
                    });
                }

                // Resume teaching after response (if it was playing)
                if (!wasPaused && !isPaused) {
                    const resumeTimeoutId = setTimeout(() => {
                        resume();
                        if (typeof window !== 'undefined' && window.speechSynthesis) {
                            window.speechSynthesis.resume();
                        }
                    }, 500);
                    timeoutRefs.current.push(resumeTimeoutId);
                }
            })
            .catch((error) => {
                console.error('Failed to generate AI response:', error);
                setIsWaitingForAI(false);
                const fallbackId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-err-${Date.now()}`;
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : typeof error === 'string' 
                        ? error 
                        : 'Something went wrong. Please check your connection and try again.';
                // Build user-friendly error message
                let userFriendlyMessage = "I'm unable to process your request right now. ";
                const isBackendError = errorMessage.includes('Unable to connect') || 
                                     errorMessage.includes('backend') || 
                                     errorMessage.includes('Network error');
                
                if (isBackendError) {
                    userFriendlyMessage += "The AI backend server may not be running. Please start the backend server on http://localhost:5000 and try again.";
                } else {
                    userFriendlyMessage += errorMessage;
                }
                
                const fallbackMessage: ChatMessage = {
                    id: fallbackId,
                    type: 'ai',
                    content: userFriendlyMessage,
                    timestamp: new Date().toISOString(),
                    isError: true,
                };
                setChatMessages(prev => [...prev, fallbackMessage]);
                toast.warning(isBackendError 
                    ? 'AI backend is unavailable. Please start the backend server on http://localhost:5000'
                    : `Failed to generate AI response: ${errorMessage}`);
                
                // Resume teaching after error so TTS/playback is not stuck paused
                if (!wasPaused && !isPaused) {
                    resume();
                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.resume();
                    }
                }
                
                // Log detailed error for debugging
                console.error('Chat error details:', {
                    error,
                    errorMessage,
                    sessionId: currentSession?.id,
                    topicId: currentSession?.topicId,
                    message: message.substring(0, 100),
                });
            });
    };

    // Cleanup all timeouts on unmount
    useEffect(() => {
        return () => {
            timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
            timeoutRefs.current = [];
        };
    }, []);

    // Track viewport: 3-panel layout at ≥1280px; single-panel with tabs below
    useEffect(() => {
        const media = window.matchMedia('(max-width: 1279px)');
        const checkMobile = () => setIsMobile(media.matches);
        checkMobile();
        media.addEventListener('change', checkMobile);
        return () => {
            media.removeEventListener('change', checkMobile);
        };
    }, []);

    // Prevent any OS-level scrolling: main screen fits viewport only; body never scrolls on this page
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    // Below 1280px: single-panel mode; reset panel visibility when switching to desktop
    useEffect(() => {
        if (!isMobile) return;
        setCenterPanelVisible(true);
        setRightPanelVisible(true);
    }, [isMobile]);


    const handleGenerateNotes = async () => {
        if (!currentSession || !currentSession.teachingSteps || currentSession.teachingSteps.length === 0) {
            toast.warning('No content available to generate notes from.');
            return;
        }
        try {
            // Extract comprehensive content including spoken content for richer notes
            const content = currentSession.teachingSteps
                .map(s => {
                    // Combine content and spokenContent for comprehensive notes
                    const parts = [];
                    if (s.content) parts.push(s.content);
                    if (s.spokenContent && s.spokenContent !== s.content) {
                        parts.push(s.spokenContent);
                    }
                    return parts.join('\n\n');
                })
                .filter(Boolean);

            if (content.length === 0) {
                toast.warning('No content available to generate notes from.');
                return;
            }
            await generateNotes(currentSession.id, currentSession.topicName, content);
        } catch (error) {
            toast.error('Failed to generate notes. Please try again.');
            console.error('Error generating notes:', error);
        }
    };

    const handleGenerateMindMap = async () => {
        if (!currentSession || !currentSession.teachingSteps || currentSession.teachingSteps.length === 0) {
            toast.warning('No content available to generate mind map from.');
            return;
        }
        try {
            const concepts = currentSession.teachingSteps.map(s => s.title).filter(Boolean);
            if (concepts.length === 0) {
                toast.warning('No concepts available to generate mind map from.');
                return;
            }
            await generateMindMap(currentSession.id, currentSession.topicName, concepts);
        } catch (error) {
            toast.error('Failed to generate mind map. Please try again.');
            console.error('Error generating mind map:', error);
        }
    };

    const handleGenerateFlashcards = async () => {
        if (!currentSession || !currentSession.teachingSteps || currentSession.teachingSteps.length === 0) {
            toast.warning('No content available to generate flashcards from.');
            return;
        }
        try {
            // Extract comprehensive content for better flashcard generation
            const content = currentSession.teachingSteps
                .map(s => {
                    const parts = [];
                    if (s.content) parts.push(s.content);
                    if (s.spokenContent && s.spokenContent !== s.content) {
                        parts.push(s.spokenContent);
                    }
                    // Include key concepts if available
                    if (s.keyConcepts && s.keyConcepts.length > 0) {
                        parts.push(`Key concepts: ${s.keyConcepts.join(', ')}`);
                    }
                    return parts.join('\n\n');
                })
                .filter(Boolean);

            if (content.length === 0) {
                toast.warning('No content available to generate flashcards from.');
                return;
            }
            await generateFlashcards(currentSession.id, content);
        } catch (error) {
            toast.error('Failed to generate flashcards. Please try again.');
            console.error('Error generating flashcards:', error);
        }
    };


    return (
        <div className="fixed inset-0 h-[100dvh] w-full flex flex-col overflow-hidden overflow-x-hidden" style={{ width: '100%', minWidth: '100%' }}>
            {/* Soft gradient background - static, spanning viewport; panels float above */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#e8e4f3] via-[#f5f0fa] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" aria-hidden />
            <div className="fixed inset-0 -z-10 pointer-events-none shadow-[inset_0_0_120px_40px_rgba(139,92,246,0.04)] dark:shadow-[inset_0_0_120px_40px_rgba(0,0,0,0.2)]" aria-hidden />
            {/* Unified header: Home + topic (left); badges, Settings, Profile (right). No volume in header. */}
            <header
                className="shrink-0 safe-top z-20 flex items-center w-full bg-transparent"
                style={{
                    height: 'var(--layout-header-height)',
                    paddingLeft: 'var(--layout-page-px)',
                    paddingRight: 'var(--layout-page-px)',
                }}
            >
                {isMobile ? (
                    <div className="flex items-center justify-between w-full h-full min-w-0 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden" style={{ minHeight: 'var(--layout-header-height)' }}>
                            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent shrink-0">
                                AIra
                            </span>
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <h1 className="font-semibold text-gray-800 dark:text-slate-100 text-sm sm:text-base truncate" id="topic-title">
                                    {currentSession?.topicName || 'Loading...'}
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate" aria-live="polite" aria-atomic="true">
                                    Step {currentStep + 1} of {currentSession?.totalSteps || 0}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center flex-nowrap gap-1.5 sm:gap-2 shrink-0 min-w-0 overflow-hidden justify-end" style={{ minHeight: 'var(--layout-header-height)' }}>
                            <div className="flex items-center flex-row flex-nowrap gap-1.5 sm:gap-2 min-w-0 shrink overflow-hidden justify-end">
                                {selectedProfession && (
                                    <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold shrink-0 border border-indigo-200 dark:border-indigo-700/50 min-w-0 max-w-[70px]" title={selectedProfession.name}>
                                        <Briefcase className="w-3 h-3 shrink-0" aria-hidden />
                                        <span className="truncate">{selectedProfession.name}</span>
                                    </span>
                                )}
                                {subProfessionName && (
                                    <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-semibold shrink-0 border border-purple-200 dark:border-purple-700/50 min-w-0 max-w-[70px]" title={subProfessionName}>
                                        <Sparkles className="w-3 h-3 shrink-0" aria-hidden />
                                        <span className="truncate">{subProfessionName}</span>
                                    </span>
                                )}
                                {subjectName && (
                                    <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold shrink-0 border border-blue-200 dark:border-blue-700/50 min-w-0 max-w-[70px]" title={subjectName}>
                                        <Layers className="w-3 h-3 shrink-0" aria-hidden />
                                        <span className="truncate">{subjectName}</span>
                                    </span>
                                )}
                                {lastUserAction && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white text-xs font-medium shrink-0 min-w-0 max-w-[140px] overflow-hidden"
                                    >
                                        {lastUserAction === 'next-step' && <><ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Next</span></>}
                                        {lastUserAction === 'previous-step' && <><ChevronLeft className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Back</span></>}
                                        {lastUserAction === 'paused' && <><VolumeX className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Paused</span></>}
                                        {lastUserAction === 'resumed' && <><Play className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Resumed</span></>}
                                        {lastUserAction === 'doubt-raised' && <><HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Doubt</span></>}
                                        {lastUserAction === 'message-sent' && <><Send className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Sent</span></>}
                                        {lastUserAction === 'muted' && <><VolumeX className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Muted</span></>}
                                        {lastUserAction === 'unmuted' && <><Volume2 className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Unmuted</span></>}
                                        {lastUserAction === 'auto-advance' && <><ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Next</span></>}
                                    </motion.div>
                                )}
                            </div>
                            <button type="button" onClick={() => navigate('/settings')} className="p-2 shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-ui text-gray-600 dark:text-slate-300 touch-manipulation active:scale-[0.97]" title="Settings" aria-label="Settings"><Settings className="w-5 h-5 shrink-0" aria-hidden /></button>
                            <button type="button" onClick={() => useProfilePanelStore.getState().open()} className="flex items-center justify-center shrink-0 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-ui w-9 h-9 sm:w-10 sm:h-10 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation active:scale-[0.97]" title="Profile" aria-label="Open Profile"><User className="w-5 h-5 flex-shrink-0" aria-hidden /></button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center w-full h-full min-w-0 flex-nowrap" style={{ gap: 'var(--layout-gap)' }}>
                        {/* Column 1 (desktop): AIra branding + topic - Header aligned, NOT aligned with Chat panel */}
                        <div className="flex-shrink-0 flex-grow-0 flex items-center justify-start min-w-0 gap-2 sm:gap-3">
                            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent shrink-0">
                                AIra
                            </span>
                            <span className="text-sm font-medium text-gray-600 dark:text-slate-400 truncate min-w-0" title={currentSession?.topicName || 'Loading...'}>
                                {currentSession?.topicName || 'Loading...'}
                            </span>
                        </div>
                        {/* Column 2 (desktop): Badges + Settings + Profile – single row, no wrap */}
                        <div className="flex-1 flex items-center justify-end min-w-0 gap-2 sm:gap-3 overflow-hidden flex-nowrap" style={{ paddingRight: 'var(--panel-padding)' }}>
                            <div className="flex items-center flex-row flex-nowrap gap-2 sm:gap-3 min-w-0 overflow-hidden justify-end shrink">
                                {selectedProfession && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0 border border-indigo-200 dark:border-indigo-700/50 min-w-0 max-w-[100px]" title={selectedProfession.name}>
                                        <Briefcase className="w-3.5 h-3.5 shrink-0" aria-hidden />
                                        <span className="truncate">{selectedProfession.name}</span>
                                    </span>
                                )}
                                {subProfessionName && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold shrink-0 border border-purple-200 dark:border-purple-700/50 min-w-0 max-w-[100px]" title={subProfessionName}>
                                        <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden />
                                        <span className="truncate">{subProfessionName}</span>
                                    </span>
                                )}
                                {subjectName && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0 border border-blue-200 dark:border-blue-700/50 min-w-0 max-w-[100px]" title={subjectName}>
                                        <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden />
                                        <span className="truncate">{subjectName}</span>
                                    </span>
                                )}
                                {lastUserAction && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white text-xs font-medium shrink-0 min-w-0 max-w-[140px] overflow-hidden"
                                    >
                                        {lastUserAction === 'next-step' && <><ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Next</span></>}
                                        {lastUserAction === 'previous-step' && <><ChevronLeft className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Back</span></>}
                                        {lastUserAction === 'paused' && <><VolumeX className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Paused</span></>}
                                        {lastUserAction === 'resumed' && <><Play className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Resumed</span></>}
                                        {lastUserAction === 'doubt-raised' && <><HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Doubt</span></>}
                                        {lastUserAction === 'message-sent' && <><Send className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Sent</span></>}
                                        {lastUserAction === 'muted' && <><VolumeX className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Muted</span></>}
                                        {lastUserAction === 'unmuted' && <><Volume2 className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Unmuted</span></>}
                                        {lastUserAction === 'auto-advance' && <><ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">Next</span></>}
                                    </motion.div>
                                )}
                            </div>
                            <button type="button" onClick={() => navigate('/settings')} className="p-2 shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-ui text-gray-600 dark:text-slate-300 touch-manipulation active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2" title="Settings" aria-label="Settings"><Settings className="w-5 h-5 shrink-0" aria-hidden /></button>
                            <button type="button" onClick={() => useProfilePanelStore.getState().open()} className="flex items-center justify-center shrink-0 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-ui w-9 h-9 sm:w-10 sm:h-10 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2" title="Profile" aria-label="Open Profile"><User className="w-5 h-5 flex-shrink-0" aria-hidden /></button>
                        </div>
                    </div>
                )}
            </header>

            {/* Mobile Panel Tabs - Explicit panel switching only; compact for panels closer to header */}
            <div className="xl:hidden flex border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 safe-top z-20 relative">
                {[
                    { id: 'home', icon: MessageCircle, label: 'Home' },
                    { id: 'teach', icon: Sparkles, label: 'Learn' },
                    { id: 'studio', icon: Layers, label: 'Studio' },
                ].map((panel) => (
                    <button
                        key={panel.id}
                        type="button"
                        onClick={() => {
                            // Explicit user-initiated panel switch - no automatic switching
                            setMobilePanel(panel.id as typeof mobilePanel);
                        }}
                        className={`flex-1 py-1.5 sm:py-2 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-all min-h-[44px] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-inset ${mobilePanel === panel.id
                            ? 'text-purple-600 dark:text-purple-300 border-b-2 border-purple-500 bg-purple-50 dark:bg-slate-800'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                            }`}
                        aria-label={`Switch to ${panel.label} panel`}
                        aria-pressed={mobilePanel === panel.id}
                    >
                        <panel.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">{panel.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content - full-width; symmetric page padding and gap; Chat flush left, Studio flush right */}
            <div className={`flex-1 flex min-h-0 min-w-0 w-full overflow-hidden relative ${isMobile ? 'h-full pb-2 sm:pb-2.5' : 'xl:px-[var(--layout-page-px)] xl:gap-[var(--layout-gap)] xl:pb-2 sm:pb-2.5 xl:justify-start'}`}>
                {/* Left Panel (Chat) - 20-22% */}
                <motion.div
                    initial={isMobile ? { opacity: 0 } : {}}
                    animate={isMobile ? {
                        opacity: mobilePanel === 'home' ? 1 : 0,
                    } : {
                        width: 'var(--panel-chat-width)'
                    }}
                    transition={{ duration: reduceAnimations ? 0 : TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
                    className={`${isMobile ? 'absolute' : 'absolute xl:relative'} ${isMobile ? 'inset-0' : 'xl:inset-auto'} ${isMobile ? 'w-full h-full' : 'min-w-0 xl:flex-shrink-0 xl:flex-grow-0'} os-panel flex flex-col overflow-hidden z-30 xl:z-auto ${mobilePanel === 'home' ? 'flex' : 'hidden xl:flex'}`}
                    style={isMobile ? {
                        display: mobilePanel === 'home' ? 'flex' : 'none',
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: mobilePanel === 'home' ? 'auto' : 'none'
                    } : {
                        width: 'var(--panel-chat-width)'
                    }}
                >
                    {/* Chat panel: header text centered in panel; secondary subordinate on right */}
                    <div className={`panel-header ${isMobile ? 'safe-top' : ''}`}>
                        <div className="flex-1 min-w-0 flex justify-end items-center" aria-hidden />
                        <h2 className="panel-title truncate shrink-0 px-2 text-center" id="panel-chat-title">{t('chat')} Panel</h2>
                        <div className="flex-1 min-w-0 flex justify-start items-center">
                            {isResolvingDoubt && (
                                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 opacity-90" aria-live="polite">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                    <span className="hidden sm:inline">Resolving doubt...</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Chat messages area with proper scrolling */}
                    <div
                        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden safe-bottom flex flex-col scroll-smooth"
                        style={{ padding: 'var(--panel-padding)', paddingTop: '0.5rem', gap: '0.5rem' }}
                        role="log"
                        aria-live="polite"
                        aria-label="Chat messages"
                    >
                        {/* Empty state - shown when no messages */}
                        {chatMessages.length === 0 && !isWaitingForAI && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                                    <MessageCircle className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Start a conversation</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 max-w-[200px]">
                                        Ask questions about the topic or get help with any doubts
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
                                    {['Explain this concept', 'Give me an example', 'Why is this important?'].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                setInputMessage(suggestion);
                                            }}
                                            className="px-3 py-1.5 text-xs rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Message list */}
                        {chatMessages.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {chatMessages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] sm:max-w-[80%] ${msg.type === 'user' ? 'order-1' : 'order-1'}`}>
                                            {/* Message bubble */}
                                            <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
                                                msg.type === 'user'
                                                    ? 'bg-purple-500 text-white rounded-br-md'
                                                    : msg.isError
                                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 rounded-bl-md'
                                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-md'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            {/* Timestamp */}
                                            <p className={`text-[10px] mt-1 text-gray-400 dark:text-slate-500 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {/* Retry button for error messages */}
                                            {msg.isError && msg.type === 'ai' && (
                                                <button
                                                    onClick={() => {
                                                        // Find last user message and retry
                                                        const lastUserMsg = [...chatMessages].reverse().find(m => m.type === 'user');
                                                        if (lastUserMsg) {
                                                            setInputMessage(lastUserMsg.content);
                                                            setChatMessages(prev => prev.filter(m => m.id !== msg.id));
                                                        }
                                                    }}
                                                    className="mt-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                                                >
                                                    Tap to retry
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        
                        {/* Typing indicator */}
                        {isWaitingForAI && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="bg-gray-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-md">
                                    <div className="flex gap-1.5 items-center" aria-busy="true" aria-label="AI is typing">
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Scroll anchor */}
                        <div ref={chatMessagesEndRef} className="h-1" />
                    </div>

                    {/* Chat input: + file upload left, text input center, send (↑) right */}
                    <div className="shrink-0 safe-bottom flex flex-col justify-end overflow-hidden" style={{ padding: 'var(--panel-padding)', paddingTop: '0.5rem' }}>
                        {/* Uploaded files preview */}
                        {uploadedFiles.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1.5 min-w-0">
                                {uploadedFiles.map((file, index) => {
                                    const fileKey = `${file.name}-${file.size}-${index}`;
                                    const fileSizeKB = (file.size / 1024).toFixed(0);
                                    const fileSizeDisplay = file.size > 1024 * 1024 
                                        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                        : `${fileSizeKB} KB`;
                                    return (
                                        <div
                                            key={fileKey}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs shrink-0 max-w-full min-w-0 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700"
                                        >
                                            <Paperclip className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 shrink-0" />
                                            <span className="text-purple-700 dark:text-purple-300 truncate min-w-0 max-w-[120px]" title={file.name}>{file.name}</span>
                                            <span className="text-purple-500 dark:text-purple-400 text-[10px] shrink-0">({fileSizeDisplay})</span>
                                            <button
                                                type="button"
                                                onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                                                className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded transition-colors shrink-0"
                                                aria-label={`Remove ${file.name}`}
                                                disabled={isWaitingForAI}
                                            >
                                                <X className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        {/* Input container */}
                        <div className={`flex items-center w-full min-w-0 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700 focus-within:ring-2 focus-within:ring-purple-400/50 shadow-sm transition-all ${isWaitingForAI ? 'opacity-75' : ''}`} style={{ minHeight: '44px' }}>
                            {/* File upload button */}
                            <input
                                type="file"
                                id="chat-file-upload-input"
                                multiple
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                disabled={isWaitingForAI}
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    const MAX_FILE_SIZE = 10 * 1024 * 1024;
                                    const allowedTypes = [
                                        'application/pdf',
                                        'application/msword',
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                        'text/plain',
                                        'image/jpeg',
                                        'image/jpg',
                                        'image/png',
                                        'image/gif'
                                    ];
                                    const validFiles: File[] = [];
                                    const errors: string[] = [];
                                    files.forEach((file) => {
                                        if (file.size > MAX_FILE_SIZE) {
                                            errors.push(`${file.name} is too large (max 10MB)`);
                                            return;
                                        }
                                        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|jpg|jpeg|png|gif)$/i)) {
                                            errors.push(`${file.name} is not a supported file type`);
                                            return;
                                        }
                                        validFiles.push(file);
                                    });
                                    if (errors.length > 0) toast.error(errors.join(', '));
                                    if (validFiles.length > 0) setUploadedFiles(prev => [...prev, ...validFiles]);
                                    e.target.value = '';
                                }}
                            />
                            <label
                                htmlFor="chat-file-upload-input"
                                className={`shrink-0 p-3 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-200/50 dark:hover:bg-slate-600/50 transition-colors rounded-l-full ${isWaitingForAI ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                                aria-label="Upload file"
                                title="Upload documents (PDF, Word, images)"
                            >
                                <Plus className="w-5 h-5" />
                            </label>
                            
                            {/* Text input */}
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && !isWaitingForAI) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={isWaitingForAI ? "Waiting for response..." : "Ask a question or type a message…"}
                                disabled={isWaitingForAI}
                                className="flex-1 min-w-0 mx-2 py-2.5 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 disabled:cursor-not-allowed"
                                aria-label="Ask a question or raise a doubt"
                            />
                            
                            {/* Send button */}
                            <button
                                type="button"
                                onClick={handleSendMessage}
                                disabled={isWaitingForAI || (!inputMessage.trim() && uploadedFiles.length === 0)}
                                className={`shrink-0 flex items-center justify-center w-9 h-9 mr-1.5 rounded-full transition-all ${
                                    isWaitingForAI 
                                        ? 'bg-gray-300 dark:bg-slate-600 cursor-not-allowed'
                                        : (!inputMessage.trim() && uploadedFiles.length === 0)
                                            ? 'bg-gray-300 dark:bg-slate-600 cursor-not-allowed'
                                            : 'bg-purple-500 hover:bg-purple-600 active:scale-95 cursor-pointer'
                                } text-white`}
                                aria-label={isWaitingForAI ? "Waiting for response" : "Send message"}
                                aria-busy={isWaitingForAI}
                            >
                                {isWaitingForAI ? (
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                                ) : (
                                    <ArrowUp className="w-4 h-4" aria-hidden />
                                )}
                            </button>
                        </div>
                        
                        {/* Helper text */}
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center mt-1.5 px-2">
                            Press Enter to send • AI responds based on your current lesson
                        </p>
                    </div>
                </motion.div>

                {/* Teaching Panel - Center (55vw), primary workspace */}
                <AnimatePresence>
                    {centerPanelVisible && (
                        <motion.div
                            initial={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            animate={isMobile ? {
                                opacity: mobilePanel === 'teach' ? 1 : 0,
                            } : {
                                width: rightMaximized ? 0 : centerMaximized || !rightPanelVisible
                                    ? 'calc(var(--layout-panels-available) - var(--panel-chat-width) - var(--layout-gap))'
                                    : 'var(--panel-teaching-width)',
                                opacity: rightMaximized ? 0 : 1,
                                minWidth: rightMaximized ? 0 : undefined
                            }}
                            exit={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            transition={{ duration: reduceAnimations ? 0 : TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
                            className={`${isMobile ? 'absolute' : 'absolute xl:relative'} ${isMobile ? 'inset-0' : 'xl:inset-auto'} flex flex-col min-w-0 overflow-hidden os-panel z-30 xl:z-auto ${mobilePanel === 'teach' ? 'flex' : 'hidden xl:flex'} ${isMobile ? 'w-full h-full' : 'w-full xl:flex-shrink-0 xl:flex-grow-0'}`}
                            style={isMobile ? {
                                display: mobilePanel === 'teach' ? 'flex' : 'none',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: mobilePanel === 'teach' ? 'auto' : 'none'
                            } : rightMaximized ? { pointerEvents: 'none' as const, overflow: 'hidden' } : undefined}
                        >
                            {/* Teaching panel: title centered; steps + volume + maximize at panel edge */}
                            <div className={`panel-header ${isMobile ? 'safe-top' : ''}`}>
                                <div className="flex-1 min-w-0 flex justify-end items-center" aria-hidden />
                                <h2 className="panel-title truncate shrink-0 px-2 text-center" id="panel-teaching-title">{t('teaching')} Panel</h2>
                                <div className="flex-1 min-w-0 flex justify-end items-center gap-2 sm:gap-2.5">
                                    <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0 truncate max-w-[120px] sm:max-w-[160px]" aria-label={`Step ${currentStep + 1} of ${currentSession?.totalSteps || 5}`}>Step {currentStep + 1} of {currentSession?.totalSteps || 5}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const m = !isMuted;
                                            setIsMuted(m);
                                            setLastUserAction(m ? 'muted' : 'unmuted');
                                            const t = setTimeout(() => setLastUserAction(null), 2000);
                                            timeoutRefs.current.push(t);
                                            if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                if (m) { window.speechSynthesis.cancel(); setSpeaking(false); }
                                                else if (!isPaused && currentStepData?.spokenContent) {
                                                    window.dispatchEvent(new CustomEvent('speech-start', { detail: { stepId: currentStepData.id, title: currentStepData.title } }));
                                                }
                                            }
                                        }}
                                        className={`shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 rounded-lg transition-all touch-manipulation flex items-center justify-center ${isMuted ? 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'}`}
                                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                                        title={isMuted ? 'Unmute' : 'Mute'}
                                    >
                                        {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden />}
                                    </button>
                                    {!isMobile && (
                                        <button
                                            onClick={() => {
                                                if (centerMaximized) {
                                                    setCenterMaximized(false);
                                                } else {
                                                    setRightMaximized(false);
                                                    setCenterMaximized(true);
                                                }
                                            }}
                                            className="shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-ui text-gray-500 dark:text-slate-400 opacity-80 -mr-0.5 active:scale-[0.97]"
                                            title={centerMaximized ? 'Restore layout' : 'Maximize panel'}
                                            aria-label={centerMaximized ? 'Restore layout' : 'Maximize teaching panel'}
                                        >
                                            {centerMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Large canvas: ~85-90% panel height, 14-16px radius, very light gray */}
                            <div className="flex-1 min-h-0 min-w-0 flex flex-col" style={{ padding: 'var(--panel-padding)', paddingTop: 0 }}>
                                <div className="flex-1 flex flex-col overflow-hidden min-h-0 rounded-[15px] bg-[#F5F6F7] dark:bg-slate-800/60 p-4" style={{ minHeight: '85%' }}>
                                    {/* Teacher Section - Classroom Style; shrink-0 so controls stay visible */}
                                    <div className="shrink-0 flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3">
                                        <div className="relative">
                                            <AIAvatar isSpeaking={isSpeaking && !isPaused} />
                                            {/* Mute/Unmute badge */}
                                            <button
                                                onClick={() => {
                                                    const newMutedState = !isMuted;
                                                    setIsMuted(newMutedState);
                                                    setLastUserAction(newMutedState ? 'muted' : 'unmuted');
                                                    const muteTimeoutId2 = setTimeout(() => setLastUserAction(null), 2000);
                                                    timeoutRefs.current.push(muteTimeoutId2);
                                                    // Stop/resume speech immediately
                                                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                        if (newMutedState) {
                                                            window.speechSynthesis.cancel();
                                                            setSpeaking(false);
                                                        } else if (!isPaused && currentStepData?.spokenContent) {
                                                            // Resume speaking if not paused
                                                            window.dispatchEvent(new CustomEvent('speech-start', {
                                                                detail: { stepId: currentStepData.id, title: currentStepData.title }
                                                            }));
                                                        }
                                                    }
                                                }}
                                                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border border-gray-200 dark:border-slate-600"
                                            >
                                                {isMuted ? <VolumeX className="w-3 h-3 text-red-500" /> : <Volume2 className="w-3 h-3 text-green-500" />}
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                                                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-slate-100 min-w-0 flex-1 truncate">
                                                    {currentStepData?.title || 'Loading...'}
                                                </h2>
                                                {/* Previous | Start Lesson / Raise Doubt / Resume | Next - same row */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setLastUserAction('previous-step');
                                                            const prevStepTimeoutId = setTimeout(() => setLastUserAction(null), 2000);
                                                            timeoutRefs.current.push(prevStepTimeoutId);
                                                            if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                                window.speechSynthesis.cancel();
                                                                setSpeaking(false);
                                                            }
                                                            window.dispatchEvent(new CustomEvent('step-navigation', {
                                                                detail: { direction: 'previous', stepId: currentStepData?.id }
                                                            }));
                                                            previousStep();
                                                        }}
                                                        disabled={currentStep === 0 || !currentSession}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${currentStep === 0 || !currentSession
                                                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                                                            : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 active:scale-95'
                                                            }`}
                                                        aria-label="Previous step"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Previous</span>
                                                    </button>
                                                    <button
                                                        onClick={handleGenerateAiLesson}
                                                        disabled={isGeneratingAiLesson}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                                                    >
                                                        {isGeneratingAiLesson ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                        Generate with AI
                                                    </button>
                                                    {!isSpeaking && !isPaused && (
                                                        <button
                                                            onClick={() => setSpeaking(true)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 transition-all"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                            Start Lesson
                                                        </button>
                                                    )}
                                                    {isSpeaking && !isPaused && (
                                                        <button
                                                            onClick={() => {
                                                                setLastUserAction('doubt-raised');
                                                                const doubtTimeoutId = setTimeout(() => setLastUserAction(null), 2000);
                                                                timeoutRefs.current.push(doubtTimeoutId);
                                                                pause();
                                                                if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                                    window.speechSynthesis.pause();
                                                                }
                                                                if (isMobile) {
                                                                    setMobilePanel('home');
                                                                }
                                                                window.dispatchEvent(new CustomEvent('teaching-paused'));
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full text-sm font-medium transition-all active:scale-95 shadow-lg"
                                                            aria-label="Raise doubt"
                                                        >
                                                            <HelpCircle className="w-4 h-4" />
                                                            Raise Doubt
                                                        </button>
                                                    )}
                                                    {isPaused && (
                                                        <button
                                                            onClick={() => {
                                                                setLastUserAction('resumed');
                                                                const resumeTimeoutId2 = setTimeout(() => setLastUserAction(null), 2000);
                                                                timeoutRefs.current.push(resumeTimeoutId2);
                                                                resume();
                                                                if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                                    window.speechSynthesis.resume();
                                                                }
                                                                window.dispatchEvent(new CustomEvent('teaching-resumed', {
                                                                    detail: { stepId: currentStepData?.id }
                                                                }));
                                                                if (currentStepData?.id) {
                                                                    window.dispatchEvent(new CustomEvent('speech-start', {
                                                                        detail: {
                                                                            stepId: currentStepData.id,
                                                                            title: currentStepData.title || '',
                                                                            resumed: true
                                                                        }
                                                                    }));
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-all active:scale-95 shadow-lg"
                                                            aria-label="Resume teaching"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                            Resume
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setLastUserAction('next-step');
                                                            const nextStepTimeoutId = setTimeout(() => setLastUserAction(null), 2000);
                                                            timeoutRefs.current.push(nextStepTimeoutId);
                                                            if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                                window.speechSynthesis.cancel();
                                                                setSpeaking(false);
                                                            }
                                                            window.dispatchEvent(new CustomEvent('step-navigation', {
                                                                detail: { direction: 'next', stepId: currentStepData?.id }
                                                            }));
                                                            nextStep();
                                                        }}
                                                        disabled={!currentSession || currentStep >= (currentSession?.totalSteps || 0) - 1}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${!currentSession || currentStep >= (currentSession?.totalSteps || 0) - 1
                                                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                                                            : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 active:scale-95'
                                                            }`}
                                                        aria-label="Next step"
                                                    >
                                                        <span className="hidden sm:inline">Next</span>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Speaking/Idle indicator - No text, just visual cue */}
                                            {isSpeaking && !isPaused && (
                                                <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
                                                    <Volume2 className="w-5 h-5 animate-pulse" />
                                                    <div className="flex gap-1">
                                                        <motion.div className="w-1.5 h-4 bg-purple-400 rounded-full" animate={{ scaleY: [1, 0.5, 1] }} transition={{ duration: 0.4, repeat: Infinity }} />
                                                        <motion.div className="w-1.5 h-4 bg-purple-500 rounded-full" animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 0.4, repeat: Infinity }} />
                                                        <motion.div className="w-1.5 h-4 bg-purple-600 rounded-full" animate={{ scaleY: [1, 0.5, 1] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }} />
                                                    </div>
                                                    <span className="text-sm font-medium">Teaching...</span>
                                                </div>
                                            )}

                                            {/* Idle state - Prompt to start */}
                                            {!isSpeaking && !isPaused && (
                                                <p className="text-gray-500 dark:text-slate-400 text-sm italic">
                                                    Click "Start Lesson" to begin...
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Classroom Board - Visual Area; flex-1 min-h-0 so it fills remaining space without scroll */}
                                    {!currentStepData ? (
                                        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                                            <div className="text-center shrink-0">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-4"></div>
                                                <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400">Loading lesson content...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={currentStep}
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    className="flex-1 min-h-0 flex flex-col overflow-hidden"
                                                >
                                                    {/* The Board - fills available space, no fixed min-height */}
                                                    <div className="flex-1 min-h-0 flex flex-col rounded-xl shadow-2xl overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-950 p-1">
                                                        <div className="flex-1 min-h-0 rounded-lg bg-gradient-to-b from-emerald-800 to-emerald-900 p-2 sm:p-4 relative overflow-hidden flex flex-col">
                                                            {/* Board Frame Effect */}
                                                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0idHJhbnNwYXJlbnQiLz4KPGxpbmUgeDE9IjAiIHkxPSIyMCIgeDI9IjIwIiB5Mj0iMjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxsaW5lIHgxPSIyMCIgeTE9IjAiIHgyPSIyMCIgeTI9IjIwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50"></div>

                                                            {/* Topic-specific visuals: scaled to fit panel, centered, responsive in real time */}
                                                            {(() => {
                                                                if (!currentStepData || !topicId) return null;
                                                                const TopicVisual = getTopicVisual(topicId);
                                                                if (!TopicVisual) return null;

                                                                return (
                                                                    <div className="relative z-10 flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden p-1">
                                                                        <div className="w-full h-full min-w-0 min-h-0 flex items-center justify-center">
                                                                            <TopicVisual
                                                                                isSpeaking={isSpeaking && !isPaused}
                                                                                isPaused={isPaused}
                                                                                stepId={currentStepData.id || ''}
                                                                                title={currentStepData.title}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Key Points removed (voice-only explanations) */}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Controls - Pause / Resume; shrink-0 so always visible */}
                            <div className="shrink-0 p-3 sm:p-4 space-y-3" style={{ paddingTop: 'var(--rhythm)' }}>
                                {/* Pause / Resume Button */}
                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={() => {
                                            if (isPaused) {
                                                setLastUserAction('resumed');
                                                const resumeTimeoutId3 = setTimeout(() => setLastUserAction(null), 2000);
                                                timeoutRefs.current.push(resumeTimeoutId3);
                                                resume();
                                                if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                    window.speechSynthesis.resume();
                                                }
                                                window.dispatchEvent(new CustomEvent('teaching-resumed', {
                                                    detail: { stepId: currentStepData?.id }
                                                }));
                                                // Trigger speech start event to sync visuals
                                                if (currentStepData?.id) {
                                                    window.dispatchEvent(new CustomEvent('speech-start', {
                                                        detail: {
                                                            stepId: currentStepData.id,
                                                            title: currentStepData.title || '',
                                                            resumed: true
                                                        }
                                                    }));
                                                }
                                            } else {
                                                setLastUserAction('paused');
                                                const pauseTimeoutId = setTimeout(() => setLastUserAction(null), 2000);
                                                timeoutRefs.current.push(pauseTimeoutId);
                                                pause();
                                                if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                    window.speechSynthesis.pause();
                                                }
                                                // Emit event for visual feedback - ensures visuals pause immediately
                                                window.dispatchEvent(new CustomEvent('teaching-paused', {
                                                    detail: { stepId: currentStepData?.id }
                                                }));
                                            }
                                        }}
                                        className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 shadow-sm border min-h-[44px] active:scale-95 ${isPaused
                                            ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50'
                                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                            }`}
                                        aria-label={isPaused ? "Resume class" : "Pause teaching"}
                                    >
                                        {isPaused ? <Play className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                                        <span className="text-sm">{isPaused ? "Resume Class" : "Pause"}</span>
                                    </button>
                                </div>

                                {/* Enhanced visual feedback for user actions - more engaging and informative */}
                                {lastUserAction && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl z-50 flex items-center gap-2"
                                    >
                                        {lastUserAction === 'next-step' && (
                                            <>
                                                <ChevronRight className="w-4 h-4 animate-pulse" />
                                                <span>Moving to next step...</span>
                                            </>
                                        )}
                                        {lastUserAction === 'previous-step' && (
                                            <>
                                                <ChevronLeft className="w-4 h-4 animate-pulse" />
                                                <span>Going back...</span>
                                            </>
                                        )}
                                        {lastUserAction === 'paused' && (
                                            <>
                                                <VolumeX className="w-4 h-4" />
                                                <span>Paused</span>
                                            </>
                                        )}
                                        {lastUserAction === 'resumed' && (
                                            <>
                                                <Play className="w-4 h-4 animate-pulse" />
                                                <span>Resumed</span>
                                            </>
                                        )}
                                        {lastUserAction === 'doubt-raised' && (
                                            <>
                                                <HelpCircle className="w-4 h-4 animate-pulse" />
                                                <span>Doubt raised - chat is ready</span>
                                            </>
                                        )}
                                        {lastUserAction === 'message-sent' && (
                                            <>
                                                <Send className="w-4 h-4" />
                                                <span>Message sent</span>
                                            </>
                                        )}
                                        {lastUserAction === 'muted' && (
                                            <>
                                                <VolumeX className="w-4 h-4" />
                                                <span>Muted</span>
                                            </>
                                        )}
                                        {lastUserAction === 'unmuted' && (
                                            <>
                                                <Volume2 className="w-4 h-4 animate-pulse" />
                                                <span>Unmuted</span>
                                            </>
                                        )}
                                        {lastUserAction === 'auto-advance' && (
                                            <>
                                                <ChevronRight className="w-4 h-4 animate-pulse" />
                                                <span>Moving to next step...</span>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collapsed Panel Expanders (desktop/tablet only) */}
                {!isMobile && !centerPanelVisible && (
                    <div className="w-10 flex flex-col items-center justify-center border-l border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                        <button
                            onClick={() => setCenterPanelVisible(true)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-ui text-gray-600 dark:text-slate-300 active:scale-[0.97]"
                            title="Expand Teaching Panel"
                            aria-label="Expand Teaching Panel"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-gray-500 dark:text-slate-400 writing-mode-vertical rotate-180 mt-2">Teaching</span>
                    </div>
                )}

                {/* Studio Panel - Right (21vw); aligned with header Studio column */}
                <AnimatePresence>
                    {rightPanelVisible && (
                        <motion.div
                            initial={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            animate={isMobile ? {
                                opacity: mobilePanel === 'studio' ? 1 : 0,
                            } : {
                                width: centerMaximized ? 0 : rightMaximized || !centerPanelVisible
                                    ? 'calc(var(--layout-panels-available) - var(--panel-chat-width) - var(--layout-gap))'
                                    : 'var(--panel-studio-width)',
                                opacity: centerMaximized ? 0 : 1,
                                minWidth: centerMaximized ? 0 : undefined
                            }}
                            exit={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            transition={{ duration: reduceAnimations ? 0 : TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
                            className={`${isMobile ? 'absolute' : 'absolute xl:relative'} ${isMobile ? 'inset-0' : 'xl:inset-auto'} os-panel flex flex-col min-w-0 overflow-hidden z-30 xl:z-auto ${mobilePanel === 'studio' ? 'flex' : 'hidden xl:flex'} ${isMobile ? 'w-full h-full' : 'w-full xl:flex-shrink-0 xl:flex-grow-0'}`}
                            style={isMobile ? {
                                display: mobilePanel === 'studio' ? 'flex' : 'none',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: mobilePanel === 'studio' ? 'auto' : 'none'
                            } : centerMaximized ? { pointerEvents: 'none' as const, overflow: 'hidden' } : undefined}
                        >
                            {/* Studio panel: title centered; maximize/minimize toggle at panel edge only */}
                            <div className={`panel-header ${isMobile ? 'safe-top' : ''}`}>
                                <div className="flex-1 min-w-0 flex justify-end items-center" aria-hidden />
                                <h2 className="panel-title truncate shrink-0 px-2 text-center" id="panel-studio-title">{t('studio')} Panel</h2>
                                <div className="flex-1 min-w-0 flex justify-end items-center">
                                    {!isMobile && (
                                        <button
                                            onClick={() => {
                                                if (rightMaximized) {
                                                    setRightMaximized(false);
                                                } else {
                                                    setCenterMaximized(false);
                                                    setRightMaximized(true);
                                                }
                                            }}
                                            className="shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-ui text-gray-500 dark:text-slate-400 opacity-80 touch-manipulation -mr-0.5 active:scale-[0.97]"
                                            title={rightMaximized ? 'Restore layout' : 'Maximize panel'}
                                            aria-label={rightMaximized ? 'Restore layout' : 'Maximize Studio panel'}
                                        >
                                            {rightMaximized ? <Minimize2 className="w-4 h-4 shrink-0" /> : <Maximize2 className="w-4 h-4 shrink-0" />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Five uniformly sized blocks stacked vertically: 14-16px gaps, aligned to panel padding; no footer */}
                            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" style={{ padding: 'var(--panel-padding)', paddingTop: 0 }}>
                                <div className="flex flex-col w-full" style={{ gap: 'var(--stack-gap)' }}>
                                    {[
                                        { id: 'notes', icon: FileText, label: t('notes') },
                                        { id: 'flashcards', icon: CreditCard, label: t('flashcards') },
                                        { id: 'mindmap', icon: Map, label: t('mindMap') },
                                        { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
                                        { id: 'summary', icon: Sparkles, label: 'Summary' },
                                    ].map((tool) => (
                                        <button
                                            key={tool.id}
                                            onClick={() => setActiveStudioTab(tool.id)}
                                            className={`w-full flex items-center gap-2 transition-ui shrink-0 active:scale-[0.99] ${activeStudioTab === tool.id
                                                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50'
                                                : 'bg-[#F5F6F7] dark:bg-slate-800 hover:bg-[#E8E9EB] dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700'
                                                }`}
                                            style={{
                                                minHeight: 'var(--studio-block-min-height)',
                                                padding: 'var(--panel-padding)',
                                                borderRadius: 'var(--studio-card-radius)',
                                                border: '1px solid'
                                            }}
                                        >
                                            <tool.icon className={`w-5 h-5 shrink-0 ${activeStudioTab === tool.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-slate-400'}`} aria-hidden />
                                            <span className="font-medium text-sm">{tool.label}</span>
                                        </button>
                                    ))}
                                </div>
                                {/* Selected tool content area - below blocks */}
                                <div className="w-full" style={{ marginTop: 'var(--stack-gap)' }}>
                                    {activeStudioTab === 'quiz' && (
                                        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm">
                                            <div className="panel-header border-0">
                                                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 uppercase tracking-wider">AI Knowledge Check</h3>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                                                {!aiQuiz ? (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                                        <HelpCircle className="w-12 h-12 text-purple-400 mb-4 opacity-50" />
                                                        <h4 className="text-base font-semibold mb-2">Unlock Your Assessment</h4>
                                                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Test your mastery of this lesson with a customized AI quiz.</p>
                                                        <button
                                                            onClick={handleGenerateQuiz}
                                                            disabled={isGeneratingQuiz}
                                                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                                                        >
                                                            {isGeneratingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                            Generate AI Quiz
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {aiQuiz.questions.map((q, i: number) => (
                                                            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                                                                <div className="flex gap-3 mb-4">
                                                                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold">{i + 1}</span>
                                                                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200 leading-relaxed">{q.question}</p>
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-2 pl-9">
                                                                    {(q.options ?? []).map((opt: string, optIdx: number) => (
                                                                        <button
                                                                            key={optIdx}
                                                                            className="w-full text-left px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all active:scale-[0.99]"
                                                                        >
                                                                            {opt}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => setAiQuiz(null)}
                                                            className="w-full py-3 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all border border-dashed border-purple-200 dark:border-purple-800"
                                                        >
                                                            Reset Quiz
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeStudioTab === 'summary' && (
                                        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm">
                                            <div className="panel-header border-0">
                                                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 uppercase tracking-wider">Lesson Summary</h3>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mb-4">
                                                        <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium italic">
                                                            "Everything you've learned, distilled into its most essential parts."
                                                        </p>
                                                    </div>
                                                    <div className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                        {currentSession?.teachingSteps.find(s => s.title.toLowerCase().includes('summary'))?.content || "Completing the lesson will unlock the final summary."}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeStudioTab === 'notes' && (
                                        <div className="space-y-3">
                                            <button
                                                onClick={handleGenerateNotes}
                                                disabled={isGeneratingNotes}
                                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isGeneratingNotes ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                                ) : (
                                                    <><FileText className="w-4 h-4" /> {t('generateNotes')}</>
                                                )}
                                            </button>
                                            {sessionNotes.length > 0 ? (
                                                <NotesViewer note={sessionNotes[sessionNotes.length - 1]} />
                                            ) : (
                                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-slate-600">
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Auto-generated notes will appear here as you learn.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {activeStudioTab === 'mindmap' && (
                                        <div className="space-y-3">
                                            <button
                                                onClick={handleGenerateMindMap}
                                                disabled={isGeneratingMindMap}
                                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isGeneratingMindMap ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                                ) : (
                                                    <><Map className="w-4 h-4" /> {t('generateMindMap')}</>
                                                )}
                                            </button>
                                            {sessionMindMaps.length > 0 ? (
                                                <MindMapViewer mindMap={sessionMindMaps[sessionMindMaps.length - 1]} />
                                            ) : (
                                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-slate-600 min-h-[200px] flex items-center justify-center">
                                                    <p className="text-xs text-gray-400 dark:text-slate-500">Mind map visualization will appear here</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {activeStudioTab === 'flashcards' && (
                                        <div className="space-y-3">
                                            <button
                                                onClick={handleGenerateFlashcards}
                                                disabled={isGeneratingFlashcards}
                                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isGeneratingFlashcards ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                                ) : (
                                                    <><CreditCard className="w-4 h-4" /> {t('generateFlashcards')}</>
                                                )}
                                            </button>
                                            {sessionFlashcards.length > 0 ? (
                                                <FlashcardViewer
                                                    flashcards={sessionFlashcards}
                                                    onPerformanceUpdate={updateFlashcardPerformance}
                                                />
                                            ) : (
                                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-slate-600">
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 text-center">Flashcards will be generated based on your learning session.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {activeStudioTab === 'quiz' && (
                                        <QuizViewer topic={currentSession?.topicName || 'General'} />
                                    )}
                                    {activeStudioTab === 'summary' && (
                                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-slate-600">
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Session summary and progress will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collapsed Right Panel Expander (desktop/tablet only) */}
                {!isMobile && !rightPanelVisible && (
                    <div className="w-10 flex flex-col items-center justify-center border-l border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                        <button
                            onClick={() => setRightPanelVisible(true)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-ui text-gray-600 dark:text-slate-300 active:scale-[0.97]"
                            title="Expand Studio Panel"
                            aria-label="Expand Studio Panel"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-gray-500 dark:text-slate-400 writing-mode-vertical rotate-180 mt-2">Studio</span>
                    </div>
                )}
            </div>

            {/* Verification Quiz Modal */}
            <AnimatePresence>
                {showVerificationQuiz && currentQuiz && (
                    <VerificationQuiz
                        quiz={currentQuiz}
                        onComplete={() => {
                            if (activeDoubt) {
                                confirmUnderstanding(activeDoubt.id);
                            }
                            resume();
                        }}
                        onSkip={() => {
                            hideQuiz();
                            resume();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
