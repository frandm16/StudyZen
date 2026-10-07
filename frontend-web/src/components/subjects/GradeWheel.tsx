import { formatGrade } from './helpers';

interface GradeWheelProps {
    score: number | null | undefined;
    size?: number;
    strokeWidth?: number;
    showLabel?: boolean;
    subLabel?: string;
}

export function GradeWheel({
    score,
    size = 54,
    strokeWidth = 5,
    showLabel = true,
    subLabel,
}: GradeWheelProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const hasGrade = score !== null && score !== undefined && !isNaN(score);
    const clampedScore = hasGrade ? Math.max(0, Math.min(100, score)) : 0;
    const strokeDashoffset = hasGrade
        ? circumference - (clampedScore / 100) * circumference
        : circumference;

    const getColor = (val: number) => {
        if (val >= 90) return '#10b981';
        if (val >= 70) return '#3b82f6';
        if (val >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const strokeColor = hasGrade ? getColor(clampedScore) : 'var(--app-border)';

    return (
        <div className="relative flex flex-col items-center justify-center shrink-0">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-[var(--app-border)] opacity-40"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-0.5">
                {hasGrade ? (
                    <span className="text-[11px] font-black tracking-tight text-[var(--app-text)] truncate max-w-full text-center">
                        {formatGrade(clampedScore)}
                    </span>
                ) : (
                    <span className="text-[10px] font-bold text-[var(--app-text-muted)]">
                        —
                    </span>
                )}
                {subLabel && (
                    <span className="text-[8px] font-semibold text-[var(--app-text-muted)] -mt-0.5">
                        {subLabel}
                    </span>
                )}
            </div>
            {showLabel && (
                <span className="text-[9px] font-medium text-[var(--app-text-muted)] mt-1">
                    /100
                </span>
            )}
        </div>
    );
}
