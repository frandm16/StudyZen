export interface TodoItem {
    id: number;
    date: string;
    text: string;
    isCompleted: boolean;
    subjectId?: number;
    topicId?: number;
    completedAt?: string;
}

export interface CreateTodoDTO {
    date: string;
    text: string;
    subjectId?: number;
    topicId?: number;
}

export interface UpdateTodoDTO {
    date?: string;
    text?: string;
    isCompleted?: boolean;
    subjectId?: number;
    topicId?: number;
}