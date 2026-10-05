export interface ScheduledSession {
    id: number;
    title?: string;
    startedAt: string;
    endedAt: string;
    topicId: number;
}

export interface CreateScheduledSessionDTO {
    topicId: number;
    title?: string;
    startedAt: string;
    endedAt: string;
}
