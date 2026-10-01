import { api } from './api';
import type { Tag } from '../types/tag';

export const tagService = {
    getAll: async (): Promise<Tag[]> => {
        const res = await api.get<Tag[]>('/tags');
        return res.data;
    },

    create: async (tag: { name: string; color: string }): Promise<Tag> => {
        const res = await api.post<Tag>('/tags', tag);
        return res.data;
    },

    toggleFavorite: async (id: number): Promise<Tag> => {
        const res = await api.patch<Tag>(`/tags/${id}/favorite`);
        return res.data;
    },

    toggleArchive: async (id: number): Promise<Tag> => {
        const res = await api.patch<Tag>(`/tags/${id}/archive`);
        return res.data;
    },
};