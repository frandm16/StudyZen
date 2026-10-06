import { api } from './api';
import type { Assessment, CreateAssessmentDTO, UpdateAssessmentDTO } from '../types/assessment';

function normalize(raw: unknown): Assessment {
    const r = raw as Record<string, unknown>;
    return {
        id: r.id as number,
        userId: r.userId as string,
        subjectId: r.subjectId as number,
        type: (r.type as Assessment['type']) ?? 'other',
        title: r.title as string,
        description: r.description as string | undefined,
        grade: r.grade as number | null | undefined,
        maxGrade: Number(r.maxGrade ?? 100),
        weightPercent: Number(r.weightPercent ?? 0),
        dueAt: r.dueAt as string | null | undefined,
        completed: Boolean(r.completed ?? r.isCompleted ?? false),
        completedAt: r.completedAt as string | null | undefined,
        createdAt: r.createdAt as string | undefined,
        updatedAt: r.updatedAt as string | undefined,
    };
}

export const assessmentService = {
    getBySubject: async (subjectId: number): Promise<Assessment[]> => {
        const res = await api.get<unknown[]>('/assessments', { params: { subjectId } });
        return res.data.map(normalize);
    },

    getAll: async (): Promise<Assessment[]> => {
        const res = await api.get<unknown[]>('/assessments');
        return res.data.map(normalize);
    },

    create: async (dto: CreateAssessmentDTO): Promise<Assessment> => {
        const res = await api.post<unknown>('/assessments', dto);
        return normalize(res.data);
    },

    update: async (id: number, dto: UpdateAssessmentDTO): Promise<Assessment> => {
        const res = await api.patch<unknown>(`/assessments/${id}`, dto);
        return normalize(res.data);
    },

    toggleComplete: async (a: Assessment): Promise<Assessment> => {
        const res = await api.patch<unknown>(`/assessments/${a.id}`, {
            isCompleted: !a.completed,
        });
        return normalize(res.data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/assessments/${id}`);
    },
};
