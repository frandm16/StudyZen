export type GoalPeriod = 'daily' | 'weekly';

export interface StudyGoal {
    id: number;
    subjectId?: number | null;
    period: GoalPeriod;
    targetMinutes: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface StudyGoalDTO {
    subjectId?: number | null;
    period: GoalPeriod;
    targetMinutes: number;
}
