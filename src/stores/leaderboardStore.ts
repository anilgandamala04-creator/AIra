import { create } from 'zustand';

export interface LeaderboardEntry {
    rank: number;
    name: string;
    level: number;
    totalXp: number;
    isCurrentUser?: boolean;
    trend: 'up' | 'down' | 'stable';
}

interface LeaderboardState {
    entries: LeaderboardEntry[];
    userRank: LeaderboardEntry | null;
    timeframe: 'weekly' | 'all-time';
    isLoading: boolean;

    // Actions
    fetchLeaderboard: (timeframe: 'weekly' | 'all-time') => Promise<void>;
    setTimeframe: (timeframe: 'weekly' | 'all-time') => void;
}

const MOCK_LEADERBOARD_WEEKLY: LeaderboardEntry[] = [
    { rank: 1, name: 'Alice Wilson', level: 12, totalXp: 8450, trend: 'stable' },
    { rank: 2, name: 'Bob Smith', level: 10, totalXp: 7200, trend: 'up' },
    { rank: 3, name: 'Charlie Dave', level: 10, totalXp: 6800, trend: 'down' },
    { rank: 4, name: 'Diana Ross', level: 9, totalXp: 6100, trend: 'stable' },
    { rank: 5, name: 'Edward King', level: 8, totalXp: 5400, trend: 'up' },
];

const MOCK_LEADERBOARD_ALL_TIME: LeaderboardEntry[] = [
    { rank: 1, name: 'Bob Smith', level: 15, totalXp: 15200, trend: 'up' },
    { rank: 2, name: 'Alice Wilson', level: 14, totalXp: 14800, trend: 'stable' },
    { rank: 3, name: 'Charlie Dave', level: 13, totalXp: 12400, trend: 'down' },
    { rank: 4, name: 'Fiona Apple', level: 12, totalXp: 11200, trend: 'stable' },
    { rank: 5, name: 'George Harrison', level: 12, totalXp: 10800, trend: 'up' },
];

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
    entries: [],
    userRank: null,
    timeframe: 'weekly',
    isLoading: false,

    setTimeframe: (timeframe) => {
        set({ timeframe });
        const { fetchLeaderboard } = useLeaderboardStore.getState();
        fetchLeaderboard(timeframe);
    },

    fetchLeaderboard: async (timeframe) => {
        set({ isLoading: true });
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const data = timeframe === 'weekly' ? MOCK_LEADERBOARD_WEEKLY : MOCK_LEADERBOARD_ALL_TIME;

        set({
            entries: data,
            isLoading: false,
            userRank: { rank: 12, name: 'You', level: 4, totalXp: 1250, isCurrentUser: true, trend: 'up' }
        });
    }
}));
