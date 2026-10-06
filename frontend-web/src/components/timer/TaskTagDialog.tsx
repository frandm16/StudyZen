import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
} from 'react';
import { getApiErrorMessage } from '../../services/api';
import { subjectService } from '../../services/subject-service';
import { termService } from '../../services/term-service';
import { topicService } from '../../services/topic-service';
import type { AcademicTerm } from '../../types/academic-term';
import type { Subject } from '../../types/subject';
import type { Topic } from '../../types/topic';

const PALETTE = [
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#10b981',
    '#06b6d4',
    '#64748b',
];

type View = 'main' | 'new-subject' | 'new-term';

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

function CheckIcon({ size = 14 }: { size?: number }) {
    return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden>
            <path d="M3 8.5 6.5 12l6.5-8" />
        </svg>
    );
}

function PlusIcon({ size = 14 }: { size?: number }) {
    return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width={size} height={size} aria-hidden>
            <path d="M8 3v10M3 8h10" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" aria-hidden>
            <circle cx="9" cy="9" r="5.5" />
            <path d="m14 14 3 3" />
        </svg>
    );
}

function XIcon({ size = 14 }: { size?: number }) {
    return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width={size} height={size} aria-hidden>
            <path d="m4 4 8 8M12 4 4 12" />
        </svg>
    );
}

function Spinner({ size = 16 }: { size?: number }) {
    return (
        <span
            className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
            style={{ width: size, height: size }}
            aria-label="Loading"
        />
    );
}

function BackIcon() {
    return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <path d="m10 4-4 4 4 4" />
        </svg>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus:outline-none ${
                checked
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]'
                    : 'border-[var(--app-border)] bg-neutral-500/20'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    checked ? 'translate-x-5' : 'translate-x-0.5'
                }`}
            />
        </button>
    );
}

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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const topicInputRef = useRef<HTMLInputElement>(null);
    const subjectNameRef = useRef<HTMLInputElement>(null);

    const initialTopic = useMemo(() => topics.find((t) => t.id === initialTopicId) ?? null, [topics, initialTopicId]);

    const [view, setView] = useState<View>('main');
    const [localSubjects, setLocalSubjects] = useState<Subject[]>(subjects);
    const [localTopics, setLocalTopics] = useState<Topic[]>(topics);

    const [terms, setTerms] = useState<AcademicTerm[]>([]);
    const [termsLoading, setTermsLoading] = useState(true);

    const [subjectId, setSubjectId] = useState<number | null>(initialTopic?.subjectId ?? initialSubjectId);
    const [topicId, setTopicId] = useState<number | null>(initialTopic?.id ?? null);
    const [subjectFilter, setSubjectFilter] = useState('');
    const [topicQuery, setTopicQuery] = useState('');

    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectColor, setNewSubjectColor] = useState(PALETTE[0]);
    const [newSubjectTermId, setNewSubjectTermId] = useState<number | null>(null);

    const [newTermName, setNewTermName] = useState('');
    const [newTermStart, setNewTermStart] = useState(() => new Date().toISOString().slice(0, 10));
    const [newTermEnd, setNewTermEnd] = useState(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString().slice(0, 10);
    });
    const [newTermIsCurrent, setNewTermIsCurrent] = useState(true);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    useEffect(() => {
        if (view === 'new-subject') {
            setTimeout(() => subjectNameRef.current?.focus(), 60);
        }
    }, [view]);

    useEffect(() => {
        if (view === 'main' && subjectId !== null) {
            setTimeout(() => topicInputRef.current?.focus(), 60);
        }
    }, [view, subjectId]);

    const loadTerms = useCallback(() => {
        setTermsLoading(true);
        termService
            .getAll()
            .then((data) => {
                let foundCurrent = false;
                const sanitized = data.map((t) => {
                    if (t.isCurrent && !foundCurrent) {
                        foundCurrent = true;
                        return t;
                    }
                    if (t.isCurrent && foundCurrent) {
                        return { ...t, isCurrent: false };
                    }
                    return t;
                });
                setTerms(sanitized);
            })
            .catch(() => {})
            .finally(() => setTermsLoading(false));
    }, []);

    useEffect(() => {
        loadTerms();
    }, [loadTerms]);

    const activeSubjects = useMemo(
        () =>
            localSubjects
                .filter((s) => !s.isArchived)
                .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || a.name.localeCompare(b.name)),
        [localSubjects],
    );

    const filteredSubjects = useMemo(() => {
        const q = subjectFilter.trim().toLowerCase();
        return q ? activeSubjects.filter((s) => s.name.toLowerCase().includes(q)) : activeSubjects;
    }, [activeSubjects, subjectFilter]);

    const selectedSubject = useMemo(() => localSubjects.find((s) => s.id === subjectId) ?? null, [localSubjects, subjectId]);
    const selectedTopic = useMemo(() => localTopics.find((t) => t.id === topicId) ?? null, [localTopics, topicId]);

    const subjectTopics = useMemo(
        () => localTopics.filter((t) => t.subjectId === subjectId).sort((a, b) => a.name.localeCompare(b.name)),
        [localTopics, subjectId],
    );

    const filteredTopics = useMemo(() => {
        const q = topicQuery.trim().toLowerCase();
        return q ? subjectTopics.filter((t) => t.name.toLowerCase().includes(q)) : subjectTopics;
    }, [subjectTopics, topicQuery]);

    const cleanQuery = topicQuery.trim();
    const canCreateTopic =
        selectedSubject !== null &&
        cleanQuery !== '' &&
        !subjectTopics.some((t) => t.name.toLowerCase() === cleanQuery.toLowerCase());

    const activeTerm = useMemo(() => {
        const current = terms.find((t) => t.isCurrent && !t.isArchived);
        return current ?? terms.find((t) => !t.isArchived) ?? null;
    }, [terms]);

    const resolvedSelectedTerm = useMemo(() => {
        if (newSubjectTermId !== null) {
            return terms.find((t) => t.id === newSubjectTermId) ?? null;
        }
        return activeTerm;
    }, [terms, newSubjectTermId, activeTerm]);

    const pickSubject = useCallback(
        (s: Subject) => {
            setSubjectId(s.id);
            if (selectedTopic && selectedTopic.subjectId !== s.id) setTopicId(null);
            setTopicQuery('');
            setError(null);
        },
        [selectedTopic],
    );

    const handleCreateTerm = async (e: FormEvent) => {
        e.preventDefault();
        if (busy || !newTermName.trim()) return;
        setBusy(true);
        setError(null);
        try {
            const created = await termService.create({
                name: newTermName.trim(),
                startDate: newTermStart,
                endDate: newTermEnd,
                isCurrent: newTermIsCurrent,
            });

            setTerms((prev) => {
                const next = newTermIsCurrent
                    ? prev.map((t) => ({ ...t, isCurrent: false }))
                    : [...prev];
                return [...next.filter((t) => t.id !== created.id), created].sort(
                    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
                );
            });
            setNewSubjectTermId(created.id);
            setView('new-subject');
            setNewTermName('');
            setNewTermIsCurrent(false);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const handleCreateSubject = async (e: FormEvent) => {
        e.preventDefault();
        const name = newSubjectName.trim();
        if (!name || busy) return;

        const existing = localSubjects.find((s) => s.name.toLowerCase() === name.toLowerCase() && !s.isArchived);
        if (existing) {
            pickSubject(existing);
            setView('main');
            setNewSubjectName('');
            return;
        }

        setBusy(true);
        setError(null);
        try {
            const termIdToUse = newSubjectTermId !== null ? newSubjectTermId : (activeTerm?.id ?? undefined);
            const created = await subjectService.create({
                name,
                color: newSubjectColor,
                termId: termIdToUse,
            });
            setLocalSubjects((prev) => [...prev, created]);
            onSubjectCreated?.(created);
            pickSubject(created);
            setView('main');
            setNewSubjectName('');
            setNewSubjectTermId(null);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const handleCreateTopic = async (name?: string) => {
        const targetName = (name ?? cleanQuery).trim();
        if (!selectedSubject || !targetName || busy) return;
        setBusy(true);
        setError(null);
        try {
            const created = await topicService.create({ name: targetName, subjectId: selectedSubject.id });
            setLocalTopics((prev) => [...prev, created]);
            onTopicCreated?.(created);
            setTopicId(created.id);
            setTopicQuery('');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const handleTopicKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (canCreateTopic) { void handleCreateTopic(); return; }
        const target = filteredTopics.find((t) => t.id === topicId) ?? filteredTopics[0];
        if (target) {
            if (target.id === topicId && selectedSubject) onConfirm(selectedSubject, target);
            else setTopicId(target.id);
        }
    };

    const handleConfirm = () => {
        if (selectedSubject && selectedTopic) onConfirm(selectedSubject, selectedTopic);
    };

    const goBack = () => {
        setError(null);
        setView(view === 'new-term' ? 'new-subject' : 'main');
    };

    const TITLE: Record<View, string> = {
        'main': 'Select Study Focus',
        'new-subject': 'Create New Subject',
        'new-term': 'Create Academic Term',
    };
    const SUBTITLE: Record<View, string> = {
        'main': 'Choose a subject and topic to track your session',
        'new-subject': 'Add a new subject to organize your study sessions',
        'new-term': 'Academic terms group your subjects by semester or year',
    };

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            className="m-auto flex flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-0 text-[var(--app-text)] shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm"
            style={{ width: 'min(96vw, 68rem)', height: 'min(94vh, 860px)', maxHeight: '94vh' }}
        >
            <div className="flex h-full flex-col overflow-hidden">
                <div className="flex shrink-0 items-center gap-3 border-b border-[var(--app-border)] px-6 py-4">
                    {view !== 'main' && (
                        <button
                            type="button"
                            onClick={goBack}
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                        >
                            <BackIcon />
                            Back
                        </button>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-[var(--app-text)]">{TITLE[view]}</h2>
                        <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{SUBTITLE[view]}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--app-text-muted)] transition-colors hover:bg-neutral-500/15 hover:text-[var(--app-text)]"
                        aria-label="Close"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                {error && (
                    <div role="alert" className="mx-6 mt-4 flex shrink-0 items-start justify-between gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                        <div className="flex items-start gap-2">
                            <span className="font-bold">Error:</span>
                            <span>{error}</span>
                        </div>
                        <button type="button" onClick={() => setError(null)} className="shrink-0 cursor-pointer font-semibold underline underline-offset-2 hover:no-underline">
                            Dismiss
                        </button>
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
                    {view === 'main' && (
                        <div className="grid flex-1 h-full min-h-0 md:grid-cols-[24rem_1fr]">
                            <div className="flex flex-col border-b border-[var(--app-border)] p-5 md:border-b-0 md:border-r overflow-hidden h-full">
                                <div className="mb-3 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-color)] text-xs font-bold text-white shadow-sm">
                                            {selectedSubject ? <CheckIcon size={12} /> : '1'}
                                        </span>
                                        <span className="text-sm font-semibold text-[var(--app-text)]">Subjects</span>
                                        <span className="rounded-full bg-neutral-500/15 px-2 py-0.5 text-[10px] font-medium text-[var(--app-text-muted)]">
                                            {activeSubjects.length}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setView('new-subject'); setError(null); }}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[var(--accent-color)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent-color)] transition-colors hover:bg-[var(--accent-color)]/20"
                                    >
                                        <PlusIcon size={11} />
                                        New Subject
                                    </button>
                                </div>

                                <div className="relative mb-3 flex items-center shrink-0">
                                    <span className="pointer-events-none absolute left-3"><SearchIcon /></span>
                                    <input
                                        value={subjectFilter}
                                        onChange={(e) => setSubjectFilter(e.target.value)}
                                        placeholder="Filter subjects..."
                                        className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-2.5 pl-9 pr-8 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] transition-colors focus:border-[var(--accent-color)] focus:outline-none"
                                    />
                                    {subjectFilter && (
                                        <button
                                            type="button"
                                            onClick={() => setSubjectFilter('')}
                                            className="absolute right-2.5 cursor-pointer text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                                        >
                                            <XIcon size={13} />
                                        </button>
                                    )}
                                </div>

                                <div
                                    role="radiogroup"
                                    aria-label="Subjects"
                                    className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-2"
                                >
                                    {filteredSubjects.length === 0 ? (
                                        <div className="m-auto flex flex-col items-center gap-3 p-6 text-center">
                                            <span className="text-4xl">📚</span>
                                            <p className="text-xs text-[var(--app-text-muted)]">
                                                {subjectFilter ? `No subjects match "${subjectFilter}"` : 'No subjects yet — create your first one!'}
                                            </p>
                                            {!subjectFilter && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setView('new-subject'); setError(null); }}
                                                    className="cursor-pointer rounded-full bg-[var(--accent-color)] px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-90"
                                                >
                                                    Create Subject
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        filteredSubjects.map((s) => {
                                            const isSel = subjectId === s.id;
                                            const cnt = localTopics.filter((t) => t.subjectId === s.id).length;
                                            const term = terms.find((t) => t.id === s.termId);
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSel}
                                                    onClick={() => pickSubject(s)}
                                                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition-all ${
                                                        isSel
                                                            ? 'bg-[var(--accent-color)] font-semibold text-white shadow-md'
                                                            : 'text-[var(--app-text)] hover:bg-neutral-500/10'
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-3.5 w-3.5 shrink-0 rounded-full transition-shadow ${isSel ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-[var(--accent-color)]' : ''}`}
                                                        style={{ backgroundColor: s.color || '#3b82f6' }}
                                                    />
                                                    <div className="flex min-w-0 flex-1 flex-col">
                                                        <span className="truncate leading-snug">{s.name}</span>
                                                        {term && (
                                                            <span className={`truncate text-[11px] leading-tight mt-0.5 ${isSel ? 'text-white/75' : 'text-[var(--app-text-muted)]'}`}>
                                                                {term.name}{term.isCurrent ? ' (Current)' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {s.isFavorite && (
                                                        <span className={`text-xs ${isSel ? 'text-yellow-200' : 'text-yellow-500'}`}>★</span>
                                                    )}
                                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${isSel ? 'bg-white/20 text-white' : 'bg-neutral-500/15 text-[var(--app-text-muted)]'}`}>
                                                        {cnt}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col overflow-hidden p-5 h-full">
                                <div className="mb-3 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${selectedTopic ? 'bg-emerald-500 text-white shadow-sm' : 'bg-neutral-500/20 text-[var(--app-text-muted)]'}`}>
                                            {selectedTopic ? <CheckIcon size={12} /> : '2'}
                                        </span>
                                        <span className="text-sm font-semibold text-[var(--app-text)]">Topics & Tasks</span>
                                        {selectedSubject && (
                                            <span className="flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1 text-xs font-medium text-[var(--app-text)]">
                                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: selectedSubject.color || '#3b82f6' }} />
                                                <span className="max-w-[160px] truncate">{selectedSubject.name}</span>
                                            </span>
                                        )}
                                    </div>
                                    {selectedSubject && (
                                        <span className="text-xs text-[var(--app-text-muted)]">{subjectTopics.length} topic{subjectTopics.length !== 1 ? 's' : ''}</span>
                                    )}
                                </div>

                                {selectedSubject === null ? (
                                    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[var(--app-border)] p-10 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-500/10 text-3xl select-none">←</div>
                                        <div>
                                            <p className="font-semibold text-[var(--app-text)]">No subject selected</p>
                                            <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                                Pick a subject on the left to browse or create topics.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative mb-3 flex items-center shrink-0">
                                            <span className="pointer-events-none absolute left-3"><SearchIcon /></span>
                                            <input
                                                ref={topicInputRef}
                                                value={topicQuery}
                                                onChange={(e) => setTopicQuery(e.target.value)}
                                                onKeyDown={handleTopicKeyDown}
                                                placeholder={`Search or type to create topic in ${selectedSubject.name}…`}
                                                maxLength={80}
                                                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-2.5 pl-9 pr-8 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] transition-colors focus:border-[var(--accent-color)] focus:outline-none"
                                            />
                                            {topicQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTopicQuery('')}
                                                    className="absolute right-2.5 cursor-pointer text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                                                >
                                                    <XIcon size={13} />
                                                </button>
                                            )}
                                        </div>

                                        {canCreateTopic && (
                                            <button
                                                type="button"
                                                onClick={() => void handleCreateTopic()}
                                                disabled={busy}
                                                className="mb-2 flex shrink-0 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--accent-color)]/50 bg-[var(--accent-color)]/8 px-4 py-3 text-sm text-[var(--app-text)] transition-all hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/15 disabled:opacity-50"
                                            >
                                                {busy ? <Spinner size={18} /> : (
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-color)] text-white">
                                                        <PlusIcon size={11} />
                                                    </span>
                                                )}
                                                <span className="flex-1 text-left">
                                                    Create <strong>"{cleanQuery}"</strong>
                                                </span>
                                                <kbd className="shrink-0 rounded bg-neutral-500/15 px-2 py-0.5 font-mono text-[10px] text-[var(--app-text-muted)]">↵ Enter</kbd>
                                            </button>
                                        )}

                                        <div
                                            role="radiogroup"
                                            aria-label="Topics"
                                            className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-2"
                                        >
                                            {filteredTopics.length === 0 ? (
                                                <div className="m-auto flex flex-col items-center gap-2 p-6 text-center">
                                                    <p className="text-xs text-[var(--app-text-muted)]">
                                                        {topicQuery ? `No topics match "${topicQuery}".` : `No topics in ${selectedSubject.name} yet.`}
                                                    </p>
                                                    {!topicQuery && (
                                                        <p className="text-[11px] text-[var(--app-text-muted)]/70">
                                                            Type a name in the field above and press Enter.
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                filteredTopics.map((t) => {
                                                    const isSel = topicId === t.id;
                                                    const isCurr = t.id === initialTopicId;
                                                    return (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            role="radio"
                                                            aria-checked={isSel}
                                                            onClick={() => setTopicId(t.id)}
                                                            onDoubleClick={() => selectedSubject && onConfirm(selectedSubject, t)}
                                                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition-all ${
                                                                isSel
                                                                    ? 'bg-[var(--accent-color)] font-semibold text-white shadow-md'
                                                                    : 'text-[var(--app-text)] hover:bg-neutral-500/10'
                                                            }`}
                                                        >
                                                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${isSel ? 'border-white bg-white text-[var(--accent-color)]' : 'border-[var(--app-border)]'}`}>
                                                                {isSel && <CheckIcon size={10} />}
                                                            </span>
                                                            <span className="flex-1 truncate">{t.name}</span>
                                                            {isCurr && !isSel && (
                                                                <span className="shrink-0 rounded-full bg-neutral-500/15 px-2 py-0.5 text-[10px] text-[var(--app-text-muted)]">Active</span>
                                                            )}
                                                            {isSel && <span className="shrink-0 text-[11px] text-white/70">double-click to use</span>}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {view === 'new-subject' && (
                        <form onSubmit={handleCreateSubject} className="flex h-full flex-col gap-0 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                                <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Subject Name *</label>
                                            <input
                                                ref={subjectNameRef}
                                                value={newSubjectName}
                                                onChange={(e) => setNewSubjectName(e.target.value)}
                                                placeholder="e.g. Mathematics, Biology, History…"
                                                maxLength={60}
                                                required
                                                className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] transition-colors focus:border-[var(--accent-color)] focus:outline-none shadow-sm"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Color Palette</label>
                                            <div className="flex flex-wrap items-center gap-3">
                                                {PALETTE.map((c) => {
                                                    const sel = newSubjectColor.toLowerCase() === c;
                                                    return (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => setNewSubjectColor(c)}
                                                            className={`h-8 w-8 cursor-pointer rounded-full transition-all ${sel ? 'scale-115 ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-[var(--app-card-bg)] shadow-md' : 'hover:scale-105'}`}
                                                            style={{ backgroundColor: c }}
                                                            aria-label={`Color ${c}`}
                                                        />
                                                    );
                                                })}
                                                <label className="relative cursor-pointer" title="Custom color">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]">
                                                        <PlusIcon size={14} />
                                                    </span>
                                                    <input
                                                        type="color"
                                                        value={newSubjectColor}
                                                        onChange={(e) => setNewSubjectColor(e.target.value)}
                                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                    />
                                                </label>
                                                <span className="h-8 w-8 rounded-full border border-[var(--app-border)] shadow-sm" style={{ backgroundColor: newSubjectColor }} title="Current preview" />
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-5 shadow-sm">
                                            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Subject Card Preview</p>
                                            <div className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-3.5 shadow-sm">
                                                <span className="h-4 w-4 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: newSubjectColor }} />
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="truncate text-sm font-bold text-[var(--app-text)]">
                                                        {newSubjectName.trim() || 'Subject Name'}
                                                    </span>
                                                    <span className="truncate text-xs text-[var(--app-text-muted)] mt-0.5">
                                                        Term: {resolvedSelectedTerm ? resolvedSelectedTerm.name : 'General (Auto)'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                                                Academic Term
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => { setView('new-term'); setError(null); }}
                                                className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[var(--accent-color)] hover:underline"
                                            >
                                                <PlusIcon size={12} />
                                                New Academic Term
                                            </button>
                                        </div>

                                        {termsLoading ? (
                                            <div className="flex items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-sm text-[var(--app-text-muted)]">
                                                <Spinner size={16} />
                                                Loading academic terms…
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-2.5 max-h-[380px] overflow-y-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => setNewSubjectTermId(null)}
                                                    className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 text-left transition-all ${
                                                        newSubjectTermId === null
                                                            ? 'border-2 border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-sm'
                                                            : 'border border-[var(--app-border)] hover:bg-neutral-500/10'
                                                    }`}
                                                >
                                                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${newSubjectTermId === null ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white' : 'border-[var(--app-border)]'}`}>
                                                        {newSubjectTermId === null && <CheckIcon size={10} />}
                                                    </span>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm text-[var(--app-text)]">Auto-select</span>
                                                            <span className="rounded-full bg-[var(--accent-color)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-color)]">Recommended</span>
                                                        </div>
                                                        <p className="text-xs text-[var(--app-text-muted)] mt-1">
                                                            {activeTerm
                                                                ? `Links automatically to current term: "${activeTerm.name}"`
                                                                : 'A default "General" academic term will be generated automatically.'}
                                                        </p>
                                                    </div>
                                                </button>

                                                {terms.filter((t) => !t.isArchived).map((t) => {
                                                    const isSel = newSubjectTermId === t.id;
                                                    return (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            onClick={() => setNewSubjectTermId(t.id)}
                                                            className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 text-left transition-all ${
                                                                isSel
                                                                    ? 'border-2 border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-sm'
                                                                    : 'border border-[var(--app-border)] hover:bg-neutral-500/10'
                                                            }`}
                                                        >
                                                            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${isSel ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white' : 'border-[var(--app-border)]'}`}>
                                                                {isSel && <CheckIcon size={10} />}
                                                            </span>
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-sm text-[var(--app-text)]">{t.name}</span>
                                                                    {t.isCurrent && (
                                                                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                            Current
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-[var(--app-text-muted)] mt-0.5">
                                                                    {t.startDate} to {t.endDate}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex shrink-0 justify-end gap-3 border-t border-[var(--app-border)] px-6 py-4 bg-[var(--app-card-bg)]">
                                <button
                                    type="button"
                                    onClick={() => { setView('main'); setError(null); setNewSubjectName(''); }}
                                    className="cursor-pointer rounded-full border border-[var(--app-border)] px-5 py-2.5 text-sm font-semibold text-[var(--app-text-muted)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--app-text)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={busy || !newSubjectName.trim()}
                                    className="flex cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-color)] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {busy && <Spinner size={16} />}
                                    Create Subject
                                </button>
                            </div>
                        </form>
                    )}

                    {view === 'new-term' && (
                        <form onSubmit={handleCreateTerm} className="flex h-full flex-col gap-0 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                                <div className="flex max-w-xl mx-auto flex-col gap-6">
                                    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-xs text-[var(--app-text-muted)] leading-relaxed">
                                        Academic terms group your subjects by semester, trimester, or year.
                                        Only one academic term can be active as <strong>Current</strong> at any time.
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Term Name *</label>
                                        <input
                                            value={newTermName}
                                            onChange={(e) => setNewTermName(e.target.value)}
                                            placeholder="e.g. Fall 2026, Semester 1, 2026/2027…"
                                            maxLength={60}
                                            required
                                            autoFocus
                                            className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] transition-colors focus:border-[var(--accent-color)] focus:outline-none shadow-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Start Date *</label>
                                            <input
                                                type="date"
                                                value={newTermStart}
                                                onChange={(e) => setNewTermStart(e.target.value)}
                                                required
                                                className="w-full cursor-pointer rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-text)] transition-colors focus:border-[var(--accent-color)] focus:outline-none shadow-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">End Date *</label>
                                            <input
                                                type="date"
                                                value={newTermEnd}
                                                onChange={(e) => setNewTermEnd(e.target.value)}
                                                required
                                                className="w-full cursor-pointer rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-text)] transition-colors focus:border-[var(--accent-color)] focus:outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {newTermEnd && newTermStart && newTermEnd < newTermStart && (
                                        <p className="text-xs text-red-500 font-semibold">End date must be on or after start date.</p>
                                    )}

                                    <div className="flex items-center justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 shadow-sm">
                                        <div className="pr-4">
                                            <p className="text-sm font-semibold text-[var(--app-text)]">Set as Current Term</p>
                                            <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                                                Enabling this will automatically unset any other active term as current.
                                            </p>
                                        </div>
                                        <Toggle checked={newTermIsCurrent} onChange={setNewTermIsCurrent} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex shrink-0 justify-end gap-3 border-t border-[var(--app-border)] px-6 py-4 bg-[var(--app-card-bg)]">
                                <button
                                    type="button"
                                    onClick={() => { setView('new-subject'); setError(null); }}
                                    className="cursor-pointer rounded-full border border-[var(--app-border)] px-5 py-2.5 text-sm font-semibold text-[var(--app-text-muted)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--app-text)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={busy || !newTermName.trim() || (!!newTermEnd && !!newTermStart && newTermEnd < newTermStart)}
                                    className="flex cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-color)] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {busy && <Spinner size={16} />}
                                    Create Academic Term
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {view === 'main' && (
                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-[var(--app-border)] bg-[var(--app-card-bg)] px-6 py-4">
                        <div className="flex min-w-0 items-center gap-2 text-sm">
                            {selectedSubject && selectedTopic ? (
                                <>
                                    <span className="shrink-0 text-[var(--app-text-muted)]">Selected:</span>
                                    <span className="flex min-w-0 items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-3.5 py-1.5 font-semibold text-[var(--app-text)] shadow-sm">
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: selectedSubject.color || '#3b82f6' }} />
                                        <span className="truncate max-w-[280px]">{selectedSubject.name} › {selectedTopic.name}</span>
                                    </span>
                                </>
                            ) : selectedSubject ? (
                                <span className="flex items-center gap-1.5 text-[var(--app-text-muted)]">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedSubject.color || '#3b82f6' }} />
                                    <strong className="text-[var(--app-text)]">{selectedSubject.name}</strong>
                                    <span>— now select or create a topic</span>
                                </span>
                            ) : (
                                <span className="text-[var(--app-text-muted)]">Select a subject and topic to proceed.</span>
                            )}
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            {onClear && initialTopicId !== null && (
                                <button
                                    type="button"
                                    onClick={onClear}
                                    className="cursor-pointer text-xs font-semibold text-[var(--app-text-muted)] transition-colors hover:text-red-500"
                                >
                                    Clear selection
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-full border border-[var(--app-border)] px-5 py-2 text-sm text-[var(--app-text-muted)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--app-text)]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={!selectedSubject || !selectedTopic || busy}
                                className="cursor-pointer rounded-full bg-[var(--accent-color)] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--accent-color)]/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Confirm Topic
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </dialog>
    );
}