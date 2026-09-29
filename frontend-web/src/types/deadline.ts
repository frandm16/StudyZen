import type { Task } from './task';

export interface Deadline {
    id: number;
    title: string;
    description?: string;
    urgency: 'low' | 'medium' | 'high' | string;
    dueDate: string;
    allDay: boolean;
    isCompleted: boolean;
    task: Task;
}