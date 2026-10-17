import { useState, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { addDays, localDateFromTimestamp, dateKey } from '../../lib/planner-dates';
import { TaskTagDialog } from '../timer/TaskTagDialog';
import { getApiErrorMessage } from '../../services/api';
import { scheduledSessionService } from '../../services/scheduled-session-service';
import { WEEK_GRID_MINUTES, type GridSelection } from '../../lib/week-grid';
import { fieldClass, primaryButton } from '../ui/Modal';
import type { ScheduledSession } from '../../types/scheduled-session';
import type { Subject } from '../../types/subject';
import type { Topic } from '../../types/topic';

interface CreateScheduledSessionDialogProps {
    selection: GridSelection;
    subjects: Subject[];
    topics: Topic[];
    onClose: () => void;
    onCreated: () => void;
    session?: ScheduledSession;
    onSubjectCreated: (subject: Subject) => void;
    onTopicCreated: (topic: Topic) => void;
}

const formatMinutes = (minutes: number) => {
    const minuteOfDay = minutes % WEEK_GRID_MINUTES;
    return `${String(Math.floor(minuteOfDay / 60) % 24).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(2, '0')}`;
};
const selectionDateTime = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    return formatLocal(dateKey(addDays(new Date(year, month - 1, day), 1)), '00:00');
};
const formatLocal = (date: string, time: string) => `${date}T${time}:00`;
const formatTime = (date: Date | null) => date ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` : '09:00';

export function CreateScheduledSessionDialog({ selection, subjects, topics, onClose, onCreated, session, onSubjectCreated, onTopicCreated }: CreateScheduledSessionDialogProps) {
    const notify = useToast();
    const existingTopic = topics.find((topic) => topic.id === session?.topicId);
    const existingSubject = subjects.find((subject) => subject.id === existingTopic?.subjectId);
    const currentStart = localDateFromTimestamp(session?.startedAt ?? '');
    const currentEnd = localDateFromTimestamp(session?.endedAt ?? '');
    const [chosen, setChosen] = useState<{ subject: Subject; topic: Topic } | null>(session && existingTopic && existingSubject ? { subject: existingSubject, topic: existingTopic } : null);
    const [date, setDate] = useState(session ? dateKey(currentStart ?? selection.date) : dateKey(selection.date));
    const [title, setTitle] = useState(session?.title ?? '');
    const [start, setStart] = useState(session ? formatTime(currentStart) : formatMinutes(selection.startMinutes));
    const [end, setEnd] = useState(session ? formatTime(currentEnd) : formatMinutes(selection.endMinutes));
    const [saving, setSaving] = useState(false);
    const endsAtMidnight = end === '00:00' && start > end;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!chosen || (!endsAtMidnight && start >= end) || !date) return;
        setSaving(true);
        try {
            const payload = {
                topicId: chosen.topic.id,
                title: title.trim() || undefined,
                startedAt: formatLocal(date, start),
                endedAt: endsAtMidnight ? selectionDateTime(date) : formatLocal(date, end),
            };
            if (session) await scheduledSessionService.update(session.id, payload);
            else await scheduledSessionService.create(payload);
            onCreated();
        } catch (failure) {
            const message = getApiErrorMessage(failure);
            notify({ title: session ? 'Could not update study session' : 'Could not create study session', description: message, tone: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return <>
        {chosen ? <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-session-title">
            <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 text-[var(--app-text)] shadow-2xl sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent-color)]">{session ? 'Edit study block' : 'New study block'}</p><h2 id="create-session-title" className="mt-1 text-xl font-bold">{chosen.topic.name}</h2>
                <div className="mt-5 space-y-4"><button type="button" onClick={() => setChosen(null)} className="text-sm font-semibold text-[var(--accent-color)]">Change subject or topic</button><label className="block text-xs font-semibold">Date<input type="date" className={`${fieldClass} mt-1`} value={date} onChange={(event) => setDate(event.target.value)} required /></label><label className="block text-xs font-semibold">Title <span className="font-normal text-[var(--app-text-muted)]">(optional)</span><input className={`${fieldClass} mt-1`} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={chosen.topic.name} /></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold">Start<input type="time" className={`${fieldClass} mt-1`} value={start} step={900} onChange={(event) => setStart(event.target.value)} required /></label><label className="block text-xs font-semibold">End<input type="time" className={`${fieldClass} mt-1`} value={end} step={900} onChange={(event) => setEnd(event.target.value)} required /></label></div>{start >= end && !endsAtMidnight && <p className="text-sm text-rose-500">End time must be after start time.</p>}</div>
                <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="rounded-full border border-[var(--app-border)] px-5 py-2.5 text-sm">Cancel</button><button className={primaryButton} disabled={saving || (start >= end && !endsAtMidnight)}>{saving ? 'Saving…' : session ? 'Save changes' : 'Create session'}</button></div>
            </form>
        </div> : <TaskTagDialog key={`week-topic-picker-${session?.id ?? 'new'}`} subjects={subjects} topics={topics} initialSubjectId={session ? existingSubject?.id ?? null : null} initialTopicId={session?.topicId ?? null} onClose={onClose} onConfirm={(subject, topic) => setChosen({ subject, topic })} onSubjectCreated={onSubjectCreated} onTopicCreated={onTopicCreated} />}
    </>;
}
