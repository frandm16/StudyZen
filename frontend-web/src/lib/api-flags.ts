import type { Deadline } from '../types/deadline';
import type { Session } from '../types/session';
import type { ScheduledSession } from '../types/scheduled-session';
import type { Tag } from '../types/tag';
import type { Task } from '../types/task';
import type { TodoItem } from '../types/todo-item';
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

export function normalizeTag(value: unknown): Tag {
    const data = object(value);
    return {
        id: Number(data.id),
        name: String(data.name ?? ''),
        color: String(data.color ?? ''),
        isArchived: readArchived(data),
        isFavorite: readFavorite(data),
    };
}

export function normalizeTask(value: unknown): Task {
    const data = object(value);
    return {
        id: Number(data.id),
        name: String(data.name ?? ''),
        tag: normalizeTag(data.tag),
    };
}

export function normalizeTodo(value: unknown): TodoItem {
    const data = object(value);
    return {
        id: Number(data.id),
        date: String(data.date ?? ''),
        text: String(data.text ?? ''),
        isCompleted: readCompleted(data),
    };
}

export function normalizeSession(value: unknown): Session {
    const data = object(value);
    return {
        id: Number(data.id),
        title: String(data.title ?? ''),
        description: typeof data.description === 'string' ? data.description : undefined,
        totalMinutes: Number(data.totalMinutes ?? 0),
        startDate: parseApiTimestamp(String(data.startDate ?? '')) ?? '',
        endDate: parseApiTimestamp(String(data.endDate ?? '')) ?? '',
        rating: Number(data.rating ?? 0),
        task: normalizeTask(data.task),
    };
}

export function normalizeDeadline(value: unknown): Deadline {
    const data = object(value);
    return {
        id: Number(data.id),
        title: String(data.title ?? ''),
        description: typeof data.description === 'string' ? data.description : undefined,
        urgency: String(data.urgency ?? 'medium'),
        dueDate: parseApiTimestamp(String(data.dueDate ?? '')) ?? '',
        allDay: flag(data.allDay),
        isCompleted: readCompleted(data),
        task: normalizeTask(data.task),
    };
}

export function normalizeScheduledSession(value: unknown): ScheduledSession {
    const data = object(value);
    return {
        id: Number(data.id),
        title: typeof data.title === 'string' ? data.title : undefined,
        startDate: parseApiTimestamp(String(data.startDate ?? '')) ?? '',
        endDate: parseApiTimestamp(String(data.endDate ?? '')) ?? '',
        task: normalizeTask(data.task),
    };
}
