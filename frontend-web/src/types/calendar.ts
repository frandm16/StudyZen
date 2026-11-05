export type CalendarView = 'day' | 'week' | 'month';

export type CalendarLayer = 'scheduled' | 'completed' | 'deadlines' | 'exams';

export interface CalendarFeedInfo {
    token: string;
    httpsUrl: string;
    webcalUrl: string;
}

export interface CalendarEventChip {
    id: string;
    originalId: number;
    kind: 'scheduled' | 'completed' | 'deadline' | 'assessment';
    title: string;
    timeLabel?: string;
    color: string;
    subjectColor?: string;
    completed?: boolean;
    subjectId?: number;
    subjectName?: string;
    dateKey: string;
    urgency?: string;
    rawItem: unknown;
}
