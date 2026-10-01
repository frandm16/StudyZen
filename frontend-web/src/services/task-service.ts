import { api } from './api';
import type { Task, CreateTaskDTO } from '../types/task';

export const taskService = {
    getAll: async (tag?: string): Promise<Task[]> => {
        const response = await api.get<Task[]>('/tasks', { params: { tag } });
        return response.data;
    },
    getById: async (id: number): Promise<Task> => {
        const response = await api.get<Task>(`/tasks/${id}`);
        return response.data;
    },
    create: async (task: CreateTaskDTO): Promise<Task> => {
        const response = await api.post<Task>('/tasks', task);
        return response.data;
    },
    update: async (id: number, task: CreateTaskDTO & { name?: string }): Promise<Task> => {
        const response = await api.put<Task>(`/tasks/${id}`, task);
        return response.data;
    },
    patch: async (id: number, changes: { name?: string; tagName?: string; tagColor?: string }): Promise<Task> => {
        const response = await api.patch<Task>(`/tasks/${id}`, changes);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    },
};
