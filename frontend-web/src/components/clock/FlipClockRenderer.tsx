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
            width: 'min(45vw, calc(74vh * 0.92))',
            height: 'min(76vh, calc(45vw * 1.12))',
            fontSize: 'min(58vh, 31vw)',
            borderRadius: 'clamp(1.5rem, 3.8vw, 4.25rem)',
        };
    }
    return {
        width: 'min(30vw, calc(65vh * 0.88))',
        height: 'min(68vh, calc(30vw * 1.12))',
        fontSize: 'min(48vh, 19vw)',
        borderRadius: 'clamp(1rem, 2.5vw, 3rem)',
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
        gap: cardCount <= 2 ? 'clamp(0.75rem, 2vw, 2.5rem)' : 'clamp(0.5rem, 1.2vw, 1.5rem)',
    };

    return (
        <div className="relative flex items-center justify-center select-none w-full">
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
                <div className="absolute -top-8 right-2 sm:-top-12 sm:right-6">
                    <span className="inline-flex items-center justify-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg border border-neutral-800 bg-[#141416] text-neutral-300 shadow-xl text-xs sm:text-sm font-bold tracking-widest uppercase">
                        {ampm}
                    </span>
                </div>
            )}
        </div>
    );
}
