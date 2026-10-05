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
import {SegmentedControl} from "../components/ui/SegmentedControl.tsx";

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
    idle: { bg: '#f5f5f5', fg: '#525252', dot: '#a3a3a3' },
    work: { bg: '#e8f0fe', fg: '#1d4ed8', dot: '#4287f5' },
    break: { bg: '#ecfdf5', fg: '#065f46', dot: '#10b981' },
    paused: { bg: '#fffbeb', fg: '#92400e', dot: '#f59e0b' },
    done: { bg: '#f5f3ff', fg: '#5b21b6', dot: '#8b5cf6' },
};

const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4287f5]';

const secondaryButton =
    'rounded-full cursor-pointer border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors ' +
    'hover:border-[#151414] hover:text-[#151414] disabled:cursor-not-allowed disabled:opacity-40 ' +
    'disabled:hover:border-neutral-300 disabled:hover:text-neutral-700 ' +
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

    const { shortcuts } = useShortcuts(
        {
            toggleStartPause: timer.toggle,
            skipSession: timer.mode === 'pomodoro' && timer.status !== 'idle' ? timer.skip : undefined,
            finishSession: openSave,
            toggleFullscreen,
        },
        !pickerOpen && !saveOpen,
    );
    shortcuts.find((item) => item.action === 'toggleStartPause')?.key;
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
        <div className="relative flex min-h-full flex-col items-center justify-center gap-8 px-4 py-10 text-[#151414]">
            <div className="flex w-full max-w-2xl flex-col items-center gap-4">
                <section
                    aria-label="Study timer"
                    className="w-full rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8"
                >
                    <div
                        role="radiogroup"
                        aria-label="Timer mode"
                        className="mx-auto  w-full flex max-w-sm rounded-full bg-neutral-100 py-1 h-10"
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
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors"
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
                            className="mt-4 font-pt text-8xl font-bold tabular-nums leading-none tracking-tight sm:text-9xl"
                        >
                            {timer.formattedTime}
                        </div>

                        <p className="mt-3 h-5 text-sm text-neutral-500">
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
                                ? 'border-neutral-200 bg-neutral-50 hover:border-[#151414]'
                                : 'border-dashed border-2 border-neutral-300 hover:border-[#151414]'
                        }`}
                    >
                        {selectedTopic && selectedSubject ? (
                            <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: selectedSubject.color }}
                                aria-hidden
                            />
                        ) : (
                            <TagIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                        )}
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                                {selectedTopic ? selectedTopic.name : 'What are you studying?'}
                            </span>
                            <span className="block truncate text-xs text-neutral-500">
                                {selectedTopic && selectedSubject
                                    ? selectedSubject.name
                                    : 'Pick a subject and topic to save this session'}
                            </span>
                        </span>
                        <ChevronIcon className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <button
                            onClick={timer.toggle}
                            onMouseUp={(e) => e.currentTarget.blur()}
                            className={`min-w-36 cursor-pointer rounded-full bg-[#151414] px-10 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-85 ${focusRing}`}
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
                                    ? `rounded-full border border-[#4287f5] bg-[#4287f5]/10 px-5 py-2.5 text-sm font-medium text-[#1d5fd1] transition-colors hover:bg-[#4287f5]/20 ${focusRing}`
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
                            className={`text-sm ${message.type === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}
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