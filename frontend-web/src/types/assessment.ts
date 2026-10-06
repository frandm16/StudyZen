export type AssessmentType =
    | 'assignment'
    | 'exam'
    | 'quiz'
    | 'project'
    | 'presentation'
    | 'lab'
    | 'midterm'
    | 'final_exam'
    | 'other';

export interface Assessment {
    id: number;
    userId: string;
    subjectId: number;
    type: AssessmentType;
    title: string;
    description?: string;
    grade?: number | null;
    maxGrade: number;
    weightPercent: number;
    dueAt?: string | null;
    completed: boolean;
    completedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAssessmentDTO {
    subjectId: number;
    type: AssessmentType;
    title: string;
    description?: string;
    grade?: number | null;
    maxGrade: number;
    weightPercent: number;
    dueAt?: string | null;
}

export interface UpdateAssessmentDTO {
    type?: AssessmentType;
    title?: string;
    description?: string;
    grade?: number | null;
    maxGrade?: number;
    weightPercent?: number;
    dueAt?: string | null;
    isCompleted?: boolean;
}
