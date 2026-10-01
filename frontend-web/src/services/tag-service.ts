import { api } from './api';
import type { Tag } from '../types/tag';

export const tagService = {
    getAll: async (): Promise<Tag[]> => {
        const res = await api.get<Tag[]>('/tags');
        return res.data;
    },

    getAllIncludingArchived: async (): Promise<Tag[]> => {
        const res = await api.get<Tag[]>('/tags/all');
        return res.data;
    },

    getFavorites: async (): Promise<Tag[]> => {
        const res = await api.get<Tag[]>('/tags/favorites');
        return res.data;
    },

    getById: async (id: number): Promise<Tag> => {
        const res = await api.get<Tag>(`/tags/${id}`);
        return res.data;
    },

    create: async (tag: { name: string; color: string }): Promise<Tag> => {
        const res = await api.post<Tag>('/tags', tag);
        return res.data;
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
        const res = await api.patch<Tag>(`/tags/${id}`, changes);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/tags/${id}`);
    },
};
