import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VisualProps, useVisualSync } from './Common';

// ============================================
// ENGINEERING - ELECTRONICS & PHYSICS
// ============================================

export function DCCircuitVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <path d="M 100 140 L 100 80 L 300 80 L 300 200 L 100 200 L 100 140" fill="none" stroke="#94a3b8" strokeWidth="3" />
            <line x1="190" y1="200" x2="210" y2="200" stroke="#fcd34d" strokeWidth="4" />
            <line x1="195" y1="210" x2="205" y2="210" stroke="#fbbf24" strokeWidth="4" />
            {isSpeaking && [0, 1, 2, 3].map(i => (
                <motion.circle key={i} r="3" fill="#60a5fa"
                    animate={{ offsetDistance: ["0%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.5, ease: "linear" }}
                    style={{ offsetPath: "path('M 100 80 L 300 80 L 300 200 L 100 200 Z')" }} />
            ))}
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">DC Circuit: Electron Flow</text>
        </svg>
    );
}

export function ACCircuitVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.path d="M 50 140 Q 100 40, 150 140 Q 200 240, 250 140 Q 300 40, 350 140"
                fill="none" stroke="#3b82f6" strokeWidth="3"
                animate={{ strokeDashoffset: isSpeaking ? [0, -40] : 0 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} strokeDasharray="10,5" />
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">AC Circuit: Sine Wave</text>
        </svg>
    );
}

export function CircuitAdvancedVisual({ isSpeaking, stepId }: VisualProps) {
    const { speechProgress } = useVisualSync(stepId, isSpeaking);
    const [isOn, setIsOn] = useState(false);

    useEffect(() => {
        if (isSpeaking && speechProgress > 20 && speechProgress < 80) setIsOn(true);
        else if (isSpeaking) setIsOn(false);
    }, [isSpeaking, speechProgress]);

    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <path d="M 100 140 L 100 80 L 300 80 L 300 140 M 100 140 L 100 200 L 300 200 L 300 140" fill="none" stroke="#94a3b8" strokeWidth="3" />
            <motion.line x1="100" y1="110" x2={isOn ? 100 : 130} y2={isOn ? 80 : 60} stroke="#ef4444" strokeWidth="4" animate={{ x2: isOn ? 100 : 130, y2: isOn ? 80 : 60 }} />
            <motion.g transform="translate(300, 140)" animate={{ opacity: isOn ? 1 : 0.3 }}>
                <circle r="20" fill={isOn ? "rgba(251, 191, 36, 0.4)" : "rgba(148, 163, 184, 0.2)"} />
                <path d="M -10 0 Q 0 -15 10 0" fill="none" stroke={isOn ? "#fbbf24" : "#94a3b8"} strokeWidth="2" />
            </motion.g>
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Parallel Circuit Dynamics</text>
        </svg>
    );
}

export function OpticsVisual({ isSpeaking, stepId }: VisualProps) {
    const { speechProgress } = useVisualSync(stepId, isSpeaking);
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <path d="M 190 60 Q 220 140, 190 220 Q 160 140, 190 60" fill="rgba(96, 165, 250, 0.2)" stroke="#60a5fa" strokeWidth="2" />
            <line x1="20" y1="140" x2="380" y2="140" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />
            <motion.g initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0.8 }} transition={{ duration: 1 }}>
                <line x1="50" y1="90" x2="185" y2="90" stroke="#ef4444" strokeWidth="2" />
                <line x1="50" y1="140" x2="190" y2="140" stroke="#ef4444" strokeWidth="2" />
                <line x1="50" y1="190" x2="185" y2="190" stroke="#ef4444" strokeWidth="2" />
            </motion.g>
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.6 }} transition={{ delay: 1 }}>
                <line x1="185" y1="90" x2="320" y2="140" stroke="#f87171" strokeWidth="2" />
                <line x1="190" y1="140" x2="350" y2="140" stroke="#f87171" strokeWidth="2" />
                <line x1="185" y1="190" x2="320" y2="140" stroke="#f87171" strokeWidth="2" />
            </motion.g>
            <motion.circle cx="320" cy="140" r={isSpeaking ? 4 + (speechProgress % 4) : 4} fill="#fbbf24" animate={{ scale: isSpeaking ? [1, 1.5, 1] : 1 }} transition={{ repeat: Infinity, duration: 2 }} />
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Ray Optics: Convergence</text>
        </svg>
    );
}

export function MagneticFieldVisual({ isSpeaking, stepId }: VisualProps) {
    const { animationIntensity } = useVisualSync(stepId, isSpeaking);
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {[
                "M 150 120 C 100 80, 100 200, 150 160",
                "M 150 110 C 50 50, 50 230, 150 170",
                "M 250 120 C 300 80, 300 200, 250 160",
                "M 250 110 C 350 50, 350 230, 250 170"
            ].map((d, i) => (
                <motion.path key={i} d={d} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,4"
                    animate={{ strokeDashoffset: isSpeaking ? [0, -20] : 0 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
            ))}
            <motion.g animate={{ scale: isSpeaking ? 1 + (animationIntensity * 0.05) : 1 }} transition={{ duration: 0.2 }}>
                <rect x="150" y="110" width="50" height="60" fill="#ef4444" stroke="#7f1d1d" />
                <rect x="200" y="110" width="50" height="60" fill="#3b82f6" stroke="#1e3a8a" />
                <text x="175" y="145" fontSize="18" fill="white" textAnchor="middle" fontWeight="bold">N</text>
                <text x="225" y="145" fontSize="18" fill="white" textAnchor="middle" fontWeight="bold">S</text>
            </motion.g>
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Magnetism: Field Lines</text>
        </svg>
    );
}

// ============================================
// COMPUTER SCIENCE - AI & ALGORITHMS
// ============================================

export function NeuralNetworkVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {[80, 200, 320].map((x) => (
                <g key={x}>
                    {[60, 120, 180, 240].map(y => (
                        <circle key={y} cx={x} cy={y} r="10" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1" />
                    ))}
                </g>
            ))}
            {isSpeaking && [...Array(10)].map((_, i) => (
                <motion.line key={i} x1="80" y1={60 + Math.random() * 180} x2="200" y2={60 + Math.random() * 180}
                    stroke="#fbbf24" strokeWidth="1" opacity="0.4"
                    animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} />
            ))}
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Neural Network Architecture</text>
        </svg>
    );
}

export function SupervisedLearningVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.rect x="50" y="100" width="100" height="80" rx="8" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" />
            <motion.rect x="250" y="100" width="100" height="80" rx="8" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" />
            <text x="100" y="145" fontSize="10" fill="white" textAnchor="middle">Training Data</text>
            <text x="300" y="145" fontSize="10" fill="white" textAnchor="middle">Model Prediction</text>
            <motion.path d="M 160 140 L 240 140" stroke="#fbbf24" strokeWidth="3" markerEnd="url(#arrowGold)"
                animate={{ opacity: isSpeaking ? [0.3, 1, 0.3] : 0.5 }} transition={{ duration: 1, repeat: Infinity }} />
            <defs>
                <marker id="arrowGold" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
                </marker>
            </defs>
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Supervised Learning Flow</text>
        </svg>
    );
}

export function SortingAlgorithmVisual({ isSpeaking }: VisualProps) {
    const bars = [80, 120, 40, 160, 60, 140, 100];
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {bars.map((h, i) => (
                <motion.rect key={i} x={50 + i * 45} y={200 - h} width="35" height={h} fill="rgba(59, 130, 246, 0.4)" stroke="#3b82f6"
                    animate={isSpeaking ? { fill: ["rgba(59, 130, 246, 0.4)", "rgba(251, 191, 36, 0.6)", "rgba(59, 130, 246, 0.4)"] } : {}}
                    transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }} />
            ))}
            <text x="200" y="240" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Sorting Algorithm: Complexity</text>
        </svg>
    );
}

export function EncryptionVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.rect x="50" y="100" width="80" height="60" rx="4" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" />
            <motion.path d="M 90 90 Q 90 70, 70 70 Q 50 70, 50 90 L 50 100 L 90 100 Z" fill="none" stroke="#fbbf24" strokeWidth="2"
                animate={isSpeaking ? { y: [-5, 0, -5] } : {}} transition={{ duration: 1, repeat: Infinity }} />
            <text x="90" y="135" fontSize="10" fill="white" textAnchor="middle">Data</text>
            <motion.circle cx="300" cy="130" r="40" stroke="#22c55e" strokeWidth="2" fill="none" strokeDasharray="5,5"
                animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
            <text x="300" y="135" fontSize="10" fill="white" textAnchor="middle">Encrypted</text>
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Asymmetric Encryption</text>
        </svg>
    );
}

// ============================================
// WEB TECH & MARKETING
// ============================================

export function ReactComponentVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.rect x="100" y="60" width="200" height="140" rx="8" fill="rgba(59, 130, 246, 0.1)" stroke="#60a5fa" strokeWidth="2" />
            <motion.rect x="120" y="80" width="160" height="40" rx="4" fill="rgba(167, 139, 250, 0.2)" stroke="#a78bfa"
                animate={isSpeaking ? { opacity: [0.3, 1, 0.3] } : {}} transition={{ duration: 1, repeat: Infinity }} />
            <text x="200" y="105" fontSize="10" fill="white" textAnchor="middle">Props {"->"} UI</text>
            <text x="200" y="170" fontSize="12" fill="#60a5fa" textAnchor="middle">Component Logic</text>
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">React: Component Lifecycle</text>
        </svg>
    );
}

export function APIDesignVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <rect x="50" y="100" width="80" height="80" rx="8" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" />
            <rect x="270" y="100" width="80" height="80" rx="8" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" />
            <text x="90" y="145" fontSize="10" fill="white" textAnchor="middle">Client</text>
            <text x="310" y="145" fontSize="10" fill="white" textAnchor="middle">Server</text>
            <motion.path d="M 140 120 L 260 120" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrowGold)"
                animate={isSpeaking ? { x: [0, 10, 0] } : {}} />
            <motion.path d="M 260 160 L 140 160" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrowGold)"
                animate={isSpeaking ? { x: [0, -10, 0] } : {}} />
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">RESTful API Architecture</text>
        </svg>
    );
}

export function SQLBasicsVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <rect x="100" y="60" width="200" height="150" rx="10" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" strokeWidth="2" />
            {[90, 120, 150, 180].map(y => (
                <motion.rect key={y} x="110" y={y} width="180" height="20" fill="rgba(59, 130, 246, 0.1)"
                    animate={isSpeaking && y === 120 ? { fill: "rgba(34, 197, 94, 0.3)" } : {}} transition={{ duration: 0.5, repeat: Infinity }} />
            ))}
            <text x="200" y="45" fontSize="12" fill="white" textAnchor="middle">SELECT * FROM topics</text>
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Relational Database: Querying</text>
        </svg>
    );
}

export function SEOVisual() {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.circle cx="200" cy="120" r="80" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5"
                animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
            <text x="200" y="125" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">Content</text>
            <text x="200" y="60" fontSize="10" fill="#fbbf24">Keywords</text>
            <text x="200" y="190" fontSize="10" fill="#fbbf24">Backlinks</text>
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">SEO Fundamentals</text>
        </svg>
    );
}
