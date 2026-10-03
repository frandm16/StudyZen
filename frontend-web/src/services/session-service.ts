import { api } from './api';
import { normalizeSession } from '../lib/api-flags';
import { formatApiTimestamp, formatRequiredApiTimestamp } from '../lib/api-datetime';
import type { Session, CreateSessionDTO, SessionQuery } from '../types/session';

function formatSessionDates(session: CreateSessionDTO): CreateSessionDTO {
    return {
        ...session,
        startDate: formatRequiredApiTimestamp(session.startDate),
        endDate: formatRequiredApiTimestamp(session.endDate),
    };
}

export const sessionService = {
    getAll: async (params?: SessionQuery): Promise<Session[]> => {
        const query = params ? {
            ...params,
            start: params.start ? formatApiTimestamp(params.start) ?? undefined : undefined,
            end: params.end ? formatApiTimestamp(params.end) ?? undefined : undefined,
        } : undefined;
        const res = await api.get<unknown[]>('/sessions', { params: query });
        return res.data.map(normalizeSession);
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<Session[]> => {
        const res = await api.get<Session[]>('/sessions/range', {
            params: { start: formatApiTimestamp(startDate), end: formatApiTimestamp(endDate) },
        });
        return res.data.map(normalizeSession);
    },

    getById: async (id: number): Promise<Session> => {
        const res = await api.get<unknown>(`/sessions/${id}`);
        return normalizeSession(res.data);
    },

    create: async (sessionData: CreateSessionDTO): Promise<Session> => {
        const res = await api.post<unknown>('/sessions', formatSessionDates(sessionData));
        return normalizeSession(res.data);
    },

    update: async (id: number, sessionData: CreateSessionDTO): Promise<Session> => {
        const res = await api.put<unknown>(`/sessions/${id}`, formatSessionDates(sessionData));
        return normalizeSession(res.data);
    },

    updateRating: async (id: number, rating: number): Promise<Session> => {
        const res = await api.patch<unknown>(`/sessions/${id}`, { rating });
        return normalizeSession(res.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/sessions/${id}`);
    },
};