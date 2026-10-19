export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotification {
    id: number;
    type: NotificationType;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
}

export interface CreateNotificationDTO {
    type: NotificationType;
    title: string;
    body: string;
    read?: boolean;
}
