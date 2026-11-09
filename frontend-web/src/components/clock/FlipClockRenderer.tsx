import { type CSSProperties, useMemo } from 'react';
import { FlipCard } from './FlipCard';

export interface FlipClockRendererProps {
    hours?: string;
    minutes: string;
    seconds?: string;
    showSeconds?: boolean;
    ampm?: 'AM' | 'PM' | null;
    onFlip?: () => void;
}

function computeCardStyle(cardCount: number): CSSProperties {
    if (cardCount <= 2) {
        return {
            width: 'min(43vw, 58vh)',
            height: 'calc(min(43vw, 58vh) * 1.2)',
            fontSize: 'calc(min(43vw, 58vh) * 0.64)',
            borderRadius: 'clamp(1rem, min(3vw, 4vh), 3.25rem)',
        };
    }
    return {
        width: 'min(29vw, 40vh)',
        height: 'calc(min(29vw, 40vh) * 1.2)',
        fontSize: 'calc(min(29vw, 40vh) * 0.64)',
        borderRadius: 'clamp(0.75rem, min(2vw, 3vh), 2.25rem)',
    };
}

export function FlipClockRenderer({
    hours,
    minutes,
    seconds,
    showSeconds = true,
    ampm = null,
    onFlip,
}: FlipClockRendererProps) {
    const cardCount = (hours !== undefined ? 1 : 0) + 1 + (showSeconds && seconds !== undefined ? 1 : 0);
    const cardStyle = useMemo(() => computeCardStyle(cardCount), [cardCount]);

    const gapStyle: CSSProperties = {
        gap: cardCount <= 2 ? 'clamp(0.5rem, min(2vw, 2.5vh), 2.5rem)' : 'clamp(0.375rem, min(1.2vw, 1.8vh), 1.5rem)',
    };

    return (
        <div className="relative flex items-center justify-center select-none">
            <div className="flex items-center justify-center" style={gapStyle}>
                {hours !== undefined && (
                    <FlipCard value={hours} cardStyle={cardStyle} onFlip={onFlip} />
                )}

                <FlipCard value={minutes} cardStyle={cardStyle} onFlip={onFlip} />

                {showSeconds && seconds !== undefined && (
                    <FlipCard value={seconds} cardStyle={cardStyle} onFlip={onFlip} />
                )}
            </div>

            {ampm && (
                <div className="absolute -top-7 right-1 sm:-top-11 sm:right-4">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-md sm:rounded-lg border border-neutral-800 bg-[#141416] text-neutral-300 shadow-xl text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                        {ampm}
                    </span>
                </div>
            )}
        </div>
    );
}
