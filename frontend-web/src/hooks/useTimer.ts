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
    const [internal, setInternal] = useState<TimerConfig>(DEFAULT_CONFIG);
    const config = resolveConfig(options, internal);
    const onCompleteRef = useRef(options.onComplete);

    const [mode, setModeState] = useState<TimerMode>('pomodoro');
    const [phase, setPhase] = useState<TimerPhase>('work');
    const [status, setStatus] = useState<TimerStatus>('idle');
    const [secondsRemaining, setSecondsRemaining] = useState(() => DEFAULT_CONFIG.workMinutes * 60);
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

    const snapshotElapsed = () => {
        if (elapsedStartedAtRef.current === null) return;
        const elapsed = elapsedBaseRef.current + Math.floor((Date.now() - elapsedStartedAtRef.current) / 1000);
        elapsedBaseRef.current = elapsed;
        elapsedRef.current = elapsed;
        setSecondsElapsed(elapsed);
        elapsedStartedAtRef.current = null;
    };

    const snapshotDeadline = () => {
        if (deadlineRef.current === null) return;
        const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
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
            deadlineRef.current = Date.now() + remainingRef.current * 1000;
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
            deadlineRef.current = Date.now() + nextDuration * 1000;
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
        advancePomodoro(phaseRef.current);
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
                const elapsed = elapsedBaseRef.current + Math.floor((Date.now() - startedAt) / 1000);
                elapsedRef.current = elapsed;
                setSecondsElapsed(elapsed);
                return;
            }

            const countsElapsed = currentMode !== 'pomodoro' || currentPhase === 'work' || currentConfig.countBreakTime;
            if (countsElapsed && elapsedStartedAtRef.current !== null) {
                const elapsed = elapsedBaseRef.current + Math.floor((Date.now() - elapsedStartedAtRef.current) / 1000);
                elapsedRef.current = elapsed;
                setSecondsElapsed(elapsed);
            }

            const deadline = deadlineRef.current;
            if (deadline === null) return;
            const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
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
        }, 200);

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
        start,
        pause,
        toggle: isRunning ? pause : start,
        reset,
        skip,
        setMode,
        setWorkMinutes: (minutesValue: number) => {
            setInternal((current) => ({ ...current, workMinutes: clampMinutes(minutesValue) }));
        },
        setShortBreakMinutes: (minutesValue: number) => {
            setInternal((current) => ({ ...current, shortBreakMinutes: clampMinutes(minutesValue) }));
        },
        setLongBreakMinutes: (minutesValue: number) => {
            setInternal((current) => ({ ...current, longBreakMinutes: clampMinutes(minutesValue) }));
        },
        setCountdownMinutes: (minutesValue: number) => {
            setInternal((current) => ({ ...current, countdownMinutes: clampMinutes(minutesValue) }));
        },
        setSessionsUntilLongBreak: (value: number) => {
            setInternal((current) => ({ ...current, sessionsUntilLongBreak: clampMinutes(value) }));
        },
    };
}
