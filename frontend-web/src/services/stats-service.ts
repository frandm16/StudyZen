import { api } from './api';

export type Heatmap = Record<string, number>;
export type TagSummary = Record<string, number>;
export type WeeklyStats = Record<string, number>;
export type SessionStatsRow = Record<string, unknown>;

export const statsService = {
    getHeatmap: async (): Promise<Heatmap> => {
        const response = await api.get<Heatmap>('/stats/heatmap');
        return response.data;
    },
    getSummaryByTag: async (tag: string): Promise<TagSummary> => {
        const response = await api.get<TagSummary>('/stats/summary', { params: { tag } });
        return response.data;
    },
    getAllSessions: async (): Promise<SessionStatsRow[]> => {
        const response = await api.get<SessionStatsRow[]>('/stats/sessions/all');
        return response.data;
    },
    getWeekly: async (): Promise<WeeklyStats> => {
        const response = await api.get<WeeklyStats>('/stats/weekly');
        return response.data;
    },
};