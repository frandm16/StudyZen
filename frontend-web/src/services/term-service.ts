import { api } from './api';
import { normalizeAcademicTerm } from '../lib/api-flags';
import type { AcademicTerm } from '../types/academic-term';

export const termService = {
    getActive: async (): Promise<AcademicTerm[]> => {
        const res = await api.get<unknown[]>('/terms');
        return res.data.map(normalizeAcademicTerm);
    },

    getAll: async (): Promise<AcademicTerm[]> => {
        const res = await api.get<unknown[]>('/terms/all');
        return res.data.map(normalizeAcademicTerm);
    },

    create: async (data: { name: string; startDate: string; endDate: string; isCurrent?: boolean }): Promise<AcademicTerm> => {
        const res = await api.post<unknown>('/terms', data);
        return normalizeAcademicTerm(res.data);
    },

    update: async (id: number, data: { name: string; startDate: string; endDate: string; isCurrent?: boolean }): Promise<AcademicTerm> => {
        const res = await api.put<unknown>(`/terms/${id}`, data);
        return normalizeAcademicTerm(res.data);
    },

    setCurrent: async (id: number): Promise<AcademicTerm> => {
        const res = await api.patch<unknown>(`/terms/${id}`, { isCurrent: true });
        return normalizeAcademicTerm(res.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/terms/${id}`);
    },
};
