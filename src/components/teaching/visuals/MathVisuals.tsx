import { motion } from 'framer-motion';
import { VisualProps } from './Common';

// ============================================
// MATHEMATICS - ARITHMETIC & GEOMETRY
// ============================================

export function NumberLineVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.line x1="30" y1="140" x2="370" y2="140" stroke="#fbbf24" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
            {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((n, i) => (
                <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                    <line x1={200 + n * 30} y1="135" x2={200 + n * 30} y2="145" stroke={n === 0 ? "#ef4444" : "#94a3b8"} strokeWidth="2" />
                    <text x={200 + n * 30} y="165" fontSize="12" fill={n === 0 ? "#fca5a5" : "white"} textAnchor="middle">{n}</text>
                </motion.g>
            ))}
            {isSpeaking && <motion.circle r="8" fill="#f59e0b" animate={{ cx: [50, 200, 350, 200, 50] }} transition={{ duration: 4, repeat: Infinity }} cy={140} />}
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Number Line</text>
        </svg>
    );
}

export function GeometryShapesVisual() {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                <polygon points="80,180 130,80 180,180" fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2" />
                <rect x="220" y="100" width="80" height="80" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2" />
                <circle cx="340" cy="140" r="40" fill="rgba(168, 85, 247, 0.3)" stroke="#a855f7" strokeWidth="2" />
            </motion.g>
            <text x="200" y="240" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Geometry: Fundamental Shapes</text>
        </svg>
    );
}

export function EquationVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <line x1="50" y1="200" x2="350" y2="200" stroke="#94a3b8" strokeWidth="2" />
            <line x1="200" y1="50" x2="200" y2="230" stroke="#94a3b8" strokeWidth="2" />
            <motion.path d="M 100 80 Q 200 240, 300 80" fill="none" stroke="#60a5fa" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
            {isSpeaking && <motion.circle r="6" fill="#fbbf24" animate={{ cx: [100, 200, 300], cy: [80, 200, 80] }} transition={{ repeat: Infinity, duration: 4 }} />}
            <text x="200" y="40" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Functions: y = ax² + c</text>
        </svg>
    );
}

export function GeometryConicsVisual() {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <line x1="40" y1="140" x2="360" y2="140" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="200" y1="40" x2="200" y2="240" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />
            <motion.ellipse cx="200" cy="140" rx="100" ry="60" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
            <circle cx="120" cy="140" r="4" fill="#ef4444" />
            <circle cx="280" cy="140" r="4" fill="#ef4444" />
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Conic Sections: Ellipse</text>
        </svg>
    );
}
