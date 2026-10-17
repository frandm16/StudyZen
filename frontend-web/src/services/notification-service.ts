import { api } from './api';
import type { AppNotification, CreateNotificationDTO } from '../types/notification';

export const notificationService = {
    getAll: async (): Promise<AppNotification[]> => {
        const response = await api.get<AppNotification[]>('/notifications');
        return response.data;
    },
    getUnreadCount: async (): Promise<number> => {
        const response = await api.get<{ count: number }>('/notifications/unread-count');
        return response.data.count;
    },
    create: async (notification: CreateNotificationDTO): Promise<AppNotification> => {
        const response = await api.post<AppNotification>('/notifications', notification);
        return response.data;
    },
    markRead: async (id: number): Promise<void> => {
        await api.patch(`/notifications/${id}/read`);
    },
    markAllRead: async (): Promise<void> => {
        await api.post('/notifications/read-all');
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/notifications/${id}`);
    },
};
