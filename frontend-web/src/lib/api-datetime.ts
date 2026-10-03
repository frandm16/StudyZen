const LOCAL_TIMESTAMP = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?(?:\.\d+)?$/;
const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;
const OFFSET_TIMESTAMP = /(?:Z|[+-]\d{2}:?\d{2})$/i;

function pad(value: number) {
    return String(value).padStart(2, '0');
}

function formatLocalDate(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatLocalTime(date: Date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatApiTimestamp(value: string | Date | null | undefined): string | null {
    if (value == null) return null;
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) throw new RangeError('Invalid date');
        return `${formatLocalDate(value)} ${formatLocalTime(value)}`;
    }

    const timestamp = value.trim();
    if (!timestamp) return null;
    if (LOCAL_DATE.test(timestamp)) return `${timestamp} 00:00:00`;

    const localMatch = timestamp.match(LOCAL_TIMESTAMP);
    if (localMatch) return `${localMatch[1]} ${localMatch[2]}:${localMatch[3] ?? '00'}`;

    if (OFFSET_TIMESTAMP.test(timestamp)) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) throw new RangeError(`Invalid timestamp: ${value}`);
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    }

    throw new RangeError(`Unsupported timestamp: ${value}`);
}

export function formatRequiredApiTimestamp(value: string | Date): string {
    const formatted = formatApiTimestamp(value);
    if (!formatted) throw new RangeError('Timestamp is required');
    return formatted;
}

export function parseApiTimestamp(value: string | null | undefined): string | null {
    if (value == null || !value.trim()) return null;
    const timestamp = value.trim();
    if (LOCAL_DATE.test(timestamp)) return `${timestamp}T00:00:00`;
    const localMatch = timestamp.match(LOCAL_TIMESTAMP);
    if (localMatch) return `${localMatch[1]}T${localMatch[2]}:${localMatch[3] ?? '00'}`;

    if (OFFSET_TIMESTAMP.test(timestamp)) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return null;
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    }

    return null;
}
