import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Award, RotateCcw, Eye, HelpCircle, Sparkles, Loader2, AlertCircle, Pause, Play } from 'lucide-react';
import { getTopicVisual } from '../teaching/topicVisualRegistry';
import { useSettingsStore } from '../../stores/settingsStore';
import type { Quiz, QuizAttempt, QuizQuestion } from '../../services/quizService';
import { loadPausedQuiz, savePausedQuiz, clearPausedQuiz, getRemainingSecondsAfterPause } from '../../services/quizPersistence';

interface QuizViewerProps {
    topic: string;
    subject?: string;
    quiz?: Quiz | null;
    onComplete?: (attempt: QuizAttempt) => void;
    embedded?: boolean;
    /** When quiz is null, call this to trigger AI quiz generation (e.g. from TeachingPage). */
    onRequestGenerate?: () => void;
    /** When quiz is null and onRequestGenerate not provided, link to this topic ID for "generate first" CTA. */
    topicId?: string;
    isGenerating?: boolean;
}

// Quiz questions come from AI generation or static course data; no mock generator used.

export default function QuizViewer({ topic, subject, quiz, onComplete, embedded, onRequestGenerate, topicId, isGenerating }: QuizViewerProps) {
    const [pausedQuizState, setPausedQuizState] = useState<ReturnType<typeof loadPausedQuiz>>(null);
    const [restoreFromPaused, setRestoreFromPaused] = useState<NonNullable<ReturnType<typeof loadPausedQuiz>> | null>(null);

    useEffect(() => {
        if (topicId) {
            const paused = loadPausedQuiz(topicId);
            setPausedQuizState(paused);
        } else {
            setPausedQuizState(null);
        }
    }, [topicId]);

    // Paused quiz prompt: offer Resume or Start over (only when we have topicId and a paused quiz with questions)
    if (topicId && pausedQuizState && !restoreFromPaused && pausedQuizState.quiz?.questions?.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[280px] p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <Pause className="w-12 h-12 text-amber-500 mb-4" />
                <h4 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-2">Quiz paused</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-sm">
                    You have a paused quiz for <strong>{topic}</strong>. Resume where you left off or start over?
                </p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setRestoreFromPaused(pausedQuizState)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all shadow-md"
                    >
                        <Play className="w-4 h-4" />
                        Resume quiz
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            clearPausedQuiz(topicId);
                            setPausedQuizState(null);
                        }}
                        className="px-6 py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-full font-medium transition-all"
                    >
                        Start over
                    </button>
                </div>
            </div>
        );
    }

    // When restoring from paused, use the paused quiz; otherwise use prop quiz
    const effectiveQuiz = restoreFromPaused ? restoreFromPaused.quiz : quiz;

    // When no quiz: show CTA to generate (or link to topic), never use mock questions
    if (!effectiveQuiz?.questions?.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[280px] p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <HelpCircle className="w-12 h-12 text-purple-400 mb-4 opacity-50" />
                <h4 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-2">Generate a quiz from this topic first</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-sm">
                    Complete the lesson or generate an AI quiz to test your mastery of <strong>{topic}</strong>.
                </p>
                {onRequestGenerate ? (
                    <button
                        type="button"
                        onClick={onRequestGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-full font-medium transition-all shadow-md active:scale-[0.98]"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate AI Quiz
                    </button>
                ) : topicId ? (
                    <Link
                        to={`/learn/${topicId}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all"
                    >
                        Open topic to generate quiz
                    </Link>
                ) : (
                    <Link to="/curriculum" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                        Go to Curriculum →
                    </Link>
                )}
            </div>
        );
    }

    return (
        <QuizRunner
            key={restoreFromPaused ? `resume-${restoreFromPaused.pausedAt}` : `fresh-${effectiveQuiz.id}`}
            quiz={effectiveQuiz}
            restoreState={restoreFromPaused}
            topic={topic}
            subject={subject}
            topicId={topicId}
            embedded={embedded}
            onComplete={onComplete}
        />
    );
}

type PausedState = NonNullable<ReturnType<typeof loadPausedQuiz>>;

function QuizRunner({
    quiz,
    restoreState,
    topic,
    subject,
    topicId,
    embedded,
    onComplete,
}: {
    quiz: Quiz;
    restoreState: PausedState | null;
    topic: string;
    subject?: string;
    topicId?: string;
    embedded?: boolean;
    onComplete?: (attempt: import('../../services/quizService').QuizAttempt) => void;
}) {
    const showCorrectSetting = useSettingsStore((s) => s.settings.quiz?.showCorrectAnswer ?? 'after_each');
    const showCorrectAfterEach = showCorrectSetting === 'after_each';

    const timeLimitMinutes = quiz.timeLimit ?? 0;
    const endTimeRef = useRef<number>(0);

    const [questions, setQuestions] = useState<QuizQuestion[]>(() => restoreState?.quiz.questions ?? quiz.questions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => restoreState?.currentQuestionIndex ?? 0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(() => restoreState?.score ?? 0);
    const [showResult, setShowResult] = useState(false);
    const [startTime, setStartTime] = useState(() => restoreState?.startTime ?? Date.now());
    const [timeUp, setTimeUp] = useState(false);
    const [wrongQuestionIndices, setWrongQuestionIndices] = useState<number[]>(() => restoreState?.wrongQuestionIndices ?? []);
    const [answeredWrong, setAnsweredWrong] = useState<Array<{ question: QuizQuestion; selectedIndex: number }>>(() => restoreState?.answeredWrong ?? []);

    const getInitialRemainingSeconds = () => {
        if (timeLimitMinutes <= 0) return 0;
        if (restoreState) {
            return getRemainingSecondsAfterPause(restoreState);
        }
        endTimeRef.current = Date.now() + timeLimitMinutes * 60 * 1000;
        return Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    };

    const [remainingSeconds, setRemainingSeconds] = useState<number>(getInitialRemainingSeconds);
    const [pausedNow, setPausedNow] = useState(false);

    useEffect(() => {
        if (timeLimitMinutes > 0 && restoreState && endTimeRef.current === 0) {
            const rem = getRemainingSecondsAfterPause(restoreState);
            endTimeRef.current = Date.now() + rem * 1000;
        } else if (timeLimitMinutes > 0 && !restoreState) {
            endTimeRef.current = Date.now() + timeLimitMinutes * 60 * 1000;
        }
    }, [timeLimitMinutes, restoreState]);

    // If we restored past the last question (user had answered last and paused), show completion
    useEffect(() => {
        if (restoreState && currentQuestionIndex >= questions.length && questions.length > 0) {
            setShowResult(true);
        }
    }, [restoreState, currentQuestionIndex, questions.length]);

    useEffect(() => {
        if (timeLimitMinutes <= 0 || showResult) return;
        const interval = setInterval(() => {
            const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
            setRemainingSeconds(left);
            if (left <= 0) setTimeUp(true);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLimitMinutes, showResult]);

    useEffect(() => {
        if (!timeUp || showResult) return;
        setShowResult(true);
        if (onComplete && quiz) {
            const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
            const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
            onComplete({
                quizId: quiz.id,
                answers: {},
                score,
                totalPoints,
                percentage,
                timeSpent: Math.round((Date.now() - startTime) / 1000),
                completedAt: new Date().toISOString()
            });
            if (topicId) clearPausedQuiz(topicId);
        }
    }, [timeUp, showResult, onComplete, quiz, score, questions, startTime, topicId]);

    if (pausedNow) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <Pause className="w-12 h-12 text-amber-500 mb-4" />
                <h4 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-2">Quiz paused</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">Progress saved. Return to this topic and open the Quiz tab to resume.</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    // Safety check: ensure we have a valid question
    if (!currentQuestion) {
        return (
            <div className="text-center text-gray-500 dark:text-slate-400 py-8">
                No questions available
            </div>
        );
    }

    const handleOptionClick = (index: number) => {
        if (isAnswered || !currentQuestion) return;
        setSelectedOption(index);
        setIsAnswered(true);

        const correct = index === currentQuestion.correctAnswer;
        if (correct) {
            setScore((prev: number) => prev + 1);
        } else {
            setWrongQuestionIndices((prev) => [...prev, currentQuestionIndex]);
            setAnsweredWrong((prev) => [...prev, { question: currentQuestion, selectedIndex: index }]);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev: number) => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            if (onComplete && quiz) {
                const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
                const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
                onComplete({
                    quizId: quiz.id,
                    answers: {}, // Simplified for tracking
                    score: score,
                    totalPoints: totalPoints,
                    percentage: percentage,
                    timeSpent: Math.round((Date.now() - startTime) / 1000),
                    completedAt: new Date().toISOString()
                });
                if (topicId) clearPausedQuiz(topicId);
            }
        }
    };

    const handlePause = () => {
        if (!topicId) return;
        const now = Date.now();
        // If user has answered current question, resume at next one to avoid double-counting
        const nextIndex = isAnswered ? Math.min(currentQuestionIndex + 1, questions.length) : currentQuestionIndex;
        savePausedQuiz({
            topicId,
            topicName: topic,
            subject,
            quiz,
            currentQuestionIndex: nextIndex,
            score,
            wrongQuestionIndices,
            answeredWrong,
            startTime,
            remainingSecondsAtPause: remainingSeconds,
            pausedAt: now,
            timeLimitMinutes,
        });
        setPausedNow(true);
    };

    const handleRetry = () => {
        setQuestions(quiz.questions);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
        setWrongQuestionIndices([]);
        setAnsweredWrong([]);
        setStartTime(Date.now());
    };

    const handleRetryWrongOnly = () => {
        const wrongQuestions = wrongQuestionIndices.map((i) => quiz.questions[i]).filter(Boolean);
        if (wrongQuestions.length === 0) return;
        setQuestions(wrongQuestions);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
        setWrongQuestionIndices([]);
        setAnsweredWrong([]);
        setStartTime(Date.now());
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6 overflow-y-auto">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2 shrink-0">
                    <Award className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">{timeUp ? "Time's up!" : 'Quiz Completed!'}</h3>
                    <p className="text-gray-500 dark:text-slate-400">You scored</p>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 my-2">{score} / {questions.length}</p>
                </div>
                {!showCorrectAfterEach && answeredWrong.length > 0 && (
                    <div className="w-full max-w-lg text-left space-y-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            Review wrong answers
                        </h4>
                        {answeredWrong.map(({ question, selectedIndex }, i) => (
                            <div key={i} className="text-sm">
                                <p className="font-medium text-gray-700 dark:text-slate-200 mb-1" data-reading-content>{question.question}</p>
                                <p className="text-red-600 dark:text-red-400" data-reading-content>You chose: {question.options?.[selectedIndex]}</p>
                                <p className="text-green-600 dark:text-green-400" data-reading-content>Correct: {question.options?.[question.correctAnswer as number]}</p>
                                <p className="text-gray-600 dark:text-slate-400 mt-1" data-reading-content>{question.explanation}</p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </button>
                    {wrongQuestionIndices.length > 0 && (
                        <button
                            onClick={handleRetryWrongOnly}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            <AlertCircle className="w-4 h-4" />
                            Retry wrong only ({wrongQuestionIndices.length})
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full min-h-0 min-w-0 max-w-full bg-white dark:bg-slate-900 ${embedded ? '' : 'rounded-xl shadow-sm border border-gray-100 dark:border-slate-700'} overflow-hidden`}>
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center gap-2 bg-gray-50 dark:bg-slate-800 shrink-0 min-w-0 flex-wrap">
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate min-w-0">
                    Question {currentQuestionIndex + 1}/{questions.length}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                    {topicId && (
                        <button
                            type="button"
                            onClick={handlePause}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                            title="Pause and resume later"
                        >
                            <Pause className="w-3.5 h-3.5" />
                            Pause
                        </button>
                    )}
                    {timeLimitMinutes > 0 && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${remainingSeconds <= 60 ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300'}`} title="Time remaining">
                            {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
                        </span>
                    )}
                    <span className="text-xs font-bold px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full whitespace-nowrap">
                        {topic}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
                <h3 className="text-lg font-medium text-gray-800 dark:text-slate-100 mb-6 leading-relaxed" data-reading-content>
                    {currentQuestion.question}
                </h3>

                {/* Visual Aid - Always shown (Visual-Only Mode) */}
                <div className="mb-6 space-y-2">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-500 shrink-0" />
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Reference Visual</p>
                    </div>
                    <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 flex items-center justify-center p-4">
                        {(() => {
                            // Use topic name as ID fallback if needed
                            const visualType = currentQuestion.visualType;
                            const visualPrompt = currentQuestion.visualPrompt;

                            const VisualComp = getTopicVisual(topic, {
                                visualType,
                                visualPrompt,
                                subjectName: subject
                            });

                            if (!VisualComp) return null;

                            return (
                                <VisualComp
                                    isSpeaking={false}
                                    isPaused={true}
                                    stepId={String(currentQuestion.id)}
                                    title={topic}
                                    visualType={visualType}
                                    visualPrompt={visualPrompt}
                                    topicName={topic}
                                />
                            );
                        })()}
                    </div>
                </div>

                <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => {
                        const isSelected = selectedOption === index;
                        const isCorrect = index === currentQuestion.correctAnswer;
                        const showCorrectness = showCorrectAfterEach && isAnswered && (isSelected || isCorrect);

                        let buttonClass = "w-full p-4 text-left rounded-lg border transition-all duration-200 relative group ";

                        if (isAnswered && showCorrectAfterEach) {
                            if (index === currentQuestion.correctAnswer) {
                                buttonClass += "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/60 text-green-800 dark:text-green-200";
                            } else if (isSelected) {
                                buttonClass += "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200";
                            } else {
                                buttonClass += "bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-500 opacity-60";
                            }
                        } else {
                            buttonClass += "bg-white dark:bg-slate-900/40 border-gray-200 dark:border-slate-700 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 hover:shadow-sm";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(index)}
                                disabled={isAnswered}
                                className={buttonClass}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {showCorrectness && (
                                        <span>
                                            {isCorrect ? <Check className="w-5 h-5 text-green-500" /> : null}
                                            {isSelected && !isCorrect ? <X className="w-5 h-5 text-red-500" /> : null}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {isAnswered && showCorrectAfterEach && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-sm text-blue-800 dark:text-blue-200" data-reading-content>
                            <span className="font-bold block mb-1">Explanation:</span>
                            {currentQuestion.explanation}
                        </p>
                        {'correctRate' in currentQuestion && typeof (currentQuestion as { correctRate?: number }).correctRate === 'number' && (
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 italic">
                                About {(currentQuestion as { correctRate: number }).correctRate}% of learners got this right.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        </div>
    );
}
