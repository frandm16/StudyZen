import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { studyGoalService } from '../../services/study-goal-service';
import { topicService } from '../../services/topic-service';
import { sessionService } from '../../services/session-service';
import { fieldClass, primaryButton } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import type { StudyGoal } from '../../types/study-goal';
import type { Subject } from '../../types/subject';
import type { Session } from '../../types/session';

interface GoalPanelProps {
    goals: StudyGoal[];
    subjects: Subject[];
    sessions: Session[];
    weekStartsOn: number;
    onChange: () => void;
}

export function GoalPanel({ goals, subjects, sessions, weekStartsOn, onChange }: GoalPanelProps) {
    const notify = useToast();
    const [adding, setAdding] = useState(false);
    const [period, setPeriod] = useState<'daily' | 'weekly'>('weekly');
    const [subjectId, setSubjectId] = useState('');
    const [minutes, setMinutes] = useState('300');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const subjectById = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);
    const [topicToSubject, setTopicToSubject] = useState<Map<number, number>>(new Map());
    const [removingId, setRemovingId] = useState<number | null>(null);

    useEffect(() => {
        void topicService.getAll().then((topics) => setTopicToSubject(new Map(topics.map((topic) => [topic.id, topic.subjectId])))).catch(() => setTopicToSubject(new Map()));
    }, []);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const targetMinutes = Number(minutes);
        if (!Number.isInteger(targetMinutes) || targetMinutes < 1 || targetMinutes > 10080) {
            setError('Enter a target between 1 and 10,080 minutes.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            await studyGoalService.create({ period, targetMinutes, subjectId: subjectId ? Number(subjectId) : null });
            setAdding(false);
            notify({ title: 'Study goal added', tone: 'success' });
            onChange();
        } catch {
            setError('Could not save this goal. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const remove = async (goal: StudyGoal) => {
        if (!window.confirm('Delete this study goal?')) return;
        setRemovingId(goal.id);
        setError('');
        try {
            await studyGoalService.delete(goal.id);
            onChange();
        } catch {
            setError('Could not delete this goal. Please try again.');
        } finally {
            setRemovingId(null);
        }
    };

    return <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-color)]">Consistency</p><h2 className="mt-1 text-xl font-bold">Study goals</h2></div><button onClick={() => setAdding((value) => !value)} className="flex items-center gap-1 rounded-full border border-[var(--app-border)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-[var(--accent-color)]" aria-expanded={adding}><Plus size={15} /> Add goal</button></div>
        {error && <p role="alert" className="mt-3 text-sm text-rose-500">{error}</p>}
        {adding && <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl bg-[var(--app-bg)] p-4 sm:grid-cols-2">
            <label className="text-xs font-semibold">Period<select className={`${fieldClass} mt-1`} value={period} onChange={(event) => setPeriod(event.target.value as 'daily' | 'weekly')}><option value="daily">Daily</option><option value="weekly">Weekly</option></select></label>
            <label className="text-xs font-semibold">Target minutes<input className={`${fieldClass} mt-1`} type="number" min="1" max="10080" value={minutes} onChange={(event) => setMinutes(event.target.value)} required /></label>
            <label className="text-xs font-semibold sm:col-span-2">Subject (optional)<select className={`${fieldClass} mt-1`} value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
            <div className="flex gap-2 sm:col-span-2"><button className={primaryButton} disabled={busy}>{busy ? 'Saving…' : 'Save goal'}</button><button type="button" className="rounded-full border border-[var(--app-border)] px-5 py-2 text-sm" onClick={() => setAdding(false)}>Cancel</button></div>
        </form>}
        {goals.length === 0 ? <p className="mt-5 text-sm text-[var(--app-text-muted)]">Set a small, achievable target to build your study rhythm.</p> : <div className="mt-5 space-y-4">{goals.map((goal) => {
            const now = new Date();
            const intervalStart = goal.period === 'daily'
                ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
                : new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() - weekStartsOn + 7) % 7);
            const relevant = sessions.filter((session) => {
                const startedAt = new Date(session.startedAt.replace(' ', 'T'));
                const weekEnd = new Date(intervalStart.getFullYear(), intervalStart.getMonth(), intervalStart.getDate() + (goal.period === 'daily' ? 1 : 7));
                return startedAt >= intervalStart && startedAt < weekEnd && (!goal.subjectId || topicToSubject.get(session.topicId) === goal.subjectId);
            });
            const progress = relevant.reduce((sum, session) => sum + session.totalMinutes, 0);
            const percent = Math.min(100, Math.round(progress / goal.targetMinutes * 100));
            const title = goal.subjectId ? subjectById.get(goal.subjectId)?.name ?? 'Subject goal' : 'All subjects';
            return <div key={goal.id} className="rounded-2xl bg-[var(--app-bg)] p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{title}</p><p className="text-xs capitalize text-[var(--app-text-muted)]">{goal.period} goal · {goal.targetMinutes} min target</p></div><button onClick={() => void remove(goal)} disabled={removingId === goal.id} className="rounded-full p-2 text-[var(--app-text-muted)] hover:text-rose-500 focus-visible:outline-2 focus-visible:outline-[var(--accent-color)] disabled:opacity-50" aria-label={`Delete ${title} goal`}><Trash2 size={15} /></button></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--app-border)]"><div className="h-full rounded-full bg-[var(--accent-color)] transition-all" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-[var(--app-text-muted)]">{progress} of {goal.targetMinutes} minutes · {percent}%</p></div>;
        })}</div>}
    </section>;
}

export async function loadGoalProgressSessions(start: string, end: string): Promise<Session[]> {
    return sessionService.getByDateRange(start, end);
}
