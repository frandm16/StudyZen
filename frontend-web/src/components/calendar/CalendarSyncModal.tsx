import { useState, useEffect } from 'react';
import {
    Copy,
    Check,
    Download,
    RefreshCw,
    X,
    Radio,
} from 'lucide-react';
import { calendarService } from '../../services/calendar-service';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../services/api';
import type { Subject } from '../../types/subject';
import type { CalendarFeedInfo } from '../../types/calendar';

interface CalendarSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjects: Subject[];
    initialSubjectId?: number;
}

export function CalendarSyncModal({
    isOpen,
    onClose,
    subjects,
    initialSubjectId,
}: CalendarSyncModalProps) {
    const notify = useToast();
    const [feedInfo, setFeedInfo] = useState<CalendarFeedInfo | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | 'all'>(
        initialSubjectId ?? 'all'
    );
    const [loading, setLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [confirmRegenerate, setConfirmRegenerate] = useState(false);
    const [copiedWebcal, setCopiedWebcal] = useState(false);
    const [copiedHttps, setCopiedHttps] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setConfirmRegenerate(false);
            return;
        }
        if (initialSubjectId !== undefined) {
            setSelectedSubjectId(initialSubjectId);
        }
        const loadInfo = async () => {
            setLoading(true);
            try {
                const info = await calendarService.getFeedInfo();
                setFeedInfo(info);
            } catch (err) {
                notify({
                    title: 'Could not load calendar feed',
                    description: getApiErrorMessage(err),
                    tone: 'error',
                });
            } finally {
                setLoading(false);
            }
        };
        void loadInfo();
    }, [isOpen, initialSubjectId]);

    if (!isOpen) return null;

    const baseWebcal = feedInfo?.webcalUrl || '';
    const baseHttps = feedInfo?.httpsUrl || '';
    const queryParam = selectedSubjectId !== 'all' ? `?subjectId=${selectedSubjectId}` : '';
    const activeWebcalUrl = baseWebcal ? `${baseWebcal}${queryParam}` : '';
    const activeHttpsUrl = baseHttps ? `${baseHttps}${queryParam}` : '';

    const handleCopy = async (text: string, type: 'webcal' | 'https') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'webcal') {
                setCopiedWebcal(true);
                setTimeout(() => setCopiedWebcal(false), 2000);
            } else {
                setCopiedHttps(true);
                setTimeout(() => setCopiedHttps(false), 2000);
            }
            notify({
                title: 'Link copied',
                description: 'Subscription URL copied to clipboard',
                tone: 'info',
            });
        } catch {
            notify({
                title: 'Copy failed',
                description: 'Please copy the URL manually',
                tone: 'error',
            });
        }
    };

    const handleDownloadIcs = async () => {
        if (!feedInfo) return;
        try {
            const subjectId = selectedSubjectId !== 'all' ? selectedSubjectId : undefined;
            const subjectName = subjects.find((s) => s.id === subjectId)?.name;
            const filename = subjectName
                ? `studyzen-${subjectName.toLowerCase().replace(/\s+/g, '-')}.ics`
                : 'studyzen-calendar.ics';

            await calendarService.downloadIcs(feedInfo.token, subjectId, filename);
            notify({
                title: 'Calendar downloaded',
                description: `${filename} saved successfully`,
                tone: 'info',
            });
        } catch (err) {
            notify({
                title: 'Download failed',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const updated = await calendarService.regenerateFeedToken();
            setFeedInfo(updated);
            setConfirmRegenerate(false);
            notify({
                title: 'Secret link regenerated',
                description: 'Old subscription links will no longer synchronize',
                tone: 'info',
            });
        } catch (err) {
            notify({
                title: 'Could not regenerate token',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Radio size={18} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[var(--app-text)]">
                                Live Calendar Subscription
                            </h2>
                            <p className="text-xs text-[var(--app-text-muted)]">
                                Real-time synchronization via RFC 5545 iCalendar feed
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-[var(--app-text-muted)] hover:bg-[var(--app-card-hover)] hover:text-[var(--app-text)]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-4 space-y-4">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                            Select Calendar to Subscribe
                        </label>
                        <select
                            value={selectedSubjectId}
                            onChange={(e) =>
                                setSelectedSubjectId(
                                    e.target.value === 'all' ? 'all' : Number(e.target.value)
                                )
                            }
                            className="mt-1.5 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] focus:border-[var(--accent-color)] focus:outline-none"
                        >
                            <option value="all">All Calendars &amp; Subjects (Full Schedule)</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name} only
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-[var(--app-text)]">
                            Subscribe in Calendar Apps (Recommended)
                        </label>
                        <p className="text-xs text-[var(--app-text-muted)]">
                            Use this URL in Apple Calendar or Outlook to keep events automatically in sync.
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={activeWebcalUrl || 'Loading URL...'}
                                className="w-full truncate rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs font-mono text-[var(--app-text-muted)] focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => handleCopy(activeWebcalUrl, 'webcal')}
                                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--accent-color)] px-3 py-2 text-xs font-bold text-[var(--app-bg)] transition-opacity hover:opacity-90"
                            >
                                {copiedWebcal ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedWebcal ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>

                        <div className="mt-2.5">
                            <span className="text-[11px] font-medium text-[var(--app-text-muted)]">
                                HTTPS format (Google Calendar "From URL"):
                            </span>
                            <div className="mt-1 flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={activeHttpsUrl || 'Loading URL...'}
                                    className="w-full truncate rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs font-mono text-[var(--app-text-muted)] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCopy(activeHttpsUrl, 'https')}
                                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                                >
                                    {copiedHttps ? <Check size={14} /> : <Copy size={14} />}
                                    <span>{copiedHttps ? 'Copied' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)]/60 p-3.5 space-y-2 text-xs text-[var(--app-text-muted)]">
                        <p className="font-semibold text-[var(--app-text)]">How to add to your calendar:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>
                                <strong>Google Calendar:</strong> Other calendars (+) → From URL → Paste link.
                            </li>
                            <li>
                                <strong>Apple Calendar:</strong> File → New Calendar Subscription → Paste link.
                            </li>
                            <li>
                                <strong>Outlook:</strong> Add calendar → Subscribe from web → Paste link.
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={handleDownloadIcs}
                            disabled={loading || !feedInfo}
                            className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                        >
                            <Download size={14} />
                            <span>Download .ics file</span>
                        </button>

                        {!confirmRegenerate ? (
                            <button
                                type="button"
                                onClick={() => setConfirmRegenerate(true)}
                                className="inline-flex items-center gap-1.5 text-xs text-[var(--app-text-muted)] hover:text-rose-400"
                            >
                                <RefreshCw size={12} />
                                <span>Reset secret link</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-rose-400 font-medium">Revoke old link?</span>
                                <button
                                    type="button"
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                    className="rounded-lg bg-rose-500/20 px-2 py-1 text-[11px] font-bold text-rose-400 hover:bg-rose-500/30"
                                >
                                    {regenerating ? 'Resetting...' : 'Yes, reset'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmRegenerate(false)}
                                    className="text-[11px] text-[var(--app-text-muted)] hover:underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
