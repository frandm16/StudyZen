import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRequiredApiTimestamp } from '../../lib/api-datetime';
import { deadlineService } from '../../services/deadline-service';
import { scheduledSessionService } from '../../services/scheduled-session-service';
import { todoService } from '../../services/todo-service';
import type { Deadline } from '../../types/deadline';
import type { ScheduledSession } from '../../types/scheduled-session';
import type { TodoItem } from '../../types/todo-item';

const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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

        deadlineService.getAll(dayStart, soon).then((result) => {
            if (active) setDeadlines(result);
        }).catch(() => {});

        todoService.getAll(dateKey(now)).then((result) => {
            if (active) setTodos(result);
        }).catch(() => {});

        scheduledSessionService.getAll(dayStart, dayEnd).then((result) => {
            if (active) setScheduled(result);
        }).catch(() => {});

        return () => {
            active = false;
        };
    }, []);

    const upcoming = deadlines
        .filter((item) => !item.isCompleted)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 4);

    const sessions = [...scheduled]
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, 4);

    return (
        <div className="flex flex-col gap-3">
            <Panel
                title="Upcoming deadlines"
                emptyText="No upcoming deadlines"
                items={upcoming.map((item) => (
                    <li key={item.id} onClick={() => navigate('/day')} className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-px hover:bg-neutral-50">
                        <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: item.task?.tag?.color ?? '#d4d4d4' }} />

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium text-[#151414]">{item.title}</span>

                                {item.urgency && (
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${item.urgency.toLowerCase() === 'high' ? 'bg-red-100 text-red-600' : item.urgency.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                        {item.urgency.toLowerCase()}
                                    </span>
                                )}
                            </div>

                            <div className="mt-0.5 text-xs text-neutral-400">
                                {item.allDay ? shortDate(item.dueDate) : `${shortDate(item.dueDate)} · ${clock(item.dueDate)}`}
                            </div>
                        </div>
                    </li>
                ))}
            />

            <Panel
                title="Today's to-do"
                emptyText="No to-do's for today"
                items={todos.slice(0, 5).map((item) => (
                    <li key={item.id} onClick={() => navigate('/day')} className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-px hover:bg-neutral-50 ${item.isCompleted ? 'opacity-60' : ''}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${item.isCompleted ? 'border-[#151414] bg-[#151414]' : 'border-neutral-300 group-hover:border-[#151414]/50'}`}>
                            {item.isCompleted && (
                                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2.5 6l2 2 5-5" />
                                </svg>
                            )}
                        </span>

                        <span className={`min-w-0 truncate text-sm ${item.isCompleted ? 'text-neutral-400 line-through' : 'font-medium text-[#151414]'}`}>
                            {item.text}
                        </span>
                    </li>
                ))}
            />

            <Panel
                title="Today's scheduled"
                emptyText="No scheduled sessions for today"
                items={sessions.map((item) => (
                    <li key={item.id} onClick={() => navigate('/week')} className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-px hover:bg-neutral-50">
                        <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: item.task?.tag?.color ?? '#d4d4d4' }} />

                        <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-[#151414]">{item.title ?? item.task.name}</div>
                            <div className="mt-0.5 text-xs tabular-nums text-neutral-400">{clock(item.startDate)} – {clock(item.endDate)}</div>
                        </div>
                    </li>
                ))}
            />
        </div>
    );
}