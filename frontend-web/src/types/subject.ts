export interface Subject {
    id: number;
    name: string;
    color: string;
    notes?: string;
    termId?: number;
    isArchived: boolean;
    isFavorite: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateSubjectDTO {
    name: string;
    color: string;
    notes?: string;
    termId?: number;
    isArchived?: boolean;
    isFavorite?: boolean;
}

export interface UpdateSubjectDTO {
    name?: string;
    color?: string;
    notes?: string;
    termId?: number;
    isArchived?: boolean;
    isFavorite?: boolean;
}