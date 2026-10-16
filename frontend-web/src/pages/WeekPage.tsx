import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, ExternalLink, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { deadlineService } from '../services/deadline-service';
import { scheduledSessionService } from '../services/scheduled-session-service';
import { sessionService } from '../services/session-service';
import { settingsService } from '../services/settings-service';
import { subjectService } from '../services/subject-service';
import { todoService } from '../services/todo-service';
import { topicService } from '../services/topic-service';
import { addDays, dateKey, localDateFromTimestamp, weekDates, weekRange } from '../lib/planner-dates';
import type { Deadline } from '../types/deadline';
import type { ScheduledSession } from '../types/scheduled-session';
import type { Session } from '../types/session';
import type { Subject } from '../types/subject';
import type { TodoItem } from '../types/todo-item';
import type { Topic } from '../types/topic';

const card = 'rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-sm';
const button = 'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]';

export const WeekPage = () => {
    const [anchor, setAnchor] = useState(new Date());
    const [selected, setSelected] = useState(new Date());
    const [weekStartsOn, setWeekStartsOn] = useState(1);
    const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busyId, setBusyId] = useState<number | null>(null);
    const dates = useMemo(() => weekDates(anchor, weekStartsOn), [anchor, weekStartsOn]);
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
                scheduledSessionService.getAll(start, end), deadlineService.getAll(start, end), sessionService.getByDateRange(start, end), subjectService.getAll(), topicService.getAll(), settingsService.getSettings(),
            ]);
            const todoDates = dates.map((date) => dateKey(date));
            const todoGroups = await Promise.all(todoDates.map((date) => todoService.getAll(date)));
            setScheduled(scheduledItems);
            setDeadlines(deadlineItems);
            setSessions(studySessions);
            setTodos(todoGroups.flat());
            setSubjects(subjectItems);
            setTopics(topicItems);
            const nextStart = Number.isInteger(settings.weekStartsOn) ? settings.weekStartsOn : 1;
            setWeekStartsOn(nextStart);
        } catch {
            setError('We could not load this week. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, [startKey, endKey, dates]);

    useEffect(() => { void load(); }, [load]);

    const subjectById = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);
    const topicById = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);
    const dayTotals = useMemo(() => new Map(dates.map((date) => {
        const key = dateKey(date);
        const planned = scheduled.filter((item) => { const value = localDateFromTimestamp(item.startedAt); return value && dateKey(value) === key; }).reduce((sum, item) => { const start = localDateFromTimestamp(item.startedAt)?.getTime() ?? 0; const end = localDateFromTimestamp(item.endedAt)?.getTime() ?? 0; return sum + Math.max(0, Math.round((end - start) / 60000)); }, 0);
        const studied = sessions.filter((item) => { const value = localDateFromTimestamp(item.startedAt); return value && dateKey(value) === key; }).reduce((sum, item) => sum + item.totalMinutes, 0);
        const due = deadlines.filter((item) => { const value = localDateFromTimestamp(item.dueAt); return value && dateKey(value) === key && !item.isCompleted; }).length;
        const done = todos.filter((item) => item.date === key && item.isCompleted).length;
        return [key, { planned, studied, due, done }];
    })), [dates, scheduled, sessions, deadlines, todos]);
    const selectedKey = dateKey(selected);
    const selectedScheduled = scheduled.filter((item) => { const value = localDateFromTimestamp(item.startedAt); return value && dateKey(value) === selectedKey; }).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const otherWeekSessions = scheduled.filter((item) => { const value = localDateFromTimestamp(item.startedAt); return value && dateKey(value) !== selectedKey; }).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const selectedDeadlines = deadlines.filter((item) => { const value = localDateFromTimestamp(item.dueAt); return value && dateKey(value) === selectedKey; });
    const selectedTodos = todos.filter((item) => item.date === selectedKey);
    const totalStudied = sessions.reduce((sum, item) => sum + item.totalMinutes, 0);
    const totalPlanned = [...dayTotals.values()].reduce((sum, item) => sum + item.planned, 0);
    const openDeadlines = deadlines.filter((item) => !item.isCompleted).length;
    const completedTodos = todos.filter((item) => item.isCompleted).length;

    const moveSession = async (item: ScheduledSession) => {
        const start = localDateFromTimestamp(item.startedAt);
        const end = localDateFromTimestamp(item.endedAt);
        if (!start || !end) return;
        const target = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), start.getHours(), start.getMinutes());
        const targetEnd = new Date(target.getTime() + (end.getTime() - start.getTime()));
        setBusyId(item.id);
        setNotice('');
        try {
            await scheduledSessionService.patch(item.id, { startedAt: target.toISOString(), endedAt: targetEnd.toISOString() });
            setNotice(`Moved “${item.title || topicById.get(item.topicId)?.name || 'Study session'}” to ${selected.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.`);
            await load();
        } catch {
            setNotice('Could not move this session. Please try again.');
        } finally {
            setBusyId(null);
        }
    };

    const weekLabel = `${dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${dates[6].toLocaleDateString('en-US', { month: dates[0].getMonth() === dates[6].getMonth() ? undefined : 'short', day: 'numeric', year: 'numeric' })}`;

    return <main className="min-h-full bg-[var(--app-bg)] px-4 py-6 text-[var(--app-text)] sm:px-6 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-7xl space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">Weekly rhythm</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Your week</h1><p className="mt-1 text-sm text-[var(--app-text-muted)]">Plan the workload. Leave room to breathe.</p></div><div className="flex items-center gap-2"><button className={button} onClick={() => { const today = new Date(); setAnchor(today); setSelected(today); }}>Today</button><button className={`${button} h-10 w-10 p-0`} aria-label="Previous week" onClick={() => { const next = addDays(anchor, -7); setAnchor(next); setSelected(next); }}><ArrowLeft size={17} /></button><span className="min-w-32 text-center text-sm font-semibold">{weekLabel}</span><button className={`${button} h-10 w-10 p-0`} aria-label="Next week" onClick={() => { const next = addDays(anchor, 7); setAnchor(next); setSelected(next); }}><ArrowRight size={17} /></button></div></header>
            {error && <div className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`} role="alert"><p className="text-sm">{error}</p><button className={button} onClick={() => void load()}><RotateCcw size={15} /> Try again</button></div>}
            {notice && <p role="status" className="rounded-2xl border border-[var(--accent-color)]/30 bg-[var(--accent-color)]/10 px-4 py-3 text-sm">{notice}</p>}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Weekly balance">
                {[{ label: 'Studied', value: `${totalStudied} min`, icon: Clock3, detail: 'Completed focus sessions' }, { label: 'Planned', value: `${totalPlanned} min`, icon: CalendarDays, detail: 'Scheduled study time' }, { label: 'Upcoming', value: String(openDeadlines), icon: ExternalLink, detail: 'Open deadlines this week' }, { label: 'Progress', value: `${completedTodos}/${todos.length}`, icon: CheckCircle2, detail: `${completedTodos} tasks checked off` }].map(({ label, value, icon: Icon, detail }) => <div key={label} className={`${card} p-4 sm:p-5`}><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]"><Icon size={15} />{label}</div><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-[var(--app-text-muted)]">{detail}</p></div>)}
            </section>
            <section className={`${card} p-3 sm:p-4`} aria-label="Days of the week"><div className="grid grid-cols-7 gap-1 sm:gap-2">{dates.map((date) => { const key = dateKey(date); const totals = dayTotals.get(key)!; const active = key === selectedKey; return <button key={key} type="button" onClick={() => setSelected(date)} aria-pressed={active} className={`min-w-0 rounded-2xl p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] sm:p-3 ${active ? 'bg-[var(--accent-color)] text-white' : 'hover:bg-[var(--app-bg)]'}`}><span className={`block text-[10px] font-semibold uppercase sm:text-xs ${active ? 'text-white/75' : 'text-[var(--app-text-muted)]'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span><span className="mt-1 block text-lg font-bold">{date.getDate()}</span><span className={`mt-2 block text-[9px] leading-tight sm:text-[10px] ${active ? 'text-white/80' : 'text-[var(--app-text-muted)]'}`}>{totals.studied}m done</span><span className={`mt-1 hidden text-[10px] sm:block ${active ? 'text-white/75' : 'text-[var(--app-text-muted)]'}`}>{totals.due} due · {totals.done} tasks</span></button>; })}</div></section>
            <section className={`${card} p-5 sm:p-7`} aria-labelledby="agenda-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-color)]">Selected day</p><h2 id="agenda-title" className="mt-1 text-2xl font-bold">{selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2></div><Link to="/day" className="text-sm font-semibold text-[var(--accent-color)] hover:underline">Open day view <span aria-hidden="true">→</span></Link></div>
                {loading ? <p className="py-10 text-center text-sm text-[var(--app-text-muted)]">Loading your week…</p> : <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><div><h3 className="mb-3 text-sm font-bold">Study plan</h3>{selectedScheduled.length === 0 ? <p className="rounded-2xl border border-dashed border-[var(--app-border)] p-5 text-sm text-[var(--app-text-muted)]">Nothing scheduled yet. Use Day to add a focused study block.</p> : <ul className="space-y-2">{selectedScheduled.map((item) => { const start = localDateFromTimestamp(item.startedAt); const end = localDateFromTimestamp(item.endedAt); const topic = topicById.get(item.topicId); const subject = topic ? subjectById.get(topic.subjectId) : undefined; return <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--app-bg)] p-4"><div className="min-w-0"><p className="truncate font-semibold">{item.title || topic?.name || 'Study session'}</p><p className="mt-1 text-xs text-[var(--app-text-muted)]">{start?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – {end?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}{subject ? ` · ${subject.name}` : ''}</p></div><button className={button} onClick={() => void moveSession(item)} disabled={busyId === item.id || dateKey(localDateFromTimestamp(item.startedAt) ?? new Date(0)) === selectedKey}><RotateCcw size={14} />{busyId === item.id ? 'Moving…' : 'Move here'}</button></li>; })}</ul>}</div>
                    <div className="space-y-5"><div><h3 className="mb-3 text-sm font-bold">More in this week</h3>{otherWeekSessions.length ? <ul className="mb-4 space-y-2">{otherWeekSessions.map((item) => { const date = localDateFromTimestamp(item.startedAt); const topic = topicById.get(item.topicId); return <li key={item.id} className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--app-bg)] p-3"><span className="min-w-0 truncate text-sm">{item.title || topic?.name || 'Study session'} · {date?.toLocaleDateString('en-US', { weekday: 'short' })}</span><button className="shrink-0 text-xs font-semibold text-[var(--accent-color)] hover:underline" onClick={() => void moveSession(item)} disabled={busyId === item.id}>Move to selected day</button></li>; })}</ul> : <p className="mb-4 text-sm text-[var(--app-text-muted)]">No other sessions scheduled.</p>}<h3 className="mb-3 text-sm font-bold">Deadlines</h3>{selectedDeadlines.length ? <ul className="space-y-2">{selectedDeadlines.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--app-bg)] p-3"><span className="truncate text-sm font-medium">{item.title}</span><span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-600">{item.type}</span></li>)}</ul> : <p className="text-sm text-[var(--app-text-muted)]">No deadlines due this day.</p>}</div><div><h3 className="mb-3 text-sm font-bold">To-dos</h3>{selectedTodos.length ? <ul className="space-y-2">{selectedTodos.map((item) => <li key={item.id} className="flex items-center gap-2 rounded-2xl bg-[var(--app-bg)] p-3 text-sm"><span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${item.isCompleted ? 'bg-emerald-500' : 'bg-[var(--accent-color)]'}`} /><span className={item.isCompleted ? 'text-[var(--app-text-muted)] line-through' : ''}>{item.text}</span></li>)}</ul> : <p className="text-sm text-[var(--app-text-muted)]">No to-dos for this day.</p>}</div></div></div>}
            </section>
            {loading && <span className="sr-only" role="status">Loading weekly data</span>}
        </div>
    </main>;
};
