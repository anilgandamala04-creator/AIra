import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSpeechSync } from '../../hooks/useSpeechSync';

// Visual Props interface
export interface VisualProps {
    isSpeaking: boolean;
    isPaused: boolean;
    stepId: string;
    title?: string;
}

/**
 * Enhanced visual component wrapper that syncs with speech
 * This hook provides speech-synchronized animation values
 */
function useVisualSync(stepId: string, isSpeaking: boolean) {
    const { speechProgress, currentSentence } = useSpeechSync(stepId);
    const [animationIntensity, setAnimationIntensity] = useState(0);

    useEffect(() => {
        if (isSpeaking) {
            // Increase animation intensity based on speech progress
            setAnimationIntensity(Math.min(1, speechProgress / 100));
        } else {
            setAnimationIntensity(0);
        }
    }, [isSpeaking, speechProgress]);

    return { speechProgress, currentSentence, animationIntensity };
}

// ============================================
// MEDICINE - CARDIOLOGY VISUALS
// ============================================

// Blood Flow Dynamics Visual - Enhanced with speech sync
export function BloodFlowVisual({ isSpeaking, stepId }: VisualProps) {
    const { speechProgress } = useVisualSync(stepId, isSpeaking);
    
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                </marker>
                <marker id="arrowBlue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
            </defs>
            <rect width="100%" height="100%" fill="transparent" />

            {/* Heart outline */}
            <motion.path
                d="M 200 220 C 120 180 100 120 130 80 C 160 50 200 65 200 90 C 200 65 240 50 270 80 C 300 120 280 180 200 220"
                fill="none" stroke="#f87171" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

            {/* Deoxygenated blood path (blue) - Enhanced with speech sync */}
            <motion.path
                d="M 80 200 L 80 140 L 130 100 L 130 60 L 100 30"
                fill="none" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrowBlue)"
                initial={{ pathLength: 0 }} 
                animate={{ 
                    pathLength: isSpeaking ? Math.max(0.3, speechProgress / 100) : 0.3,
                    opacity: isSpeaking ? 1 : 0.5
                }}
                transition={{ delay: 0.5, duration: 0.5 }}
            />

            {/* To lungs - Enhanced with speech sync */}
            <motion.path
                d="M 100 30 C 140 10 180 10 200 30"
                fill="none" stroke="#8b5cf6" strokeWidth="3"
                initial={{ pathLength: 0 }} 
                animate={{ 
                    pathLength: isSpeaking ? Math.max(0, (speechProgress - 20) / 100) : 0,
                    opacity: isSpeaking && speechProgress > 20 ? 1 : 0.5
                }}
                transition={{ delay: 0, duration: 0.3 }}
            />

            {/* From lungs (oxygenated) - Enhanced with speech sync */}
            <motion.path
                d="M 200 30 C 220 10 260 10 300 30"
                fill="none" stroke="#22c55e" strokeWidth="3"
                initial={{ pathLength: 0 }} 
                animate={{ 
                    pathLength: isSpeaking ? Math.max(0, (speechProgress - 40) / 100) : 0,
                    opacity: isSpeaking && speechProgress > 40 ? 1 : 0.5
                }}
                transition={{ delay: 0, duration: 0.3 }}
            />

            {/* Oxygenated blood to body (red) - Enhanced with speech sync */}
            <motion.path
                d="M 300 30 L 270 60 L 270 100 L 320 140 L 320 200"
                fill="none" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowRed)"
                initial={{ pathLength: 0 }} 
                animate={{ 
                    pathLength: isSpeaking ? Math.max(0.3, (speechProgress - 60) / 100) : 0.3,
                    opacity: isSpeaking && speechProgress > 60 ? 1 : 0.5
                }}
                transition={{ delay: 0, duration: 0.3 }}
            />

            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 5 }}>
                <text x="60" y="170" fontSize="10" fill="#93c5fd">Deoxygenated</text>
                <text x="60" y="182" fontSize="10" fill="#93c5fd">Blood In</text>
                <text x="150" y="20" fontSize="10" fill="#c4b5fd">To Lungs</text>
                <text x="220" y="20" fontSize="10" fill="#86efac">From Lungs</text>
                <text x="300" y="170" fontSize="10" fill="#fca5a5">Oxygenated</text>
                <text x="300" y="182" fontSize="10" fill="#fca5a5">Blood Out</text>
            </motion.g>

            <text x="200" y="265" fontSize="16" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Blood Flow Dynamics</text>
        </svg>
    );
}

// Coronary Arteries Visual - Enhanced with speech sync
export function CoronaryArteriesVisual({ isSpeaking, stepId }: VisualProps) {
    const { speechProgress } = useVisualSync(stepId, isSpeaking);
    
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Heart shape */}
            <motion.path
                d="M 200 230 C 110 185 90 115 125 75 C 160 45 200 60 200 90 C 200 60 240 45 275 75 C 310 115 290 185 200 230"
                fill="rgba(248, 113, 113, 0.2)" stroke="#f87171" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

            {/* Left Coronary Artery - Enhanced with speech sync */}
            <motion.path
                d="M 200 90 C 180 100 160 120 150 150 C 140 180 135 200 140 220"
                fill="none" stroke="#fbbf24" strokeWidth="4"
                initial={{ pathLength: 0 }} 
                animate={{ 
                    pathLength: isSpeaking ? Math.max(0.3, speechProgress / 100) : 0.3,
                    opacity: isSpeaking ? 1 : 0.5
                }}
                transition={{ delay: 0, duration: 0.5 }}
            />

            {/* LAD Branch */}
            <motion.path
                d="M 160 120 L 180 170 L 190 210"
                fill="none" stroke="#f59e0b" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0 }}
                transition={{ delay: 2, duration: 1 }}
            />

            {/* Circumflex Branch */}
            <motion.path
                d="M 150 150 C 130 160 120 180 125 200"
                fill="none" stroke="#f59e0b" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0 }}
                transition={{ delay: 2.5, duration: 1 }}
            />

            {/* Right Coronary Artery - Enhanced with speech sync */}
            <motion.path
                d="M 200 90 C 220 100 240 120 250 150 C 260 180 265 200 260 220"
                fill="none" stroke="#ef4444" strokeWidth="4"
                initial={{ pathLength: 0 }} 
                animate={{ 
                    pathLength: isSpeaking ? Math.max(0.3, (speechProgress - 30) / 100) : 0.3,
                    opacity: isSpeaking && speechProgress > 30 ? 1 : 0.5
                }}
                transition={{ delay: 0, duration: 0.5 }}
            />

            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 3 }}>
                <text x="110" y="130" fontSize="10" fill="#fcd34d">Left Coronary</text>
                <text x="185" y="185" fontSize="9" fill="#fcd34d">LAD</text>
                <text x="100" y="195" fontSize="9" fill="#fcd34d">Circumflex</text>
                <text x="265" y="130" fontSize="10" fill="#fca5a5">Right Coronary</text>
            </motion.g>

            <text x="200" y="265" fontSize="16" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Coronary Arteries</text>
        </svg>
    );
}

// ============================================
// MEDICINE - NEUROLOGY VISUALS
// ============================================

export function BrainStructureVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Brain outline */}
            <motion.path
                d="M 200 50 C 100 50 60 120 80 180 C 90 220 140 250 200 250 C 260 250 310 220 320 180 C 340 120 300 50 200 50"
                fill="rgba(251, 191, 36, 0.1)" stroke="#fbbf24" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

            {/* Frontal Lobe */}
            <motion.path
                d="M 120 120 C 140 80 180 70 200 80 C 180 100 160 130 120 120"
                fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.3 }}
                transition={{ delay: 1, duration: 0.5 }}
            />

            {/* Parietal Lobe */}
            <motion.path
                d="M 200 80 C 240 70 280 90 280 130 C 260 150 220 140 200 120 C 180 130 200 100 200 80"
                fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.3 }}
                transition={{ delay: 1.5, duration: 0.5 }}
            />

            {/* Temporal Lobe */}
            <motion.path
                d="M 100 150 C 80 180 100 220 140 230 C 160 235 180 220 180 200 C 160 180 120 160 100 150"
                fill="rgba(168, 85, 247, 0.3)" stroke="#a855f7" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.3 }}
                transition={{ delay: 2, duration: 0.5 }}
            />

            {/* Occipital Lobe */}
            <motion.path
                d="M 280 160 C 300 180 300 220 260 240 C 230 250 210 230 210 210 C 240 190 270 170 280 160"
                fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.3 }}
                transition={{ delay: 2.5, duration: 0.5 }}
            />

            {/* Cerebellum */}
            <motion.path
                d="M 280 200 C 320 200 340 230 300 250 C 270 260 250 250 280 200"
                fill="rgba(236, 72, 153, 0.3)" stroke="#ec4899" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.3 }}
                transition={{ delay: 3, duration: 0.5 }}
            />

            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 3.5 }}>
                <text x="130" y="100" fontSize="10" fill="#93c5fd">Frontal</text>
                <text x="230" y="100" fontSize="10" fill="#86efac">Parietal</text>
                <text x="110" y="200" fontSize="10" fill="#c4b5fd">Temporal</text>
                <text x="250" y="200" fontSize="10" fill="#fca5a5">Occipital</text>
                <text x="300" y="240" fontSize="9" fill="#f9a8d4">Cerebellum</text>
            </motion.g>

            <text x="200" y="30" fontSize="16" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Brain Structure</text>
        </svg>
    );
}

export function NeuronVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Cell body (soma) */}
            <motion.ellipse
                cx="150" cy="125" rx="40" ry="35"
                fill="rgba(139, 92, 246, 0.3)" stroke="#8b5cf6" strokeWidth="2"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}
            />

            {/* Nucleus */}
            <motion.circle
                cx="150" cy="125" r="15"
                fill="#c4b5fd" stroke="#8b5cf6" strokeWidth="1"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, duration: 0.3 }}
            />

            {/* Dendrites */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 0.5, duration: 0.5 }}>
                <path d="M 115 100 L 80 70 L 60 50" fill="none" stroke="#22c55e" strokeWidth="2" />
                <path d="M 60 50 L 40 40" fill="none" stroke="#22c55e" strokeWidth="1" />
                <path d="M 60 50 L 50 60" fill="none" stroke="#22c55e" strokeWidth="1" />
                <path d="M 120 90 L 100 60 L 90 40" fill="none" stroke="#22c55e" strokeWidth="2" />
                <path d="M 115 150 L 80 180 L 60 200" fill="none" stroke="#22c55e" strokeWidth="2" />
                <path d="M 60 200 L 40 210" fill="none" stroke="#22c55e" strokeWidth="1" />
            </motion.g>

            {/* Axon */}
            <motion.path
                d="M 190 125 L 340 125"
                fill="none" stroke="#3b82f6" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0.3 }}
                transition={{ delay: 1, duration: 1.5 }}
            />

            {/* Myelin sheath segments */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 2 }}>
                <rect x="210" y="118" width="25" height="14" rx="3" fill="#fbbf24" />
                <rect x="250" y="118" width="25" height="14" rx="3" fill="#fbbf24" />
                <rect x="290" y="118" width="25" height="14" rx="3" fill="#fbbf24" />
            </motion.g>

            {/* Axon terminals */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 2.5 }}>
                <path d="M 340 125 L 360 110 L 375 110" fill="none" stroke="#ef4444" strokeWidth="2" />
                <circle cx="380" cy="110" r="5" fill="#ef4444" />
                <path d="M 340 125 L 360 125 L 375 125" fill="none" stroke="#ef4444" strokeWidth="2" />
                <circle cx="380" cy="125" r="5" fill="#ef4444" />
                <path d="M 340 125 L 360 140 L 375 140" fill="none" stroke="#ef4444" strokeWidth="2" />
                <circle cx="380" cy="140" r="5" fill="#ef4444" />
            </motion.g>

            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.6 }} transition={{ delay: 3 }}>
                <text x="40" y="35" fontSize="10" fill="#86efac">Dendrites</text>
                <text x="150" y="165" fontSize="10" fill="#c4b5fd" textAnchor="middle">Cell Body</text>
                <text x="260" y="145" fontSize="10" fill="#93c5fd" textAnchor="middle">Axon</text>
                <text x="260" y="110" fontSize="9" fill="#fcd34d" textAnchor="middle">Myelin</text>
                <text x="380" y="165" fontSize="9" fill="#fca5a5">Terminals</text>
            </motion.g>

            <text x="200" y="235" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Neuron Structure</text>
        </svg>
    );
}

// ============================================
// ENGINEERING - SOFTWARE VISUALS
// ============================================

export function ReactComponentVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* React logo atom */}
            <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <circle cx="200" cy="80" r="15" fill="#61dafb" />
                <ellipse cx="200" cy="80" rx="50" ry="20" fill="none" stroke="#61dafb" strokeWidth="2" />
                <ellipse cx="200" cy="80" rx="50" ry="20" fill="none" stroke="#61dafb" strokeWidth="2" transform="rotate(60, 200, 80)" />
                <ellipse cx="200" cy="80" rx="50" ry="20" fill="none" stroke="#61dafb" strokeWidth="2" transform="rotate(-60, 200, 80)" />
            </motion.g>

            {/* Component boxes */}
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: isSpeaking ? 1 : 0.5, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
                {/* App Component */}
                <rect x="150" y="120" width="100" height="40" rx="5" fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2" />
                <text x="200" y="145" fontSize="12" fill="#93c5fd" textAnchor="middle">&lt;App /&gt;</text>
            </motion.g>

            {/* Child components */}
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: isSpeaking ? 1 : 0.5, y: 0 }} transition={{ delay: 1, duration: 0.5 }}>
                {/* Header */}
                <rect x="50" y="190" width="80" height="35" rx="5" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2" />
                <text x="90" y="212" fontSize="10" fill="#86efac" textAnchor="middle">&lt;Header /&gt;</text>

                {/* Main */}
                <rect x="160" y="190" width="80" height="35" rx="5" fill="rgba(168, 85, 247, 0.3)" stroke="#a855f7" strokeWidth="2" />
                <text x="200" y="212" fontSize="10" fill="#c4b5fd" textAnchor="middle">&lt;Main /&gt;</text>

                {/* Footer */}
                <rect x="270" y="190" width="80" height="35" rx="5" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" />
                <text x="310" y="212" fontSize="10" fill="#fca5a5" textAnchor="middle">&lt;Footer /&gt;</text>
            </motion.g>

            {/* Connection lines */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.3 }} transition={{ delay: 1.5, duration: 0.5 }}>
                <line x1="175" y1="160" x2="90" y2="190" stroke="#fef08a" strokeWidth="1" strokeDasharray="4,2" />
                <line x1="200" y1="160" x2="200" y2="190" stroke="#fef08a" strokeWidth="1" strokeDasharray="4,2" />
                <line x1="225" y1="160" x2="310" y2="190" stroke="#fef08a" strokeWidth="1" strokeDasharray="4,2" />
            </motion.g>

            {/* Props arrow */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 2, duration: 0.5 }}>
                <text x="115" y="180" fontSize="9" fill="#fcd34d">props</text>
                <text x="225" y="180" fontSize="9" fill="#fcd34d">props</text>
            </motion.g>

            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">React Component Tree</text>
        </svg>
    );
}

export function SortingAlgorithmVisual({ isSpeaking }: VisualProps) {
    const bars = [60, 30, 80, 45, 90, 25, 70, 50];
    const sortedBars = [...bars].sort((a, b) => a - b);
    const displayBars = isSpeaking ? sortedBars : bars;

    return (
        <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Bars */}
            {displayBars.map((height, index) => (
                <motion.rect
                    key={index}
                    x={50 + index * 40}
                    y={200 - height * 1.5}
                    width="30"
                    height={height * 1.5}
                    fill={`hsl(${170 + index * 20}, 70%, 50%)`}
                    rx="3"
                    initial={{ height: 0, y: 200 }}
                    animate={{ height: height * 1.5, y: 200 - height * 1.5 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                />
            ))}

            {/* Values */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                {displayBars.map((height, index) => (
                    <text
                        key={index}
                        x={65 + index * 40}
                        y={215}
                        fontSize="10"
                        fill="#a7f3d0"
                        textAnchor="middle"
                    >
                        {height}
                    </text>
                ))}
            </motion.g>

            {/* Comparison arrows when speaking */}
            {isSpeaking && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <text x="200" y="40" fontSize="12" fill="#fcd34d" textAnchor="middle">Comparing & Swapping...</text>
                </motion.g>
            )}

            <text x="200" y="240" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Sorting Algorithm Visualization</text>
        </svg>
    );
}

export function GraphVisualizationVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Edges */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 0.5, duration: 0.5 }}>
                <line x1="100" y1="80" x2="200" y2="60" stroke="#fbbf24" strokeWidth="2" />
                <line x1="200" y1="60" x2="300" y2="80" stroke="#fbbf24" strokeWidth="2" />
                <line x1="100" y1="80" x2="80" y2="160" stroke="#fbbf24" strokeWidth="2" />
                <line x1="100" y1="80" x2="180" y2="140" stroke="#fbbf24" strokeWidth="2" />
                <line x1="200" y1="60" x2="180" y2="140" stroke="#fbbf24" strokeWidth="2" />
                <line x1="300" y1="80" x2="220" y2="140" stroke="#fbbf24" strokeWidth="2" />
                <line x1="300" y1="80" x2="320" y2="160" stroke="#fbbf24" strokeWidth="2" />
                <line x1="180" y1="140" x2="220" y2="140" stroke="#fbbf24" strokeWidth="2" />
                <line x1="80" y1="160" x2="150" y2="220" stroke="#fbbf24" strokeWidth="2" />
                <line x1="180" y1="140" x2="150" y2="220" stroke="#fbbf24" strokeWidth="2" />
                <line x1="220" y1="140" x2="250" y2="220" stroke="#fbbf24" strokeWidth="2" />
                <line x1="320" y1="160" x2="250" y2="220" stroke="#fbbf24" strokeWidth="2" />
            </motion.g>

            {/* Nodes */}
            {[
                { x: 100, y: 80, label: 'A', color: '#3b82f6', delay: 0 },
                { x: 200, y: 60, label: 'B', color: '#22c55e', delay: 0.2 },
                { x: 300, y: 80, label: 'C', color: '#ef4444', delay: 0.4 },
                { x: 80, y: 160, label: 'D', color: '#8b5cf6', delay: 0.6 },
                { x: 180, y: 140, label: 'E', color: '#f59e0b', delay: 0.8 },
                { x: 220, y: 140, label: 'F', color: '#ec4899', delay: 1 },
                { x: 320, y: 160, label: 'G', color: '#14b8a6', delay: 1.2 },
                { x: 150, y: 220, label: 'H', color: '#6366f1', delay: 1.4 },
                { x: 250, y: 220, label: 'I', color: '#84cc16', delay: 1.6 },
            ].map((node, index) => (
                <motion.g key={index} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: node.delay, duration: 0.3 }}>
                    <circle cx={node.x} cy={node.y} r="18" fill={node.color} />
                    <text x={node.x} y={node.y + 5} fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">{node.label}</text>
                </motion.g>
            ))}

            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Graph Data Structure</text>
        </svg>
    );
}

// SQL Schema / Relational Model Visual
export function SQLBasicsVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Users table */}
            <motion.rect
                x="40"
                y="60"
                width="120"
                height="90"
                rx="6"
                fill="rgba(59, 130, 246, 0.25)"
                stroke="#3b82f6"
                strokeWidth="2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            />
            <text x="100" y="80" fontSize="12" fill="#1d4ed8" textAnchor="middle" fontWeight="bold">
                users
            </text>
            <text x="50" y="100" fontSize="10" fill="#e5e7eb">id (PK)</text>
            <text x="50" y="115" fontSize="10" fill="#e5e7eb">email</text>
            <text x="50" y="130" fontSize="10" fill="#e5e7eb">name</text>

            {/* Orders table */}
            <motion.rect
                x="240"
                y="60"
                width="120"
                height="110"
                rx="6"
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10b981"
                strokeWidth="2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            />
            <text x="300" y="80" fontSize="12" fill="#047857" textAnchor="middle" fontWeight="bold">
                orders
            </text>
            <text x="250" y="100" fontSize="10" fill="#e5e7eb">id (PK)</text>
            <text x="250" y="115" fontSize="10" fill="#e5e7eb">user_id (FK)</text>
            <text x="250" y="130" fontSize="10" fill="#e5e7eb">total_amount</text>
            <text x="250" y="145" fontSize="10" fill="#e5e7eb">created_at</text>

            {/* Relationship line */}
            <motion.line
                x1="160"
                y1="105"
                x2="240"
                y2="115"
                stroke="#fef08a"
                strokeWidth="2"
                strokeDasharray="4,2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
            />

            {/* Cardinality markers */}
            <motion.text
                x="190"
                y="96"
                fontSize="9"
                fill="#fef9c3"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSpeaking ? 1 : 0.7 }}
                transition={{ delay: 0.6 }}
            >
                1
            </motion.text>
            <motion.text
                x="215"
                y="135"
                fontSize="9"
                fill="#fef9c3"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSpeaking ? 1 : 0.7 }}
                transition={{ delay: 0.6 }}
            >
                ∞
            </motion.text>

            {/* Query example */}
            <motion.rect
                x="60"
                y="190"
                width="280"
                height="70"
                rx="8"
                fill="rgba(15, 23, 42, 0.85)"
                stroke="#4b5563"
                strokeWidth="1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            />
            <motion.text
                x="75"
                y="210"
                fontSize="9"
                fill="#e5e7eb"
                fontFamily="monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                SELECT u.name, o.total_amount
            </motion.text>
            <text x="75" y="225" fontSize="9" fill="#e5e7eb" fontFamily="monospace">
                FROM users u JOIN orders o ON u.id = o.user_id;
            </text>

            <text
                x="200"
                y="35"
                fontSize="14"
                fill="#a7f3d0"
                textAnchor="middle"
                fontWeight="bold"
            >
                SQL Relational Schema
            </text>
        </svg>
    );
}

// API Design Visual - request/response flow
export function APIDesignVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 260" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Client */}
            <motion.rect
                x="30"
                y="80"
                width="90"
                height="70"
                rx="8"
                fill="rgba(59, 130, 246, 0.25)"
                stroke="#3b82f6"
                strokeWidth="2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            />
            <text x="75" y="105" fontSize="11" fill="#bfdbfe" textAnchor="middle">
                Client
            </text>
            <text x="75" y="125" fontSize="9" fill="#e5e7eb" textAnchor="middle">
                Web / Mobile
            </text>

            {/* API Gateway */}
            <motion.rect
                x="155"
                y="60"
                width="90"
                height="110"
                rx="8"
                fill="rgba(168, 85, 247, 0.25)"
                stroke="#a855f7"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            />
            <text x="200" y="85" fontSize="11" fill="#e9d5ff" textAnchor="middle">
                API
            </text>
            <text x="200" y="100" fontSize="11" fill="#e9d5ff" textAnchor="middle">
                Gateway
            </text>
            <text x="165" y="120" fontSize="9" fill="#e5e7eb">
                • Auth
            </text>
            <text x="165" y="135" fontSize="9" fill="#e5e7eb">
                • Rate limit
            </text>
            <text x="165" y="150" fontSize="9" fill="#e5e7eb">
                • Routing
            </text>

            {/* Service */}
            <motion.rect
                x="280"
                y="80"
                width="90"
                height="70"
                rx="8"
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10b981"
                strokeWidth="2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
            />
            <text x="325" y="105" fontSize="11" fill="#bbf7d0" textAnchor="middle">
                Service
            </text>
            <text x="325" y="125" fontSize="9" fill="#e5e7eb" textAnchor="middle">
                Business Logic
            </text>

            {/* Database icon */}
            <motion.ellipse
                cx="325"
                cy="185"
                rx="35"
                ry="12"
                fill="rgba(15, 23, 42, 0.8)"
                stroke="#6b7280"
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSpeaking ? 1 : 0.85 }}
                transition={{ delay: 0.5 }}
            />
            <motion.rect
                x="290"
                y="185"
                width="70"
                height="28"
                rx="6"
                fill="rgba(15, 23, 42, 0.8)"
                stroke="#6b7280"
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            />
            <text x="325" y="203" fontSize="9" fill="#e5e7eb" textAnchor="middle">
                Database
            </text>

            {/* Request arrow */}
            <motion.path
                d="M 120 115 L 150 115"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="5,3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
            />
            <polygon points="150,111 160,115 150,119" fill="#38bdf8" />
            <text x="140" y="105" fontSize="9" fill="#bae6fd" textAnchor="middle">
                HTTP Request
            </text>

            {/* Response arrow */}
            <motion.path
                d="M 245 135 L 275 135"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeDasharray="5,3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
            />
            <polygon points="275,131 285,135 275,139" fill="#f97316" />
            <text x="265" y="125" fontSize="9" fill="#fed7aa" textAnchor="middle">
                Response (JSON)
            </text>

            <text
                x="200"
                y="35"
                fontSize="14"
                fill="#a7f3d0"
                textAnchor="middle"
                fontWeight="bold"
            >
                REST API Request Flow
            </text>
        </svg>
    );
}

// ============================================
// ENGINEERING - ELECTRICAL VISUALS
// ============================================

export function DCCircuitVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Circuit path */}
            <motion.path
                d="M 80 60 L 320 60 L 320 190 L 80 190 L 80 60"
                fill="none" stroke="#fbbf24" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

            {/* Battery */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <line x1="60" y1="110" x2="60" y2="140" stroke="#ef4444" strokeWidth="4" />
                <line x1="50" y1="120" x2="50" y2="130" stroke="#ef4444" strokeWidth="2" />
                <text x="35" y="130" fontSize="10" fill="#fca5a5">+</text>
                <text x="35" y="145" fontSize="10" fill="#93c5fd">−</text>
                <text x="75" y="175" fontSize="10" fill="#86efac">Battery</text>
            </motion.g>

            {/* Resistor 1 */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1 }}>
                <path d="M 150 60 L 160 50 L 170 70 L 180 50 L 190 70 L 200 50 L 210 60" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                <text x="180" y="40" fontSize="10" fill="#c4b5fd" textAnchor="middle">R1</text>
            </motion.g>

            {/* Resistor 2 */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1.5 }}>
                <path d="M 320 100 L 310 110 L 330 120 L 310 130 L 330 140 L 310 150 L 320 160" fill="none" stroke="#22c55e" strokeWidth="2" />
                <text x="345" y="135" fontSize="10" fill="#86efac">R2</text>
            </motion.g>

            {/* Current flow arrows */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.3 }} transition={{ delay: 2 }}>
                <path d="M 120 55 L 135 55" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowBlue)" />
                <path d="M 325 85 L 325 95" stroke="#3b82f6" strokeWidth="2" />
                <text x="200" y="85" fontSize="9" fill="#93c5fd" textAnchor="middle">Current (I)</text>
            </motion.g>

            <text x="200" y="230" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">DC Circuit Analysis</text>
        </svg>
    );
}

export function ACCircuitVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* AC Waveform */}
            <motion.path
                d="M 30 140 Q 60 80, 90 140 T 150 140 T 210 140 T 270 140 T 330 140 T 390 140"
                fill="none" stroke="#22c55e" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

            {/* Baseline */}
            <line x1="20" y1="140" x2="400" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1 }}>
                <text x="90" y="70" fontSize="10" fill="#86efac">Peak (+)</text>
                <text x="150" y="190" fontSize="10" fill="#fca5a5">Peak (−)</text>
                <text x="30" y="135" fontSize="10" fill="#fcd34d">t</text>
            </motion.g>

            {/* Circuit components below */}
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
                {/* Capacitor symbol */}
                <line x1="100" y1="220" x2="100" y2="240" stroke="#3b82f6" strokeWidth="2" />
                <line x1="90" y1="220" x2="110" y2="220" stroke="#3b82f6" strokeWidth="2" />
                <line x1="90" y1="225" x2="110" y2="225" stroke="#3b82f6" strokeWidth="2" />
                <text x="100" y="255" fontSize="9" fill="#93c5fd" textAnchor="middle">Capacitor</text>

                {/* Inductor symbol */}
                <path d="M 200 220 Q 205 210, 210 220 Q 215 230, 220 220 Q 225 210, 230 220 Q 235 230, 240 220" fill="none" stroke="#a855f7" strokeWidth="2" />
                <text x="220" y="255" fontSize="9" fill="#c4b5fd" textAnchor="middle">Inductor</text>

                {/* Resistor symbol */}
                <path d="M 300 220 L 310 215 L 320 225 L 330 215 L 340 225 L 350 220" fill="none" stroke="#f59e0b" strokeWidth="2" />
                <text x="325" y="255" fontSize="9" fill="#fcd34d" textAnchor="middle">Resistor</text>
            </motion.g>

            <text x="200" y="35" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">AC Circuit Analysis</text>
        </svg>
    );
}

// ============================================
// SCIENCE - PHYSICS VISUALS
// ============================================

export function NewtonsLawsVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Object */}
            <motion.rect
                x="170" y="100" width="60" height="60" rx="5"
                fill="rgba(59, 130, 246, 0.4)" stroke="#3b82f6" strokeWidth="2"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}
            />
            <text x="200" y="135" fontSize="12" fill="#93c5fd" textAnchor="middle">Mass</text>

            {/* Force arrows */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 0.5 }}>
                {/* Applied Force */}
                <line x1="90" y1="130" x2="165" y2="130" stroke="#22c55e" strokeWidth="4" />
                <polygon points="165,125 175,130 165,135" fill="#22c55e" />
                <text x="110" y="120" fontSize="10" fill="#86efac">F (Force)</text>

                {/* Acceleration */}
                <line x1="235" y1="130" x2="310" y2="130" stroke="#ef4444" strokeWidth="4" />
                <polygon points="310,125 320,130 310,135" fill="#ef4444" />
                <text x="280" y="120" fontSize="10" fill="#fca5a5">a (Accel)</text>
            </motion.g>

            {/* F = ma equation */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                <text x="200" y="200" fontSize="20" fill="#fcd34d" textAnchor="middle" fontWeight="bold">F = m × a</text>
            </motion.g>

            {/* Ground */}
            <line x1="50" y1="165" x2="350" y2="165" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Newton's Second Law</text>
        </svg>
    );
}

export function KinematicsVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Axis */}
            <line x1="50" y1="200" x2="370" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="50" y1="200" x2="50" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <text x="380" y="205" fontSize="10" fill="#86efac">t</text>
            <text x="45" y="45" fontSize="10" fill="#86efac">v</text>

            {/* Velocity-Time graph */}
            <motion.path
                d="M 50 180 L 150 180 L 200 100 L 300 100 L 350 160"
                fill="none" stroke="#3b82f6" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1 }}>
                <text x="100" y="175" fontSize="9" fill="#93c5fd">Constant v</text>
                <text x="180" y="140" fontSize="9" fill="#fca5a5">Acceleration</text>
                <text x="250" y="95" fontSize="9" fill="#86efac">Max velocity</text>
                <text x="340" y="140" fontSize="9" fill="#fcd34d">Deceleration</text>
            </motion.g>

            {/* Area under curve (displacement) */}
            <motion.path
                d="M 50 180 L 150 180 L 200 100 L 300 100 L 350 160 L 350 200 L 50 200 Z"
                fill="rgba(59, 130, 246, 0.2)"
                initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 0.5 : 0.2 }} transition={{ delay: 2 }}
            />

            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                <text x="200" y="230" fontSize="10" fill="#c4b5fd" textAnchor="middle">Shaded Area = Displacement</text>
            </motion.g>

            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Kinematics: Velocity-Time Graph</text>
        </svg>
    );
}

// ============================================
// SCIENCE - BIOLOGY VISUALS  
// ============================================

export function DNAStructureVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Double helix backbone */}
            <motion.path
                d="M 150 40 Q 100 70, 150 100 Q 200 130, 150 160 Q 100 190, 150 220 Q 200 250, 150 280"
                fill="none" stroke="#3b82f6" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />
            <motion.path
                d="M 250 40 Q 300 70, 250 100 Q 200 130, 250 160 Q 300 190, 250 220 Q 200 250, 250 280"
                fill="none" stroke="#ef4444" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

            {/* Base pairs */}
            {[
                { y: 60, left: 'A', right: 'T', leftColor: '#22c55e', rightColor: '#f59e0b' },
                { y: 100, left: 'G', right: 'C', leftColor: '#8b5cf6', rightColor: '#ec4899' },
                { y: 140, left: 'T', right: 'A', leftColor: '#f59e0b', rightColor: '#22c55e' },
                { y: 180, left: 'C', right: 'G', leftColor: '#ec4899', rightColor: '#8b5cf6' },
                { y: 220, left: 'A', right: 'T', leftColor: '#22c55e', rightColor: '#f59e0b' },
            ].map((pair, index) => (
                <motion.g key={index} initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1 + index * 0.2 }}>
                    <line x1="165" y1={pair.y} x2="235" y2={pair.y} stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="4,2" />
                    <circle cx="170" cy={pair.y} r="12" fill={pair.leftColor} />
                    <text x="170" y={pair.y + 4} fontSize="10" fill="white" textAnchor="middle">{pair.left}</text>
                    <circle cx="230" cy={pair.y} r="12" fill={pair.rightColor} />
                    <text x="230" y={pair.y + 4} fontSize="10" fill="white" textAnchor="middle">{pair.right}</text>
                </motion.g>
            ))}

            {/* Legend */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                <text x="320" y="70" fontSize="9" fill="#86efac">A-T pair</text>
                <text x="320" y="90" fontSize="9" fill="#c4b5fd">G-C pair</text>
                <text x="320" y="120" fontSize="9" fill="#93c5fd">Sugar backbone</text>
                <text x="320" y="140" fontSize="9" fill="#fca5a5">Phosphate backbone</text>
            </motion.g>

            <text x="200" y="30" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">DNA Double Helix</text>
        </svg>
    );
}

export function DNAReplicationVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Original DNA strands separating */}
            <motion.path d="M 100 50 L 100 140" fill="none" stroke="#3b82f6" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
            <motion.path d="M 140 50 L 140 140" fill="none" stroke="#ef4444" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />

            {/* Helicase (opening the helix) */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 0.5 }}>
                <ellipse cx="120" cy="160" rx="25" ry="15" fill="#fbbf24" />
                <text x="120" y="163" fontSize="8" fill="white" textAnchor="middle">Helicase</text>
            </motion.g>

            {/* Separated strands (replication fork) */}
            <motion.path d="M 100 160 Q 60 200, 60 250" fill="none" stroke="#3b82f6" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0 }} transition={{ delay: 1, duration: 1 }} />
            <motion.path d="M 140 160 Q 180 200, 180 250" fill="none" stroke="#ef4444" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0 }} transition={{ delay: 1, duration: 1 }} />

            {/* New complementary strands being synthesized */}
            <motion.path d="M 80 180 Q 80 215, 80 250" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="4,2"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0 }} transition={{ delay: 1.5, duration: 1 }} />
            <motion.path d="M 160 180 Q 160 215, 160 250" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="4,2"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0 }} transition={{ delay: 1.5, duration: 1 }} />

            {/* DNA Polymerase icons */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 2 }}>
                <circle cx="70" cy="200" r="12" fill="#8b5cf6" />
                <text x="70" y="203" fontSize="6" fill="white" textAnchor="middle">Pol</text>
                <circle cx="170" cy="200" r="12" fill="#8b5cf6" />
                <text x="170" y="203" fontSize="6" fill="white" textAnchor="middle">Pol</text>
            </motion.g>

            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                <text x="40" y="240" fontSize="8" fill="#93c5fd">Leading strand</text>
                <text x="195" y="240" fontSize="8" fill="#fca5a5">Lagging strand</text>
                <text x="300" y="80" fontSize="9" fill="#fcd34d">Original DNA</text>
                <text x="300" y="200" fontSize="9" fill="#86efac">New DNA</text>
            </motion.g>

            <text x="200" y="25" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">DNA Replication Fork</text>
        </svg>
    );
}

export function DNATranscriptionVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* DNA double strand */}
            <motion.path d="M 50 80 L 350 80" fill="none" stroke="#3b82f6" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
            <motion.path d="M 50 100 L 350 100" fill="none" stroke="#ef4444" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />

            {/* Base pairs between DNA strands */}
            {[80, 120, 160, 200, 240, 280, 320].map((x, i) => (
                <motion.line key={i} x1={x} y1="80" x2={x} y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} />
            ))}

            {/* Transcription bubble (open region) */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1 }}>
                <path d="M 150 80 Q 180 60, 210 80" fill="none" stroke="#3b82f6" strokeWidth="4" />
                <path d="M 150 100 Q 180 120, 210 100" fill="none" stroke="#ef4444" strokeWidth="4" />
            </motion.g>

            {/* RNA Polymerase */}
            <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }}>
                <ellipse cx="180" cy="90" rx="20" ry="25" fill="#f59e0b" />
                <text x="180" y="95" fontSize="7" fill="white" textAnchor="middle">RNA Pol</text>
            </motion.g>

            {/* mRNA being synthesized */}
            <motion.path d="M 180 115 Q 180 150, 140 170 L 60 170" fill="none" stroke="#22c55e" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0 }} transition={{ delay: 2, duration: 1.5 }} />

            {/* RNA nucleotides */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 2.5 }}>
                {['U', 'A', 'C', 'G', 'A'].map((base, i) => (
                    <g key={i}>
                        <circle cx={120 - i * 15} cy={170} r="8" fill={
                            base === 'A' ? '#22c55e' : base === 'U' ? '#f59e0b' :
                                base === 'G' ? '#8b5cf6' : '#ec4899'
                        } />
                        <text x={120 - i * 15} y={173} fontSize="8" fill="white" textAnchor="middle">{base}</text>
                    </g>
                ))}
            </motion.g>

            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
                <text x="320" y="70" fontSize="9" fill="#93c5fd">Coding strand (5'→3')</text>
                <text x="320" y="115" fontSize="9" fill="#fca5a5">Template strand (3'→5')</text>
                <text x="30" y="190" fontSize="9" fill="#86efac">mRNA (5'→3')</text>
                <text x="285" y="160" fontSize="8" fill="#fcd34d">Direction of transcription →</text>
            </motion.g>

            <text x="200" y="25" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Transcription: DNA to mRNA</text>
        </svg>
    );
}

export function DNATranslationVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* mRNA strand */}
            <motion.path d="M 30 100 L 370 100" fill="none" stroke="#22c55e" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />

            {/* Codons on mRNA */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {['AUG', 'GCU', 'UAC', 'GAA', 'UGA'].map((codon, i) => (
                    <g key={i}>
                        <rect x={60 + i * 65} y="108" width="55" height="20" rx="3" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="1" />
                        <text x={87 + i * 65} y="122" fontSize="10" fill="#86efac" textAnchor="middle">{codon}</text>
                    </g>
                ))}
            </motion.g>

            {/* Ribosome */}
            <motion.g initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: isSpeaking ? 130 : 0 }} transition={{ delay: 1, duration: 2 }}>
                <ellipse cx="120" cy="100" rx="50" ry="35" fill="rgba(139, 92, 246, 0.4)" stroke="#8b5cf6" strokeWidth="2" />
                <text x="120" y="85" fontSize="9" fill="#c4b5fd" textAnchor="middle">Ribosome</text>
                <text x="120" y="98" fontSize="7" fill="#c4b5fd" textAnchor="middle">Small subunit</text>
                <text x="120" y="115" fontSize="7" fill="#c4b5fd" textAnchor="middle">Large subunit</text>
            </motion.g>

            {/* tRNA bringing amino acids */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1.5 }}>
                {/* tRNA shape */}
                <path d="M 180 60 L 180 80 L 165 95 M 180 80 L 195 95" fill="none" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="180" cy="50" r="10" fill="#ef4444" />
                <text x="180" y="53" fontSize="7" fill="white" textAnchor="middle">Met</text>
                <text x="180" y="110" fontSize="7" fill="#fcd34d" textAnchor="middle">UAC</text>
            </motion.g>

            {/* Growing polypeptide chain */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 2 }}>
                <path d="M 70 50 L 100 40 L 130 50 L 160 40" fill="none" stroke="#ec4899" strokeWidth="3" />
                {['M', 'A', 'Y', 'E'].map((_aa, i) => (
                    <circle key={i} cx={70 + i * 30} cy={i % 2 === 0 ? 50 : 40} r="8" fill="#ec4899" />
                ))}
            </motion.g>

            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                <text x="30" y="140" fontSize="9" fill="#86efac">mRNA (5'→3')</text>
                <text x="300" y="50" fontSize="9" fill="#f9a8d4">Polypeptide chain</text>
                <text x="235" y="95" fontSize="8" fill="#fcd34d">tRNA with amino acid</text>
            </motion.g>

            <text x="200" y="20" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Translation: mRNA to Protein</text>
        </svg>
    );
}

// ============================================
// ADDITIONAL MEDICINE VISUALS
// ============================================

export function HeartValvesVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.path d="M 200 240 C 100 190 80 110 120 70 C 160 40 200 60 200 90 C 200 60 240 40 280 70 C 320 110 300 190 200 240"
                fill="none" stroke="#f87171" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
            {/* Valves */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1 }}>
                <circle cx="160" cy="130" r="15" fill="#3b82f6" stroke="#93c5fd" strokeWidth="2" />
                <text x="160" y="135" fontSize="10" fill="white" textAnchor="middle">T</text>
                <text x="160" y="165" fontSize="9" fill="#93c5fd" textAnchor="middle">Tricuspid</text>
                <circle cx="240" cy="130" r="15" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" />
                <text x="240" y="135" fontSize="10" fill="white" textAnchor="middle">M</text>
                <text x="240" y="165" fontSize="9" fill="#fca5a5" textAnchor="middle">Mitral</text>
                <circle cx="140" cy="75" r="12" fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="2" />
                <text x="140" y="79" fontSize="9" fill="white" textAnchor="middle">P</text>
                <circle cx="260" cy="75" r="12" fill="#f59e0b" stroke="#fcd34d" strokeWidth="2" />
                <text x="260" y="79" fontSize="9" fill="white" textAnchor="middle">A</text>
            </motion.g>
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Heart Valves</text>
        </svg>
    );
}

export function ECGBasicsVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.path d="M 20 100 L 60 100 L 70 90 L 80 100 L 100 100 L 110 50 L 120 150 L 130 80 L 140 100 L 180 100 L 200 80 L 220 100 L 260 100 L 270 90 L 280 100 L 300 100 L 310 50 L 320 150 L 330 80 L 340 100 L 380 100"
                fill="none" stroke="#fef08a" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3 }} />
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1.5 }}>
                <text x="75" y="80" fontSize="11" fill="#a7f3d0">P</text>
                <text x="120" y="170" fontSize="11" fill="#93c5fd">QRS</text>
                <text x="200" y="70" fontSize="11" fill="#fca5a5">T</text>
            </motion.g>
            <text x="200" y="190" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">ECG Waveform</text>
        </svg>
    );
}

export function SpinalCordVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.path d="M 200 30 L 200 250" fill="none" stroke="#fbbf24" strokeWidth="8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
            {/* Vertebrae segments */}
            {[50, 90, 130, 170, 210].map((y, i) => (
                <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 0.5 + i * 0.2 }}>
                    <rect x="180" y={y} width="40" height="25" rx="3" fill="rgba(139, 92, 246, 0.3)" stroke="#8b5cf6" strokeWidth="1" />
                    <line x1="160" y1={y + 12} x2="180" y2={y + 12} stroke="#22c55e" strokeWidth="2" />
                    <line x1="220" y1={y + 12} x2="240" y2={y + 12} stroke="#22c55e" strokeWidth="2" />
                </motion.g>
            ))}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                <text x="270" y="70" fontSize="10" fill="#c4b5fd">Cervical</text>
                <text x="270" y="130" fontSize="10" fill="#c4b5fd">Thoracic</text>
                <text x="270" y="190" fontSize="10" fill="#c4b5fd">Lumbar</text>
            </motion.g>
            <text x="200" y="270" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Spinal Cord</text>
        </svg>
    );
}

export function StrokeVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.ellipse cx="200" cy="120" rx="100" ry="80" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
            {/* Blood vessel */}
            <motion.path d="M 120 120 L 180 120" fill="none" stroke="#ef4444" strokeWidth="6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 1 }} />
            {/* Blockage */}
            <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5, scale: 1 }} transition={{ delay: 1.5 }}>
                <circle cx="190" cy="120" r="12" fill="#1f2937" stroke="#ef4444" strokeWidth="2" />
                <text x="190" y="124" fontSize="8" fill="#fca5a5" textAnchor="middle">Clot</text>
            </motion.g>
            {/* Affected area */}
            <motion.path d="M 220 100 Q 260 80, 280 120 Q 260 160, 220 140 Z" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,2"
                initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 0.8 : 0.3 }} transition={{ delay: 2 }} />
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                <text x="250" y="95" fontSize="9" fill="#fca5a5">Ischemic</text>
                <text x="250" y="107" fontSize="9" fill="#fca5a5">Area</text>
            </motion.g>
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Ischemic Stroke</text>
        </svg>
    );
}

// ============================================
// BUSINESS & MARKETING VISUALS
// ============================================

export function SEOVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Funnel shape */}
            <motion.path d="M 100 50 L 300 50 L 250 130 L 150 130 Z" fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
            <motion.path d="M 150 130 L 250 130 L 230 180 L 170 180 Z" fill="rgba(168, 85, 247, 0.3)" stroke="#a855f7" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
            <motion.path d="M 170 180 L 230 180 L 215 230 L 185 230 Z" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
            {/* Labels */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1 }}>
                <text x="200" y="95" fontSize="11" fill="#93c5fd" textAnchor="middle">Keywords & Content</text>
                <text x="200" y="160" fontSize="10" fill="#c4b5fd" textAnchor="middle">On-Page SEO</text>
                <text x="200" y="210" fontSize="10" fill="#86efac" textAnchor="middle">Rankings</text>
            </motion.g>
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">SEO Funnel</text>
        </svg>
    );
}

export function StockMarketVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Axis */}
            <line x1="50" y1="200" x2="370" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="50" y1="200" x2="50" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            {/* Candlesticks */}
            {[
                { x: 80, open: 120, close: 100, high: 80, low: 140, up: false },
                { x: 120, open: 100, close: 80, high: 60, low: 110, up: true },
                { x: 160, open: 80, close: 90, high: 70, low: 110, up: false },
                { x: 200, open: 90, close: 60, high: 50, low: 100, up: true },
                { x: 240, open: 60, close: 80, high: 55, low: 100, up: false },
                { x: 280, open: 80, close: 50, high: 40, low: 90, up: true },
                { x: 320, open: 50, close: 70, high: 45, low: 85, up: false },
            ].map((candle, i) => (
                <motion.g key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: isSpeaking ? 1 : 0.7, y: 0 }} transition={{ delay: i * 0.15 }}>
                    <line x1={candle.x} y1={candle.high} x2={candle.x} y2={candle.low} stroke={candle.up ? "#22c55e" : "#ef4444"} strokeWidth="1" />
                    <rect x={candle.x - 10} y={Math.min(candle.open, candle.close)} width="20" height={Math.abs(candle.close - candle.open) || 2}
                        fill={candle.up ? "#22c55e" : "#ef4444"} />
                </motion.g>
            ))}
            <text x="200" y="235" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Stock Chart (Candlestick)</text>
        </svg>
    );
}

// ============================================
// LAW VISUALS
// ============================================

export function ContractFormationVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Process boxes */}
            {[
                { x: 50, label: 'Offer', color: '#3b82f6' },
                { x: 150, label: 'Acceptance', color: '#22c55e' },
                { x: 250, label: 'Consideration', color: '#f59e0b' },
                { x: 350, label: 'Contract', color: '#8b5cf6' },
            ].map((step, i) => (
                <motion.g key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: isSpeaking ? 1 : 0.7, y: 0 }} transition={{ delay: i * 0.3 }}>
                    <rect x={step.x - 40} y="100" width="80" height="50" rx="5" fill={`${step.color}33`} stroke={step.color} strokeWidth="2" />
                    <text x={step.x} y="130" fontSize="10" fill={step.color} textAnchor="middle">{step.label}</text>
                    {i < 3 && <path d={`M ${step.x + 45} 125 L ${step.x + 65} 125`} fill="none" stroke="#fef08a" strokeWidth="2" markerEnd="url(#arrowYellow)" />}
                </motion.g>
            ))}
            <defs>
                <marker id="arrowYellow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#fef08a" />
                </marker>
            </defs>
            <text x="200" y="200" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Contract Formation Process</text>
        </svg>
    );
}

// ============================================
// PSYCHOLOGY VISUALS
// ============================================

export function AnxietyVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Brain with highlighted area */}
            <motion.ellipse cx="200" cy="120" rx="80" ry="60" fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth="2"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} />
            {/* Amygdala (anxiety center) */}
            <motion.ellipse cx="200" cy="130" rx="25" ry="20" fill="rgba(239, 68, 68, 0.5)" stroke="#ef4444" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? [0.5, 1, 0.5] : 0.5 }}
                transition={{ duration: 1, repeat: isSpeaking ? Infinity : 0 }} />
            {/* Stress waves */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.3 }} transition={{ delay: 1 }}>
                <circle cx="200" cy="130" r="35" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,2" />
                <circle cx="200" cy="130" r="50" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,2" opacity="0.5" />
            </motion.g>
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                <text x="200" y="185" fontSize="10" fill="#fca5a5" textAnchor="middle">Amygdala (Fear Center)</text>
                <text x="320" y="100" fontSize="9" fill="#c4b5fd">Prefrontal</text>
                <text x="320" y="115" fontSize="9" fill="#c4b5fd">Cortex</text>
            </motion.g>
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Anxiety Response in Brain</text>
        </svg>
    );
}

export function CBTVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Triangle of CBT */}
            <motion.path d="M 200 60 L 100 200 L 300 200 Z" fill="none" stroke="#fbbf24" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
            {/* Nodes */}
            {[
                { x: 200, y: 50, label: 'Thoughts', color: '#3b82f6' },
                { x: 90, y: 210, label: 'Feelings', color: '#ef4444' },
                { x: 310, y: 210, label: 'Behaviors', color: '#22c55e' },
            ].map((node, i) => (
                <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.3 }}>
                    <circle cx={node.x} cy={node.y} r="30" fill={`${node.color}33`} stroke={node.color} strokeWidth="2" />
                    <text x={node.x} y={node.y + 5} fontSize="10" fill={node.color} textAnchor="middle">{node.label}</text>
                </motion.g>
            ))}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 2 }}>
                <text x="200" y="145" fontSize="10" fill="#fcd34d" textAnchor="middle">Interconnected</text>
            </motion.g>
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Cognitive Behavioral Therapy</text>
        </svg>
    );
}

// ============================================
// TECHNOLOGY - AI/ML VISUALS
// ============================================

export function SupervisedLearningVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Data input */}
            <motion.rect x="30" y="100" width="60" height="80" rx="5" fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
            <text x="60" y="145" fontSize="10" fill="#93c5fd" textAnchor="middle">Data +</text>
            <text x="60" y="160" fontSize="10" fill="#93c5fd" textAnchor="middle">Labels</text>
            {/* Arrow */}
            <motion.path d="M 100 140 L 140 140" fill="none" stroke="#fef08a" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
            {/* Model */}
            <motion.rect x="150" y="90" width="100" height="100" rx="10" fill="rgba(168, 85, 247, 0.3)" stroke="#a855f7" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.7 }} transition={{ delay: 0.8 }} />
            <text x="200" y="135" fontSize="11" fill="#c4b5fd" textAnchor="middle">ML Model</text>
            <text x="200" y="155" fontSize="9" fill="#c4b5fd" textAnchor="middle">Training</text>
            {/* Arrow */}
            <motion.path d="M 260 140 L 300 140" fill="none" stroke="#fef08a" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3, duration: 0.5 }} />
            {/* Output */}
            <motion.rect x="310" y="100" width="60" height="80" rx="5" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
            <text x="340" y="145" fontSize="10" fill="#86efac" textAnchor="middle">Predictions</text>
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Supervised Learning Pipeline</text>
        </svg>
    );
}

export function NeuralNetworkVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Input layer */}
            {[80, 120, 160, 200].map((y, i) => (
                <motion.circle key={`in-${i}`} cx="80" cy={y} r="15" fill="#3b82f6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} />
            ))}
            {/* Hidden layer 1 */}
            {[60, 100, 140, 180, 220].map((y, i) => (
                <motion.circle key={`h1-${i}`} cx="180" cy={y} r="12" fill="#8b5cf6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }} />
            ))}
            {/* Hidden layer 2 */}
            {[80, 140, 200].map((y, i) => (
                <motion.circle key={`h2-${i}`} cx="280" cy={y} r="12" fill="#a855f7" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }} />
            ))}
            {/* Output layer */}
            {[120, 160].map((y, i) => (
                <motion.circle key={`out-${i}`} cx="350" cy={y} r="15" fill="#22c55e" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 + i * 0.1 }} />
            ))}
            {/* Connections (simplified) */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 0.3 : 0.1 }} transition={{ delay: 2 }}>
                {[80, 120, 160, 200].map((y1) => [60, 100, 140, 180, 220].map((y2) => (
                    <line key={`${y1}-${y2}`} x1="95" y1={y1} x2="168" y2={y2} stroke="#fef08a" strokeWidth="0.5" />
                )))}
            </motion.g>
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                <text x="80" y="235" fontSize="9" fill="#93c5fd" textAnchor="middle">Input</text>
                <text x="230" y="235" fontSize="9" fill="#c4b5fd" textAnchor="middle">Hidden Layers</text>
                <text x="350" y="235" fontSize="9" fill="#86efac" textAnchor="middle">Output</text>
            </motion.g>
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Neural Network Architecture</text>
        </svg>
    );
}

export function EncryptionVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Plaintext */}
            <motion.rect x="30" y="90" width="80" height="50" rx="5" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
            <text x="70" y="120" fontSize="11" fill="#86efac" textAnchor="middle">Plaintext</text>
            {/* Arrow + Key */}
            <motion.path d="M 120 115 L 170 115" fill="none" stroke="#fef08a" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
            <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: isSpeaking ? 1 : 0.5, y: 0 }} transition={{ delay: 0.8 }}>
                <rect x="130" y="70" width="30" height="25" rx="3" fill="#fbbf24" />
                <text x="145" y="87" fontSize="10" fill="white" textAnchor="middle">🔑</text>
            </motion.g>
            {/* Encryption box */}
            <motion.rect x="180" y="80" width="60" height="70" rx="5" fill="rgba(139, 92, 246, 0.3)" stroke="#8b5cf6" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
            <text x="210" y="120" fontSize="10" fill="#c4b5fd" textAnchor="middle">Encrypt</text>
            {/* Arrow */}
            <motion.path d="M 250 115 L 300 115" fill="none" stroke="#fef08a" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5, duration: 0.5 }} />
            {/* Ciphertext */}
            <motion.rect x="310" y="90" width="80" height="50" rx="5" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} />
            <text x="350" y="120" fontSize="11" fill="#fca5a5" textAnchor="middle">Ciphertext</text>
            <text x="200" y="200" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Encryption Process</text>
        </svg>
    );
}

// ============================================
// ENGINEERING - MECHANICAL VISUALS
// ============================================

export function ThermodynamicsVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Container */}
            <motion.rect x="120" y="60" width="160" height="140" rx="5" fill="none" stroke="#fbbf24" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
            {/* Heat particles */}
            {isSpeaking && [
                { x: 160, y: 100 }, { x: 200, y: 80 }, { x: 240, y: 110 },
                { x: 180, y: 140 }, { x: 220, y: 160 }, { x: 150, y: 170 },
            ].map((p, i) => (
                <motion.circle key={i} cx={p.x} cy={p.y} r="8" fill="#ef4444"
                    animate={{ x: [0, (Math.random() - 0.5) * 30, 0], y: [0, (Math.random() - 0.5) * 30, 0] }}
                    transition={{ duration: 1 + Math.random(), repeat: Infinity }} />
            ))}
            {/* Heat arrow */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1 }}>
                <path d="M 80 130 L 115 130" fill="none" stroke="#ef4444" strokeWidth="3" />
                <polygon points="115,125 125,130 115,135" fill="#ef4444" />
                <text x="70" y="155" fontSize="10" fill="#fca5a5">Q (Heat)</text>
            </motion.g>
            {/* Work arrow */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 1.5 }}>
                <path d="M 285 130 L 320 130" fill="none" stroke="#22c55e" strokeWidth="3" />
                <polygon points="320,125 330,130 320,135" fill="#22c55e" />
                <text x="310" y="155" fontSize="10" fill="#86efac">W (Work)</text>
            </motion.g>
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                <text x="200" y="230" fontSize="12" fill="#fcd34d" textAnchor="middle">ΔU = Q - W</text>
            </motion.g>
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">First Law of Thermodynamics</text>
        </svg>
    );
}

export function CellStructureVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Cell membrane */}
            <motion.ellipse cx="200" cy="140" rx="150" ry="100" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="3"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} />
            {/* Nucleus */}
            <motion.ellipse cx="200" cy="140" rx="50" ry="40" fill="rgba(139, 92, 246, 0.4)" stroke="#8b5cf6" strokeWidth="2"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
            {/* Organelles */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 0.8 }}>
                <ellipse cx="100" cy="120" rx="20" ry="10" fill="#22c55e" /> {/* Mitochondria */}
                <ellipse cx="300" cy="100" rx="15" ry="8" fill="#22c55e" />
                <circle cx="120" cy="180" r="8" fill="#f59e0b" /> {/* Ribosomes */}
                <circle cx="290" cy="170" r="8" fill="#f59e0b" />
                <path d="M 260 130 Q 280 140, 260 150 Q 280 160, 260 170" fill="none" stroke="#ec4899" strokeWidth="2" /> {/* ER */}
            </motion.g>
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                <text x="200" y="145" fontSize="10" fill="#c4b5fd" textAnchor="middle">Nucleus</text>
                <text x="100" y="105" fontSize="8" fill="#86efac" textAnchor="middle">Mitochondria</text>
                <text x="120" y="200" fontSize="8" fill="#fcd34d">Ribosomes</text>
            </motion.g>
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Cell Structure</text>
        </svg>
    );
}

export function HeredityVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Punnett Square */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <rect x="120" y="60" width="160" height="160" fill="none" stroke="#fbbf24" strokeWidth="2" />
                <line x1="200" y1="60" x2="200" y2="220" stroke="#fbbf24" strokeWidth="1" />
                <line x1="120" y1="140" x2="280" y2="140" stroke="#fbbf24" strokeWidth="1" />
            </motion.g>
            {/* Alleles */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 0.5 }}>
                <text x="160" y="50" fontSize="14" fill="#3b82f6" textAnchor="middle" fontWeight="bold">A</text>
                <text x="240" y="50" fontSize="14" fill="#93c5fd" textAnchor="middle" fontWeight="bold">a</text>
                <text x="110" y="105" fontSize="14" fill="#22c55e" textAnchor="middle" fontWeight="bold">A</text>
                <text x="110" y="185" fontSize="14" fill="#86efac" textAnchor="middle" fontWeight="bold">a</text>
            </motion.g>
            {/* Results */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                <text x="160" y="105" fontSize="12" fill="#fcd34d" textAnchor="middle">AA</text>
                <text x="240" y="105" fontSize="12" fill="#fcd34d" textAnchor="middle">Aa</text>
                <text x="160" y="185" fontSize="12" fill="#fcd34d" textAnchor="middle">Aa</text>
                <text x="240" y="185" fontSize="12" fill="#fcd34d" textAnchor="middle">aa</text>
            </motion.g>
            <text x="200" y="255" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Punnett Square - Heredity</text>
        </svg>
    );
}

// ============================================
// DEFAULT/FALLBACK VISUAL
// ============================================

export function DefaultTopicVisual({ title }: VisualProps) {
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
            <motion.circle cx="200" cy="140" r="50" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
            <motion.text x="200" y="145" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {title || 'Learning Topic'}
            </motion.text>
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.7 }}>
                <circle cx="100" cy="80" r="15" fill="rgba(34, 197, 94, 0.3)" />
                <circle cx="300" cy="80" r="20" fill="rgba(59, 130, 246, 0.3)" />
                <circle cx="120" cy="200" r="18" fill="rgba(168, 85, 247, 0.3)" />
                <circle cx="280" cy="200" r="12" fill="rgba(239, 68, 68, 0.3)" />
            </motion.g>
            <text x="200" y="250" fontSize="11" fill="#86efac" textAnchor="middle">Visual content loading...</text>
        </svg>
    );
}

