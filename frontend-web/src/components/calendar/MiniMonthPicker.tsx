import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKey, monthDates, startOfWeek, addDays } from '../../lib/planner-dates';
import type { CalendarView } from '../../types/calendar';

interface MiniMonthPickerProps {
    selectedDate: Date;
    weekStartsOn: number;
    view: CalendarView;
    onSelectDate: (date: Date) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function MiniMonthPicker({
    selectedDate,
    weekStartsOn,
    view,
    onSelectDate,
}: MiniMonthPickerProps) {
    const [currentMonth, setCurrentMonth] = useState(
        () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );

    const today = useMemo(() => new Date(), []);
    const todayKey = dateKey(today);
    const selectedKey = dateKey(selectedDate);

    const weekRangeKeys = useMemo(() => {
        if (view !== 'week') return new Set<string>();
        const start = startOfWeek(selectedDate, weekStartsOn);
        const set = new Set<string>();
        for (let i = 0; i < 7; i++) {
            set.add(dateKey(addDays(start, i)));
        }
        return set;
    }, [selectedDate, weekStartsOn, view]);

    const days = useMemo(
        () => monthDates(currentMonth, weekStartsOn),
        [currentMonth, weekStartsOn]
    );

    const weekdayLabels = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => WEEKDAYS[(weekStartsOn + i) % 7]);
    }, [weekStartsOn]);

    const monthTitle = currentMonth.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    return (
        <div className="select-none px-1 py-2">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--app-text)]">
                    {monthTitle}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-card-hover)] hover:text-[var(--app-text)]"
                        aria-label="Previous month"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-card-hover)] hover:text-[var(--app-text)]"
                        aria-label="Next month"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-0.5 text-center">
                {weekdayLabels.map((label, idx) => (
                    <span
                        key={idx}
                        className="pb-1 text-[10px] font-semibold text-[var(--app-text-muted)]"
                    >
                        {label}
                    </span>
                ))}

                {days.map((day) => {
                    const key = dateKey(day);
                    const isToday = key === todayKey;
                    const isSelected = key === selectedKey;
                    const isInSelectedWeek = weekRangeKeys.has(key);
                    const inCurrentMonth = day.getMonth() === currentMonth.getMonth();

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => {
                                onSelectDate(day);
                                if (day.getMonth() !== currentMonth.getMonth()) {
                                    setCurrentMonth(new Date(day.getFullYear(), day.getMonth(), 1));
                                }
                            }}
                            className={`relative flex h-6 w-6 mx-auto items-center justify-center rounded-full text-[11px] transition-colors ${
                                isSelected
                                    ? 'bg-[var(--accent-color)] font-bold text-[var(--app-bg)]'
                                    : isToday
                                    ? 'border border-[var(--accent-color)] font-semibold text-[var(--accent-color)]'
                                    : isInSelectedWeek
                                    ? 'bg-[var(--accent-color)]/15 text-[var(--app-text)] font-medium'
                                    : inCurrentMonth
                                    ? 'text-[var(--app-text)] hover:bg-[var(--app-card-hover)]'
                                    : 'text-[var(--app-text-muted)]/40 hover:bg-[var(--app-card-hover)]'
                            }`}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
