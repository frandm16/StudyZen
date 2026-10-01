import { api } from './api';
import type { Deadline, CreateDeadlineDTO } from '../types/deadline';

export type DeadlinePatch = Partial<Pick<CreateDeadlineDTO, 'title' | 'description' | 'urgency' | 'dueDate' | 'allDay' | 'isCompleted'>>;

export const deadlineService = {
    getAll: async (start?: string, end?: string): Promise<Deadline[]> => {
        const response = await api.get<Deadline[]>('/deadlines', { params: { start, end } });
        return response.data;
    },

    getById: async (id: number): Promise<Deadline> => {
        const response = await api.get<Deadline>(`/deadlines/${id}`);
        return response.data;
    },

    create: async (deadline: CreateDeadlineDTO): Promise<Deadline> => {
        const response = await api.post<Deadline>('/deadlines', deadline);
        return response.data;
    },

    update: async (id: number, deadline: CreateDeadlineDTO): Promise<Deadline> => {
        const response = await api.put<Deadline>(`/deadlines/${id}`, deadline);
        return response.data;
    },

    patch: async (id: number, changes: DeadlinePatch): Promise<Deadline> => {
        const response = await api.patch<Deadline>(`/deadlines/${id}`, changes);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/deadlines/${id}`);
    },
};