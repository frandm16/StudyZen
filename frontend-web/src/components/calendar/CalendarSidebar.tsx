import { useState } from 'react';
import {
    CalendarClock,
    CheckCircle2,
    Flag,
    GraduationCap,
    Check,
    ChevronDown,
    ChevronRight,
    Plus,
    X,
} from 'lucide-react';
import { MiniMonthPicker } from './MiniMonthPicker';
import type { Subject } from '../../types/subject';
import type { CalendarView, CalendarLayer } from '../../types/calendar';

interface CalendarSidebarProps {
    sidebarOpen?: boolean;
    onCloseSidebar?: () => void;
    subjects: Subject[];
    visibleSubjectIds: Set<number>;
    onToggleSubject: (id: number) => void;
    onSelectAllSubjects: () => void;
    onDeselectAllSubjects: () => void;
    includeGeneralSubject: boolean;
    onToggleGeneralSubject: () => void;
    visibleLayers: Set<CalendarLayer>;
    onToggleLayer: (layer: CalendarLayer) => void;
    selectedDate: Date;
    weekStartsOn: number;
    view: CalendarView;
    onSelectDate: (date: Date) => void;
    onCreateEvent: () => void;
}

export function CalendarSidebar({
    sidebarOpen = true,
    onCloseSidebar,
    subjects,
    visibleSubjectIds,
    onToggleSubject,
    onSelectAllSubjects,
    onDeselectAllSubjects,
    includeGeneralSubject,
    onToggleGeneralSubject,
    visibleLayers,
    onToggleLayer,
    selectedDate,
    weekStartsOn,
    view,
    onSelectDate,
    onCreateEvent,
}: CalendarSidebarProps) {
    const [calendarsOpen, setCalendarsOpen] = useState(true);
    const [layersOpen, setLayersOpen] = useState(true);

    if (!sidebarOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
                onClick={onCloseSidebar}
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-80 max-w-[85vw] flex-col gap-4 overflow-y-auto border-r border-[var(--app-border)] bg-[var(--app-bg)] p-3 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] text-[var(--app-text)] shadow-2xl transition-transform lg:static lg:z-auto lg:w-64 lg:pb-3 lg:shadow-none">
                <div className="flex items-center justify-between pb-1 border-b border-[var(--app-border)] lg:hidden">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Calendar Tools</span>
                    <button
                        type="button"
                        onClick={onCloseSidebar}
                        aria-label="Close sidebar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-text-muted)] hover:bg-neutral-500/10 hover:text-[var(--app-text)]"
                    >
                        <X size={18} />
                    </button>
                </div>
                <button
                type="button"
                onClick={onCreateEvent}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent-color)] px-4 py-2.5 text-sm font-bold text-[var(--app-bg)] shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
            >
                <Plus size={18} strokeWidth={2.5} />
                <span>Create event</span>
            </button>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-1.5 shadow-xs">
                <MiniMonthPicker
                    selectedDate={selectedDate}
                    weekStartsOn={weekStartsOn}
                    view={view}
                    onSelectDate={onSelectDate}
                />
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between pb-1">
                        <button
                            type="button"
                            onClick={() => setCalendarsOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                        >
                            {calendarsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span>My Calendars</span>
                        </button>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--accent-color)]">
                            <button
                                type="button"
                                onClick={onSelectAllSubjects}
                                className="hover:underline"
                            >
                                All
                            </button>
                            <span className="text-[var(--app-text-muted)]">·</span>
                            <button
                                type="button"
                                onClick={onDeselectAllSubjects}
                                className="hover:underline"
                            >
                                None
                            </button>
                        </div>
                    </div>

                    {calendarsOpen && (
                        <div className="mt-1.5 space-y-1">
                            {subjects.map((subject) => {
                                const isVisible = visibleSubjectIds.has(subject.id);
                                const color = subject.color || 'var(--accent-color)';

                                return (
                                    <div
                                        key={subject.id}
                                        className="group flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--app-card-bg)]"
                                    >
                                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={isVisible}
                                                onChange={() => onToggleSubject(subject.id)}
                                                className="sr-only"
                                            />
                                            <div
                                                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all"
                                                style={{
                                                    borderColor: color,
                                                    backgroundColor: isVisible ? color : 'transparent',
                                                }}
                                            >
                                                {isVisible && (
                                                    <Check size={11} strokeWidth={3} className="text-white" />
                                                )}
                                            </div>
                                            <span className="truncate text-xs font-medium text-[var(--app-text)]">
                                                {subject.name}
                                            </span>
                                        </label>
                                    </div>
                                );
                            })}

                            <div className="group flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--app-card-bg)]">
                                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={includeGeneralSubject}
                                        onChange={onToggleGeneralSubject}
                                        className="sr-only"
                                    />
                                    <div
                                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md border border-[var(--app-text-muted)] transition-all"
                                        style={{
                                            backgroundColor: includeGeneralSubject
                                                ? 'var(--app-text-muted)'
                                                : 'transparent',
                                        }}
                                    >
                                        {includeGeneralSubject && (
                                            <Check size={11} strokeWidth={3} className="text-white" />
                                        )}
                                    </div>
                                    <span className="truncate text-xs font-medium text-[var(--app-text-muted)]">
                                        General / Unassigned
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between pb-1">
                        <button
                            type="button"
                            onClick={() => setLayersOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                        >
                            {layersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span>Event Types</span>
                        </button>
                    </div>

                    {layersOpen && (
                        <div className="mt-1.5 space-y-1">
                            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--app-card-bg)]">
                                <input
                                    type="checkbox"
                                    checked={visibleLayers.has('scheduled')}
                                    onChange={() => onToggleLayer('scheduled')}
                                    className="sr-only"
                                />
                                <div
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                                        visibleLayers.has('scheduled')
                                            ? 'border-sky-500 bg-sky-500 text-white'
                                            : 'border-[var(--app-border)]'
                                    }`}
                                >
                                    {visibleLayers.has('scheduled') && (
                                        <Check size={11} strokeWidth={3} />
                                    )}
                                </div>
                                <CalendarClock size={14} className="text-sky-400" />
                                <span className="text-xs font-medium">Scheduled Study</span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--app-card-bg)]">
                                <input
                                    type="checkbox"
                                    checked={visibleLayers.has('completed')}
                                    onChange={() => onToggleLayer('completed')}
                                    className="sr-only"
                                />
                                <div
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                                        visibleLayers.has('completed')
                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                            : 'border-[var(--app-border)]'
                                    }`}
                                >
                                    {visibleLayers.has('completed') && (
                                        <Check size={11} strokeWidth={3} />
                                    )}
                                </div>
                                <CheckCircle2 size={14} className="text-emerald-400" />
                                <span className="text-xs font-medium">Completed Logs</span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--app-card-bg)]">
                                <input
                                    type="checkbox"
                                    checked={visibleLayers.has('deadlines')}
                                    onChange={() => onToggleLayer('deadlines')}
                                    className="sr-only"
                                />
                                <div
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                                        visibleLayers.has('deadlines')
                                            ? 'border-amber-500 bg-amber-500 text-white'
                                            : 'border-[var(--app-border)]'
                                    }`}
                                >
                                    {visibleLayers.has('deadlines') && (
                                        <Check size={11} strokeWidth={3} />
                                    )}
                                </div>
                                <Flag size={14} className="text-amber-400" />
                                <span className="text-xs font-medium">Deadlines & Tasks</span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--app-card-bg)]">
                                <input
                                    type="checkbox"
                                    checked={visibleLayers.has('exams')}
                                    onChange={() => onToggleLayer('exams')}
                                    className="sr-only"
                                />
                                <div
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                                        visibleLayers.has('exams')
                                            ? 'border-rose-500 bg-rose-500 text-white'
                                            : 'border-[var(--app-border)]'
                                    }`}
                                >
                                    {visibleLayers.has('exams') && (
                                        <Check size={11} strokeWidth={3} />
                                    )}
                                </div>
                                <GraduationCap size={14} className="text-rose-400" />
                                <span className="text-xs font-medium">Exams & Tests</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </aside>
        </>
    );
}
