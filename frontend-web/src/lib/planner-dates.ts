export function dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return dateKey(date) === value ? date : null;
}

export function startOfWeek(date: Date, weekStartsOn: number): Date {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStart = ((weekStartsOn % 7) + 7) % 7;
    start.setDate(start.getDate() - (start.getDay() - normalizedStart + 7) % 7);
    return start;
}

export function addDays(date: Date, amount: number): Date {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() + amount);
    return result;
}

export function weekDates(date: Date, weekStartsOn: number): Date[] {
    const start = startOfWeek(date, weekStartsOn);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function monthDates(date: Date): Date[] {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const start = startOfWeek(first, 0);
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const end = addDays(last, 6 - last.getDay());
    const result: Date[] = [];
    for (let day = start; day <= end; day = addDays(day, 1)) result.push(day);
    return result;
}

export function localDateFromTimestamp(value: string | undefined): Date | null {
    if (!value) return null;
    const date = new Date(value.replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? null : date;
}

export function dateKeyFromTimestamp(value: string | undefined): string | null {
    const date = localDateFromTimestamp(value);
    return date ? dateKey(date) : null;
}

export function weekRange(date: Date, weekStartsOn: number): { start: Date; end: Date } {
    const start = startOfWeek(date, weekStartsOn);
    return { start, end: addDays(start, 7) };
}
