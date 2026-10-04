import { useEffect, useMemo, useRef, useState } from 'react';
import { TaskTagDialog } from '../components/timer/TaskTagDialog';
import { useTimerContext } from '../context/TimerContext';
import { getApiErrorMessage } from '../services/api';
import { dayNoteService } from '../services/day-note-service';
import { deadlineService } from '../services/deadline-service';
import { scheduledSessionService } from '../services/scheduled-session-service';
import { sessionService } from '../services/session-service';
import { tagService } from '../services/tag-service';
import { taskService } from '../services/task-service';
import { todoService } from '../services/todo-service';
import type { DayNote } from '../types/day-note';
import type { Deadline } from '../types/deadline';
import type { ScheduledSession } from '../types/scheduled-session';
import type { Session } from '../types/session';
import type { Tag } from '../types/tag';
import type { Task } from '../types/task';
import type { TodoItem } from '../types/todo-item';

export interface StudyTarget {
    title: string;
    task?: Task;
}

interface DayPageProps {
    onStudy?: (target: StudyTarget) => void;
    onStudyNow?: () => void;
}

interface TimelineEvent {
    key: string;
    kind: 'scheduled' | 'session';
    id: number;
    title: string;
    subtitle: string;
    color: string;
    start: number;
    end: number;
    startLabel: string;
    endLabel: string;
    done: boolean;
}

type PlacedEvent = TimelineEvent & { lane: number; lanes: number };
type DialogKind = 'deadline' | 'session';

interface ItemValues {
    title: string;
    urgency: string;
    time: string;
    allDay: boolean;
    start: string;
    end: string;
}

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const START_HOUR = 8;
const END_HOUR = 21;
const HOUR_HEIGHT = 60;
const GRID_START = START_HOUR * 60;
const GRID_END = (END_HOUR + 1) * 60;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index);
const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT;

const pad = (value: number) => String(value).padStart(2, '0');

const toKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const fromKey = (key: string) => {
    const [year, month, day] = key.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
};

const addDays = (date: Date, amount: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
};

const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));

const formatClock = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const formatTopDate = (date: Date) =>
    `${WEEKDAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;

const formatLongDate = (date: Date) =>
    `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;

const formatShortDay = (date: Date) => `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;

const readableText = (color: string) => {
    const match = /^#?([0-9a-f]{6})$/i.exec(color.trim());
    if (!match) return '#ffffff';
    const value = parseInt(match[1], 16);
    const luminance = 0.299 * ((value >> 16) & 255) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255);
    return luminance > 160 ? '#1c1200' : '#ffffff';
};

const minutesInDay = (date: Date, dayStart: Date) =>
    Math.min(1440, Math.max(0, Math.round((date.getTime() - dayStart.getTime()) / 60000)));

const buildEvents = (
    scheduled: ScheduledSession[],
    sessions: Session[],
    dayKey: string,
    now: Date,
): TimelineEvent[] => {
    const dayStart = fromKey(dayKey);
    const fromScheduled = scheduled.map<TimelineEvent>((item) => {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        return {
            key: `scheduled-${item.id}`,
            kind: 'scheduled',
            id: item.id,
            title: item.title?.trim() || item.task.name,
            subtitle: item.task.name,
            color: item.task.tag.color,
            start: minutesInDay(start, dayStart),
            end: minutesInDay(end, dayStart),
            startLabel: formatClock(start),
            endLabel: formatClock(end),
            done: end.getTime() <= now.getTime(),
        };
    });
    const fromSessions = sessions.map<TimelineEvent>((item) => {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        return {
            key: `session-${item.id}`,
            kind: 'session',
            id: item.id,
            title: item.title,
            subtitle: item.task.name,
            color: item.task.tag.color,
            start: minutesInDay(start, dayStart),
            end: minutesInDay(end, dayStart),
            startLabel: formatClock(start),
            endLabel: formatClock(end),
            done: true,
        };
    });
    return [...fromScheduled, ...fromSessions];
};

const placeEvents = (events: TimelineEvent[]): PlacedEvent[] => {
    const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
    const result: PlacedEvent[] = [];
    let cluster: (TimelineEvent & { lane: number })[] = [];
    let laneEnds: number[] = [];
    let clusterEnd = -1;

    const flush = () => {
        const lanes = Math.max(1, laneEnds.length);
        cluster.forEach((item) => result.push({ ...item, lanes }));
        cluster = [];
        laneEnds = [];
        clusterEnd = -1;
    };

    sorted.forEach((event) => {
        if (cluster.length > 0 && event.start >= clusterEnd) flush();
        let lane = laneEnds.findIndex((end) => end <= event.start);
        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(event.end);
        } else {
            laneEnds[lane] = event.end;
        }
        cluster.push({ ...event, lane });
        clusterEnd = Math.max(clusterEnd, event.end);
    });
    flush();
    return result;
};

const urgencyLabel = (urgency: string) => {
    const value = urgency?.trim().toLowerCase();
    if (!value) return 'Medium';
    return value.charAt(0).toUpperCase() + value.slice(1);
};

const urgencyStyle = (urgency: string) => {
    switch (urgency?.trim().toLowerCase()) {
        case 'low':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'high':
            return 'border-red-200 bg-red-50 text-red-700';
        case 'medium':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        default:
            return 'border-neutral-300 bg-transparent text-neutral-600';
    }
};

const focusRing = 'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4287f5]';

const outlineButton =
    'rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition-colors ' +
    'hover:border-[#151414] hover:text-[#151414] ' +
    focusRing;

const squareButton =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 transition-colors ' +
    'hover:border-[#151414] hover:text-[#151414] ' +
    focusRing;

const fieldClass =
    'w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm text-[#151414] ' +
    'placeholder:text-neutral-400 focus:border-[#4287f5] focus:outline-none';

function ChevronIcon({ direction, className = '' }: { direction: 'left' | 'right'; className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
            <path d={direction === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} />
        </svg>
    );
}

function PlayIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
            <path d="M7 4.5v15l12-7.5-12-7.5Z" />
        </svg>
    );
}

function PlusIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

function CloseIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className} aria-hidden>
            <path d="m6 6 12 12M18 6 6 18" />
        </svg>
    );
}

function DotsIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
        </svg>
    );
}

function CheckIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
            <path d="m6 12.5 4 4 8-9" />
        </svg>
    );
}

function DocIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
            <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
    );
}

function CheckCircle({ done, onClick, label }: { done: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            role="checkbox"
            aria-checked={done}
            aria-label={label}
            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${focusRing} ${
                done ? 'border-emerald-500 text-emerald-500' : 'border-neutral-300 text-transparent hover:border-[#151414]'
            }`}
        >
            <CheckIcon className="h-2.5 w-2.5" />
        </button>
    );
}

function RowMenu({
                     open,
                     onToggle,
                     onClose,
                     onDelete,
                 }: {
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="relative">
            <button onClick={onToggle} aria-haspopup="menu" aria-expanded={open} aria-label="More options" className={squareButton}>
                <DotsIcon className="h-4 w-4" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden />
                    <ul role="menu" className="absolute right-0 top-full z-20 mt-1 w-32 rounded-xl border border-neutral-300 bg-white p-1 shadow-xl">
                        <li>
                            <button
                                role="menuitem"
                                onClick={onDelete}
                                className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                            >
                                Delete
                            </button>
                        </li>
                    </ul>
                </>
            )}
        </div>
    );
}

function InlineAdd({
                       placeholder,
                       onSubmit,
                       onCancel,
                   }: {
    placeholder: string;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}) {
    const [value, setValue] = useState('');
    const doneRef = useRef(false);

    const finish = (commit: boolean) => {
        if (doneRef.current) return;
        doneRef.current = true;
        const trimmed = value.trim();
        if (commit && trimmed) onSubmit(trimmed);
        else onCancel();
    };

    return (
        <input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={() => finish(true)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') finish(true);
                if (event.key === 'Escape') finish(false);
            }}
            placeholder={placeholder}
            className={`mt-3 ${fieldClass} px-4`}
        />
    );
}

function ItemDialog({
                        kind,
                        task,
                        saving,
                        error,
                        onPickTask,
                        onCancel,
                        onSubmit,
                    }: {
    kind: DialogKind;
    task: Task | null;
    saving: boolean;
    error: string | null;
    onPickTask: () => void;
    onCancel: () => void;
    onSubmit: (values: ItemValues) => void;
}) {
    const [title, setTitle] = useState('');
    const [urgency, setUrgency] = useState('medium');
    const [time, setTime] = useState('23:59');
    const [allDay, setAllDay] = useState(false);
    const [start, setStart] = useState('09:00');
    const [end, setEnd] = useState('10:00');

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onCancel]);

    const isDeadline = kind === 'deadline';
    const validTimes = isDeadline ? allDay || Boolean(time) : Boolean(start) && Boolean(end) && start < end;
    const canSubmit = Boolean(task) && validTimes && (!isDeadline || title.trim().length > 0) && !saving;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={isDeadline ? 'Add deadline' : 'Schedule session'}>
            <div className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-5 shadow-2xl">
                <h2 className="text-lg font-semibold text-[#151414]">{isDeadline ? 'Add deadline' : 'Schedule session'}</h2>

                <div className="mt-5 flex flex-col gap-4">
                    <button
                        onClick={onPickTask}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors hover:border-[#151414] ${focusRing} ${
                            task ? 'border-neutral-300' : 'border-dashed border-neutral-300'
                        }`}
                    >
                        <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: task?.tag.color ?? '#d4d4d4' }}
                            aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-[#151414]">{task ? task.name : 'Choose a tag and task'}</span>
                            {task && <span className="block truncate text-xs text-neutral-500">{task.tag.name}</span>}
                        </span>
                    </button>

                    <label className="flex flex-col gap-1.5 text-sm text-neutral-500">
                        {isDeadline ? 'Title' : 'Title (optional)'}
                        <input
                            autoFocus
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder={isDeadline ? 'What is due?' : 'Defaults to the task name'}
                            className={fieldClass}
                        />
                    </label>

                    {isDeadline ? (
                        <>
                            <label className="flex flex-col gap-1.5 text-sm text-neutral-500">
                                Urgency
                                <select value={urgency} onChange={(event) => setUrgency(event.target.value)} className={fieldClass}>
                                    <option value="low" className="bg-white">Low</option>
                                    <option value="medium" className="bg-white">Medium</option>
                                    <option value="high" className="bg-white">High</option>
                                </select>
                            </label>
                            <div className="flex items-end gap-4">
                                <label className="flex flex-1 flex-col gap-1.5 text-sm text-neutral-500">
                                    Due time
                                    <input
                                        type="time"
                                        value={time}
                                        disabled={allDay}
                                        onChange={(event) => setTime(event.target.value)}
                                        className={`${fieldClass} disabled:opacity-40`}
                                    />
                                </label>
                                <label className="flex items-center gap-2 pb-2.5 text-sm text-neutral-600">
                                    <input type="checkbox" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} className="h-4 w-4 accent-[#4287f5]" />
                                    All day
                                </label>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <label className="flex flex-1 flex-col gap-1.5 text-sm text-neutral-500">
                                Start
                                <input type="time" value={start} onChange={(event) => setStart(event.target.value)} className={fieldClass} />
                            </label>
                            <label className="flex flex-1 flex-col gap-1.5 text-sm text-neutral-500">
                                End
                                <input type="time" value={end} onChange={(event) => setEnd(event.target.value)} className={fieldClass} />
                            </label>
                        </div>
                    )}

                    {!isDeadline && start && end && start >= end && (
                        <p className="text-sm text-amber-700">The end time must be after the start time.</p>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onCancel} className={`rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-600 transition-colors hover:border-[#151414] hover:text-[#151414] ${focusRing}`}>
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit({ title, urgency, time, allDay, start, end })}
                        disabled={!canSubmit}
                        className={`rounded-xl bg-[#151414] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function DayPage({ onStudy, onStudyNow }: DayPageProps) {
    const timer = useTimerContext();
    const { selectedTaskId, setSelectedTagId, setSelectedTaskId } = timer;

    const [selected, setSelected] = useState(() => fromKey(toKey(new Date())));
    const [now, setNow] = useState(() => new Date());
    const [tags, setTags] = useState<Tag[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [notes, setNotes] = useState<Record<string, DayNote>>({});
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addingTodo, setAddingTodo] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [dialog, setDialog] = useState<DialogKind | null>(null);
    const [dialogTask, setDialogTask] = useState<Task | null>(null);
    const [dialogSaving, setDialogSaving] = useState(false);
    const [dialogError, setDialogError] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);

    const selectedKey = toKey(selected);

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        let active = true;
        Promise.all([tagService.getAll(), taskService.getAll(), dayNoteService.getAll()])
            .then(([loadedTags, loadedTasks, loadedNotes]) => {
                if (!active) return;
                setTags(loadedTags);
                setTasks(loadedTasks);
                setNotes(Object.fromEntries(loadedNotes.map((note) => [note.date.slice(0, 10), note])));
            })
            .catch((failure) => {
                if (active) setError(getApiErrorMessage(failure));
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        const start = `${selectedKey}T00:00:00`;
        const end = `${selectedKey}T23:59:59`;
        setLoading(true);
        setAddingTodo(false);
        setOpenMenu(null);
        Promise.all([
            todoService.getAll(selectedKey),
            deadlineService.getAll(start, end),
            scheduledSessionService.getAll(start, end),
            sessionService.getAll({ start, end, size: 200 }),
        ])
            .then(([loadedTodos, loadedDeadlines, loadedScheduled, loadedSessions]) => {
                if (!active) return;
                setTodos(loadedTodos);
                setDeadlines(loadedDeadlines);
                setScheduled(loadedScheduled);
                setSessions(loadedSessions);
                setError(null);
            })
            .catch((failure) => {
                if (active) setError(getApiErrorMessage(failure));
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [selectedKey]);

    const week = useMemo(() => {
        const monday = startOfWeek(selected);
        return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
    }, [selected]);

    const sortedDeadlines = useMemo(
        () => [...deadlines].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        [deadlines],
    );

    const events = useMemo(() => buildEvents(scheduled, sessions, selectedKey, now), [scheduled, sessions, selectedKey, now]);
    const placedEvents = useMemo(() => placeEvents(events), [events]);

    const todosDone = todos.filter((todo) => todo.isCompleted).length;
    const deadlinesDone = deadlines.filter((deadline) => deadline.isCompleted).length;
    const eventsDone = events.filter((event) => event.done).length;

    const planValue = drafts[selectedKey] ?? notes[selectedKey]?.content ?? '';
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const showNowLine = selectedKey === toKey(now) && nowMinutes >= GRID_START && nowMinutes <= GRID_END;

    const fail = (failure: unknown) => setError(getApiErrorMessage(failure));

    const savePlan = async () => {
        const draft = drafts[selectedKey];
        if (draft === undefined) return;
        const existing = notes[selectedKey];
        const clearDraft = () =>
            setDrafts((current) => {
                const next = { ...current };
                delete next[selectedKey];
                return next;
            });
        try {
            if (existing) {
                if (draft === existing.content) {
                    clearDraft();
                    return;
                }
                if (!draft.trim()) {
                    await dayNoteService.delete(existing.id);
                    setNotes((current) => {
                        const next = { ...current };
                        delete next[selectedKey];
                        return next;
                    });
                } else {
                    const updated = await dayNoteService.patch(existing.id, draft);
                    setNotes((current) => ({ ...current, [selectedKey]: updated }));
                }
            } else if (draft.trim()) {
                const created = await dayNoteService.create({ date: selectedKey, content: draft });
                setNotes((current) => ({ ...current, [selectedKey]: created }));
            }
            clearDraft();
        } catch (failure) {
            fail(failure);
        }
    };

    const addTodo = async (text: string) => {
        setAddingTodo(false);
        try {
            const created = await todoService.create({ date: selectedKey, text });
            setTodos((current) => [...current, created]);
        } catch (failure) {
            fail(failure);
        }
    };

    const toggleTodo = async (todo: TodoItem) => {
        try {
            const updated = await todoService.patch(todo.id, { completed: !todo.isCompleted });
            setTodos((current) => current.map((item) => (item.id === todo.id ? updated : item)));
        } catch (failure) {
            fail(failure);
        }
    };

    const deleteTodo = async (id: number) => {
        setOpenMenu(null);
        try {
            await todoService.delete(id);
            setTodos((current) => current.filter((item) => item.id !== id));
        } catch (failure) {
            fail(failure);
        }
    };

    const toggleDeadline = async (deadline: Deadline) => {
        try {
            const updated = await deadlineService.patch(deadline.id, { isCompleted: !deadline.isCompleted });
            setDeadlines((current) => current.map((item) => (item.id === deadline.id ? updated : item)));
        } catch (failure) {
            fail(failure);
        }
    };

    const deleteDeadline = async (id: number) => {
        setOpenMenu(null);
        try {
            await deadlineService.delete(id);
            setDeadlines((current) => current.filter((item) => item.id !== id));
        } catch (failure) {
            fail(failure);
        }
    };

    const deleteScheduled = async (id: number) => {
        try {
            await scheduledSessionService.delete(id);
            setScheduled((current) => current.filter((item) => item.id !== id));
        } catch (failure) {
            fail(failure);
        }
    };

    const startStudy = (target: StudyTarget) => {
        if (target.task) {
            setSelectedTagId(target.task.tag.id);
            setSelectedTaskId(target.task.id);
        }
        onStudy?.(target);
    };

    const openDialog = (kind: DialogKind) => {
        setDialogTask(tasks.find((task) => task.id === selectedTaskId) ?? null);
        setDialogError(null);
        setDialog(kind);
    };

    const closeDialog = () => {
        setDialog(null);
        setPickerOpen(false);
    };

    const submitDialog = async (values: ItemValues) => {
        if (!dialog || !dialogTask) return;
        setDialogSaving(true);
        setDialogError(null);
        try {
            if (dialog === 'deadline') {
                const created = await deadlineService.create({
                    tagName: dialogTask.tag.name,
                    tagColor: dialogTask.tag.color,
                    taskName: dialogTask.name,
                    title: values.title.trim(),
                    urgency: values.urgency,
                    dueDate: `${selectedKey}T${values.allDay ? '23:59' : values.time}:00`,
                    allDay: values.allDay,
                });
                setDeadlines((current) => [...current, created]);
            } else {
                const created = await scheduledSessionService.create({
                    tagName: dialogTask.tag.name,
                    taskName: dialogTask.name,
                    title: values.title.trim() || undefined,
                    startDate: `${selectedKey}T${values.start}:00`,
                    endDate: `${selectedKey}T${values.end}:00`,
                });
                setScheduled((current) => [...current, created]);
            }
            closeDialog();
        } catch (failure) {
            setDialogError(getApiErrorMessage(failure));
        } finally {
            setDialogSaving(false);
        }
    };

    const handlePicked = (tag: Tag, task: Task) => {
        setTags((current) => (current.some((item) => item.id === tag.id) ? current : [...current, tag]));
        setTasks((current) => (current.some((item) => item.id === task.id) ? current : [...current, task]));
        setDialogTask(task);
        setPickerOpen(false);
    };

    const shift = (amount: number) => setSelected((current) => addDays(current, amount));

    return (
        <div className="min-h-full p-3 text-[#151414] sm:p-4">
            <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
                <header className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-3 shadow-sm sm:px-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelected(fromKey(toKey(new Date())))}
                            className={`rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:border-[#151414] hover:text-[#151414] ${focusRing}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => shift(-1)}
                            aria-label="Previous day"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 text-neutral-700 transition-colors hover:border-[#151414] hover:text-[#151414] ${focusRing}`}
                        >
                            <ChevronIcon direction="left" className="h-4 w-4" />
                        </button>
                    </div>

                    <h1 className="text-center text-base font-semibold text-[#151414]">{formatTopDate(selected)}</h1>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => shift(1)}
                            aria-label="Next day"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 text-neutral-700 transition-colors hover:border-[#151414] hover:text-[#151414] ${focusRing}`}
                        >
                            <ChevronIcon direction="right" className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onStudyNow}
                            className={`flex items-center gap-2 rounded-xl bg-[#151414] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85 ${focusRing}`}
                        >
                            <PlayIcon className="h-3.5 w-3.5" />
                            Study now
                        </button>
                        <button
                            onClick={() => openDialog('session')}
                            aria-label="Schedule session"
                            title="Schedule session"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-[#151414] ${focusRing}`}
                        >
                            <PlusIcon className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                <nav aria-label="Week" className="grid grid-cols-7 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    {week.map((day) => {
                        const active = toKey(day) === selectedKey;
                        return (
                            <button
                                key={toKey(day)}
                                onClick={() => setSelected(day)}
                                aria-current={active ? 'date' : undefined}
                                className={`flex items-baseline justify-center gap-1.5 border-r border-neutral-200 py-3.5 transition-colors last:border-r-0 ${focusRing} ${
                                    active ? 'bg-[#4287f5]/10' : 'hover:bg-neutral-50'
                                }`}
                            >
                                <span className={`text-xs ${active ? 'text-[#1d5fd1]' : 'text-neutral-600'}`}>
                                    {WEEKDAYS_SHORT[day.getDay()]}
                                </span>
                                <span className={`text-lg font-semibold ${active ? 'text-[#4287f5]' : 'text-[#151414]'}`}>
                                    {day.getDate()}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <div aria-live="polite">
                    {error && (
                        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                            {error}
                        </p>
                    )}
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="border-b border-neutral-200 pb-4 text-lg font-semibold">{formatLongDate(selected)}</h2>

                        <div className="mt-6">
                            <label htmlFor="day-planning" className="text-sm text-neutral-500">
                                Planning
                            </label>
                            <input
                                id="day-planning"
                                value={planValue}
                                onChange={(event) => setDrafts((current) => ({ ...current, [selectedKey]: event.target.value }))}
                                onBlur={savePlan}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') event.currentTarget.blur();
                                }}
                                placeholder="What is the plan for this day?"
                                className="mt-3 w-full rounded-xl border border-neutral-300 bg-transparent px-4 py-3.5 text-[15px] text-[#151414] placeholder:text-neutral-400 focus:border-[#4287f5] focus:outline-none"
                            />
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <p className="text-sm text-neutral-500">
                                To-dos <span aria-hidden>•</span> {todosDone}/{todos.length} completed ({todos.length - todosDone} remaining)
                            </p>
                            <button onClick={() => setAddingTodo(true)} className={outlineButton}>
                                + Add to-do
                            </button>
                        </div>

                        {addingTodo && (
                            <InlineAdd placeholder="New to-do, then press Enter" onSubmit={addTodo} onCancel={() => setAddingTodo(false)} />
                        )}

                        <ul className="mt-3">
                            {loading && todos.length === 0 && <li className="py-6 text-center text-sm text-neutral-400">Loading…</li>}
                            {!loading && todos.length === 0 && !addingTodo && (
                                <li className="py-6 text-center text-sm text-neutral-400">No to-dos for this day</li>
                            )}
                            {todos.map((todo) => (
                                <li key={todo.id} className="flex items-center gap-3 px-1 py-3.5">
                                    <CheckCircle done={todo.isCompleted} onClick={() => toggleTodo(todo)} label={`Mark "${todo.text}" as done`} />
                                    <p className={`min-w-0 flex-1 truncate text-[15px] font-medium ${todo.isCompleted ? 'text-neutral-500 line-through' : ''}`}>
                                        {todo.text}
                                    </p>
                                    <button
                                        onClick={() => startStudy({ title: todo.text })}
                                        className={`rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 transition-colors hover:border-[#151414] hover:text-[#151414] ${focusRing}`}
                                    >
                                        Study
                                    </button>
                                    <RowMenu
                                        open={openMenu === `todo-${todo.id}`}
                                        onToggle={() => setOpenMenu((current) => (current === `todo-${todo.id}` ? null : `todo-${todo.id}`))}
                                        onClose={() => setOpenMenu(null)}
                                        onDelete={() => deleteTodo(todo.id)}
                                    />
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <p className="text-sm text-neutral-500">
                                Deadlines <span aria-hidden>•</span> {deadlinesDone}/{deadlines.length} completed (
                                {deadlines.length - deadlinesDone} remaining)
                            </p>
                            <button onClick={() => openDialog('deadline')} className={`${outlineButton} px-4 py-2.5 text-sm`}>
                                + Add deadline
                            </button>
                        </div>

                        <ul className="mt-3">
                            {loading && deadlines.length === 0 && <li className="py-6 text-center text-sm text-neutral-400">Loading…</li>}
                            {!loading && deadlines.length === 0 && (
                                <li className="py-6 text-center text-sm text-neutral-400">No deadlines for this day</li>
                            )}
                            {sortedDeadlines.map((deadline) => {
                                const due = new Date(deadline.dueDate);
                                const urgent = !deadline.isCompleted && due.getTime() <= now.getTime() + 24 * 3600 * 1000;
                                const menuId = `deadline-${deadline.id}`;
                                return (
                                    <li key={deadline.id} className="flex items-center gap-3 px-1 py-3.5">
                                        <span
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: deadline.task.tag.color, color: readableText(deadline.task.tag.color) }}
                                        >
                                            <DocIcon className="h-4 w-4" />
                                        </span>
                                        <CheckCircle
                                            done={deadline.isCompleted}
                                            onClick={() => toggleDeadline(deadline)}
                                            label={`Mark "${deadline.title}" as done`}
                                        />
                                        <div className={`min-w-0 flex-1 ${deadline.isCompleted ? 'opacity-60' : ''}`}>
                                            <p className={`truncate text-[15px] font-medium ${deadline.isCompleted ? 'line-through' : ''}`}>
                                                {deadline.title}
                                            </p>
                                            <p className="truncate text-[13px] text-neutral-500">{deadline.task.name}</p>
                                        </div>
                                        <span
                                            className={`hidden whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold sm:inline ${
                                                urgent
                                                    ? 'border-red-200 bg-red-50 text-red-600'
                                                    : 'border-neutral-300 text-neutral-600'
                                            }`}
                                        >
                                            {formatShortDay(due)} <span aria-hidden>•</span> {deadline.allDay ? 'All day' : formatClock(due)}
                                        </span>
                                        <span className={`hidden rounded-full border px-2.5 py-1 text-xs font-medium sm:inline ${urgencyStyle(deadline.urgency)}`}>
                                            {urgencyLabel(deadline.urgency)}
                                        </span>
                                        <button
                                            onClick={() => startStudy({ title: deadline.title, task: deadline.task })}
                                            className={`rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 transition-colors hover:border-[#151414] hover:text-[#151414] ${focusRing}`}
                                        >
                                            Study
                                        </button>
                                        <RowMenu
                                            open={openMenu === menuId}
                                            onToggle={() => setOpenMenu((current) => (current === menuId ? null : menuId))}
                                            onClose={() => setOpenMenu(null)}
                                            onDelete={() => deleteDeadline(deadline.id)}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                        <p className="pt-3 text-sm text-neutral-500">
                            Day <span aria-hidden>•</span>{' '}
                            <span className="text-[#1d5fd1]">
                                {eventsDone}/{events.length} completed ({events.length - eventsDone} remaining)
                            </span>
                        </p>

                        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200">
                            <div className="relative" style={{ height: GRID_HEIGHT }}>
                                {HOURS.map((hour, index) => (
                                    <div
                                        key={hour}
                                        className="absolute left-0 right-0 border-b border-neutral-200"
                                        style={{ top: index * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                                    >
                                        <span className="absolute left-0 top-0 flex w-[60px] justify-center pt-3 text-xs text-neutral-600">
                                            {pad(hour)}:00
                                        </span>
                                    </div>
                                ))}
                                <div className="absolute bottom-0 left-[60px] top-0 border-l border-neutral-200" aria-hidden />

                                <div className="absolute bottom-0 left-[60px] right-0 top-0">
                                    {placedEvents.map((event) => {
                                        const start = Math.max(event.start, GRID_START);
                                        const end = Math.min(event.end, GRID_END);
                                        if (end <= start) return null;
                                        const height = Math.max(end - start, 20);
                                        const textColor = readableText(event.color);
                                        return (
                                            <article
                                                key={event.key}
                                                className="group absolute overflow-hidden rounded-[3px] px-1.5 py-1 leading-tight"
                                                style={{
                                                    top: ((start - GRID_START) / 60) * HOUR_HEIGHT,
                                                    height: (height / 60) * HOUR_HEIGHT,
                                                    left: `calc(${(event.lane / event.lanes) * 100}% + 2px)`,
                                                    width: `calc(${100 / event.lanes}% - 4px)`,
                                                    backgroundColor: event.color,
                                                    color: textColor,
                                                }}
                                            >
                                                <p className="truncate pr-4 text-[11px] font-bold">{event.title}</p>
                                                <p className="truncate text-[11px] font-medium">
                                                    {event.startLabel} - {event.endLabel}
                                                </p>
                                                <p className="truncate text-[10px]">{event.subtitle}</p>
                                                {event.kind === 'scheduled' && (
                                                    <button
                                                        onClick={() => deleteScheduled(event.id)}
                                                        aria-label={`Delete ${event.title}`}
                                                        className="absolute right-0.5 top-0.5 hidden cursor-pointer rounded p-0.5 hover:bg-black/20 focus-visible:block group-hover:block"
                                                    >
                                                        <CloseIcon className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </article>
                                        );
                                    })}
                                    {showNowLine && (
                                        <div
                                            className="pointer-events-none absolute left-0 right-0 z-10 border-t-2 border-[#ef4444]"
                                            style={{ top: ((nowMinutes - GRID_START) / 60) * HOUR_HEIGHT }}
                                            aria-hidden
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {dialog && (
                <ItemDialog
                    kind={dialog}
                    task={dialogTask}
                    saving={dialogSaving}
                    error={dialogError}
                    onPickTask={() => setPickerOpen(true)}
                    onCancel={closeDialog}
                    onSubmit={submitDialog}
                />
            )}

            {pickerOpen && (
                <TaskTagDialog
                    tags={tags}
                    tasks={tasks}
                    initialTagId={dialogTask?.tag.id ?? null}
                    initialTaskId={dialogTask?.id ?? null}
                    onClose={() => setPickerOpen(false)}
                    onConfirm={handlePicked}
                    onClear={() => {
                        setDialogTask(null);
                        setPickerOpen(false);
                    }}
                    onTagCreated={(tag) => setTags((current) => (current.some((t) => t.id === tag.id) ? current : [...current, tag]))}
                    onTaskCreated={(task) => setTasks((current) => (current.some((t) => t.id === task.id) ? current : [...current, task]))}
                />
            )}
        </div>
    );
}

export default DayPage;