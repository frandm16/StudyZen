import { api } from './api';
import { normalizeSubject } from '../lib/api-flags';
import type { Subject, CreateSubjectDTO, UpdateSubjectDTO } from '../types/subject';

export const subjectService = {
    getActive: async (termId?: number): Promise<Subject[]> => {
        const res = await api.get<unknown[]>('/subjects', { params: { termId } });
        return res.data.map(normalizeSubject);
    },

    getAll: async (): Promise<Subject[]> => {
        const res = await api.get<unknown[]>('/subjects/all');
        return res.data.map(normalizeSubject);
    },

    getFavorites: async (): Promise<Subject[]> => {
        const res = await api.get<unknown[]>('/subjects/favorites');
        return res.data.map(normalizeSubject);
    },

    getById: async (id: number): Promise<Subject> => {
        const res = await api.get<unknown>(`/subjects/${id}`);
        return normalizeSubject(res.data);
    },

    create: async (subject: CreateSubjectDTO): Promise<Subject> => {
        const res = await api.post<unknown>('/subjects', subject);
        return normalizeSubject(res.data);
    },

    toggleFavorite: async (id: number): Promise<Subject> => {
        const subject = await subjectService.getById(id);
        return subjectService.update(id, { isFavorite: !subject.isFavorite });
    },

    toggleArchive: async (id: number): Promise<Subject> => {
        const subject = await subjectService.getById(id);
        return subjectService.update(id, { isArchived: !subject.isArchived });
    },

    update: async (id: number, changes: UpdateSubjectDTO): Promise<Subject> => {
        const res = await api.patch<unknown>(`/subjects/${id}`, changes);
        return normalizeSubject(res.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/subjects/${id}`);
    },
};