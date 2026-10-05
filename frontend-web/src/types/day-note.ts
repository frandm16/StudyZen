export interface DayNote {
    id: number;
    date: string;
    content: string;
}

export interface CreateDayNoteDTO {
    date: string;
    content: string;
}

export interface UpdateDayNoteDTO {
    date?: string;
    content?: string;
}