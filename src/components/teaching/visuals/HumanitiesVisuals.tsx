import { motion } from 'framer-motion';
import { VisualProps } from './Common';

// ============================================
// SOCIAL SCIENCE & ECONOMICS
// ============================================

export function GraphVisualizationVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <line x1="40" y1="240" x2="360" y2="240" stroke="#94a3b8" strokeWidth="2" />
            <line x1="40" y1="40" x2="40" y2="240" stroke="#94a3b8" strokeWidth="2" />
            <motion.path d="M 40 200 L 100 160 L 180 190 L 260 80 L 360 120" fill="none" stroke="#3b82f6" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
            {isSpeaking && <motion.circle r="6" fill="#fbbf24" animate={{ cx: [40, 100, 180, 260, 360], cy: [200, 160, 190, 80, 120] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />}
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Economic Trends Analysis</text>
        </svg>
    );
}

export function StockMarketVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {[...Array(6)].map((_, i) => (
                <rect key={i} x={50 + i * 55} y={240 - (30 + i * 25)} width="40" height={30 + i * 25} fill="rgba(34, 197, 94, 0.4)" stroke="#22c55e" />
            ))}
            <motion.path d="M 50 180 L 100 160 L 150 140 L 200 120 L 250 90 L 300 60" fill="none" stroke="#fbbf24" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0.8 }} transition={{ duration: 1.5 }} />
            <text x="200" y="270" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Market Growth Index</text>
        </svg>
    );
}

export function EconomicFlowVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <rect x="50" y="110" width="80" height="60" rx="4" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />
            <rect x="270" y="110" width="80" height="60" rx="4" fill="rgba(34, 197, 194, 0.2)" stroke="#22c55e" strokeWidth="2" />
            <motion.path d="M 130 125 C 200 90, 200 90, 270 125" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,3"
                animate={{ strokeDashoffset: isSpeaking ? [0, -20] : 0 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
            <motion.path d="M 270 155 C 200 190, 200 190, 130 155" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,3"
                animate={{ strokeDashoffset: isSpeaking ? [0, 20] : 0 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Circular Flow of Income</text>
        </svg>
    );
}

// ============================================
// LAW & CIVICS
// ============================================

export function ContractFormationVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.rect x="50" y="50" width="120" height="150" fill="white" fillOpacity="0.05" stroke="#cbd5e1" strokeWidth="1" />
            <motion.path d="M 80 180 L 140 180" stroke="#fbbf24" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0.8 }} />
            <circle cx="300" cy="120" r="50" fill="rgba(34, 197, 114, 0.2)" stroke="#22c55e" strokeWidth="2" />
            <text x="300" y="125" fontSize="12" fill="white" textAnchor="middle">Mutual Assent</text>
            <text x="200" y="240" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Elements of a Contract</text>
        </svg>
    );
}

export function DemocracyFlowVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {[
                { y: 50, label: "Legislature", color: "#3b82f6" },
                { y: 130, label: "Executive", color: "#22c55e" },
                { y: 210, label: "Judiciary", color: "#ef4444" }
            ].map((d, i) => (
                <motion.g key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.5 }}>
                    <rect x="120" y={d.y} width="160" height="40" rx="5" fill={`${d.color}30`} stroke={d.color} strokeWidth="2" />
                    <text x="200" y={d.y + 25} fontSize="12" fill={d.color} textAnchor="middle" fontWeight="bold">{d.label}</text>
                </motion.g>
            ))}
            <motion.path d="M 280 70 L 320 70 L 320 230 L 280 230" fill="none" stroke="#fbbf24" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: isSpeaking ? 1 : 0.5 }} transition={{ duration: 2 }} />
            <text x="200" y="30" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Civics: Separation of Powers</text>
        </svg>
    );
}

// ============================================
// HISTORY & GEOGRAPHY
// ============================================

export function TimelineVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.line x1="40" y1="140" x2="360" y2="140" stroke="#fbbf24" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
            {[
                { x: 70, label: 'Ancient', year: '3000 BCE', color: '#22c55e' },
                { x: 150, label: 'Classical', year: '500 BCE', color: '#3b82f6' },
                { x: 230, label: 'Medieval', year: '500 CE', color: '#8b5cf6' },
                { x: 310, label: 'Modern', year: '1500 CE', color: '#ef4444' },
            ].map((era, i) => (
                <motion.g key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: isSpeaking ? 1 : 0.7, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.3 }}>
                    <circle cx={era.x} cy="140" r="8" fill={era.color} />
                    <text x={era.x} y="170" fontSize="10" fill={era.color} textAnchor="middle" fontWeight="bold">{era.label}</text>
                    <text x={era.x} y="185" fontSize="8" fill="rgba(255,255,255,0.6)" textAnchor="middle">{era.year}</text>
                </motion.g>
            ))}
            <text x="200" y="40" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Historical Timeline</text>
        </svg>
    );
}

export function ArcheologyVisual() {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <g opacity="0.4">
                {[0, 1, 2, 3].map(i => (
                    <line key={i} x1="50" y1={80 + i * 40} x2="350" y2={80 + i * 40} stroke="#94a3b8" />
                ))}
            </g>
            <motion.path d="M 80 100 L 150 100 L 150 160 L 80 160 Z M 180 120 L 280 120 L 280 180 L 180 180 Z"
                fill="none" stroke="#fbbf24" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Archaeological Site Plan</text>
        </svg>
    );
}

export function IndiaMapVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.path d="M 200 40 L 230 60 L 250 100 L 280 140 L 240 220 L 200 260 L 160 220 L 120 140 L 150 100 L 170 60 Z"
                fill="rgba(34, 197, 94, 0.1)" stroke="#22c55e" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
            <motion.circle cx="200" cy="140" r="10" fill="#fbbf24" animate={{ r: isSpeaking ? [8, 12, 8] : 10 }} transition={{ repeat: Infinity, duration: 2 }} />
            <text x="200" y="20" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Geography: India</text>
        </svg>
    );
}

export function HeritageVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                <rect x="150" y="140" width="100" height="60" fill="#94a3b8" />
                <path d="M 150 140 Q 200 80, 250 140" fill="#cbd5e1" />
            </motion.g>
            <motion.g animate={{ opacity: isSpeaking ? [0.5, 1, 0.5] : 1 }} transition={{ repeat: Infinity, duration: 3 }}>
                <text x="200" y="60" fontSize="16" fill="#fcd34d" textAnchor="middle" fontWeight="bold">Cultural Heritage</text>
            </motion.g>
        </svg>
    );
}

// ============================================
// ENGLISH & LITERATURE
// ============================================

export function SentenceStructureVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <rect x="160" y="30" width="80" height="30" rx="5" fill="rgba(251, 191, 36, 0.3)" stroke="#fbbf24" strokeWidth="2" />
                <text x="200" y="50" fontSize="10" fill="#fcd34d" textAnchor="middle" fontWeight="bold">Sentence</text>
            </motion.g>
            <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: isSpeaking ? 1 : 0.7, y: 0 }} transition={{ delay: 0.5 }}>
                <rect x="50" y="90" width="100" height="30" rx="5" fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2" />
                <text x="100" y="110" fontSize="10" fill="#93c5fd" textAnchor="middle" fontWeight="bold">Subject</text>
                <rect x="250" y="90" width="100" height="30" rx="5" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2" />
                <text x="300" y="110" fontSize="10" fill="#86efac" textAnchor="middle" fontWeight="bold">Predicate</text>
            </motion.g>
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Sentence Structure</text>
        </svg>
    );
}

export function StoryMapVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.path d="M 50 200 Q 100 200, 150 150 Q 200 80, 250 100 Q 300 120, 350 200"
                fill="none" stroke="#fbbf24" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
            {[
                { x: 50, y: 200, label: 'Exposition', color: '#3b82f6' },
                { x: 200, y: 90, label: 'Climax', color: '#ef4444' },
                { x: 350, y: 200, label: 'Resolution', color: '#f59e0b' },
            ].map((elem, i) => (
                <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: isSpeaking ? 1 : 0.7, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.3 }}>
                    <circle cx={elem.x} cy={elem.y} r="12" fill={elem.color} />
                    <text x={elem.x} y={elem.y + 30} fontSize="9" fill={elem.color} textAnchor="middle">{elem.label}</text>
                </motion.g>
            ))}
            <text x="200" y="260" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Story Structure</text>
        </svg>
    );
}

export function PoetryAnalysisVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.rect x="100" y="50" width="200" height="160" rx="5" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="1" />
            {[
                { line: 'Roses are red,', rhyme: 'A', y: 75 },
                { line: 'Violets are blue,', rhyme: 'B', y: 100 },
                { line: 'Sugar is sweet,', rhyme: 'A', y: 125 },
                { line: 'And so are you.', rhyme: 'B', y: 150 },
            ].map((item, i) => (
                <motion.g key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: isSpeaking ? 1 : 0.7, x: 0 }}>
                    <text x="120" y={item.y} fontSize="11" fill="#e0e7ff">{item.line}</text>
                    <text x="320" y={item.y} fontSize="10" fill="#86efac" fontWeight="bold">{item.rhyme}</text>
                </motion.g>
            ))}
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Poetry: Rhyme Scheme</text>
        </svg>
    );
}

export function EssayStructureVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            {[
                { y: 40, height: 40, label: 'Introduction', color: '#3b82f6' },
                { y: 90, height: 100, label: 'Body Paragraphs', color: '#22c55e' },
                { y: 200, height: 40, label: 'Conclusion', color: '#8b5cf6' },
            ].map((section, i) => (
                <motion.g key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: isSpeaking ? 1 : 0.7, x: 0 }}>
                    <rect x="100" y={section.y} width="200" height={section.height} rx="5"
                        fill={`${section.color}30`} stroke={section.color} strokeWidth="2" />
                    <text x="200" y={section.y + section.height / 2 + 5} fontSize="11" fill={section.color}
                        textAnchor="middle" fontWeight="bold">{section.label}</text>
                </motion.g>
            ))}
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Essay Structure</text>
        </svg>
    );
}

export function LiteratureVisual({ isSpeaking }: VisualProps) {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.path d="M 200 220 Q 200 220, 350 200 L 350 60 Q 200 80, 200 80 Q 200 80, 50 60 L 50 200 Q 200 220, 200 220"
                fill="rgba(255, 255, 255, 0.1)" stroke="#cbd5e1" strokeWidth="2" />
            <motion.path d="M 240 100 L 260 60 L 250 55" fill="none" stroke="#fbbf24" strokeWidth="2"
                animate={isSpeaking ? { rotate: [0, 5, 0] } : {}} />
            <text x="200" y="250" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Language & Literature</text>
        </svg>
    );
}

export function TenseTimelineVisual() {
    return (
        <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect width="100%" height="100%" fill="transparent" />
            <motion.line x1="40" y1="140" x2="360" y2="140" stroke="#fbbf24" strokeWidth="3" />
            <line x1="200" y1="120" x2="200" y2="160" stroke="#ef4444" strokeWidth="3" />
            <text x="200" y="175" fontSize="12" fill="#fca5a5" textAnchor="middle" fontWeight="bold">NOW</text>
            <text x="110" y="85" fontSize="12" fill="#93c5fd" textAnchor="middle" fontWeight="bold">PAST</text>
            <text x="290" y="85" fontSize="12" fill="#c4b5fd" textAnchor="middle" fontWeight="bold">FUTURE</text>
            <text x="200" y="265" fontSize="14" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Tenses Timeline</text>
        </svg>
    );
}
