import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, StickyNote } from 'lucide-react';
import { dayNoteService } from '../../../services/day-note-service';
import { dateKey } from '../../../lib/planner-dates';
import { useToast } from '../../../context/ToastContext';
import { getApiErrorMessage } from '../../../services/api';
import type { DayNote } from '../../../types/day-note';

interface DayNotesSectionProps {
    selectedDate: Date;
}

export function DayNotesSection({ selectedDate }: DayNotesSectionProps) {
    const notify = useToast();
    const dayKey = dateKey(selectedDate);
    const [note, setNote] = useState<DayNote | null>(null);
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestContent = useRef(content);
    latestContent.current = content;

    useEffect(() => {
        let active = true;
        setLoading(true);
        setStatus('idle');

        dayNoteService.getAll()
            .then((notes) => {
                if (!active) return;
                const found = notes.find((n) => n.date?.slice(0, 10) === dayKey) || null;
                setNote(found);
                setContent(found ? found.content : '');
            })
            .catch((err) => {
                if (!active) return;
                notify({
                    title: 'Could not load day notes',
                    description: getApiErrorMessage(err),
                    tone: 'error',
                });
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [dayKey, notify]);

    const saveContent = async (text: string) => {
        setStatus('saving');
        try {
            if (note) {
                if (!text.trim()) {
                    await dayNoteService.delete(note.id);
                    setNote(null);
                } else {
                    const updated = await dayNoteService.patch(note.id, { content: text });
                    setNote(updated);
                }
            } else if (text.trim()) {
                const created = await dayNoteService.create({ date: dayKey, content: text });
                setNote(created);
            }
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2500);
        } catch (err) {
            setStatus('idle');
            notify({
                title: 'Could not save note',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        }
    };

    const handleChange = (newText: string) => {
        setContent(newText);
        setStatus('saving');
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            void saveContent(newText);
        }, 800);
    };

    const handleBlur = () => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
            void saveContent(latestContent.current);
        }
    };

    return (
        <div className="flex flex-col gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--accent-color)]">
                    <StickyNote size={14} />
                    <span>Day Notes</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[var(--app-text-muted)]">
                    {status === 'saving' && (
                        <>
                            <Loader2 size={12} className="animate-spin text-[var(--accent-color)]" />
                            <span>Saving…</span>
                        </>
                    )}
                    {status === 'saved' && (
                        <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-500">Saved</span>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="h-28 animate-pulse rounded-xl bg-[var(--app-bg)]/60" />
            ) : (
                <textarea
                    value={content}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="Capture thoughts, daily focus, or agenda for this date..."
                    className="min-h-[110px] w-full resize-y rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3 text-xs leading-relaxed text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:border-[var(--accent-color)] focus:outline-none transition-colors"
                />
            )}
        </div>
    );
}
