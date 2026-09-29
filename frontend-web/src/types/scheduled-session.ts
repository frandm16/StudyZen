import type { Task } from './task';

export interface ScheduledSession {
    id: number;
    title?: string;
    startDate: string;
    endDate: string;
    task: Task;
}