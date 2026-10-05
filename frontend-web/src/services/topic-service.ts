import { api } from './api';
import { normalizeTopic } from '../lib/api-flags';
import type { Topic, CreateTopicDTO, UpdateTopicDTO } from '../types/topic';

export const topicService = {
    getAll: async (subjectId?: number): Promise<Topic[]> => {
        const response = await api.get<unknown[]>('/topics', { params: { subjectId } });
        return response.data.map(normalizeTopic);
    },

    getById: async (id: number): Promise<Topic> => {
        const response = await api.get<unknown>(`/topics/${id}`);
        return normalizeTopic(response.data);
    },

    create: async (topic: CreateTopicDTO): Promise<Topic> => {
        const response = await api.post<unknown>('/topics', topic);
        return normalizeTopic(response.data);
    },

    update: async (id: number, topic: UpdateTopicDTO): Promise<Topic> => {
        const response = await api.put<unknown>(`/topics/${id}`, topic);
        return normalizeTopic(response.data);
    },

    patch: async (id: number, changes: Partial<UpdateTopicDTO>): Promise<Topic> => {
        const response = await api.patch<unknown>(`/topics/${id}`, changes);
        return normalizeTopic(response.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/topics/${id}`);
    },
};