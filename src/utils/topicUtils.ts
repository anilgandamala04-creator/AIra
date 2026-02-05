import { professions } from '../data/professions';
import type { Topic } from '../types';

/**
 * Finds topic information from the professions data structure
 */
export function findTopicInfo(topicId: string): { topic: Topic | null; subjectArea: string | null } {
    // Search in professions data
    for (const profession of professions) {
        for (const subProfession of profession.subProfessions) {
            for (const subject of subProfession.subjects) {
                const topic = subject.topics.find(t => t.id === topicId);
                if (topic) {
                    // Determine subject area from profession and sub-profession
                    const subjectArea = `${profession.name} - ${subProfession.name}`;
                    return { topic, subjectArea };
                }
            }
        }
    }
    return { topic: null, subjectArea: null };
}

/**
 * Formats topic ID to a readable name
 */
export function formatTopicName(topicId: string): string {
    return topicId
        .split('-')
        .map(word => word && word.length > 0 
            ? word.charAt(0).toUpperCase() + word.slice(1) 
            : word)
        .join(' ');
}
