import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { getApiErrorMessage } from '../../services/api';
import { subjectService } from '../../services/subject-service';
import { topicService } from '../../services/topic-service';
import type { Subject } from '../../types/subject';
import type { Topic } from '../../types/topic';
import { fieldClass, ghostButton, Modal, primaryButton } from '../ui/Modal';

const PALETTE = ['#4287f5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#64748b'];

interface Props {
    subjects: Subject[];
    topics: Topic[];
    initialSubjectId: number | null;
    initialTopicId: number | null;
    onClose: () => void;
    onConfirm: (subject: Subject, topic: Topic) => void;
    onClear?: () => void;
    onSubjectCreated?: (subject: Subject) => void;
    onTopicCreated?: (topic: Topic) => void;
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
    subjects,
    topics,
    initialSubjectId,
    initialTopicId,
    onClose,
    onConfirm,
    onClear,
    onSubjectCreated,
    onTopicCreated,
}: Props) {
    const searchRef = useRef<HTMLInputElement>(null);
    const initialTopic = topics.find((topic) => topic.id === initialTopicId) ?? null;

    const [localSubjects, setLocalSubjects] = useState(subjects);
    const [localTopics, setLocalTopics] = useState(topics);
    const [subjectId, setSubjectId] = useState<number | null>(initialTopic?.subjectId ?? initialSubjectId);
    const [topicId, setTopicId] = useState<number | null>(initialTopic?.id ?? null);
    const [query, setQuery] = useState('');
    const [creatingSubject, setCreatingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectColor, setNewSubjectColor] = useState(PALETTE[0]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeSubjects = useMemo(
        () => localSubjects.filter((subject) => !subject.isArchived).sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite)),
        [localSubjects],
    );
    const selectedSubject = localSubjects.find((subject) => subject.id === subjectId) ?? null;
    const selectedTopic = localTopics.find((topic) => topic.id === topicId) ?? null;

    const subjectTopics = useMemo(
        () => localTopics.filter((topic) => topic.subjectId === subjectId).sort((a, b) => a.name.localeCompare(b.name, 'es')),
        [localTopics, subjectId],
    );
    const q = query.trim().toLowerCase();
    const visibleTopics = q ? subjectTopics.filter((topic) => topic.name.toLowerCase().includes(q)) : subjectTopics;
    const canCreateTopic = selectedSubject !== null && q !== '' && !subjectTopics.some((topic) => topic.name.toLowerCase() === q);

    useEffect(() => {
        if (subjectId !== null) searchRef.current?.focus();
    }, [subjectId]);

    const pickSubject = (subject: Subject) => {
        setSubjectId(subject.id);
        if (selectedTopic && selectedTopic.subjectId !== subject.id) setTopicId(null);
        setQuery('');
        setError(null);
    };

    const submitSubject = async (event: FormEvent) => {
        event.preventDefault();
        const name = newSubjectName.trim();
        if (!name || busy) return;
        setBusy(true);
        setError(null);
        try {
            const clash = localSubjects.find((subject) => subject.name.toLowerCase() === name.toLowerCase());
            if (clash?.isArchived) throw new Error('A subject with that name already exists in your archive.');
            const subject = clash ?? (await subjectService.create({ name, color: newSubjectColor }));
            if (!clash) {
                setLocalSubjects((current) => [...current, subject]);
                onSubjectCreated?.(subject);
            }
            pickSubject(subject);
            setCreatingSubject(false);
            setNewSubjectName('');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const createTopic = async () => {
        if (!selectedSubject || !canCreateTopic || busy) return;
        setBusy(true);
        setError(null);
        try {
            const created = await topicService.create({
                name: query.trim(),
                subjectId: selectedSubject.id,
            });
            setLocalTopics((current) => [...current, created]);
            onTopicCreated?.(created);
            setTopicId(created.id);
            setQuery('');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const confirm = () => {
        if (selectedSubject && selectedTopic) onConfirm(selectedSubject, selectedTopic);
    };

    const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        if (canCreateTopic) {
            void createTopic();
            return;
        }
        const target = visibleTopics.find((topic) => topic.id === topicId) ?? visibleTopics[0];
        if (!target) return;
        if (target.id === topicId) confirm();
        else setTopicId(target.id);
    };

    return (
        <Modal title="Choose subject & topic" onClose={onClose} size="xl">
            <div className="grid gap-6 md:grid-cols-[15rem_1fr]">
                <section aria-label="Subject">
                    <Step number={1} done={selectedSubject !== null}>
                        Subject
                    </Step>
                    <div
                        role="radiogroup"
                        aria-label="Subject"
                        className="flex h-64 flex-col gap-1 overflow-y-auto rounded-xl border border-neutral-200 p-1.5"
                    >
                        {activeSubjects.length === 0 && (
                            <p className="m-auto px-4 text-center text-sm text-neutral-500">
                                You don't have any subjects yet. Create your first one below.
                            </p>
                        )}
                        {activeSubjects.map((subject) => {
                            const selected = subjectId === subject.id;
                            const count = localTopics.filter((topic) => topic.subjectId === subject.id).length;
                            return (
                                <button
                                    key={subject.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => pickSubject(subject)}
                                    className={`${rowBase} ${selected ? rowSelected : rowIdle}`}
                                >
                                    <Dot color={subject.color} className={selected ? 'ring-2 ring-white/60' : ''} />
                                    <span className="truncate">{subject.name}</span>
                                    <span className="ml-auto shrink-0 text-xs opacity-60">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {creatingSubject ? (
                        <form onSubmit={submitSubject} className="mt-3 flex flex-col gap-3 rounded-xl border border-neutral-200 p-3">
                            <input
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                placeholder="Subject name"
                                aria-label="Subject name"
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
                                        aria-checked={newSubjectColor === color}
                                        aria-label={`Color ${color}`}
                                        onClick={() => setNewSubjectColor(color)}
                                        className={`h-6 w-6 rounded-full transition-shadow ${
                                            newSubjectColor === color ? 'ring-2 ring-[#151414] ring-offset-2' : ''
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={newSubjectColor}
                                    onChange={(e) => setNewSubjectColor(e.target.value)}
                                    aria-label="Custom color"
                                    className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCreatingSubject(false)}
                                    className="px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:text-[#151414]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={busy || newSubjectName.trim() === ''}
                                    className="rounded-full bg-[#151414] px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Add subject
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setCreatingSubject(true)}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 py-2.5 text-sm text-neutral-600 transition-colors hover:border-[#151414] hover:text-[#151414]"
                        >
                            + New subject
                        </button>
                    )}
                </section>

                <section aria-label="Topic">
                    <Step number={2} done={selectedTopic !== null}>
                        Topic
                    </Step>
                    <input
                        ref={searchRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onSearchKeyDown}
                        disabled={selectedSubject === null}
                        placeholder={selectedSubject ? `Search or create a topic in ${selectedSubject.name}` : 'Pick a subject first'}
                        aria-label="Search or create a topic"
                        autoComplete="off"
                        maxLength={80}
                        className={fieldClass}
                    />

                    <div
                        role="radiogroup"
                        aria-label="Topic"
                        className="mt-2 flex h-64 flex-col gap-1 overflow-y-auto rounded-xl border border-neutral-200 p-1.5"
                    >
                        {selectedSubject === null ? (
                            <p className="m-auto px-6 text-center text-sm text-neutral-500">
                                Pick a subject on the left to see its topics.
                            </p>
                        ) : (
                            <>
                                {canCreateTopic && (
                                    <button
                                        type="button"
                                        onClick={() => void createTopic()}
                                        disabled={busy}
                                        className="flex w-full items-center gap-3 rounded-lg border border-dashed border-neutral-300 px-3 py-2.5 text-left text-sm transition-colors hover:border-[#151414] disabled:opacity-50"
                                    >
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#151414] text-white">
                                            +
                                        </span>
                                        <span className="truncate">Create "{query.trim()}"</span>
                                        <span className="ml-auto shrink-0 text-xs text-neutral-400">in {selectedSubject.name}</span>
                                    </button>
                                )}
                                {visibleTopics.map((topic) => {
                                    const selected = topicId === topic.id;
                                    return (
                                        <button
                                            key={topic.id}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            onClick={() => setTopicId(topic.id)}
                                            onDoubleClick={() => onConfirm(selectedSubject, topic)}
                                            className={`${rowBase} ${selected ? rowSelected : rowIdle}`}
                                        >
                                            <span className="truncate">{topic.name}</span>
                                            {topic.id === initialTopicId && !selected && (
                                                <span className="ml-auto shrink-0 text-xs text-neutral-400">In use</span>
                                            )}
                                            {selected && <span className="ml-auto shrink-0">✓</span>}
                                        </button>
                                    );
                                })}
                                {subjectTopics.length === 0 && !canCreateTopic && (
                                    <p className="m-auto px-6 text-center text-sm text-neutral-500">
                                        No topics in this subject yet. Type a name above to create the first one.
                                    </p>
                                )}
                                {subjectTopics.length > 0 && visibleTopics.length === 0 && !canCreateTopic && (
                                    <p className="m-auto px-6 text-center text-sm text-neutral-500">No topics match your search.</p>
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
                    {selectedSubject && selectedTopic ? (
                        <>
                            Selected
                            <span className="flex min-w-0 items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[#151414]">
                                <Dot color={selectedSubject.color} className="h-2.5 w-2.5" />
                                <span className="truncate">
                                    {selectedSubject.name} › {selectedTopic.name}
                                </span>
                            </span>
                        </>
                    ) : (
                        'Choose a subject and a topic to continue.'
                    )}
                </p>
                <div className="flex items-center gap-3">
                    {onClear && initialTopicId !== null && (
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
                    <button type="button" onClick={confirm} disabled={!selectedTopic || busy} className={primaryButton}>
                        Use this topic
                    </button>
                </div>
            </div>
        </Modal>
    );
}