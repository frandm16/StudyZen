import { useEffect, useState, type ReactNode } from 'react';
import { formatRequiredApiTimestamp } from '../../lib/api-datetime';
import { deadlineService } from '../../services/deadline-service';
import { scheduledSessionService } from '../../services/scheduled-session-service';
import { todoService } from '../../services/todo-service';
import type { Deadline } from '../../types/deadline';
import type { ScheduledSession } from '../../types/scheduled-session';
import type { TodoItem } from '../../types/todo-item';

const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const clock = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

function Panel({ title, emptyText, items }: { title: string; emptyText: string; items: ReactNode[] }) {
    return (
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <h2 className="text-xs text-neutral-500">{title}</h2>
            {items.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-400">{emptyText}</p>
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

    useEffect(() => {
        let active = true;
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const d = now.getDate();
        const dayStart = formatRequiredApiTimestamp(new Date(y, m, d));
        const dayEnd = formatRequiredApiTimestamp(new Date(y, m, d, 23, 59, 59));
        const soon = formatRequiredApiTimestamp(new Date(y, m, d + 14, 23, 59, 59));

        deadlineService
            .getAll(dayStart, soon)
            .then((result) => {
                if (active) setDeadlines(result);
            })
            .catch(() => {});
        todoService
            .getAll(dateKey(now))
            .then((result) => {
                if (active) setTodos(result);
            })
            .catch(() => {});
        scheduledSessionService
            .getAll(dayStart, dayEnd)
            .then((result) => {
                if (active) setScheduled(result);
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, []);

    const upcoming = deadlines
        .filter((item) => !item.isCompleted)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 4);
    const sessions = [...scheduled].sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 4);

    return (
        <div className="flex flex-col gap-3">
            <Panel
                title="Upcoming deadlines"
                emptyText="No upcoming deadlines"
                items={upcoming.map((item) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-3">
                        <span className="truncate">{item.title}</span>
                        <span className="shrink-0 text-xs text-neutral-500">
                            {shortDate(item.dueDate)}
                            {!item.allDay && ` · ${clock(item.dueDate)}`}
                        </span>
                    </li>
                ))}
            />
            <Panel
                title="Today's to-do"
                emptyText="No to-do's for today"
                items={todos.slice(0, 5).map((item) => (
                    <li
                        key={item.id}
                        className={`truncate ${item.isCompleted ? 'text-neutral-400 line-through' : ''}`}
                    >
                        {item.text}
                    </li>
                ))}
            />
            <Panel
                title="Today's scheduled"
                emptyText="No scheduled sessions for today"
                items={sessions.map((item) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-3">
                        <span className="truncate">{item.title ?? item.task.name}</span>
                        <span className="shrink-0 text-xs text-neutral-500">
                            {clock(item.startDate)}–{clock(item.endDate)}
                        </span>
                    </li>
                ))}
            />
        </div>
    );
}