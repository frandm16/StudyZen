import { useCallback, useEffect, useRef, useState } from 'react';

export type TimerMode = 'pomodoro' | 'stopwatch' | 'countdown';
export type TimerPhase = 'work' | 'short-break' | 'long-break';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerOptions {
    workMinutes?: number;
    shortBreakMinutes?: number;
    longBreakMinutes?: number;
    countdownMinutes?: number;
    sessionsUntilLongBreak?: number;
    autoStartBreaks?: boolean;
    autoStartWork?: boolean;
    countBreakTime?: boolean;
    onComplete?: (phase: TimerPhase) => void;
}

interface TimerConfig {
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    countdownMinutes: number;
    sessionsUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    countBreakTime: boolean;
}

const clampMinutes = (value: number) => Math.max(1, Math.floor(value));

const DEFAULT_CONFIG: TimerConfig = {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    countdownMinutes: 10,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    countBreakTime: false,
};

function resolveConfig(options: TimerOptions, internal: TimerConfig): TimerConfig {
    return {
        workMinutes: clampMinutes(options.workMinutes ?? internal.workMinutes),
        shortBreakMinutes: clampMinutes(options.shortBreakMinutes ?? internal.shortBreakMinutes),
        longBreakMinutes: clampMinutes(options.longBreakMinutes ?? internal.longBreakMinutes),
        countdownMinutes: clampMinutes(options.countdownMinutes ?? internal.countdownMinutes),
        sessionsUntilLongBreak: clampMinutes(options.sessionsUntilLongBreak ?? internal.sessionsUntilLongBreak),
        autoStartBreaks: options.autoStartBreaks ?? internal.autoStartBreaks,
        autoStartWork: options.autoStartWork ?? internal.autoStartWork,
        countBreakTime: options.countBreakTime ?? internal.countBreakTime,
    };
}

const TIMER_STORAGE_KEY = 'studyzen_timer_config';
const TIME_SPEED_MULTIPLIER = 1000;

function loadPersistedTimerConfig(): TimerConfig {
    try {
        const raw = localStorage.getItem(TIMER_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return resolveConfig(parsed, DEFAULT_CONFIG);
        }
    } catch {
    }
    return DEFAULT_CONFIG;
}

function persistTimerConfig(config: TimerConfig) {
    try {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(config));
    } catch {
    }
}

function phaseDuration(phase: TimerPhase, mode: TimerMode, config: TimerConfig) {
    if (mode === 'countdown') return config.countdownMinutes * 60;
    if (mode !== 'pomodoro') return 0;
    if (phase === 'short-break') return config.shortBreakMinutes * 60;
    if (phase === 'long-break') return config.longBreakMinutes * 60;
    return config.workMinutes * 60;
}

function nextPomodoro(phase: TimerPhase, completedSessions: number, interval: number) {
    if (phase === 'work') {
        const completed = completedSessions + 1;
        return {
            completedSessions: completed,
            phase: (completed % interval === 0 ? 'long-break' : 'short-break') as TimerPhase,
        };
    }
    return { completedSessions, phase: 'work' as TimerPhase };
}

function shouldAutoStart(nextPhase: TimerPhase, config: TimerConfig) {
    if (nextPhase === 'work') return config.autoStartWork;
    return config.autoStartBreaks;
}

export function useTimer(options: TimerOptions = {}) {
    const [internal, setInternal] = useState<TimerConfig>(() => resolveConfig(options, loadPersistedTimerConfig()));
    const previousOptionsRef = useRef(options);
    const config = internal;
    const onCompleteRef = useRef(options.onComplete);

    const [mode, setModeState] = useState<TimerMode>('pomodoro');
    const [phase, setPhase] = useState<TimerPhase>('work');
    const [status, setStatus] = useState<TimerStatus>('idle');
    const [secondsRemaining, setSecondsRemaining] = useState(() => config.workMinutes * 60);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [completedSessions, setCompletedSessions] = useState(0);

    const deadlineRef = useRef<number | null>(null);
    const elapsedStartedAtRef = useRef<number | null>(null);
    const elapsedBaseRef = useRef(0);
    const modeRef = useRef(mode);
    const phaseRef = useRef(phase);
    const statusRef = useRef(status);
    const configRef = useRef(config);
    const remainingRef = useRef(secondsRemaining);
    const elapsedRef = useRef(secondsElapsed);
    const completedRef = useRef(completedSessions);

    useEffect(() => {
        onCompleteRef.current = options.onComplete;
        modeRef.current = mode;
        phaseRef.current = phase;
        statusRef.current = status;
        configRef.current = config;
        remainingRef.current = secondsRemaining;
        elapsedRef.current = secondsElapsed;
        completedRef.current = completedSessions;
    });

    useEffect(() => {
        const previous = previousOptionsRef.current;
        const changed: Partial<TimerConfig> = {};
        const syncOption = <K extends keyof TimerConfig>(key: K, value: TimerOptions[K]) => {
            if (value !== undefined && value !== previous[key]) changed[key] = value as TimerConfig[K];
        };

        syncOption('workMinutes', options.workMinutes);
        syncOption('shortBreakMinutes', options.shortBreakMinutes);
        syncOption('longBreakMinutes', options.longBreakMinutes);
        syncOption('countdownMinutes', options.countdownMinutes);
        syncOption('sessionsUntilLongBreak', options.sessionsUntilLongBreak);
        syncOption('autoStartBreaks', options.autoStartBreaks);
        syncOption('autoStartWork', options.autoStartWork);
        syncOption('countBreakTime', options.countBreakTime);
        previousOptionsRef.current = options;

        if (Object.keys(changed).length > 0) {
            setInternal((current) => ({ ...current, ...resolveConfig(changed, current) }));
        }
    }, [options]);

    const snapshotElapsed = () => {
        if (elapsedStartedAtRef.current === null) return;
        const elapsed = elapsedBaseRef.current + Math.floor(((Date.now() - elapsedStartedAtRef.current) * TIME_SPEED_MULTIPLIER) / 1000);
        elapsedBaseRef.current = elapsed;
        elapsedRef.current = elapsed;
        setSecondsElapsed(elapsed);
        elapsedStartedAtRef.current = null;
    };

    const snapshotDeadline = () => {
        if (deadlineRef.current === null) return;
        const remaining = Math.max(0, Math.ceil(((deadlineRef.current - Date.now()) * TIME_SPEED_MULTIPLIER) / 1000));
        remainingRef.current = remaining;
        setSecondsRemaining(remaining);
        deadlineRef.current = null;
    };

    const pause = useCallback(() => {
        if (statusRef.current !== 'running') return;
        snapshotElapsed();
        if (modeRef.current !== 'stopwatch') snapshotDeadline();
        statusRef.current = 'paused';
        setStatus('paused');
    }, []);

    const start = useCallback(() => {
        if (statusRef.current === 'running') return;
        if (statusRef.current === 'idle') {
            elapsedBaseRef.current = 0;
            elapsedRef.current = 0;
            setSecondsElapsed(0);
            if (modeRef.current !== 'stopwatch') {
                const remaining = phaseDuration(phaseRef.current, modeRef.current, configRef.current);
                remainingRef.current = remaining;
                setSecondsRemaining(remaining);
            }
        } else if (modeRef.current !== 'stopwatch' && remainingRef.current <= 0) {
            const remaining = phaseDuration(phaseRef.current, modeRef.current, configRef.current);
            remainingRef.current = remaining;
            setSecondsRemaining(remaining);
        }
        if (modeRef.current === 'stopwatch') {
            elapsedBaseRef.current = elapsedRef.current;
            elapsedStartedAtRef.current = Date.now();
        } else {
            deadlineRef.current = Date.now() + (remainingRef.current * 1000) / TIME_SPEED_MULTIPLIER;
            if (modeRef.current !== 'pomodoro' || phaseRef.current === 'work' || configRef.current.countBreakTime) {
                elapsedBaseRef.current = elapsedRef.current;
                elapsedStartedAtRef.current = Date.now();
            }
        }
        statusRef.current = 'running';
        setStatus('running');
    }, []);

    const reset = useCallback(() => {
        deadlineRef.current = null;
        elapsedStartedAtRef.current = null;
        elapsedBaseRef.current = 0;
        completedRef.current = 0;
        elapsedRef.current = 0;
        phaseRef.current = 'work';
        statusRef.current = 'idle';
        const remaining = phaseDuration('work', modeRef.current, configRef.current);
        remainingRef.current = remaining;
        setStatus('idle');
        setSecondsElapsed(0);
        setCompletedSessions(0);
        setPhase('work');
        setSecondsRemaining(remaining);
    }, []);

    const setMode = useCallback((nextMode: TimerMode) => {
        deadlineRef.current = null;
        elapsedStartedAtRef.current = null;
        elapsedBaseRef.current = 0;
        completedRef.current = 0;
        elapsedRef.current = 0;
        modeRef.current = nextMode;
        phaseRef.current = 'work';
        statusRef.current = 'idle';
        const remaining = nextMode === 'stopwatch' ? 0 : phaseDuration('work', nextMode, configRef.current);
        remainingRef.current = remaining;
        setModeState(nextMode);
        setStatus('idle');
        setPhase('work');
        setSecondsElapsed(0);
        setCompletedSessions(0);
        setSecondsRemaining(remaining);
    }, []);

    const advancePomodoro = useCallback((fromPhase: TimerPhase) => {
        const { phase: nextPhase, completedSessions: nextCompleted } = nextPomodoro(
            fromPhase,
            completedRef.current,
            configRef.current.sessionsUntilLongBreak,
        );
        const nextDuration = phaseDuration(nextPhase, 'pomodoro', configRef.current);
        completedRef.current = nextCompleted;
        phaseRef.current = nextPhase;
        remainingRef.current = nextDuration;
        setCompletedSessions(nextCompleted);
        setPhase(nextPhase);
        setSecondsRemaining(nextDuration);

        if (shouldAutoStart(nextPhase, configRef.current)) {
            deadlineRef.current = Date.now() + (nextDuration * 1000) / TIME_SPEED_MULTIPLIER;
            if (nextPhase === 'work' || configRef.current.countBreakTime) {
                elapsedBaseRef.current = elapsedRef.current;
                elapsedStartedAtRef.current = Date.now();
            } else {
                elapsedStartedAtRef.current = null;
            }
            statusRef.current = 'running';
            setStatus('running');
        } else {
            deadlineRef.current = null;
            elapsedStartedAtRef.current = null;
            statusRef.current = 'paused';
            setStatus('paused');
        }
    }, []);

    const skip = useCallback(() => {
        if (modeRef.current !== 'pomodoro') return;
        snapshotElapsed();
        deadlineRef.current = null;
        elapsedStartedAtRef.current = null;
        const skippedPhase = phaseRef.current;
        onCompleteRef.current?.(skippedPhase);
        advancePomodoro(skippedPhase);
    }, [advancePomodoro]);

    useEffect(() => {
        if (status !== 'running') return;

        const timerId = window.setInterval(() => {
            const currentMode = modeRef.current;
            const currentPhase = phaseRef.current;
            const currentConfig = configRef.current;

            if (currentMode === 'stopwatch') {
                const startedAt = elapsedStartedAtRef.current;
                if (startedAt === null) return;
                const elapsed = elapsedBaseRef.current + Math.floor(((Date.now() - startedAt) * TIME_SPEED_MULTIPLIER) / 1000);
                elapsedRef.current = elapsed;
                setSecondsElapsed(elapsed);
                return;
            }

            const countsElapsed = currentMode !== 'pomodoro' || currentPhase === 'work' || currentConfig.countBreakTime;
            if (countsElapsed && elapsedStartedAtRef.current !== null) {
                const elapsed = elapsedBaseRef.current + Math.floor(((Date.now() - elapsedStartedAtRef.current) * TIME_SPEED_MULTIPLIER) / 1000);
                elapsedRef.current = elapsed;
                setSecondsElapsed(elapsed);
            }

            const deadline = deadlineRef.current;
            if (deadline === null) return;
            const remaining = Math.max(0, Math.ceil(((deadline - Date.now()) * TIME_SPEED_MULTIPLIER) / 1000));
            remainingRef.current = remaining;
            setSecondsRemaining(remaining);
            if (remaining > 0) return;

            deadlineRef.current = null;
            if (elapsedStartedAtRef.current !== null) {
                elapsedBaseRef.current = elapsedRef.current;
                elapsedStartedAtRef.current = null;
            }
            const finishedPhase = currentMode === 'pomodoro' ? currentPhase : 'work';
            onCompleteRef.current?.(finishedPhase);

            if (currentMode === 'pomodoro') {
                advancePomodoro(currentPhase);
            } else {
                statusRef.current = 'paused';
                setStatus('paused');
            }
        }, 100);

        return () => window.clearInterval(timerId);
    }, [status, advancePomodoro]);

    const isRunning = status === 'running';
    const displayedSecondsRemaining = status === 'idle'
        ? phaseDuration(phase, mode, config)
        : secondsRemaining;
    const totalSeconds = mode === 'stopwatch' ? secondsElapsed : displayedSecondsRemaining;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
        mode,
        phase,
        status,
        isRunning,
        secondsRemaining: displayedSecondsRemaining,
        secondsElapsed,
        completedSessions,
        totalSeconds,
        formattedTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        workMinutes: config.workMinutes,
        shortBreakMinutes: config.shortBreakMinutes,
        longBreakMinutes: config.longBreakMinutes,
        countdownMinutes: config.countdownMinutes,
        sessionsUntilLongBreak: config.sessionsUntilLongBreak,
        autoStartBreaks: config.autoStartBreaks,
        autoStartWork: config.autoStartWork,
        countBreakTime: config.countBreakTime,
        start,
        pause,
        toggle: isRunning ? pause : start,
        reset,
        skip,
        setMode,
        setWorkMinutes: (minutesValue: number) => {
            const clamped = clampMinutes(minutesValue);
            setInternal((current) => {
                const next = { ...current, workMinutes: clamped };
                persistTimerConfig(next);
                return next;
            });
            if (statusRef.current === 'idle' && modeRef.current === 'pomodoro' && phaseRef.current === 'work') {
                remainingRef.current = clamped * 60;
                setSecondsRemaining(clamped * 60);
            }
        },
        setShortBreakMinutes: (minutesValue: number) => {
            const clamped = clampMinutes(minutesValue);
            setInternal((current) => {
                const next = { ...current, shortBreakMinutes: clamped };
                persistTimerConfig(next);
                return next;
            });
            if (statusRef.current === 'idle' && modeRef.current === 'pomodoro' && phaseRef.current === 'short-break') {
                remainingRef.current = clamped * 60;
                setSecondsRemaining(clamped * 60);
            }
        },
        setLongBreakMinutes: (minutesValue: number) => {
            const clamped = clampMinutes(minutesValue);
            setInternal((current) => {
                const next = { ...current, longBreakMinutes: clamped };
                persistTimerConfig(next);
                return next;
            });
            if (statusRef.current === 'idle' && modeRef.current === 'pomodoro' && phaseRef.current === 'long-break') {
                remainingRef.current = clamped * 60;
                setSecondsRemaining(clamped * 60);
            }
        },
        setCountdownMinutes: (minutesValue: number) => {
            const clamped = clampMinutes(minutesValue);
            setInternal((current) => {
                const next = { ...current, countdownMinutes: clamped };
                persistTimerConfig(next);
                return next;
            });
            if (statusRef.current === 'idle' && modeRef.current === 'countdown') {
                remainingRef.current = clamped * 60;
                setSecondsRemaining(clamped * 60);
            }
        },
        setSessionsUntilLongBreak: (value: number) => {
            setInternal((current) => {
                const next = { ...current, sessionsUntilLongBreak: clampMinutes(value) };
                persistTimerConfig(next);
                return next;
            });
        },
        setAutoStartBreaks: (value: boolean) => {
            setInternal((current) => {
                const next = { ...current, autoStartBreaks: value };
                persistTimerConfig(next);
                return next;
            });
        },
        setAutoStartWork: (value: boolean) => {
            setInternal((current) => {
                const next = { ...current, autoStartWork: value };
                persistTimerConfig(next);
                return next;
            });
        },
        setCountBreakTime: (value: boolean) => {
            setInternal((current) => {
                const next = { ...current, countBreakTime: value };
                persistTimerConfig(next);
                return next;
            });
        },
    };
}
