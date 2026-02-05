import { motion } from 'framer-motion';
import type { GeneratedNote } from '../../types';
import { FileText, Download, Printer, Share2, Star } from 'lucide-react';

interface NotesViewerProps {
    note: GeneratedNote;
    onClose?: () => void;
}

export default function NotesViewer({ note }: NotesViewerProps) {
    const handleDownload = () => {
        const content = `# ${note.title}\n\n${note.sections.map(s =>
            `## ${s.heading}\n\n${s.content}\n\n**Key Points:**\n${s.highlights.map(h => `- ${h}`).join('\n')}`
        ).join('\n\n')}`;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.topicName.toLowerCase().replace(/\s+/g, '-')}-notes.md`;
        a.click();
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
                            <h2 className="font-bold text-base sm:text-lg truncate" title={note.title}>{note.title}</h2>
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
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-3 border-b border-gray-100 dark:border-slate-700">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-200"
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-200">
                    <Printer className="w-4 h-4" />
                    Print
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-200">
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
            </div>

            {/* Content - responsive max-height so panel stays usable on small screens */}
            <div className="p-3 sm:p-4 max-h-[60vh] sm:max-h-[500px] overflow-y-auto overflow-x-hidden min-h-0">
                {note.sections.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="mb-6 last:mb-0"
                    >
                        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                            </span>
                            {section.heading}
                        </h3>
                        <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-3 pl-8">
                            {section.content}
                        </p>
                        <div className="pl-8">
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Key Points:</p>
                            <ul className="space-y-1">
                                {section.highlights.map((highlight, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 shrink-0" />
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
