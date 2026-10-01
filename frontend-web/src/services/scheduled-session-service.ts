import { api } from './api';
import type { ScheduledSession, ScheduledSessionDTO } from '../types/scheduled-session';

export const scheduledSessionService = {
    getAll: async (start?: string, end?: string): Promise<ScheduledSession[]> => {
        const response = await api.get<ScheduledSession[]>('/scheduled', { params: { start, end } });
        return response.data;
    },
    getById: async (id: number): Promise<ScheduledSession> => {
        const response = await api.get<ScheduledSession>(`/scheduled/${id}`);
        return response.data;
    },
    create: async (session: ScheduledSessionDTO): Promise<ScheduledSession> => {
        const response = await api.post<ScheduledSession>('/scheduled', session);
        return response.data;
    },
    update: async (id: number, session: ScheduledSessionDTO): Promise<ScheduledSession> => {
        const response = await api.put<ScheduledSession>(`/scheduled/${id}`, session);
        return response.data;
    },
    patch: async (id: number, changes: Partial<Pick<ScheduledSessionDTO, 'title' | 'startDate' | 'endDate'>>): Promise<ScheduledSession> => {
        const response = await api.patch<ScheduledSession>(`/scheduled/${id}`, changes);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/scheduled/${id}`);
    },
};