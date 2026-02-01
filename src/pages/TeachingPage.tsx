import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
    Volume2, VolumeX, Maximize2, Minimize2, Settings, Loader2, HelpCircle, User, Play, ChevronLeft, ChevronRight, Home, Upload, Paperclip, X
} from 'lucide-react';
import QuizViewer from '../components/studio/QuizViewer';
import { getCourseContent } from '../data/courseRegistry';
import { defaultSteps } from '../data/courses/defaultCourse';
import { getTopicVisual } from '../components/teaching/topicVisuals';
import { findTopicInfo, formatTopicName } from '../utils/topicUtils';
import { pickBestHumanVoice } from '../utils/voice';
import { toast } from '../stores/toastStore';

// Mock teaching content


// AI Avatar Component - Enhanced with more realistic animations
function AIAvatar({ isSpeaking }: { isSpeaking: boolean }) {
    return (
        <motion.div
            className="relative w-20 h-20"
            animate={{ 
                y: isSpeaking ? [0, -5, 0] : 0,
                scale: isSpeaking ? [1, 1.05, 1] : 1
            }}
            transition={{ 
                duration: 0.5, 
                repeat: isSpeaking ? Infinity : 0,
                ease: "easeInOut"
            }}
        >
            {/* Enhanced glow effect when speaking */}
            <motion.div 
                className="absolute inset-0 bg-yellow-300/30 rounded-full blur-lg"
                animate={isSpeaking ? {
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1]
                } : {
                    opacity: 0.2,
                    scale: 1
                }}
                transition={{ duration: 0.8, repeat: isSpeaking ? Infinity : 0 }}
            />
            <div className="relative w-full h-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <div className="relative">
                    {/* Enhanced eye animations - more realistic blinking and speaking */}
                    <div className="flex gap-2 mb-1">
                        <motion.div
                            className="w-2.5 h-2.5 bg-gray-800 rounded-full"
                            animate={isSpeaking ? { 
                                scaleY: [1, 0.3, 1, 0.5, 1],
                                scaleX: [1, 1.1, 1]
                            } : { 
                                scaleY: 1,
                                scaleX: 1
                            }}
                            transition={{ 
                                duration: 0.4, 
                                repeat: isSpeaking ? Infinity : 0,
                                ease: "easeInOut"
                            }}
                        />
                        <motion.div
                            className="w-2.5 h-2.5 bg-gray-800 rounded-full"
                            animate={isSpeaking ? { 
                                scaleY: [1, 0.3, 1, 0.5, 1],
                                scaleX: [1, 1.1, 1]
                            } : { 
                                scaleY: 1,
                                scaleX: 1
                            }}
                            transition={{ 
                                duration: 0.4, 
                                repeat: isSpeaking ? Infinity : 0, 
                                delay: 0.1,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                    {/* Enhanced mouth animation - more realistic speaking motion */}
                    <motion.div
                        className="w-6 h-3 border-b-2 border-gray-800 rounded-b-full mx-auto"
                        animate={isSpeaking ? { 
                            scaleX: [1, 1.3, 0.9, 1.2, 1],
                            scaleY: [1, 0.8, 1.1, 0.9, 1]
                        } : { 
                            scaleX: 1,
                            scaleY: 1
                        }}
                        transition={{ 
                            duration: 0.35, 
                            repeat: isSpeaking ? Infinity : 0,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

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

    const { settings } = useSettingsStore();
    const { profile } = useUserStore();
    // Get user's profession and sub-profession for contextual teaching
    const subProfessionName = profile?.profession?.subProfessions?.find(sp => sp.id === profile?.subProfession)?.name;

    // Initialize chat with contextual greeting based on topic
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    
    // Set initial chat message when topic loads
    useEffect(() => {
        if (currentSession?.topicName) {
            const professionContext = profile?.profession?.name 
                ? ` As someone in ${profile.profession.name}, I'll tailor the explanations to your field.`
                : '';
            setChatMessages([{
                id: '1',
                type: 'ai',
                content: `Hello! I'm here to help you learn ${currentSession.topicName}.${professionContext} Feel free to ask any questions as we go through the lesson!`,
                timestamp: new Date().toISOString()
            }]);
        } else {
            // Clear messages if no session
            setChatMessages([]);
        }
    }, [currentSession?.topicName, profile?.profession?.name]);
    const [inputMessage, setInputMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [speechProgress, setSpeechProgress] = useState(0); // Track speech progress for visual sync
    const [lastUserAction, setLastUserAction] = useState<string | null>(null); // Track last user action for feedback
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Track uploaded files for doubt submission
    const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]); // Track all timeouts for cleanup
    const [isMobile, setIsMobile] = useState(false); // Track mobile viewport

    // Get current session resources
    const sessionId = currentSession?.id || '';

    // Mobile panel state (local) - Only one panel visible on mobile at a time
    // 'home' = Pre-teaching state (chat/questions), 'teach' = Teaching panel (default), 'studio' = Post-teaching resources
    const [mobilePanel, setMobilePanel] = useState<'home' | 'teach' | 'studio'>('teach');
    // Studio tab state (local)
    const [activeStudioTab, setActiveStudioTab] = useState<string>('notes');
    // Panel visibility states for minimize/maximize
    const [centerPanelVisible, setCenterPanelVisible] = useState(true);
    const [rightPanelVisible, setRightPanelVisible] = useState(true);
    // Panel maximize states
    const [centerMaximized, setCenterMaximized] = useState(false);
    const [rightMaximized, setRightMaximized] = useState(false);
    // Store previous visibility states before maximizing
    const [previousCenterVisible, setPreviousCenterVisible] = useState(true);
    const [previousRightVisible, setPreviousRightVisible] = useState(true);

    // Resources for session
    const sessionNotes = notes.filter(n => n.sessionId === sessionId);
    const sessionMindMaps = mindMaps.filter(m => m.sessionId === sessionId);
    const sessionFlashcards = flashcards.filter(f => f.sessionId === sessionId);

    // Current step data - safe access with bounds checking
    const currentStepData = currentSession?.teachingSteps?.[currentStep] ?? null;

    // Extract user context for stable dependencies
    const userProfessionName = profile?.profession?.name || '';
    const userSubProfessionId = profile?.subProfession || '';

    // Initialize session
    // Init session on mount or topic change
    useEffect(() => {
        if (!topicId) {
            // If no topicId, redirect to dashboard or show message
            toast.warning('No topic selected. Redirecting to dashboard...');
            const redirectTimeoutId = setTimeout(() => navigate('/dashboard'), 2000);
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
        const topicName = topicInfo?.name || formatTopicName(topicId);
        const topicDescription = topicInfo?.description;
        
        // Get user's profession and preferences for contextual teaching
        const userProfession = userProfessionName || undefined;
        const userSubProfession = userSubProfessionId || undefined;
        
        // Get course content - will generate comprehensive content if not pre-defined
        // Content generation will use user context for personalized teaching
        let teachingSteps = getCourseContent(
            topicId,
            topicName,
            topicDescription,
            subjectArea || undefined
        ) || [];
        
        // Enhance steps with user context if available
        if (userProfession && teachingSteps.length > 0) {
            // Add profession-specific context to welcome step
            const welcomeStep = teachingSteps[0];
            if (welcomeStep && welcomeStep.id.includes('intro')) {
                const professionContext = userSubProfession 
                    ? `, specifically ${userSubProfession}`
                    : '';
                const professionText = `As someone in ${userProfession}${professionContext}, you'll find this particularly relevant to your field.`;
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
            toast.info(`Starting ${topicName} - ${teachingSteps.length} steps ready`);
        }

        const session: TeachingSession = {
            id: 'session_' + Date.now(),
            userId: 'user_1',
            topicId: topicId,
            topicName: topicName,
            startTime: new Date().toISOString(),
            status: 'active',
            currentStep: 0,
            totalSteps: teachingSteps.length,
            progress: 0,
            teachingSteps: teachingSteps, // Load dynamic content (pre-defined or AI-generated)
            doubts: [],
        };

        startSession(session);

    }, [topicId, startSession, currentSession?.topicId, navigate, userProfessionName, userSubProfessionId]);

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
                        setSpeechProgress(0);
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
                
                // Track speech progress for visual synchronization
                utterance.onboundary = (event) => {
                    if (isMounted && event.name === 'sentence' && processedText.length > 0) {
                        // Prevent division by zero
                        const progress = Math.min(100, Math.max(0, (event.charIndex / processedText.length) * 100));
                        setSpeechProgress(progress);
                        // Emit events for visual components to react
                        if (currentStepData?.id) {
                            window.dispatchEvent(new CustomEvent('speech-boundary', {
                                detail: { 
                                    type: 'sentence', 
                                    charIndex: event.charIndex,
                                    progress: progress,
                                    stepId: currentStepData.id
                                }
                            }));
                        }
                    }
                };
                utterance.onend = () => {
                    if (!isMounted) return;
                    setSpeaking(false);
                    setSpeechProgress(100);
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

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: messageContent,
            timestamp: new Date().toISOString(),
        };

        setChatMessages(prev => [...prev, userMessage]);
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

        // Generate contextual AI response based on current topic, step, and user question
        const responseTimeoutId = setTimeout(() => {
            const contextualResponse = generateContextualResponse(
                message,
                currentSession?.topicName || 'this topic',
                currentStepData?.title || 'the current step',
                currentStepData?.content || '',
                profile?.profession?.name
            );
            
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: contextualResponse,
                timestamp: new Date().toISOString(),
            };
            setChatMessages(prev => [...prev, aiResponse]);
            
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
        }, 1000);
        timeoutRefs.current.push(responseTimeoutId);
    };

    // Cleanup all timeouts on unmount
    useEffect(() => {
        return () => {
            timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
            timeoutRefs.current = [];
        };
    }, []);

    // Track mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768; // md breakpoint
            setIsMobile(mobile);
            // On mobile, ensure body doesn't scroll
            if (mobile) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
            document.body.style.overflow = '';
        };
    }, []);

    // Mobile should be single-panel, full-screen: disable desktop-only panel controls
    useEffect(() => {
        if (!isMobile) return;
        // Force panels back to their default visible/non-maximized state on mobile
        setCenterMaximized(false);
        setRightMaximized(false);
        setCenterPanelVisible(true);
        setRightPanelVisible(true);
    }, [isMobile]);

    // Generate contextual, realistic, and engaging AI responses (adapts instantly to settings)
    const generateContextualResponse = (
        userQuestion: string,
        topicName: string,
        currentStepTitle: string,
        currentStepContent: string,
        userProfession?: string
    ): string => {
        const question = userQuestion.toLowerCase();
        const tutor = settings.aiTutor;

        const addPersonalityPrefix = (msg: string) => {
            if (tutor.personality === 'direct') return msg;
            if (tutor.personality === 'formal') return `Certainly. ${msg}`;
            if (tutor.personality === 'humorous') return `Good question—let’s make this painless. ${msg}`;
            // encouraging (default)
            return msg;
        };

        const applyResponseStyle = (msg: string) => {
            if (tutor.responseStyle === 'concise') return trimToSentences(msg, 2);
            if (tutor.responseStyle === 'interactive') return `${msg}\n\nQuick check: what part feels most unclear—definition, steps, or an example?`;
            if (tutor.responseStyle === 'adaptive') return msg.length > 600 ? trimToSentences(msg, 3) : msg;
            return msg; // detailed
        };
        
        // Enhanced context-aware responses with more engaging, realistic, conversational language
        if (question.includes('what') || question.includes('explain') || question.includes('mean')) {
            if (currentStepContent) {
                const firstSentence = currentStepContent.split('.')[0] || 'let me explain this concept clearly';
                const professionNote = userProfession 
                    ? `As someone in ${userProfession}, you'll find this particularly relevant because it directly applies to your field. `
                    : 'This is a fundamental concept that forms the foundation of understanding. ';
                const encouragements = [
                    "I'm glad you asked! ",
                    "That's a great question! ",
                    "Excellent question! ",
                    "I love that you're asking about this! ",
                    "That's exactly the right question to ask! "
                ];
                const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
                const transitions = [
                    "Let me walk you through this step by step so it really clicks.",
                    "Let me break this down in a way that will make perfect sense.",
                    "Let me explain this clearly so you can see how it all fits together.",
                    "Let me guide you through this so you understand it deeply."
                ];
                const transition = transitions[Math.floor(Math.random() * transitions.length)];
                const base = `${encouragement}Based on what we're covering in "${currentStepTitle}", ${firstSentence}. ${professionNote}${transition}`;
                const withAnalogy = tutor.analogiesEnabled ? `${base} Think of it like a chain—each link matters.` : base;
                const withClinical = tutor.clinicalExamplesEnabled && /cardiac|heart|ecg|neurology|diagnosis|treatment/i.test(topicName)
                    ? `${withAnalogy} Clinically, you’ll see this guiding real decisions.`
                    : withAnalogy;
                return applyResponseStyle(addPersonalityPrefix(withClinical));
            }
            const stepNote = currentStepTitle 
                ? `In our current step on "${currentStepTitle}", we're exploring exactly this. `
                : '';
            const engagingIntros = [
                "That's an excellent question! I love that you're thinking critically about this. ",
                "Great question! This shows you're really engaging with the material. ",
                "Wonderful question! This demonstrates you're actively learning. ",
                "I appreciate this question! It shows you're connecting the dots. "
            ];
            const engagingIntro = engagingIntros[Math.floor(Math.random() * engagingIntros.length)];
            const explanations = [
                "The key thing to understand is that this concept connects to everything we've been learning. Think of it like this...",
                "Here's the beautiful part - this concept ties together all the pieces we've been exploring. Imagine it this way...",
                "What makes this fascinating is how it links to what we've covered. Picture it like this...",
                "The real insight here is how this connects the dots. Consider it from this angle..."
            ];
            const explanation = explanations[Math.floor(Math.random() * explanations.length)];
            return applyResponseStyle(addPersonalityPrefix(`${engagingIntro}Let me break down ${topicName} for you. ${stepNote}${explanation}`));
        }
        
        if (question.includes('how') || question.includes('work')) {
            const howExplanation = currentStepContent 
                ? currentStepContent.substring(0, 200) + '...'
                : `In ${topicName}, the process involves several key steps.`;
            const professionApplication = userProfession 
                ? `In ${userProfession}, you'd typically see this applied when solving real-world problems. `
                : 'Let me walk you through this step by step so you can see the whole picture. ';
            const encouragements = [
                "I love that you're asking 'how' - that shows you're really thinking deeply about this! ",
                "Excellent question! Understanding 'how' is where the real learning happens. ",
                "Perfect question! The 'how' is what makes concepts truly click. ",
                "Great thinking! Asking 'how' means you're ready to understand the mechanics. "
            ];
            const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
            const insights = [
                "Notice how each step builds on the previous one - that's the beauty of this concept!",
                "See how everything flows together? That's what makes this so elegant!",
                "Watch how each piece connects - that's where the real understanding happens!",
                "Observe how it all comes together - that's the magic of this process!"
            ];
            const insight = insights[Math.floor(Math.random() * insights.length)];
            return applyResponseStyle(addPersonalityPrefix(`${encouragement}Here's how it works: ${howExplanation} ${professionApplication}${insight}`));
        }
        
        if (question.includes('why') || question.includes('important')) {
            const whyContext = currentStepTitle 
                ? `In "${currentStepTitle}", we're learning this because it's the foundation for everything that follows. `
                : `In ${topicName}, this is important because it connects to so many other concepts. `;
            const professionImportance = userProfession 
                ? `For professionals in ${userProfession}, this knowledge is essential because you'll use it daily in your work. `
                : 'This concept is fundamental because it helps you understand the bigger picture. ';
            const thoughtfulNotes = [
                "That's a thoughtful question! Understanding 'why' is crucial - it's what separates memorization from true understanding. ",
                "Great question! When you understand 'why', the 'what' and 'how' become much clearer. ",
                "Excellent thinking! The 'why' is what gives meaning to everything else. ",
                "I love this question! Understanding 'why' transforms how you see the whole subject. "
            ];
            const thoughtfulNote = thoughtfulNotes[Math.floor(Math.random() * thoughtfulNotes.length)];
            const realizations = [
                "Think about it this way - once you grasp why this matters, everything else falls into place.",
                "Here's the insight - when you understand the 'why', the 'what' and 'how' become intuitive.",
                "The key realization is this - understanding 'why' unlocks deeper comprehension of everything related.",
                "This is powerful - when you see the 'why', you'll notice it everywhere in this field."
            ];
            const realization = realizations[Math.floor(Math.random() * realizations.length)];
            return applyResponseStyle(addPersonalityPrefix(`${thoughtfulNote}${whyContext}${professionImportance}${realization}`));
        }
        
        if (question.includes('example') || question.includes('instance')) {
            const exampleIntro = currentStepContent 
                ? 'Building on what we just covered, imagine this scenario: '
                : `In ${topicName}, a great example would be: `;
            const professionExample = userProfession 
                ? `In ${userProfession}, you might encounter this when working on projects or solving client problems. `
                : 'Here\'s a real-world scenario that illustrates this perfectly: ';
            const enthusiasms = [
                "Absolutely! Examples make everything clearer. ",
                "Great idea! Let me give you a concrete example that will really help. ",
                "Perfect! Examples bring concepts to life. ",
                "Excellent! Let me show you a practical example that will make this click. "
            ];
            const enthusiasm = enthusiasms[Math.floor(Math.random() * enthusiasms.length)];
            const takeaways = [
                "This example shows you exactly how the theory applies in practice - and that's where the real learning happens!",
                "See how this example demonstrates the concept? That's the power of practical application!",
                "Notice how this example brings the concept to life? That's when understanding deepens!",
                "This example perfectly illustrates the concept - and that's how you'll remember it!"
            ];
            const takeaway = takeaways[Math.floor(Math.random() * takeaways.length)];
            return applyResponseStyle(addPersonalityPrefix(`${enthusiasm}${exampleIntro}${professionExample}${takeaway}`));
        }
        
        if (question.includes('confused') || question.includes('understand') || question.includes('unclear')) {
            const stepContext = currentStepTitle 
                ? `The concept in "${currentStepTitle}" can be tricky at first - you're not alone in finding it challenging! `
                : '';
            const explanation = currentStepContent 
                ? currentStepContent.substring(0, 150)
                : `Think of ${topicName} like this...`;
            const supportiveMessages = [
                "No worries at all - confusion is part of learning! Let's work through this together. ",
                "That's completely normal! Complex concepts take time to click. Let me explain it differently. ",
                "I totally understand! This can be challenging. Let me break it down in a way that will help. ",
                "Don't worry - many students find this tricky at first. Let's tackle it step by step. "
            ];
            const supportive = supportiveMessages[Math.floor(Math.random() * supportiveMessages.length)];
            const followUps = [
                "Does that help clarify things? Feel free to ask more questions - I'm here to help you understand!",
                "Does that make more sense now? I'm happy to explain further if you need!",
                "Is that clearer? Keep asking questions - that's how we learn!",
                "Does that help? Don't hesitate to ask if anything is still unclear!"
            ];
            const followUp = followUps[Math.floor(Math.random() * followUps.length)];
            return applyResponseStyle(addPersonalityPrefix(`${supportive}${stepContext}Let me break this down in a simpler way: ${explanation} ${followUp}`));
        }
        
        // Enhanced default contextual response with more engagement and variety
        const stepContext = currentStepTitle 
            ? `We're currently exploring "${currentStepTitle}", and your question relates perfectly to what we're learning. `
            : '';
        const professionContext = userProfession 
            ? `As someone studying ${userProfession}, `
            : '';
        const explanation = currentStepContent 
            ? currentStepContent.substring(0, 200) + '...'
            : 'This is an important aspect of the topic we\'re covering.';
        const engagingMessages = [
            "That's a great question! I'm glad you're thinking about this. ",
            "Excellent question! This shows you're really engaging with the material. ",
            "I love this question! It shows you're actively learning. ",
            "Wonderful question! This demonstrates you're connecting the concepts. ",
            "Perfect question! It shows you're thinking critically. "
        ];
        const engaging = engagingMessages[Math.floor(Math.random() * engagingMessages.length)];
        const explanations = [
            "Let me explain this clearly: ",
            "Here's what you need to know: ",
            "Let me break this down for you: ",
            "Here's the key insight: ",
            "Let me clarify this for you: "
        ];
        const explanationIntro = explanations[Math.floor(Math.random() * explanations.length)];
        const followUps = [
            "Would you like me to go deeper into any specific part, or do you have another question?",
            "Does that help? Feel free to ask if you want me to elaborate on anything!",
            "Is there a particular aspect you'd like me to explore further?",
            "Would you like more details on any part of this, or do you have another question?"
        ];
        const followUp = followUps[Math.floor(Math.random() * followUps.length)];
        return applyResponseStyle(addPersonalityPrefix(`${engaging}${stepContext}${professionContext}${explanationIntro}${explanation} ${followUp}`));
    };

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
        <div className={`${isMobile ? 'fixed inset-0' : 'h-screen'} flex flex-col bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden`}>
            {/* Header - Responsive */}
            <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-sm px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 safe-top z-20">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                        title="Home"
                        aria-label="Go to dashboard"
                    >
                        <Home className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-slate-300" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <h1 className="font-semibold text-gray-800 dark:text-slate-100 text-sm sm:text-base truncate" id="topic-title">
                            {currentSession?.topicName || 'Loading...'}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-slate-400" aria-live="polite" aria-atomic="true">
                            Step {currentStep + 1} of {currentSession?.totalSteps || 0}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                    <button
                                        onClick={() => {
                                            const newMutedState = !isMuted;
                                            setIsMuted(newMutedState);
                                            setLastUserAction(newMutedState ? 'muted' : 'unmuted');
                                            const muteTimeoutId = setTimeout(() => setLastUserAction(null), 2000);
                                            timeoutRefs.current.push(muteTimeoutId);
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
                                        className={`p-2 rounded-lg transition-all active:scale-95 ${isMuted ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300'}`}
                                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                                    >
                                        {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    </button>

                    {/* Context Badges - Hidden on mobile */}
                    {profile?.profession && (
                        <div className="hidden lg:flex items-center gap-2 mx-1">
                            <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-medium whitespace-nowrap">
                                {profile.profession.name}
                            </span>
                            {subProfessionName && (
                                <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-medium whitespace-nowrap">
                                    {subProfessionName}
                                </span>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-slate-300"
                        title="Settings"
                        aria-label="Settings"
                    >
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-slate-300"
                        title="Profile"
                    >
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile Panel Tabs - Explicit panel switching only */}
            <div className="md:hidden flex border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 safe-top z-20 relative">
                {[
                    { id: 'home', icon: MessageCircle, label: 'Home' },
                    { id: 'teach', icon: Sparkles, label: 'Learn' },
                    { id: 'studio', icon: Layers, label: 'Studio' },
                ].map((panel) => (
                    <button
                        key={panel.id}
                        onClick={() => {
                            // Explicit user-initiated panel switch - no automatic switching
                            setMobilePanel(panel.id as typeof mobilePanel);
                        }}
                        className={`flex-1 py-3 sm:py-4 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-all min-h-[48px] ${mobilePanel === panel.id
                            ? 'text-purple-600 dark:text-purple-300 border-b-2 border-purple-500 bg-purple-50 dark:bg-slate-800'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                            }`}
                        aria-label={`Switch to ${panel.label} panel`}
                        aria-pressed={mobilePanel === panel.id}
                    >
                        <panel.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden xs:inline">{panel.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content - 3 Panel Layout: page padding 24-32px, gap 20-24px, Chat 20-22% / Teaching 56-60% / Studio 18-20% */}
            <div className={`flex-1 flex overflow-hidden relative ${isMobile ? 'h-full' : 'px-[var(--layout-page-px)] gap-[var(--layout-gap)]'} ${isMobile ? '' : ''}`}>
                {/* Home Panel (Chat) - 20-22% width, internal padding 16-20px */}
                <motion.div 
                    initial={isMobile ? { opacity: 0 } : {}}
                    animate={isMobile ? {
                        opacity: mobilePanel === 'home' ? 1 : 0,
                    } : {}}
                    transition={{ duration: 0.3 }}
                    className={`${isMobile ? 'absolute' : 'absolute md:relative'} ${isMobile ? 'inset-0' : 'md:inset-auto'} ${isMobile ? 'w-full h-full' : 'w-full md:min-w-0'} border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col z-30 md:z-auto ${mobilePanel === 'home' ? 'flex' : 'hidden md:flex'} md:flex-[0_0_var(--panel-chat-width)]`}
                    style={isMobile ? { 
                        display: mobilePanel === 'home' ? 'flex' : 'none',
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: mobilePanel === 'home' ? 'auto' : 'none'
                    } : undefined}
                >
                    {/* Chat header - aligned, padding 16-20px, 16-20px below */}
                    <div className={`border-b border-gray-200 dark:border-slate-700 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-900/70 ${isMobile ? 'safe-top' : ''}`} style={{ padding: 'var(--panel-padding)', marginBottom: 'var(--panel-header-gap)' }}>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                            <span className="font-medium text-gray-700 dark:text-slate-200 text-sm sm:text-base">{t('chat')}</span>
                        </div>
                        {isResolvingDoubt && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                <span className="hidden sm:inline">Resolving doubt...</span>
                            </span>
                        )}
                    </div>

                    {/* Two stacked content blocks (~70-90px each), then flexible space */}
                    <div className="shrink-0 flex flex-col gap-[var(--stack-gap)]" style={{ paddingLeft: 'var(--panel-padding)', paddingRight: 'var(--panel-padding)' }}>
                        <div className="rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50" style={{ minHeight: 'var(--chat-block-height)' }} />
                        <div className="rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50" style={{ minHeight: 'var(--chat-block-height)' }} />
                    </div>

                    {/* Chat Messages - flexible middle, ~8px rhythm */}
                    <div className="flex-1 overflow-y-auto safe-bottom space-y-2" style={{ padding: 'var(--panel-padding)', paddingTop: 'var(--rhythm)' }}>
                        {chatMessages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] sm:max-w-[90%] px-3 py-2 rounded-xl text-xs sm:text-sm break-words ${msg.type === 'user'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'bg-white shadow-sm border border-gray-100'
                                    }`}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search/input area - bottom-aligned, height 40-44px, panel padding */}
                    <div className="border-t border-gray-200 shrink-0 safe-bottom flex flex-col justify-end" style={{ padding: 'var(--panel-padding)', minHeight: 'var(--chat-search-height)' }}>
                        {/* Display uploaded files */}
                        {uploadedFiles.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                                {uploadedFiles.map((file, index) => {
                                    // Use file name + index as key for better stability
                                    const fileKey = `${file.name}-${file.size}-${index}`;
                                    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                                    return (
                                        <div
                                            key={fileKey}
                                            className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs"
                                        >
                                            <Paperclip className="w-3 h-3 text-purple-600 shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-purple-700 truncate max-w-[120px]" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <span className="text-purple-500 text-[10px]">
                                                    {fileSizeMB} MB
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                                }}
                                                className="p-0.5 hover:bg-purple-100 rounded transition-colors shrink-0"
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                <X className="w-3 h-3 text-purple-600" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="flex gap-2 items-center" style={{ minHeight: 'var(--chat-search-height)' }}>
                            {/* Hidden file input */}
                            <input
                                type="file"
                                id="file-upload-input"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
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
                                        // Check file size
                                        if (file.size > MAX_FILE_SIZE) {
                                            errors.push(`${file.name} is too large (max 10MB)`);
                                            return;
                                        }
                                        
                                        // Check file type
                                        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|jpg|jpeg|png|gif)$/i)) {
                                            errors.push(`${file.name} is not a supported file type`);
                                            return;
                                        }
                                        
                                        validFiles.push(file);
                                    });
                                    
                                    // Show errors if any
                                    if (errors.length > 0) {
                                        toast.error(errors.join(', '));
                                    }
                                    
                                    // Add valid files
                                    if (validFiles.length > 0) {
                                        setUploadedFiles(prev => [...prev, ...validFiles]);
                                    }
                                    
                                    // Reset input to allow selecting same file again
                                    e.target.value = '';
                                }}
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                            />
                            <label
                                htmlFor="file-upload-input"
                                className="p-2.5 sm:p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                                aria-label="Upload file"
                                title="Upload supporting documents"
                            >
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                            </label>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask a question or raise a doubt..."
                                className="flex-1 px-3 py-2.5 sm:py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm min-h-[44px]"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="p-2.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Send message"
                            >
                                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Teaching Panel - Center (56-60%), main workspace 85-90% height, padding 16-20px */}
                <AnimatePresence>
                    {centerPanelVisible && (
                        <motion.div
                            initial={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            animate={isMobile ? {
                                opacity: mobilePanel === 'teach' ? 1 : 0,
                            } : {
                                width: centerMaximized
                                    ? 'calc(100% - var(--panel-chat-width) - var(--layout-gap))'
                                    : (rightPanelVisible ? 'var(--panel-teaching-width)' : 'calc(100% - var(--panel-chat-width) - var(--layout-gap))'),
                                opacity: 1
                            }}
                            exit={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`${isMobile ? 'absolute' : 'absolute md:relative'} ${isMobile ? 'inset-0' : 'md:inset-auto'} flex flex-col bg-gradient-to-b from-slate-50 to-white z-30 md:z-auto ${mobilePanel === 'teach' ? 'flex' : 'hidden md:flex'} ${isMobile ? 'w-full h-full' : 'w-full md:min-w-0'}`}
                            style={isMobile ? { 
                                display: mobilePanel === 'teach' ? 'flex' : 'none',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: mobilePanel === 'teach' ? 'auto' : 'none'
                            } : undefined}
                        >
                            {/* Header - aligned, padding 16-20px, 16-20px below */}
                            <div className={`border-b border-gray-200 flex items-center justify-between bg-white/80 shrink-0 ${isMobile ? 'safe-top' : ''}`} style={{ padding: 'var(--panel-padding)', marginBottom: 'var(--panel-header-gap)' }}>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    <span className="font-medium text-gray-700">{t('teaching')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Step {currentStep + 1} of {currentSession?.totalSteps || 5}</span>
                                    {/* Desktop/tablet only: maximize/minimize controls */}
                                    {!isMobile && (
                                        <button
                                            onClick={() => {
                                                if (centerMaximized) {
                                                    // Restore to previous state
                                                    setCenterMaximized(false);
                                                    setCenterPanelVisible(previousCenterVisible);
                                                    setRightPanelVisible(previousRightVisible);
                                                } else {
                                                    // Maximize center panel - save current state and maximize
                                                    setPreviousCenterVisible(centerPanelVisible);
                                                    setPreviousRightVisible(rightPanelVisible);
                                                    setCenterMaximized(true);
                                                    setRightPanelVisible(false);
                                                }
                                            }}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                                            title={centerMaximized ? "Restore to original size" : "Maximize panel"}
                                            aria-label={centerMaximized ? "Restore teaching panel" : "Maximize teaching panel"}
                                        >
                                            {centerMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Main content area - 85-90% of panel height, internal padding 16-20px */}
                            <div className="flex-1 flex flex-col overflow-y-auto min-h-0" style={{ padding: 'var(--panel-padding)' }}>
                                {/* Teacher Section - Classroom Style */}
                                <div className="flex items-start gap-4 mb-4">
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
                                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                                        >
                                            {isMuted ? <VolumeX className="w-3 h-3 text-red-500" /> : <Volume2 className="w-3 h-3 text-green-500" />}
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-lg font-bold text-gray-800">
                                                {currentStepData?.title || 'Loading...'}
                                            </h2>
                                            {/* Play/Raise Doubt Control */}
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
                                                        // On mobile, switch to Home panel to allow user to submit question via search bar
                                                        if (isMobile) {
                                                            setMobilePanel('home');
                                                        }
                                                        window.dispatchEvent(new CustomEvent('teaching-paused'));
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 rounded-full text-sm font-medium transition-all active:scale-95 shadow-lg border"
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
                                                        // Emit event for visual feedback - ensures visuals resume immediately
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
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-all active:scale-95 shadow-lg"
                                                    aria-label="Resume teaching"
                                                >
                                                    <Play className="w-4 h-4" />
                                                    Resume
                                                </button>
                                            )}
                                        </div>

                                        {/* Speaking/Idle indicator - No text, just visual cue */}
                                        {isSpeaking && !isPaused && (
                                            <div className="flex items-center gap-2 text-purple-500">
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
                                            <p className="text-gray-500 text-sm italic">
                                                Click "Start Lesson" to begin...
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Classroom Board - Visual Area */}
                                {!currentStepData ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-gray-500">Loading lesson content...</p>
                                        </div>
                                    </div>
                                ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="flex-1"
                                    >
                                        {/* The Board */}
                                        <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-xl shadow-2xl p-1 mb-4">
                                            <div className="bg-gradient-to-b from-emerald-800 to-emerald-900 rounded-lg p-4 min-h-[200px] relative overflow-hidden">
                                                {/* Board Frame Effect */}
                                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0idHJhbnNwYXJlbnQiLz4KPGxpbmUgeDE9IjAiIHkxPSIyMCIgeDI9IjIwIiB5Mj0iMjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxsaW5lIHgxPSIyMCIgeTE9IjAiIHgyPSIyMCIgeTI9IjIwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50"></div>

                                                {/* Topic-specific visuals ONLY (no generic/placeholder visuals) */}
                                                {(() => {
                                                    if (!currentStepData || !topicId) return null;
                                                    const TopicVisual = getTopicVisual(topicId);
                                                    if (!TopicVisual) return null;

                                                    return (
                                                        <div className="relative z-10 w-full h-full flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
                                                            <TopicVisual
                                                                isSpeaking={isSpeaking && !isPaused}
                                                                isPaused={isPaused}
                                                                stepId={currentStepData.id || ''}
                                                                title={currentStepData.title}
                                                            />
                                                            {/* Enhanced speech progress indicator - more visible and engaging */}
                                                            {isSpeaking && !isPaused && (
                                                                <motion.div
                                                                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-1.5 bg-white/30 rounded-full overflow-hidden shadow-lg"
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.3 }}
                                                                >
                                                                    <motion.div
                                                                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${speechProgress}%` }}
                                                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                                                    />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Key Points removed (voice-only explanations) */}
                                    </motion.div>
                                </AnimatePresence>
                                )}
                            </div>

                            {/* Controls - Step Navigation & Actions */}
                            <div className="p-4 border-t border-gray-200 space-y-3">
                                {/* Step Navigation Buttons */}
                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => {
                                            setLastUserAction('previous-step');
                                            const prevStepTimeoutId = setTimeout(() => setLastUserAction(null), 2000);
                                            timeoutRefs.current.push(prevStepTimeoutId);
                                            // Stop current speech when navigating
                                            if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                window.speechSynthesis.cancel();
                                                setSpeaking(false);
                                            }
                                            // Emit navigation event for visual feedback
                                            window.dispatchEvent(new CustomEvent('step-navigation', {
                                                detail: { direction: 'previous', stepId: currentStepData?.id }
                                            }));
                                            previousStep();
                                        }}
                                        disabled={currentStep === 0 || !currentSession}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                            currentStep === 0 || !currentSession
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 active:scale-95'
                                        }`}
                                        aria-label="Previous step"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">Previous</span>
                                    </button>
                                    
                                    <div className="flex-1 text-center">
                                        <span className="text-sm text-gray-600">
                                            Step {currentStep + 1} of {currentSession?.totalSteps || 0}
                                        </span>
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            setLastUserAction('next-step');
                                            const nextStepTimeoutId = setTimeout(() => setLastUserAction(null), 2000);
                                            timeoutRefs.current.push(nextStepTimeoutId);
                                            // Stop current speech when navigating
                                            if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                window.speechSynthesis.cancel();
                                                setSpeaking(false);
                                            }
                                            // Emit navigation event for visual feedback
                                            window.dispatchEvent(new CustomEvent('step-navigation', {
                                                detail: { direction: 'next', stepId: currentStepData?.id }
                                            }));
                                            nextStep();
                                        }}
                                        disabled={!currentSession || currentStep >= (currentSession?.totalSteps || 0) - 1}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                            !currentSession || currentStep >= (currentSession?.totalSteps || 0) - 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 active:scale-95'
                                        }`}
                                        aria-label="Next step"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                
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
                                        className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 shadow-sm border min-h-[44px] active:scale-95 ${
                                            isPaused
                                                ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
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
                {!isMobile && !centerPanelVisible && !centerMaximized && (
                    <div className="w-10 flex flex-col items-center justify-center border-l border-gray-200 bg-gray-50">
                        <button
                            onClick={() => {
                                setCenterPanelVisible(true);
                                setCenterMaximized(false);
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                            title="Expand Teaching Panel"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-gray-500 writing-mode-vertical rotate-180 mt-2">Teaching</span>
                    </div>
                )}

                {/* Studio Panel - 18-20% width, header + five uniform tool blocks, padding 16-20px, no footer */}
                <AnimatePresence>
                    {rightPanelVisible && (
                        <motion.div
                            initial={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            animate={isMobile ? {
                                opacity: mobilePanel === 'studio' ? 1 : 0,
                            } : {
                                width: rightMaximized
                                    ? 'calc(100% - var(--panel-chat-width) - var(--layout-gap))'
                                    : (centerPanelVisible ? 'var(--panel-studio-width)' : 'calc(100% - var(--panel-chat-width) - var(--layout-gap))'),
                                opacity: 1
                            }}
                            exit={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`${isMobile ? 'absolute' : 'absolute md:relative'} ${isMobile ? 'inset-0' : 'md:inset-auto'} border-l border-gray-200 bg-white flex flex-col z-30 md:z-auto ${mobilePanel === 'studio' ? 'flex' : 'hidden md:flex'} ${isMobile ? 'w-full h-full' : 'w-full md:min-w-0'}`}
                            style={isMobile ? { 
                                display: mobilePanel === 'studio' ? 'flex' : 'none',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: mobilePanel === 'studio' ? 'auto' : 'none'
                            } : undefined}
                        >
                            {/* Studio header - aligned, padding 16-20px, 16-20px below */}
                            <div className={`border-b border-gray-200 flex items-center justify-between shrink-0 ${isMobile ? 'safe-top' : ''}`} style={{ padding: 'var(--panel-padding)', marginBottom: 'var(--panel-header-gap)' }}>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-purple-500" />
                                    <span className="font-medium text-gray-700">{t('studio')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isMobile && (
                                        <button
                                            onClick={() => {
                                                if (rightMaximized) {
                                                    setRightMaximized(false);
                                                    setCenterPanelVisible(previousCenterVisible);
                                                    setRightPanelVisible(previousRightVisible);
                                                } else {
                                                    setPreviousCenterVisible(centerPanelVisible);
                                                    setPreviousRightVisible(rightPanelVisible);
                                                    setRightMaximized(true);
                                                    setCenterPanelVisible(false);
                                                }
                                            }}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                                            title={rightMaximized ? "Restore to original size" : "Maximize panel"}
                                            aria-label={rightMaximized ? "Restore studio panel" : "Maximize studio panel"}
                                        >
                                            {rightMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Five uniformly sized tool blocks stacked vertically with consistent spacing */}
                            <div className="flex-1 overflow-y-auto flex flex-col min-h-0" style={{ padding: 'var(--panel-padding)', paddingTop: 'var(--rhythm)' }}>
                                {[
                                    { id: 'notes', icon: FileText, label: t('notes'), count: sessionNotes.length },
                                    { id: 'mindmap', icon: Map, label: t('mindMap'), count: sessionMindMaps.length },
                                    { id: 'flashcards', icon: CreditCard, label: t('flashcards'), count: sessionFlashcards.length },
                                    { id: 'quiz', icon: HelpCircle, label: 'Quiz', count: 0 },
                                    { id: 'summary', icon: Sparkles, label: 'Summary', count: 0 },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveStudioTab(tab.id)}
                                        className={`w-full rounded-lg border text-left flex items-center gap-2 transition-colors shrink-0 ${activeStudioTab === tab.id
                                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300'
                                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200'
                                            }`}
                                        style={{ minHeight: 'var(--studio-block-min-height)', padding: 'var(--panel-padding)', marginBottom: 'var(--stack-gap)' }}
                                    >
                                        <tab.icon className="w-4 h-4 text-purple-500 shrink-0" />
                                        <span className="font-medium text-sm">{tab.label}</span>
                                        {tab.count > 0 && (
                                            <span className="ml-auto w-5 h-5 bg-purple-500 text-white rounded-full text-[10px] flex items-center justify-center">
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                                {/* Selected tool content - begins near top, consistent spacing */}
                                <div className="flex-1 min-h-0 pt-1" style={{ marginTop: 'var(--rhythm)' }}>
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
                {!isMobile && !rightPanelVisible && !rightMaximized && (
                    <div className="w-10 flex flex-col items-center justify-center border-l border-gray-200 bg-gray-50">
                        <button
                            onClick={() => {
                                setRightPanelVisible(true);
                                setRightMaximized(false);
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                            title="Expand Studio Panel"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-gray-500 writing-mode-vertical rotate-180 mt-2">Studio</span>
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
