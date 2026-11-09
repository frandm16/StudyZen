import { useState, useEffect, useRef, useCallback } from 'react';
import {
    X,
    Play,
    Pause,
    RotateCcw,
    SkipForward,
    Volume2,
    VolumeX,
    Maximize2,
    Minimize2,
    Clock,
    Timer,
} from 'lucide-react';
import { useTimerContext } from '../../context/TimerContext';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useFlipSound } from '../../hooks/useFlipSound';
import { FlipClockRenderer } from './FlipClockRenderer';

interface FullscreenClockProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FullscreenClock({ isOpen, onClose }: FullscreenClockProps) {
    const timer = useTimerContext();
    const containerRef = useRef<HTMLDivElement>(null);

    const [clockMode, setClockMode] = useState<'timer' | 'realtime'>('timer');
    const [showSeconds, setShowSeconds] = useState<boolean>(() => {
        try {
            return localStorage.getItem('studyzen_clock_seconds') === 'true';
        } catch {
            return false;
        }
    });
    const [is24Hour, setIs24Hour] = useState<boolean>(() => {
        try {
            return localStorage.getItem('studyzen_clock_24h') !== 'false';
        } catch {
            return true;
        }
    });

    const [controlsVisible, setControlsVisible] = useState(true);
    const [actionFeedback, setActionFeedback] = useState<'play' | 'pause' | null>(null);

    const hideTimeoutRef = useRef<number | null>(null);
    const feedbackTimeoutRef = useRef<number | null>(null);

    const { playFlip, isMuted, toggleMute } = useFlipSound();
    useWakeLock(isOpen);
    const { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen } = useFullscreen();

    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        if (!isOpen) return;
        const interval = window.setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => window.clearInterval(interval);
    }, [isOpen]);

    const showControlsTemporarily = useCallback(() => {
        setControlsVisible(true);
        if (hideTimeoutRef.current) {
            window.clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = window.setTimeout(() => {
            setControlsVisible(false);
        }, 2800);
    }, []);

    const triggerFeedback = useCallback((type: 'play' | 'pause') => {
        setActionFeedback(type);
        if (feedbackTimeoutRef.current) {
            window.clearTimeout(feedbackTimeoutRef.current);
        }
        feedbackTimeoutRef.current = window.setTimeout(() => {
            setActionFeedback(null);
        }, 750);
    }, []);

    const handleToggleTimer = useCallback(() => {
        if (!timer) return;
        if (timer.status === 'running') {
            timer.pause();
            triggerFeedback('pause');
        } else {
            timer.start();
            triggerFeedback('play');
        }
        showControlsTemporarily();
    }, [timer, triggerFeedback, showControlsTemporarily]);

    useEffect(() => {
        if (!isOpen) return;
        const container = containerRef.current;
        if (container && !document.fullscreenElement) {
            void enterFullscreen(container);
        }
        showControlsTemporarily();
    }, [isOpen, enterFullscreen, showControlsTemporarily]);

    const handleToggleSeconds = () => {
        setShowSeconds((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('studyzen_clock_seconds', String(next));
            } catch {
            }
            return next;
        });
        showControlsTemporarily();
    };

    const handleToggle24Hour = () => {
        setIs24Hour((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('studyzen_clock_24h', String(next));
            } catch {
            }
            return next;
        });
        showControlsTemporarily();
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Escape') {
                if (isFullscreen) {
                    void exitFullscreen();
                }
                onClose();
            } else if (e.code === 'Space') {
                e.preventDefault();
                if (clockMode === 'timer') {
                    handleToggleTimer();
                }
            } else if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                void toggleFullscreen(containerRef.current ?? undefined);
            } else if (e.key.toLowerCase() === 'm') {
                e.preventDefault();
                toggleMute();
                showControlsTemporarily();
            } else if (e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleToggleSeconds();
            } else if (e.key.toLowerCase() === 'c') {
                e.preventDefault();
                setClockMode((m) => (m === 'timer' ? 'realtime' : 'timer'));
                showControlsTemporarily();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        isOpen,
        isFullscreen,
        exitFullscreen,
        toggleFullscreen,
        onClose,
        clockMode,
        handleToggleTimer,
        toggleMute,
        handleToggleSeconds,
        showControlsTemporarily,
    ]);

    const handleClose = () => {
        if (isFullscreen) {
            void exitFullscreen();
        }
        onClose();
    };

    if (!isOpen || !timer) return null;

    const totalSeconds =
        timer.mode === 'stopwatch'
            ? timer.secondsElapsed
            : timer.secondsRemaining;

    const timerHours = Math.floor(totalSeconds / 3600);
    const timerMinutes = Math.floor((totalSeconds % 3600) / 60);
    const timerSecs = totalSeconds % 60;

    const displayTimerHours = timerHours > 0 ? String(timerHours).padStart(2, '0') : undefined;
    const displayTimerMinutes = String(timerMinutes).padStart(2, '0');
    const displayTimerSeconds = String(timerSecs).padStart(2, '0');

    const realHoursRaw = currentTime.getHours();
    const realMinutes = String(currentTime.getMinutes()).padStart(2, '0');
    const realSeconds = String(currentTime.getSeconds()).padStart(2, '0');

    let displayRealHours = String(realHoursRaw).padStart(2, '0');
    let displayAmpm: 'AM' | 'PM' | null = null;

    if (!is24Hour) {
        displayAmpm = realHoursRaw >= 12 ? 'PM' : 'AM';
        const h12 = realHoursRaw % 12 || 12;
        displayRealHours = String(h12).padStart(2, '0');
    }

    const isTimerRunning = timer.status === 'running';

    const phaseTitle =
        timer.mode === 'pomodoro'
            ? timer.phase === 'work'
                ? 'Focus Session'
                : timer.phase === 'short-break'
                  ? 'Short Break'
                  : 'Long Break'
            : timer.mode === 'stopwatch'
              ? 'Stopwatch'
              : 'Countdown';

    const controlButtonClass =
        'flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-white/10 bg-[#121214]/80 text-neutral-300 backdrop-blur-xl shadow-lg transition-all hover:bg-neutral-800 hover:text-white active:scale-95';

    return (
        <div
            ref={containerRef}
            onPointerMove={showControlsTemporarily}
            onTouchStart={showControlsTemporarily}
            onClick={() => {
                if (clockMode === 'timer') {
                    handleToggleTimer();
                } else {
                    showControlsTemporarily();
                }
            }}
            className={`fixed inset-0 z-50 select-none overflow-hidden bg-black text-neutral-100 transition-colors duration-500 ${
                controlsVisible ? '' : 'cursor-none'
            }`}
        >
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/[0.04] pointer-events-none" />

            <header
                onClick={(e) => e.stopPropagation()}
                className={`absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3 sm:p-6 lg:p-8 transition-opacity duration-300 ${
                    controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                style={{
                    paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
                    paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
                    paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
                }}
            >
                <div className="flex items-center gap-2">
                    <div
                        role="tablist"
                        className="flex items-center p-1 rounded-xl border border-white/10 bg-[#121214]/80 backdrop-blur-xl"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={clockMode === 'timer'}
                            onClick={() => {
                                setClockMode('timer');
                                showControlsTemporarily();
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                clockMode === 'timer'
                                    ? 'bg-white/15 text-white shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                        >
                            <Timer size={14} />
                            <span>Timer</span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={clockMode === 'realtime'}
                            onClick={() => {
                                setClockMode('realtime');
                                showControlsTemporarily();
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                clockMode === 'realtime'
                                    ? 'bg-white/15 text-white shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                        >
                            <Clock size={14} />
                            <span>Clock</span>
                        </button>
                    </div>

                    {clockMode === 'realtime' && (
                        <button
                            type="button"
                            onClick={handleToggle24Hour}
                            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-white/10 bg-[#121214]/80 text-neutral-300 hover:bg-neutral-800 text-xs font-bold uppercase transition-colors backdrop-blur-md"
                            title="Toggle 12/24 hour display"
                        >
                            {is24Hour ? '24H' : '12H'}
                        </button>
                    )}
                </div>

                {clockMode === 'timer' && (
                    <div className="hidden md:flex items-center gap-2">
                        <span
                            className={`inline-block h-2 w-2 rounded-full ${
                                isTimerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                            }`}
                        />
                        <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">
                            {phaseTitle}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        type="button"
                        onClick={handleToggleSeconds}
                        title={`Seconds: ${showSeconds ? 'Visible' : 'Hidden'} (S)`}
                        aria-label="Toggle Seconds"
                        className={`${controlButtonClass} text-xs font-bold font-mono tracking-tighter`}
                    >
                        {showSeconds ? 'SEC' : 'MIN'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            toggleMute();
                            showControlsTemporarily();
                        }}
                        title={`Flip Sound: ${isMuted ? 'Muted' : 'Sound On'} (M)`}
                        aria-label="Toggle Flip Sound"
                        className={controlButtonClass}
                    >
                        {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            void toggleFullscreen(containerRef.current ?? undefined);
                            showControlsTemporarily();
                        }}
                        title="Toggle Browser Fullscreen (F)"
                        aria-label="Toggle Browser Fullscreen"
                        className={controlButtonClass}
                    >
                        {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        title="Exit Fullscreen Clock (Esc)"
                        aria-label="Exit Fullscreen Clock"
                        className={controlButtonClass}
                    >
                        <X size={17} />
                    </button>
                </div>
            </header>

            <main className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto relative flex flex-col items-center">
                    {clockMode === 'timer' && (
                        <div
                            className={`md:hidden absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 transition-opacity duration-300 ${
                                controlsVisible ? 'opacity-80' : 'opacity-0'
                            }`}
                        >
                            <span
                                className={`inline-block h-1.5 w-1.5 rounded-full ${
                                    isTimerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                                }`}
                            />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 whitespace-nowrap">
                                {phaseTitle}
                            </span>
                        </div>
                    )}

                    {clockMode === 'timer' ? (
                        <FlipClockRenderer
                            hours={displayTimerHours}
                            minutes={displayTimerMinutes}
                            seconds={displayTimerSeconds}
                            showSeconds={showSeconds}
                            onFlip={playFlip}
                        />
                    ) : (
                        <FlipClockRenderer
                            hours={displayRealHours}
                            minutes={realMinutes}
                            seconds={realSeconds}
                            showSeconds={showSeconds}
                            ampm={displayAmpm}
                            onFlip={playFlip}
                        />
                    )}
                </div>
            </main>

            {actionFeedback && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none transition-transform duration-300 scale-105">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-2xl shadow-2xl border border-white/20 bg-black/90 text-white">
                        {actionFeedback === 'play' ? (
                            <>
                                <Play size={22} className="fill-current text-emerald-400" />
                                <span className="text-sm font-bold tracking-wider uppercase">Running</span>
                            </>
                        ) : (
                            <>
                                <Pause size={22} className="fill-current text-amber-400" />
                                <span className="text-sm font-bold tracking-wider uppercase">Paused</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <footer
                onClick={(e) => e.stopPropagation()}
                className={`absolute bottom-0 inset-x-0 z-30 flex flex-col items-center p-3 sm:p-6 lg:p-8 transition-opacity duration-300 ${
                    controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                style={{
                    paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
                }}
            >
                {clockMode === 'timer' && (
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                timer.reset();
                                showControlsTemporarily();
                            }}
                            disabled={timer.status === 'idle'}
                            title="Reset Timer"
                            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#121214]/80 text-neutral-300 backdrop-blur-xl transition-all hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <RotateCcw size={16} />
                        </button>

                        <button
                            type="button"
                            onClick={handleToggleTimer}
                            title={isTimerRunning ? 'Pause (Space)' : 'Start (Space)'}
                            className={`flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xl active:scale-95 ${
                                isTimerRunning
                                    ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                                    : 'bg-[var(--accent-color,#2563eb)] text-white hover:opacity-90'
                            }`}
                        >
                            {isTimerRunning ? (
                                <>
                                    <Pause size={16} className="fill-current" />
                                    <span>Pause</span>
                                </>
                            ) : (
                                <>
                                    <Play size={16} className="fill-current" />
                                    <span>{timer.status === 'paused' ? 'Resume' : 'Start'}</span>
                                </>
                            )}
                        </button>

                        {timer.mode === 'pomodoro' && (
                            <button
                                type="button"
                                onClick={() => {
                                    timer.skip();
                                    showControlsTemporarily();
                                }}
                                disabled={timer.status === 'idle'}
                                title="Skip Phase"
                                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#121214]/80 text-neutral-300 backdrop-blur-xl transition-all hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <SkipForward size={16} />
                            </button>
                        )}
                    </div>
                )}
            </footer>
        </div>
    );
}
