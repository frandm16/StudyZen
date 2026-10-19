import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTimerContext } from '../context/TimerContext';
import { useToast } from '../context/ToastContext';
import { AiPlannerPlaceholder } from '../components/planner/AiPlannerPlaceholder';
import { CreateScheduledSessionDialog } from '../components/planner/CreateScheduledSessionDialog';
import { SessionModal } from '../components/subjects/modals/SessionModal';
import { WeeklyTimeGrid } from '../components/planner/WeeklyTimeGrid';
import { addDays, dateKey, localDateFromTimestamp, weekRange } from '../lib/planner-dates';
import { getApiErrorMessage } from '../services/api';
import { WEEK_GRID_MINUTES, WEEK_GRID_START_HOUR, weekGridDates, type GridSelection } from '../lib/week-grid';
import { scheduledSessionService } from '../services/scheduled-session-service';
import { sessionService } from '../services/session-service';
import { deadlineService } from '../services/deadline-service';
import { settingsService } from '../services/settings-service';
import { subjectService } from '../services/subject-service';
import { topicService } from '../services/topic-service';
import type { ScheduledSession } from '../types/scheduled-session';
import type { Session, UpdateSessionDTO } from '../types/session';
import type { Deadline } from '../types/deadline';
import type { Subject } from '../types/subject';
import type { Topic } from '../types/topic';

const localTimestamp = (value: Date) => {
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${dateKey(value)}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
};

const button = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]';
const iconButton = 'flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]';

function ChevronIcon({ direction, className = '' }: { direction: 'left' | 'right'; className?: string }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden><path d={direction === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} /></svg>;
}

function PlayIcon({ className = '' }: { className?: string }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden><path d="M7 4.5v15l12-7.5-12-7.5Z" /></svg>;
}

function PlusIcon({ className = '' }: { className?: string }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden><path d="M12 5v14M5 12h14" /></svg>;
}

export const WeekPage = () => {
    const timer = useTimerContext();
    const notify = useToast();
    const requestedDate = new URLSearchParams(window.location.search).get('date');
    const parsedDate = requestedDate ? new Date(`${requestedDate}T12:00:00`) : new Date();
    const initialDate = requestedDate && !Number.isNaN(parsedDate.getTime()) && dateKey(parsedDate) === requestedDate ? parsedDate : new Date();
    const [anchor, setAnchor] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [weekStartsOn, setWeekStartsOn] = useState(1);
    const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [editingStudySession, setEditingStudySession] = useState<Session | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selection, setSelection] = useState<GridSelection | null>(null);
    const [editingSession, setEditingSession] = useState<ScheduledSession | null>(null);
    const [loading, setLoading] = useState(true);
    const requestId = useRef(0);

    const dates = useMemo(() => weekGridDates(anchor, weekStartsOn), [anchor, weekStartsOn]);
    const range = useMemo(() => weekRange(anchor, weekStartsOn), [anchor, weekStartsOn]);
    const startKey = dateKey(range.start);
    const endKey = dateKey(addDays(range.end, -1));

    const load = useCallback(async () => {
        const currentRequest = ++requestId.current;
        const requestedRange = `${startKey}:${endKey}`;
        const isCurrent = () => currentRequest === requestId.current && requestedRange === `${startKey}:${endKey}`;
        setLoading(true);
        try {
            const [year, month, day] = startKey.split('-').map(Number);
            const previous = addDays(new Date(year, month - 1, day), -1);
            const start = `${dateKey(previous)} 00:00:00`;
            const end = `${endKey} 23:59:59`;
            const rangeStart = `${startKey}T00:00:00`;
            const rangeEnd = `${dateKey(range.end)}T00:00:00`;
            const [scheduledItems, subjectItems, topicItems, settings, studyItems, deadlineItems] = await Promise.all([
                scheduledSessionService.getAll(start, end),
                subjectService.getAll(),
                topicService.getAll(),
                settingsService.getSettings(),
                sessionService.getAll({ start: `${dateKey(previous)}T00:00:00`, end: rangeEnd, size: 500 }),
                deadlineService.getAll(rangeStart, end),
            ]);
            if (!isCurrent()) return;
            setScheduled(scheduledItems);
            setSessions(studyItems);
            setDeadlines(deadlineItems);
            setSubjects(subjectItems);
            setTopics(topicItems);
            const nextWeekStartsOn = Number.isInteger(settings.weekStartsOn) ? settings.weekStartsOn : 1;
            setWeekStartsOn(nextWeekStartsOn);
        } catch (failure) {
            if (isCurrent()) notify({ title: 'Could not load week', description: getApiErrorMessage(failure), tone: 'error', persist: false });
        } finally {
            if (isCurrent()) setLoading(false);
        }
    }, [startKey, endKey]);

    useEffect(() => {
        void load();
        return () => { requestId.current += 1; };
    }, [load]);

    const weekLabel = `${dates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${dates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    const moveSession = async (session: ScheduledSession, date: Date, startMinutes: number) => {
        const oldStart = localDateFromTimestamp(session.startedAt);
        const oldEnd = localDateFromTimestamp(session.endedAt);
        if (!oldStart || !oldEnd) return;
        const duration = oldEnd.getTime() - oldStart.getTime();
        const durationMinutes = Math.ceil(duration / 60000 / 15) * 15;
        if (durationMinutes > WEEK_GRID_MINUTES) {
            notify({ title: 'Could not reschedule session', description: 'This session is longer than one day.', tone: 'error' });
            return;
        }
        const boundedStart = Math.max(0, Math.min(startMinutes, WEEK_GRID_MINUTES - durationMinutes));
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), WEEK_GRID_START_HOUR, 0);
        start.setMinutes(start.getMinutes() + boundedStart);
        const end = new Date(start.getTime() + duration);
        try {
            await scheduledSessionService.patch(session.id, {
                startedAt: localTimestamp(start),
                endedAt: localTimestamp(end),
            });
            notify({ title: 'Study session rescheduled', tone: 'success' });
            await load();
        } catch (failure) {
            notify({ title: 'Could not reschedule session', description: getApiErrorMessage(failure), tone: 'error' });
        }
    };

    const saveStudySession = async (data: UpdateSessionDTO) => {
        if (!editingStudySession) return;
        try {
            const updated = await sessionService.update(editingStudySession.id, data);
            setSessions((current) => current.map((item) => item.id === updated.id ? updated : item));
            setEditingStudySession(null);
            notify({ title: 'Study session updated', tone: 'success' });
        } catch (failure) {
            notify({ title: 'Could not update study session', description: getApiErrorMessage(failure), tone: 'error' });
            throw failure;
        }
    };

    const handleSaved = async () => {
        setSelection(null);
        setEditingSession(null);
        notify({ title: editingSession ? 'Study session updated' : 'Study session created', tone: 'success' });
        await load();
    };

    const addSubject = (subject: Subject) => setSubjects((current) => current.some((item) => item.id === subject.id) ? current : [...current, subject]);
    const addTopic = (topic: Topic) => setTopics((current) => current.some((item) => item.id === topic.id) ? current : [...current, topic]);

    return <main className="min-h-full bg-[var(--app-bg)] px-4 py-6 text-[var(--app-text)] sm:px-6 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-[1500px] space-y-5">
            <header className="flex min-h-[58px] flex-wrap items-center justify-between gap-2 border-b border-[var(--app-border)] px-1 py-3 sm:gap-3 sm:px-0">
                <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => { const today = new Date(); setAnchor(today); setSelectedDate(today); }} className={button}>Today</button>
                    <button onClick={() => { const next = addDays(anchor, -7); setAnchor(next); setSelectedDate(next); }} aria-label="Previous week" className={iconButton}><ChevronIcon direction="left" className="h-4 w-4" /></button>
                </div>
                <h1 className="min-w-0 flex-1 truncate text-center text-sm font-bold text-[var(--app-text)] sm:text-base">{weekLabel}</h1>
                <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => { const next = addDays(anchor, 7); setAnchor(next); setSelectedDate(next); }} aria-label="Next week" className={iconButton}><ChevronIcon direction="right" className="h-4 w-4" /></button>
                    <button onClick={() => { timer.start(); window.location.assign('/timer'); }} className="flex items-center gap-2 rounded-xl bg-[var(--accent-color)] px-4 py-2 text-xs font-bold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"><PlayIcon className="h-3.5 w-3.5" /><span className="hidden sm:inline">Study now</span></button>
                    <button onClick={() => setSelection({ date: selectedDate, startMinutes: 540, endMinutes: 600 })} aria-label="Schedule session" title="Schedule session" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-neutral-500/10 text-[var(--app-text)] transition-colors hover:bg-neutral-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"><PlusIcon className="h-4 w-4" /></button>
                </div>
            </header>
            {loading && scheduled.length === 0 ? <div className="border-y border-[var(--app-border)] py-10 text-center text-sm text-[var(--app-text-muted)]" role="status">Loading your week…</div> : <>
                <AiPlannerPlaceholder />
                <WeeklyTimeGrid dates={dates} scheduled={scheduled} sessions={sessions} deadlines={deadlines} subjects={subjects} topics={topics} onCreate={setSelection} onEdit={setEditingSession} onEditStudySession={setEditingStudySession} onMove={moveSession} />
            </>}
        </div>
        {editingStudySession && <SessionModal session={editingStudySession} subjects={subjects} topics={topics} onClose={() => setEditingStudySession(null)} onSave={saveStudySession} />}
        {(selection || editingSession) && <CreateScheduledSessionDialog selection={selection ?? { date: selectedDate, startMinutes: 540, endMinutes: 600 }} session={editingSession ?? undefined} subjects={subjects} topics={topics} onClose={() => { setSelection(null); setEditingSession(null); }} onCreated={() => void handleSaved()} onSubjectCreated={addSubject} onTopicCreated={addTopic} />}
    </main>;
};
