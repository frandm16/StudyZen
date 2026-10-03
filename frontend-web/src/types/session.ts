import type { Tag } from './tag';

export interface Session {
    id: number;
    title: string;
    description?: string;
    totalMinutes: number;
    startDate: string;
    endDate: string;
    rating: number;           // 0-5

    task: {
        id: number;
        name: string;
        tag: Tag;
    };
}
export interface CreateSessionDTO {
    title: string;
    description?: string;
    totalMinutes: number;
    startDate: string;
    endDate: string;
    rating?: number;
    tagName: string;
    tagColor: string;
    taskName: string;
}

export interface SessionQuery {
    tag?: string;
    task?: string;
    start?: string;
    end?: string;
    page?: number;
    size?: number;
}