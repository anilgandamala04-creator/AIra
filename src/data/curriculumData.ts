/**
 * Curriculum data aggregator.
 *
 * VISUAL COVERAGE REQUIREMENT: Every topic and every subject across the application
 * (all grades, all competitive exams, all intermediate streams) MUST have static visual
 * content defined: visualType and visualPrompt. This ensures complete visual coverage
 * for AI explanations (diagrams, illustrations, board-style visuals) strictly tied to
 * the selected subject and topic. Subtopics, where applicable, should also define
 * visuals. Use getTopicsMissingVisualCoverage() in development to validate.
 */
import { SchoolBoard, ExamType, Subject, Topic } from '../types';
import { MIDDLE_GRADES, MIDDLE_CURRICULUM } from './curriculum/middle';
import { SECONDARY_GRADES, SECONDARY_CURRICULUM } from './curriculum/secondary';
import { SENIOR_SECONDARY_GRADES, SENIOR_SECONDARY_CURRICULUM } from './curriculum/seniorSecondary';
import { COMPETITIVE_CURRICULUM } from './curriculum/competitive';
import {
    INTERMEDIATE_GROUPS,
    INTERMEDIATE_YEARS,
    GROUP_SUBJECTS,
    INTERMEDIATE_CURRICULUM,
    MPC_CURRICULUM,
    BIPC_CURRICULUM,
    CEC_CURRICULUM,
    MEC_CURRICULUM
} from './curriculum/intermediate';

// Re-export intermediate constants for external use
export {
    INTERMEDIATE_GROUPS,
    INTERMEDIATE_YEARS,
    GROUP_SUBJECTS,
    INTERMEDIATE_CURRICULUM,
    MPC_CURRICULUM,
    BIPC_CURRICULUM,
    CEC_CURRICULUM,
    MEC_CURRICULUM
};

export const BOARDS: SchoolBoard[] = [
    'Telangana State Board',
    'Andhra Pradesh State Board',
    'CBSE',
    'ICSE'
];

export const GRADES = [
    ...MIDDLE_GRADES,
    ...SECONDARY_GRADES,
    ...SENIOR_SECONDARY_GRADES
];

export const COMPETITIVE_EXAMS: ExamType[] = [
    'JEE Main',
    'NEET',
    'EAMCET',
    'GATE',
    'IIT'
];

export { COMPETITIVE_CURRICULUM };

// Aggregate all subjects for lookup
const ALL_CURRICULUM_DATA: Record<string, Subject[]> = {
    ...MIDDLE_CURRICULUM,
    ...SECONDARY_CURRICULUM,
    ...SENIOR_SECONDARY_CURRICULUM,
    ...COMPETITIVE_CURRICULUM,
};

// Flatten all intermediate subjects from all streams (MPC, BiPC, etc.)
const ALL_INTERMEDIATE_SUBJECTS: Subject[] = [
    ...Object.values(MPC_CURRICULUM).flat(),
    ...Object.values(BIPC_CURRICULUM).flat(),
    ...Object.values(CEC_CURRICULUM).flat(),
    ...Object.values(MEC_CURRICULUM).flat(),
];

// Comprehensive list of all subjects (unique by ID for general lookup)
export const ALL_SUBJECTS: Subject[] = Array.from(
    new Map(
        [
            ...Object.values(ALL_CURRICULUM_DATA).flat(),
            ...ALL_INTERMEDIATE_SUBJECTS
        ].map(subject => [subject.id, subject])
    ).values()
);

/**
 * Get subjects available for a specific grade
 */
export function getSubjectsForGrade(grade: string): Subject[] {
    return ALL_CURRICULUM_DATA[grade] || [];
}

/**
 * Get subjects for competitive exam
 */
export function getSubjectsForExam(exam: string): Subject[] {
    return COMPETITIVE_CURRICULUM[exam] || [];
}

/**
 * Get subjects with full topic lists for the current curriculum context.
 * Use this to show all topics available for teaching/explanation.
 */
export function getSubjectsForContext(
    curriculumType: 'school' | 'competitive',
    grade?: string | null,
    exam?: string | null
): Subject[] {
    if (curriculumType === 'school' && grade) {
        return getSubjectsForGrade(grade);
    }
    if (curriculumType === 'competitive' && exam) {
        return getSubjectsForExam(exam);
    }
    return [];
}

/**
 * Legacy mapping for quick access (auto-generated from full curriculum data)
 */
export const SUBJECTS_BY_GRADE: Record<string, string[]> = Object.entries(ALL_CURRICULUM_DATA).reduce(
    (acc, [grade, subjects]) => {
        acc[grade] = subjects.map(s => s.name);
        return acc;
    },
    {} as Record<string, string[]>
);

export const SUBJECT_ICONS: Record<string, string> = {
    'Mathematics': 'calculator',
    'Science': 'flask',
    'EVS': 'leaf',
    'English': 'book',
    'Hindi': 'languages',
    'Social Science': 'globe',
    'Physics': 'zap',
    'Chemistry': 'test-tube',
    'Biology': 'dna',
    'Economics': 'trending-up',
    'Commerce': 'briefcase',
    'Civics': 'landmark',
    'History': 'history',
    'Geography': 'globe',
    'Computer Science': 'code',
    'CS & IT': 'code',
    'General Studies': 'globe',
    'Optional Subject': 'book',
    'Legal Aptitude': 'scale',
    'Legal Reasoning': 'scale',
    'Business Studies': 'briefcase',
    'Mental Ability': 'brain',
    'Quantitative Aptitude': 'calculator',
    'Verbal Ability': 'book',
    'Data Interpretation': 'bar-chart',
    'General Awareness': 'globe',
    'Design Aptitude': 'palette',
};

export const BOARD_EXAM_ICONS: Record<string, string> = {
    'Telangana State Board': 'building-2',
    'Andhra Pradesh State Board': 'building-2',
    'CBSE': 'building-2',
    'ICSE': 'building-2',
    'JEE Main': 'calculator',
    'NEET': 'microscope',
    'EAMCET': 'brain',
    'GATE': 'code',
    'IIT': 'zap'
};

/**
 * Find a topic by its ID across all curriculum data
 */
export function findTopicById(topicId: string): Topic | null {
    for (const subject of ALL_SUBJECTS) {
        const topic = subject.topics.find(t => t.id === topicId);
        if (topic) return topic;
    }
    return null;
}

/**
 * Get the subject name for a topic ID (for curriculum context when building teaching session).
 * Used so Main OS always has correct subject for the selected topic.
 */
export function getSubjectNameForTopicId(topicId: string): string | null {
    for (const subject of ALL_SUBJECTS) {
        const topic = subject.topics.find(t => t.id === topicId);
        if (topic) return subject.name;
    }
    return null;
}

/**
 * Returns topic IDs that are missing visualType or visualPrompt.
 * Use in development to ensure complete visual coverage across all subjects and topics.
 * Every topic should have static visual content (diagram, illustration, board-style) for
 * AI explanations strictly tied to the selected subject and topic.
 */
export function getTopicsMissingVisualCoverage(): { topicId: string; subjectName: string }[] {
    const missing: { topicId: string; subjectName: string }[] = [];
    for (const subject of ALL_SUBJECTS) {
        for (const topic of subject.topics) {
            if (!topic.visualType || !topic.visualPrompt) {
                missing.push({ topicId: topic.id, subjectName: subject.name });
            }
        }
    }
    return missing;
}
