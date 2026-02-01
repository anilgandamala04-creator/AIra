// Topic analysis types and functions

/**
 * Topic Complexity Assessment
 * Analyzes a topic to determine its complexity, scope, and required duration
 */
export interface TopicAnalysis {
    topicId: string;
    topicName: string;
    complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
    estimatedDurationMinutes: number;
    scope: {
        primaryConcepts: string[];
        subConcepts: string[];
        practicalApplications: string[];
        prerequisites: string[];
    };
    recommendedStructure: {
        introductionMinutes: number;
        coreContentMinutes: number;
        examplesMinutes: number;
        practiceMinutes: number;
        reviewMinutes: number;
    };
    visualAidsRequired: string[];
    realWorldExamples: string[];
}

/**
 * Analyzes a topic and determines comprehensive teaching requirements
 */
export function analyzeTopic(
    topicId: string,
    topicName: string,
    description?: string,
    subjectArea?: string
): TopicAnalysis {
    // Determine complexity based on topic characteristics
    const complexity = determineComplexity(topicId, topicName, description, subjectArea);
    
    // Calculate duration based on complexity and topic scope
    const estimatedDurationMinutes = calculateDuration(complexity, topicId, topicName);
    
    // Extract key concepts from topic
    const scope = extractScope(topicId, topicName);
    
    // Determine recommended structure
    const recommendedStructure = calculateStructure(estimatedDurationMinutes, complexity);
    
    // Identify required visual aids
    const visualAidsRequired = identifyVisualAids(topicId);
    
    // Generate real-world examples
    const realWorldExamples = generateRealWorldExamples(topicId, topicName);

    return {
        topicId,
        topicName,
        complexity,
        estimatedDurationMinutes,
        scope,
        recommendedStructure,
        visualAidsRequired,
        realWorldExamples,
    };
}

/**
 * Determines topic complexity level
 */
function determineComplexity(
    topicId: string,
    topicName: string,
    description?: string,
    subjectArea?: string
): 'basic' | 'intermediate' | 'advanced' | 'expert' {
    const lowerName = topicName.toLowerCase();
    const lowerId = topicId.toLowerCase();
    const lowerDesc = (description || '').toLowerCase();
    
    // Expert-level indicators
    const expertKeywords = [
        'quantum', 'relativity', 'advanced', 'expert', 'specialized',
        'research', 'thesis', 'dissertation', 'phd', 'postgraduate'
    ];
    
    // Advanced indicators
    const advancedKeywords = [
        'complex', 'advanced', 'sophisticated', 'intricate', 'detailed',
        'comprehensive', 'mastery', 'specialization', 'expertise'
    ];
    
    // Basic indicators
    const basicKeywords = [
        'basics', 'introduction', 'fundamentals', 'beginner', 'starter',
        'overview', 'primer', 'essentials', '101', 'getting started'
    ];
    
    const allText = `${lowerName} ${lowerId} ${lowerDesc}`;
    
    if (expertKeywords.some(kw => allText.includes(kw))) {
        return 'expert';
    }
    if (advancedKeywords.some(kw => allText.includes(kw))) {
        return 'advanced';
    }
    if (basicKeywords.some(kw => allText.includes(kw))) {
        return 'basic';
    }
    
    // Default based on subject area complexity
    const complexSubjects = ['quantum', 'neurosurgery', 'cardiac-surgery', 'ai-research'];
    if (subjectArea && complexSubjects.some(s => lowerName.includes(s) || lowerId.includes(s))) {
        return 'advanced';
    }
    
    return 'intermediate';
}

/**
 * Calculates estimated duration based on complexity and topic scope
 */
function calculateDuration(
    complexity: 'basic' | 'intermediate' | 'advanced' | 'expert',
    topicId: string,
    topicName: string
): number {
    // Base duration by complexity
    const baseDurations = {
        basic: 20,
        intermediate: 35,
        advanced: 50,
        expert: 70,
    };
    
    let duration = baseDurations[complexity];
    
    // Adjust based on topic characteristics
    const lowerName = topicName.toLowerCase();
    const lowerId = topicId.toLowerCase();
    
    // Topics that typically require more time
    const extendedTopics = [
        'comprehensive', 'complete', 'full', 'detailed', 'extensive',
        'systematic', 'end-to-end', 'mastery', 'deep-dive'
    ];
    
    if (extendedTopics.some(keyword => lowerName.includes(keyword) || lowerId.includes(keyword))) {
        duration += 15;
    }
    
    // Medical/clinical topics often need more time
    const medicalTopics = ['ecg', 'cardiac', 'neurology', 'diagnosis', 'treatment', 'pathology'];
    if (medicalTopics.some(topic => lowerName.includes(topic) || lowerId.includes(topic))) {
        duration += 10;
    }
    
    // Technical/engineering topics
    const technicalTopics = ['algorithm', 'architecture', 'system', 'design', 'implementation'];
    if (technicalTopics.some(topic => lowerName.includes(topic) || lowerId.includes(topic))) {
        duration += 8;
    }
    
    // Ensure minimum duration for comprehensive coverage
    if (duration < 30) {
        duration = 30;
    }
    
    // Cap at reasonable maximum
    if (duration > 90) {
        duration = 90;
    }
    
    return Math.round(duration);
}

/**
 * Extracts scope and key concepts from topic
 */
function extractScope(
    topicId: string,
    topicName: string
): TopicAnalysis['scope'] {
    // This would ideally use AI/NLP, but for now we use pattern matching
    const lowerName = topicName.toLowerCase();
    const lowerId = topicId.toLowerCase();
    
    // Extract primary concepts (simplified - in production, use NLP)
    const primaryConcepts: string[] = [];
    const subConcepts: string[] = [];
    const practicalApplications: string[] = [];
    const prerequisites: string[] = [];
    
    // Medical topics
    if (lowerId.includes('ecg') || lowerName.includes('ecg')) {
        primaryConcepts.push('Electrocardiogram', 'Cardiac conduction', 'ECG interpretation');
        subConcepts.push('P waves', 'QRS complex', 'T waves', 'PR interval', 'QT interval');
        practicalApplications.push('Diagnosing arrhythmias', 'Detecting MI', 'Monitoring heart rate');
    }
    
    // Software engineering
    if (lowerId.includes('react') || lowerName.includes('react')) {
        primaryConcepts.push('React components', 'JSX', 'State management', 'Props');
        subConcepts.push('Hooks', 'Virtual DOM', 'Component lifecycle', 'Event handling');
        practicalApplications.push('Building UIs', 'Creating reusable components', 'Managing application state');
    }
    
    // Physics
    if (lowerId.includes('newton') || lowerName.includes('newton')) {
        primaryConcepts.push('Newton\'s Laws', 'Force', 'Mass', 'Acceleration');
        subConcepts.push('Inertia', 'Action-reaction', 'F=ma', 'Momentum');
        practicalApplications.push('Engineering design', 'Motion analysis', 'Force calculations');
    }
    
    // Biology
    if (lowerId.includes('dna') || lowerName.includes('dna')) {
        primaryConcepts.push('DNA structure', 'Base pairs', 'Double helix', 'Genetic code');
        subConcepts.push('Replication', 'Transcription', 'Translation', 'Mutations');
        practicalApplications.push('Genetic testing', 'Biotechnology', 'Medical diagnosis');
    }
    
    // Generic fallback - extract words as concepts
    if (primaryConcepts.length === 0) {
        const words = topicName.split(/[\s-]+/).filter(w => w.length > 3);
        primaryConcepts.push(...words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)));
    }
    
    return {
        primaryConcepts: primaryConcepts.length > 0 ? primaryConcepts : [topicName],
        subConcepts,
        practicalApplications,
        prerequisites,
    };
}

/**
 * Calculates recommended time structure
 */
function calculateStructure(
    totalMinutes: number,
    complexity: 'basic' | 'intermediate' | 'advanced' | 'expert'
): TopicAnalysis['recommendedStructure'] {
    // Allocate time proportionally
    const introductionRatio = 0.15; // 15%
    const coreContentRatio = 0.50; // 50%
    const examplesRatio = 0.20; // 20%
    const practiceRatio = 0.10; // 10%
    const reviewRatio = 0.05; // 5%
    
    // Adjust for complexity
    let introRatio = introductionRatio;
    let coreRatio = coreContentRatio;
    let examplesRatio_adj = examplesRatio;
    
    if (complexity === 'basic') {
        introRatio = 0.20;
        coreRatio = 0.45;
        examplesRatio_adj = 0.25;
    } else if (complexity === 'advanced' || complexity === 'expert') {
        introRatio = 0.10;
        coreRatio = 0.55;
        examplesRatio_adj = 0.20;
    }
    
    return {
        introductionMinutes: Math.round(totalMinutes * introRatio),
        coreContentMinutes: Math.round(totalMinutes * coreRatio),
        examplesMinutes: Math.round(totalMinutes * examplesRatio_adj),
        practiceMinutes: Math.round(totalMinutes * practiceRatio),
        reviewMinutes: Math.round(totalMinutes * reviewRatio),
    };
}

/**
 * Identifies required visual aids for topic
 */
function identifyVisualAids(
    topicId: string
): string[] {
    const lowerId = topicId.toLowerCase();
    const aids: string[] = [];
    
    // Medical/biological topics
    if (lowerId.includes('heart') || lowerId.includes('cardiac') || lowerId.includes('ecg')) {
        aids.push('3d-model', 'diagram', 'animation');
    }
    
    if (lowerId.includes('brain') || lowerId.includes('neuron') || lowerId.includes('spinal')) {
        aids.push('3d-model', 'diagram');
    }
    
    if (lowerId.includes('dna') || lowerId.includes('cell')) {
        aids.push('3d-model', 'diagram', 'animation');
    }
    
    // Technical topics
    if (lowerId.includes('react') || lowerId.includes('component')) {
        aids.push('diagram', 'interactive');
    }
    
    if (lowerId.includes('algorithm') || lowerId.includes('sorting') || lowerId.includes('graph')) {
        aids.push('animation', 'interactive', 'diagram');
    }
    
    // Physics/engineering
    if (lowerId.includes('circuit') || lowerId.includes('electric')) {
        aids.push('diagram', 'animation');
    }
    
    if (lowerId.includes('kinematics') || lowerId.includes('motion')) {
        aids.push('diagram', 'animation');
    }
    
    // Default visual aids
    if (aids.length === 0) {
        aids.push('diagram', 'text');
    }
    
    return [...new Set(aids)]; // Remove duplicates
}

/**
 * Generates real-world examples for topic
 */
function generateRealWorldExamples(
    topicId: string,
    topicName: string
): string[] {
    const lowerId = topicId.toLowerCase();
    const examples: string[] = [];
    
    // Medical examples
    if (lowerId.includes('ecg')) {
        examples.push(
            'ECGs are performed over 300 million times annually worldwide',
            'ECG can detect heart attacks within minutes of symptom onset',
            'First human ECG was recorded by Willem Einthoven in 1903'
        );
    }
    
    if (lowerId.includes('heart') || lowerId.includes('cardiac')) {
        examples.push(
            'The heart pumps approximately 2,000 gallons of blood daily',
            'Heart disease is the leading cause of death globally',
            'Cardiac surgery has advanced significantly with minimally invasive techniques'
        );
    }
    
    // Technology examples
    if (lowerId.includes('react')) {
        examples.push(
            'React is used by Facebook, Netflix, Airbnb, and thousands of companies',
            'React powers over 10 million websites worldwide',
            'React Native enables building mobile apps with the same codebase'
        );
    }
    
    if (lowerId.includes('algorithm') || lowerId.includes('sorting')) {
        examples.push(
            'Sorting algorithms are fundamental to database queries and search engines',
            'Google processes billions of searches daily using efficient sorting',
            'E-commerce sites use sorting to display products by price, rating, or popularity'
        );
    }
    
    // Physics examples
    if (lowerId.includes('newton') || lowerId.includes('motion')) {
        examples.push(
            'Newton\'s laws explain why seatbelts save lives in car crashes',
            'Rocket launches rely on Newton\'s third law of action-reaction',
            'Sports performance analysis uses kinematics to improve athlete technique'
        );
    }
    
    // Biology examples
    if (lowerId.includes('dna')) {
        examples.push(
            'DNA testing revolutionized criminal investigations and paternity testing',
            'Genetic engineering enables production of insulin and other medications',
            'DNA sequencing costs have dropped from $100 million to under $1,000'
        );
    }
    
    // Generic examples if none found
    if (examples.length === 0) {
        examples.push(
            `Understanding ${topicName} is essential for professionals in this field`,
            `Real-world applications of ${topicName} impact millions of people daily`,
            `Mastery of ${topicName} opens doors to advanced career opportunities`
        );
    }
    
    return examples;
}
