import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BookOpen, CalendarDays, Clock3, Flame, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { statsService, type Heatmap, type WeeklyStats } from '../services/stats-service';
import { sessionService } from '../services/session-service';
import type { Session } from '../types/session';
import { addDays, dateKey, parseDateKey } from '../lib/planner-dates';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';

const card = 'app-section-surface';
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const formatMinutes = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
const mondayOf = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));

function StatCard({ label, value, detail, icon: Icon, tint }: { label: string; value: string; detail: string; icon: typeof Clock3; tint: string }) {
    return <article className={`${card} px-5 py-5 transition-colors hover:border-[var(--accent-color)]`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{value}</p><p className="mt-1 text-xs text-[var(--app-text-muted)]">{detail}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-full ${tint}`}><Icon size={19} /></span></div></article>;
}

function DashboardSkeleton({ weeks }: { weeks: Date[] }) {
    return <div className="space-y-5" role="status" aria-label="Loading study statistics">
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <article key={index} className={`${card} px-5 py-5`}><div className="flex items-start justify-between gap-3"><div className="flex-1 space-y-3"><Skeleton className="h-3 w-28" /><Skeleton className="h-9 w-32" /><Skeleton className="h-3 w-40" /></div><Skeleton className="h-10 w-10" rounded="full" /></div></article>)}</div>
        <section className={`${card} px-3 py-6 sm:px-4 sm:py-7`} aria-hidden="true">
            <div className="flex flex-wrap items-end justify-between gap-3"><div className="space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-6 w-36" /></div><Skeleton className="h-4 w-24" /></div>
            <div className="mt-5 overflow-x-auto pb-2"><div className="grid min-w-[620px] grid-cols-[2rem_repeat(12,minmax(0,1fr))] gap-1.5">
                <span className="h-5" />{weeks.map((_, index) => <Skeleton key={`month-${index}`} className="h-5 w-8 justify-self-center" />)}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="contents"><Skeleton className="h-4 w-6" />{weeks.map((_, index) => <Skeleton key={`${day}-${index}`} className="h-4 w-full" rounded="sm" />)}</div>)}
            </div></div>
            <div className="mt-3 flex items-center justify-between text-[10px]"><Skeleton className="h-3 w-12" /><div className="flex items-center gap-1.5"><Skeleton className="h-3 w-7" />{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-2.5 w-2.5" rounded="sm" />)}<Skeleton className="h-3 w-7" /></div><Skeleton className="h-3 w-12" /></div>
        </section>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className={`${card} px-3 py-6 sm:px-4 sm:py-7`} aria-hidden="true"><div className="flex items-center gap-2"><Skeleton className="h-5 w-5" rounded="full" /><div className="space-y-1"><Skeleton className="h-3 w-28" /><Skeleton className="h-6 w-36" /></div></div><div className="mt-5 space-y-4">{weeks.map((_, index) => <div key={index}><div className="mb-1.5 flex items-center justify-between gap-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-12" /></div><Skeleton className="h-2 w-full" rounded="full" /></div>)}</div><Skeleton className="mt-4 h-3 w-64" /></section>
            <section className={`${card} px-3 py-6 sm:px-4 sm:py-7`} aria-hidden="true"><div className="flex items-center gap-2"><Skeleton className="h-5 w-5" rounded="full" /><div className="space-y-1"><Skeleton className="h-3 w-28" /><Skeleton className="h-6 w-40" /></div></div><ul className="mt-5 divide-y divide-[var(--app-border)]">{Array.from({ length: 6 }, (_, index) => <li key={index} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div className="min-w-0 flex-1 space-y-1.5"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div><Skeleton className="h-6 w-16" rounded="lg" /></li>)}</ul></section>
        </div>
    </div>;
}

export function DashboardPage() {
    const notify = useToast();
    const [heatmap, setHeatmap] = useState<Heatmap>({});
    const [weekly, setWeekly] = useState<WeeklyStats>({});
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [heatmapData, weeklyData, sessionData] = await Promise.all([statsService.getHeatmap(), statsService.getWeekly(), sessionService.getAll()]);
            setHeatmap(heatmapData);
            setWeekly(weeklyData);
            setSessions(sessionData);
        } catch (failure) {
            notify({ title: 'Could not load study stats', description: getApiErrorMessage(failure), tone: 'error', persist: false });
        } finally {
            setLoading(false);
        }
    }, [notify]);
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

    return <main className="app-page-frame"><div className="app-page-content space-y-5">
        <header className="flex flex-col gap-5 border-b border-[var(--app-border)] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-black text-[var(--app-text)] sm:text-3xl">Study stats</h1><p className="mt-1 text-xs text-[var(--app-text-muted)]">Track your study time, consistency, and focus progress over time.</p></div><Link to="/planner" className="inline-flex min-h-9 items-center gap-2 self-start rounded-xl bg-[var(--accent-color)] px-4 py-2 text-xs font-bold text-[var(--app-bg)] transition-colors hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] sm:self-auto">Open planning <ArrowUpRight size={15} /></Link></header>
        {loading ? <DashboardSkeleton weeks={weeks} /> : <div className="space-y-5">
            <section className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Study summary"><StatCard label="Focused time" value={formatMinutes(totalMinutes)} detail="Across completed sessions" icon={Clock3} tint="bg-[var(--accent-color)]/10 text-[var(--accent-color)]" /><StatCard label="Sessions" value={String(sessions.length)} detail="Logged study sessions" icon={BookOpen} tint="bg-sky-500/10 text-sky-500" /><StatCard label="Active days" value={String(activeDayCount)} detail="Days with recorded study" icon={Flame} tint="bg-amber-500/10 text-amber-500" /><StatCard label="Average focus" value={ratedCount ? `${avgFocus.toFixed(1)} / 5` : '—'} detail={ratedCount ? `${ratedCount} rated sessions` : 'No ratings yet'} icon={Star} tint="bg-violet-500/10 text-violet-500" /></section>
            <section className={`${card} px-3 py-6 sm:px-4 sm:py-7`} aria-labelledby="activity-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-color)]">Keep showing up</p><h2 id="activity-title" className="mt-1 text-xl font-bold">Study activity</h2></div><span className="inline-flex items-center gap-2 text-xs text-[var(--app-text-muted)]"><CalendarDays size={15} /> Last 12 weeks</span></div><div className="mt-5 overflow-x-auto pb-2"><div className="grid min-w-[620px] grid-cols-[2rem_repeat(12,minmax(0,1fr))] gap-1.5"><span aria-hidden="true" className="h-5" />{Array.from({ length: 12 }, (_, weekIndex) => <span key={`week-${weekIndex}`} className="h-5 text-center text-[9px] text-[var(--app-text-muted)]">{weeks[weekIndex]?.toLocaleDateString('en-US', { month: 'short' })}</span>)}{dayNames.map((day, dayIndex) => <div key={`row-${day}`} className="contents"><span className="flex h-4 items-center text-[9px] text-[var(--app-text-muted)]">{day}</span>{Array.from({ length: 12 }, (_, weekIndex) => {
                const date = days[weekIndex * 7 + dayIndex];
                const minutes = heatmap[dateKey(date)] ?? 0;
                const intensity = minutes === 0 ? 0 : Math.min(4, Math.ceil(minutes / Math.max(1, maxDay) * 4));
                return <span key={dateKey(date)} title={`${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: ${minutes} minutes`} aria-label={`${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: ${minutes} study minutes`} className={`h-4 rounded-[4px] ${intensity === 0 ? 'bg-[var(--app-bg)]' : intensity === 1 ? 'bg-[var(--accent-color)]/25' : intensity === 2 ? 'bg-[var(--accent-color)]/45' : intensity === 3 ? 'bg-[var(--accent-color)]/70' : 'bg-[var(--accent-color)]'}`} />;
            })}</div>)}</div></div><div className="mt-3 flex items-center justify-between text-[10px] text-[var(--app-text-muted)]"><span>{days[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><span className="flex items-center gap-1.5">Less {['bg-[var(--app-bg)]', 'bg-[var(--accent-color)]/25', 'bg-[var(--accent-color)]/45', 'bg-[var(--accent-color)]/70', 'bg-[var(--accent-color)]'].map((tone) => <i key={tone} className={`h-2.5 w-2.5 rounded-sm ${tone}`} />)} More</span><span>{now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div></section>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><section className={`${card} px-3 py-6 sm:px-4 sm:py-7`} aria-labelledby="weekly-title"><div className="flex items-center gap-2"><TrendingUp size={18} className="text-[var(--accent-color)]" /><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-color)]">Find your rhythm</p><h2 id="weekly-title" className="mt-0.5 text-xl font-bold">Weekly focus</h2></div></div>{weekRows.length && weekRows.every((week) => week.minutes === 0) ? <p className="mt-5 rounded-2xl border border-dashed border-[var(--app-border)] p-5 text-sm text-[var(--app-text-muted)]">Your weekly totals will appear after you log study sessions.</p> : <div className="mt-5 space-y-4">{weekRows.map((week) => <div key={week.key}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="text-[var(--app-text-muted)]">{week.label}</span><span className="font-semibold">{formatMinutes(week.minutes)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[var(--app-bg)]"><div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-color)] to-violet-500 transition-[width] duration-500" style={{ width: `${Math.min(100, week.minutes / maxWeek * 100)}%` }} /></div></div>)}</div>}<p className="mt-4 text-[10px] text-[var(--app-text-muted)]">Weekly buckets follow the calendar week starting Monday.</p></section>
                <section className={`${card} px-3 py-6 sm:px-4 sm:py-7`} aria-labelledby="recent-title"><div className="flex items-center gap-2"><Activity size={18} className="text-[var(--accent-color)]" /><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-color)]">Your latest work</p><h2 id="recent-title" className="mt-0.5 text-xl font-bold">Recent sessions</h2></div></div>{sessions.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[var(--app-border)] p-6 text-center"><p className="text-sm font-semibold">No sessions yet</p><p className="mt-1 text-xs text-[var(--app-text-muted)]">Complete a focus session to see your progress take shape.</p></div> : <ul className="mt-5 divide-y divide-[var(--app-border)]">{sessions.slice(0, 6).map((session) => { const date = parseDateKey(session.startedAt.slice(0, 10)); return <li key={session.id} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="truncate text-sm font-semibold">{session.title || 'Study session'}</p><p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? 'Date unavailable'}</p></div><span className="shrink-0 rounded-xl bg-[var(--accent-color)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--accent-color)]">{session.totalMinutes} min</span></li>; })}</ul>}</section></div>
        </div>}
    </div></main>;
}
