import { api } from './api';
import { normalizeTag } from '../lib/api-flags';
import type { Tag } from '../types/tag';

export const tagService = {
    getAll: async (): Promise<Tag[]> => {
        const res = await api.get<unknown[]>('/tags');
        return res.data.map(normalizeTag);
    },

    getAllIncludingArchived: async (): Promise<Tag[]> => {
        const res = await api.get<unknown[]>('/tags/all');
        return res.data.map(normalizeTag);
    },

    getFavorites: async (): Promise<Tag[]> => {
        const res = await api.get<unknown[]>('/tags/favorites');
        return res.data.map(normalizeTag);
    },

    getById: async (id: number): Promise<Tag> => {
        const res = await api.get<unknown>(`/tags/${id}`);
        return normalizeTag(res.data);
    },

    create: async (tag: { name: string; color: string }): Promise<Tag> => {
        const res = await api.post<unknown>('/tags', tag);
        return normalizeTag(res.data);
    },

    toggleFavorite: async (id: number): Promise<Tag> => {
        const tag = await tagService.getById(id);
        return tagService.update(id, { isFavorite: !tag.isFavorite });
    },

    toggleArchive: async (id: number): Promise<Tag> => {
        const tag = await tagService.getById(id);
        return tagService.update(id, { isArchived: !tag.isArchived });
    },

    update: async (id: number, changes: Partial<Pick<Tag, 'name' | 'color' | 'isArchived' | 'isFavorite'>>): Promise<Tag> => {
        const res = await api.patch<unknown>(`/tags/${id}`, changes);
        return normalizeTag(res.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/tags/${id}`);
    },
};
