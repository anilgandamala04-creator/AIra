import { motion } from 'framer-motion';
import { useMemo, useCallback } from 'react';

interface RadarChartProps {
    data: { label: string; value: number; fullMark?: number }[];
    width?: number;
    height?: number;
    color?: string;
}

export function RadarChart({ data, width = 300, height = 300, color = '#8b5cf6' }: RadarChartProps) {
    // Configuration
    const radius = Math.min(width, height) / 2 - 40; // Padding
    const centerX = width / 2;
    const centerY = height / 2;
    const totalAxes = data.length;

    // Helper to get coordinates
    const getCoordinates = useCallback((index: number, value: number, max: number) => {
        const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2; // Start at -90deg (top)
        const distance = (value / max) * radius;
        return {
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
        };
    }, [centerX, centerY, radius, totalAxes]);

    // Calculate points
    const points = useMemo(() => {
        const maxVal = 100; // Assuming percentage based mastery
        return data.map((d, i) => getCoordinates(i, d.value, maxVal));
    }, [data, getCoordinates]);

    const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

    // Background webs (concentric polygons)
    const webs = [0.2, 0.4, 0.6, 0.8, 1.0].map(scale => {
        return data.map((_, i) => {
            const { x, y } = getCoordinates(i, 100 * scale, 100);
            return `${x},${y}`;
        }).join(' ');
    });

    return (
        <div className="relative flex items-center justify-center" style={{ width, height }}>
            <svg width={width} height={height} className="overflow-visible">
                {/* Background Webs */}
                {webs.map((pointsStr, i) => (
                    <polygon
                        key={i}
                        points={pointsStr}
                        fill="none"
                        stroke="currentColor"
                        className="text-gray-200 dark:text-slate-700"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes Lines */}
                {data.map((_, i) => {
                    const { x, y } = getCoordinates(i, 100, 100);
                    return (
                        <line
                            key={i}
                            x1={centerX}
                            y1={centerY}
                            x2={x}
                            y2={y}
                            stroke="currentColor"
                            className="text-gray-200 dark:text-slate-700"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon Area */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0, originX: '50%', originY: '50%' }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    points={polygonPath}
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                    strokeWidth="2"
                />

                {/* Data Points */}
                {points.map((p, i) => (
                    <motion.circle
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill={color}
                        className="stroke-white dark:stroke-slate-900 stroke-2"
                    />
                ))}

                {/* Labels */}
                {data.map((d, i) => {
                    const { x, y } = getCoordinates(i, 115, 100); // Push labels out slightly
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] sm:text-xs font-medium fill-gray-500 dark:fill-slate-400 capitalize"
                        >
                            {d.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
