import { addDays, dateKey, startOfWeek } from './planner-dates';

export const WEEK_GRID_START_HOUR = 8;
export const WEEK_GRID_END_HOUR = 21;
export const WEEK_GRID_HOUR_HEIGHT = 64;
export const WEEK_GRID_MINUTES = (WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR) * 60;
export const WEEK_GRID_HEIGHT = (WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR) * WEEK_GRID_HOUR_HEIGHT;
export const WEEK_GRID_SNAP_MINUTES = 15;

export interface GridSelection {
    date: Date;
    startMinutes: number;
    endMinutes: number;
}

export function gridMinutesFromPointer(clientY: number, bounds: DOMRect): number {
    const raw = ((clientY - bounds.top) / bounds.height) * WEEK_GRID_MINUTES;
    const snapped = Math.round(raw / WEEK_GRID_SNAP_MINUTES) * WEEK_GRID_SNAP_MINUTES;
    return Math.max(0, Math.min(WEEK_GRID_MINUTES, snapped));
}

export function buildGridSelection(date: Date, first: number, second: number): GridSelection {
    const startMinutes = Math.min(first, second);
    const endMinutes = Math.max(first, second);
    const clampedStart = Math.min(startMinutes, WEEK_GRID_MINUTES - WEEK_GRID_SNAP_MINUTES);
    return {
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        startMinutes: clampedStart,
        endMinutes: Math.min(WEEK_GRID_MINUTES, Math.max(clampedStart + WEEK_GRID_SNAP_MINUTES, endMinutes)),
    };
}

export function selectionTimestamps(selection: GridSelection): { startedAt: string; endedAt: string } {
    const startAt = WEEK_GRID_START_HOUR * 60 + selection.startMinutes;
    const endAt = WEEK_GRID_START_HOUR * 60 + Math.min(selection.endMinutes, WEEK_GRID_MINUTES);
    const endDate = endAt >= 24 * 60 ? addDays(selection.date, 1) : selection.date;
    const formatTime = (value: number) => `${String(Math.floor(value / 60) % 24).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}:00`;
    return {
        startedAt: `${dateKey(selection.date)}T${formatTime(startAt)}`,
        endedAt: `${dateKey(endDate)}T${formatTime(endAt)}`,
    };
}

export function weekGridDates(date: Date, weekStartsOn: number): Date[] {
    const start = startOfWeek(date, weekStartsOn);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}
