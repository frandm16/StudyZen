import { dateKey, monthDates } from '../../lib/planner-dates';

interface MonthCalendarProps {
    month: Date;
    selectedDate: Date;
    weekStartsOn: number;
    markers: Map<string, string[]>;
    onSelect: (date: Date) => void;
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthCalendar({ month, selectedDate, weekStartsOn, markers, onSelect }: MonthCalendarProps) {
    const days = monthDates(month);
    const labels = Array.from({ length: 7 }, (_, index) => weekdays[(weekStartsOn + index) % 7]);
    return (
        <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm sm:p-6" aria-label="Monthly calendar">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {labels.map((label) => <div key={label} className="pb-2 text-center text-xs font-semibold text-[var(--app-text-muted)]">{label}</div>)}
                {days.map((date) => {
                    const key = dateKey(date);
                    const marks = markers.get(key) ?? [];
                    const active = dateKey(selectedDate) === key;
                    const inMonth = date.getMonth() === month.getMonth();
                    return <button key={key} type="button" onClick={() => onSelect(date)} aria-label={`${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}${marks.length ? `, ${marks.join(', ')}` : ''}`} aria-pressed={active}
                        className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] sm:min-h-16 ${active ? 'bg-[var(--accent-color)] font-bold text-white' : inMonth ? 'text-[var(--app-text)] hover:bg-[var(--app-bg)]' : 'text-[var(--app-text-muted)]/50 hover:bg-[var(--app-bg)]'}`}>
                        <span>{date.getDate()}</span>
                        <span aria-hidden="true" className="flex h-1.5 gap-0.5">{marks.slice(0, 3).map((mark, index) => <i key={`${mark}-${index}`} className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : mark === 'Goal' ? 'bg-[var(--accent-color)]' : mark === 'Exam' ? 'bg-rose-500' : mark === 'Task' ? 'bg-amber-500' : 'bg-sky-500'}`} />)}</span>
                    </button>;
                })}
            </div>
        </section>
    );
}

export function moveMonth(date: Date, amount: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

