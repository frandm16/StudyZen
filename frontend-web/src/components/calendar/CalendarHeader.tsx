import { useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    PanelLeft,
    PanelRight,
} from 'lucide-react';
import { startOfWeek, addDays } from '../../lib/planner-dates';
import type { CalendarView } from '../../types/calendar';

interface CalendarHeaderProps {
    date: Date;
    view: CalendarView;
    weekStartsOn: number;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    planningDrawerOpen: boolean;
    onTogglePlanningDrawer: () => void;
    onToday: () => void;
    onPrev: () => void;
    onNext: () => void;
    onViewChange: (view: CalendarView) => void;
    onCreateEvent: () => void;
}

export function CalendarHeader({
    date,
    view,
    weekStartsOn,
    sidebarOpen,
    onToggleSidebar,
    planningDrawerOpen,
    onTogglePlanningDrawer,
    onToday,
    onPrev,
    onNext,
    onViewChange,
}: CalendarHeaderProps) {
    const formattedTitle = useMemo(() => {
        if (view === 'day') {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        }
        if (view === 'month') {
            return date.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
            });
        }
        const start = startOfWeek(date, weekStartsOn);
        const end = addDays(start, 6);
        const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
        const year = end.getFullYear();

        if (startMonth === endMonth) {
            return `${start.getDate()} – ${end.getDate()} ${startMonth} ${year}`;
        }
        return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${year}`;
    }, [date, view, weekStartsOn]);

    return (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2.5 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label="Toggle calendar sidebar"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] text-[var(--app-text-muted)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--app-text)] ${
                        sidebarOpen ? 'text-[var(--accent-color)] border-[var(--accent-color)]/40' : ''
                    }`}
                >
                    <PanelLeft size={16} />
                </button>

                <button
                    type="button"
                    onClick={onToday}
                    className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-3 py-1.5 text-xs font-bold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                >
                    Today
                </button>

                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={onPrev}
                        aria-label="Previous"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-card-hover)] hover:text-[var(--app-text)]"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        aria-label="Next"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-card-hover)] hover:text-[var(--app-text)]"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <h1 className="text-sm font-bold tracking-tight text-[var(--app-text)] sm:text-base">
                    {formattedTitle}
                </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-0.5">
                    {(['day', 'week', 'month'] as const).map((v) => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => onViewChange(v)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                                view === v
                                    ? 'bg-[var(--accent-color)] font-bold text-[var(--app-bg)] shadow-xs'
                                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                            }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onTogglePlanningDrawer}
                    aria-label="Toggle planning desk"
                    className={`flex items-center gap-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-2.5 py-1.5 text-xs font-bold transition-colors hover:border-[var(--accent-color)] hover:text-[var(--app-text)] ${
                        planningDrawerOpen
                            ? 'border-[var(--accent-color)]/40 bg-[var(--accent-color)]/10 text-[var(--accent-color)]'
                            : 'text-[var(--app-text-muted)]'
                    }`}
                >
                    <PanelRight size={16} />
                    <span className="hidden sm:inline">Plan</span>
                </button>
            </div>
        </header>
    );
}
