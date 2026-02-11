import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { MindMap, MindMapNode } from '../../types';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';

interface MindMapViewerProps {
    mindMap: MindMap;
}

// Recursive node component
function MindMapNodeComponent({
    node,
    level = 0,
    parentAngle = 0,
    index = 0,
    siblingCount = 1,
}: {
    node: MindMapNode;
    level?: number;
    parentAngle?: number;
    index?: number;
    siblingCount?: number;
}) {
    const [expanded, setExpanded] = useState(level < 2);

    const hasChildren = node.children && node.children.length > 0;

    // Calculate position based on level
    const radius = level === 0 ? 0 : 80 + level * 60;
    const angleSpread = Math.PI / (siblingCount + 1);
    const angle = parentAngle - (Math.PI / 2) + angleSpread * (index + 1);

    const x = level === 0 ? 200 : 200 + Math.cos(angle) * radius;
    const y = level === 0 ? 150 : 150 + Math.sin(angle) * radius;

    const nodeSize = level === 0 ? 80 : level === 1 ? 60 : 50;

    return (
        <>
            {/* Connection line to parent */}
            {level > 0 && (
                <motion.line
                    x1={200}
                    y1={150}
                    x2={x}
                    y2={y}
                    stroke={node.color}
                    strokeWidth={level === 1 ? 2 : 1}
                    strokeOpacity={0.3}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: level * 0.1 }}
                />
            )}

            {/* Node circle */}
            <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: level * 0.1 + index * 0.05 }}
                style={{ cursor: hasChildren ? 'pointer' : 'default' }}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                <circle
                    cx={x}
                    cy={y}
                    r={nodeSize / 2}
                    fill={node.color}
                    opacity={0.9}
                    className="filter drop-shadow-md"
                />
                <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={level === 0 ? 12 : level === 1 ? 10 : 8}
                    fontWeight={level === 0 ? 'bold' : level === 1 ? '600' : '500'}
                    className="select-none pointer-events-none"
                >
                    {node.label.length > 12 ? node.label.substring(0, 10) + '...' : node.label}
                </text>

                {/* Expand indicator */}
                {hasChildren && !expanded && (
                    <text
                        x={x}
                        y={y + nodeSize / 2 + 10}
                        textAnchor="middle"
                        fontSize={10}
                        fill={node.color}
                    >
                        +{node.children?.length}
                    </text>
                )}
            </motion.g>

            {/* Render children */}
            {expanded && hasChildren && node.children?.map((child, i) => (
                <MindMapNodeComponent
                    key={child.id}
                    node={child}
                    level={level + 1}
                    parentAngle={angle}
                    index={i}
                    siblingCount={node.children?.length || 1}
                />
            ))}
        </>
    );
}

export default function MindMapViewer({ mindMap }: MindMapViewerProps) {
    const [zoom, setZoom] = useState(1);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 0.2, 2));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 0.2, 0.5));
    }, []);

    const handleDownload = () => {
        const svgElement = document.getElementById('mindmap-svg');
        if (!svgElement || !(svgElement instanceof SVGElement)) return;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${mindMap.topicName.toLowerCase().replace(/\s+/g, '-')}-mindmap.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadPng = () => {
        const svgElement = document.getElementById('mindmap-svg');
        if (!svgElement || !(svgElement instanceof SVGElement)) return;
        const viewBox = svgElement.getAttribute('viewBox') ?? '0 0 400 300';
        const [, , w, h] = viewBox.split(/\s+/).map(Number);
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        img.onload = () => {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, w * scale, h * scale);
            URL.revokeObjectURL(url);
            canvas.toBlob((blob) => {
                if (!blob) return;
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${mindMap.topicName.toLowerCase().replace(/\s+/g, '-')}-mindmap.png`;
                a.click();
                URL.revokeObjectURL(a.href);
            }, 'image/png');
        };
        img.onerror = () => URL.revokeObjectURL(url);
        img.src = url;
    };

    const centralNode = mindMap.nodes?.length ? mindMap.nodes[0] : null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden min-w-0 max-w-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 flex items-center justify-between gap-2 shrink-0 min-w-0">
                <div className="min-w-0 flex-1" data-reading-content>
                    <h3 className="font-bold truncate text-sm sm:text-base" title={mindMap.topicName}>{mindMap.topicName}</h3>
                    <p className="text-xs text-indigo-200">Interactive Mind Map</p>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={handleZoomOut}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleZoomIn}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setZoom(1)}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                        title="Download as SVG"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDownloadPng}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                        title="Download as PNG"
                    >
                        <span className="text-xs font-medium">PNG</span>
                    </button>
                </div>
            </div>

            {/* Mind Map Canvas - responsive height for small panels and mobile */}
            <div className="relative overflow-auto bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 min-h-[220px] sm:min-h-[280px] max-h-[50vh] sm:max-h-[350px] flex-1">
                <svg
                    id="mindmap-svg"
                    viewBox="0 0 400 300"
                    className="w-full h-full"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                >
                    {/* Central node and children */}
                    {centralNode ? (
                        <MindMapNodeComponent node={centralNode} />
                    ) : (
                        <text x="200" y="150" textAnchor="middle" fill="currentColor" className="text-slate-500">No nodes to display</text>
                    )}
                </svg>

                {/* Legend */}
                <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-lg p-2 text-xs border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200" data-reading-content>
                    <p className="text-gray-500 dark:text-slate-400 mb-1">Click nodes to expand/collapse</p>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            Central
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Category
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Concept
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
