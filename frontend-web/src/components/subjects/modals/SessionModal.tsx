import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getApiErrorMessage } from '../../../services/api';
import { TaskTagDialog } from '../../timer/TaskTagDialog';
import type { Session, UpdateSessionDTO } from '../../../types/session';
import type { Subject } from '../../../types/subject';
import type { Topic } from '../../../types/topic';

interface SessionModalProps {
    session: Session;
    subjects: Subject[];
    topics: Topic[];
    onClose: () => void;
    onSave: (data: UpdateSessionDTO) => Promise<void>;
}

const TEETH_COUNT = 17;
const TOOTH_WIDTH = 19;
const TOTAL_WIDTH = TEETH_COUNT * TOOTH_WIDTH;

const BARCODE_WIDTHS = [2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4, 2, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 3, 2, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2];
const BARCODE_GAPS = [2, 3, 1, 2, 1, 3, 2, 1, 2, 3, 1, 2, 3, 1, 2, 1, 3, 2, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 2, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2];

export function SessionModal({ session, subjects, topics, onClose, onSave }: SessionModalProps) {
    const notify = useToast();
    const { user } = useAuth();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const initialTopic = topics.find((t) => t.id === session.topicId) ?? null;
    const initialSubject = initialTopic
        ? (subjects.find((s) => s.id === initialTopic.subjectId) ?? null)
        : null;

    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(initialSubject);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(initialTopic);
    const [pickerOpen, setPickerOpen] = useState(false);

    const [title, setTitle] = useState(session.title ?? '');
    const [description, setDescription] = useState(session.description ?? '');
    const [rating, setRating] = useState(session.focusRating ?? 0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) {
            dialog.showModal();
        }
    }, []);

    const effectiveTitle = title.trim() !== '' ? title.trim() : (selectedTopic?.name ?? '');
    const canSave = !submitting && selectedTopic !== null && effectiveTitle.trim() !== '';

    const formattedDate = useMemo(() => {
        try {
            const d = session.startedAt ? new Date(session.startedAt) : new Date();
            if (isNaN(d.getTime())) {
                return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
            }
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }).format(d);
        } catch {
            return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
        }
    }, [session.startedAt]);

    const minutes = session.totalMinutes || 0;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const formattedTime = `${hours}h ${String(mins).padStart(2, '0')}m`;

    const userHandle = user?.username
        ? `@${user.username}`
        : user?.displayName
          ? `@${user.displayName.toLowerCase().replace(/\s+/g, '')}`
          : '@user';

    const topPoints = useMemo(() => {
        return [
            `0,10`,
            ...Array.from({ length: TEETH_COUNT }, (_, i) => `${i * TOOTH_WIDTH + TOOTH_WIDTH / 2},0 ${(i + 1) * TOOTH_WIDTH},10`),
            `0,10`,
        ].join(' ');
    }, []);

    const bottomPoints = useMemo(() => {
        return [
            `0,0`,
            ...Array.from({ length: TEETH_COUNT }, (_, i) => `${i * TOOTH_WIDTH + TOOTH_WIDTH / 2},10 ${(i + 1) * TOOTH_WIDTH},0`),
            `0,0`,
        ].join(' ');
    }, []);

    const { barcodeRects, barcodeTotalWidth } = useMemo(() => {
        let curX = 6;
        const rects: { x: number; width: number }[] = [];
        for (let i = 0; i < BARCODE_WIDTHS.length; i++) {
            rects.push({ x: curX, width: BARCODE_WIDTHS[i] });
            curX += BARCODE_WIDTHS[i] + (BARCODE_GAPS[i] ?? 2);
        }
        return { barcodeRects: rects, barcodeTotalWidth: curX + 6 };
    }, []);

    const handlePicked = (subject: Subject, topic: Topic) => {
        setSelectedSubject(subject);
        setSelectedTopic(topic);
        setPickerOpen(false);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedTopic) {
            notify({ title: 'Choose a topic for this session', tone: 'warning', persist: false });
            return;
        }
        if (!effectiveTitle.trim()) {
            notify({ title: 'Session title is required', tone: 'warning', persist: false });
            return;
        }
        setSubmitting(true);
        try {
            await onSave({
                title: effectiveTitle.trim(),
                description: description.trim() || undefined,
                topicId: selectedTopic.id,
                focusRating: rating,
            });
            onClose();
        } catch (error) {
            notify({ title: 'Could not update session', description: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <dialog
                ref={dialogRef}
                onClose={onClose}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
                className="m-auto overflow-visible bg-transparent p-0 border-0 outline-none backdrop:bg-black/80 backdrop:backdrop-blur-sm"
            >
                <div className="relative mx-auto flex flex-col w-[min(94vw,25rem)] text-neutral-900 drop-shadow-2xl">
                    <div className="w-full overflow-hidden leading-none -mb-[1px]">
                        <svg viewBox={`0 0 ${TOTAL_WIDTH} 10`} preserveAspectRatio="none" className="w-full h-3 block fill-[#F4EFEA]">
                            <polygon points={topPoints} />
                        </svg>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-[#F4EFEA] px-6 py-5 sm:px-8 sm:py-6">
                        <div className="text-center">
                            <h2 className="font-mono text-xl sm:text-2xl font-black tracking-[0.25em] text-neutral-900 uppercase">
                                Edit Session
                            </h2>
                            <p className="mt-1 font-mono text-xs text-neutral-600">
                                {formattedDate}
                            </p>
                        </div>

                        <div className="my-3.5 border-b border-dashed border-neutral-400/70" />

                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="font-mono text-[11px] font-bold tracking-widest text-neutral-800 uppercase">
                                    Time Studied
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(true)}
                                    className="mt-1.5 inline-flex cursor-pointer items-center rounded-full border border-neutral-400/90 px-3 py-1 font-mono text-[11px] font-semibold text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-200/60"
                                >
                                    Change
                                </button>
                            </div>
                            <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--accent-color,#3843D0)]">
                                {formattedTime}
                            </div>
                        </div>

                        <div className="my-3.5 border-b border-dashed border-neutral-400/70" />

                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-baseline justify-between gap-1 font-mono text-xs">
                                <span className="shrink-0 font-mono text-[11px] font-bold tracking-widest text-neutral-800 uppercase">
                                    Subject
                                </span>
                                <span className="mx-1 mb-1 flex-1 border-b border-dotted border-neutral-400/80" />
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(true)}
                                    className="flex max-w-[55%] cursor-pointer items-center gap-1.5 truncate text-right font-mono text-xs font-bold text-neutral-900 transition-colors hover:text-[var(--accent-color,#3843D0)]"
                                    title={selectedSubject?.name ?? 'Pick one'}
                                >
                                    {selectedSubject?.color && (
                                        <span
                                            className="h-2 w-2 shrink-0 rounded-full"
                                            style={{ backgroundColor: selectedSubject.color }}
                                            aria-hidden
                                        />
                                    )}
                                    <span className="truncate">{selectedSubject ? selectedSubject.name : 'Pick one +'}</span>
                                </button>
                            </div>

                            <div className="flex items-baseline justify-between gap-1 font-mono text-xs">
                                <span className="shrink-0 font-mono text-[11px] font-bold tracking-widest text-neutral-800 uppercase">
                                    Topic
                                </span>
                                <span className="mx-1 mb-1 flex-1 border-b border-dotted border-neutral-400/80" />
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(true)}
                                    className="max-w-[55%] cursor-pointer truncate text-right font-mono text-xs font-bold text-neutral-900 transition-colors hover:text-[var(--accent-color,#3843D0)]"
                                    title={selectedTopic?.name ?? 'Pick one'}
                                >
                                    <span className="truncate">{selectedTopic ? selectedTopic.name : 'Pick one +'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="my-3.5 border-b border-dashed border-neutral-400/70" />

                        <div className="flex flex-col gap-3">
                            <label className="flex flex-col">
                                <span className="font-mono text-[11px] font-bold tracking-widest text-neutral-800 uppercase">
                                    Title
                                </span>
                                <input
                                    autoFocus
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={selectedTopic?.name || 'Name this session'}
                                    className="w-full border-b border-neutral-900 bg-transparent pt-1 pb-1.5 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--accent-color,#3843D0)] focus:outline-none"
                                />
                            </label>

                            <label className="flex flex-col">
                                <span className="font-mono text-[11px] font-bold tracking-widest text-neutral-800 uppercase">
                                    Description (Optional)
                                </span>
                                <input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="How did it go?"
                                    className="w-full border-b border-neutral-900 bg-transparent pt-1 pb-1.5 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--accent-color,#3843D0)] focus:outline-none"
                                />
                            </label>

                            <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="font-mono text-[11px] font-bold tracking-widest text-neutral-800 uppercase">
                                    Focus (0-5)
                                </span>
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                    {[0, 1, 2, 3, 4, 5].map((val) => {
                                        const isSelected = rating === val;
                                        return (
                                            <button
                                                key={val}
                                                type="button"
                                                aria-pressed={isSelected}
                                                onClick={() => setRating(val)}
                                                className={`flex h-6 w-6 sm:h-7 sm:w-7 cursor-pointer items-center justify-center rounded-full border border-neutral-900 font-mono text-xs font-bold transition-colors ${
                                                    isSelected
                                                        ? 'bg-neutral-900 text-[#F4EFEA]'
                                                        : 'bg-transparent text-neutral-900 hover:bg-neutral-300/60'
                                                }`}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="my-3.5 border-b border-dashed border-neutral-400/70" />

                        <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-black tracking-widest text-neutral-900 uppercase">
                                Total
                            </span>
                            <span className="font-mono text-xl sm:text-2xl font-black text-[var(--accent-color,#3843D0)]">
                                {formattedTime}
                            </span>
                        </div>

                        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-lg border border-neutral-900 bg-transparent py-2.5 text-center font-mono text-xs font-bold tracking-wider text-neutral-900 uppercase transition-colors hover:bg-neutral-200/60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!canSave}
                                className="cursor-pointer rounded-lg bg-[var(--accent-color,#3843D0)] py-2.5 text-center font-mono text-xs font-bold tracking-wider text-white uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {submitting ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="my-3.5 border-b border-dashed border-neutral-400/70" />

                        <div className="flex flex-col items-center">
                            <div className="w-full flex justify-center py-0.5">
                                <svg
                                    viewBox={`0 0 ${barcodeTotalWidth} 32`}
                                    className="h-8 w-full max-w-[280px] text-neutral-900"
                                    fill="currentColor"
                                    aria-hidden
                                >
                                    {barcodeRects.map(({ x, width }, index) => (
                                        <rect key={index} x={x} y={0} width={width} height={32} />
                                    ))}
                                </svg>
                            </div>
                            <div className="mt-2 flex w-full items-center justify-between font-mono text-[11px] text-neutral-700">
                                <span>{userHandle}</span>
                                <span>studyzen.frandm.dev</span>
                            </div>
                        </div>
                    </form>

                    <div className="w-full overflow-hidden leading-none -mt-[1px]">
                        <svg viewBox={`0 0 ${TOTAL_WIDTH} 10`} preserveAspectRatio="none" className="w-full h-3 block fill-[#F4EFEA]">
                            <polygon points={bottomPoints} />
                        </svg>
                    </div>
                </div>
            </dialog>

            {pickerOpen && (
                <TaskTagDialog
                    subjects={subjects}
                    topics={topics}
                    initialSubjectId={selectedSubject?.id ?? null}
                    initialTopicId={selectedTopic?.id ?? null}
                    onClose={() => setPickerOpen(false)}
                    onConfirm={handlePicked}
                />
            )}
        </>
    );
}
