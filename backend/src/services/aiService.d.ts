export declare const AI_PROMPT_MAX_LENGTH = 32000;
export type ModelType = 'llama' | 'mistral';
export declare function getAvailableModels(): {
    llama: boolean;
    mistral: boolean;
};
export declare const aiService: {
    generateResponse(prompt: string, modelType?: ModelType, systemPrompt?: string): Promise<string>;
    resolveDoubt(question: string, context: string, curriculumContext?: {
        curriculumType?: string;
        board?: string;
        grade?: string;
        exam?: string;
        subject?: string;
        topic?: string;
    }, modelOverride?: ModelType): Promise<{
        explanation: string;
        examples: string[];
        visualType?: string;
        visualPrompt?: string;
        quizQuestion: {
            question: string;
            options: string[];
            correctAnswer: number;
            explanation: string;
        } | null;
    }>;
    generateTeachingContent(topic: string, curriculumContext?: {
        curriculumType?: string;
        board?: string;
        grade?: string;
        exam?: string;
        subject?: string;
    }, modelOverride?: ModelType): Promise<{
        title: string;
        sections: {
            title: string;
            content: string;
            visualType?: string;
            visualPrompt?: string;
        }[];
        summary: string;
    }>;
    /**
     * Generate teaching content from a full client-built prompt (rich curriculum, 45+ min, etc.).
     * Use when the frontend sends a complete prompt; returns parsed JSON as-is so spokenContent/durationMinutes are preserved.
     */
    generateTeachingContentFromPrompt(fullPrompt: string, modelOverride?: ModelType): Promise<{
        title: string;
        sections: Array<{
            title: string;
            content: string;
            spokenContent?: string;
            durationMinutes?: number;
            visualType?: string;
            visualPrompt?: string;
        }>;
        summary: string;
    }>;
    generateQuiz(topic: string, context: string, curriculumContext?: {
        curriculumType?: string;
        board?: string;
        grade?: string;
        exam?: string;
        subject?: string;
    }, modelOverride?: ModelType): Promise<{
        questions: {
            question: string;
            options: string[];
            correctAnswer: number;
            explanation: string;
        }[];
    }>;
};
//# sourceMappingURL=aiService.d.ts.map