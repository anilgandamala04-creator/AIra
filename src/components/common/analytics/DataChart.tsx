import { motion } from 'framer-motion';

interface DataChartProps {
    type: 'line' | 'bar';
    data: number[];
    color?: string;
    height?: number;
    width?: string | number;
    animate?: boolean;
}

export function DataChart({
    type,
    data,
    color = '#8b5cf6', // Default purple-500
    height = 60,
    width = '100%',
    animate = true
}: DataChartProps) {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data, 100); // Normalize to 100 or actual max
    const min = Math.min(...data, 0);
    const range = max - min;

    const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - ((val - min) / range) * 100
    }));

    if (type === 'line') {
        const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaData = `${pathData} L 100 100 L 0 100 Z`;

        return (
            <div style={{ height, width }}>
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label={`Line chart showing ${data.length} data points`}
                >
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <motion.path
                        d={areaData}
                        fill="url(#chartGradient)"
                        initial={animate ? { opacity: 0 } : { opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                    <motion.path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                    />
                    {/* Vertical indicator for current point (last) */}
                    <motion.circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="3"
                        fill={color}
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1] }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    />
                </svg>
            </div>
        );
    }

    if (type === 'bar') {
        const barWidth = 100 / (data.length * 1.5);
        return (
            <div style={{ height, width }}>
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label={`Bar chart showing ${data.length} categories`}
                >
                    {points.map((p, i) => (
                        <motion.rect
                            key={i}
                            x={p.x - barWidth / 2}
                            y={p.y}
                            width={barWidth}
                            height={100 - p.y}
                            fill={color}
                            rx="1"
                            initial={animate ? { height: 0, y: 100 } : {}}
                            animate={{ height: 100 - p.y, y: p.y }}
                            transition={{ delay: i * 0.1, duration: 0.5, ease: 'backOut' }}
                        />
                    ))}
                </svg>
            </div>
        );
    }

    return null;
}
