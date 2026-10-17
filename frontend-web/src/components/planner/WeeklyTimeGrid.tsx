import { useRef, useState, type PointerEvent } from 'react';
import { Plus } from 'lucide-react';
import { dateKey, localDateFromTimestamp } from '../../lib/planner-dates';
import { buildGridSelection, gridMinutesFromPointer, WEEK_GRID_END_HOUR, WEEK_GRID_HEIGHT, WEEK_GRID_HOUR_HEIGHT, WEEK_GRID_MINUTES, WEEK_GRID_START_HOUR, type GridSelection } from '../../lib/week-grid';
import type { ScheduledSession } from '../../types/scheduled-session';
import type { Subject } from '../../types/subject';
import type { Topic } from '../../types/topic';

interface WeeklyTimeGridProps {
    dates: Date[];
    scheduled: ScheduledSession[];
    subjects: Subject[];
    topics: Topic[];
    onCreate: (selection: GridSelection) => void;
}

interface DragState {
    date: Date;
    pointerId: number;
    start: number;
    current: number;
}

const hourLabel = (hour: number) => new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric' });

export function WeeklyTimeGrid({ dates, scheduled, subjects, topics, onCreate }: WeeklyTimeGridProps) {
    const [drag, setDrag] = useState<DragState | null>(null);
    const dragRef = useRef<DragState | null>(null);
    const topicById = new Map(topics.map((topic) => [topic.id, topic]));
    const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
    const slots = scheduled.map((item) => {
        const start = localDateFromTimestamp(item.startedAt);
        const end = localDateFromTimestamp(item.endedAt);
        if (!start || !end) return null;
        const date = dateKey(start);
        const startMinutes = (start.getHours() - WEEK_GRID_START_HOUR) * 60 + start.getMinutes();
        const endMinutes = (end.getHours() - WEEK_GRID_START_HOUR) * 60 + end.getMinutes();
        if (endMinutes <= 0 || startMinutes >= WEEK_GRID_MINUTES) return null;
        const topic = topicById.get(item.topicId);
        const subject = topic ? subjectById.get(topic.subjectId) : undefined;
        return { item, date, top: Math.max(0, startMinutes) / 60 * WEEK_GRID_HOUR_HEIGHT, height: Math.max(18, (Math.min(WEEK_GRID_MINUTES, endMinutes) - Math.max(0, startMinutes)) / 60 * WEEK_GRID_HOUR_HEIGHT), topic, subject };
    }).filter((slot): slot is NonNullable<typeof slot> => Boolean(slot));

    const updateDrag = (event: PointerEvent<HTMLDivElement>) => {
        const current = dragRef.current;
        if (!current || current.pointerId !== event.pointerId) return;
        const value = gridMinutesFromPointer(event.clientY, event.currentTarget.getBoundingClientRect());
        const next = { ...current, current: value };
        dragRef.current = next;
        setDrag(next);
    };

    const startDrag = (event: PointerEvent<HTMLDivElement>, date: Date) => {
        if (event.button !== 0) return;
        const target = event.target;
        if (target instanceof Element && target.closest('[data-calendar-event="true"]')) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const value = gridMinutesFromPointer(event.clientY, event.currentTarget.getBoundingClientRect());
        const next = { date, pointerId: event.pointerId, start: value, current: value };
        dragRef.current = next;
        setDrag(next);
    };

    const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
        const current = dragRef.current;
        if (!current || current.pointerId !== event.pointerId) return;
        const value = gridMinutesFromPointer(event.clientY, event.currentTarget.getBoundingClientRect());
        const selection = buildGridSelection(current.date, current.start, value);
        dragRef.current = null;
        setDrag(null);
        onCreate(selection);
    };

    const quickCreate = (date: Date) => onCreate(buildGridSelection(date, 60, 120));

    return <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm sm:p-6" aria-label="Weekly study calendar">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-color)]">Make time for it</p><h2 className="mt-1 text-xl font-bold">Weekly calendar</h2></div><p className="text-xs text-[var(--app-text-muted)]">Drag across an open time to schedule a study session</p></div>
        <div className="overflow-x-auto pb-2">
            <div className="min-w-[900px]">
                <div className="grid grid-cols-[4.25rem_repeat(7,minmax(0,1fr))] border-b border-[var(--app-border)]">
                    <div className="pb-3" />
                    {dates.map((date) => <div key={dateKey(date)} className="px-2 pb-3 text-center"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p><p className="mt-1 text-sm font-bold">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>)}
                </div>
                <div className="grid grid-cols-[4.25rem_repeat(7,minmax(0,1fr))]">
                    <div className="relative" style={{ height: WEEK_GRID_HEIGHT }}>{Array.from({ length: WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR + 1 }, (_, index) => { const hour = WEEK_GRID_START_HOUR + index; return <span key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] text-[var(--app-text-muted)]" style={{ top: index * WEEK_GRID_HOUR_HEIGHT }}>{hourLabel(hour)}</span>; })}</div>
                    {dates.map((date) => {
                        const key = dateKey(date);
                        const daySlots = slots.filter((slot) => slot.date === key);
                        const range = drag && dateKey(drag.date) === key ? buildGridSelection(drag.date, drag.start, drag.current) : null;
                        return <div key={key} className="group relative border-l border-[var(--app-border)]" style={{ height: WEEK_GRID_HEIGHT }}>
                            <div className="absolute inset-0 grid" style={{ gridTemplateRows: `repeat(${WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR}, ${WEEK_GRID_HOUR_HEIGHT}px)` }} aria-hidden="true">{Array.from({ length: WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR }, (_, index) => <div key={index} className="border-t border-[var(--app-border)]/70" />)}</div>
                            <div className="absolute inset-0 touch-none select-none cursor-crosshair" onPointerDown={(event) => startDrag(event, date)} onPointerMove={updateDrag} onPointerUp={finishDrag} onPointerCancel={() => { dragRef.current = null; setDrag(null); }} role="presentation" aria-hidden="true" />
                            {daySlots.map(({ item, top, height, topic, subject }) => <div key={item.id} className="absolute inset-x-1 z-10 overflow-hidden rounded-lg border-l-[3px] px-1.5 py-1 text-[10px] shadow-sm sm:inset-x-1.5 sm:px-2" data-calendar-event="true" style={{ top, height, borderColor: subject?.color || 'var(--accent-color)', backgroundColor: `${subject?.color || 'var(--accent-color)'}24`, color: 'var(--app-text)' }} title={`${item.title || topic?.name || 'Study session'} · ${localDateFromTimestamp(item.startedAt)?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}><span className="block truncate font-semibold">{item.title || topic?.name || 'Study session'}</span>{height > 34 && <span className="block truncate opacity-75">{topic?.name || 'Study'}</span>}</div>)}
                            {range && <div className="pointer-events-none absolute inset-x-1 z-20 rounded-lg border-2 border-[var(--accent-color)] bg-[var(--accent-color)]/20" style={{ top: range.startMinutes / 60 * WEEK_GRID_HOUR_HEIGHT, height: Math.max(16, (range.endMinutes - range.startMinutes) / 60 * WEEK_GRID_HOUR_HEIGHT) }} aria-hidden="true" />}
                            <button type="button" onClick={() => quickCreate(date)} className="absolute right-1 top-1 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card-bg)] text-[var(--app-text-muted)] opacity-0 shadow-sm transition-opacity hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] focus:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--accent-color)] group-hover:opacity-100" aria-label={`Schedule a session on ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} from 9 to 10 AM`}><Plus size={14} /></button>
                        </div>;
                    })}
                </div>
            </div>
        </div>
        <p className="mt-2 text-[11px] text-[var(--app-text-muted)]">Calendar hours: 8 AM–9 PM. On a keyboard or touch screen, use the add-session button on a day.</p>
    </section>;
}
