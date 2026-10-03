import { api } from './api';
import { normalizeScheduledSession } from '../lib/api-flags';
import { formatApiTimestamp, formatRequiredApiTimestamp } from '../lib/api-datetime';
import type { ScheduledSession, ScheduledSessionDTO } from '../types/scheduled-session';

function formatDates(session: ScheduledSessionDTO): ScheduledSessionDTO {
    return {
        ...session,
        startDate: formatRequiredApiTimestamp(session.startDate),
        endDate: formatRequiredApiTimestamp(session.endDate),
    };
}

function formatPatch(changes: Partial<Pick<ScheduledSessionDTO, 'title' | 'startDate' | 'endDate'>>) {
    return Object.fromEntries(Object.entries(changes)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, key === 'startDate' || key === 'endDate'
            ? formatApiTimestamp(value as string)
            : value]));
}

export const scheduledSessionService = {
    getAll: async (start?: string, end?: string): Promise<ScheduledSession[]> => {
        const response = await api.get<unknown[]>('/scheduled', { params: {
            start: start ? formatApiTimestamp(start) : undefined,
            end: end ? formatApiTimestamp(end) : undefined,
        } });
        return response.data.map(normalizeScheduledSession);
    },
    getById: async (id: number): Promise<ScheduledSession> => {
        const response = await api.get<unknown>(`/scheduled/${id}`);
        return normalizeScheduledSession(response.data);
    },
    create: async (session: ScheduledSessionDTO): Promise<ScheduledSession> => {
        const response = await api.post<unknown>('/scheduled', formatDates(session));
        return normalizeScheduledSession(response.data);
    },
    update: async (id: number, session: ScheduledSessionDTO): Promise<ScheduledSession> => {
        const response = await api.put<unknown>(`/scheduled/${id}`, formatDates(session));
        return normalizeScheduledSession(response.data);
    },
    patch: async (id: number, changes: Partial<Pick<ScheduledSessionDTO, 'title' | 'startDate' | 'endDate'>>): Promise<ScheduledSession> => {
        const response = await api.patch<unknown>(`/scheduled/${id}`, formatPatch(changes));
        return normalizeScheduledSession(response.data);
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/scheduled/${id}`);
    },
};