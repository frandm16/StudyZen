export interface AcademicTerm {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    isArchived: boolean;
    createdAt?: string;
    updatedAt?: string;
}
