export interface Session {
    id: number;
    topicId: number;
    title: string;
    description?: string;
    totalMinutes: number;
    startedAt: string;
    endedAt: string;
    focusRating?: number;           // 0-5
    pausedMinutes?: number;
    scheduledSessionId?: number;
}

export interface CreateSessionDTO {
    title: string;
    description?: string;
    totalMinutes: number;
    startedAt: string;
    endedAt: string;
    topicId: number;
    focusRating?: number;
    pausedMinutes?: number;
}

export interface UpdateSessionDTO {
    title?: string;
    description?: string;
    totalMinutes?: number;
    startedAt?: string;
    endedAt?: string;
    focusRating?: number;
    pausedMinutes?: number;
}

export interface SessionQuery {
    start?: string;
    end?: string;
    topicId?: number;
    page?: number;
    size?: number;
}