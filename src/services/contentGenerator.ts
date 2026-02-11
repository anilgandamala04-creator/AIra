import type { TeachingStep } from '../types';
import { analyzeTopic, type TopicAnalysis } from './topicAnalyzer';

/**
 * Generates comprehensive teaching steps for a topic
 * Based on AI analysis of scope, duration, and complexity
 */
export function generateComprehensiveCourse(
    topicId: string,
    topicName: string,
    description?: string,
    subjectArea?: string
): TeachingStep[] {
    // Analyze the topic
    const analysis = analyzeTopic(topicId, topicName, description, subjectArea);

    // Generate steps based on analysis
    const steps: TeachingStep[] = [];

    // 1. Introduction section
    steps.push(...generateIntroductionSteps(analysis));

    // 2. Core content section
    steps.push(...generateCoreContentSteps(analysis));

    // 3. Examples and applications section
    steps.push(...generateExamplesSteps(analysis));

    // 4. Practice/Interactive section
    steps.push(...generatePracticeSteps(analysis));

    // 5. Review and summary section
    steps.push(...generateReviewSteps(analysis));

    // Update step numbers
    steps.forEach((step, index) => {
        step.stepNumber = index + 1;
    });

    return steps;
}

/**
 * Generates introduction steps
 */
function generateIntroductionSteps(analysis: TopicAnalysis): TeachingStep[] {
    const steps: TeachingStep[] = [];
    const introMinutes = analysis.recommendedStructure.introductionMinutes;
    const stepsCount = Math.max(2, Math.ceil(introMinutes / 3)); // ~3 minutes per step

    // Welcome step
    steps.push({
        id: `${analysis.topicId}-intro-1`,
        stepNumber: 0, // Will be updated later
        title: `Welcome to ${analysis.topicName}`,
        content: generateWelcomeContent(analysis),
        spokenContent: generateWelcomeSpokenContent(analysis),
        visualType: 'diagram',
        visualPrompt: `Welcome visual for ${analysis.topicName}`,
        durationSeconds: 180,
        completed: false,
        complexity: 'basic',
        estimatedMinutes: 3,
        keyConcepts: analysis.scope.primaryConcepts.slice(0, 3),
        realWorldExamples: analysis.realWorldExamples.slice(0, 2),
    });

    // Overview step
    if (stepsCount > 1) {
        steps.push({
            id: `${analysis.topicId}-intro-2`,
            stepNumber: 0,
            title: `Overview of ${analysis.topicName}`,
            content: generateOverviewContent(analysis),
            spokenContent: generateOverviewSpokenContent(analysis),
            visualType: 'diagram',
            visualPrompt: `Overview infographic of ${analysis.topicName}`,
            durationSeconds: 180,
            completed: false,
            complexity: 'basic',
            estimatedMinutes: 3,
            keyConcepts: analysis.scope.primaryConcepts,
        });
    }

    // Learning objectives step
    if (stepsCount > 2) {
        steps.push({
            id: `${analysis.topicId}-intro-3`,
            stepNumber: 0,
            title: 'What You Will Learn',
            content: generateLearningObjectivesContent(analysis),
            spokenContent: generateLearningObjectivesSpokenContent(analysis),
            visualType: 'text',
            durationSeconds: 120,
            completed: false,
            complexity: 'basic',
            estimatedMinutes: 2,
        });
    }

    return steps;
}

/**
 * Generates core content steps
 */
function generateCoreContentSteps(analysis: TopicAnalysis): TeachingStep[] {
    const steps: TeachingStep[] = [];
    const primaryConcepts = analysis.scope.primaryConcepts;
    const subConcepts = analysis.scope.subConcepts;

    // Generate steps for primary concepts
    primaryConcepts.forEach((concept, index) => {
        const stepIndex = index + 1;
        const duration = analysis.complexity === 'advanced' || analysis.complexity === 'expert' ? 300 : 240;

        steps.push({
            id: `${analysis.topicId}-core-${stepIndex}`,
            stepNumber: 0,
            title: concept,
            content: generateConceptContent(concept, analysis),
            spokenContent: generateConceptSpokenContent(concept, analysis),
            visualType: getVisualTypeForConcept(concept, analysis),
            visualPrompt: `Diagram illustrating ${concept} in the context of ${analysis.topicName}`,
            durationSeconds: duration,
            completed: false,
            complexity: analysis.complexity === 'expert' ? 'advanced' : analysis.complexity,
            estimatedMinutes: Math.round(duration / 60),
            keyConcepts: [concept],
            subConcepts: getRelatedSubConcepts(concept, subConcepts),
            realWorldExamples: getRelevantExamples(concept, analysis.realWorldExamples),
            practicalApplications: getPracticalApplications(concept, analysis.scope.practicalApplications),
        });
    });

    // Generate steps for important sub-concepts
    const importantSubConcepts = subConcepts.slice(0, Math.ceil(subConcepts.length / 2));
    importantSubConcepts.forEach((subConcept, index) => {
        const stepIndex = primaryConcepts.length + index + 1;

        steps.push({
            id: `${analysis.topicId}-core-sub-${stepIndex}`,
            stepNumber: 0,
            title: subConcept,
            content: generateSubConceptContent(subConcept, analysis),
            spokenContent: generateSubConceptSpokenContent(subConcept, analysis),
            visualType: 'diagram',
            visualPrompt: `Deep dive into ${subConcept}`,
            durationSeconds: 180,
            completed: false,
            complexity: analysis.complexity === 'basic' ? 'intermediate' : (analysis.complexity === 'expert' ? 'advanced' : analysis.complexity),
            estimatedMinutes: 3,
            keyConcepts: [subConcept],
        });
    });

    return steps;
}

/**
 * Generates examples and applications steps
 */
function generateExamplesSteps(analysis: TopicAnalysis): TeachingStep[] {
    const steps: TeachingStep[] = [];
    const examplesMinutes = analysis.recommendedStructure.examplesMinutes;
    const stepsCount = Math.max(1, Math.ceil(examplesMinutes / 4));

    // Real-world examples step
    if (analysis.realWorldExamples.length > 0) {
        steps.push({
            id: `${analysis.topicId}-examples-1`,
            stepNumber: 0,
            title: 'Real-World Applications',
            content: generateRealWorldExamplesContent(analysis),
            spokenContent: generateRealWorldExamplesSpokenContent(analysis),
            visualType: 'text',
            visualPrompt: `Real-world applications of ${analysis.topicName}`,
            durationSeconds: 240,
            completed: false,
            complexity: 'intermediate',
            estimatedMinutes: 4,
            realWorldExamples: analysis.realWorldExamples,
            practicalApplications: analysis.scope.practicalApplications,
        });
    }

    // Case studies or detailed examples
    if (stepsCount > 1 && analysis.complexity !== 'basic') {
        steps.push({
            id: `${analysis.topicId}-examples-2`,
            stepNumber: 0,
            title: 'Case Studies and Scenarios',
            content: generateCaseStudiesContent(analysis),
            spokenContent: generateCaseStudiesSpokenContent(analysis),
            visualType: 'interactive',
            durationSeconds: 300,
            completed: false,
            complexity: analysis.complexity === 'expert' ? 'advanced' : analysis.complexity,
            estimatedMinutes: 5,
        });
    }

    return steps;
}

/**
 * Generates practice/interactive steps
 */
function generatePracticeSteps(analysis: TopicAnalysis): TeachingStep[] {
    const steps: TeachingStep[] = [];
    const practiceMinutes = analysis.recommendedStructure.practiceMinutes;

    if (practiceMinutes >= 3) {
        steps.push({
            id: `${analysis.topicId}-practice-1`,
            stepNumber: 0,
            title: 'Interactive Practice',
            content: 'Apply what you\'ve learned through interactive exercises and scenarios.',
            spokenContent: `Now let's practice applying ${analysis.topicName}. Work through these interactive exercises to reinforce your understanding.`,
            visualType: 'interactive',
            durationSeconds: Math.max(180, practiceMinutes * 60),
            completed: false,
            complexity: analysis.complexity === 'expert' ? 'advanced' : analysis.complexity,
            estimatedMinutes: practiceMinutes,
        });
    }

    return steps;
}

/**
 * Generates review and summary steps
 */
function generateReviewSteps(analysis: TopicAnalysis): TeachingStep[] {
    const steps: TeachingStep[] = [];

    // Summary step
    steps.push({
        id: `${analysis.topicId}-review-1`,
        stepNumber: 0,
        title: 'Key Takeaways',
        content: generateSummaryContent(analysis),
        spokenContent: generateSummarySpokenContent(analysis),
        visualType: 'text',
        visualPrompt: `Key takeaways summary for ${analysis.topicName}`,
        durationSeconds: 180,
        completed: false,
        complexity: 'basic',
        estimatedMinutes: 3,
        keyConcepts: analysis.scope.primaryConcepts,
    });

    // Quiz/Assessment step
    steps.push({
        id: `${analysis.topicId}-review-2`,
        stepNumber: 0,
        title: 'Comprehensive Assessment',
        content: 'Test your understanding with a comprehensive quiz covering all key concepts.',
        spokenContent: `Excellent work completing this comprehensive course on ${analysis.topicName}! Now let's test your knowledge with a quiz covering all the key concepts we've covered.`,
        visualType: 'quiz',
        durationSeconds: 300,
        completed: false,
        complexity: analysis.complexity === 'expert' ? 'advanced' : analysis.complexity,
        estimatedMinutes: 5,
    });

    return steps;
}

// ============================================
// CONTENT GENERATION HELPERS
// ============================================

function generateWelcomeContent(analysis: TopicAnalysis): string {
    return `Welcome to our comprehensive course on ${analysis.topicName}! 

This ${analysis.estimatedDurationMinutes}-minute course will take you from fundamentals to practical application. We'll cover ${analysis.scope.primaryConcepts.length} primary concepts and explore real-world applications.

By the end of this course, you'll have a thorough understanding of ${analysis.topicName} and be able to apply this knowledge in practical scenarios.`;
}

function generateWelcomeSpokenContent(analysis: TopicAnalysis): string {
    return `Hello! I'm excited to guide you through ${analysis.topicName}. Over the next ${analysis.estimatedDurationMinutes} minutes, we'll explore this fascinating topic together. I'll use clear explanations, visual diagrams, and real-world examples to make sure you truly understand every concept. This is a ${analysis.complexity}-level course, so we'll take our time and make sure everything clicks. Ready to begin? Let's dive in!`;
}

function generateOverviewContent(analysis: TopicAnalysis): string {
    const concepts = analysis.scope.primaryConcepts.join(', ');
    return `In this course, we'll explore:

• ${concepts}

We'll start with foundational concepts, then dive deeper into ${analysis.scope.subConcepts.length > 0 ? analysis.scope.subConcepts.slice(0, 3).join(', ') : 'advanced topics'}, and conclude with practical applications and real-world examples.

This course is designed for ${analysis.complexity}-level learners and includes interactive visual aids to enhance your understanding.`;
}

function generateOverviewSpokenContent(analysis: TopicAnalysis): string {
    const concepts = analysis.scope.primaryConcepts.join(', ');
    return `In this comprehensive course, we will explore ${concepts}. We will start with foundational concepts, then dive deeper into advanced topics, and conclude with practical applications. This ${analysis.complexity}-level course is designed to give you a complete understanding of ${analysis.topicName} with detailed explanations and visual aids.`;
}

function generateLearningObjectivesContent(analysis: TopicAnalysis): string {
    return `By completing this course, you will be able to:

1. Understand the fundamental concepts of ${analysis.topicName}
2. ${analysis.scope.primaryConcepts.length > 0 ? `Apply knowledge of ${analysis.scope.primaryConcepts[0]}` : 'Apply key principles'}
3. Recognize real-world applications
4. Solve practical problems related to this topic
5. ${analysis.complexity !== 'basic' ? 'Analyze complex scenarios' : 'Build a solid foundation for advanced learning'}`;
}

function generateLearningObjectivesSpokenContent(analysis: TopicAnalysis): string {
    return `By completing this course, you will understand the fundamental concepts of ${analysis.topicName}, be able to apply this knowledge in practical scenarios, recognize real-world applications, and solve problems related to this topic. ${analysis.complexity !== 'basic' ? 'You will also be able to analyze complex scenarios and make informed decisions.' : 'This will build a solid foundation for advanced learning.'}`;
}

function generateConceptContent(concept: string, analysis: TopicAnalysis): string {
    return `${concept} is a fundamental aspect of ${analysis.topicName}. 

In this section, we'll explore:
• The definition and core principles of ${concept}
• How ${concept} relates to other concepts in ${analysis.topicName}
• Key characteristics and important details
• Common misconceptions to avoid
• Practical applications you'll encounter

Understanding ${concept} is essential for mastering ${analysis.topicName}. Pay close attention to the visual diagram on the board - it will help illustrate these concepts clearly.`;
}

function generateConceptSpokenContent(concept: string, analysis: TopicAnalysis): string {
    return `Now, let's focus on ${concept}. This is one of the most important concepts in ${analysis.topicName}. Think of it as a building block - once you understand this, everything else will make much more sense. Let me break it down for you step by step. First, what exactly is ${concept}? Well, it's essentially... [content continues with engaging explanation]. Pay close attention to the visual on the board - it will help illustrate what I'm explaining.`;
}

function generateSubConceptContent(subConcept: string, analysis: TopicAnalysis): string {
    return `${subConcept} is an important detail within ${analysis.topicName}.

This concept builds upon the foundational knowledge we've covered and provides deeper insight into how ${analysis.topicName} works in practice.

Key points about ${subConcept}:
• How it connects to the main concepts
• Why it matters in real-world scenarios
• Common applications and examples
• Tips for remembering and applying this concept

Take a moment to observe the visual on the board - it demonstrates ${subConcept} in action.`;
}

function generateSubConceptSpokenContent(subConcept: string, analysis: TopicAnalysis): string {
    return `Great! Now that we've covered the basics, let's dive deeper into ${subConcept}. This is where things get really interesting. ${subConcept} builds on what we just learned and shows us how ${analysis.topicName} actually works in real situations. You'll see this concept come up again and again, so let's make sure you really understand it. Look at the diagram - notice how...`;
}

function generateRealWorldExamplesContent(analysis: TopicAnalysis): string {
    const examples = analysis.realWorldExamples.slice(0, 3).map((ex, i) => `${i + 1}. ${ex}`).join('\n\n');
    return `Real-World Applications of ${analysis.topicName}:

${examples}

These examples demonstrate how ${analysis.topicName} is applied in academic and real-world settings. Understanding these applications helps bridge the gap between theory and practice.`;
}

function generateRealWorldExamplesSpokenContent(analysis: TopicAnalysis): string {
    const examples = analysis.realWorldExamples.slice(0, 3).join('. ');
    return `Let us explore real-world applications of ${analysis.topicName}. ${examples}. These examples demonstrate how this knowledge is applied in academic and real-world settings, bridging the gap between theory and practice.`;
}

function generateCaseStudiesContent(analysis: TopicAnalysis): string {
    return `Let's examine detailed case studies that illustrate ${analysis.topicName} in action.

These scenarios will help you:
• Understand how concepts are applied in real situations
• Recognize patterns and common approaches
• Develop problem-solving skills
• Prepare for similar challenges you may encounter`;
}

function generateCaseStudiesSpokenContent(analysis: TopicAnalysis): string {
    return `Now let us examine detailed case studies that illustrate ${analysis.topicName} in action. These scenarios will help you understand how concepts are applied in real situations, recognize patterns, develop problem-solving skills, and prepare for similar challenges.`;
}

function generateSummaryContent(analysis: TopicAnalysis): string {
    const concepts = analysis.scope.primaryConcepts.join(', ');
    return `Key Takeaways from ${analysis.topicName}:

• We've covered ${concepts}
• You've learned about ${analysis.scope.subConcepts.length > 0 ? analysis.scope.subConcepts.slice(0, 3).join(', ') : 'important details'}
• Real-world applications include ${analysis.scope.practicalApplications.length > 0 ? analysis.scope.practicalApplications[0] : 'various practical scenarios'}

Remember these key points as you continue your learning journey!`;
}

function generateSummarySpokenContent(analysis: TopicAnalysis): string {
    const concepts = analysis.scope.primaryConcepts.join(', ');
    return `Let us review our key takeaways. We have covered ${concepts}. You have learned about important details and real-world applications. Remember these key points as you continue your learning journey and apply this knowledge in practice.`;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getVisualTypeForConcept(concept: string, analysis: TopicAnalysis): TeachingStep['visualType'] {
    const lowerConcept = concept.toLowerCase();

    // Check if 3D model is available
    if (analysis.visualAidsRequired.includes('3d-model')) {
        return '3d-model';
    }

    // Check for animation needs
    if (lowerConcept.includes('flow') || lowerConcept.includes('process') || lowerConcept.includes('motion')) {
        return 'animation';
    }

    // Check for interactive needs
    if (lowerConcept.includes('practice') || lowerConcept.includes('exercise') || lowerConcept.includes('simulation')) {
        return 'interactive';
    }

    // Default to diagram
    return 'diagram';
}

function getRelatedSubConcepts(concept: string, subConcepts: string[]): string[] {
    const lowerConcept = concept.toLowerCase();
    return subConcepts.filter(sub =>
        sub.toLowerCase().includes(lowerConcept) ||
        lowerConcept.includes(sub.toLowerCase().split(' ')[0])
    ).slice(0, 3);
}

function getRelevantExamples(concept: string, examples: string[]): string[] {
    const lowerConcept = concept.toLowerCase();
    const relevant = examples.filter(ex =>
        ex.toLowerCase().includes(lowerConcept) ||
        lowerConcept.split(' ').some(word => ex.toLowerCase().includes(word))
    );
    return relevant.length > 0 ? relevant.slice(0, 2) : examples.slice(0, 1);
}

function getPracticalApplications(concept: string, applications: string[]): string[] {
    if (applications.length === 0) return [];
    const lowerConcept = concept.toLowerCase();
    const relevant = applications.filter(app =>
        app.toLowerCase().includes(lowerConcept) ||
        lowerConcept.split(' ').some(word => app.toLowerCase().includes(word))
    );
    return relevant.length > 0 ? relevant.slice(0, 2) : applications.slice(0, 1);
}
