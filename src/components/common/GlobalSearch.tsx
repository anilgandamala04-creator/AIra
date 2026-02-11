/**
 * Global search: topics (curriculum), notes, and doubts.
 * Renders a trigger button and a dropdown/modal with search input and results.
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, BookOpen, MessageCircleQuestion, X } from 'lucide-react';
import { getSubjectsForContext } from '../../data/curriculumData';
import { useResourceStore } from '../../stores/resourceStore';
import { useDoubts } from '../../hooks/useBackend';
import type { Subject, Topic } from '../../types';

export interface GlobalSearchProps {
    curriculumType: 'school' | 'competitive' | null;
    selectedGrade?: string | null;
    selectedExam?: string | null;
    className?: string;
}

type ResultType = 'topic' | 'note' | 'doubt';
interface SearchResult {
    type: ResultType;
    id: string;
    label: string;
    sublabel?: string;
    path: string;
    state?: object;
}

function flattenTopics(subjects: Subject[]): { topic: Topic; subjectName: string }[] {
    const out: { topic: Topic; subjectName: string }[] = [];
    for (const sub of subjects) {
        for (const topic of sub.topics ?? []) {
            out.push({ topic, subjectName: sub.name });
        }
    }
    return out;
}

export default function GlobalSearch({
    curriculumType,
    selectedGrade,
    selectedExam,
    className = '',
}: GlobalSearchProps) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const notes = useResourceStore((s) => s.notes);
    const { doubts } = useDoubts(); // All doubts (past + current) for search

    const subjects = useMemo(() => {
        if (!curriculumType) return [];
        return getSubjectsForContext(
            curriculumType,
            selectedGrade ?? undefined,
            selectedExam ?? undefined
        );
    }, [curriculumType, selectedGrade, selectedExam]);

    const allTopics = useMemo(() => flattenTopics(subjects), [subjects]);

    const results = useMemo((): SearchResult[] => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        const out: SearchResult[] = [];

        for (const { topic, subjectName } of allTopics) {
            if (topic.name.toLowerCase().includes(q) || (topic.id && topic.id.toLowerCase().includes(q))) {
                out.push({
                    type: 'topic',
                    id: topic.id,
                    label: topic.name,
                    sublabel: subjectName,
                    path: `/learn/${topic.id}`,
                    state: { subjectName },
                });
            }
        }
        for (const note of notes) {
            const title = (note.title || '').toLowerCase();
            const content = (note.content || '').toLowerCase();
            if (title.includes(q) || content.includes(q)) {
                out.push({
                    type: 'note',
                    id: note.id,
                    label: note.title || 'Untitled note',
                    sublabel: note.topicName,
                    path: '/learn/' + (note.sessionId?.split('_')[1] || ''),
                });
            }
        }
        for (const doubt of doubts) {
            if (doubt.question.toLowerCase().includes(q)) {
                out.push({
                    type: 'doubt',
                    id: doubt.id,
                    label: doubt.question.slice(0, 60) + (doubt.question.length > 60 ? '…' : ''),
                    sublabel: 'Doubt',
                    path: '/learn/',
                });
            }
        }

        return out.slice(0, 20);
    }, [query, allTopics, notes, doubts]);

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
        }
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (r: SearchResult) => {
        setOpen(false);
        setQuery('');
        navigate(r.path, { state: r.state });
    };

    const iconByType = { topic: BookOpen, note: FileText, doubt: MessageCircleQuestion };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400"
                aria-label="Global search"
                title="Search topics, notes, and doubts"
            >
                <Search className="w-5 h-5" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-[min(90vw,400px)] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-[100] overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search topics, notes, doubts…"
                            className="flex-1 min-w-0 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-slate-100 placeholder-gray-400"
                        />
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {results.length === 0 && query.trim() && (
                            <p className="p-4 text-sm text-gray-500 dark:text-slate-400">No results</p>
                        )}
                        {results.length === 0 && !query.trim() && (
                            <p className="p-4 text-sm text-gray-500 dark:text-slate-400">Type to search</p>
                        )}
                        {results.map((r) => {
                            const Icon = iconByType[r.type];
                            return (
                                <button
                                    key={`${r.type}-${r.id}`}
                                    type="button"
                                    onClick={() => handleSelect(r)}
                                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-50 dark:border-slate-800 last:border-0"
                                >
                                    <Icon className="w-5 h-5 text-purple-500 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                                            {r.label}
                                        </p>
                                        {r.sublabel && (
                                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                                {r.sublabel}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
