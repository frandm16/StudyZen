import { api } from './api';
import { normalizeStudySession } from '../lib/api-flags';
import { formatApiTimestamp, formatRequiredApiTimestamp } from '../lib/api-datetime';
import type { Session, CreateSessionDTO, SessionQuery } from '../types/session';

function formatSessionDates(session: CreateSessionDTO): CreateSessionDTO {
    return {
        ...session,
        startedAt: formatRequiredApiTimestamp(session.startedAt),
        endedAt: formatRequiredApiTimestamp(session.endedAt),
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
        return res.data.map(normalizeStudySession);
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<Session[]> => {
        const res = await api.get<Session[]>('/sessions/range', {
            params: { start: formatApiTimestamp(startDate), end: formatApiTimestamp(endDate) },
        });
        return res.data.map(normalizeStudySession);
    },

    getById: async (id: number): Promise<Session> => {
        const res = await api.get<unknown>(`/sessions/${id}`);
        return normalizeStudySession(res.data);
    },

    create: async (sessionData: CreateSessionDTO): Promise<Session> => {
        const res = await api.post<unknown>('/sessions', formatSessionDates(sessionData));
        return normalizeStudySession(res.data);
    },

    update: async (id: number, sessionData: CreateSessionDTO): Promise<Session> => {
        const res = await api.put<unknown>(`/sessions/${id}`, formatSessionDates(sessionData));
        return normalizeStudySession(res.data);
    },

    updateRating: async (id: number, focusRating: number): Promise<Session> => {
        const res = await api.patch<unknown>(`/sessions/${id}`, { focusRating });
        return normalizeStudySession(res.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/sessions/${id}`);
    },
};