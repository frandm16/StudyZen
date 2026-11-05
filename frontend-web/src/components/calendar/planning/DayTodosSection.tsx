import { useEffect, useState, type FormEvent } from 'react';
import { Check, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { todoService } from '../../../services/todo-service';
import { dateKey } from '../../../lib/planner-dates';
import { useToast } from '../../../context/ToastContext';
import { getApiErrorMessage } from '../../../services/api';
import type { TodoItem } from '../../../types/todo-item';

interface DayTodosSectionProps {
    selectedDate: Date;
}

export function DayTodosSection({ selectedDate }: DayTodosSectionProps) {
    const notify = useToast();
    const dayKey = dateKey(selectedDate);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);

        todoService.getAll(dayKey)
            .then((items) => {
                if (!active) return;
                setTodos(items);
            })
            .catch((err) => {
                if (!active) return;
                notify({
                    title: 'Could not load tasks',
                    description: getApiErrorMessage(err),
                    tone: 'error',
                });
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [dayKey, notify]);

    const handleAddTodo = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = newTodoText.trim();
        if (!trimmed) return;

        setAdding(true);
        try {
            const created = await todoService.create({
                date: dayKey,
                text: trimmed,
            });
            setTodos((prev) => [...prev, created]);
            setNewTodoText('');
            notify({
                title: 'Task added',
                tone: 'success',
            });
        } catch (err) {
            notify({
                title: 'Could not add task',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        } finally {
            setAdding(false);
        }
    };

    const handleToggleTodo = async (todo: TodoItem) => {
        try {
            const updated = await todoService.patch(todo.id, {
                isCompleted: !todo.isCompleted,
            });
            setTodos((prev) =>
                prev.map((item) => (item.id === todo.id ? updated : item))
            );
            notify({
                title: updated.isCompleted ? 'Task completed' : 'Task reopened',
                tone: 'success',
            });
        } catch (err) {
            notify({
                title: 'Could not update task',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        }
    };

    const handleDeleteTodo = async (id: number) => {
        try {
            await todoService.delete(id);
            setTodos((prev) => prev.filter((item) => item.id !== id));
            notify({
                title: 'Task deleted',
                tone: 'success',
            });
        } catch (err) {
            notify({
                title: 'Could not delete task',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        }
    };

    const completedCount = todos.filter((t) => t.isCompleted).length;
    const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--accent-color)]">
                    <CheckSquare size={14} />
                    <span>Daily Tasks</span>
                </div>
                {todos.length > 0 && (
                    <span className="text-[11px] font-semibold text-[var(--app-text-muted)]">
                        {completedCount} / {todos.length} ({progressPercent}%)
                    </span>
                )}
            </div>

            {todos.length > 0 && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--app-border)]">
                    <div
                        className="h-full rounded-full bg-[var(--accent-color)] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            <form onSubmit={handleAddTodo} className="flex gap-2">
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Add task for this day..."
                    className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1.5 text-xs text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:border-[var(--accent-color)] focus:outline-none transition-colors"
                />
                <button
                    type="submit"
                    disabled={adding || !newTodoText.trim()}
                    aria-label="Add task"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-color)] text-[var(--app-bg)] shadow-xs transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                    <Plus size={16} strokeWidth={2.5} />
                </button>
            </form>

            <div className="flex flex-col gap-1.5">
                {loading ? (
                    <div className="space-y-2 py-2">
                        <div className="h-7 animate-pulse rounded-lg bg-[var(--app-bg)]/60" />
                        <div className="h-7 animate-pulse rounded-lg bg-[var(--app-bg)]/60" />
                    </div>
                ) : todos.length === 0 ? (
                    <p className="py-2 text-center text-xs text-[var(--app-text-muted)]">
                        No tasks for this day. Plan ahead!
                    </p>
                ) : (
                    todos.map((todo) => (
                        <div
                            key={todo.id}
                            className={`group flex items-center justify-between gap-2 rounded-xl border border-[var(--app-border)] px-2.5 py-1.5 transition-colors hover:border-[var(--accent-color)]/30 ${
                                todo.isCompleted
                                    ? 'bg-[var(--app-bg)]/40 text-[var(--app-text-muted)] opacity-75'
                                    : 'bg-[var(--app-bg)] text-[var(--app-text)]'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => handleToggleTodo(todo)}
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                    todo.isCompleted
                                        ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-[var(--app-bg)]'
                                        : 'border-[var(--app-border)] hover:border-[var(--accent-color)]'
                                }`}
                                aria-label={todo.isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
                            >
                                {todo.isCompleted && <Check size={11} strokeWidth={3} />}
                            </button>

                            <span
                                className={`flex-1 truncate text-xs ${
                                    todo.isCompleted ? 'line-through text-[var(--app-text-muted)]' : ''
                                }`}
                            >
                                {todo.text}
                            </span>

                            <button
                                type="button"
                                onClick={() => handleDeleteTodo(todo.id)}
                                aria-label="Delete task"
                                className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
