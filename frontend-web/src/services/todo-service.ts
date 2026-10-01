import { api } from './api';
import type { TodoItem, CreateTodoDTO, UpdateTodoDTO } from '../types/todo-item';


export const todoService = {
    getAll: async (date?: string): Promise<TodoItem[]> => {
        const response = await api.get<TodoItem[]>('/todos', { params: { date } });
        return response.data;
    },
    getById: async (id: number): Promise<TodoItem> => {
        const response = await api.get<TodoItem>(`/todos/${id}`);
        return response.data;
    },
    create: async (todo: CreateTodoDTO): Promise<TodoItem> => {
        const response = await api.post<TodoItem>('/todos', todo);
        return response.data;
    },
    update: async (id: number, todo: UpdateTodoDTO): Promise<TodoItem> => {
        const response = await api.put<TodoItem>(`/todos/${id}`, todo);
        return response.data;
    },
    patch: async (id: number, changes: Pick<UpdateTodoDTO, 'text' | 'completed'>): Promise<TodoItem> => {
        const response = await api.patch<TodoItem>(`/todos/${id}`, changes);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/todos/${id}`);
    },
};
