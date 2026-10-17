import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { AiPlannerPlaceholder } from '../components/planner/AiPlannerPlaceholder';
import { CreateScheduledSessionDialog } from '../components/planner/CreateScheduledSessionDialog';
import { WeekOverview } from '../components/planner/WeekOverview';
import { WeeklyTimeGrid } from '../components/planner/WeeklyTimeGrid';
import { addDays, dateKey, localDateFromTimestamp, weekRange } from '../lib/planner-dates';
import { weekGridDates, type GridSelection } from '../lib/week-grid';
import { deadlineService } from '../services/deadline-service';
import { scheduledSessionService } from '../services/scheduled-session-service';
import { sessionService } from '../services/session-service';
import { settingsService } from '../services/settings-service';
import { subjectService } from '../services/subject-service';
import { todoService } from '../services/todo-service';
import { topicService } from '../services/topic-service';
import type { Deadline } from '../types/deadline';
import type { ScheduledSession } from '../types/scheduled-session';
import type { Session } from '../types/session';
import type { Subject } from '../types/subject';
import type { TodoItem } from '../types/todo-item';
import type { Topic } from '../types/topic';

const button = 'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]';

export const WeekPage = () => {
    const [anchor, setAnchor] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekStartsOn, setWeekStartsOn] = useState(1);
    const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selection, setSelection] = useState<GridSelection | null>(null);
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
            const [scheduledItems, deadlineItems, studySessions, subjectItems, topicItems, settings] = await Promise.all([
                scheduledSessionService.getAll(start, end),
                deadlineService.getAll(start, end),
                sessionService.getByDateRange(start, end),
                subjectService.getAll(),
                topicService.getAll(),
                settingsService.getSettings(),
            ]);
            const todoGroups = await Promise.all(dates.map((date) => todoService.getAll(dateKey(date))));
            setScheduled(scheduledItems);
            setDeadlines(deadlineItems);
            setSessions(studySessions);
            setTodos(todoGroups.flat());
            setSubjects(subjectItems);
            setTopics(topicItems);
            const nextWeekStartsOn = Number.isInteger(settings.weekStartsOn) ? settings.weekStartsOn : 1;
            setWeekStartsOn(nextWeekStartsOn);
        } catch {
            setError('We could not load this week. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, [startKey, endKey, dates]);

    useEffect(() => { void load(); }, [load]);

    const dailyMinutes = useMemo(() => new Map(dates.map((date) => {
        const key = dateKey(date);
        const minutes = scheduled.filter((item) => {
            const start = localDateFromTimestamp(item.startedAt);
            return start && dateKey(start) === key;
        }).reduce((sum, item) => {
            const start = localDateFromTimestamp(item.startedAt)?.getTime() ?? 0;
            const end = localDateFromTimestamp(item.endedAt)?.getTime() ?? 0;
            return sum + Math.max(0, Math.round((end - start) / 60000));
        }, 0);
        return [key, minutes];
    })), [dates, scheduled]);
    const plannedMinutes = [...dailyMinutes.values()].reduce((sum, minutes) => sum + minutes, 0);
    const studiedMinutes = sessions.reduce((sum, session) => sum + session.totalMinutes, 0);
    const openDeadlines = deadlines.filter((deadline) => !deadline.isCompleted).length;
    const completedTodos = todos.filter((todo) => todo.isCompleted).length;
    const weekLabel = `${dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${dates[6].toLocaleDateString('en-US', { month: dates[0].getMonth() === dates[6].getMonth() ? undefined : 'short', day: 'numeric', year: 'numeric' })}`;

    const handleCreated = async () => {
        setSelection(null);
        setNotice('Study session added to your week.');
        await load();
    };

    const addSubject = (subject: Subject) => setSubjects((current) => current.some((item) => item.id === subject.id) ? current : [...current, subject]);
    const addTopic = (topic: Topic) => setTopics((current) => current.some((item) => item.id === topic.id) ? current : [...current, topic]);

    return <main className="min-h-full bg-[var(--app-bg)] px-4 py-6 text-[var(--app-text)] sm:px-6 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-[1500px] space-y-5">
            <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">Weekly rhythm</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Your week</h1></div><div className="flex items-center gap-2"><button className={button} onClick={() => { const today = new Date(); setAnchor(today); setSelectedDate(today); }}>Today</button><button className={`${button} h-10 w-10 p-0`} aria-label="Previous week" onClick={() => { const next = addDays(anchor, -7); setAnchor(next); setSelectedDate(next); }}><ArrowLeft size={17} /></button><span className="min-w-32 text-center text-sm font-semibold">{weekLabel}</span><button className={`${button} h-10 w-10 p-0`} aria-label="Next week" onClick={() => { const next = addDays(anchor, 7); setAnchor(next); setSelectedDate(next); }}><ArrowRight size={17} /></button></div></header>
            {error && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4" role="alert"><p className="text-sm">{error}</p><button className={button} onClick={() => void load()}><RotateCcw size={15} /> Try again</button></div>}
            {notice && <p role="status" className="rounded-2xl border border-[var(--accent-color)]/30 bg-[var(--accent-color)]/10 px-4 py-3 text-sm">{notice}</p>}
            {loading && scheduled.length === 0 && sessions.length === 0 ? <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-10 text-center text-sm text-[var(--app-text-muted)]" role="status">Loading your week…</div> : <>
                <WeekOverview dates={dates} selectedDate={selectedDate} studiedMinutes={studiedMinutes} plannedMinutes={plannedMinutes} openDeadlines={openDeadlines} completedTodos={completedTodos} totalTodos={todos.length} dailyMinutes={dailyMinutes} onSelectDate={setSelectedDate} />
                <AiPlannerPlaceholder />
                <WeeklyTimeGrid dates={dates} scheduled={scheduled} subjects={subjects} topics={topics} onCreate={setSelection} />
            </>}
        </div>
        {selection && <CreateScheduledSessionDialog selection={selection} subjects={subjects} topics={topics} onClose={() => setSelection(null)} onCreated={() => void handleCreated()} onSubjectCreated={addSubject} onTopicCreated={addTopic} />}
    </main>;
};
