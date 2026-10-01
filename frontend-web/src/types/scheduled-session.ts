import type { Task } from './task';

export interface ScheduledSession {
    id: number;
    title?: string;
    startDate: string;
    endDate: string;
    task: Task;
}

export interface ScheduledSessionDTO {
    tagName: string;
    taskName: string;
    title?: string;
    startDate: string;
    endDate: string;
}