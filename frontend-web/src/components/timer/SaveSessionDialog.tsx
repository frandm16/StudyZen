import { useState, type FormEvent } from 'react';
import type { Task } from '../../types/task';
import { fieldClass, ghostButton, Modal, primaryButton } from '../ui/Modal';

export interface SaveValues {
    title: string;
    description: string;
    rating: number;
}

interface Props {
    task: Task | null;
    minutes: number;
    saving: boolean;
    error: string | null;
    onPickTask: () => void;
    onCancel: () => void;
    onSave: (values: SaveValues) => void;
}

export function SaveSessionDialog({ task, minutes, saving, error, onPickTask, onCancel, onSave }: Props) {
    const [title, setTitle] = useState('');
    const [titleTouched, setTitleTouched] = useState(false);
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(0);

    const effectiveTitle = titleTouched ? title : (task?.name ?? '');
    const canSave = !saving && task !== null && effectiveTitle.trim() !== '';

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (canSave) onSave({ title: effectiveTitle, description, rating });
    };

    return (
        <Modal title="Save Session" onClose={onCancel}>
            <form onSubmit={submit} className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-4 py-3">
                    <div className="min-w-0 text-sm">
                        <p className="font-medium">{minutes} min studied</p>
                        {task ? (
                            <p className="flex items-center gap-2 truncate text-neutral-500">
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: task.tag.color }}
                                />
                                {task.name} · {task.tag.name}
                            </p>
                        ) : (
                            <p className="text-neutral-500">Pick a tag and a task first.</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onPickTask}
                        className="shrink-0 text-sm text-neutral-600 underline-offset-4 hover:text-[#151414] hover:underline"
                    >
                        {task ? 'Change' : 'Choose'}
                    </button>
                </div>

                <label className="flex flex-col gap-1.5 text-sm text-neutral-500">
                    Title
                    <input
                        value={effectiveTitle}
                        onChange={(e) => {
                            setTitleTouched(true);
                            setTitle(e.target.value);
                        }}
                        placeholder="What did you study?"
                        maxLength={100}
                        className={fieldClass}
                    />
                </label>

                <label className="flex flex-col gap-1.5 text-sm text-neutral-500">
                    Description
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional notes about the session"
                        rows={3}
                        className={`${fieldClass} resize-none`}
                    />
                </label>

                <div role="group" aria-label="Rating" className="flex items-center gap-1">
                    <span className="mr-3 text-sm text-neutral-500">Rating</span>
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-label={`${value} out of 5`}
                            aria-pressed={rating >= value}
                            onClick={() => setRating(rating === value ? 0 : value)}
                            className={`text-2xl leading-none transition-colors ${
                                rating >= value ? 'text-[#151414]' : 'text-neutral-300 hover:text-neutral-500'
                            }`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                {error && (
                    <p role="alert" className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onCancel} className={ghostButton}>
                        Cancel
                    </button>
                    <button type="submit" disabled={!canSave} className={primaryButton}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}