import { api } from './api';
import { normalizeTodoItem } from '../lib/api-flags';
import type { TodoItem, CreateTodoDTO, UpdateTodoDTO } from '../types/todo-item';

export const todoService = {
    getAll: async (date?: string): Promise<TodoItem[]> => {
        const response = await api.get<unknown[]>('/todos', { params: { date } });
        return response.data.map(normalizeTodoItem);
    },

    getById: async (id: number): Promise<TodoItem> => {
        const response = await api.get<unknown>(`/todos/${id}`);
        return normalizeTodoItem(response.data);
    },

    create: async (todo: CreateTodoDTO): Promise<TodoItem> => {
        const response = await api.post<unknown>('/todos', todo);
        return normalizeTodoItem(response.data);
    },

    update: async (id: number, todo: UpdateTodoDTO): Promise<TodoItem> => {
        const response = await api.put<unknown>(`/todos/${id}`, todo);
        return normalizeTodoItem(response.data);
    },

    patch: async (id: number, changes: Partial<UpdateTodoDTO>): Promise<TodoItem> => {
        const response = await api.patch<unknown>(`/todos/${id}`, changes);
        return normalizeTodoItem(response.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/todos/${id}`);
    },
};