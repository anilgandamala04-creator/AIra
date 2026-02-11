import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLeaderboardStore } from '../../../stores/leaderboardStore';
import { FixedSizeList as List } from 'react-window';

export const LeaderboardCard: React.FC = () => {
    const { entries, userRank, timeframe, setTimeframe, fetchLeaderboard, isLoading } = useLeaderboardStore();

    useEffect(() => {
        fetchLeaderboard(timeframe);
    }, [fetchLeaderboard, timeframe]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="w-5 h-5 text-amber-500" />;
            case 2: return <Medal className="w-5 h-5 text-slate-400" />;
            case 3: return <Medal className="w-5 h-5 text-amber-700" />;
            default: return <span className="text-xs font-bold text-slate-400 w-5 text-center">{rank}</span>;
        }
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-3 h-3 text-emerald-500" />;
            case 'down': return <TrendingDown className="w-3 h-3 text-rose-500" />;
            default: return <Minus className="w-3 h-3 text-slate-300" />;
        }
    };

    const LeaderboardRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const entry = entries[index];
        if (!entry) return null;

        return (
            <div style={{ ...style, paddingBottom: '8px' }}>
                <div
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all h-full ${entry.isCurrentUser
                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <div className="w-8 flex justify-center">
                        {getRankIcon(entry.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {entry.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                            Level {entry.level}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                            {entry.totalXp.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            {getTrendIcon(entry.trend)}
                            <span className="text-[10px] font-bold text-slate-400">XP</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
        >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Top Scholars
                </h2>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    {(['weekly', 'all-time'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${timeframe === t
                                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                                : 'text-slate-500'
                                }`}
                        >
                            {t === 'weekly' ? 'WEEKLY' : 'ALL-TIME'}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`p-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="h-[320px]">
                    <List
                        height={320}
                        itemCount={entries.length}
                        itemSize={72}
                        width="100%"
                    >
                        {LeaderboardRow}
                    </List>
                </div>

                {userRank && !entries.find(e => e.isCurrentUser) && (
                    <>
                        <div className="my-3 border-t border-dashed border-slate-200 dark:border-slate-800" />
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50">
                            <div className="w-8 flex justify-center text-xs font-bold text-purple-600 dark:text-purple-400">
                                {userRank.rank}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">You</p>
                                <p className="text-[10px] text-slate-500 font-medium">Level {userRank.level}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-slate-900 dark:text-white">
                                    {userRank.totalXp.toLocaleString()}
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                    {getTrendIcon(userRank.trend)}
                                    <span className="text-[10px] font-bold text-slate-400">XP</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};
