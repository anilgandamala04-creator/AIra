import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: 'purple' | 'blue' | 'green' | 'amber' | 'rose';
    delay?: number;
}

const colorMap = {
    purple: 'from-purple-500/10 to-indigo-500/5 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50',
    blue: 'from-blue-500/10 to-cyan-500/5 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
    green: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50',
    amber: 'from-amber-500/10 to-orange-500/5 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
    rose: 'from-rose-500/10 to-pink-500/5 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50',
};

const iconBgMap = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-500',
};

export function AnalyticsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color,
    delay = 0
}: AnalyticsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`relative p-5 rounded-3xl border bg-gradient-to-br ${colorMap[color]} backdrop-blur-sm overflow-hidden group`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-2xl ${iconBgMap[color]} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div
                        className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
                            }`}
                        aria-label={`${trend.isPositive ? 'Increased' : 'Decreased'} by ${trend.value}%`}
                    >
                        {trend.isPositive ? <ArrowUpRight className="w-3 h-3" aria-hidden="true" /> : <ArrowDownRight className="w-3 h-3" aria-hidden="true" />}
                        {trend.value}%
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {title}
                </h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                        {value}
                    </span>
                    {subtitle && (
                        <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            {/* Subtle bottom decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-10" />
        </motion.div>
    );
}
