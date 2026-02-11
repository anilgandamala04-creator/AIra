import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceControlsProps {
    isMuted: boolean;
    onToggleMute: () => void;
    isSpeaking: boolean;
    isPaused: boolean;
}

export function VoiceControls({ isMuted, onToggleMute, isSpeaking, isPaused }: VoiceControlsProps) {
    return (
        <div className="flex items-center gap-3">
            {/* Visualizer - only show when actively teaching */}
            {isSpeaking && !isPaused && !isMuted && (
                <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 lg:mr-2">
                    <div className="flex gap-1 h-4 items-end">
                        <motion.div className="w-1 bg-current rounded-full" animate={{ height: ['40%', '100%', '40%'] }} transition={{ duration: 0.45, repeat: Infinity }} />
                        <motion.div className="w-1 bg-current rounded-full" animate={{ height: ['60%', '30%', '60%'] }} transition={{ duration: 0.45, repeat: Infinity, delay: 0.1 }} />
                        <motion.div className="w-1 bg-current rounded-full" animate={{ height: ['100%', '40%', '100%'] }} transition={{ duration: 0.45, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-1 bg-current rounded-full hidden sm:block" animate={{ height: ['50%', '80%', '50%'] }} transition={{ duration: 0.45, repeat: Infinity, delay: 0.15 }} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium animate-pulse hidden sm:inline-block">Teaching...</span>
                </div>
            )}

            <button
                onClick={onToggleMute}
                type="button"
                className={`p-2 rounded-full transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 ${isMuted
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700'
                        : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 shadow-sm'
                    }`}
                title={isMuted ? "Unmute tutor" : "Mute tutor"}
                aria-label={isMuted ? "Unmute tutor" : "Mute tutor"}
            >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
        </div>
    );
}
