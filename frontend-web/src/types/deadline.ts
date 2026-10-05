export type DeadlineType = 'assignment' | 'exam' | 'project' | 'submission' | 'other';
export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface Deadline {
    id: number;
    title: string;
    description?: string;
    type: DeadlineType;
    urgency: UrgencyLevel;
    dueAt: string;
    allDay: boolean;
    isCompleted: boolean;
    completedAt?: string;
    subjectId?: number;
    topicId?: number;
}

export interface CreateDeadlineDTO {
    title: string;
    description?: string;
    type: DeadlineType;
    urgency: UrgencyLevel;
    dueAt: string;
    allDay: boolean;
    subjectId?: number;
    topicId?: number;
    isCompleted?: boolean;
}

export interface UpdateDeadlineDTO {
    title?: string;
    description?: string;
    type?: DeadlineType;
    urgency?: UrgencyLevel;
    dueAt?: string;
    allDay?: boolean;
    isCompleted?: boolean;
}