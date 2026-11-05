export type EventKind = 'scheduled' | 'completed' | 'study' | 'deadline' | 'assessment' | 'exam';

export interface EventKindTheme {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    label: string;
}

export function getEventKindTheme(kind: EventKind): EventKindTheme {
    switch (kind) {
        case 'scheduled':
            return {
                backgroundColor: '#232f48',
                borderColor: '#4a6ca8',
                textColor: '#e6edfa',
                label: 'Scheduled',
            };
        case 'completed':
        case 'study':
            return {
                backgroundColor: '#18372f',
                borderColor: '#2e7462',
                textColor: '#d7f5ec',
                label: 'Studied',
            };
        case 'deadline':
            return {
                backgroundColor: '#3b2c1d',
                borderColor: '#8c6234',
                textColor: '#fef3c7',
                label: 'Deadline',
            };
        case 'assessment':
        case 'exam':
            return {
                backgroundColor: '#3d1d29',
                borderColor: '#8c3350',
                textColor: '#ffe4e9',
                label: 'Exam',
            };
    }
}
