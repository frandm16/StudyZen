export type TopicStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface Topic {
    id: number;
    name: string;
    subjectId: number;
    description?: string;
    status: TopicStatus;
    confidence?: number;
    sortOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTopicDTO {
    name: string;
    subjectId: number;
    description?: string;
    status?: TopicStatus;
    confidence?: number;
    sortOrder?: number;
}

export interface UpdateTopicDTO {
    name?: string;
    subjectId?: number;
    description?: string;
    status?: TopicStatus;
    confidence?: number;
    sortOrder?: number;
}