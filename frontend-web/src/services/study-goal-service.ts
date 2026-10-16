import { api } from './api';
import type { GoalPeriod, StudyGoal, StudyGoalDTO } from '../types/study-goal';

function normalize(raw: unknown): StudyGoal {
    const value = raw as Record<string, unknown>;
    const period = String(value.period ?? 'weekly').toLowerCase();
    return {
        id: Number(value.id),
        subjectId: value.subjectId == null ? null : Number(value.subjectId),
        period: (period === 'daily' ? 'daily' : 'weekly') as GoalPeriod,
        targetMinutes: Number(value.targetMinutes ?? 0),
        createdAt: value.createdAt as string | undefined,
        updatedAt: value.updatedAt as string | undefined,
    };
}

export const studyGoalService = {
    getAll: async (): Promise<StudyGoal[]> => {
        const response = await api.get<unknown[]>('/goals');
        return response.data.map(normalize);
    },
    create: async (goal: StudyGoalDTO): Promise<StudyGoal> => {
        const response = await api.post<unknown>('/goals', goal);
        return normalize(response.data);
    },
    update: async (id: number, goal: StudyGoalDTO): Promise<StudyGoal> => {
        const response = await api.put<unknown>(`/goals/${id}`, goal);
        return normalize(response.data);
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/goals/${id}`);
    },
};
