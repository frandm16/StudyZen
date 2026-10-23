import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../services/api';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3 } from 'lucide-react';
import { assessmentService } from '../services/assessment-service';
import { deadlineService } from '../services/deadline-service';
import { scheduledSessionService } from '../services/scheduled-session-service';
import { sessionService } from '../services/session-service';
import { settingsService } from '../services/settings-service';
import { studyGoalService } from '../services/study-goal-service';
import { subjectService } from '../services/subject-service';
import { todoService } from '../services/todo-service';
import { dateKey, dateKeyFromTimestamp, monthDates, parseDateKey } from '../lib/planner-dates';
import { GoalPanel, loadGoalProgressSessions } from '../components/planner/GoalPanel';
import { Skeleton, SkeletonRows } from '../components/ui/Skeleton';
import { MonthCalendar, moveMonth } from '../components/planner/MonthCalendar';
import type { Assessment } from '../types/assessment';
import type { Deadline } from '../types/deadline';
import type { ScheduledSession } from '../types/scheduled-session';
import type { StudyGoal } from '../types/study-goal';
import type { Subject } from '../types/subject';
import type { TodoItem } from '../types/todo-item';
import type { Session } from '../types/session';

const card = 'app-section-surface';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]';

export const PlannerPage = () => {
    const notify = useToast();
    const today = new Date();
    const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selected, setSelected] = useState(today);
    const [weekStartsOn, setWeekStartsOn] = useState(1);
    const [todoMonthDates, setTodoMonthDates] = useState<Date[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
    const [goals, setGoals] = useState<StudyGoal[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [monthSessions, setMonthSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const requestId = useRef(0);

    const load = useCallback(async () => {
        const currentRequest = ++requestId.current;
        const requestedMonth = `${month.getFullYear()}-${month.getMonth()}`;
        const isCurrent = () => currentRequest === requestId.current && requestedMonth === `${month.getFullYear()}-${month.getMonth()}`;
        setLoading(true);
        try {
            const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
            const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
            const start = `${dateKey(monthStart)} 00:00:00`;
            const end = `${dateKey(monthEnd)} 23:59:59`;
            const [deadlineItems, assessmentItems, scheduledItems, goalItems, subjectItems, settings, monthStudyItems] = await Promise.all([
                deadlineService.getAll(start, end), assessmentService.getAll(), scheduledSessionService.getAll(start, end), studyGoalService.getAll(), subjectService.getAll(), settingsService.getSettings(), sessionService.getByDateRange(start, end),
            ]);
            const nextWeekStartsOn = Number.isInteger(settings.weekStartsOn) ? settings.weekStartsOn : 1;
            const visibleDates = monthDates(month, nextWeekStartsOn);
            const todoGroups = await Promise.all(visibleDates.map((date) => todoService.getAll(dateKey(date))));
            const goalRangeStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            goalRangeStart.setDate(goalRangeStart.getDate() - (goalRangeStart.getDay() - (settings.weekStartsOn ?? 1) + 7) % 7);
            const progressSessions = await loadGoalProgressSessions(`${dateKey(goalRangeStart)} 00:00:00`, `${dateKey(today)} 23:59:59`);
            if (!isCurrent()) return;
            setDeadlines(deadlineItems);
            setAssessments(assessmentItems);
            setScheduled(scheduledItems);
            setMonthSessions(monthStudyItems);
            setGoals(goalItems);
            setSubjects(subjectItems);
            setTodos(todoGroups.flat());
            setSessions(progressSessions);
            setWeekStartsOn(nextWeekStartsOn);
            setTodoMonthDates(visibleDates);
        } catch (failure) {
            if (isCurrent()) notify({ title: 'Could not load planner', description: getApiErrorMessage(failure), tone: 'error', persist: false });
        } finally {
            if (isCurrent()) setLoading(false);
        }
    }, [month]);

    useEffect(() => {
        void load();
        return () => { requestId.current += 1; };
    }, [load]);
    const subjectById = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);
    const selectedKey = dateKey(selected);
    const markers = useMemo(() => {
        const map = new Map<string, string[]>();
        const add = (key: string | null, mark: string) => { if (key) map.set(key, [...(map.get(key) ?? []), mark]); };
        deadlines.forEach((item) => add(dateKeyFromTimestamp(item.dueAt), item.type === 'exam' ? 'Exam' : 'Deadline'));
        todos.forEach((item) => add(item.date, 'Task'));
        assessments.filter((item) => item.dueAt).forEach((item) => add(dateKeyFromTimestamp(item.dueAt ?? undefined), item.type.toLowerCase().includes('exam') ? 'Exam' : 'Assessment'));
        scheduled.forEach((item) => add(dateKeyFromTimestamp(item.startedAt), 'Study'));
        monthSessions.forEach((item) => add(dateKeyFromTimestamp(item.startedAt), 'Study'));
        if (goals.length) for (const date of todoMonthDates) map.set(dateKey(date), [...(map.get(dateKey(date)) ?? []), 'Goal']);
        return map;
    }, [deadlines, todos, assessments, scheduled, monthSessions, goals, todoMonthDates]);

    const upcomingDeadlines = useMemo(() => deadlines.filter((item) => !item.isCompleted && dateKeyFromTimestamp(item.dueAt) && (dateKeyFromTimestamp(item.dueAt) as string) >= dateKey(today)).sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 6), [deadlines]);
    const upcomingTodos = useMemo(() => todos.filter((item) => !item.isCompleted && parseDateKey(item.date) && item.date >= dateKey(today)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6), [todos]);
    const upcomingExams = useMemo(() => assessments.filter((item) => item.dueAt && !item.completed && dateKeyFromTimestamp(item.dueAt) && (dateKeyFromTimestamp(item.dueAt) as string) >= dateKey(today) && item.type.toLowerCase().includes('exam')).sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? '')).slice(0, 5), [assessments]);
    const selectedDeadlines = deadlines.filter((item) => dateKeyFromTimestamp(item.dueAt) === selectedKey);
    const selectedTodos = todos.filter((item) => item.date === selectedKey);
    const selectedAssessments = assessments.filter((item) => dateKeyFromTimestamp(item.dueAt ?? undefined) === selectedKey);
    const selectedScheduledSessions = scheduled.filter((item) => dateKeyFromTimestamp(item.startedAt) === selectedKey);
    const selectedStudySessions = monthSessions.filter((item) => dateKeyFromTimestamp(item.startedAt) === selectedKey);
    const selectDate = (date: Date) => { setSelected(date); if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); };
    const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return <main className="app-page-frame"><div className="app-page-content space-y-8 sm:space-y-10">
        <header className="app-page-header">
            <div className="flex min-w-0 items-center gap-2">
                <button className={`${button} px-3 py-2 text-xs sm:px-4 sm:text-sm`} onClick={() => { const current = new Date(); setMonth(new Date(current.getFullYear(), current.getMonth(), 1)); setSelected(current); }}>Today</button>
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]" aria-label="Previous month" onClick={() => setMonth((value) => moveMonth(value, -1))}><ArrowLeft size={17} /></button>
            </div>
            <h1 className="min-w-0 truncate text-center text-sm font-bold text-[var(--app-text)] sm:text-base">{monthLabel}</h1>
            <div className="flex justify-end">
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]" aria-label="Next month" onClick={() => setMonth((value) => moveMonth(value, 1))}><ArrowRight size={17} /></button>
            </div>
        </header>
        {loading && <span role="status" className="sr-only">Loading planner data</span>}
        <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_0.8fr]"><div className="space-y-5">{loading && monthSessions.length === 0 && scheduled.length === 0 && deadlines.length === 0 && assessments.length === 0 ? <section className="border-y border-[var(--app-border)] py-4 sm:py-6" aria-hidden="true"><div className="grid grid-cols-7 gap-1 sm:gap-2">{Array.from({ length: 42 }, (_, index) => <Skeleton key={index} className="h-12 sm:h-16" rounded="lg" />)}</div></section> : <MonthCalendar month={month} selectedDate={selected} weekStartsOn={weekStartsOn} markers={markers} onSelect={selectDate} />}<section className={`${card} px-2 py-6 sm:px-3 sm:py-7`}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-color)]">Selected date</p><h2 className="mt-1 text-xl font-bold">{selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2></div><div className="flex items-center gap-2"><Link to={`/day?date=${selectedKey}`} className={`${button} px-3 py-1.5 text-xs`}>Open day</Link><Link to={`/week?date=${selectedKey}`} className={`${button} px-3 py-1.5 text-xs`}>Open week</Link></div></div></div>{loading && selectedStudySessions.length === 0 && selectedScheduledSessions.length === 0 && selectedDeadlines.length === 0 && selectedAssessments.length === 0 && selectedTodos.length === 0 ? <div className="mt-4"><SkeletonRows count={3} /></div> : <div className="mt-4 space-y-2">{selectedScheduledSessions.map((item) => <div key={`scheduled-${item.id}`} className="flex items-center gap-3 rounded-2xl bg-[var(--app-bg)] p-3"><Clock3 size={16} className="shrink-0 text-[var(--app-text-muted)]" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title || 'Study session'}</p><p className="text-xs text-[var(--app-text-muted)]">Scheduled · {new Date(item.startedAt.replace(' ', 'T')).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}–{new Date(item.endedAt.replace(' ', 'T')).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p></div></div>)}{selectedStudySessions.map((item) => <div key={`studied-${item.id}`} className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] p-3"><Check size={16} className="shrink-0 text-[var(--accent-color)]" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title || 'Study session'}</p><p className="text-xs text-[var(--app-text-muted)]">Studied · {new Date(item.startedAt.replace(' ', 'T')).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}–{new Date(item.endedAt.replace(' ', 'T')).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · {item.totalMinutes} min</p></div></div>)}{selectedDeadlines.map((item) => <div key={`deadline-${item.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--app-bg)] p-3"><div><p className="text-sm font-semibold">{item.title}</p><p className="text-xs capitalize text-[var(--app-text-muted)]">{item.type} · {item.allDay ? 'All day' : new Date(item.dueAt.replace(' ', 'T')).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p></div><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs">{item.isCompleted ? 'Done' : item.urgency}</span></div>)}{selectedAssessments.map((item) => <div key={`assessment-${item.id}`} className="rounded-2xl bg-[var(--app-bg)] p-3"><p className="text-sm font-semibold">{item.title}</p><p className="text-xs capitalize text-[var(--app-text-muted)]">{item.type} · {subjectById.get(item.subjectId)?.name ?? 'Subject'}{item.completed ? ' · Completed' : ''}</p></div>)}{selectedTodos.map((item) => <div key={`todo-${item.id}`} className="flex items-center gap-3 rounded-2xl bg-[var(--app-bg)] p-3"><Check size={16} className={item.isCompleted ? 'text-emerald-500' : 'text-[var(--app-text-muted)]'} /><p className={`text-sm ${item.isCompleted ? 'text-[var(--app-text-muted)] line-through' : ''}`}>{item.text}</p></div>)}{!selectedScheduledSessions.length && !selectedStudySessions.length && !selectedDeadlines.length && !selectedAssessments.length && !selectedTodos.length && <p className="rounded-2xl border border-dashed border-[var(--app-border)] p-5 text-sm text-[var(--app-text-muted)]">No items planned for this date. Choose a small next step or enjoy the open space.</p>}</div>}</section></div>
            <div className="space-y-5">{loading && goals.length === 0 ? <section className={`${card} px-3 py-5`} aria-hidden="true"><Skeleton className="h-5 w-32" /><div className="mt-4"><SkeletonRows count={3} /></div></section> : <GoalPanel goals={goals} subjects={subjects} sessions={sessions} weekStartsOn={weekStartsOn} onChange={() => void load()} />}
                <section className={`${card} px-3 py-5`}><div className="flex items-center gap-2"><CalendarDays size={16} className="text-[var(--accent-color)]" /><h2 className="font-bold">Upcoming deadlines</h2></div>{loading && deadlines.length === 0 ? <div className="mt-4"><SkeletonRows count={3} /></div> : upcomingDeadlines.length ? <ul className="mt-4 space-y-3">{upcomingDeadlines.map((item) => <li key={item.id} className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title}</p><p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{new Date(item.dueAt.replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {item.type}</p></div><span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold capitalize">{item.urgency}</span></li>)}</ul> : <p className="mt-3 text-sm text-[var(--app-text-muted)]">No upcoming deadlines in this month.</p>}</section>
                <section className={`${card} px-3 py-5`}><div className="flex items-center gap-2"><Check size={16} className="text-[var(--accent-color)]" /><h2 className="font-bold">Upcoming to-dos</h2></div>{loading && todos.length === 0 ? <div className="mt-4"><SkeletonRows count={3} /></div> : upcomingTodos.length ? <ul className="mt-4 space-y-3">{upcomingTodos.map((item) => <li key={item.id} className="flex items-start justify-between gap-3"><p className="min-w-0 text-sm font-medium">{item.text}</p><span className="shrink-0 text-xs text-[var(--app-text-muted)]">{parseDateKey(item.date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></li>)}</ul> : <p className="mt-3 text-sm text-[var(--app-text-muted)]">No upcoming to-dos in this month.</p>}</section>
                <section className={`${card} px-3 py-5`}><div className="flex items-center gap-2"><CalendarDays size={16} className="text-rose-500" /><h2 className="font-bold">Upcoming exams</h2></div>{loading && assessments.length === 0 ? <div className="mt-4"><SkeletonRows count={3} /></div> : upcomingExams.length ? <ul className="mt-4 space-y-3">{upcomingExams.map((item) => <li key={item.id} className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title}</p><p className="text-xs text-[var(--app-text-muted)]">{subjectById.get(item.subjectId)?.name ?? 'Subject'}</p></div><span className="shrink-0 text-xs text-[var(--app-text-muted)]">{item.dueAt ? new Date(item.dueAt.replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span></li>)}</ul> : <p className="mt-3 text-sm text-[var(--app-text-muted)]">No upcoming exams in this month.</p>}<p className="mt-4 text-[10px] text-[var(--app-text-muted)]">Exam deadlines and gradebook assessments are shown as separate records.</p></section>
            </div></div>
        {loading && <span role="status" className="sr-only">Loading planner data</span>}
    </div></main>;
};
