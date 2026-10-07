import type { Assessment, AssessmentType } from '../../types/assessment';
import type { TopicStatus } from '../../types/topic';

export const PALETTE = [
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#10b981',
    '#06b6d4',
    '#64748b',
];

export const ASSESSMENT_TYPE_PRESETS = [
    'Exam',
    'Midterm',
    'Final Exam',
    'Quiz',
    'Assignment',
    'Project',
    'Lab',
    'Presentation',
    'Essay',
    'Workshop',
    'Other',
] as const;

export const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] =
    ASSESSMENT_TYPE_PRESETS.map((preset) => ({
        value: preset.toLowerCase().replace(/\s+/g, '_') as AssessmentType,
        label: preset,
    }));

export const TOPIC_STATUS_CONFIG: Record<
    TopicStatus,
    { label: string; bg: string; text: string; border: string }
> = {
    not_started: {
        label: 'Not Started',
        bg: 'bg-neutral-500/10',
        text: 'text-neutral-400',
        border: 'border-neutral-500/20',
    },
    in_progress: {
        label: 'In Progress',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
    },
    reviewing: {
        label: 'Reviewing',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
    },
    completed: {
        label: 'Completed',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
    },
    mastered: {
        label: 'Mastered',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
    },
    skipped: {
        label: 'Skipped',
        bg: 'bg-neutral-500/10',
        text: 'text-neutral-500',
        border: 'border-neutral-500/20',
    },
};

export function formatMinutes(mins: number): string {
    if (!Number.isFinite(mins) || mins <= 0) return '0m';

    const hours = Math.floor(mins / 60);
    const rem = mins % 60;

    if (hours === 0) return `${rem}m`;
    if (rem === 0) return `${hours}h`;

    return `${hours}h ${rem}m`;
}

export function formatDateDisplay(dateStr?: string | null): string {
    if (!dateStr) return '';

    try {
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        const d = match
            ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
            : new Date(dateStr);

        if (Number.isNaN(d.getTime())) return dateStr;

        return d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year:
                d.getFullYear() !== new Date().getFullYear()
                    ? 'numeric'
                    : undefined,
        });
    } catch {
        return dateStr;
    }
}

export function getDaysRemaining(dateStr: string): {
    label: string;
    isPast: boolean;
    isToday: boolean;
} {
    try {
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        const targetDay = match
            ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
            : new Date(dateStr);

        if (Number.isNaN(targetDay.getTime())) {
            return { label: '', isPast: false, isToday: false };
        }

        targetDay.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = targetDay.getTime() - today.getTime();
        const diffDays = Math.round(
            diffTime / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 0) {
            return {
                label: 'Today',
                isPast: false,
                isToday: true,
            };
        }

        if (diffDays === 1) {
            return {
                label: 'Tomorrow',
                isPast: false,
                isToday: false,
            };
        }

        if (diffDays > 1) {
            return {
                label: `In ${diffDays} days`,
                isPast: false,
                isToday: false,
            };
        }

        return {
            label: `${Math.abs(diffDays)}d ago`,
            isPast: true,
            isToday: false,
        };
    } catch {
        return {
            label: '',
            isPast: false,
            isToday: false,
        };
    }
}

export interface GradeSummary {
    evaluatedWeight: number;
    remainingWeight: number;
    weightedAverage: number | null;
    currentScoreOn100: number;
    passingScore: number;
    neededRemainingAverage: number | null;
    isPassGuaranteed: boolean;
    isPassingAtRisk: boolean;
}

export function formatGrade(val: number | null | undefined): string {
    if (val === null || val === undefined || !Number.isFinite(Number(val))) {
        return '—';
    }

    const num = Number(val);

    return Number.isInteger(num)
        ? num.toString()
        : parseFloat(num.toFixed(2)).toString();
}

export function calculateGradeSummary(
    evaluations: Assessment[],
    passingTargetPercent: number = 50,
): GradeSummary {
    let totalEvaluatedWeight = 0;
    let accumulatedScore = 0;

    for (const item of evaluations) {
        const weight = Number(item.weightPercent) || 0;

        if (
            item.grade !== null &&
            item.grade !== undefined &&
            Number(item.maxGrade) > 0
        ) {
            const grade = Number(item.grade);
            const maxGrade = Number(item.maxGrade);

            const normalizedPercent = (grade / maxGrade) * 100;

            accumulatedScore += (normalizedPercent * weight) / 100;
            totalEvaluatedWeight += weight;
        }
    }

    const remainingWeight = Math.max(
        0,
        100 - totalEvaluatedWeight,
    );

    const weightedAverage =
        totalEvaluatedWeight > 0
            ? (accumulatedScore / totalEvaluatedWeight) * 100
            : null;

    const remainingNeeded =
        passingTargetPercent - accumulatedScore;

    let neededRemainingAverage: number | null = null;

    if (remainingWeight > 0) {
        neededRemainingAverage =
            remainingNeeded <= 0
                ? 0
                : (remainingNeeded / remainingWeight) * 100;
    }

    const isPassGuaranteed =
        accumulatedScore >= passingTargetPercent;

    const isPassingAtRisk =
        neededRemainingAverage !== null &&
        neededRemainingAverage > 100;

    const roundTo2 = (value: number): number =>
        Math.round((value + Number.EPSILON) * 100) / 100;

    return { evaluatedWeight: roundTo2(totalEvaluatedWeight),
        remainingWeight: roundTo2(remainingWeight),
        weightedAverage: weightedAverage !== null ?
            roundTo2(weightedAverage) :
            null,
        currentScoreOn100: roundTo2(accumulatedScore),
        passingScore: roundTo2(passingTargetPercent),
        neededRemainingAverage: neededRemainingAverage !== null ?
            roundTo2(neededRemainingAverage)
            : null,
        isPassGuaranteed,
        isPassingAtRisk,
    };
}