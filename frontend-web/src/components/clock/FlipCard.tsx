import { type CSSProperties, useEffect, useRef, useState } from 'react';

export interface FlipCardProps {
    value: string;
    cardStyle?: CSSProperties;
    onFlip?: () => void;
}

interface FlipState {
    prev: string;
    next: string;
    id: number;
}

export function FlipCard({ value, cardStyle, onFlip }: FlipCardProps) {
    const [currentValue, setCurrentValue] = useState(value);
    const [flipState, setFlipState] = useState<FlipState | null>(null);
    const flipTimeoutRef = useRef<number | null>(null);
    const onFlipRef = useRef(onFlip);

    useEffect(() => {
        onFlipRef.current = onFlip;
    }, [onFlip]);

    useEffect(() => {
        if (value === currentValue) return;

        if (flipTimeoutRef.current) {
            window.clearTimeout(flipTimeoutRef.current);
        }

        const prev = currentValue;
        const next = value;
        const id = Date.now() + Math.random();

        setFlipState({ prev, next, id });
        onFlipRef.current?.();

        flipTimeoutRef.current = window.setTimeout(() => {
            setCurrentValue(next);
            setFlipState(null);
            flipTimeoutRef.current = null;
        }, 460);

        return () => {
            if (flipTimeoutRef.current) {
                window.clearTimeout(flipTimeoutRef.current);
            }
        };
    }, [value, currentValue]);

    const isFlipping = flipState !== null;
    const staticTopValue = isFlipping ? flipState.next : currentValue;
    const staticBottomValue = isFlipping ? flipState.prev : currentValue;

    return (
        <div
            className="relative select-none font-sans font-black tracking-[-0.04em] overflow-hidden bg-[#18181a] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_10px_30px_rgba(0,0,0,0.8)]"
            style={{ perspective: '1400px', ...cardStyle }}
        >
            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[inherit]">
                <div className="relative h-1/2 w-full overflow-hidden bg-gradient-to-b from-[#222226] via-[#1d1d20] to-[#18181a] text-[#bebec2]">
                    <span className="absolute inset-x-0 top-0 flex h-[200%] items-center justify-center leading-none tabular-nums whitespace-nowrap">
                        {staticTopValue}
                    </span>
                    {isFlipping && (
                        <div
                            key={`static-top-shadow-${flipState.id}`}
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.85))',
                                animation: 'studyzenStaticTopShadow 220ms ease-out forwards',
                            }}
                        />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black/35 pointer-events-none" />
                </div>

                <div className="relative h-1/2 w-full overflow-hidden bg-gradient-to-b from-[#18181a] via-[#141416] to-[#0f0f11] text-[#b5b5b9]">
                    <span className="absolute inset-x-0 bottom-0 flex h-[200%] items-center justify-center leading-none tabular-nums whitespace-nowrap">
                        {staticBottomValue}
                    </span>
                    {isFlipping && (
                        <div
                            key={`static-bot-shadow-${flipState.id}`}
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to top, transparent 20%, rgba(0,0,0,0.85))',
                                animation: 'studyzenStaticBottomShadow 220ms ease-in forwards',
                            }}
                        />
                    )}
                    <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />
                </div>
            </div>

            {isFlipping && (
                <>
                    <div
                        key={`flip-top-${flipState.id}`}
                        className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-[inherit] z-20 bg-gradient-to-b from-[#222226] via-[#1d1d20] to-[#18181a] text-[#bebec2]"
                        style={{
                            transformOrigin: 'bottom center',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            animation: 'studyzenFlipTop 220ms cubic-bezier(0.4, 0.0, 1, 1) forwards',
                        }}
                    >
                        <span className="absolute inset-x-0 top-0 flex h-[200%] items-center justify-center leading-none tabular-nums whitespace-nowrap">
                            {flipState.prev}
                        </span>
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to bottom, transparent 10%, rgba(0,0,0,0.9))',
                                animation: 'studyzenShadowIn 220ms cubic-bezier(0.4, 0.0, 1, 1) forwards',
                            }}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black/35 pointer-events-none" />
                    </div>

                    <div
                        key={`flip-bottom-${flipState.id}`}
                        className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-[inherit] z-20 bg-gradient-to-b from-[#18181a] via-[#141416] to-[#0f0f11] text-[#b5b5b9]"
                        style={{
                            transformOrigin: 'top center',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateX(90deg)',
                            animation: 'studyzenFlipBottom 240ms cubic-bezier(0.18, 0.89, 0.32, 1.15) 200ms forwards',
                        }}
                    >
                        <span className="absolute inset-x-0 bottom-0 flex h-[200%] items-center justify-center leading-none tabular-nums whitespace-nowrap">
                            {flipState.next}
                        </span>
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to top, transparent 10%, rgba(0,0,0,0.9))',
                                animation: 'studyzenShadowOut 240ms cubic-bezier(0.18, 0.89, 0.32, 1) 200ms forwards',
                            }}
                        />
                        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />
                    </div>
                </>
            )}

            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] z-25 bg-[#09090b] shadow-[0_1px_3px_rgba(0,0,0,0.95)] pointer-events-none" />

            <style>{`
                @keyframes studyzenFlipTop {
                    0% { transform: rotateX(0deg); opacity: 1; }
                    99% { transform: rotateX(-90deg); opacity: 1; }
                    100% { transform: rotateX(-90deg); opacity: 0; }
                }
                @keyframes studyzenFlipBottom {
                    0% { transform: rotateX(90deg); opacity: 1; }
                    100% { transform: rotateX(0deg); opacity: 1; }
                }
                @keyframes studyzenShadowIn {
                    0% { opacity: 0; }
                    100% { opacity: 0.9; }
                }
                @keyframes studyzenShadowOut {
                    0% { opacity: 0.9; }
                    100% { opacity: 0; }
                }
                @keyframes studyzenStaticTopShadow {
                    0% { opacity: 0.6; }
                    100% { opacity: 0; }
                }
                @keyframes studyzenStaticBottomShadow {
                    0% { opacity: 0; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
