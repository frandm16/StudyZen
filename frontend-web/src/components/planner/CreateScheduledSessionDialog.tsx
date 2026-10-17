import { useState, type FormEvent } from 'react';
import { TaskTagDialog } from '../timer/TaskTagDialog';
import { getApiErrorMessage } from '../../services/api';
import { scheduledSessionService } from '../../services/scheduled-session-service';
import type { GridSelection } from '../../lib/week-grid';
import { fieldClass, primaryButton } from '../ui/Modal';
import type { Subject } from '../../types/subject';
import type { Topic } from '../../types/topic';

interface CreateScheduledSessionDialogProps {
    selection: GridSelection;
    subjects: Subject[];
    topics: Topic[];
    onClose: () => void;
    onCreated: () => void;
    onSubjectCreated: (subject: Subject) => void;
    onTopicCreated: (topic: Topic) => void;
}

const formatMinutes = (minutes: number) => `${String(8 + Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const formatLocal = (date: Date, time: string) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${time}:00`;

export function CreateScheduledSessionDialog({ selection, subjects, topics, onClose, onCreated, onSubjectCreated, onTopicCreated }: CreateScheduledSessionDialogProps) {
    const [chosen, setChosen] = useState<{ subject: Subject; topic: Topic } | null>(null);
    const [title, setTitle] = useState('');
    const [start, setStart] = useState(formatMinutes(selection.startMinutes));
    const [end, setEnd] = useState(formatMinutes(selection.endMinutes));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!chosen || start >= end) return;
        setSaving(true);
        setError('');
        try {
            await scheduledSessionService.create({
                topicId: chosen.topic.id,
                title: title.trim() || undefined,
                startedAt: formatLocal(selection.date, start),
                endedAt: formatLocal(selection.date, end),
            });
            onCreated();
        } catch (failure) {
            setError(getApiErrorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    return <>
        {chosen ? <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-session-title">
            <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 text-[var(--app-text)] shadow-2xl sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent-color)]">New study block</p><h2 id="create-session-title" className="mt-1 text-xl font-bold">{chosen.topic.name}</h2><p className="mt-1 text-sm text-[var(--app-text-muted)]">{selection.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <div className="mt-5 space-y-4"><label className="block text-xs font-semibold">Title <span className="font-normal text-[var(--app-text-muted)]">(optional)</span><input className={`${fieldClass} mt-1`} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={chosen.topic.name} /></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold">Start<input type="time" className={`${fieldClass} mt-1`} value={start} min="08:00" max="20:45" step={900} onChange={(event) => setStart(event.target.value)} required /></label><label className="block text-xs font-semibold">End<input type="time" className={`${fieldClass} mt-1`} value={end} min="08:15" max="21:00" step={900} onChange={(event) => setEnd(event.target.value)} required /></label></div>{start >= end && <p className="text-sm text-rose-500">End time must be after start time.</p>}{error && <p role="alert" className="text-sm text-rose-500">{error}</p>}</div>
                <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setChosen(null)} disabled={saving} className="rounded-full border border-[var(--app-border)] px-5 py-2.5 text-sm">Back</button><button type="button" onClick={onClose} disabled={saving} className="rounded-full border border-[var(--app-border)] px-5 py-2.5 text-sm">Cancel</button><button className={primaryButton} disabled={saving || start >= end}>{saving ? 'Saving…' : 'Create session'}</button></div>
            </form>
        </div> : <TaskTagDialog key="week-topic-picker" subjects={subjects} topics={topics} initialSubjectId={null} initialTopicId={null} onClose={onClose} onConfirm={(subject, topic) => setChosen({ subject, topic })} onSubjectCreated={onSubjectCreated} onTopicCreated={onTopicCreated} />}
    </>;
}
