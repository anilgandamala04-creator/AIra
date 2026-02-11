import { motion } from 'framer-motion';
import { VisualProps, useVisualSync } from './Common';

// ============================================
// BIOLOGY - CELLULAR & GENETICS
// ============================================

export function CellStructureVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.ellipse cx="200" cy="140" rx="150" ry="100" fill="rgba(34, 197, 94, 0.1)" stroke="#22c55e" strokeWidth="4"
                animate={{ scale: isSpeaking ? [1, 1.02, 1] : 1 }} transition={{ duration: 3, repeat: Infinity }} />
            <circle cx="200" cy="140" r="40" fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="210" cy="130" r="15" fill="rgba(30, 58, 138, 0.4)" />
            <text x="200" y="195" fontSize="12" fill="#86efac" textAnchor="middle">Nucleus & Cytoplasm</text>
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Cell Structure</text>
        </svg>
    );
}

export function DNAStructureVisual() {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {[...Array(10)].map((_, i) => (
                <motion.g key={i}>
                    <motion.circle cx={150} cy={40 + i * 22} r="5" fill="#3b82f6"
                        animate={{ cx: [150, 250, 150] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }} />
                    <motion.circle cx={250} cy={40 + i * 22} r="5" fill="#ef4444"
                        animate={{ cx: [250, 150, 250] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }} />
                    <line x1="160" y1={40 + i * 22} x2="240" y2={40 + i * 22} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                </motion.g>
            ))}
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">DNA Double Helix</text>
        </svg>
    );
}

export function DNAReplicationVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.path d="M 100 40 Q 200 140, 100 240" fill="none" stroke="#3b82f6" strokeWidth="3" />
            <motion.path d="M 300 40 Q 200 140, 300 240" fill="none" stroke="#ef4444" strokeWidth="3" />
            {isSpeaking && [...Array(5)].map((_, i) => (
                <motion.circle key={i} r="4" fill="#fbbf24"
                    initial={{ cx: 200, cy: 140 }}
                    animate={{ cx: [200, 100 + Math.random() * 200], cy: [140, 40 + i * 40] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
            ))}
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">DNA Replication: Fork</text>
        </svg>
    );
}

export function DNATranscriptionVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <path d="M 50 100 Q 200 80, 350 100 M 50 140 Q 200 160, 350 140" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
            <motion.path d="M 100 120 Q 200 120, 300 120" fill="none" stroke="#fbbf24" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0.5 }} transition={{ duration: 2 }} />
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Transcription: mRNA Synthesis</text>
        </svg>
    );
}

export function DNATranslationVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <rect x="50" y="180" width="300" height="20" rx="10" fill="rgba(59, 130, 246, 0.2)" />
            <motion.g animate={{ x: isSpeaking ? [0, 50, 0] : 0 }} transition={{ duration: 2, repeat: Infinity }}>
                <rect x="150" y="100" width="100" height="60" rx="10" fill="rgba(167, 139, 250, 0.3)" stroke="#a78bfa" strokeWidth="2" />
                <motion.circle r="10" fill="#ef4444" cx="200" cy="80" animate={{ y: isSpeaking ? [-10, 0, -10] : 0 }} />
            </motion.g>
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Translation: Protein Synthesis</text>
        </svg>
    );
}

export function HeredityVisual() {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <rect x="100" y="60" width="80" height="80" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" />
            <rect x="180" y="60" width="80" height="80" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" />
            <rect x="100" y="140" width="80" height="80" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" />
            <rect x="180" y="140" width="80" height="80" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" />
            <text x="140" y="110" fontSize="20" fill="white" textAnchor="middle">BB</text>
            <text x="220" y="110" fontSize="20" fill="white" textAnchor="middle">Bb</text>
            <text x="140" y="190" fontSize="20" fill="white" textAnchor="middle">Bb</text>
            <text x="220" y="190" fontSize="20" fill="white" textAnchor="middle">bb</text>
            <text x="200" y="40" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Punnett Square: Heredity</text>
        </svg>
    );
}

// ============================================
// PHYSICS - KINEMATICS & DYNAMICS
// ============================================

export function KinematicsVisual({ isSpeaking, stepId }: VisualProps) {
    const { speechProgress } = useVisualSync(stepId, isSpeaking);
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <line x1="40" y1="200" x2="360" y2="200" stroke="#94a3b8" strokeWidth="2" />
            <motion.circle r="15" fill="#f59e0b"
                animate={{ cx: isSpeaking ? [55, 55 + (300 * (speechProgress / 100))] : 55 }}
                transition={{ duration: 0.1 }} cy="185" />
            <text x="200" y="240" fontSize="12" fill="#94a3b8" textAnchor="middle">Distance = Speed × Time</text>
            <text x="200" y="40" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Kinematics: Displacement</text>
        </svg>
    );
}

export function NewtonsLawsVisual({ isSpeaking, stepId }: VisualProps) {
    const { animationIntensity } = useVisualSync(stepId, isSpeaking);
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.rect x="50" y="150" width="80" height="50" fill="#3b82f6"
                animate={{ x: isSpeaking ? 50 + (animationIntensity * 100) : 50 }} transition={{ duration: 0.2 }} />
            <motion.path d="M 20 175 L 45 175" stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrowRed)" />
            <text x="35" y="165" fontSize="10" fill="#fca5a5" textAnchor="middle">Force (F)</text>
            <text x="90" y="180" fontSize="12" fill="white" textAnchor="middle">Mass (m)</text>
            <text x="200" y="240" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Newton's Second Law: F = ma</text>
            <defs>
                <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                </marker>
            </defs>
        </svg>
    );
}

export function ThermodynamicsVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <rect x="100" y="80" width="200" height="120" stroke="#94a3b8" strokeWidth="2" fill="none" />
            {[...Array(8)].map((_, i) => (
                <motion.circle key={i} r="5" fill="#ef4444"
                    animate={{
                        cx: [120 + Math.random() * 160, 120 + Math.random() * 160],
                        cy: [100 + Math.random() * 80, 100 + Math.random() * 80]
                    }}
                    transition={{ duration: isSpeaking ? 0.5 : 2, repeat: Infinity }} />
            ))}
            <text x="200" y="240" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Thermodynamics: Heat Energy</text>
        </svg>
    );
}

// ============================================
// EARTH & SPACE SCIENCE
// ============================================

export function SolarSystemVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.circle cx="200" cy="140" r="30" fill="#fbbf24"
                animate={{ scale: isSpeaking ? [1, 1.1, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} />
            {[55, 80, 110, 145].map((r, i) => (
                <circle key={i} cx="200" cy="140" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            ))}
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '200px 140px' }}>
                <circle cx="310" cy="140" r="9" fill="#3b82f6" />
                <circle cx="318" cy="138" r="2" fill="#94a3b8" />
            </motion.g>
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Solar System</text>
        </svg>
    );
}

export function GlobeVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.circle cx="200" cy="140" r="100" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} />
            {[-60, -30, 0, 30, 60].map((lat, i) => (
                <motion.ellipse key={i} cx="200" cy={140 + lat} rx={Math.cos(lat * Math.PI / 180) * 100} ry="8"
                    fill="none" stroke={lat === 0 ? "#ef4444" : "#22c55e"} strokeWidth={lat === 0 ? 2 : 1}
                    initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.5 }} transition={{ delay: 0.3 + i * 0.1 }} />
            ))}
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Globe: Latitudes & Longitudes</text>
        </svg>
    );
}

export function WaterCycleVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.circle cx="50" cy="50" r="25" fill="#fbbf24"
                animate={{ scale: isSpeaking ? [1, 1.1, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.path d="M 20 220 Q 100 200, 180 220 Q 260 240, 340 220 L 380 220 L 380 270 L 20 270 Z"
                fill="rgba(59, 130, 246, 0.4)" stroke="#3b82f6" strokeWidth="2" />
            <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: isSpeaking ? 1 : 0.5, y: 0 }} transition={{ delay: 0.5 }}>
                {[80, 130, 180].map((x, i) => (
                    <g key={i}>
                        <path d={`M ${x} 200 L ${x} 160`} stroke="#60a5fa" strokeWidth="2" strokeDasharray="4,2" />
                        <polygon points={`${x - 5},165 ${x},155 ${x + 5},165`} fill="#60a5fa" />
                    </g>
                ))}
            </motion.g>
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Water Cycle</text>
        </svg>
    );
}

export function PhotosynthesisVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.circle cx="60" cy="50" r="25" fill="#fbbf24"
                animate={{ scale: isSpeaking ? [1, 1.15, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.path d="M 200 80 Q 280 100, 320 180 Q 280 200, 200 190 Q 120 200, 80 180 Q 120 100, 200 80"
                fill="rgba(34, 197, 94, 0.4)" stroke="#22c55e" strokeWidth="3" />
            <text x="200" y="265" fontSize="10" fill="#93c5fd" textAnchor="middle">H₂O + CO₂ + Light → Glucose + O₂</text>
            <text x="200" y="30" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Photosynthesis</text>
        </svg>
    );
}

// ============================================
// SYSTEM BIOLOGY
// ============================================

export function DigestiveSystemVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.ellipse cx="200" cy="35" rx="25" ry="12" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" />
            <motion.path d="M 175 80 Q 150 100, 160 130 Q 170 160, 200 155 Q 230 150, 240 120 Q 250 90, 225 80 Z"
                fill="rgba(234, 88, 12, 0.3)" stroke="#ea580c" strokeWidth="2" />
            {isSpeaking && (
                <motion.circle r="4" fill="#fbbf24"
                    animate={{
                        cx: [200, 200, 200, 180, 200, 220, 200],
                        cy: [35, 60, 120, 170, 200, 220, 240]
                    }} transition={{ duration: 4, repeat: Infinity }} />
            )}
            <text x="200" y="270" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Digestive System</text>
        </svg>
    );
}

export function RespiratorySystemVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.ellipse cx="120" cy="180" rx="60" ry="80" fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="2"
                animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.ellipse cx="280" cy="180" rx="60" ry="80" fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="2"
                animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1 }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
            <text x="200" y="20" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Respiratory System</text>
        </svg>
    );
}

// ============================================
// CHEMISTRY - ATOMIC & MOLECULAR
// ============================================

export function AtomicStructureVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.g animate={{ scale: isSpeaking ? [1, 1.1, 1] : 1 }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <circle cx="200" cy="140" r="15" fill="#ef4444" />
                <circle cx="208" cy="145" r="15" fill="#3b82f6" opacity="0.8" />
            </motion.g>
            {[60, 100].map((r, i) => (
                <circle key={i} cx="200" cy="140" r={r} fill="none" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />
            ))}
            {[60, 100].map((r, i) => (
                <motion.circle key={i} r="5" fill="#fcd34d"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3 + i * 2, ease: "linear" }}
                    style={{ originX: "200px", originY: "140px", transformOrigin: "200px 140px", cx: 200 + r, cy: 140 }} />
            ))}
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Bohr Model: Atomic Structure</text>
        </svg>
    );
}

export function ChemicalReactionVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.g animate={{ x: isSpeaking ? [0, 40, 0] : 0 }} transition={{ repeat: Infinity, duration: 2 }}>
                <circle cx="100" cy="120" r="15" fill="#60a5fa" />
                <circle cx="120" cy="120" r="15" fill="#60a5fa" />
            </motion.g>
            <motion.g animate={{ x: isSpeaking ? [0, -40, 0] : 0 }} transition={{ repeat: Infinity, duration: 2 }}>
                <circle cx="300" cy="120" r="15" fill="#ef4444" />
                <circle cx="280" cy="120" r="15" fill="#ef4444" />
            </motion.g>
            <text x="200" y="50" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Chemical Reaction: A₂ + B₂ → 2AB</text>
        </svg>
    );
}

export function PeriodicTableVisual({ isSpeaking, stepId }: VisualProps) {
    const { speechProgress } = useVisualSync(stepId, isSpeaking);
    const elements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg'];

    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <g transform="translate(40, 60)">
                {elements.map((el, i) => (
                    <motion.g key={el} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                        <rect x={(i % 4) * 85} y={Math.floor(i / 4) * 50} width="70" height="40" rx="4"
                            fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1" />
                        <text x={(i % 4) * 85 + 35} y={Math.floor(i / 4) * 50 + 25} fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">{el}</text>
                    </motion.g>
                ))}
            </g>
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.3 }}>
                <path d="M 40 40 L 340 40" fill="none" stroke="#fbbf24" strokeWidth="2" />
                <motion.circle r="4" fill="#fbbf24" animate={{ cx: isSpeaking ? 40 + (300 * (speechProgress / 100)) : 40 }} transition={{ duration: 0.1 }} cy="40" />
            </motion.g>
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Periodic Table Trends</text>
        </svg>
    );
}

export function OrganicMolecularVisual() {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <g transform="translate(100, 140)">
                <motion.path d="M 0 40 L 50 -40 L 100 40 L 150 -40" fill="none" stroke="#94a3b8" strokeWidth="4"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
                {[
                    { x: 0, y: 40, label: 'C' },
                    { x: 50, y: -40, label: 'C' },
                    { x: 100, y: 40, label: 'C' },
                    { x: 150, y: -40, label: 'OH', color: '#ef4444' }
                ].map((atom, i) => (
                    <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.2 }}>
                        <circle cx={atom.x} cy={atom.y} r="12" fill={atom.color || "#3b82f6"} />
                        <text x={atom.x} y={atom.y + 4} fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">{atom.label}</text>
                    </motion.g>
                ))}
            </g>
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Organic Structure: Propanol</text>
        </svg>
    );
}
