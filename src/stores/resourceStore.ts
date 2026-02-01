import { create } from 'zustand';
import type { GeneratedNote, MindMap, MindMapNode, Flashcard } from '../types';
import { toast } from './toastStore';

// Helper function to extract topic name from content
function extractTopicNameFromContent(content?: string[]): string | undefined {
    if (!content || content.length === 0) return undefined;
    
    // Try to find topic name in first few sentences
    const firstContent = content[0] || '';
    const titleMatch = firstContent.match(/(?:Welcome to|Introduction to|Overview of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (titleMatch) {
        return titleMatch[1];
    }
    
    // Try to find capitalized phrases that might be topic names
    const capitalizedMatch = firstContent.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/);
    if (capitalizedMatch) {
        return capitalizedMatch[1];
    }
    
    return undefined;
}

interface ResourceStore {
    // Notes
    notes: GeneratedNote[];
    isGeneratingNotes: boolean;
    generateNotes: (sessionId: string, topicName: string, content: string[]) => Promise<GeneratedNote>;

    // Mind Maps
    mindMaps: MindMap[];
    isGeneratingMindMap: boolean;
    generateMindMap: (sessionId: string, topicName: string, concepts: string[]) => Promise<MindMap>;

    // Flashcards
    flashcards: Flashcard[];
    isGeneratingFlashcards: boolean;
    generateFlashcards: (sessionId: string, content?: string[]) => Promise<Flashcard[]>;

    // Flashcard review
    currentReviewIndex: number;
    setCurrentReviewIndex: (index: number) => void;
    updateFlashcardPerformance: (id: string, performance: 'again' | 'hard' | 'good' | 'easy') => void;

    // Clear
    clearSessionResources: (sessionId: string) => void;
}

// Enhanced note generation - topic-specific and comprehensive
const generateMockNotes = (sessionId: string, topicName: string, content: string[]): GeneratedNote => {
    // Extract key information from content
    const fullContent = content.join('\n\n');
    const sentences = fullContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyConcepts = extractKeyConcepts(fullContent, topicName);
    const mainPoints = extractMainPoints(fullContent, sentences);
    
    // Generate comprehensive sections based on content
    const sections = generateNoteSections(topicName, fullContent, keyConcepts, mainPoints);
    
    return {
        id: `note_${Date.now()}`,
        sessionId,
        topicName,
        title: `${topicName} - Comprehensive Study Notes`,
        content: fullContent,
        sections: sections,
        userDoubts: [],
        createdAt: new Date().toISOString(),
        qualityScore: calculateQualityScore(sections, fullContent),
    };
};

// Helper function to extract key concepts from content
function extractKeyConcepts(content: string, topicName: string): string[] {
    const concepts: string[] = [];
    const topicWords = topicName.toLowerCase().split(/\s+/);
    
    // Extract important terms (capitalized words, technical terms)
    const words = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    const uniqueWords = [...new Set(words)].filter(w => 
        w.length > 3 && 
        !topicWords.some(tw => w.toLowerCase().includes(tw)) &&
        !['The', 'This', 'That', 'These', 'Those', 'What', 'When', 'Where', 'How', 'Why'].includes(w)
    );
    
    concepts.push(...uniqueWords.slice(0, 8));
    return concepts;
}

// Helper function to extract main points
function extractMainPoints(_content: string, sentences: string[]): string[] {
    // Find sentences with key indicators
    const keyIndicators = ['important', 'key', 'essential', 'critical', 'fundamental', 'main', 'primary', 'significant'];
    const mainPoints = sentences
        .filter(s => {
            const lower = s.toLowerCase();
            return keyIndicators.some(indicator => lower.includes(indicator)) || 
                   s.length > 50 && s.length < 200; // Medium-length sentences often contain main points
        })
        .slice(0, 10)
        .map(s => s.trim());
    
    return mainPoints;
}

// Generate comprehensive note sections
function generateNoteSections(topicName: string, _content: string, keyConcepts: string[], mainPoints: string[]): GeneratedNote['sections'] {
    const sections: GeneratedNote['sections'] = [];
    
    // Section 1: Introduction & Overview
    sections.push({
        heading: 'Introduction & Overview',
        content: `This comprehensive guide covers ${topicName}, providing you with essential knowledge and practical insights. ${mainPoints[0] || `Understanding ${topicName} is fundamental to mastering this subject area.`}`,
        highlights: [
            `Core topic: ${topicName}`,
            keyConcepts[0] || 'Fundamental concepts',
            'Practical applications'
        ],
    });
    
    // Section 2: Key Concepts
    if (keyConcepts.length > 0) {
        sections.push({
            heading: 'Key Concepts & Definitions',
            content: `The main concepts in ${topicName} include: ${keyConcepts.slice(0, 5).join(', ')}. Each of these plays a crucial role in understanding the broader topic. ${mainPoints[1] || `These concepts form the foundation of ${topicName}.`}`,
            highlights: keyConcepts.slice(0, 5).map(c => `${c}: Essential concept`),
        });
    }
    
    // Section 3: Detailed Explanation
    if (mainPoints.length > 2) {
        sections.push({
            heading: 'Detailed Explanation',
            content: `${mainPoints[2] || `Let's explore ${topicName} in detail.`} ${mainPoints[3] || `Understanding these details is crucial for practical application.`} ${mainPoints[4] || `This knowledge will help you apply these concepts effectively.`}`,
            highlights: [
                'In-depth understanding required',
                'Practical application focus',
                'Real-world relevance'
            ],
        });
    }
    
    // Section 4: Applications & Examples
    sections.push({
        heading: 'Applications & Real-World Examples',
        content: `${topicName} has numerous practical applications. ${mainPoints[5] || `These concepts are used in various professional settings.`} Understanding how to apply this knowledge is essential for success.`,
        highlights: [
            'Professional applications',
            'Real-world scenarios',
            'Practical implementation'
        ],
    });
    
    // Section 5: Important Takeaways
    sections.push({
        heading: 'Key Takeaways & Summary',
        content: `To master ${topicName}, remember: ${mainPoints[6] || `Focus on understanding the core principles.`} ${mainPoints[7] || `Practice applying these concepts regularly.`} These takeaways will help you succeed in this subject area.`,
        highlights: [
            'Master core principles',
            'Regular practice essential',
            'Apply knowledge actively'
        ],
    });
    
    return sections;
}

// Calculate quality score based on content richness
function calculateQualityScore(sections: GeneratedNote['sections'], content: string): number {
    let score = 70; // Base score

    // Add points for content richness/length
    const length = content.trim().length;
    if (length >= 500) score += 8;
    if (length >= 1200) score += 7;
    
    // Add points for number of sections
    if (sections.length >= 4) score += 5;
    if (sections.length >= 5) score += 5;
    
    // Add points for highlights
    const totalHighlights = sections.reduce((sum, s) => sum + s.highlights.length, 0);
    if (totalHighlights >= 10) score += 5;
    
    return Math.min(100, score);
}

// Enhanced mind map generation - topic-specific and comprehensive
const generateMockMindMap = (sessionId: string, topicName: string, concepts?: string[]): MindMap => {
    // Generate topic-specific categories and concepts
    const categories = generateTopicCategories(topicName, concepts);
    
    const nodes: MindMapNode[] = [
        {
            id: 'central',
            label: topicName,
            type: 'central',
            color: '#8b5cf6',
            children: categories.map((category, index) => ({
                id: `category-${index}`,
                label: category.name,
                type: 'category',
                color: category.color,
                children: category.concepts.map((concept, cIndex) => ({
                    id: `concept-${index}-${cIndex}`,
                    label: concept.label,
                    description: concept.description,
                    type: 'concept',
                    color: concept.color,
                    children: [],
                })),
            })),
        },
    ];

    return {
        id: `mindmap_${Date.now()}`,
        sessionId,
        topicName,
        centralTopic: topicName,
        nodes,
        createdAt: new Date().toISOString(),
    };
};

// Generate topic-specific categories
function generateTopicCategories(topicName: string, concepts?: string[]): Array<{name: string, color: string, concepts: Array<{label: string, description: string, color: string}>}> {
    const lowerTopic = topicName.toLowerCase();
    const categories: Array<{name: string, color: string, concepts: Array<{label: string, description: string, color: string}>}> = [];
    
    // Determine topic domain and generate appropriate categories
    if (lowerTopic.includes('ecg') || lowerTopic.includes('heart') || lowerTopic.includes('cardiac')) {
        categories.push(
            {
                name: 'Waves & Components',
                color: '#3b82f6',
                concepts: [
                    { label: 'P Wave', description: 'Atrial depolarization', color: '#60a5fa' },
                    { label: 'QRS Complex', description: 'Ventricular depolarization', color: '#60a5fa' },
                    { label: 'T Wave', description: 'Ventricular repolarization', color: '#60a5fa' },
                ],
            },
            {
                name: 'Intervals',
                color: '#10b981',
                concepts: [
                    { label: 'PR Interval', description: '0.12-0.20 sec', color: '#34d399' },
                    { label: 'QT Interval', description: 'Varies with HR', color: '#34d399' },
                    { label: 'RR Interval', description: 'Determines HR', color: '#34d399' },
                ],
            },
            {
                name: 'Clinical Applications',
                color: '#f59e0b',
                concepts: [
                    { label: 'Arrhythmias', description: 'Abnormal rhythms', color: '#fbbf24' },
                    { label: 'Ischemia', description: 'Blood flow issues', color: '#fbbf24' },
                    { label: 'Electrolyte Issues', description: 'Imbalance detection', color: '#fbbf24' },
                ],
            }
        );
    } else if (lowerTopic.includes('react') || lowerTopic.includes('javascript') || lowerTopic.includes('programming')) {
        categories.push(
            {
                name: 'Core Concepts',
                color: '#3b82f6',
                concepts: [
                    { label: 'Components', description: 'Reusable UI elements', color: '#60a5fa' },
                    { label: 'State', description: 'Component data management', color: '#60a5fa' },
                    { label: 'Props', description: 'Component communication', color: '#60a5fa' },
                ],
            },
            {
                name: 'Advanced Topics',
                color: '#10b981',
                concepts: [
                    { label: 'Hooks', description: 'Functional components', color: '#34d399' },
                    { label: 'Context', description: 'Global state', color: '#34d399' },
                    { label: 'Performance', description: 'Optimization', color: '#34d399' },
                ],
            },
            {
                name: 'Best Practices',
                color: '#f59e0b',
                concepts: [
                    { label: 'Code Structure', description: 'Organization', color: '#fbbf24' },
                    { label: 'Testing', description: 'Quality assurance', color: '#fbbf24' },
                    { label: 'Deployment', description: 'Production', color: '#fbbf24' },
                ],
            }
        );
    } else if (lowerTopic.includes('law') || lowerTopic.includes('legal') || lowerTopic.includes('contract')) {
        categories.push(
            {
                name: 'Legal Principles',
                color: '#3b82f6',
                concepts: [
                    { label: 'Elements', description: 'Required components', color: '#60a5fa' },
                    { label: 'Formation', description: 'Creation process', color: '#60a5fa' },
                    { label: 'Enforceability', description: 'Legal validity', color: '#60a5fa' },
                ],
            },
            {
                name: 'Types & Categories',
                color: '#10b981',
                concepts: [
                    { label: 'Written', description: 'Formal contracts', color: '#34d399' },
                    { label: 'Oral', description: 'Verbal agreements', color: '#34d399' },
                    { label: 'Implied', description: 'Inferred terms', color: '#34d399' },
                ],
            },
            {
                name: 'Remedies',
                color: '#f59e0b',
                concepts: [
                    { label: 'Damages', description: 'Compensation', color: '#fbbf24' },
                    { label: 'Specific Performance', description: 'Enforcement', color: '#fbbf24' },
                    { label: 'Rescission', description: 'Cancellation', color: '#fbbf24' },
                ],
            }
        );
    } else {
        // Generic categories for any topic
        categories.push(
            {
                name: 'Fundamentals',
                color: '#3b82f6',
                concepts: [
                    { label: 'Core Concepts', description: 'Basic principles', color: '#60a5fa' },
                    { label: 'Key Definitions', description: 'Important terms', color: '#60a5fa' },
                    { label: 'Foundations', description: 'Building blocks', color: '#60a5fa' },
                ],
            },
            {
                name: 'Advanced Topics',
                color: '#10b981',
                concepts: [
                    { label: 'Complex Scenarios', description: 'Advanced cases', color: '#34d399' },
                    { label: 'Specialized Areas', description: 'Niche topics', color: '#34d399' },
                    { label: 'Expert Level', description: 'Mastery concepts', color: '#34d399' },
                ],
            },
            {
                name: 'Applications',
                color: '#f59e0b',
                concepts: [
                    { label: 'Real-World Use', description: 'Practical application', color: '#fbbf24' },
                    { label: 'Case Studies', description: 'Examples', color: '#fbbf24' },
                    { label: 'Best Practices', description: 'Recommended approaches', color: '#fbbf24' },
                ],
            }
        );
    }
    
    // If concepts provided, enhance with them
    if (concepts && concepts.length > 0) {
        const firstCategory = categories[0];
        if (firstCategory) {
            concepts.slice(0, 3).forEach((concept, index) => {
                if (index < firstCategory.concepts.length) {
                    firstCategory.concepts[index].label = concept;
                }
            });
        }
    }
    
    return categories;
}

// Enhanced flashcard generation - topic-specific and comprehensive
const generateMockFlashcards = (sessionId: string, topicName?: string, content?: string[]): Flashcard[] => {
    const cards: Flashcard[] = [];
    const baseTime = Date.now();
    
    // Generate topic-specific flashcards
    if (topicName) {
        const topicCards = generateTopicSpecificFlashcards(sessionId, topicName, content, baseTime);
        cards.push(...topicCards);
    } else {
        // Generic flashcards if no topic specified
        const genericCards = generateGenericFlashcards(sessionId, baseTime);
        cards.push(...genericCards);
    }
    
    return cards;
};

// Generate topic-specific flashcards
function generateTopicSpecificFlashcards(sessionId: string, topicName: string, content: string[] | undefined, baseTime: number): Flashcard[] {
    const cards: Flashcard[] = [];
    const lowerTopic = topicName.toLowerCase();
    
    // Extract key concepts from content if available
    const keyConcepts = content ? extractFlashcardConcepts(content) : [];
    
    // Generate flashcards based on topic domain
    if (lowerTopic.includes('ecg') || lowerTopic.includes('heart') || lowerTopic.includes('cardiac')) {
        cards.push(
            createFlashcard(sessionId, baseTime, 1, 'What does the P wave represent on an ECG?', 'Atrial depolarization', 'The P wave is the first deflection on the ECG and represents the electrical activity as it spreads through the atria, causing them to contract.', 'Think about which chambers contract first in the cardiac cycle.', 'easy', ['ECG', 'P wave', 'atrial']),
            createFlashcard(sessionId, baseTime, 2, 'What does the QRS complex represent?', 'Ventricular depolarization', 'The QRS complex represents the electrical impulse spreading through the ventricles, causing ventricular contraction. It is the most prominent wave on the ECG.', 'This is the main pumping action of the heart.', 'easy', ['ECG', 'QRS', 'ventricular']),
            createFlashcard(sessionId, baseTime, 3, 'What is the normal duration of the QRS complex?', 'Less than 0.12 seconds (3 small squares)', 'A widened QRS (>0.12 sec) suggests a bundle branch block or ventricular origin of the rhythm.', 'Normal QRS is narrow and quick.', 'medium', ['ECG', 'QRS', 'duration']),
            createFlashcard(sessionId, baseTime, 4, 'What does the T wave represent?', 'Ventricular repolarization', 'The T wave represents the electrical recovery (repolarization) of the ventricles as they prepare for the next contraction.', 'This happens after contraction, during recovery.', 'easy', ['ECG', 'T wave', 'repolarization']),
            createFlashcard(sessionId, baseTime, 5, 'What is the normal PR interval?', '0.12 to 0.20 seconds (3-5 small squares)', 'A prolonged PR interval (>0.20 sec) indicates first-degree heart block. A shortened PR interval may indicate pre-excitation syndromes like WPW.', 'This measures the time from atrial to ventricular activation.', 'medium', ['ECG', 'PR interval', 'heart block'])
        );
    } else if (lowerTopic.includes('react') || lowerTopic.includes('javascript') || lowerTopic.includes('programming')) {
        cards.push(
            createFlashcard(sessionId, baseTime, 1, 'What is a React component?', 'A reusable piece of UI that returns JSX', 'Components are the building blocks of React applications. They can be functional or class-based and encapsulate both structure and behavior.', 'Think of components like LEGO blocks for building UIs.', 'easy', ['React', 'Components', 'JSX']),
            createFlashcard(sessionId, baseTime, 2, 'What is the difference between props and state?', 'Props are passed down, state is managed internally', 'Props are immutable data passed from parent to child components, while state is mutable data managed within a component using useState or this.state.', 'Props come from outside, state comes from inside.', 'medium', ['React', 'Props', 'State']),
            createFlashcard(sessionId, baseTime, 3, 'What are React Hooks?', 'Functions that let you use state and lifecycle in functional components', 'Hooks like useState, useEffect, and useContext allow functional components to have state and side effects, making them as powerful as class components.', 'Hooks "hook into" React features.', 'medium', ['React', 'Hooks', 'Functional Components']),
            createFlashcard(sessionId, baseTime, 4, 'What is the purpose of useEffect?', 'To handle side effects in functional components', 'useEffect runs after render and can handle data fetching, subscriptions, or DOM manipulation. It replaces componentDidMount, componentDidUpdate, and componentWillUnmount.', 'Think of it as the lifecycle hook for functional components.', 'medium', ['React', 'useEffect', 'Side Effects']),
            createFlashcard(sessionId, baseTime, 5, 'What is JSX?', 'JavaScript XML - a syntax extension for React', 'JSX allows you to write HTML-like code in JavaScript. It gets transpiled to React.createElement calls and makes component code more readable.', 'JSX looks like HTML but is actually JavaScript.', 'easy', ['React', 'JSX', 'Syntax'])
        );
    } else if (lowerTopic.includes('law') || lowerTopic.includes('legal') || lowerTopic.includes('contract')) {
        cards.push(
            createFlashcard(sessionId, baseTime, 1, 'What are the essential elements of a contract?', 'Offer, acceptance, consideration, capacity, and legality', 'For a contract to be legally binding, it must have all five elements: a valid offer, acceptance of that offer, consideration (something of value), legal capacity to contract, and a lawful purpose.', 'Remember: OACCL (Offer, Acceptance, Consideration, Capacity, Legality)', 'medium', ['Law', 'Contracts', 'Elements']),
            createFlashcard(sessionId, baseTime, 2, 'What is consideration in contract law?', 'Something of value exchanged between parties', 'Consideration is what each party gives up or promises to give up in exchange for the other party\'s promise. It can be money, goods, services, or a promise to do or not do something.', 'Both sides must give something of value.', 'medium', ['Law', 'Contracts', 'Consideration']),
            createFlashcard(sessionId, baseTime, 3, 'What is the difference between a void and voidable contract?', 'Void is invalid from the start, voidable can be cancelled', 'A void contract is never legally valid and cannot be enforced. A voidable contract is valid but can be cancelled by one party due to factors like fraud, duress, or incapacity.', 'Void = never valid, Voidable = valid but cancellable', 'hard', ['Law', 'Contracts', 'Validity']),
            createFlashcard(sessionId, baseTime, 4, 'What is breach of contract?', 'Failure to perform contractual obligations', 'A breach occurs when one party fails to fulfill their contractual duties without a valid excuse. This can be material (major) or minor, affecting available remedies.', 'Breaking a promise made in a contract.', 'easy', ['Law', 'Contracts', 'Breach']),
            createFlashcard(sessionId, baseTime, 5, 'What are common remedies for breach of contract?', 'Damages, specific performance, rescission, and restitution', 'Remedies include compensatory damages (money), specific performance (forcing completion), rescission (cancellation), and restitution (returning benefits received).', 'Different breaches have different remedies.', 'medium', ['Law', 'Contracts', 'Remedies'])
        );
    } else {
        // Generic flashcards for any topic
        if (keyConcepts.length > 0) {
            keyConcepts.slice(0, 5).forEach((concept, index) => {
                cards.push(createFlashcard(
                    sessionId,
                    baseTime,
                    index + 1,
                    `What is ${concept}?`,
                    `${concept} is a key concept in ${topicName}`,
                    `Understanding ${concept} is essential for mastering ${topicName}. This concept forms the foundation for more advanced topics.`,
                    `Think about how ${concept} relates to ${topicName}.`,
                    index < 2 ? 'easy' : index < 4 ? 'medium' : 'hard',
                    [topicName, concept]
                ));
            });
        } else {
            // Fallback generic flashcards
            cards.push(
                createFlashcard(sessionId, baseTime, 1, `What is the main concept of ${topicName}?`, `The main concept involves understanding the fundamental principles of ${topicName}`, `This topic covers essential knowledge that forms the foundation for advanced learning.`, `Think about the core principles.`, 'easy', [topicName]),
                createFlashcard(sessionId, baseTime, 2, `How is ${topicName} applied in practice?`, `${topicName} is applied through real-world scenarios and professional use cases`, `Practical application of ${topicName} involves understanding how theoretical concepts translate to actual situations.`, `Consider real-world examples.`, 'medium', [topicName]),
                createFlashcard(sessionId, baseTime, 3, `What are the key takeaways from ${topicName}?`, `Key takeaways include understanding core principles, applications, and best practices`, `Mastering ${topicName} requires understanding fundamental concepts, their applications, and how to use them effectively.`, `Review the main points covered.`, 'medium', [topicName])
            );
        }
    }
    
    return cards;
}

// Generate generic flashcards
function generateGenericFlashcards(sessionId: string, baseTime: number): Flashcard[] {
    return [
        createFlashcard(sessionId, baseTime, 1, 'What is the main concept?', 'The main concept involves understanding fundamental principles', 'This topic covers essential knowledge that forms the foundation for advanced learning.', 'Think about the core principles.', 'easy', ['General']),
        createFlashcard(sessionId, baseTime, 2, 'How is this applied in practice?', 'This is applied through real-world scenarios', 'Practical application involves understanding how theoretical concepts translate to actual situations.', 'Consider real-world examples.', 'medium', ['General']),
    ];
}

// Helper to create a flashcard
function createFlashcard(
    sessionId: string,
    baseTime: number,
    index: number,
    question: string,
    answer: string,
    explanation: string,
    hint: string,
    difficulty: 'easy' | 'medium' | 'hard',
    tags: string[]
): Flashcard {
    return {
        id: `fc_${baseTime}_${index}`,
        sessionId,
        question,
        answer,
        explanation,
        hint,
        difficulty,
        tags,
        nextReviewDate: new Date().toISOString(),
        intervalDays: 1,
        easeFactor: 2.5,
        repetitions: 0,
    };
}

// Extract concepts for flashcards from content
function extractFlashcardConcepts(content: string[]): string[] {
    const concepts: string[] = [];
    const fullText = content.join(' ');
    
    // Extract capitalized terms (likely concepts)
    const matches = fullText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    const unique = [...new Set(matches)].filter(c => c.length > 3);
    
    concepts.push(...unique.slice(0, 10));
    return concepts;
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
    notes: [],
    isGeneratingNotes: false,
    mindMaps: [],
    isGeneratingMindMap: false,
    flashcards: [],
    isGeneratingFlashcards: false,
    currentReviewIndex: 0,

    generateNotes: async (sessionId, topicName, content) => {
        // Prevent concurrent generation
        const currentState = get();
        if (currentState.isGeneratingNotes) {
            console.warn('Notes generation already in progress');
            throw new Error('Notes generation already in progress');
        }

        set({ isGeneratingNotes: true });

        try {
            // Validate inputs
            if (!sessionId || !topicName || !content || content.length === 0) {
                throw new Error('Invalid input parameters for note generation');
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const note = generateMockNotes(sessionId, topicName, content);

            // Double-check state hasn't changed during async operation
            const stateAfterDelay = get();
            if (!stateAfterDelay.isGeneratingNotes) {
                // Generation was cancelled
                throw new Error('Notes generation was cancelled');
            }

            set((state) => ({
                notes: [...state.notes, note],
                isGeneratingNotes: false,
            }));

            toast.success('Notes generated successfully');
            return note;
        } catch (error) {
            console.error('Failed to generate notes:', error);
            set({ isGeneratingNotes: false });
            toast.error('Failed to generate notes. Please try again.');
            throw error;
        }
    },

    generateMindMap: async (sessionId, topicName, concepts) => {
        // Prevent concurrent generation
        const currentState = get();
        if (currentState.isGeneratingMindMap) {
            console.warn('Mind map generation already in progress');
            throw new Error('Mind map generation already in progress');
        }

        set({ isGeneratingMindMap: true });

        try {
            // Validate inputs
            if (!sessionId || !topicName) {
                throw new Error('Invalid input parameters for mind map generation');
            }

            await new Promise(resolve => setTimeout(resolve, 2500));

            // Double-check state hasn't changed during async operation
            const stateAfterDelay = get();
            if (!stateAfterDelay.isGeneratingMindMap) {
                // Generation was cancelled
                throw new Error('Mind map generation was cancelled');
            }

            // Pass concepts to generate topic-specific mind map
            const mindMap = generateMockMindMap(sessionId, topicName, concepts);

            set((state) => ({
                mindMaps: [...state.mindMaps, mindMap],
                isGeneratingMindMap: false,
            }));

            toast.success('Mind map generated successfully');
            return mindMap;
        } catch (error) {
            console.error('Failed to generate mind map:', error);
            set({ isGeneratingMindMap: false });
            toast.error('Failed to generate mind map. Please try again.');
            throw error;
        }
    },

    generateFlashcards: async (sessionId, content) => {
        // Prevent concurrent generation
        const currentState = get();
        if (currentState.isGeneratingFlashcards) {
            console.warn('Flashcard generation already in progress');
            throw new Error('Flashcard generation already in progress');
        }

        set({ isGeneratingFlashcards: true });

        try {
            // Validate inputs
            if (!sessionId) {
                throw new Error('Invalid session ID for flashcard generation');
            }

            // Get topic name from current session if available
            // This would ideally come from the teaching session, but for now we'll extract from content
            const topicName = extractTopicNameFromContent(content);

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Double-check state hasn't changed during async operation
            const stateAfterDelay = get();
            if (!stateAfterDelay.isGeneratingFlashcards) {
                // Generation was cancelled
                throw new Error('Flashcard generation was cancelled');
            }

            // Generate topic-specific flashcards with content
            const cards = generateMockFlashcards(sessionId, topicName, content);

            set((state) => ({
                flashcards: [...state.flashcards, ...cards],
                isGeneratingFlashcards: false,
            }));

            toast.success(`Generated ${cards.length} flashcards`);
            return cards;
        } catch (error) {
            console.error('Failed to generate flashcards:', error);
            set({ isGeneratingFlashcards: false });
            toast.error('Failed to generate flashcards. Please try again.');
            throw error;
        }
    },

    setCurrentReviewIndex: (index) => set({ currentReviewIndex: index }),

    updateFlashcardPerformance: (id, performance) => {
        set((state) => {
            const updated = state.flashcards.map((card) => {
                if (card.id !== id) return card;

                // Simple spaced repetition algorithm
                let newInterval = card.intervalDays;
                let newEaseFactor = card.easeFactor;

                switch (performance) {
                    case 'again':
                        newInterval = 1;
                        newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
                        break;
                    case 'hard':
                        newInterval = Math.ceil(card.intervalDays * 1.2);
                        newEaseFactor = Math.max(1.3, card.easeFactor - 0.15);
                        break;
                    case 'good':
                        newInterval = Math.ceil(card.intervalDays * card.easeFactor);
                        break;
                    case 'easy':
                        newInterval = Math.ceil(card.intervalDays * card.easeFactor * 1.3);
                        newEaseFactor = card.easeFactor + 0.15;
                        break;
                }

                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + newInterval);

                return {
                    ...card,
                    intervalDays: newInterval,
                    easeFactor: newEaseFactor,
                    repetitions: card.repetitions + 1,
                    lastPerformance: performance,
                    nextReviewDate: nextDate.toISOString(),
                };
            });

            return { flashcards: updated };
        });
    },

    clearSessionResources: (sessionId) => {
        set((state) => ({
            notes: state.notes.filter((n) => n.sessionId !== sessionId),
            mindMaps: state.mindMaps.filter((m) => m.sessionId !== sessionId),
            flashcards: state.flashcards.filter((f) => f.sessionId !== sessionId),
        }));
    },
}));
