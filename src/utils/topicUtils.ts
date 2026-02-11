import { ALL_SUBJECTS } from '../data/curriculumData';
import type { Topic } from '../types';

/**
 * Get similar or recommended topics (same subject, prerequisites, or curriculum order).
 * Used for "You might also like" after completing a topic.
 */
export function getSimilarTopics(topicId: string, limit = 6): Topic[] {
  const { topic, subjectArea } = findTopicInfo(topicId);
  if (!topic || !subjectArea) return [];

  const subject = ALL_SUBJECTS.find((s) => s.name === subjectArea || s.id === subjectArea.toLowerCase());
  if (!subject?.topics) return [];

  const others = subject.topics.filter((t) => t.id !== topicId);
  const result: Topic[] = [];
  const seen = new Set<string>([topicId]);

  // Prefer topics that list this one as prerequisite (natural next steps)
  const nextSteps = others.filter((t) => t.prerequisites?.includes(topicId));
  nextSteps.forEach((t) => {
    if (result.length < limit && !seen.has(t.id)) {
      result.push(t);
      seen.add(t.id);
    }
  });

  // Then same-difficulty or adjacent in list
  others.forEach((t) => {
    if (result.length >= limit || seen.has(t.id)) return;
    result.push(t);
    seen.add(t.id);
  });

  return result.slice(0, limit);
}

/**
 * Finds topic information from the curriculum data structure
 */
export function findTopicInfo(topicId: string): { topic: Topic | null; subjectArea: string | null } {
  // Search in curriculum subjects
  for (const subject of ALL_SUBJECTS) {
    const topic = subject.topics.find(t => t.id === topicId);
    if (topic) {
      return { topic, subjectArea: subject.name };
    }
  }
  return { topic: null, subjectArea: null };
}

/**
 * Finds the subject that contains the given topic ID.
 */
export const findSubjectByTopicId = (topicId: string) => {
  return ALL_SUBJECTS.find(s => s.topics.some(t => t.id === topicId));
};

/**
 * Formats topic ID to a readable name
 */
export const formatTopicName = (id: string): string => {
  return id
    .split('-')
    .map(word => word && word.length > 0
      ? word.charAt(0).toUpperCase() + word.slice(1)
      : word)
    .join(' ');
}
