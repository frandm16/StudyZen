import { api } from './api';
import type { DayNote } from '../types/day-note';

export const dayNoteService = {
    getAll: async (): Promise<DayNote[]> => {
        const response = await api.get<DayNote[]>('/notes');
        return response.data;
    },

    getById: async (id: number): Promise<DayNote> => {
        const response = await api.get<DayNote>(`/notes/${id}`);
        return response.data;
    },

    create: async (note: Pick<DayNote, 'date' | 'content'>): Promise<DayNote> => {
        const response = await api.post<DayNote>('/notes', note);
        return response.data;
    },

    update: async (id: number, note: Partial<Pick<DayNote, 'date' | 'content'>>): Promise<DayNote> => {
        const response = await api.put<DayNote>(`/notes/${id}`, note);
        return response.data;
    },

    patch: async (id: number, content: string): Promise<DayNote> => {
        const response = await api.patch<DayNote>(`/notes/${id}`, { content });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/notes/${id}`);
    },
};