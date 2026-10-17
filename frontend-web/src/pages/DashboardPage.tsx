import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BookOpen, CalendarDays, Clock3, Flame, RotateCcw, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { statsService, type Heatmap, type WeeklyStats } from '../services/stats-service';
import { sessionService } from '../services/session-service';
import type { Session } from '../types/session';
import { addDays, dateKey, parseDateKey } from '../lib/planner-dates';

const card = 'rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-sm';
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const formatMinutes = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
const mondayOf = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));

function StatCard({ label, value, detail, icon: Icon, tint }: { label: string; value: string; detail: string; icon: typeof Clock3; tint: string }) {
    return <article className={`${card} p-5 transition-transform duration-200 hover:-translate-y-0.5`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">{label}</p><p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p><p className="mt-1 text-xs text-[var(--app-text-muted)]">{detail}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tint}`}><Icon size={19} /></span></div></article>;
}

export function DashboardPage() {
    const [heatmap, setHeatmap] = useState<Heatmap>({});
    const [weekly, setWeekly] = useState<WeeklyStats>({});
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [heatmapData, weeklyData, sessionData] = await Promise.all([statsService.getHeatmap(), statsService.getWeekly(), sessionService.getAll()]);
            setHeatmap(heatmapData);
            setWeekly(weeklyData);
            setSessions(sessionData);
        } catch {
            setError('We could not load your study stats. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { void load(); }, [load]);

    const now = new Date();
    const activeDayCount = Object.values(heatmap).filter((minutes) => minutes > 0).length;
    const totalMinutes = sessions.reduce((total, session) => total + (session.totalMinutes || 0), 0);
    const avgFocus = sessions.filter((session) => session.focusRating != null).reduce((sum, session, _, rated) => sum + (session.focusRating ?? 0) / rated.length, 0);
    const days = useMemo(() => {
        const today = new Date();
        const firstDay = addDays(mondayOf(today), -77);
        return Array.from({ length: 84 }, (_, index) => addDays(firstDay, index));
    }, []);
    const weeks = useMemo(() => {
        const today = new Date();
        const firstWeek = addDays(mondayOf(today), -77);
        return Array.from({ length: 12 }, (_, index) => addDays(firstWeek, index * 7));
    }, []);
    const weekRows = weeks.map((weekStart) => {
        const key = dateKey(weekStart);
        const total = weekly[key] ?? 0;
        const weekEnd = addDays(weekStart, 6);
        return { key, label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, minutes: Math.round(total * 60) };
    });
    const maxWeek = Math.max(60, ...weekRows.map((week) => week.minutes));
    const maxDay = Math.max(60, ...days.map((date) => heatmap[dateKey(date)] ?? 0));
    const ratedCount = sessions.filter((session) => session.focusRating != null).length;

    return <main className="min-h-full bg-[var(--app-bg)] px-4 py-6 text-[var(--app-text)] sm:px-6 lg:px-10 lg:py-9"><div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">Your progress, in focus</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Study stats</h1><p className="mt-1 text-sm text-[var(--app-text-muted)]">A clear view of your consistency and focused time.</p></div><Link to="/planner" className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-[var(--accent-color)]">Open planning <ArrowUpRight size={16} /></Link></header>
        {error && <div role="alert" className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}><p className="text-sm">{error}</p><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] px-4 py-2 text-sm font-semibold"><RotateCcw size={15} /> Try again</button></div>}
        {loading ? <div className={`${card} p-12 text-center text-sm text-[var(--app-text-muted)]`} role="status">Gathering your study activity…</div> : <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Study summary"><StatCard label="Focused time" value={formatMinutes(totalMinutes)} detail="Across completed sessions" icon={Clock3} tint="bg-[var(--accent-color)]/10 text-[var(--accent-color)]" /><StatCard label="Sessions" value={String(sessions.length)} detail="Logged study sessions" icon={BookOpen} tint="bg-sky-500/10 text-sky-500" /><StatCard label="Active days" value={String(activeDayCount)} detail="Days with recorded study" icon={Flame} tint="bg-amber-500/10 text-amber-500" /><StatCard label="Average focus" value={ratedCount ? `${avgFocus.toFixed(1)} / 5` : '—'} detail={ratedCount ? `${ratedCount} rated sessions` : 'No ratings yet'} icon={Star} tint="bg-violet-500/10 text-violet-500" /></section>
            <section className={`${card} p-5 sm:p-7`} aria-labelledby="activity-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-color)]">Keep showing up</p><h2 id="activity-title" className="mt-1 text-xl font-bold">Study activity</h2></div><span className="inline-flex items-center gap-2 text-xs text-[var(--app-text-muted)]"><CalendarDays size={15} /> Last 12 weeks</span></div><div className="mt-5 overflow-x-auto pb-2"><div className="grid min-w-[620px] grid-cols-[2rem_repeat(12,minmax(0,1fr))] gap-1.5"><span aria-hidden="true" className="h-5" />{Array.from({ length: 12 }, (_, weekIndex) => <span key={`week-${weekIndex}`} className="h-5 text-center text-[9px] text-[var(--app-text-muted)]">{weeks[weekIndex]?.toLocaleDateString('en-US', { month: 'short' })}</span>)}{dayNames.map((day, dayIndex) => <div key={`row-${day}`} className="contents"><span className="flex h-4 items-center text-[9px] text-[var(--app-text-muted)]">{day}</span>{Array.from({ length: 12 }, (_, weekIndex) => {
                const date = days[weekIndex * 7 + dayIndex];
                const minutes = heatmap[dateKey(date)] ?? 0;
                const intensity = minutes === 0 ? 0 : Math.min(4, Math.ceil(minutes / Math.max(1, maxDay) * 4));
                return <span key={dateKey(date)} title={`${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: ${minutes} minutes`} aria-label={`${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: ${minutes} study minutes`} className={`h-4 rounded-[4px] ${intensity === 0 ? 'bg-[var(--app-bg)]' : intensity === 1 ? 'bg-[var(--accent-color)]/25' : intensity === 2 ? 'bg-[var(--accent-color)]/45' : intensity === 3 ? 'bg-[var(--accent-color)]/70' : 'bg-[var(--accent-color)]'}`} />;
            })}</div>)}</div></div><div className="mt-3 flex items-center justify-between text-[10px] text-[var(--app-text-muted)]"><span>{days[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><span className="flex items-center gap-1.5">Less {['bg-[var(--app-bg)]', 'bg-[var(--accent-color)]/25', 'bg-[var(--accent-color)]/45', 'bg-[var(--accent-color)]/70', 'bg-[var(--accent-color)]'].map((tone) => <i key={tone} className={`h-2.5 w-2.5 rounded-sm ${tone}`} />)} More</span><span>{now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div></section>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><section className={`${card} p-5 sm:p-7`} aria-labelledby="weekly-title"><div className="flex items-center gap-2"><TrendingUp size={18} className="text-[var(--accent-color)]" /><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-color)]">Find your rhythm</p><h2 id="weekly-title" className="mt-0.5 text-xl font-bold">Weekly focus</h2></div></div>{weekRows.length && weekRows.every((week) => week.minutes === 0) ? <p className="mt-5 rounded-2xl border border-dashed border-[var(--app-border)] p-5 text-sm text-[var(--app-text-muted)]">Your weekly totals will appear after you log study sessions.</p> : <div className="mt-5 space-y-4">{weekRows.map((week) => <div key={week.key}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="text-[var(--app-text-muted)]">{week.label}</span><span className="font-semibold">{formatMinutes(week.minutes)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[var(--app-bg)]"><div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-color)] to-violet-500 transition-[width] duration-500" style={{ width: `${Math.min(100, week.minutes / maxWeek * 100)}%` }} /></div></div>)}</div>}<p className="mt-4 text-[10px] text-[var(--app-text-muted)]">Weekly buckets follow the calendar week starting Monday.</p></section>
                <section className={`${card} p-5 sm:p-7`} aria-labelledby="recent-title"><div className="flex items-center gap-2"><Activity size={18} className="text-[var(--accent-color)]" /><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-color)]">Your latest work</p><h2 id="recent-title" className="mt-0.5 text-xl font-bold">Recent sessions</h2></div></div>{sessions.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[var(--app-border)] p-6 text-center"><p className="text-sm font-semibold">No sessions yet</p><p className="mt-1 text-xs text-[var(--app-text-muted)]">Complete a focus session to see your progress take shape.</p></div> : <ul className="mt-5 divide-y divide-[var(--app-border)]">{sessions.slice(0, 6).map((session) => { const date = parseDateKey(session.startedAt.slice(0, 10)); return <li key={session.id} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="truncate text-sm font-semibold">{session.title || 'Study session'}</p><p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? 'Date unavailable'}</p></div><span className="shrink-0 rounded-xl bg-[var(--accent-color)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--accent-color)]">{session.totalMinutes} min</span></li>; })}</ul>}</section></div>
        </>}
    </div></main>;
}
