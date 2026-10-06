import { useEffect, useRef, useState } from 'react';
import { SaveSessionDialog, type SaveValues } from '../components/timer/SaveSessionDialog';
import { TaskTagDialog } from '../components/timer/TaskTagDialog';
import { TodayPanels } from '../components/timer/TodayPanels';
import { useTimerContext } from '../context/TimerContext';
import { useShortcuts } from '../hooks/useShortcuts';
import type { TimerMode, TimerPhase } from '../hooks/useTimer';
import { formatRequiredApiTimestamp } from '../lib/api-datetime';
import { getApiErrorMessage } from '../services/api';
import { sessionService } from '../services/session-service';
import { subjectService } from '../services/subject-service';
import { topicService } from '../services/topic-service';
import type { Subject } from '../types/subject';
import type { Topic } from '../types/topic';
import { SegmentedControl } from '../components/ui/SegmentedControl';

const MODES: { value: TimerMode; label: string }[] = [
    { value: 'pomodoro', label: 'Pomodoro' },
    { value: 'stopwatch', label: 'Stopwatch' },
    { value: 'countdown', label: 'Countdown' },
];

const PHASE_LABEL: Record<TimerPhase, string> = {
    work: 'Work',
    'short-break': 'Short break',
    'long-break': 'Long break',
};

type Tone = 'idle' | 'work' | 'break' | 'paused' | 'done';

const TONE_STYLES: Record<Tone, { bg: string; fg: string; dot: string }> = {
    idle: { bg: 'rgba(163, 163, 163, 0.15)', fg: 'var(--app-text-muted)', dot: '#a3a3a3' },
    work: { bg: 'var(--accent-ring)', fg: 'var(--accent-color)', dot: 'var(--accent-color)' },
    break: { bg: 'rgba(16, 185, 129, 0.15)', fg: '#10b981', dot: '#10b981' },
    paused: { bg: 'rgba(245, 158, 11, 0.15)', fg: '#f59e0b', dot: '#f59e0b' },
    done: { bg: 'rgba(168, 85, 247, 0.15)', fg: '#a855f7', dot: '#a855f7' },
};

const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]';

const secondaryButton =
    'rounded-full cursor-pointer border border-[var(--app-border)] bg-[var(--app-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--app-text)] transition-colors ' +
    'hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] disabled:cursor-not-allowed disabled:opacity-40 ' +
    focusRing;

function TagIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
            <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
        </svg>
    );
}

function ChevronIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
            <path d="m9 6 6 6-6 6" />
        </svg>
    );
}

export function TimerPage() {
    const timer = useTimerContext();
    const { selectedTagId, setSelectedTagId, selectedTaskId, setSelectedTaskId } = timer;

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [saveOpen, setSaveOpen] = useState(false);
    const [endedAt, setEndedAt] = useState<Date | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

    useEffect(() => {
        let active = true;
        Promise.all([subjectService.getActive(), topicService.getAll()])
            .then(([loadedSubjects, loadedTopics]) => {
                if (!active) return;
                setSubjects(loadedSubjects);
                setTopics(loadedTopics);
            })
            .catch((error) => {
                if (active) setMessage({ type: 'error', text: getApiErrorMessage(error) });
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        document.title = timer.isRunning ? `${timer.formattedTime} · StudyZen` : 'StudyZen';
        return () => {
            document.title = 'StudyZen';
        };
    }, [timer.isRunning, timer.formattedTime]);

    useEffect(() => {
        if (timer.isRunning) setMessage(null);
    }, [timer.isRunning]);

    const countdownDone =
        timer.mode === 'countdown' &&
        timer.status === 'paused' &&
        timer.secondsRemaining === 0 &&
        timer.secondsElapsed > 0;
    const promptedRef = useRef(false);
    useEffect(() => {
        if (countdownDone && !promptedRef.current) {
            promptedRef.current = true;
            setEndedAt(new Date());
            setSaveError(null);
            setSaveOpen(true);
        }
        if (!countdownDone) promptedRef.current = false;
    }, [countdownDone]);

    const selectedTopic = topics.find((topic) => topic.id === selectedTaskId) ?? null;
    const selectedSubject = selectedTopic ? subjects.find((subject) => subject.id === selectedTopic.subjectId) : (selectedTagId ? subjects.find((subject) => subject.id === selectedTagId) : null) ?? null;

    const canSave = timer.secondsElapsed >= 60;
    const minutes = Math.max(1, Math.round(timer.secondsElapsed / 60));

    const openSave = () => {
        if (timer.secondsElapsed < 60) return;
        if (timer.isRunning) timer.pause();
        setEndedAt(new Date());
        setSaveError(null);
        setSaveOpen(true);
    };

    const handlePicked = (subject: Subject, topic: Topic) => {
        setSubjects((current) => (current.some((item) => item.id === subject.id) ? current : [...current, subject]));
        setTopics((current) => (current.some((item) => item.id === topic.id) ? current : [...current, topic]));
        setSelectedTagId(subject.id);
        setSelectedTaskId(topic.id);
        setPickerOpen(false);
    };

    const handleSave = async ({ title, description, rating }: SaveValues) => {
        if (!selectedTopic) return;
        setSaving(true);
        setSaveError(null);

        const end = endedAt ?? new Date();
        const start = new Date(end.getTime() - timer.secondsElapsed * 1000);

        try {
            await sessionService.create({
                title: title.trim(),
                description: description.trim() || undefined,
                totalMinutes: minutes,
                startedAt: formatRequiredApiTimestamp(start),
                endedAt: formatRequiredApiTimestamp(end),
                focusRating: rating || undefined,
                topicId: selectedTopic.id,
            });
            setSaveOpen(false);
            timer.reset();
            setMessage({ type: 'ok', text: 'Session saved.' });
        } catch (error) {
            setSaveError(getApiErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen().catch(() => {});
    };

    useShortcuts(
        {
            toggleStartPause: timer.toggle,
            skipSession: timer.mode === 'pomodoro' && timer.status !== 'idle' ? timer.skip : undefined,
            finishSession: openSave,
            toggleFullscreen,
        },
        !pickerOpen && !saveOpen,
    );

    const isBreak = timer.mode === 'pomodoro' && timer.phase !== 'work';
    const tone: Tone = countdownDone
        ? 'done'
        : timer.status === 'idle'
            ? 'idle'
            : timer.status === 'paused'
                ? 'paused'
                : isBreak
                    ? 'break'
                    : 'work';
    const statusText = countdownDone
        ? 'Finished'
        : timer.status === 'idle'
            ? 'Ready to start'
            : timer.status === 'paused'
                ? 'Paused'
                : timer.mode === 'pomodoro'
                    ? PHASE_LABEL[timer.phase]
                    : 'Running';
    const startLabel = timer.status === 'running' ? 'Pause' : timer.status === 'paused' ? 'Continue' : 'Start';
    const pulsing = timer.status === 'running';

    const saveIsPrimary = canSave && timer.status === 'paused';

    return (
        <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center gap-8 px-4 py-10 bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-200">
            <div className="flex w-full max-w-2xl flex-col items-center gap-4">
                <section
                    aria-label="Study timer"
                    className="w-full rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 shadow-2xl sm:p-10 transition-colors"
                >
                    <div
                        role="radiogroup"
                        aria-label="Timer mode"
                        className="mx-auto w-full flex max-w-sm"
                    >
                        <SegmentedControl
                            options={MODES}
                            value={timer.mode}
                            onChange={timer.setMode}
                            disabled={timer.status !== "idle"}
                            ariaLabel="Timer mode"
                            focusRing={focusRing}
                            className="mx-auto max-w-sm"
                        />
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                        <span
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                            style={{ backgroundColor: TONE_STYLES[tone].bg, color: TONE_STYLES[tone].fg }}
                        >
                            <span className="relative flex h-2 w-2">
                                {pulsing && (
                                    <span
                                        className="absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping"
                                        style={{ backgroundColor: TONE_STYLES[tone].dot }}
                                    />
                                )}
                                <span
                                    className="relative inline-flex h-2 w-2 rounded-full"
                                    style={{ backgroundColor: TONE_STYLES[tone].dot }}
                                />
                            </span>
                            {statusText}
                        </span>

                        <div
                            role="timer"
                            aria-label={`Time: ${timer.formattedTime}`}
                            className="mt-4 font-pt text-8xl font-bold tabular-nums leading-none tracking-tight sm:text-9xl text-[var(--app-text)]"
                        >
                            {timer.formattedTime}
                        </div>

                        <p className="mt-3 h-5 text-xs font-semibold text-[var(--app-text-muted)]">
                            {timer.mode === 'pomodoro'
                                ? timer.completedSessions === 1
                                    ? '1 session completed'
                                    : `${timer.completedSessions} sessions completed`
                                : ''}
                        </p>
                    </div>

                    <button
                        onClick={() => setPickerOpen(true)}
                        className={`group cursor-pointer mx-auto mt-6 flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${focusRing} ${
                            selectedTopic
                                ? 'border-[var(--app-border)] bg-[var(--app-bg)] hover:border-[var(--accent-color)]/70'
                                : 'border-dashed border-2 border-[var(--app-border)] hover:border-[var(--accent-color)]/70 bg-[var(--app-bg)]'
                        }`}
                    >
                        {selectedTopic && selectedSubject ? (
                            <span
                                className="h-3.5 w-3.5 shrink-0 rounded-full"
                                style={{ backgroundColor: selectedSubject.color }}
                                aria-hidden
                            />
                        ) : (
                            <TagIcon className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />
                        )}
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-[var(--app-text)]">
                                {selectedTopic ? selectedTopic.name : 'What are you studying?'}
                            </span>
                            <span className="block truncate text-xs text-[var(--app-text-muted)] mt-0.5">
                                {selectedTopic && selectedSubject
                                    ? selectedSubject.name
                                    : 'Pick a subject and topic to save this session'}
                            </span>
                        </span>
                        <ChevronIcon className="h-4 w-4 shrink-0 text-[var(--app-text-muted)] transition-transform group-hover:translate-x-0.5" />
                    </button>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <button
                            onClick={timer.toggle}
                            onMouseUp={(e) => e.currentTarget.blur()}
                            className={`min-w-36 cursor-pointer rounded-full bg-[var(--accent-color)] px-10 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-lg ${focusRing}`}
                        >
                            {startLabel}
                        </button>
                        <button onClick={timer.reset} disabled={timer.status === 'idle'} className={secondaryButton}>
                            Restart
                        </button>
                        {timer.mode === 'pomodoro' && (
                            <button onClick={timer.skip} disabled={timer.status === 'idle'} className={secondaryButton}>
                                Skip phase
                            </button>
                        )}
                        <button
                            onClick={openSave}
                            disabled={!canSave}
                            title={canSave ? undefined : 'Study at least 1 minute to save'}
                            className={
                                saveIsPrimary
                                    ? `rounded-full cursor-pointer border border-[var(--accent-color)] bg-[var(--accent-color)]/15 px-5 py-2.5 text-sm font-bold text-[var(--accent-color)] transition-colors hover:bg-[var(--accent-color)]/25 ${focusRing}`
                                    : secondaryButton
                            }
                        >
                            Save session
                        </button>
                    </div>
                </section>

                <div aria-live="polite" className="min-h-5">
                    {message && (
                        <p
                            role="status"
                            className={`text-sm font-semibold ${message.type === 'ok' ? 'text-emerald-500' : 'text-red-500'}`}
                        >
                            {message.text}
                        </p>
                    )}
                </div>
            </div>

            <aside className="w-full max-w-2xl xl:absolute xl:right-6 xl:top-6 xl:w-72">
                <TodayPanels />
            </aside>

            {pickerOpen && (
                <TaskTagDialog
                    subjects={subjects}
                    topics={topics}
                    initialSubjectId={selectedTagId}
                    initialTopicId={selectedTaskId}
                    onClose={() => setPickerOpen(false)}
                    onConfirm={handlePicked}
                    onClear={() => {
                        setSelectedTaskId(null);
                        setSelectedTagId(null);
                        setPickerOpen(false);
                    }}
                    onSubjectCreated={(subject) => setSubjects((current) => (current.some((t) => t.id === subject.id) ? current : [...current, subject]))}
                    onTopicCreated={(topic) => setTopics((current) => (current.some((t) => t.id === topic.id) ? current : [...current, topic]))}
                />
            )}

            {saveOpen && (
                <SaveSessionDialog
                    topic={selectedTopic}
                    minutes={minutes}
                    saving={saving}
                    error={saveError}
                    onPickTopic={() => setPickerOpen(true)}
                    onCancel={() => setSaveOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default TimerPage;