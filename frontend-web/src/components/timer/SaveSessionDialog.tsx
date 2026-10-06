import { useState, type FormEvent } from 'react';
import type { Topic } from '../../types/topic';
import { fieldClass, ghostButton, Modal, primaryButton } from '../ui/Modal';

export interface SaveValues {
    title: string;
    description: string;
    rating: number;
}

interface Props {
    topic: Topic | null;
    minutes: number;
    saving: boolean;
    error: string | null;
    onPickTopic: () => void;
    onCancel: () => void;
    onSave: (values: SaveValues) => void;
}

export function SaveSessionDialog({ topic, minutes, saving, error, onPickTopic, onCancel, onSave }: Props) {
    const [title, setTitle] = useState('');
    const [titleTouched, setTitleTouched] = useState(false);
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(0);

    const effectiveTitle = titleTouched ? title : (topic?.name ?? '');
    const canSave = !saving && topic !== null && effectiveTitle.trim() !== '';

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (canSave) onSave({ title: effectiveTitle, description, rating });
    };

    return (
        <Modal title="Save Session" onClose={onCancel}>
            <form onSubmit={submit} className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]">
                    <div className="min-w-0 text-sm">
                        <p className="font-semibold text-[var(--app-text)]">{minutes} min studied</p>
                        {topic ? (
                            <p className="truncate text-xs text-[var(--app-text-muted)] mt-0.5">
                                {topic.name}
                            </p>
                        ) : (
                            <p className="text-xs text-[var(--app-text-muted)] mt-0.5">Pick a subject and topic first.</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onPickTopic}
                        className="cursor-pointer whitespace-nowrap rounded-full border border-[var(--app-border)] px-4 py-1.5 text-xs font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                    >
                        Change
                    </button>
                </div>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Title
                    <input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => setTitleTouched(true)}
                        placeholder={topic?.name}
                        className={fieldClass}
                    />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Description (optional)
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="How did it go?"
                        className={fieldClass}
                    />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Focus (1-5)
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className={fieldClass}
                    />
                </label>

                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                <div className="flex justify-end gap-2 border-t border-[var(--app-border)] pt-5">
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