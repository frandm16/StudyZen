import { useState, useMemo } from 'react';
import { dateKey, monthDates } from '../../lib/planner-dates';
import { DayEventsPopover } from '../calendar/DayEventsPopover';
import { SubjectChip } from '../calendar/SubjectChip';
import { getEventKindTheme } from '../../lib/calendar-theme';
import type { CalendarEventChip } from '../../types/calendar';

interface MonthCalendarProps {
    month: Date;
    selectedDate: Date;
    weekStartsOn: number;
    eventChips?: CalendarEventChip[];
    markers?: Map<string, string[]>;
    onSelect: (date: Date) => void;
    onSelectEvent?: (event: CalendarEventChip) => void;
    onCreateEventOnDate?: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthCalendar({
    month,
    selectedDate,
    weekStartsOn,
    eventChips = [],
    markers,
    onSelect,
    onSelectEvent,
    onCreateEventOnDate,
}: MonthCalendarProps) {
    const [popoverDate, setPopoverDate] = useState<Date | null>(null);

    const days = useMemo(() => monthDates(month, weekStartsOn), [month, weekStartsOn]);
    const labels = useMemo(
        () => Array.from({ length: 7 }, (_, index) => WEEKDAYS[(weekStartsOn + index) % 7]),
        [weekStartsOn]
    );

    const today = useMemo(() => new Date(), []);
    const todayKey = dateKey(today);
    const selectedKey = dateKey(selectedDate);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEventChip[]>();
        for (const chip of eventChips) {
            const list = map.get(chip.dateKey) ?? [];
            list.push(chip);
            map.set(chip.dateKey, list);
        }
        return map;
    }, [eventChips]);

    return (
        <section className="flex flex-col flex-1 h-full min-h-[550px] rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-2 sm:p-3 overflow-hidden select-none">
            <div className="grid grid-cols-7 border-b border-[var(--app-border)] pb-2 text-center">
                {labels.map((label) => (
                    <div
                        key={label}
                        className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]"
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-[var(--app-border)] border-b border-l border-[var(--app-border)]">
                {days.map((date) => {
                    const key = dateKey(date);
                    const isToday = key === todayKey;
                    const isSelected = key === selectedKey;
                    const inMonth = date.getMonth() === month.getMonth();
                    const dayEvents = eventsByDate.get(key) ?? [];
                    const visibleEvents = dayEvents.slice(0, 3);
                    const overflowCount = dayEvents.length - 3;
                    const marks = markers?.get(key) ?? [];

                    return (
                        <div
                            key={key}
                            onClick={() => onSelect(date)}
                            className={`group relative flex flex-col min-h-[90px] sm:min-h-[110px] p-1.5 transition-colors cursor-pointer ${
                                isSelected
                                    ? 'bg-[var(--accent-color)]/5 ring-1 ring-inset ring-[var(--accent-color)]'
                                    : inMonth
                                    ? 'hover:bg-[var(--app-card-hover)]/60'
                                    : 'bg-[var(--app-bg)]/40 hover:bg-[var(--app-card-hover)]/30'
                            }`}
                        >
                            <div className="flex items-center justify-between pb-1">
                                {marks.length > 0 && (
                                    <div className="flex gap-0.5">
                                        {marks.slice(0, 3).map((mark, i) => (
                                            <span
                                                key={i}
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    mark === 'Exam'
                                                        ? 'bg-rose-500'
                                                        : mark === 'Task'
                                                        ? 'bg-amber-500'
                                                        : 'bg-sky-500'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="ml-auto">
                                    <span
                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                            isToday
                                                ? 'bg-[var(--accent-color)] text-[var(--app-bg)] font-bold'
                                                : isSelected
                                                ? 'font-bold text-[var(--accent-color)]'
                                                : inMonth
                                                ? 'text-[var(--app-text)]'
                                                : 'text-[var(--app-text-muted)]/40'
                                        }`}
                                    >
                                        {date.getDate()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 overflow-hidden">
                                {visibleEvents.map((event) => {
                                    const theme = getEventKindTheme(event.kind);
                                    const subjectColor = event.subjectColor || event.color || 'var(--accent-color)';

                                    return (
                                        <button
                                            key={event.id}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectEvent?.(event);
                                            }}
                                            className="flex items-center gap-1.5 truncate rounded-lg px-2 py-1 text-left text-[11px] font-medium transition-all hover:brightness-110 shadow-xs min-h-[26px]"
                                            style={{
                                                backgroundColor: theme.backgroundColor,
                                                color: theme.textColor,
                                                border: `1px solid ${theme.borderColor}`,
                                            }}
                                            title={`${event.timeLabel ? event.timeLabel + ' ' : ''}${event.title}`}
                                        >
                                            {event.timeLabel && (
                                                <span className="shrink-0 text-[10px] font-mono text-white/80">
                                                    {event.timeLabel}
                                                </span>
                                            )}
                                            <SubjectChip name={event.subjectName} color={subjectColor} />
                                            <span className={`truncate ${event.completed ? 'line-through opacity-75' : ''}`}>
                                                {event.title}
                                            </span>
                                        </button>
                                    );
                                })}

                                {overflowCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPopoverDate(date);
                                        }}
                                        className="self-start rounded px-1 text-[10px] font-bold text-[var(--accent-color)] hover:underline"
                                    >
                                        +{overflowCount} more
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {popoverDate && (
                <DayEventsPopover
                    date={popoverDate}
                    events={eventsByDate.get(dateKey(popoverDate)) ?? []}
                    onClose={() => setPopoverDate(null)}
                    onSelectEvent={(event) => onSelectEvent?.(event)}
                    onCreateEventOnDate={(d) => onCreateEventOnDate?.(d)}
                />
            )}
        </section>
    );
}

export function moveMonth(date: Date, amount: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}
