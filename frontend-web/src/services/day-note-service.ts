import { api } from './api';
import { normalizeDayNote } from '../lib/api-flags';
import type { DayNote, CreateDayNoteDTO, UpdateDayNoteDTO } from '../types/day-note';

export const dayNoteService = {
    getAll: async (): Promise<DayNote[]> => {
        const response = await api.get<unknown[]>('/notes');
        return response.data.map(normalizeDayNote);
    },

    getById: async (id: number): Promise<DayNote> => {
        const response = await api.get<unknown>(`/notes/${id}`);
        return normalizeDayNote(response.data);
    },

    create: async (dayNote: CreateDayNoteDTO): Promise<DayNote> => {
        const response = await api.post<unknown>('/notes', dayNote);
        return normalizeDayNote(response.data);
    },

    update: async (id: number, dayNote: UpdateDayNoteDTO): Promise<DayNote> => {
        const response = await api.put<unknown>(`/notes/${id}`, dayNote);
        return normalizeDayNote(response.data);
    },

    patch: async (id: number, changes: Partial<UpdateDayNoteDTO>): Promise<DayNote> => {
        const response = await api.patch<unknown>(`/notes/${id}`, changes);
        return normalizeDayNote(response.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/notes/${id}`);
    },
};