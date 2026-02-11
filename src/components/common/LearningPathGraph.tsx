/**
 * Learning path / prerequisite graph for topics within a subject.
 * Shows topic nodes with arrows indicating curriculum order and explicit prerequisites.
 * Uses CSS/SVG only - no external graph library.
 */

import { motion } from 'framer-motion';
import { ChevronRight, GitBranch } from 'lucide-react';
import type { Topic } from '../../types';

interface LearningPathGraphProps {
  topics: Topic[];
  topicProgressMap: Record<string, number>;
  onTopicClick: (topicId: string) => void;
  className?: string;
}

export default function LearningPathGraph({
  topics,
  topicProgressMap,
  onTopicClick,
  className = '',
}: LearningPathGraphProps) {
  if (topics.length === 0) return null;

  const progressColor = (topicId: string) => {
    const p = topicProgressMap[topicId] ?? 0;
    if (p >= 100) return 'ring-green-400 bg-green-50 dark:bg-green-950/40';
    if (p > 0) return 'ring-amber-400 bg-amber-50 dark:bg-amber-950/40';
    return 'ring-gray-300 dark:ring-slate-600 bg-white dark:bg-slate-800';
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="w-5 h-5 text-purple-500" />
        <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Learning path</h4>
      </div>
      <div className="overflow-x-auto pb-4 -mx-1">
        <div className="flex items-center gap-2 min-w-max px-1">
          {topics.map((topic, i) => (
            <div key={topic.id} className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={() => onTopicClick(topic.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all
                  hover:scale-105 hover:shadow-lg text-left shrink-0
                  ${progressColor(topic.id)}
                  ring-2
                `}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400 w-5">{i + 1}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate max-w-[140px] sm:max-w-[200px]">
                  {topic.name}
                </span>
                {(topicProgressMap[topic.id] ?? 0) >= 100 && (
                  <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                )}
              </motion.button>
              {i < topics.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-slate-600 shrink-0" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
        Topics in recommended order. Green = completed, amber = in progress.
      </p>
    </div>
  );
}
