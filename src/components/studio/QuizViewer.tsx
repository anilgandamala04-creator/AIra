import { useState } from 'react';
import { Check, X, Award, RotateCcw } from 'lucide-react';

interface QuizViewerProps {
    topic: string;
    onComplete?: (score: number) => void;
}

interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

// Mock question generator
const generateQuestions = (topic: string): Question[] => {
    return [
        {
            id: 1,
            text: `What is a primary concept in ${topic}?`,
            options: [
                'Basic fundamental principles',
                'Advanced theoretical applications',
                'Historical context only',
                'Unrelated administrative tasks'
            ],
            correctAnswer: 0,
            explanation: 'Understanding the fundamentals is the first step in mastering any topic.'
        },
        {
            id: 2,
            text: 'Which of the following best describes the core function?',
            options: [
                'It operates randomly',
                'It follows a structured process',
                'It has no defined function',
                'It reverses the output'
            ],
            correctAnswer: 1,
            explanation: 'Most systems in this field rely on structured, predictable processes.'
        },
        {
            id: 3,
            text: 'How does this apply to real-world scenarios?',
            options: [
                'It is purely theoretical',
                'It is only used in labs',
                'It has practical applications in industry',
                'It is obsolete'
            ],
            correctAnswer: 2,
            explanation: 'The practical application is what gives this topic its relevance.'
        }
    ];
};

export default function QuizViewer({ topic, onComplete }: QuizViewerProps) {
    const [questions] = useState(() => generateQuestions(topic));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

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

        if (index === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            // Score was already updated in handleOptionClick, so just pass it
            if (onComplete) onComplete(score);
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Award className="w-10 h-10 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">Quiz Completed!</h3>
                    <p className="text-gray-500 dark:text-slate-400">You scored</p>
                    <p className="text-4xl font-bold text-purple-600 my-2">{score} / {questions.length}</p>
                </div>
                <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Question {currentQuestionIndex + 1}/{questions.length}
                </span>
                <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                    {topic}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-800 dark:text-slate-100 mb-6 leading-relaxed">
                    {currentQuestion.text}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedOption === index;
                        const isCorrect = index === currentQuestion.correctAnswer;
                        const showCorrectness = isAnswered && (isSelected || isCorrect);

                        let buttonClass = "w-full p-4 text-left rounded-lg border transition-all duration-200 relative group ";

                        if (isAnswered) {
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

                {isAnswered && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <span className="font-bold block mb-1">Explanation:</span>
                            {currentQuestion.explanation}
                        </p>
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
