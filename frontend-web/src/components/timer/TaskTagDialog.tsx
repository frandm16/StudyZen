import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { getApiErrorMessage } from '../../services/api';
import { tagService } from '../../services/tag-service';
import { taskService } from '../../services/task-service';
import type { Tag } from '../../types/tag';
import type { Task } from '../../types/task';
import { fieldClass, ghostButton, Modal, primaryButton } from '../ui/Modal';

const PALETTE = ['#4287f5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#64748b'];

interface Props {
    tags: Tag[];
    tasks: Task[];
    initialTagId: number | null;
    initialTaskId: number | null;
    onClose: () => void;
    onConfirm: (tag: Tag, task: Task) => void;
    onClear?: () => void;
    onTagCreated?: (tag: Tag) => void;
    onTaskCreated?: (task: Task) => void;
}

function Dot({ color, className = '' }: { color?: string; className?: string }) {
    return (
        <span
            className={`inline-block h-3 w-3 shrink-0 rounded-full ${className}`}
            style={{ backgroundColor: color || '#a3a3a3' }}
        />
    );
}

function Step({ number, done, children }: { number: number; done: boolean; children: string }) {
    return (
        <h3 className="mb-2.5 flex items-center gap-2.5 text-sm font-medium">
            <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors ${
                    done ? 'bg-[#151414] text-white' : 'bg-neutral-200 text-neutral-600'
                }`}
            >
                {done ? '✓' : number}
            </span>
            {children}
        </h3>
    );
}

const rowBase = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors';
const rowIdle = 'text-[#151414] hover:bg-neutral-100';
const rowSelected = 'bg-[#151414] text-white';

export function TaskTagDialog({
                                  tags,
                                  tasks,
                                  initialTagId,
                                  initialTaskId,
                                  onClose,
                                  onConfirm,
                                  onClear,
                                  onTagCreated,
                                  onTaskCreated,
                              }: Props) {
    const searchRef = useRef<HTMLInputElement>(null);
    const initialTask = tasks.find((task) => task.id === initialTaskId) ?? null;

    const [localTags, setLocalTags] = useState(tags);
    const [localTasks, setLocalTasks] = useState(tasks);
    const [tagId, setTagId] = useState<number | null>(initialTask?.tag.id ?? initialTagId);
    const [taskId, setTaskId] = useState<number | null>(initialTask?.id ?? null);
    const [query, setQuery] = useState('');
    const [creatingTag, setCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(PALETTE[0]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeTags = useMemo(
        () => localTags.filter((tag) => !tag.isArchived).sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite)),
        [localTags],
    );
    const selectedTag = localTags.find((tag) => tag.id === tagId) ?? null;
    const selectedTask = localTasks.find((task) => task.id === taskId) ?? null;

    const tagTasks = useMemo(
        () => localTasks.filter((task) => task.tag.id === tagId).sort((a, b) => a.name.localeCompare(b.name, 'es')),
        [localTasks, tagId],
    );
    const q = query.trim().toLowerCase();
    const visibleTasks = q ? tagTasks.filter((task) => task.name.toLowerCase().includes(q)) : tagTasks;
    const canCreateTask = selectedTag !== null && q !== '' && !tagTasks.some((task) => task.name.toLowerCase() === q);

    useEffect(() => {
        if (tagId !== null) searchRef.current?.focus();
    }, [tagId]);

    const pickTag = (tag: Tag) => {
        setTagId(tag.id);
        if (selectedTask && selectedTask.tag.id !== tag.id) setTaskId(null);
        setQuery('');
        setError(null);
    };

    const submitTag = async (event: FormEvent) => {
        event.preventDefault();
        const name = newTagName.trim();
        if (!name || busy) return;
        setBusy(true);
        setError(null);
        try {
            const clash = localTags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
            if (clash?.isArchived) throw new Error('A tag with that name already exists in your archive.');
            const tag = clash ?? (await tagService.create({ name, color: newTagColor }));
            if (!clash) {
                setLocalTags((current) => [...current, tag]);
                onTagCreated?.(tag);
            }
            pickTag(tag);
            setCreatingTag(false);
            setNewTagName('');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const createTask = async () => {
        if (!selectedTag || !canCreateTask || busy) return;
        setBusy(true);
        setError(null);
        try {
            const created = await taskService.create({
                taskName: query.trim(),
                tagName: selectedTag.name,
                tagColor: selectedTag.color,
            });
            const task: Task = { ...created, tag: selectedTag };
            setLocalTasks((current) => [...current, task]);
            onTaskCreated?.(task);
            setTaskId(task.id);
            setQuery('');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const confirm = () => {
        if (selectedTag && selectedTask) onConfirm(selectedTag, selectedTask);
    };

    const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        if (canCreateTask) {
            void createTask();
            return;
        }
        const target = visibleTasks.find((task) => task.id === taskId) ?? visibleTasks[0];
        if (!target) return;
        if (target.id === taskId) confirm();
        else setTaskId(target.id);
    };

    return (
        <Modal title="Choose tag & task" onClose={onClose} size="xl">
            <div className="grid gap-6 md:grid-cols-[15rem_1fr]">
                <section aria-label="Tag">
                    <Step number={1} done={selectedTag !== null}>
                        Tag
                    </Step>
                    <div
                        role="radiogroup"
                        aria-label="Tag"
                        className="flex h-64 flex-col gap-1 overflow-y-auto rounded-xl border border-neutral-200 p-1.5"
                    >
                        {activeTags.length === 0 && (
                            <p className="m-auto px-4 text-center text-sm text-neutral-500">
                                You don't have any tags yet. Create your first one below.
                            </p>
                        )}
                        {activeTags.map((tag) => {
                            const selected = tagId === tag.id;
                            const count = localTasks.filter((task) => task.tag.id === tag.id).length;
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => pickTag(tag)}
                                    className={`${rowBase} ${selected ? rowSelected : rowIdle}`}
                                >
                                    <Dot color={tag.color} className={selected ? 'ring-2 ring-white/60' : ''} />
                                    <span className="truncate">{tag.name}</span>
                                    <span className="ml-auto shrink-0 text-xs opacity-60">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {creatingTag ? (
                        <form onSubmit={submitTag} className="mt-3 flex flex-col gap-3 rounded-xl border border-neutral-200 p-3">
                            <input
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="Tag name"
                                aria-label="Tag name"
                                maxLength={40}
                                autoFocus
                                className={fieldClass}
                            />
                            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Color">
                                {PALETTE.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        role="radio"
                                        aria-checked={newTagColor === color}
                                        aria-label={`Color ${color}`}
                                        onClick={() => setNewTagColor(color)}
                                        className={`h-6 w-6 rounded-full transition-shadow ${
                                            newTagColor === color ? 'ring-2 ring-[#151414] ring-offset-2' : ''
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={newTagColor}
                                    onChange={(e) => setNewTagColor(e.target.value)}
                                    aria-label="Custom color"
                                    className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCreatingTag(false)}
                                    className="px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:text-[#151414]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={busy || newTagName.trim() === ''}
                                    className="rounded-full bg-[#151414] px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Add tag
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setCreatingTag(true)}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 py-2.5 text-sm text-neutral-600 transition-colors hover:border-[#151414] hover:text-[#151414]"
                        >
                            + New tag
                        </button>
                    )}
                </section>

                <section aria-label="Task">
                    <Step number={2} done={selectedTask !== null}>
                        Task
                    </Step>
                    <input
                        ref={searchRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onSearchKeyDown}
                        disabled={selectedTag === null}
                        placeholder={selectedTag ? `Search or create a task in ${selectedTag.name}` : 'Pick a tag first'}
                        aria-label="Search or create a task"
                        autoComplete="off"
                        maxLength={80}
                        className={fieldClass}
                    />

                    <div
                        role="radiogroup"
                        aria-label="Task"
                        className="mt-2 flex h-64 flex-col gap-1 overflow-y-auto rounded-xl border border-neutral-200 p-1.5"
                    >
                        {selectedTag === null ? (
                            <p className="m-auto px-6 text-center text-sm text-neutral-500">
                                Pick a tag on the left to see its tasks.
                            </p>
                        ) : (
                            <>
                                {canCreateTask && (
                                    <button
                                        type="button"
                                        onClick={() => void createTask()}
                                        disabled={busy}
                                        className="flex w-full items-center gap-3 rounded-lg border border-dashed border-neutral-300 px-3 py-2.5 text-left text-sm transition-colors hover:border-[#151414] disabled:opacity-50"
                                    >
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#151414] text-white">
                                            +
                                        </span>
                                        <span className="truncate">Create “{query.trim()}”</span>
                                        <span className="ml-auto shrink-0 text-xs text-neutral-400">in {selectedTag.name}</span>
                                    </button>
                                )}
                                {visibleTasks.map((task) => {
                                    const selected = taskId === task.id;
                                    return (
                                        <button
                                            key={task.id}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            onClick={() => setTaskId(task.id)}
                                            onDoubleClick={() => onConfirm(selectedTag, task)}
                                            className={`${rowBase} ${selected ? rowSelected : rowIdle}`}
                                        >
                                            <span className="truncate">{task.name}</span>
                                            {task.id === initialTaskId && !selected && (
                                                <span className="ml-auto shrink-0 text-xs text-neutral-400">In use</span>
                                            )}
                                            {selected && <span className="ml-auto shrink-0">✓</span>}
                                        </button>
                                    );
                                })}
                                {tagTasks.length === 0 && !canCreateTask && (
                                    <p className="m-auto px-6 text-center text-sm text-neutral-500">
                                        No tasks in this tag yet. Type a name above to create the first one.
                                    </p>
                                )}
                                {tagTasks.length > 0 && visibleTasks.length === 0 && !canCreateTask && (
                                    <p className="m-auto px-6 text-center text-sm text-neutral-500">No tasks match your search.</p>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>

            {error && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-5">
                <p className="flex min-h-8 min-w-0 items-center gap-2 text-sm text-neutral-500">
                    {selectedTag && selectedTask ? (
                        <>
                            Selected
                            <span className="flex min-w-0 items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[#151414]">
                                <Dot color={selectedTag.color} className="h-2.5 w-2.5" />
                                <span className="truncate">
                                    {selectedTag.name} › {selectedTask.name}
                                </span>
                            </span>
                        </>
                    ) : (
                        'Choose a tag and a task to continue.'
                    )}
                </p>
                <div className="flex items-center gap-3">
                    {onClear && initialTaskId !== null && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-sm text-neutral-500 underline-offset-4 transition-colors hover:text-red-600 hover:underline"
                        >
                            Clear selection
                        </button>
                    )}
                    <button type="button" onClick={onClose} className={ghostButton}>
                        Cancel
                    </button>
                    <button type="button" onClick={confirm} disabled={!selectedTask || busy} className={primaryButton}>
                        Use this task
                    </button>
                </div>
            </div>
        </Modal>
    );
}