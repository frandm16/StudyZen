import { CalendarCheck2, CheckCircle2, Clock3, Target } from 'lucide-react';
import { dateKey } from '../../lib/planner-dates';

interface WeekOverviewProps {
    dates: Date[];
    selectedDate: Date;
    studiedMinutes: number;
    plannedMinutes: number;
    openDeadlines: number;
    completedTodos: number;
    totalTodos: number;
    dailyMinutes: Map<string, number>;
    onSelectDate: (date: Date) => void;
}

const metricCard = 'rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4';

export function WeekOverview({ dates, selectedDate, studiedMinutes, plannedMinutes, openDeadlines, completedTodos, totalTodos, dailyMinutes, onSelectDate }: WeekOverviewProps) {
    const metrics = [
        { label: 'Focused', value: `${studiedMinutes} min`, hint: 'time studied', icon: Clock3 },
        { label: 'Planned', value: `${plannedMinutes} min`, hint: 'study blocks', icon: CalendarCheck2 },
        { label: 'Deadlines', value: String(openDeadlines), hint: 'still to do', icon: Target },
        { label: 'Tasks', value: `${completedTodos}/${totalTodos}`, hint: 'completed', icon: CheckCircle2 },
    ];
    return <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-5 shadow-sm sm:p-7" aria-labelledby="week-overview-title">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-color)]">Your weekly pulse</p><h2 id="week-overview-title" className="mt-1 text-xl font-bold sm:text-2xl">A week in balance</h2></div><p className="text-xs text-[var(--app-text-muted)]">Study, deadlines and progress</p></div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">{metrics.map(({ label, value, hint, icon: Icon }) => <div key={label} className={metricCard}><div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)] sm:text-xs"><Icon size={14} />{label}</div><p className="mt-2 text-xl font-bold sm:text-2xl">{value}</p><p className="mt-0.5 text-[10px] text-[var(--app-text-muted)] sm:text-xs">{hint}</p></div>)}</div>
        <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">{dates.map((date) => { const key = dateKey(date); const active = dateKey(selectedDate) === key; const minutes = dailyMinutes.get(key) ?? 0; const bar = Math.min(100, minutes / Math.max(1, Math.max(...dailyMinutes.values(), 60)) * 100); return <button key={key} onClick={() => onSelectDate(date)} aria-pressed={active} aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, ${minutes} planned minutes`} className={`rounded-xl px-1.5 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] sm:rounded-2xl sm:p-3 ${active ? 'bg-[var(--accent-color)] text-white' : 'hover:bg-[var(--app-bg)]'}`}><span className={`block text-[9px] font-semibold uppercase sm:text-[10px] ${active ? 'text-white/75' : 'text-[var(--app-text-muted)]'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span><span className="mt-1 block text-sm font-bold sm:text-base">{date.getDate()}</span><span className={`mx-auto mt-2 block h-1 max-w-10 rounded-full ${active ? 'bg-white/80' : 'bg-[var(--app-border)]'}`}><span className={`block h-full rounded-full ${active ? 'bg-white' : 'bg-[var(--accent-color)]'}`} style={{ width: `${bar}%` }} /></span><span className={`mt-1 block text-[9px] sm:text-[10px] ${active ? 'text-white/75' : 'text-[var(--app-text-muted)]'}`}>{minutes}m</span></button>; })}</div>
    </section>;
}
