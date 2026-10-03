import { api } from './api';
import { normalizeTask } from '../lib/api-flags';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '../types/task';

export const taskService = {
    getAll: async (tag?: string): Promise<Task[]> => {
        const response = await api.get<unknown[]>('/tasks', { params: { tag } });
        return response.data.map(normalizeTask);
    },
    getById: async (id: number): Promise<Task> => {
        const response = await api.get<unknown>(`/tasks/${id}`);
        return normalizeTask(response.data);
    },
    create: async (task: CreateTaskDTO): Promise<Task> => {
        const response = await api.post<unknown>('/tasks', task);
        return normalizeTask(response.data);
    },
    update: async (id: number, task: UpdateTaskDTO): Promise<Task> => {
        const response = await api.put<unknown>(`/tasks/${id}`, task);
        return normalizeTask(response.data);
    },
    patch: async (id: number, changes: { name?: string; tagName?: string; tagColor?: string }): Promise<Task> => {
        const response = await api.patch<unknown>(`/tasks/${id}`, changes);
        return normalizeTask(response.data);
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    },
};
