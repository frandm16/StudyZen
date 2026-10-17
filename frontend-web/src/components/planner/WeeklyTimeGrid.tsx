import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Plus } from 'lucide-react';
import { dateKey, localDateFromTimestamp } from '../../lib/planner-dates';
import { buildGridSelection, gridMinutesFromPointer, layoutWeekGridIntervals, WEEK_GRID_END_HOUR, WEEK_GRID_HEIGHT, WEEK_GRID_HOUR_HEIGHT, WEEK_GRID_START_HOUR, type GridSelection } from '../../lib/week-grid';
import type { ScheduledSession } from '../../types/scheduled-session';
import type { Subject } from '../../types/subject';
import type { Topic } from '../../types/topic';

interface WeeklyTimeGridProps {
    dates: Date[];
    scheduled: ScheduledSession[];
    subjects: Subject[];
    topics: Topic[];
    onCreate: (selection: GridSelection) => void;
    onEdit: (session: ScheduledSession) => void;
    onMove: (session: ScheduledSession, date: Date, startMinutes: number) => void;
}

interface DragState {
    date: Date;
    pointerId: number;
    start: number;
    current: number;
}

const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

export function WeeklyTimeGrid({ dates, scheduled, subjects, topics, onCreate, onEdit, onMove }: WeeklyTimeGridProps) {
    const [drag, setDrag] = useState<DragState | null>(null);
    const [moving, setMoving] = useState<{ item: ScheduledSession; date: string; start: number; currentDate: string; current: number; pointerId: number; originX: number; originY: number; didMove: boolean } | null>(null);
    const movingRef = useRef<typeof moving>(null);
    const suppressClickRef = useRef<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<DragState | null>(null);
    const topicById = new Map(topics.map((topic) => [topic.id, topic]));
    const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
    const visibleDays = new Set(dates.map(dateKey));
    const visibleSlots = scheduled.flatMap((item) => {
        const start = localDateFromTimestamp(item.startedAt);
        const end = localDateFromTimestamp(item.endedAt);
        if (!start || !end || end.getTime() <= start.getTime()) return [];
        const topic = topicById.get(item.topicId);
        const subject = topic ? subjectById.get(topic.subjectId) : undefined;
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const pieces = [];
        for (const day = new Date(startDay); day <= endDay; day.setDate(day.getDate() + 1)) {
            const date = dateKey(day);
            if (!visibleDays.has(date)) continue;
            const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), WEEK_GRID_START_HOUR);
            const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), WEEK_GRID_END_HOUR);
            const clippedStart = Math.max(start.getTime(), dayStart.getTime());
            const clippedEnd = Math.min(end.getTime(), dayEnd.getTime());
            if (clippedEnd <= clippedStart) continue;
            const startMinutes = (clippedStart - dayStart.getTime()) / 60000;
            const endMinutes = (clippedEnd - dayStart.getTime()) / 60000;
            if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) continue;
            pieces.push({ item, date, key: `${item.id}:${date}`, startMinutes, endMinutes, topic, subject });
        }
        return pieces;
    });
    const layoutByKey = new Map(dates.flatMap((date) => layoutWeekGridIntervals(visibleSlots.filter((slot) => slot.date === dateKey(date)))).map((layout) => [layout.key, layout]));
    const slots = visibleSlots.flatMap((slot) => {
        const layout = layoutByKey.get(slot.key);
        if (!layout) return [];
        return [{ ...slot, lane: layout.lane, laneCount: layout.laneCount, laneSpan: layout.laneSpan, top: layout.startMinutes / 60 * WEEK_GRID_HOUR_HEIGHT, height: (layout.endMinutes - layout.startMinutes) / 60 * WEEK_GRID_HOUR_HEIGHT }];
    });

    const updateDrag = (event: PointerEvent<HTMLDivElement>) => {
        const current = dragRef.current;
        const column = event.currentTarget.closest('[data-calendar-day]');
        if (!current || current.pointerId !== event.pointerId || !(column instanceof HTMLElement)) return;
        const value = gridMinutesFromPointer(event.clientY, column.getBoundingClientRect());
        const next = { ...current, current: value };
        dragRef.current = next;
        setDrag(next);
    };

    const startDrag = (event: PointerEvent<HTMLDivElement>, date: Date) => {
        if (event.button !== 0) return;
        const target = event.target;
        if (target instanceof Element && target.closest('[data-calendar-event="true"]')) return;
        if (event.pointerType !== 'touch') event.preventDefault();
        const column = event.currentTarget.closest('[data-calendar-day]');
        if (!(column instanceof HTMLElement)) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const value = gridMinutesFromPointer(event.clientY, column.getBoundingClientRect());
        const next = { date, pointerId: event.pointerId, start: value, current: value };
        dragRef.current = next;
        setDrag(next);
    };

    const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
        const current = dragRef.current;
        if (!current || current.pointerId !== event.pointerId) return;
        const column = event.currentTarget.closest('[data-calendar-day]');
        if (!(column instanceof HTMLElement)) return;
        const value = gridMinutesFromPointer(event.clientY, column.getBoundingClientRect());
        const selection = buildGridSelection(current.date, current.start, value);
        dragRef.current = null;
        setDrag(null);
        onCreate(selection);
    };

    const startMove = (event: PointerEvent<HTMLDivElement>, item: ScheduledSession, date: string, start: number) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const next = { item, date, start, currentDate: date, current: start, pointerId: event.pointerId, originX: event.clientX, originY: event.clientY, didMove: false };
        dragRef.current = null;
        setDrag(null);
        event.currentTarget.setPointerCapture(event.pointerId);
        movingRef.current = next;
        setMoving(next);
    };

    const updateMove = (event: PointerEvent<HTMLDivElement>) => {
        const current = movingRef.current;
        const grid = gridRef.current;
        if (!current || current.pointerId !== event.pointerId || !grid) return;
        const bounds = grid.getBoundingClientRect();
        const dayIndex = Math.max(0, Math.min(dates.length - 1, Math.floor((event.clientX - bounds.left) / (bounds.width / dates.length))));
        const column = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-calendar-day]');
        const columnBounds = column instanceof HTMLElement ? column.getBoundingClientRect() : { ...bounds, top: bounds.top, height: WEEK_GRID_HEIGHT } as DOMRect;
        const next = { ...current, currentDate: dateKey(dates[dayIndex]), current: gridMinutesFromPointer(event.clientY, columnBounds), didMove: current.didMove || Math.abs(event.clientX - current.originX) > 4 || Math.abs(event.clientY - current.originY) > 4 };
        movingRef.current = next;
        setMoving(next);
    };

    const finishMove = (event: PointerEvent<HTMLDivElement>) => {
        const current = movingRef.current;
        if (!current || current.pointerId !== event.pointerId) return;
        const grid = gridRef.current;
        if (grid) {
            const bounds = grid.getBoundingClientRect();
            const dayIndex = Math.max(0, Math.min(dates.length - 1, Math.floor((event.clientX - bounds.left) / (bounds.width / dates.length))));
            const date = dates[dayIndex];
            const column = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-calendar-day]');
            const columnBounds = column instanceof HTMLElement ? column.getBoundingClientRect() : { ...bounds, top: bounds.top, height: WEEK_GRID_HEIGHT } as DOMRect;
            const start = gridMinutesFromPointer(event.clientY, columnBounds);
            movingRef.current = null;
            setMoving(null);
            if (current.didMove) {
                suppressClickRef.current = current.item.id;
                onMove(current.item, date, start);
            }
        } else { movingRef.current = null; setMoving(null); }
    };

    const quickCreate = (date: Date) => onCreate(buildGridSelection(date, 540, 600));
    const handleEventKeyDown = (event: KeyboardEvent<HTMLDivElement>, item: ScheduledSession) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onEdit(item); }
    };

    return <section className="overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-0 pb-3 pt-1 shadow-sm sm:pb-4 sm:pt-2" aria-label="Weekly study calendar">
        <div className="max-h-[70vh] overflow-auto overscroll-contain">
            <div className="min-w-[900px]">
                <div className="sticky top-0 z-30 grid grid-cols-[4.25rem_repeat(7,minmax(0,1fr))] border-b border-[var(--app-border)] bg-[var(--app-card-bg)]">
                    <div className="pb-3" />
                    {dates.map((date) => <div key={dateKey(date)} className="px-2 pb-2 pt-1 text-center"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p><p className="mt-1 text-sm font-bold">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>)}
                </div>
                <div ref={gridRef} className="grid grid-cols-[4.25rem_repeat(7,minmax(0,1fr))]" onPointerMove={updateMove} onPointerUp={finishMove} onPointerCancel={() => { movingRef.current = null; setMoving(null); }}>
                    <div className="relative" style={{ height: WEEK_GRID_HEIGHT }}>{Array.from({ length: WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR + 1 }, (_, index) => { const hour = WEEK_GRID_START_HOUR + index; return <span key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] leading-none text-[var(--app-text-muted)]" style={{ top: index === WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR ? '100%' : index * WEEK_GRID_HOUR_HEIGHT, transform: index === 0 ? 'translateY(6px)' : index === WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR ? 'translateY(calc(-100% + 4px))' : 'translateY(calc(-50% + 4px))' }}>{hourLabel(hour)}</span>; })}</div>
                    {dates.map((date) => {
                        const key = dateKey(date);
                        const daySlots = slots.filter((slot) => slot.date === key);
                        const range = drag && dateKey(drag.date) === key ? buildGridSelection(drag.date, drag.start, drag.current) : null;
                        return <div key={key} data-calendar-day="true" className="group relative border-l border-[var(--app-border)]" style={{ height: WEEK_GRID_HEIGHT }}>
                            <div className="absolute inset-0 grid" style={{ gridTemplateRows: `repeat(${WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR}, ${WEEK_GRID_HOUR_HEIGHT}px)` }} aria-hidden="true">{Array.from({ length: WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR }, (_, index) => <div key={index} className="border-t border-[var(--app-border)]/70" />)}</div>
                            <div className="absolute inset-0 touch-pan-y select-none cursor-crosshair" onPointerDown={(event) => startDrag(event, date)} onPointerMove={updateDrag} onPointerUp={finishDrag} onPointerCancel={() => { dragRef.current = null; setDrag(null); }} role="presentation" aria-hidden="true" />
                            {daySlots.map(({ item, top, height, topic, subject, lane, laneCount, laneSpan }) => {
                                const movingThis = moving?.item.id === item.id;
                                const movingDate = dates.find((candidate) => dateKey(candidate) === moving?.currentDate);
                                const movingStart = moving?.current ?? 0;
                                const active = movingThis && movingDate && dateKey(movingDate) === key;
                                const displayTop = active ? movingStart / 60 * WEEK_GRID_HOUR_HEIGHT : top;
                                return <div key={item.id} role="button" tabIndex={0} aria-label={`${item.title || topic?.name || 'Study session'}, ${localDateFromTimestamp(item.startedAt)?.toLocaleString('en-US')}. Press Enter to edit or drag to reschedule.`} onClick={() => { if (suppressClickRef.current === item.id) { suppressClickRef.current = null; return; } onEdit(item); }} onKeyDown={(event) => handleEventKeyDown(event, item)} onPointerMove={updateMove} onPointerUp={finishMove} onPointerCancel={() => { movingRef.current = null; setMoving(null); }} className={`absolute z-10 cursor-grab overflow-hidden rounded-lg border-l-[3px] px-1.5 text-[10px] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent-color)] active:cursor-grabbing sm:px-2 ${height <= 18 ? 'py-0' : 'py-1'} ${movingThis ? 'opacity-60' : ''}`} data-calendar-event="true" style={{ top: displayTop, height, left: `calc(${(lane / laneCount) * 100}% + 0.25rem)`, width: `calc(${(laneSpan / laneCount) * 100}% - 0.5rem)`, borderColor: subject?.color || 'var(--accent-color)', backgroundColor: `${subject?.color || 'var(--accent-color)'}24`, color: 'var(--app-text)' }} title={`${item.title || topic?.name || 'Study session'} · ${localDateFromTimestamp(item.startedAt)?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`} onPointerDown={(event) => startMove(event, item, key, Math.round(top / WEEK_GRID_HOUR_HEIGHT * 60))}><span className="block truncate font-semibold">{item.title || topic?.name || 'Study session'}</span>{height > 34 && <span className="block truncate opacity-75">{topic?.name || 'Study'}</span>}</div>;
                            })}
                            {moving && moving.currentDate === key && moving.date !== key && (() => {
                                const movingSlot = slots.find((slot) => slot.item.id === moving.item.id);
                                return movingSlot ? <div className="pointer-events-none absolute inset-x-1 z-20 rounded-lg border-2 border-dashed border-[var(--accent-color)] bg-[var(--accent-color)]/20 px-1.5 py-1 text-[10px] opacity-80 sm:inset-x-1.5 sm:px-2" style={{ top: moving.current / 60 * WEEK_GRID_HOUR_HEIGHT, height: movingSlot.height }} aria-hidden="true"><span className="block truncate font-semibold">{moving.item.title || movingSlot.topic?.name || 'Study session'}</span></div> : null;
                            })()}
                            {range && <div className="pointer-events-none absolute inset-x-1 z-20 rounded-lg border-2 border-[var(--accent-color)] bg-[var(--accent-color)]/20" style={{ top: range.startMinutes / 60 * WEEK_GRID_HOUR_HEIGHT, height: Math.max(16, (range.endMinutes - range.startMinutes) / 60 * WEEK_GRID_HOUR_HEIGHT) }} aria-hidden="true" />}
                            <button type="button" onClick={() => quickCreate(date)} className="absolute right-1 top-1 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card-bg)] text-[var(--app-text-muted)] opacity-0 shadow-sm transition-opacity hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] focus:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--accent-color)] group-hover:opacity-100" aria-label={`Schedule a session on ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} from 9 to 10 AM`}><Plus size={14} /></button>
                        </div>;
                    })}
                </div>
            </div>
        </div>
    </section>;
}
