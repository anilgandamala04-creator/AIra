import { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { GeneratedNote } from '../../types';
import { FileText, Download, Printer, Share2, Star, Search, Pin, Archive, ChevronDown, ChevronRight, List, History, CreditCard, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useResourceStore } from '../../stores/resourceStore';
import { getNoteVersions } from '../../services/backendService';
import type { NoteVersion } from '../../services/backendService';

interface NotesViewerProps {
    note: GeneratedNote;
    onClose?: () => void;
    onPin?: (pinned: boolean) => void;
    onArchive?: (archived: boolean) => void;
    /** When provided, title and section content are editable and persisted on blur. */
    onUpdateNote?: (updates: Partial<GeneratedNote>) => void;
}

function highlightText(text: string, query: string): ReactNode {
    if (!query.trim()) return text;
    const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${q})`, 'gi');
    const parts = text.split(re);
    return parts.map((part, i) =>
        i % 2 === 1 ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5">{part}</mark> : part
    );
}

export default function NotesViewer({ note, onPin, onArchive, onUpdateNote }: NotesViewerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [tocOpen, setTocOpen] = useState(true);
    const [isConverting, setIsConverting] = useState(false);
    const generateFlashcardsFromNote = useResourceStore((s) => s.generateFlashcardsFromNote);
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const [versions, setVersions] = useState<NoteVersion[] | null>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const uid = useAuthStore((s) => s.user?.id);
    const loadVersions = useCallback(() => {
        if (!uid) return;
        getNoteVersions(uid, note.id).then(setVersions).catch(() => setVersions([]));
    }, [uid, note.id]);

    const scrollToSection = (index: number) => {
        sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const getMarkdownContent = () =>
        `# ${note.title}\n\n${note.sections.map(s =>
            `## ${s.heading}\n\n${s.content}\n\n**Key Points:**\n${s.highlights.map(h => `- ${h}`).join('\n')}`
        ).join('\n\n')}`;

    const handleDownload = () => {
        const content = getMarkdownContent();
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.topicName.toLowerCase().replace(/\s+/g, '-')}-notes.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            window.print();
            return;
        }
        const content = getMarkdownContent();
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${note.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; line-height: 1.6; }
    h1 { border-bottom: 2px solid #9333ea; padding-bottom: 0.5rem; }
    h2 { color: #581c87; margin-top: 1.5rem; }
    ul { margin: 0.5rem 0; }
    @media print { body { margin: 1rem; } }
  </style>
</head>
<body>
  <pre style="white-space: pre-wrap; font-family: inherit;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    const handleShare = async () => {
        const summary = `${note.title}\n\n${note.sections.map(s => `${s.heading}: ${s.content.slice(0, 120)}${s.content.length > 120 ? '…' : ''}`).join('\n\n')}`;
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: note.title,
                    text: summary,
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') copyShareFallback(summary);
            }
        } else {
            copyShareFallback(summary);
        }
    };

    const handleConvertToFlashcards = async () => {
        if (isConverting || !note.sections?.length) return;
        setIsConverting(true);
        try {
            await generateFlashcardsFromNote(note);
        } catch {
            // Error already shown by store
        } finally {
            setIsConverting(false);
        }
    };

    const copyShareFallback = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            if (typeof document !== 'undefined') {
                const toast = document.createElement('div');
                toast.textContent = 'Note summary copied to clipboard';
                toast.setAttribute('role', 'status');
                Object.assign(toast.style, {
                    position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
                    padding: '0.5rem 1rem', background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '14px', zIndex: '9999',
                });
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
            }
        } catch {
            // no-op
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden min-w-0 max-w-full"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 min-w-0">
                            <FileText className="w-5 h-5 shrink-0" />
                            {onUpdateNote ? (
                                <input
                                    type="text"
                                    value={note.title}
                                    onChange={(e) => onUpdateNote({ title: e.target.value })}
                                    onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== note.title) onUpdateNote({ title: v }); }}
                                    className="font-bold text-base sm:text-lg bg-transparent border-b border-white/30 focus:border-white/60 focus:outline-none w-full min-w-0 text-white placeholder-white/70"
                                    placeholder="Note title"
                                />
                            ) : (
                                <h2 className="font-bold text-base sm:text-lg truncate" title={note.title}>{note.title}</h2>
                            )}
                        </div>
                        <p className="text-purple-100 text-sm">
                            Generated from your learning session
                        </p>
                    </div>
                    {note.qualityScore && (
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                            <span className="font-medium">{note.qualityScore}%</span>
                        </div>
                    )}
                    {(onPin || onArchive) && (
                        <div className="flex gap-1 mt-2">
                            {onPin && (
                                <button
                                    type="button"
                                    onClick={() => onPin(!note.pinned)}
                                    className={`p-1.5 rounded-lg transition-colors ${note.pinned ? 'bg-white/30 text-white' : 'bg-white/10 hover:bg-white/20 text-white/90'}`}
                                    title={note.pinned ? 'Unpin' : 'Pin to top'}
                                    aria-label={note.pinned ? 'Unpin' : 'Pin to top'}
                                >
                                    <Pin className={`w-4 h-4 ${note.pinned ? 'fill-current' : ''}`} />
                                </button>
                            )}
                            {onArchive && (
                                <button
                                    type="button"
                                    onClick={() => onArchive(!note.archived)}
                                    className={`p-1.5 rounded-lg transition-colors ${note.archived ? 'bg-white/30 text-white' : 'bg-white/10 hover:bg-white/20 text-white/90'}`}
                                    title={note.archived ? 'Unarchive' : 'Archive'}
                                    aria-label={note.archived ? 'Unarchive' : 'Archive'}
                                >
                                    <Archive className={`w-4 h-4 ${note.archived ? 'fill-current' : ''}`} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Table of contents */}
            {note.sections.length > 1 && (
                <div className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30">
                    <button
                        type="button"
                        onClick={() => setTocOpen((v) => !v)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                    >
                        {tocOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <List className="w-4 h-4" />
                        Contents
                    </button>
                    {tocOpen && (
                        <ul className="px-3 pb-2 max-h-32 overflow-y-auto space-y-0.5">
                            {note.sections.map((s, i) => (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection(i)}
                                        className="w-full text-left text-xs text-purple-600 dark:text-purple-400 hover:underline truncate py-0.5"
                                    >
                                        {i + 1}. {s.heading}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* In-note search */}
            <div className="p-2 border-b border-gray-100 dark:border-slate-700">
                <label className="sr-only" htmlFor="note-search">Search in this note</label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input
                        id="note-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in this note…"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-slate-100"
                    />
                </div>
            </div>

            {/* Actions Bar - scrollable on mobile to prevent overflow */}
            <div className="flex items-center gap-2 p-2 border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto scrollbar-hide shrink-0 min-w-0 pb-3 sm:pb-2">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-200"
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-200"
                    aria-label="Print note"
                >
                    <Printer className="w-4 h-4" />
                    Print
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-200"
                    aria-label="Share note"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
                <button
                    type="button"
                    onClick={handleConvertToFlashcards}
                    disabled={isConverting || !note.sections?.length}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/60 disabled:opacity-50 rounded-lg transition-colors text-purple-700 dark:text-purple-300"
                    aria-label="Create flashcards from this note"
                    title="Generate AI flashcards from note content"
                >
                    {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Create flashcards
                </button>
                <button
                    onClick={() => { handlePrint(); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-200"
                    aria-label="Download as PDF (print dialog)"
                    title="Open print dialog — choose 'Save as PDF' to download PDF"
                >
                    <FileText className="w-4 h-4" />
                    Download PDF
                </button>
                {onUpdateNote && uid && (
                    <button
                        type="button"
                        onClick={() => { setVersions(null); loadVersions(); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-200"
                        aria-label="Previous versions"
                    >
                        <History className="w-4 h-4" />
                        Previous versions
                    </button>
                )}
            </div>

            {versions !== null && (
                <div className="p-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2">Previous versions</h4>
                    {versions.length === 0 ? (
                        <p className="text-xs text-gray-500 dark:text-slate-400">No previous versions saved yet. Edits will create version history.</p>
                    ) : (
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {versions.slice().reverse().map((v, i) => (
                                <li key={i} className="flex items-center justify-between gap-2 text-xs">
                                    <span className="text-gray-600 dark:text-slate-300 truncate">{v.title || 'Untitled'} — {new Date(v.updatedAt).toLocaleString()}</span>
                                    {onUpdateNote && (
                                        <button
                                            type="button"
                                            onClick={() => { onUpdateNote({ title: v.title, content: v.content, sections: v.sections }); setVersions(null); }}
                                            className="shrink-0 px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                                        >
                                            Restore
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    <button type="button" onClick={() => setVersions(null)} className="mt-2 text-xs text-gray-500 hover:underline">Close</button>
                </div>
            )}

            {/* Content - responsive max-height; sections are collapsible and scroll-targetable */}
            <div className="p-3 sm:p-4 max-h-[60vh] sm:max-h-[500px] overflow-y-auto overflow-x-hidden min-h-0">
                {note.sections.map((section, index) => {
                    const isCollapsed = collapsed[index] ?? false;
                    return (
                        <motion.div
                            key={index}
                            ref={(el) => { sectionRefs.current[index] = el; }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="mb-6 last:mb-0 scroll-mt-4"
                        >
                            <button
                                type="button"
                                onClick={() => setCollapsed((c) => ({ ...c, [index]: !c[index] }))}
                                className="w-full flex items-center gap-2 text-left font-bold text-gray-800 dark:text-slate-100 mb-2"
                            >
                                <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                    {index + 1}
                                </span>
                                {isCollapsed ? <ChevronRight className="w-4 h-4 shrink-0 text-gray-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-gray-500" />}
                                {onUpdateNote ? (
                                    <input
                                        type="text"
                                        value={section.heading}
                                        onChange={(e) => {
                                            const next = [...note.sections];
                                            next[index] = { ...section, heading: e.target.value };
                                            onUpdateNote({ sections: next });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 min-w-0 font-bold bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-slate-600 focus:outline-none focus:border-purple-500 rounded px-0.5 -mx-0.5"
                                    />
                                ) : (
                                    <span className="flex-1 min-w-0 truncate">{highlightText(section.heading, searchQuery)}</span>
                                )}
                            </button>
                            {!isCollapsed && (
                                <>
                                    {onUpdateNote ? (
                                        <textarea
                                            value={section.content}
                                            onChange={(e) => {
                                                const next = [...note.sections];
                                                next[index] = { ...section, content: e.target.value };
                                                onUpdateNote({ sections: next });
                                            }}
                                            onBlur={(e) => {
                                                const v = e.target.value.trim();
                                                if (v !== section.content) {
                                                    const next = [...note.sections];
                                                    next[index] = { ...section, content: v };
                                                    onUpdateNote({ sections: next });
                                                }
                                            }}
                                            data-reading-content
                                            className="w-full text-gray-600 dark:text-slate-300 leading-relaxed mb-3 pl-8 min-h-[80px] bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y"
                                        />
                                    ) : (
                                        <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-3 pl-8" data-reading-content>
                                            {highlightText(section.content, searchQuery)}
                                        </p>
                                    )}
                                    <div className="pl-8">
                                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Key Points:</p>
                                        <ul className="space-y-1">
                                            {section.highlights.map((highlight, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300" data-reading-content>
                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 shrink-0" />
                                                    {highlightText(highlight, searchQuery)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
