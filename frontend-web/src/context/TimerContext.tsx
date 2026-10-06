import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { useTimer, type TimerOptions, type TimerPhase, type TimerMode, type TimerStatus } from '../hooks/useTimer';
import { useSound } from '../hooks/useSound';

export interface TimerContextType {
    mode: TimerMode;
    phase: TimerPhase;
    status: TimerStatus;
    isRunning: boolean;
    secondsRemaining: number;
    secondsElapsed: number;
    completedSessions: number;
    totalSeconds: number;
    formattedTime: string;
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    countdownMinutes: number;
    sessionsUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    countBreakTime: boolean;
    start: () => void;
    pause: () => void;
    toggle: () => void;
    reset: () => void;
    skip: () => void;
    setMode: (mode: TimerMode) => void;
    setWorkMinutes: (minutes: number) => void;
    setShortBreakMinutes: (minutes: number) => void;
    setLongBreakMinutes: (minutes: number) => void;
    setCountdownMinutes: (minutes: number) => void;
    setSessionsUntilLongBreak: (count: number) => void;
    setAutoStartBreaks: (autoStart: boolean) => void;
    setAutoStartWork: (autoStart: boolean) => void;
    setCountBreakTime: (countBreak: boolean) => void;

    selectedTaskId: number | null;
    setSelectedTaskId: (id: number | null) => void;
    selectedTagId: number | null;
    setSelectedTagId: (id: number | null) => void;

    sound: ReturnType<typeof useSound>;
}

const TimerContext = createContext<TimerContextType | null>(null);

interface TimerProviderProps {
    children: ReactNode;
    options?: TimerOptions;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children, options }) => {
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

    const sound = useSound();

    const handlePhaseComplete = (phase: TimerPhase) => {
        sound.playAlarm();
        options?.onComplete?.(phase);
    };

    const timer = useTimer({
        ...options,
        onComplete: handlePhaseComplete,
    });

    return (
        <TimerContext.Provider
            value={{
                ...timer,
                selectedTaskId,
                setSelectedTaskId,
                selectedTagId,
                setSelectedTagId,
                sound,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
};

export const useTimerContext = (): TimerContextType => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimerContext must be inside <TimerProvider>');
    }
    return context;
};