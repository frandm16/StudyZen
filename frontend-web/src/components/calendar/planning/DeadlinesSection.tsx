import { useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Calendar, Check, GraduationCap, Plus, Trash2, X } from 'lucide-react';
import { deadlineService } from '../../../services/deadline-service';
import { assessmentService } from '../../../services/assessment-service';
import { dateKey } from '../../../lib/planner-dates';
import { useToast } from '../../../context/ToastContext';
import { getApiErrorMessage } from '../../../services/api';
import type { Deadline, DeadlineType, UrgencyLevel } from '../../../types/deadline';
import type { Assessment } from '../../../types/assessment';
import type { Subject } from '../../../types/subject';

interface DeadlinesSectionProps {
    deadlines: Deadline[];
    assessments: Assessment[];
    subjects: Subject[];
    selectedDate: Date;
    onDeadlinesChange: () => void;
}

type FilterOption = 'pending' | 'exams' | 'deadlines' | 'all' | 'completed';
type CreateItemKind = 'deadline' | 'assessment';

const URGENCY_STYLES: Record<UrgencyLevel, string> = {
    low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    medium: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
    high: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    critical: 'border-rose-500/30 bg-rose-500/10 text-rose-500',
};

const DEADLINE_TYPES: DeadlineType[] = [
    'assignment',
    'project',
    'quiz',
    'presentation',
    'lab',
    'submission',
    'other',
];

const ASSESSMENT_TYPES = [
    'Exam',
    'Midterm',
    'Final',
    'Quiz',
    'Project',
    'Assignment',
    'Oral Exam',
    'Other',
];

interface UnifiedItem {
    id: string;
    rawId: number;
    kind: 'deadline' | 'assessment';
    title: string;
    dueAt: string;
    allDay: boolean;
    isCompleted: boolean;
    subjectId?: number;
    urgency?: UrgencyLevel;
    typeLabel: string;
    weightPercent?: number;
    grade?: number | null;
    rawDeadline?: Deadline;
    rawAssessment?: Assessment;
}

export function DeadlinesSection({
    deadlines,
    assessments,
    subjects,
    selectedDate,
    onDeadlinesChange,
}: DeadlinesSectionProps) {
    const notify = useToast();
    const [filter, setFilter] = useState<FilterOption>('pending');
    const [isAdding, setIsAdding] = useState(false);
    const [createKind, setCreateKind] = useState<CreateItemKind>('deadline');
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [type, setType] = useState<DeadlineType>('assignment');
    const [assessmentType, setAssessmentType] = useState('Exam');
    const [weightPercent, setWeightPercent] = useState('20');
    const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
    const [dueDate, setDueDate] = useState(() => dateKey(selectedDate));
    const [dueTime, setDueTime] = useState('23:59');
    const [allDay, setAllDay] = useState(true);
    const [subjectId, setSubjectId] = useState<string>('');

    const subjectMap = useMemo(
        () => new Map(subjects.map((s) => [s.id, s])),
        [subjects]
    );

    const unifiedItems = useMemo<UnifiedItem[]>(() => {
        const list: UnifiedItem[] = [];

        for (const d of deadlines) {
            list.push({
                id: `deadline-${d.id}`,
                rawId: d.id,
                kind: 'deadline',
                title: d.title,
                dueAt: d.dueAt,
                allDay: d.allDay,
                isCompleted: d.isCompleted,
                subjectId: d.subjectId,
                urgency: d.urgency,
                typeLabel: d.type,
                rawDeadline: d,
            });
        }

        for (const a of assessments) {
            if (!a.dueAt) continue;
            list.push({
                id: `assessment-${a.id}`,
                rawId: a.id,
                kind: 'assessment',
                title: a.title,
                dueAt: a.dueAt,
                allDay: a.allDay,
                isCompleted: a.completed,
                subjectId: a.subjectId,
                typeLabel: a.type,
                weightPercent: a.weightPercent,
                grade: a.grade,
                rawAssessment: a,
            });
        }

        return list
            .filter((item) => {
                if (filter === 'pending') return !item.isCompleted;
                if (filter === 'completed') return item.isCompleted;
                if (filter === 'exams') return item.kind === 'assessment' || item.typeLabel === 'exam';
                if (filter === 'deadlines') return item.kind === 'deadline' && item.typeLabel !== 'exam';
                return true;
            })
            .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    }, [deadlines, assessments, filter]);

    const handleCreateItem = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;

        setSaving(true);
        try {
            const dueAt = allDay ? `${dueDate} 00:00:00` : `${dueDate} ${dueTime}:00`;

            if (createKind === 'assessment') {
                const subId = subjectId ? Number(subjectId) : subjects[0]?.id;
                if (!subId) {
                    notify({
                        title: 'Subject required',
                        description: 'Please select a subject for the assessment.',
                        tone: 'warning',
                    });
                    setSaving(false);
                    return;
                }
                await assessmentService.create({
                    subjectId: subId,
                    title: trimmed,
                    type: assessmentType,
                    dueAt,
                    allDay,
                    weightPercent: Number(weightPercent) || 0,
                    maxGrade: 100,
                });
                notify({
                    title: 'Assessment created',
                    tone: 'success',
                });
            } else {
                await deadlineService.create({
                    title: trimmed,
                    type,
                    urgency,
                    dueAt,
                    allDay,
                    subjectId: subjectId ? Number(subjectId) : undefined,
                });
                notify({
                    title: 'Deadline created',
                    tone: 'success',
                });
            }

            setTitle('');
            setIsAdding(false);
            onDeadlinesChange();
        } catch (err) {
            notify({
                title: 'Could not create item',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleComplete = async (item: UnifiedItem) => {
        try {
            if (item.kind === 'assessment' && item.rawAssessment) {
                const updated = await assessmentService.toggleComplete(item.rawAssessment);
                notify({
                    title: updated.completed ? 'Assessment completed' : 'Assessment reopened',
                    tone: 'success',
                });
            } else if (item.kind === 'deadline' && item.rawDeadline) {
                const nextCompleted = !item.isCompleted;
                await deadlineService.patch(item.rawDeadline.id, {
                    isCompleted: nextCompleted,
                });
                notify({
                    title: nextCompleted ? 'Deadline completed' : 'Deadline reopened',
                    tone: 'success',
                });
            }
            onDeadlinesChange();
        } catch (err) {
            notify({
                title: 'Could not update status',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        }
    };

    const handleDelete = async (item: UnifiedItem) => {
        try {
            if (item.kind === 'assessment') {
                await assessmentService.delete(item.rawId);
                notify({
                    title: 'Assessment deleted',
                    tone: 'success',
                });
            } else {
                await deadlineService.delete(item.rawId);
                notify({
                    title: 'Deadline deleted',
                    tone: 'success',
                });
            }
            onDeadlinesChange();
        } catch (err) {
            notify({
                title: 'Could not delete item',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        }
    };

    const formatDueDate = (dueAt: string, isAllDay: boolean) => {
        const d = new Date(dueAt.replace(' ', 'T'));
        const now = new Date();
        const isToday =
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();

        const monthShort = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (isAllDay) {
            return isToday ? 'Today' : monthShort;
        }
        const timeShort = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return isToday ? `Today ${timeShort}` : `${monthShort} ${timeShort}`;
    };

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--accent-color)]">
                    <AlertCircle size={14} />
                    <span>Deadlines & Exams</span>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAdding((prev) => !prev)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-color)] hover:underline"
                >
                    {isAdding ? <X size={13} /> : <Plus size={13} />}
                    <span>{isAdding ? 'Cancel' : 'Add new'}</span>
                </button>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-0.5 text-[10px] overflow-x-auto">
                {(['pending', 'exams', 'deadlines', 'all', 'completed'] as const).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setFilter(tab)}
                        className={`flex-1 rounded-md px-1.5 py-1 font-semibold capitalize transition-all whitespace-nowrap ${
                            filter === tab
                                ? 'bg-[var(--accent-color)] text-[var(--app-bg)] shadow-xs'
                                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {isAdding && (
                <form
                    onSubmit={handleCreateItem}
                    className="flex flex-col gap-2 rounded-xl border border-[var(--accent-color)]/30 bg-[var(--app-bg)] p-3 text-xs"
                >
                    <div className="flex gap-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] p-0.5 text-[11px]">
                        <button
                            type="button"
                            onClick={() => setCreateKind('deadline')}
                            className={`flex-1 rounded py-0.5 font-semibold transition-all ${
                                createKind === 'deadline'
                                    ? 'bg-[var(--accent-color)] text-[var(--app-bg)]'
                                    : 'text-[var(--app-text-muted)]'
                            }`}
                        >
                            Deadline / Task
                        </button>
                        <button
                            type="button"
                            onClick={() => setCreateKind('assessment')}
                            className={`flex-1 rounded py-0.5 font-semibold transition-all ${
                                createKind === 'assessment'
                                    ? 'bg-[var(--accent-color)] text-[var(--app-bg)]'
                                    : 'text-[var(--app-text-muted)]'
                            }`}
                        >
                            Exam / Assessment
                        </button>
                    </div>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                            createKind === 'assessment'
                                ? 'Exam title (e.g. Midterm exam)'
                                : 'Deadline title (e.g. Research paper)'
                        }
                        required
                        className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2.5 py-1.5 text-xs text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:border-[var(--accent-color)] focus:outline-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            required={createKind === 'assessment'}
                            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1.5 text-xs text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                        >
                            <option value="">
                                {createKind === 'assessment' ? 'Select subject *' : 'General (No subject)'}
                            </option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>

                        {createKind === 'assessment' ? (
                            <select
                                value={assessmentType}
                                onChange={(e) => setAssessmentType(e.target.value)}
                                className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1.5 text-xs text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                            >
                                {ASSESSMENT_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as DeadlineType)}
                                className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1.5 text-xs capitalize text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                            >
                                {DEADLINE_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1.5 text-xs text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                        />

                        {createKind === 'assessment' ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={weightPercent}
                                onChange={(e) => setWeightPercent(e.target.value)}
                                placeholder="Weight % (e.g. 20)"
                                className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1.5 text-xs text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                            />
                        ) : (
                            <select
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                                className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1.5 text-xs capitalize text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                            >
                                <option value="low">Low urgency</option>
                                <option value="medium">Medium urgency</option>
                                <option value="high">High urgency</option>
                                <option value="critical">Critical urgency</option>
                            </select>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-1.5 text-[11px] text-[var(--app-text-muted)] cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allDay}
                                onChange={(e) => setAllDay(e.target.checked)}
                                className="rounded accent-[var(--accent-color)]"
                            />
                            <span>All day</span>
                        </label>

                        {!allDay && (
                            <input
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                                className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-1 text-xs text-[var(--app-text)]"
                            />
                        )}

                        <button
                            type="submit"
                            disabled={saving || !title.trim()}
                            className="rounded-lg bg-[var(--accent-color)] px-3 py-1 font-bold text-[var(--app-bg)] transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            )}

            <div className="flex flex-col gap-1.5">
                {unifiedItems.length === 0 ? (
                    <p className="py-2 text-center text-xs text-[var(--app-text-muted)]">
                        No {filter !== 'all' ? filter : ''} items found.
                    </p>
                ) : (
                    unifiedItems.map((item) => {
                        const subject = item.subjectId ? subjectMap.get(item.subjectId) : undefined;
                        const isExam = item.kind === 'assessment' || item.typeLabel.toLowerCase().includes('exam');

                        return (
                            <div
                                key={item.id}
                                className={`group flex items-start justify-between gap-2 rounded-xl border border-[var(--app-border)] p-2.5 transition-colors hover:border-[var(--accent-color)]/30 ${
                                    item.isCompleted
                                        ? 'bg-[var(--app-bg)]/40 text-[var(--app-text-muted)] opacity-70'
                                        : 'bg-[var(--app-bg)] text-[var(--app-text)]'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleToggleComplete(item)}
                                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                        item.isCompleted
                                            ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-[var(--app-bg)]'
                                            : 'border-[var(--app-border)] hover:border-[var(--accent-color)]'
                                    }`}
                                    aria-label={item.isCompleted ? 'Mark pending' : 'Mark completed'}
                                >
                                    {item.isCompleted && <Check size={11} strokeWidth={3} />}
                                </button>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span
                                            className={`truncate font-semibold text-xs ${
                                                item.isCompleted ? 'line-through text-[var(--app-text-muted)]' : ''
                                            }`}
                                        >
                                            {item.title}
                                        </span>

                                        {isExam && (
                                            <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.2 text-[10px] font-bold text-rose-500">
                                                <GraduationCap size={11} />
                                                <span>Exam</span>
                                            </span>
                                        )}

                                        {item.urgency && (
                                            <span
                                                className={`rounded-md border px-1.5 py-0.2 text-[10px] font-bold capitalize ${
                                                    URGENCY_STYLES[item.urgency]
                                                }`}
                                            >
                                                {item.urgency}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--app-text-muted)] flex-wrap">
                                        {subject && (
                                            <span
                                                className="inline-flex items-center gap-1 rounded-sm px-1 py-0.2 text-[10px] font-semibold"
                                                style={{
                                                    backgroundColor: `${subject.color}1f`,
                                                    color: subject.color,
                                                }}
                                            >
                                                {subject.name}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Calendar size={11} />
                                            <span>{formatDueDate(item.dueAt, item.allDay)}</span>
                                        </span>
                                        {item.weightPercent !== undefined && item.weightPercent > 0 && (
                                            <span className="text-[10px] font-semibold text-amber-500">
                                                {item.weightPercent}% weight
                                            </span>
                                        )}
                                        <span className="capitalize text-[10px]">({item.typeLabel})</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    aria-label="Delete item"
                                    className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
