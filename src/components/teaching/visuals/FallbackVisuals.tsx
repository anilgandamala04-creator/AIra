import { motion } from 'framer-motion';
import { VisualProps, useVisualSync } from './Common';

// ============================================
// FALLBACK & DYNAMIC VISUALS
// ============================================

export function DefaultTopicVisual({ title, topicName }: VisualProps) {
    const displayLabel = topicName || title || 'Learning Topic';
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="transparent" />
            <motion.circle cx="200" cy="140" r="80" fill="url(#defaultGradient)" stroke="#22c55e" strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} />
            <motion.text x="200" y="140" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">
                {displayLabel.length > 28 ? displayLabel.slice(0, 26) + '…' : displayLabel}
            </motion.text>
            <text x="200" y="260" fontSize="12" fill="rgba(167, 243, 208, 0.6)" textAnchor="middle">Visual aid for this topic</text>
        </svg>
    );
}

export function RealisticVisual({
    visualType,
    isSpeaking,
    stepId
}: VisualProps) {
    useVisualSync(stepId, isSpeaking);

    // Choose theme colors based on visualType
    const theme = (() => {
        switch (visualType) {
            case '3d-model': return { primary: '#60a5fa', secondary: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
            case 'animation': return { primary: '#f472b6', secondary: '#db2777', bg: 'rgba(219, 39, 119, 0.1)' };
            case 'diagram': return { primary: '#34d399', secondary: '#059669', bg: 'rgba(5, 150, 105, 0.1)' };
            case 'technical': return { primary: '#fb923c', secondary: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)' };
            default: return { primary: '#a78bfa', secondary: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' };
        }
    })();

    return (
        <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.primary} />
                    <stop offset="100%" stopColor={theme.secondary} />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="transparent" />
            <motion.g
                animate={{
                    y: isSpeaking ? [0, -8, 0] : [0, -4, 0],
                    scale: isSpeaking ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <rect x="60" y="50" width="280" height="180" rx="16" fill={theme.bg} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <g transform="translate(200, 140)">
                    {visualType === '3d-model' && (
                        <motion.path d="M 0 -60 L 52 -30 L 52 30 L 0 60 L -52 30 L -52 -30 Z" fill="none" stroke="url(#mainGradient)" strokeWidth="2.5" animate={{ rotateY: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
                    )}
                    {visualType === 'animation' && (
                        <motion.circle r="45" fill="none" stroke="url(#mainGradient)" strokeWidth="2" strokeDasharray="10 5" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
                    )}
                    {(visualType === 'diagram' || visualType === 'technical') && (
                        <motion.path d="M -40 0 L 40 0 M 0 -40 L 0 40" stroke="url(#mainGradient)" strokeWidth="2" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    )}
                </g>
            </motion.g>
            <text x="200" y="270" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold" className="capitalize">
                {visualType?.replace('-', ' ') || 'Abstract visual aid'}
            </text>
        </svg>
    );
}
