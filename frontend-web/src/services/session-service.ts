import { api } from './api';
import type { Session, CreateSessionDTO } from '../types/session';

export const sessionService = {
    getAll: async (params?: { tag?: string; task?: string; page?: number; size?: number }): Promise<Session[]> => {
        const res = await api.get<Session[]>('/sessions', { params });
        return res.data;
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<Session[]> => {
        const res = await api.get<Session[]>('/sessions/range', {
            params: { start: startDate, end: endDate },
        });
        return res.data;
    },

    getById: async (id: number): Promise<Session> => {
        const res = await api.get<Session>(`/sessions/${id}`);
        return res.data;
    },

    create: async (sessionData: CreateSessionDTO): Promise<Session> => {
        const res = await api.post<Session>('/sessions', sessionData);
        return res.data;
    },

    updateRating: async (id: number, rating: number): Promise<Session> => {
        const res = await api.patch<Session>(`/sessions/${id}`, { rating });
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/sessions/${id}`);
    },
};