import { api } from './api';
import type { CalendarFeedInfo } from '../types/calendar';

export const calendarService = {
    async getFeedInfo(): Promise<CalendarFeedInfo> {
        const { data } = await api.get<CalendarFeedInfo>('/calendar/feed-info');
        return data;
    },

    async regenerateFeedToken(): Promise<CalendarFeedInfo> {
        const { data } = await api.post<CalendarFeedInfo>('/calendar/feed-token/regenerate');
        return data;
    },

    async downloadIcs(token: string, subjectId?: number, filename = 'studyzen-calendar.ics'): Promise<void> {
        const url = `/api/calendar/feed/${token}.ics${subjectId ? `?subjectId=${subjectId}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to download calendar feed');
        }
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    },
};
