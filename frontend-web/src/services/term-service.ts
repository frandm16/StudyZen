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
};
