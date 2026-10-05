import { api } from './api';
import { normalizeDeadlineV2 } from '../lib/api-flags';
import { formatApiTimestamp, formatRequiredApiTimestamp } from '../lib/api-datetime';
import type { Deadline, CreateDeadlineDTO } from '../types/deadline';

export type DeadlinePatch = Partial<Pick<CreateDeadlineDTO, 'title' | 'description' | 'urgency' | 'dueAt' | 'allDay' | 'isCompleted'>>;

function formatDates(deadline: CreateDeadlineDTO): CreateDeadlineDTO {
    return {
        ...deadline,
        dueAt: formatRequiredApiTimestamp(deadline.dueAt)
    };
}

function formatPatch(changes: DeadlinePatch): DeadlinePatch {
    return Object.fromEntries(Object.entries(changes)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, key === 'dueAt' ? formatApiTimestamp(value as string) : value])) as DeadlinePatch;
}

export const deadlineService = {
    getAll: async (start?: string, end?: string): Promise<Deadline[]> => {
        const response = await api.get<unknown[]>('/deadlines', { params: {
            start: start ? formatApiTimestamp(start) : undefined,
            end: end ? formatApiTimestamp(end) : undefined,
        } });
        return response.data.map(normalizeDeadlineV2);
    },

    getById: async (id: number): Promise<Deadline> => {
        const response = await api.get<unknown>(`/deadlines/${id}`);
        return normalizeDeadlineV2(response.data);
    },

    create: async (deadline: CreateDeadlineDTO): Promise<Deadline> => {
        const response = await api.post<unknown>('/deadlines', formatDates(deadline));
        return normalizeDeadlineV2(response.data);
    },

    update: async (id: number, deadline: CreateDeadlineDTO): Promise<Deadline> => {
        const response = await api.put<unknown>(`/deadlines/${id}`, formatDates(deadline));
        return normalizeDeadlineV2(response.data);
    },

    patch: async (id: number, changes: DeadlinePatch): Promise<Deadline> => {
        const response = await api.patch<unknown>(`/deadlines/${id}`, formatPatch(changes));
        return normalizeDeadlineV2(response.data);
    },

    toggle: async (id: number): Promise<Deadline> => {
        const response = await api.post<unknown>(`/deadlines/${id}/toggle`);
        return normalizeDeadlineV2(response.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/deadlines/${id}`);
    },
};