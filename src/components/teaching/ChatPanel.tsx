import { motion } from 'framer-motion';
import {
    MessageCircle, Copy, Check, Edit2, Send, ThumbsUp, ThumbsDown, RefreshCw, X, Paperclip
} from 'lucide-react';
import { useRef, useEffect, memo } from 'react';
import { toast } from '../../stores/toastStore';
import { ChatMessage } from '../../types';
import { TRANSITION_DEFAULT } from '../../utils/animations';
import { FixedSizeList as List } from 'react-window';

interface ChatPanelProps {
    isMobile: boolean;
    mobilePanel: 'home' | 'teach' | 'studio';
    reduceAnimations: boolean;
    chatMessages: ChatMessage[];
    isWaitingForAI: boolean;
    isResolvingDoubt: boolean;
    editingMessageId: string | null;
    editDraft: string;
    inputMessage: string;
    uploadedFiles: File[];
    t: (key: string) => string;

    // Actions
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    setEditingMessageId: (id: string | null) => void;
    setEditDraft: (draft: string) => void;
    setInputMessage: (msg: string) => void;
    setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    onSendMessage: (messageOverride?: string, conversationSnapshot?: ChatMessage[]) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MemoizedMessage = memo(({
    msg,
    isLastUser,
    isLastAi,
    isEditingThis,
    editDraft,
    setEditDraft,
    setEditingMessageId,
    setChatMessages,
    chatMessages,
    onSendMessage,
    isWaitingForAI,
    style
}: {
    msg: ChatMessage;
    isLastUser: boolean;
    isLastAi: boolean;
    isEditingThis: boolean;
    editDraft: string;
    setEditDraft: (s: string) => void;
    setEditingMessageId: (s: string | null) => void;
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    chatMessages: ChatMessage[];
    onSendMessage: (messageOverride?: string, conversationSnapshot?: ChatMessage[]) => void;
    isWaitingForAI: boolean;
    style: React.CSSProperties;
}) => (
    <div style={{ ...style, padding: '0.25rem 0' }}>
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} h-full px-2`}
        >
            <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col h-full`}>
                {msg.type === 'user' && isEditingThis ? (
                    <div className="space-y-1.5 h-full flex flex-col">
                        <textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 text-gray-900 dark:text-slate-100 resize-none flex-1"
                            placeholder="Edit your message..."
                        />
                        <div className="flex flex-wrap gap-1">
                            <button type="button" onClick={() => { setEditingMessageId(null); setEditDraft(''); }} className="px-2 py-1 text-[10px] rounded-lg bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                            <button type="button" onClick={() => {
                                const trimmed = editDraft.trim();
                                if (!trimmed) return;
                                setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: trimmed } : m));
                                setEditingMessageId(null);
                                setEditDraft('');
                            }} className="px-2 py-1 text-[10px] rounded-lg bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500 flex items-center gap-1"><Check className="w-3 h-3" /> Save</button>
                            <button type="button" onClick={() => {
                                const trimmed = editDraft.trim();
                                if (!trimmed) return;
                                const idx = chatMessages.findIndex(m => m.id === msg.id);
                                const snapshot = chatMessages.slice(0, idx + 1).map((m, i) => i === idx ? { ...m, content: trimmed } : m);
                                setChatMessages(snapshot);
                                setEditingMessageId(null);
                                setEditDraft('');
                                onSendMessage(trimmed, snapshot);
                            }} disabled={isWaitingForAI} className="px-2 py-1 text-[10px] rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1 disabled:opacity-50"><Send className="w-3 h-3" /> Resend</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className={`px - 3 py - 2 rounded - 2xl text - xs sm: text - sm leading - relaxed break-words whitespace - pre - wrap flex - 1 overflow - y - auto ${msg.type === 'user'
                                ? 'bg-purple-500 text-white rounded-br-md'
                                : msg.isError
                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 rounded-bl-md'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-md'
                            } `} data-reading-content>
                            {msg.content}
                        </div>
                        <div className={`flex items - center gap - 2 mt - 0.5 flex - wrap shrink - 0 ${msg.type === 'user' ? 'justify-end' : 'justify-start'} `}>
                            <p className="text-[9px] text-gray-400 dark:text-slate-500">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {msg.type === 'user' && isLastUser && !isEditingThis && (
                                <button type="button" onClick={() => { setEditingMessageId(msg.id); setEditDraft(msg.content); }} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-400" title="Edit message"><Edit2 className="w-3 h-3" /></button>
                            )}
                            {msg.type === 'ai' && isLastAi && !msg.isError && (
                                <span className="flex items-center gap-0.5">
                                    <button type="button" onClick={() => { setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, feedback: 'helpful' as const } : m)); toast.success('Thanks for your feedback!'); }} className={`p - 0.5 rounded hover: bg - gray - 200 dark: hover: bg - slate - 600 ${msg.feedback === 'helpful' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'} `} title="Helpful"><ThumbsUp className="w-3 h-3" /></button>
                                    <button type="button" onClick={() => { setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, feedback: 'not_helpful' as const } : m)); toast.info('Sorry about that. Try "Regenerate" for a new answer.'); }} className={`p - 0.5 rounded hover: bg - gray - 200 dark: hover: bg - slate - 600 ${msg.feedback === 'not_helpful' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-slate-400'} `} title="Not helpful"><ThumbsDown className="w-3 h-3" /></button>
                                    <button type="button" onClick={() => { const lastUserIdx = chatMessages.map(m => m.type).lastIndexOf('user'); if (lastUserIdx === -1) return; const snapshot = chatMessages.slice(0, lastUserIdx + 1); setChatMessages(snapshot); onSendMessage(chatMessages[lastUserIdx].content, snapshot); }} disabled={isWaitingForAI} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-400 disabled:opacity-50" title="Regenerate response"><RefreshCw className="w-3 h-3" /></button>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    </div>
));

MemoizedMessage.displayName = 'MemoizedMessage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VirtualList = List as any;

export function ChatPanel({
    isMobile,
    mobilePanel,
    reduceAnimations,
    chatMessages,
    isWaitingForAI,
    isResolvingDoubt,
    editingMessageId,
    editDraft,
    inputMessage,
    uploadedFiles,
    t,
    setChatMessages,
    setEditingMessageId,
    setEditDraft,
    setInputMessage,
    setUploadedFiles,
    onSendMessage,
    onFileUpload
}: ChatPanelProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollToItem(chatMessages.length - 1, 'end');
        }
    }, [chatMessages, isWaitingForAI]);

    // Handle enter key to send
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    const MessageRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const msg = chatMessages[index];
        if (!msg) return null;

        const isLastUser = msg.type === 'user' && index === chatMessages.map(m => m.type).lastIndexOf('user');
        const isLastAi = msg.type === 'ai' && index === chatMessages.map(m => m.type).lastIndexOf('ai');
        const isEditingThis = editingMessageId === msg.id;

        return (
            <MemoizedMessage
                msg={msg}
                isLastUser={isLastUser}
                isLastAi={isLastAi}
                isEditingThis={isEditingThis}
                editDraft={editDraft}
                setEditDraft={setEditDraft}
                setEditingMessageId={setEditingMessageId}
                setChatMessages={setChatMessages}
                chatMessages={chatMessages}
                onSendMessage={onSendMessage}
                isWaitingForAI={isWaitingForAI}
                style={style}
            />
        );
    };

    return (
        <motion.div
            initial={isMobile ? { opacity: 0 } : {}}
            animate={isMobile ? {
                opacity: mobilePanel === 'home' ? 1 : 0,
            } : {
                width: 'var(--panel-chat-width)'
            }}
            transition={{ duration: reduceAnimations ? 0 : TRANSITION_DEFAULT.duration, ease: TRANSITION_DEFAULT.ease }}
            className={`${isMobile ? 'absolute' : 'absolute xl:relative'} ${isMobile ? 'inset-0' : 'xl:inset-auto'} ${isMobile ? 'w-full h-full' : 'min-w-0 xl:flex-shrink-0 xl:flex-grow-0'} os - panel flex flex - col overflow - hidden z - 30 xl: z - auto ${mobilePanel === 'home' ? 'flex' : 'hidden xl:flex'} `}
            style={isMobile ? {
                display: mobilePanel === 'home' ? 'flex' : 'none',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: mobilePanel === 'home' ? 'auto' : 'none'
            } : {
                width: 'var(--panel-chat-width)'
            }}
        >
            {/* Chat panel: header text centered in panel */}
            <div className={`panel - header ${isMobile ? 'safe-top' : ''} `}>
                <div className="flex-1 min-w-0 flex justify-end items-center" aria-hidden />
                <h2 className="panel-title truncate shrink-0 px-2 text-center" id="panel-chat-title">{t('chat')} Panel</h2>
                <div className="flex-1 min-w-0 flex justify-start items-center gap-1">
                    {chatMessages.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                const text = chatMessages.map(m => `${m.type === 'user' ? 'You' : 'AIra'}: ${m.content} `).join('\n\n');
                                navigator.clipboard.writeText(text).then(() => toast.success('Conversation copied to clipboard')).catch(() => toast.error('Could not copy'));
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                            title="Copy conversation"
                            aria-label="Copy conversation"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    )}
                    {isResolvingDoubt && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 opacity-90" aria-live="polite">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            <span className="hidden sm:inline">Resolving doubt...</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Chat messages area */}
            <div
                className="flex-1 min-h-0 relative safe-bottom"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
            >
                {/* Empty state */}
                {chatMessages.length === 0 && !isWaitingForAI && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-8 z-10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Start a conversation</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-[200px]">
                                Ask questions about the topic or get help with any doubts
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
                            {['Explain this concept', 'Give me an example', 'Why is this important?'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setInputMessage(suggestion)}
                                    className="px-3 py-1.5 text-xs rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message list */}
                <div className="w-full h-full">
                    <VirtualList
                        ref={listRef}
                        height={isMobile ? window.innerHeight - 200 : 500}
                        itemCount={chatMessages.length}
                        itemSize={120}
                        width="100%"
                        className="scroll-smooth"
                        style={{ padding: '0.5rem 0' }}
                    >
                        {MessageRow}
                    </VirtualList>
                </div>

                {/* Typing indicator - overlay at bottom */}
                {isWaitingForAI && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-2 left-4 z-20"
                    >
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur px-3 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <div className="flex gap-1.5 items-center" aria-busy="true" aria-label="AI is typing">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 safe-bottom">
                <div className="flex items-end gap-2 relative">
                    {/* File Attachments */}
                    {uploadedFiles.length > 0 && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg flex flex-wrap gap-2 shadow-sm border border-gray-200 dark:border-slate-700 z-10">
                            {uploadedFiles.map((file, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 text-xs text-gray-700 dark:text-slate-300">
                                    <span className="truncate max-w-[120px]">{file.name}</span>
                                    <button type="button" onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-0.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full"><X className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <label className="p-2 sm:p-2.5 rounded-xl text-gray-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation">
                        <input type="file" multiple className="hidden" onChange={onFileUpload} disabled={isWaitingForAI} />
                        <Paperclip className="w-5 h-5" />
                    </label>

                    <div className="flex-1 min-w-0 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all">
                        <textarea
                            ref={textareaRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question..."
                            className="w-full max-h-[120px] py-2.5 px-3.5 bg-transparent border-0 focus:ring-0 text-sm sm:text-base text-gray-900 dark:text-slate-100 placeholder:text-gray-400 resize-none leading-relaxed"
                            rows={1}
                            style={{ height: 'auto', minHeight: '44px' }}
                            disabled={isWaitingForAI}
                        />
                    </div>

                    <button
                        onClick={() => onSendMessage()}
                        disabled={(!inputMessage.trim() && uploadedFiles.length === 0) || isWaitingForAI}
                        className="p-2.5 sm:p-3 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30 hover:bg-purple-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all touch-manipulation"
                        aria-label="Send message"
                    >
                        <Send className={`w - 5 h - 5 ${isWaitingForAI ? 'opacity-50' : ''} `} />
                    </button>
                </div>
                <p className="mt-2 text-[10px] text-center text-gray-400 dark:text-slate-500 px-4 leading-tight">
                    AI can make mistakes. Please verify important information.
                </p>
            </div>
        </motion.div>
    );
}
