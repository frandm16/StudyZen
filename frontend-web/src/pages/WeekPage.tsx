import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Play, Plus, RotateCcw } from 'lucide-react';
import { useTimerContext } from '../context/TimerContext';
import { AiPlannerPlaceholder } from '../components/planner/AiPlannerPlaceholder';
import { CreateScheduledSessionDialog } from '../components/planner/CreateScheduledSessionDialog';
import { WeeklyTimeGrid } from '../components/planner/WeeklyTimeGrid';
import { addDays, dateKey, localDateFromTimestamp, weekRange } from '../lib/planner-dates';
import { weekGridDates, type GridSelection } from '../lib/week-grid';
import { scheduledSessionService } from '../services/scheduled-session-service';
import { settingsService } from '../services/settings-service';
import { subjectService } from '../services/subject-service';
import { topicService } from '../services/topic-service';
import type { ScheduledSession } from '../types/scheduled-session';
import type { Subject } from '../types/subject';
import type { Topic } from '../types/topic';

const button = 'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]';

export const WeekPage = () => {
    const timer = useTimerContext();
    const [anchor, setAnchor] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekStartsOn, setWeekStartsOn] = useState(1);
    const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selection, setSelection] = useState<GridSelection | null>(null);
    const [editingSession, setEditingSession] = useState<ScheduledSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const dates = useMemo(() => weekGridDates(anchor, weekStartsOn), [anchor, weekStartsOn]);
    const range = useMemo(() => weekRange(anchor, weekStartsOn), [anchor, weekStartsOn]);
    const startKey = dateKey(range.start);
    const endKey = dateKey(addDays(range.end, -1));

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const start = `${startKey} 00:00:00`;
            const end = `${endKey} 23:59:59`;
            const [scheduledItems, subjectItems, topicItems, settings] = await Promise.all([
                scheduledSessionService.getAll(start, end),
                subjectService.getAll(),
                topicService.getAll(),
                settingsService.getSettings(),
            ]);
            setScheduled(scheduledItems);
            setSubjects(subjectItems);
            setTopics(topicItems);
            const nextWeekStartsOn = Number.isInteger(settings.weekStartsOn) ? settings.weekStartsOn : 1;
            setWeekStartsOn(nextWeekStartsOn);
        } catch {
            setError('We could not load this week. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, [startKey, endKey]);

    useEffect(() => { void load(); }, [load]);

    const weekLabel = `${dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${dates[6].toLocaleDateString('en-US', { month: dates[0].getMonth() === dates[6].getMonth() ? undefined : 'short', day: 'numeric', year: 'numeric' })}`;

    const moveSession = async (session: ScheduledSession, date: Date, startMinutes: number) => {
        const oldStart = localDateFromTimestamp(session.startedAt);
        const oldEnd = localDateFromTimestamp(session.endedAt);
        if (!oldStart || !oldEnd) return;
        const duration = oldEnd.getTime() - oldStart.getTime();
        const boundedStart = Math.min(startMinutes, 780 - Math.ceil(duration / 60000 / 15) * 15);
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0);
        start.setMinutes(start.getMinutes() + Math.max(0, boundedStart));
        const end = new Date(start.getTime() + duration);
        setNotice('');
        try {
            await scheduledSessionService.patch(session.id, {
                startedAt: `${dateKey(start)}T${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}:00`,
                endedAt: `${dateKey(end)}T${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}:00`,
            });
            setNotice('Study session rescheduled.');
            await load();
        } catch {
            setNotice('Could not reschedule this session. Its original time was kept.');
        }
    };

    const handleSaved = async () => {
        setSelection(null);
        setEditingSession(null);
        setNotice(editingSession ? 'Study session updated.' : 'Study session added to your week.');
        await load();
    };

    const addSubject = (subject: Subject) => setSubjects((current) => current.some((item) => item.id === subject.id) ? current : [...current, subject]);
    const addTopic = (topic: Topic) => setTopics((current) => current.some((item) => item.id === topic.id) ? current : [...current, topic]);

    return <main className="min-h-full bg-[var(--app-bg)] px-4 py-6 text-[var(--app-text)] sm:px-6 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-[1500px] space-y-5">
            <header className="flex min-h-[58px] items-center justify-between gap-1 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2 py-2 shadow-md sm:gap-3 sm:px-4">
                <div className="flex shrink-0 items-center gap-1 sm:gap-2"><button onClick={() => { const today = new Date(); setAnchor(today); setSelectedDate(today); }} className="rounded-full border border-[var(--app-border)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] sm:px-4 sm:text-sm">Today</button><button className={`${button} h-9 w-9 p-0`} aria-label="Previous week" onClick={() => { const next = addDays(anchor, -7); setAnchor(next); setSelectedDate(next); }}><ArrowLeft size={16} /></button></div>
                <h1 className="min-w-0 flex-1 truncate text-center text-[11px] font-bold sm:text-sm">{weekLabel}</h1>
                <div className="flex shrink-0 items-center gap-1 sm:gap-2"><button className={`${button} h-9 w-9 p-0`} aria-label="Next week" onClick={() => { const next = addDays(anchor, 7); setAnchor(next); setSelectedDate(next); }}><ArrowRight size={16} /></button><button onClick={() => { timer.start(); window.location.assign('/timer'); }} aria-label="Study now" title="Study now" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-color)] text-xs font-bold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"><Play size={14} /> <span className="hidden sm:inline">Study now</span></button><button onClick={() => setSelection({ date: selectedDate, startMinutes: 60, endMinutes: 120 })} aria-label="Schedule session" title="Schedule session" className={`${button} h-9 w-9 p-0`}><Plus size={17} /></button></div>
            </header>
            {error && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4" role="alert"><p className="text-sm">{error}</p><button className={button} onClick={() => void load()}><RotateCcw size={15} /> Try again</button></div>}
            {notice && <p role="status" className="rounded-2xl border border-[var(--accent-color)]/30 bg-[var(--accent-color)]/10 px-4 py-3 text-sm">{notice}</p>}
            {loading && scheduled.length === 0 ? <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-10 text-center text-sm text-[var(--app-text-muted)]" role="status">Loading your week…</div> : <>
                <AiPlannerPlaceholder />
                <WeeklyTimeGrid dates={dates} scheduled={scheduled} subjects={subjects} topics={topics} onCreate={setSelection} onEdit={setEditingSession} onMove={moveSession} />
            </>}
        </div>
        {(selection || editingSession) && <CreateScheduledSessionDialog selection={selection ?? { date: selectedDate, startMinutes: 60, endMinutes: 120 }} session={editingSession ?? undefined} subjects={subjects} topics={topics} onClose={() => { setSelection(null); setEditingSession(null); }} onCreated={() => void handleSaved()} onSubjectCreated={addSubject} onTopicCreated={addTopic} />}
    </main>;
};
