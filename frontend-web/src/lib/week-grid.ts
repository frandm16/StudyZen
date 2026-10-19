import { addDays, dateKey, startOfWeek } from './planner-dates';

export const WEEK_GRID_START_HOUR = 0;
export const WEEK_GRID_END_HOUR = 24;
export const WEEK_GRID_HOUR_HEIGHT = 64;
export const WEEK_GRID_MINUTES = (WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR) * 60;
export const WEEK_GRID_HEIGHT = (WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR) * WEEK_GRID_HOUR_HEIGHT;
export const WEEK_GRID_SNAP_MINUTES = 15;

export interface GridSelection {
    date: Date;
    startMinutes: number;
    endMinutes: number;
}

export interface WeekGridInterval {
    key: string;
    startMinutes: number;
    endMinutes: number;
}

export interface WeekGridLayout extends WeekGridInterval {
    lane: number;
    laneCount: number;
    laneSpan: number;
}

export function getDisplayInterval(startMinutes: number, endMinutes: number): Pick<WeekGridInterval, 'startMinutes' | 'endMinutes'> {
    if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
        return { startMinutes, endMinutes };
    }
    return {
        startMinutes,
        endMinutes: Math.min(WEEK_GRID_MINUTES, Math.max(endMinutes, startMinutes + WEEK_GRID_SNAP_MINUTES)),
    };
}

export function layoutWeekGridIntervals<T extends WeekGridInterval>(intervals: T[]): (T & WeekGridLayout)[] {
    const sorted = intervals
        .filter((interval) => Number.isFinite(interval.startMinutes) && Number.isFinite(interval.endMinutes) && interval.endMinutes > interval.startMinutes)
        .slice()
        .sort((first, second) => first.startMinutes - second.startMinutes || second.endMinutes - first.endMinutes || first.key.localeCompare(second.key));
    const clusters: T[][] = [];
    let cluster: T[] = [];
    let clusterEnd = Number.NEGATIVE_INFINITY;

    for (const interval of sorted) {
        if (interval.startMinutes >= clusterEnd) {
            if (cluster.length > 0) clusters.push(cluster);
            cluster = [];
            clusterEnd = Number.NEGATIVE_INFINITY;
        }
        cluster.push(interval);
        clusterEnd = Math.max(clusterEnd, interval.endMinutes);
    }
    if (cluster.length > 0) clusters.push(cluster);

    return clusters.flatMap((connected) => {
        const assigned: Array<{ interval: T; lane: number }> = [];
        for (const interval of connected) {
            const occupied = new Set(assigned
                .filter(({ interval: placed }) => placed.startMinutes < interval.endMinutes && interval.startMinutes < placed.endMinutes)
                .map(({ lane }) => lane));
            let lane = 0;
            while (occupied.has(lane)) lane += 1;
            assigned.push({ interval, lane });
        }
        const laneCount = Math.max(...assigned.map(({ lane }) => lane + 1));
        return assigned.map(({ interval, lane }) => {
            let laneSpan = 1;
            for (let candidate = lane + 1; candidate < laneCount; candidate += 1) {
                const blocked = assigned.some(({ interval: placed, lane: placedLane }) => placedLane === candidate && placed.startMinutes < interval.endMinutes && interval.startMinutes < placed.endMinutes);
                if (blocked) break;
                laneSpan += 1;
            }
            return { ...interval, lane, laneCount, laneSpan };
        });
    });
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
