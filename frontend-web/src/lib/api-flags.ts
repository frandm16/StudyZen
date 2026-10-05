import type { Deadline } from '../types/deadline';
import type { Session } from '../types/session';
import type { ScheduledSession } from '../types/scheduled-session';
import type { Subject } from '../types/subject';
import type { Topic } from '../types/topic';
import type { TodoItem } from '../types/todo-item';
import type { DayNote } from '../types/day-note';
import { parseApiTimestamp } from './api-datetime';

type WireObject = Record<string, unknown>;

function object(value: unknown): WireObject {
    return value !== null && typeof value === 'object' ? value as WireObject : {};
}

function flag(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    return typeof value === 'string' && value.toLowerCase() === 'true';
}

function readAlias(value: unknown, canonical: string, alias: string): boolean {
    const data = object(value);
    return flag(data[canonical] ?? data[alias]);
}

export function readArchived(value: unknown): boolean {
    return readAlias(value, 'isArchived', 'archived');
}

export function readFavorite(value: unknown): boolean {
    return readAlias(value, 'isFavorite', 'favorite');
}

export function readCompleted(value: unknown): boolean {
    return readAlias(value, 'isCompleted', 'completed');
}

export function normalizeSubject(value: unknown): Subject {
    const data = object(value);
    return {
        id: Number(data.id),
        name: String(data.name ?? ''),
        color: String(data.color ?? ''),
        notes: typeof data.notes === 'string' ? data.notes : undefined,
        termId: data.termId ? Number(data.termId) : undefined,
        isArchived: readArchived(data),
        isFavorite: readFavorite(data),
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    };
}

export function normalizeTopic(value: unknown): Topic {
    const data = object(value);
    return {
        id: Number(data.id),
        name: String(data.name ?? ''),
        subjectId: Number(data.subjectId),
        description: typeof data.description === 'string' ? data.description : undefined,
        status: String(data.status ?? 'not_started') as any,
        confidence: data.confidence ? Number(data.confidence) : undefined,
        sortOrder: Number(data.sortOrder ?? 0),
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    };
}

export function normalizeTodo(value: unknown): TodoItem {
    const data = object(value);
    return {
        id: Number(data.id),
        date: String(data.date ?? ''),
        text: String(data.text ?? ''),
        isCompleted: readCompleted(data),
        subjectId: data.subjectId ? Number(data.subjectId) : undefined,
        topicId: data.topicId ? Number(data.topicId) : undefined,
        completedAt: typeof data.completedAt === 'string' ? data.completedAt : undefined,
    };
}

export function normalizeStudySession(value: unknown): Session {
    const data = object(value);
    return {
        id: Number(data.id),
        topicId: Number(data.topicId),
        title: String(data.title ?? ''),
        description: typeof data.description === 'string' ? data.description : undefined,
        totalMinutes: Number(data.totalMinutes ?? 0),
        startedAt: parseApiTimestamp(String(data.startedAt ?? '')) ?? '',
        endedAt: parseApiTimestamp(String(data.endedAt ?? '')) ?? '',
        focusRating: data.focusRating ? Number(data.focusRating) : undefined,
        pausedMinutes: data.pausedMinutes ? Number(data.pausedMinutes) : undefined,
        scheduledSessionId: data.scheduledSessionId ? Number(data.scheduledSessionId) : undefined,
    };
}

export function normalizeDeadlineV2(value: unknown): Deadline {
    const data = object(value);
    return {
        id: Number(data.id),
        title: String(data.title ?? ''),
        description: typeof data.description === 'string' ? data.description : undefined,
        type: String(data.type ?? 'assignment') as any,
        urgency: String(data.urgency ?? 'medium') as any,
        dueAt: parseApiTimestamp(String(data.dueAt ?? '')) ?? '',
        allDay: flag(data.allDay),
        isCompleted: readCompleted(data),
        completedAt: typeof data.completedAt === 'string' ? data.completedAt : undefined,
        subjectId: data.subjectId ? Number(data.subjectId) : undefined,
        topicId: data.topicId ? Number(data.topicId) : undefined,
    };
}

export function normalizeDayNote(value: unknown): DayNote {
    const data = object(value);
    return {
        id: Number(data.id),
        date: String(data.date ?? ''),
        content: String(data.content ?? ''),
    };
}

export function normalizeTodoItem(value: unknown): TodoItem {
    const data = object(value);
    return {
        id: Number(data.id),
        date: String(data.date ?? ''),
        text: String(data.text ?? ''),
        isCompleted: readCompleted(data),
        subjectId: data.subjectId ? Number(data.subjectId) : undefined,
        topicId: data.topicId ? Number(data.topicId) : undefined,
        completedAt: typeof data.completedAt === 'string' ? data.completedAt : undefined,
    };
}

export function normalizeScheduledSession(value: unknown): ScheduledSession {
    const data = object(value);
    return {
        id: Number(data.id),
        title: typeof data.title === 'string' ? data.title : undefined,
        startedAt: parseApiTimestamp(String(data.startedAt ?? '')) ?? '',
        endedAt: parseApiTimestamp(String(data.endedAt ?? '')) ?? '',
        topicId: Number(data.topicId),
    };
}