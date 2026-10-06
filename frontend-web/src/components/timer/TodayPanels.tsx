import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRequiredApiTimestamp } from '../../lib/api-datetime';
import { deadlineService } from '../../services/deadline-service';
import { scheduledSessionService } from '../../services/scheduled-session-service';
import { subjectService } from '../../services/subject-service';
import { todoService } from '../../services/todo-service';
import { topicService } from '../../services/topic-service';
import type { Deadline } from '../../types/deadline';
import type { ScheduledSession } from '../../types/scheduled-session';
import type { Subject } from '../../types/subject';
import type { Topic } from '../../types/topic';
import type { TodoItem } from '../../types/todo-item';

const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

function Panel({ title, emptyText, items }: { title: string; emptyText: string; items: ReactNode[] }) {
    return (
        <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">{title}</h2>
            {items.length === 0 ? (
                <p className="mt-2 text-xs text-[var(--app-text-muted)]">{emptyText}</p>
            ) : (
                <ul className="mt-2 flex flex-col gap-1.5 text-sm">{items}</ul>
            )}
        </section>
    );
}

export function TodayPanels() {
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
    const [topicsMap, setTopicsMap] = useState<Map<number, Topic>>(new Map());
    const [subjectsMap, setSubjectsMap] = useState<Map<number, Subject>>(new Map());
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const d = now.getDate();
        const dayStart = formatRequiredApiTimestamp(new Date(y, m, d));
        const dayEnd = formatRequiredApiTimestamp(new Date(y, m, d, 23, 59, 59));
        const soon = formatRequiredApiTimestamp(new Date(y, m, d + 14, 23, 59, 59));

        Promise.all([
            deadlineService.getAll(dayStart, soon),
            todoService.getAll(dateKey(now)),
            scheduledSessionService.getAll(dayStart, dayEnd),
            topicService.getAll(),
            subjectService.getAll(),
        ])
            .then(([dl, td, ss, topics, subjects]) => {
                if (active) {
                    setDeadlines(dl);
                    setTodos(td);
                    setScheduled(ss);
                    setTopicsMap(new Map(topics.map((t) => [t.id, t])));
                    setSubjectsMap(new Map(subjects.map((s) => [s.id, s])));
                }
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, []);

    const upcoming = deadlines
        .filter((item) => !item.isCompleted)
        .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
        .slice(0, 4);

    const sessions = [...scheduled]
        .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
        .slice(0, 4);

    return (
        <div className="flex flex-col gap-3">
            <Panel
                title="Upcoming deadlines"
                emptyText="No upcoming deadlines"
                items={upcoming.map((item) => {
                    const subjectId = item.subjectId ?? topicsMap.get(item.topicId ?? 0)?.subjectId;
                    const subject = subjectId ? subjectsMap.get(subjectId) : undefined;

                    return (
                        <li
                            key={item.id}
                            onClick={() => navigate('/day')}
                            className="group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-px hover:bg-neutral-500/10"
                        >
                            <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: subject?.color ?? '#d4d4d4' }} />

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-semibold text-[var(--app-text)]">{item.title}</span>

                                    {item.urgency && (
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                                                item.urgency === 'high'
                                                    ? 'bg-red-500/15 text-red-500'
                                                    : item.urgency === 'medium'
                                                        ? 'bg-amber-500/15 text-amber-500'
                                                        : 'bg-emerald-500/15 text-emerald-500'
                                            }`}
                                        >
                                            {item.urgency.toLowerCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-0.5 text-xs text-[var(--app-text-muted)]">
                                    {item.allDay ? shortDate(item.dueAt) : `${shortDate(item.dueAt)} · ${clock(item.dueAt)}`}
                                </div>
                            </div>
                        </li>
                    );
                })}
            />

            <Panel
                title="Today's to-do"
                emptyText="No to-do's for today"
                items={todos.slice(0, 5).map((item) => (
                    <li
                        key={item.id}
                        onClick={() => navigate('/day')}
                        className={`group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-px hover:bg-neutral-500/10 ${
                            item.isCompleted ? 'opacity-60' : ''
                        }`}
                    >
                        <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                                item.isCompleted ? 'border-[var(--accent-color)] bg-[var(--accent-color)]' : 'border-[var(--app-border)] group-hover:border-[var(--accent-color)]/70'
                            }`}
                        >
                            {item.isCompleted && (
                                <svg
                                    viewBox="0 0 12 12"
                                    className="h-2.5 w-2.5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M2.5 6l2 2 5-5" />
                                </svg>
                            )}
                        </span>

                        <span className={`min-w-0 truncate text-sm ${item.isCompleted ? 'text-[var(--app-text-muted)] line-through' : 'font-semibold text-[var(--app-text)]'}`}>
                            {item.text}
                        </span>
                    </li>
                ))}
            />

            <Panel
                title="Today's scheduled"
                emptyText="No scheduled sessions for today"
                items={sessions.map((item) => {
                    const topic = topicsMap.get(item.topicId);
                    const subject = topic ? subjectsMap.get(topic.subjectId) : undefined;

                    return (
                        <li
                            key={item.id}
                            onClick={() => navigate('/week')}
                            className="group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-px hover:bg-neutral-500/10"
                        >
                            <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: subject?.color ?? '#d4d4d4' }} />

                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-[var(--app-text)]">{item.title ?? topic?.name ?? 'Study session'}</div>
                                <div className="mt-0.5 text-xs tabular-nums text-[var(--app-text-muted)]">
                                    {clock(item.startedAt)} – {clock(item.endedAt)}
                                </div>
                            </div>
                        </li>
                    );
                })}
            />
        </div>
    );
}