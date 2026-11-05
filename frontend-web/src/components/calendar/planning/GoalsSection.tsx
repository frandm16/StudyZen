import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Target, Trash2, X } from 'lucide-react';
import { studyGoalService } from '../../../services/study-goal-service';
import { topicService } from '../../../services/topic-service';
import { useToast } from '../../../context/ToastContext';
import { getApiErrorMessage } from '../../../services/api';
import type { StudyGoal } from '../../../types/study-goal';
import type { Subject } from '../../../types/subject';
import type { Session } from '../../../types/session';

interface GoalsSectionProps {
    subjects: Subject[];
    sessions: Session[];
    weekStartsOn: number;
}

export function GoalsSection({
    subjects,
    sessions,
    weekStartsOn,
}: GoalsSectionProps) {
    const notify = useToast();
    const [goals, setGoals] = useState<StudyGoal[]>([]);
    const [topicToSubject, setTopicToSubject] = useState<Map<number, number>>(new Map());
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [period, setPeriod] = useState<'daily' | 'weekly'>('weekly');
    const [targetMinutes, setTargetMinutes] = useState('300');
    const [subjectId, setSubjectId] = useState('');

    const subjectMap = useMemo(
        () => new Map(subjects.map((s) => [s.id, s])),
        [subjects]
    );

    const loadGoals = async () => {
        try {
            const [fetchedGoals, topics] = await Promise.all([
                studyGoalService.getAll(),
                topicService.getAll(),
            ]);
            setGoals(fetchedGoals);
            setTopicToSubject(new Map(topics.map((t) => [t.id, t.subjectId])));
        } catch (err) {
            notify({
                title: 'Could not load study goals',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        }
    };

    useEffect(() => {
        void loadGoals();
    }, []);

    const handleCreateGoal = async (e: FormEvent) => {
        e.preventDefault();
        const mins = Number(targetMinutes);
        if (!Number.isInteger(mins) || mins < 1 || mins > 10080) {
            notify({
                title: 'Target must be between 1 and 10,080 minutes',
                tone: 'warning',
            });
            return;
        }

        setSaving(true);
        try {
            await studyGoalService.create({
                period,
                targetMinutes: mins,
                subjectId: subjectId ? Number(subjectId) : null,
            });
            notify({
                title: 'Study goal added',
                tone: 'success',
            });
            setIsAdding(false);
            void loadGoals();
        } catch (err) {
            notify({
                title: 'Could not save study goal',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await studyGoalService.delete(id);
            setGoals((prev) => prev.filter((g) => g.id !== id));
            notify({
                title: 'Goal deleted',
                tone: 'success',
            });
        } catch (err) {
            notify({
                title: 'Could not delete goal',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        }
    };

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--accent-color)]">
                    <Target size={14} />
                    <span>Study Goals</span>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAdding((prev) => !prev)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-color)] hover:underline"
                >
                    {isAdding ? <X size={13} /> : <Plus size={13} />}
                    <span>{isAdding ? 'Cancel' : 'Add goal'}</span>
                </button>
            </div>

            {isAdding && (
                <form
                    onSubmit={handleCreateGoal}
                    className="flex flex-col gap-2 rounded-xl border border-[var(--accent-color)]/30 bg-[var(--app-bg)] p-3 text-xs"
                >
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly')}
                            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1.5 text-xs capitalize text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>

                        <input
                            type="number"
                            min="1"
                            max="10080"
                            value={targetMinutes}
                            onChange={(e) => setTargetMinutes(e.target.value)}
                            placeholder="Minutes target"
                            required
                            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1.5 text-xs text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                        />
                    </div>

                    <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1.5 text-xs text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                    >
                        <option value="">All subjects</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-1 rounded-lg bg-[var(--accent-color)] py-1 font-bold text-[var(--app-bg)] transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        {saving ? 'Saving…' : 'Save goal'}
                    </button>
                </form>
            )}

            <div className="flex flex-col gap-2">
                {goals.length === 0 ? (
                    <p className="py-2 text-center text-xs text-[var(--app-text-muted)]">
                        No active study goals. Set a target to build consistency!
                    </p>
                ) : (
                    goals.map((goal) => {
                        const now = new Date();
                        const intervalStart =
                            goal.period === 'daily'
                                ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
                                : new Date(
                                      now.getFullYear(),
                                      now.getMonth(),
                                      now.getDate() - ((now.getDay() - weekStartsOn + 7) % 7)
                                  );

                        const relevant = sessions.filter((session) => {
                            const startedAt = new Date(session.startedAt.replace(' ', 'T'));
                            const weekEnd = new Date(
                                intervalStart.getFullYear(),
                                intervalStart.getMonth(),
                                intervalStart.getDate() + (goal.period === 'daily' ? 1 : 7)
                            );
                            return (
                                startedAt >= intervalStart &&
                                startedAt < weekEnd &&
                                (!goal.subjectId || topicToSubject.get(session.topicId) === goal.subjectId)
                            );
                        });

                        const progressMinutes = relevant.reduce((sum, s) => sum + s.totalMinutes, 0);
                        const percent = Math.min(
                            100,
                            Math.round((progressMinutes / goal.targetMinutes) * 100)
                        );
                        const subject = goal.subjectId ? subjectMap.get(goal.subjectId) : null;
                        const title = subject ? subject.name : 'All subjects';

                        return (
                            <div
                                key={goal.id}
                                className="group rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-2.5 transition-colors hover:border-[var(--accent-color)]/30"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold text-[var(--app-text)]">
                                            {title}
                                        </p>
                                        <p className="text-[11px] capitalize text-[var(--app-text-muted)]">
                                            {goal.period} · {goal.targetMinutes} min target
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(goal.id)}
                                        aria-label={`Delete ${title} goal`}
                                        className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>

                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--app-border)]">
                                    <div
                                        className="h-full rounded-full bg-[var(--accent-color)] transition-all duration-300"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>

                                <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--app-text-muted)]">
                                    <span>{progressMinutes} min studied</span>
                                    <span className="font-semibold">{percent}%</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
