import { X, Plus } from 'lucide-react';
import { getEventKindTheme } from '../../lib/calendar-theme';
import { SubjectChip } from './SubjectChip';
import type { CalendarEventChip } from '../../types/calendar';

interface DayEventsPopoverProps {
    date: Date;
    events: CalendarEventChip[];
    onClose: () => void;
    onSelectEvent: (event: CalendarEventChip) => void;
    onCreateEventOnDate: (date: Date) => void;
}

export function DayEventsPopover({
    date,
    events,
    onClose,
    onSelectEvent,
    onCreateEventOnDate,
}: DayEventsPopoverProps) {
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-2.5">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-color)]">
                            All Events
                        </span>
                        <h3 className="text-sm font-bold text-[var(--app-text)]">{formattedDate}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-[var(--app-text-muted)] hover:bg-[var(--app-card-hover)] hover:text-[var(--app-text)]"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {events.length === 0 ? (
                        <p className="py-4 text-center text-xs text-[var(--app-text-muted)]">
                            No events scheduled for this day.
                        </p>
                    ) : (
                        events.map((event) => {
                            const theme = getEventKindTheme(event.kind);
                            const subjectColor = event.subjectColor || event.color || 'var(--accent-color)';
                            return (
                                <button
                                    key={event.id}
                                    type="button"
                                    onClick={() => {
                                        onSelectEvent(event);
                                        onClose();
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl p-2 text-left transition-all hover:brightness-110 shadow-xs"
                                    style={{
                                        backgroundColor: theme.backgroundColor,
                                        color: theme.textColor,
                                        border: `1px solid ${theme.borderColor}`,
                                    }}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {event.timeLabel && (
                                                <span className="text-[11px] font-mono text-white/80">
                                                    {event.timeLabel}
                                                </span>
                                            )}
                                            <SubjectChip name={event.subjectName} color={subjectColor} />
                                            <p className="truncate text-xs font-semibold">
                                                {event.title}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="mt-3 border-t border-[var(--app-border)] pt-2.5">
                    <button
                        type="button"
                        onClick={() => {
                            onCreateEventOnDate(date);
                            onClose();
                        }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-color)]/10 py-1.5 text-xs font-semibold text-[var(--accent-color)] transition-colors hover:bg-[var(--accent-color)]/20"
                    >
                        <Plus size={14} />
                        <span>Schedule on this date</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
