import { motion } from 'framer-motion';
import { VisualProps, useVisualSync } from './Common';

// ============================================
// MEDICINE - CARDIOLOGY VISUALS
// ============================================

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

            <motion.path
                d="M 200 220 C 120 180 100 120 130 80 C 160 50 200 65 200 90 C 200 65 240 50 270 80 C 300 120 280 180 200 220"
                fill="none" stroke="#f87171" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

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

            <motion.path
                d="M 300 30 L 300 100 L 250 140 L 250 200"
                fill="none" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowRed)"
                initial={{ pathLength: 0 }}
                animate={{
                    pathLength: isSpeaking ? Math.max(0, (speechProgress - 60) / 100) : 0,
                    opacity: isSpeaking && speechProgress > 60 ? 1 : 0.5
                }}
                transition={{ delay: 0, duration: 0.5 }}
            />

            <text x="200" y="270" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Circulatory Flow</text>
        </svg>
    );
}

export function HeartValvesVisual({ isSpeaking, stepId }: VisualProps) {
    const { speechProgress } = useVisualSync(stepId, isSpeaking);
    const isOpen = isSpeaking && (speechProgress % 20 < 10);

    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <circle cx="200" cy="140" r="100" fill="rgba(248, 113, 113, 0.1)" stroke="#f87171" strokeWidth="4" />
            <motion.line x1="140" y1="140" x2="200" y2="140" stroke="#f87171" strokeWidth="8"
                animate={{ rotate: isOpen ? -45 : 0 }} transition={{ duration: 0.2 }} style={{ originX: '200px', originY: '140px' }} />
            <motion.line x1="260" y1="140" x2="200" y2="140" stroke="#f87171" strokeWidth="8"
                animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ originX: '200px', originY: '140px' }} />

            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Valve Mechanism: {isOpen ? 'Open' : 'Closed'}</text>
        </svg>
    );
}

export function CoronaryArteriesVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <path d="M 200 40 Q 150 100, 200 240 Q 250 100, 200 40" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="2" />
            <motion.path d="M 180 60 Q 140 100, 160 180" fill="none" stroke="#f87171" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? [0.8, 1, 0.8] : 1 }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.path d="M 220 60 Q 260 100, 240 180" fill="none" stroke="#f87171" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? [0.8, 1, 0.8] : 1 }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />

            <text x="200" y="270" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Coronary Arteries</text>
        </svg>
    );
}

export function ECGBasicsVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.path
                d="M 0 100 L 50 100 L 60 80 L 70 100 L 90 100 L 100 40 L 110 160 L 120 100 L 140 100 L 160 70 L 180 100 L 400 100"
                fill="none" stroke="#22c55e" strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{
                    pathLength: 1,
                    strokeWidth: isSpeaking ? [3, 5, 3] : 3
                }}
                transition={{
                    pathLength: { duration: 2, ease: "linear" },
                    strokeWidth: { duration: 0.5, repeat: Infinity }
                }}
            />
            <text x="100" y="30" fontSize="12" fill="#86efac">R-Peak</text>
            <text x="160" y="60" fontSize="10" fill="#86efac">T-Wave</text>
            <text x="50" y="70" fontSize="10" fill="#86efac">P-Wave</text>
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
            <motion.path
                d="M 200 60 C 130 60 100 100 100 150 C 100 210 140 230 200 230 C 260 230 300 210 300 150 C 300 100 270 60 200 60"
                fill="rgba(244, 114, 182, 0.1)" stroke="#f472b6" strokeWidth="3"
                animate={{ scale: isSpeaking ? [1, 1.02, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }}
            />
            <path d="M 200 60 L 200 230" stroke="#f472b6" strokeWidth="1" strokeDasharray="4,4" />
            <text x="150" y="100" fontSize="10" fill="#fbcfe8">Frontal</text>
            <text x="250" y="100" fontSize="10" fill="#fbcfe8">Parietal</text>
            <text x="150" y="200" fontSize="10" fill="#fbcfe8">Temporal</text>
            <text x="250" y="200" fontSize="10" fill="#fbcfe8">Occipital</text>
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Functional Brain Areas</text>
        </svg>
    );
}

export function NeuronVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {/* Cell body */}
            <circle cx="100" cy="140" r="30" fill="rgba(96, 165, 250, 0.2)" stroke="#60a5fa" strokeWidth="2" />
            {/* Dendrites */}
            {[0, 72, 144, 216, 288].map(angle => (
                <line key={angle} x1="100" y1="140" x2={100 + Math.cos(angle * Math.PI / 180) * 50} y2={140 + Math.sin(angle * Math.PI / 180) * 50} stroke="#60a5fa" strokeWidth="2" />
            ))}
            {/* Axon */}
            <line x1="130" y1="140" x2="350" y2="140" stroke="#60a5fa" strokeWidth="4" />
            {/* Myelin sheaths */}
            {[160, 220, 280].map(x => (
                <rect key={x} x={x} y="130" width="40" height="20" rx="5" fill="rgba(59, 130, 246, 0.4)" />
            ))}
            {/* Signal pulse */}
            <motion.circle r="6" fill="#fbbf24"
                animate={{ cx: isSpeaking ? [100, 350] : 100 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} cy="140" />

            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Neuron Signal Transmission</text>
        </svg>
    );
}

export function SpinalCordVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <rect x="180" y="40" width="40" height="200" rx="20" fill="rgba(167, 139, 250, 0.1)" stroke="#a78bfa" strokeWidth="2" />
            {[80, 120, 160, 200].map(y => (
                <motion.g key={y}>
                    <line x1="180" y1={y} x2="100" y2={y - 20} stroke="#a78bfa" strokeWidth="2" />
                    <line x1="220" y1={y} x2="300" y2={y - 20} stroke="#a78bfa" strokeWidth="2" />
                    <motion.circle r="4" fill="#fcd34d" initial={{ cx: 200, cy: y }}
                        animate={isSpeaking ? { cx: [200, 100], cy: [y, y - 20] } : {}} transition={{ duration: 1, repeat: Infinity }} />
                </motion.g>
            ))}
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Spinal Cord & Nerve Roots</text>
        </svg>
    );
}

export function StrokeVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <path d="M 200 60 C 130 60 100 100 100 150 C 100 210 140 230 200 230 C 260 230 300 210 300 150 C 300 100 270 60 200 60"
                fill="rgba(244, 114, 182, 0.1)" stroke="#f472b6" strokeWidth="2" />
            <circle cx="240" cy="120" r="25" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2" />
            <motion.path d="M 220 100 L 260 140 M 260 100 L 220 140" stroke="#ef4444" strokeWidth="3"
                animate={{ opacity: isSpeaking ? [0, 1, 0] : 1 }} transition={{ duration: 1, repeat: Infinity }} />

            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Ischemic Stroke: Localization</text>
        </svg>
    );
}

// ============================================
// MEDICINE - PSYCHOLOGY VISUALS
// ============================================

export function AnxietyVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.circle cx="200" cy="120" r="60" fill="none" stroke="#60a5fa" strokeWidth="2"
                animate={{
                    r: isSpeaking ? [60, 65, 60] : 60,
                    strokeDasharray: isSpeaking ? ["1,5", "5,1"] : "none"
                }} transition={{ duration: 0.5, repeat: Infinity }} />
            <motion.path d="M 170 120 Q 200 150, 230 120" fill="none" stroke="#60a5fa" strokeWidth="3"
                animate={{ d: isSpeaking ? "M 170 130 Q 200 120, 230 130" : "M 170 120 Q 200 150, 230 120" }} />
            <text x="200" y="220" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Anxiety: Brain State</text>
        </svg>
    );
}

export function CBTVisual() {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '200px 140px' }}>
                <circle cx="100" cy="140" r="40" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="300" cy="140" r="40" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2" />
                <circle cx="200" cy="40" r="40" fill="rgba(248, 113, 113, 0.2)" stroke="#f87171" strokeWidth="2" />
            </motion.g>
            <text x="100" y="145" fontSize="10" fill="white" textAnchor="middle">Thoughts</text>
            <text x="300" y="145" fontSize="10" fill="white" textAnchor="middle">Behaviors</text>
            <text x="200" y="45" fontSize="10" fill="white" textAnchor="middle">Feelings</text>
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">CBT Triangle</text>
        </svg>
    );
}
