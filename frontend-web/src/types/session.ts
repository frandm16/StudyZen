export interface Session {
    id: number;
    title: string;
    description?: string;
    totalMinutes: number;
    startDate: string;
    endDate: string;
    rating: number;           // 0-5

    task: {
        id: number;
        name: string;
        tag: {
            id: number;
            name: string;
            color: string;
            isArchived: boolean;
            isFavorite: boolean;
        };
    };
}
export interface CreateSessionDTO {
    title: string;
    description?: string;
    totalMinutes: number;
    startDate: string;
    endDate: string;
    rating?: number;
    tagName: string;
    tagColor: string;
    taskName: string;
}