export interface TodoItem {
    id: number;
    date: string;
    text: string;
    isCompleted: boolean;
}
export interface CreateTodoDTO {
    date: string;
    text: string
}

export interface UpdateTodoDTO {
    date?: string;
    text?: string;
    completed?: boolean
}