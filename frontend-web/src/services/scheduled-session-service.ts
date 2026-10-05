import { api } from './api';
import { normalizeScheduledSession } from '../lib/api-flags';
import { formatApiTimestamp, formatRequiredApiTimestamp } from '../lib/api-datetime';
import type { ScheduledSession, CreateScheduledSessionDTO } from '../types/scheduled-session';

function formatDates(session: CreateScheduledSessionDTO): CreateScheduledSessionDTO {
    return {
        ...session,
        startedAt: formatRequiredApiTimestamp(session.startedAt),
        endedAt: formatRequiredApiTimestamp(session.endedAt),
    };
}

function formatPatch(changes: Partial<Pick<CreateScheduledSessionDTO, 'title' | 'startedAt' | 'endedAt'>>) {
    return Object.fromEntries(Object.entries(changes)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, key === 'startedAt' || key === 'endedAt'
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
    create: async (session: CreateScheduledSessionDTO): Promise<ScheduledSession> => {
        const response = await api.post<unknown>('/scheduled', formatDates(session));
        return normalizeScheduledSession(response.data);
    },
    update: async (id: number, session: CreateScheduledSessionDTO): Promise<ScheduledSession> => {
        const response = await api.put<unknown>(`/scheduled/${id}`, formatDates(session));
        return normalizeScheduledSession(response.data);
    },
    patch: async (id: number, changes: Partial<Pick<CreateScheduledSessionDTO, 'title' | 'startedAt' | 'endedAt'>>): Promise<ScheduledSession> => {
        const response = await api.patch<unknown>(`/scheduled/${id}`, formatPatch(changes));
        return normalizeScheduledSession(response.data);
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/scheduled/${id}`);
    },
};