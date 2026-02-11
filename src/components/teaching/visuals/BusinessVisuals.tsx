import { motion } from 'framer-motion';
import { VisualProps } from './Common';

// ============================================
// BUSINESS & MANAGEMENT
// ============================================

export function BusinessManagementVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Central Hub / Manager */}
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                <circle cx="200" cy="80" r="30" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />
                <path d="M 185 90 Q 200 100 215 90" fill="none" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="190" cy="70" r="3" fill="#3b82f6" />
                <circle cx="210" cy="70" r="3" fill="#3b82f6" />
            </motion.g>

            {/* Flow Lines */}
            {[
                { x: 100, y: 180 },
                { x: 200, y: 180 },
                { x: 300, y: 180 }
            ].map((pos, i) => (
                <motion.path
                    key={i}
                    d={`M 200 110 L ${pos.x} ${pos.y - 30}`}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isSpeaking ? 1 : 0.5 }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                />
            ))}

            {/* Sub-departments / Processes */}
            {[
                { x: 100, label: 'Plan', color: '#22c55e' },
                { x: 200, label: 'Execute', color: '#f59e0b' },
                { x: 300, label: 'Review', color: '#ef4444' }
            ].map((item, i) => (
                <motion.g key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.2 }}>
                    <rect x={item.x - 35} y="150" width="70" height="50" rx="6" fill={`${item.color}30`} stroke={item.color} strokeWidth="2" />
                    <text x={item.x} y="180" fontSize="12" fill={item.color} textAnchor="middle" fontWeight="bold">{item.label}</text>
                </motion.g>
            ))}

            {/* Cycle / Feedback Loop */}
            <motion.path
                d="M 100 210 Q 200 260 300 210"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                markerEnd="url(#arrowGray)"
                animate={{ opacity: isSpeaking ? [0.4, 1, 0.4] : 0.6 }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <defs>
                <marker id="arrowGray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
            </defs>

            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Management Process</text>
        </svg>
    );
}

export function BusinessHierarchyVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />

            {/* Levels */}
            {[
                { y: 40, width: 60, label: 'Top', color: '#8b5cf6' },
                { y: 120, width: 140, label: 'Middle Level', color: '#3b82f6' },
                { y: 200, width: 220, label: 'Operational Level', color: '#22c55e' }
            ].map((level, i) => (
                <motion.g key={i} initial={{ scaleX: 0 }}
                    animate={{
                        scaleX: 1,
                        opacity: isSpeaking ? 1 : 0.8
                    }}
                    transition={{ delay: i * 0.3, duration: 0.5 }}>
                    <rect x={200 - level.width / 2} y={level.y} width={level.width} height="40" rx="4" fill={`${level.color}30`} stroke={level.color} strokeWidth="2" />
                    <text x="200" y={level.y + 25} fontSize="12" fill={level.color} textAnchor="middle" fontWeight="bold">{level.label}</text>
                    {/* Connecting Lines */}
                    {i < 2 && (
                        <line x1="200" y1={level.y + 40} x2="200" y2={level.y + 80} stroke="#94a3b8" strokeWidth="2" />
                    )}
                </motion.g>
            ))}

            <text x="200" y="270" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Organizational Hierarchy</text>
        </svg>
    );
}
